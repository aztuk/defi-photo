import {
  Component,
  Input,
  Output,
  EventEmitter,
  AfterViewInit,
  ElementRef,
  ViewChild,
  inject,
  OnInit,
  QueryList,
  ViewChildren,
  OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Photo } from '../../core/interfaces/interfaces.models';
import { UserContextService } from '../../core/context/user-context.service';
import { computed, signal, effect } from '@angular/core';

@Component({
  selector: 'app-photo-viewer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './photo-viewer.component.html',
  styleUrls: ['./photo-viewer.component.scss']
})

export class PhotoViewerComponent implements AfterViewInit, OnInit, OnDestroy {
  @Input() photos: Photo[] = [];
  @Input() index = 0;

  @Output() close = new EventEmitter<void>();
  @Output() delete = new EventEmitter<Photo>();

  @ViewChild('scroller') scrollerRef!: ElementRef<HTMLDivElement>;
  @ViewChildren('videoElement') videoElements!: QueryList<ElementRef<HTMLVideoElement>>;

  private user = inject(UserContextService);
  readonly currentIndex = signal(0);
  readonly currentPhoto = computed(() => this.photos[this.currentIndex()]);
  readonly canEdit = computed(() => {
    const photo = this.currentPhoto();
    if (!photo) return false;
    return photo.user_name === this.user.userName();
  });

  // UI state
  readonly showControls = signal(false);
  readonly isPlaying = signal(false);
  private hideControlsTimeout?: any;

  constructor() {
    // Auto-hide controls after 5 seconds
    effect(() => {
      if (this.showControls()) {
        this.resetHideControlsTimer();
      }
    });
  }

  ngOnInit(): void {
    this.currentIndex.set(this.index);
  }

  ngOnDestroy(): void {
    if (this.hideControlsTimeout) {
      clearTimeout(this.hideControlsTimeout);
    }
  }

  private resetHideControlsTimer(): void {
    if (this.hideControlsTimeout) {
      clearTimeout(this.hideControlsTimeout);
    }
    this.hideControlsTimeout = setTimeout(() => {
      this.showControls.set(false);
    }, 5000);
  }

  onMediaClick(): void {
    this.showControls.set(!this.showControls());
  }

  onTogglePlayPause(): void {
    const currentPhoto = this.currentPhoto();
    if (!currentPhoto || currentPhoto.media_type !== 'video') return;

    const videoElement = this.getCurrentVideoElement();
    if (!videoElement) return;

    if (videoElement.paused) {
      videoElement.play();
      this.isPlaying.set(true);
    } else {
      videoElement.pause();
      this.isPlaying.set(false);
    }
  }

  private getCurrentVideoElement(): HTMLVideoElement | null {
    const currentIdx = this.currentIndex();
    const videoElements = this.videoElements.toArray();

    // Find the video element for the current slide
    let videoIndex = 0;
    for (let i = 0; i <= currentIdx; i++) {
      if (this.photos[i]?.media_type === 'video') {
        if (i === currentIdx) {
          return videoElements[videoIndex]?.nativeElement || null;
        }
        videoIndex++;
      }
    }
    return null;
  }

  private autoplayCurrentVideo(): void {
    const currentPhoto = this.currentPhoto();
    if (!currentPhoto || currentPhoto.media_type !== 'video') return;

    setTimeout(() => {
      const videoElement = this.getCurrentVideoElement();
      if (videoElement) {
        videoElement.currentTime = 0;
        videoElement.play().then(() => {
          this.isPlaying.set(true);
        }).catch(error => {
          console.log('Autoplay prevented:', error);
          this.isPlaying.set(false);
        });
      }
    }, 100);
  }

  private pauseAllVideos(): void {
    this.videoElements.forEach(videoRef => {
      const video = videoRef.nativeElement;
      if (!video.paused) {
        video.pause();
      }
    });
    this.isPlaying.set(false);
  }

  onDelete() {
    const photo = this.currentPhoto();
    if (photo) {
      this.delete.emit(photo);
    }
  }

  async onDownload() {
    const photo = this.currentPhoto();
    if (!photo) return;

    try {
      const response = await fetch(photo.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      const extension = photo.media_type === 'video' ? 'mp4' : 'jpg';
      const filename = photo.media_type === 'video' ? 'video' : 'photo';
      a.download = `${filename}.${extension}`;
      a.click();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('[PhotoViewer] Erreur téléchargement :', error);
      const mediaType = photo.media_type === 'video' ? 'vidéo' : 'photo';
      alert(`Impossible de télécharger cette ${mediaType}.`);
    }
  }

  ngAfterViewInit(): void {
    const el = this.scrollerRef?.nativeElement;
    if (el) {
      el.addEventListener('scroll', () => {
        const i = Math.round(el.scrollLeft / el.offsetWidth);
        const previousIndex = this.currentIndex();

        if (i !== previousIndex) {
          this.pauseAllVideos();
          this.currentIndex.set(i);
          this.autoplayCurrentVideo();
        }
      });

      setTimeout(() => {
        el.scrollTo({ left: this.index * el.offsetWidth, behavior: 'instant' as ScrollBehavior });
        this.autoplayCurrentVideo();
      }, 100);
    }
  }
}
