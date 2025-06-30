// features/my-planet/mission-card/mission-card.component.ts
import { Component, inject, Input, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MissionProgress, SwipeCarouselItem } from '../../../core/interfaces/interfaces.models';
import { SwipeCarouselComponent } from '../../../components/swipe-carousel/swipe-carousel.component';
import { PhotoService } from '../../../core/services/photo.service';
import { UserContextService } from '../../../core/context/user-context.service';
import { PlanetContextService } from '../../../core/context/planet-context.service';

@Component({
  selector: 'app-mission-card',
  standalone: true,
  imports: [CommonModule, SwipeCarouselComponent],
  templateUrl: './mission-card.component.html',
  styleUrl: './mission-card.component.scss',
})
export class MissionCardComponent implements OnInit {
  @ViewChild(SwipeCarouselComponent) carouselRef?: SwipeCarouselComponent;

  @Input({ required: true }) mission!: MissionProgress;
  @Input({ required: true }) nb!: number;

  readonly carouselItems = signal<SwipeCarouselItem[]>([]);

  private photoService = inject(PhotoService);
  private context = inject(PlanetContextService);
  private user = inject(UserContextService);

  constructor() {}

  async ngOnInit() {
    const planet = this.context.currentPlanet();
    if (!planet || !this.mission) return;

    await this.photoService.revalidate();
    this.refreshMissionState();
  }

  isValidated(): boolean {
    return this.mission?.validated ?? false;
  }

  onPhotoClick(photo: SwipeCarouselItem) {
    if (!photo || !photo.imageUrl || photo.isAddButton) return;
    // TODO: open preview modal
  }

  async onPhotoUploaded(file: File) {
    if (this.context.readonly()) return;

    const planet = this.context.currentPlanet();
    if (!planet) return;

    await this.photoService.upload(
      file,
      this.mission.id,
      planet.id,
      this.user.userName()!
    );

    await this.photoService.revalidate(true, 'asc');
    this.refreshMissionState();

    const count = this.photoService.getByMissionAndPlanet(this.mission.id, planet.id).length;
    this.carouselRef?.scrollTo(this.context.readonly() ? count - 1 : count);
  }

  async onPhotoDelete(photoId: string) {
    if (this.context.readonly()) return;

    const confirmed = confirm('Souhaitez-vous vraiment supprimer cette photo ?');
    if (!confirmed) return;

    const success = await this.photoService.deletePhoto(photoId);
    if (!success) {
      alert('Erreur lors de la suppression.');
      return;
    }

    await this.photoService.revalidate(true);
    this.refreshMissionState();
  }

  private refreshMissionState() {
    const planet = this.context.currentPlanet();
    if (!planet) return;

    const photos = this.photoService.getByMissionAndPlanet(this.mission.id, planet.id);
    const count = photos.length;

    const items: SwipeCarouselItem[] = photos.map(p => ({
      id: p.id,
      imageUrl: p.url,
      isAddButton: false,
      deletable: !this.context.readonly()
    }));

    if (!this.context.readonly()) {
      items.push({
        id: 'add-button',
        imageUrl: '',
        isAddButton: true,
        deletable: false
      });
    }

    this.carouselItems.set(items);

    // ✅ Mise à jour mission
    this.mission.photos_published = count;
    this.mission.validated = count > 0;
  }
}
