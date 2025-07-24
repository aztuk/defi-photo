import { Component, OnDestroy, OnInit, signal, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Photo } from '../../../../core/interfaces/interfaces.models';
import { RankingComponent } from '../../../../components/ranking/ranking.component';
import { ProjectionService } from '../../services/projection.service';
import { ProjectionStatusComponent } from '../projection-status/projection-status.component';

@Component({
  selector: 'app-projection-screen',
  standalone: true,
  imports: [CommonModule, RankingComponent, ProjectionStatusComponent],
  templateUrl: './projection-screen.component.html',
  styleUrls: ['./projection-screen.component.scss']
})
export class ProjectionScreenComponent implements OnInit, OnDestroy {
  private projectionService = inject(ProjectionService);

  photos = this.projectionService.photos;
  classement = this.projectionService.classement;
  totalPhotos = this.projectionService.totalPhotos;

  private seenPhotos = new Set<string>();
  readonly currentPhoto = signal<Photo | null>(null);
  readonly fade = signal(false);
  private intervalId?: number;
  private nextPhotoUrl: string | null = null;

  constructor() {
    effect(() => {
      const currentPhotos = this.photos();
      if (currentPhotos.length > 0 && !this.currentPhoto()) {
        this.nextPhoto();
      }
    });
  }

  ngOnInit() {
    this.nextPhoto();
    this.intervalId = window.setInterval(() => this.nextPhoto(), 8000);
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private getNextPhoto(): Photo | null {
   if (this.photos().length === 0) {
     return null;
   }

   const unseenPhotos = this.photos().filter(p => !this.seenPhotos.has(p.id));

   if (unseenPhotos.length > 0) {
     return unseenPhotos[Math.floor(Math.random() * unseenPhotos.length)];
   } else {
     this.seenPhotos.clear();
     return this.photos()[Math.floor(Math.random() * this.photos().length)];
   }
 }

 private preloadImage(url: string): void {
   if (url) {
     const img = new Image();
     img.src = url;
   }
 }

 private nextPhoto() {
   const photoToShow = this.getNextPhoto();

   if (!photoToShow) {
     this.currentPhoto.set(null);
     return;
   }

   this.fade.set(true);

   setTimeout(() => {
     this.currentPhoto.set(photoToShow);
     this.seenPhotos.add(photoToShow.id);
     this.fade.set(false);

     // Preload the *next* photo
     const nextPhotoCandidate = this.getNextPhoto();
     if (nextPhotoCandidate) {
       this.preloadImage(nextPhotoCandidate.url);
     }
   }, 500); // Corresponds to the fade-out transition time
 }
}
