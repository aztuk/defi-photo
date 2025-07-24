import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PhotoService } from '../../core/services/photo.service';
import { MissionService } from '../../core/services/mission.service';
import { Photo } from '../../core/interfaces/interfaces.models';
import { RankingComponent } from '../../components/ranking/ranking.component';

@Component({
  selector: 'app-projection-screen',
  standalone: true,
  imports: [CommonModule, RankingComponent],
  template: `
    <div class="container">
      <div class="photo-count" *ngIf="photos().length > 0">{{ photos().length }} photos</div>
      <img *ngIf="currentPhoto()" [src]="currentPhoto()?.url" [class.fade]="fade()" class="photo" />
      <div class="ranking">
        <app-ranking />
      </div>
      <div class="progress-bar">
        <div class="progress" ></div>
      </div>
    </div>
  `,
  styles: [`
    .container {
      position: fixed;
      inset: 0;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    img {
      position: fixed;
      max-width: 100%;
      max-height: 100vh;
      object-fit: contain;
      transition: opacity 0.5s ease-in-out;
    }
    img.fade {
      opacity: 0;
    }

    .photo{
      animation: pan-zoom 20s infinite alternate;
    }
    .ranking {
      position: absolute;
      top: 0px;
      right: 0px;
      color: white;
      padding: 20px 0;
      border-radius: 10px;
    }
    .photo-count {
      position: absolute;
      top: 20px;
      left: 20px;
      color: white;
      font-size: 2em;
      font-weight: bold;
      z-index: 50;
      text-shadow: 0 0 5px rgba(0,0,0,0.5);
    }
    .progress-bar {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 5px;
      background: rgba(255, 255, 255, 0.2);
    }
    .progress {
      position:relative;
      z-index: 30;
      width: 0%;
      height: 5px;
      background: white;
      animation: progress 8s linear infinite;
    }
    @keyframes pan-zoom {
      0% {
        transform: scale(1) translate(0, 0);
      }
      100% {
        transform: scale(1.2) translate(10px, 10px);
      }
    }
    @keyframes progress {
      0% {
        width: 0%;
      }
      100% {
        width: 100%;
      }
    }
  `]
})
export class ProjectionScreenComponent implements OnInit, OnDestroy {
  photos = signal<Photo[]>([]);
  private seenPhotos = new Set<string>();
  readonly currentPhoto = signal<Photo | null>(null);
  readonly fade = signal(false);
  private intervalId?: number;

  constructor(
    private photoService: PhotoService,
    private missionService: MissionService
  ) {}

  async ngOnInit() {
    await this.photoService.revalidate();
    this.photos.set(this.photoService.getAll());
    this.nextPhoto();
    this.intervalId = window.setInterval(() => this.nextPhoto(), 8000);
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private nextPhoto() {
    this.fade.set(true);
    setTimeout(() => {
      const unseenPhotos = this.photos().filter(p => !this.seenPhotos.has(p.id));
      if (unseenPhotos.length > 0) {
        const photo = unseenPhotos[Math.floor(Math.random() * unseenPhotos.length)];
        this.currentPhoto.set(photo);
        this.seenPhotos.add(photo.id);
      } else {
        // Reset seen photos if all have been seen
        this.seenPhotos.clear();
        const photo = this.photos()[Math.floor(Math.random() * this.photos().length)];
        this.currentPhoto.set(photo);
        if (photo) {
          this.seenPhotos.add(photo.id);
        }
      }
      this.fade.set(false);
    }, 500);
  }
}
