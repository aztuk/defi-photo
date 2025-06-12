import {
  Component, Input, Output, EventEmitter,
  signal, ViewChild, ElementRef, AfterViewInit
} from '@angular/core';
import { SwipeCarouselItem } from '../../core/interfaces/interfaces.models';
import { CommonModule } from '@angular/common';
import { PhotoUploadComponent } from "../photo-upload/photo-upload.component";

@Component({
  selector: 'app-swipe-carousel',
  standalone: true,
  imports: [CommonModule, PhotoUploadComponent],
  templateUrl: './swipe-carousel.component.html',
  styleUrls: ['./swipe-carousel.component.scss']
})
export class SwipeCarouselComponent implements AfterViewInit {
  @Input({ required: true }) items: SwipeCarouselItem[] = [];
  @Input() selectedIndex = 0;
  @Input() missionId!: string;

  @ViewChild('track') containerRef?: ElementRef<HTMLElement>;
  @ViewChild('wrapper') wrapperRef?: ElementRef<HTMLElement>;


  @Output() itemSelected = new EventEmitter<SwipeCarouselItem>();
  @Output() selectAdd = new EventEmitter<void>();
  @Output() photoUploaded  = new EventEmitter<void>();


  currentIndex = signal(0);

  itemWidth = 0;
  private container?: HTMLElement;
  private startX = 0;
  private deltaX = 0;
  private dragging = false;

  ngAfterViewInit() {
    this.container = this.containerRef?.nativeElement ?? undefined;

    const wrapper = this.wrapperRef?.nativeElement;
    this.itemWidth = wrapper?.offsetWidth || 300;

    if (wrapper) {
      wrapper.addEventListener('pointerdown', this.onPointerDown.bind(this));
      wrapper.addEventListener('pointermove', this.onPointerMove.bind(this), { passive: false });
      wrapper.addEventListener('pointerup', this.onPointerUp.bind(this));
    }

    setTimeout(() => this.scrollTo(this.selectedIndex), 0);
  }

scrollTo(index: number) {
  if (!this.container) return;

  const clamped = Math.max(0, Math.min(index, this.items.length - 1));
  this.currentIndex.set(clamped);

  const offset = -clamped * this.itemWidth;
  this.container.style.transition = 'transform 0.3s ease';
  this.container.style.transform = `translateX(${offset}px)`;
}


  prev() {
    this.scrollTo(Math.max(0, this.currentIndex() - 1));
  }

  next() {
    this.scrollTo(Math.min(this.items.length - 1, this.currentIndex() + 1));
  }

  onItemClick(index: number) {
    const item = this.items[index];
    if (item.isAddButton) {
      this.selectAdd.emit();
    } else if (index === this.currentIndex()) {
      this.itemSelected.emit(item);
    } else {
      this.scrollTo(index);
    }
  }

  onPointerDown(event: PointerEvent) {
    this.startX = event.clientX;
    this.deltaX = 0;
    this.dragging = true;
    this.container?.setPointerCapture(event.pointerId);
  }

onPointerMove(event: PointerEvent) {
  if (!this.dragging || !this.container) return;

  this.deltaX = event.clientX - this.startX;

  if (Math.abs(this.deltaX) > 10) {
    event.preventDefault();
  }

  // Applique le déplacement visuel temporaire pendant le drag
  const offset = -this.currentIndex() * this.itemWidth + this.deltaX;
  this.container.style.transition = 'none';
  this.container.style.transform = `translateX(${offset}px)`;
}

onPointerUp(event: PointerEvent) {
  if (!this.dragging || !this.container) return;
  this.dragging = false;

  const threshold = this.itemWidth / 3;
  const current = this.currentIndex();

  if (this.deltaX > threshold) {
    this.scrollTo(current - 1);
  } else if (this.deltaX < -threshold) {
    this.scrollTo(current + 1);
  } else {
    this.scrollTo(current); // revient à la position initiale
  }

  this.deltaX = 0;
  this.container?.releasePointerCapture(event.pointerId);
}

  onPhotoUploaded() {
    this.photoUploaded.emit();
  }
}
