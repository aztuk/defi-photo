import { Component, Input, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MissionProgress, SwipeCarouselItem } from '../../../core/interfaces/interfaces.models';
import { PhotoUploadComponent } from '../../../components/photo-upload/photo-upload.component';
import { SwipeCarouselComponent } from '../../../components/swipe-carousel/swipe-carousel.component';
import { PhotoService } from '../../../core/services/photo.service';
import { UserContextService } from '../../../core/context/user-context.service';

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

  constructor(
    private photoService: PhotoService,
    private user: UserContextService
  ) {}

  async ngOnInit() {
    await this.photoService.revalidate(); // assure que les données sont fraîches

    const planet = this.user.planet();
    if (!planet) return;

    const photos = this.photoService
      .getByMissionAndPlanet(this.mission.id, planet.id);

    const items: SwipeCarouselItem[] = photos.map(p => ({
      id: p.id,
      imageUrl: p.url,
      isAddButton: false
    }));

    // Ajoute le bouton "Ajouter une photo" à la fin
    items.push({
      id: 'add-button',
      imageUrl: '', // ou une string vide
      isAddButton: true
    });

    this.carouselItems.set(items);
  }

  onPhotoClick(photo: SwipeCarouselItem) {
    // TODO: Afficher en plein écran
    console.log('Photo sélectionnée :', photo);
  }

  isValidated(): boolean {
    return this.mission.validated;
  }

  async onPhotoUploaded() {
    const planet = this.user.planet();
    if (!planet) return;

    await this.photoService.revalidate(true, 'asc');


    const photos = this.photoService.getByMissionAndPlanet(this.mission.id, planet.id);
    const items: SwipeCarouselItem[] = photos.map(p => ({
      id: p.id,
      imageUrl: p.url,
      isAddButton: false
    }));

    // Réajoute le bouton "Ajouter"
    items.push({
      id: 'add-button',
      imageUrl: '',
      isAddButton: true
    });

    this.carouselItems.set(items);

    // Met à jour la mission comme validée
    if (!this.mission.validated && photos.length > 0) {
      this.mission.validated = true;
      this.mission.photos_published = photos.length;
      // ⚠️ Ajouter ici feedback UI si besoin
    }

     this.carouselRef?.scrollTo(items.length - 2);
  }

}
