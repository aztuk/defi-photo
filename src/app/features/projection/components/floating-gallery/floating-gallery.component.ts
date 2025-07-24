import { Component, ElementRef, Input, OnDestroy, ViewChild, OnChanges, SimpleChanges, AfterViewInit } from '@angular/core';
import * as PIXI from 'pixi.js';
import { Photo } from '../../../../core/interfaces/interfaces.models';
import { BlurFilter } from 'pixi.js';
import { DEFAULT_GALLERY_CONFIG, GalleryConfig } from './floating-gallery.config';

interface ParallaxContainer extends PIXI.Container {
  layerIndex: number;
  photoId: string;
}

interface Particle extends PIXI.Graphics {
  speed: number;
}

@Component({
  selector: 'app-floating-gallery',
  templateUrl: './floating-gallery.component.html',
  styleUrls: ['./floating-gallery.component.scss'],
  standalone: true,
})
export class FloatingGalleryComponent implements AfterViewInit, OnDestroy, OnChanges {
  @ViewChild('pixiContainer', { static: true }) pixiContainer!: ElementRef;
  @Input() photos: Photo[] = [];
  @Input() config: GalleryConfig = DEFAULT_GALLERY_CONFIG;

  private app!: PIXI.Application;
  private availablePhotos: Photo[] = [];
  private sprites: ParallaxContainer[] = [];
  private particles: Particle[] = [];
  private lastSpawnCheck = 0;
  private xDistributionSlots: number[] = [];
  private nextSlot = 0;

  constructor() {}

  async ngAfterViewInit(): Promise<void> {
    await this.initPixi();
    this.initParticles();
    this.initXDistribution();
    this.app.ticker.add((ticker) => this.animate(ticker));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['photos']) {
      this.availablePhotos = [...this.photos];
    }
  }

  ngOnDestroy(): void {
    if (this.app) {
      this.app.destroy(true, { children: true, texture: true });
    }
  }

  private async initPixi(): Promise<void> {
    this.app = new PIXI.Application();
    await this.app.init({
      width: this.pixiContainer.nativeElement.offsetWidth,
      height: this.pixiContainer.nativeElement.offsetHeight,
      backgroundColor: 0x0a0a1a,
      resizeTo: this.pixiContainer.nativeElement,
    });
    this.pixiContainer.nativeElement.appendChild(this.app.canvas);
    this.app.stage.sortableChildren = true;
  }

  private initParticles(): void {
    const screenWidth = this.app.screen.width;
    const screenHeight = this.app.screen.height;

    for (let i = 0; i < this.config.particles.count; i++) {
      const particle = new PIXI.Graphics() as Particle;
      const size = Math.random() * (this.config.particles.maxSize - this.config.particles.minSize) + this.config.particles.minSize;
      particle.circle(0, 0, size / 2);
      particle.fill(0xffffff);
      particle.x = Math.random() * screenWidth;
      particle.y = Math.random() * screenHeight;
      particle.alpha = Math.random() * 0.5 + 0.1;
      particle.speed = Math.random() * (this.config.particles.maxSpeed - this.config.particles.minSpeed) + this.config.particles.minSpeed;
      particle.zIndex = 0; // Behind everything
      this.particles.push(particle);
      this.app.stage.addChild(particle);
    }
  }

  private getPhotoToDisplay(): Photo | null {
    const displayedPhotoIds = this.sprites.map(s => s.photoId);
    const potentialPhotos = this.availablePhotos.filter(p => !displayedPhotoIds.includes(p.id));
    if (potentialPhotos.length === 0) {
      return this.availablePhotos.length > 0 ? this.availablePhotos[Math.floor(Math.random() * this.availablePhotos.length)] : null;
    }
    return potentialPhotos[Math.floor(Math.random() * potentialPhotos.length)];
  }

  private maintainPopulation(): void {
    const spritesPerLayer = this.config.layers.map(() => 0);
    this.sprites.forEach(s => spritesPerLayer[s.layerIndex]++);

    this.config.layers.forEach((layerConfig, layerIndex) => {
      if (spritesPerLayer[layerIndex] < layerConfig.minSprites) {
        this.spawnNewSprite(layerIndex);
      }
    });
  }

  private initXDistribution(): void {
    if (this.app.screen.width === 0) {
      // Wait for the canvas to have a size
      setTimeout(() => this.initXDistribution(), 50);
      return;
    }

    const screenWidth = this.app.screen.width;
    const slotCount = 5; // Number of vertical lanes for photos
    const slotWidth = screenWidth / slotCount;
    this.xDistributionSlots = [];
    for (let i = 0; i < slotCount; i++) {
      this.xDistributionSlots.push(slotWidth * i + slotWidth / 2);
    }
    this.shuffleArray(this.xDistributionSlots);
  }

  private shuffleArray(array: any[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  private async spawnNewSprite(layerIndex: number): Promise<void> {
    const spritesOnLayer = this.sprites.filter(s => s.layerIndex === layerIndex).length;
    if (spritesOnLayer >= this.config.layers[layerIndex].maxSprites) {
      return;
    }

    if (this.availablePhotos.length === 0) return;
    const photo = this.getPhotoToDisplay();
    if (!photo) return;

    const layerConfig = this.config.layers[layerIndex];

    try {
      const texture = await PIXI.Assets.load(photo.url);

      const container = new PIXI.Container() as ParallaxContainer;
      container.layerIndex = layerIndex;
      container.photoId = photo.id;

      // Shadow
      const shadowSprite = new PIXI.Sprite(texture);
      shadowSprite.anchor.set(0.5);
      shadowSprite.tint = 0x000000;
      shadowSprite.alpha = 0.6;
      shadowSprite.x = 4;
      shadowSprite.y = 4;
      const shadowBlur = new BlurFilter(3);
      shadowSprite.filters = [shadowBlur];
      container.addChild(shadowSprite);

      // White border
      const border = new PIXI.Graphics();
      const borderWidth = this.config.borderWidth;
      border.rect(-texture.width / 2 - borderWidth, -texture.height / 2 - borderWidth, texture.width + (borderWidth * 2), texture.height + (borderWidth * 2));
      border.fill(0xffffff);
      container.addChild(border);

      // Main sprite
      const sprite = new PIXI.Sprite(texture);
      sprite.anchor.set(0.5);
      container.addChild(sprite);

      // Normalize size first
      const maxScreenDim = Math.max(this.app.screen.width, this.app.screen.height);
      const targetSize = maxScreenDim * this.config.maxPhotoSizePercent;
      const imageMaxDim = Math.max(texture.width, texture.height);
      const baseScale = targetSize / imageMaxDim;
      const finalScale = baseScale * layerConfig.scale;
      container.scale.set(finalScale);

      const screenWidth = this.app.screen.width;
      const screenHeight = this.app.screen.height;

      // Distribute photos in slots to avoid clustering
      if (this.xDistributionSlots.length > 0) {
        const slotX = this.xDistributionSlots[this.nextSlot];
        const slotWidth = screenWidth / this.xDistributionSlots.length;
        // Add a random jitter within the slot to make it look natural
        const randomOffset = (Math.random() - 0.5) * slotWidth * 0.8;
        container.x = slotX + randomOffset;

        // Clamp position to be within screen bounds
        const halfWidth = container.width / 2;
        container.x = Math.max(halfWidth, Math.min(screenWidth - halfWidth, container.x));

        this.nextSlot = (this.nextSlot + 1) % this.xDistributionSlots.length;
      } else {
        // Fallback to original random positioning if slots are not initialized
        container.x = Math.random() * (screenWidth - container.width) + container.width / 2;
      }
      container.y = screenHeight + container.height / 2;

      container.zIndex = layerConfig.zIndex;
      const blurFilter = new BlurFilter();
      blurFilter.strength = layerConfig.blur;
      container.filters = [blurFilter];

      this.sprites.push(container);
      this.app.stage.addChild(container);
    } catch (error) {
      console.error(`Failed to load texture for photo: ${photo.url}`, error);
    }
  }

  private animate(ticker: PIXI.Ticker): void {
    if (!this.app) return;

    // Animate particles
    const screenHeight = this.app.screen.height;
    this.particles.forEach(particle => {
      particle.y -= particle.speed * ticker.deltaTime;
      if (particle.y < -particle.height) {
        particle.y = screenHeight + particle.height;
      }
    });

    // Animate photos
    if (ticker.lastTime - this.lastSpawnCheck > this.config.spawnInterval) {
      this.maintainPopulation();
      this.lastSpawnCheck = ticker.lastTime;
    }

    for (let i = this.sprites.length - 1; i >= 0; i--) {
      const container = this.sprites[i];
      const layerConfig = this.config.layers[container.layerIndex];

      container.y -= layerConfig.speed * ticker.deltaTime;

      if (container.y < -container.height / 2) {
        this.app.stage.removeChild(container);
        this.sprites.splice(i, 1);
        container.destroy({ children: true });
      }
    }
  }
}
