import {
  Component,
  Input,
  Output,
  EventEmitter,
  AfterViewInit,
  ElementRef,
  ViewChild,
  inject,
  OnInit
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

export class PhotoViewerComponent implements AfterViewInit, OnInit {
  @Input() photos: Photo[] = [];
  @Input() index = 0;

  @Output() close = new EventEmitter<void>();
  @Output() delete = new EventEmitter<Photo>();

  @ViewChild('scroller') scrollerRef!: ElementRef<HTMLDivElement>;

  private user = inject(UserContextService);
  readonly currentIndex = signal(0);
  readonly currentPhoto = computed(() => this.photos[this.currentIndex()]);
  readonly canEdit = computed(() => {
    const photo = this.currentPhoto();
    if (!photo) return false;
    return photo.user_name === this.user.userName();
  });

  constructor() {
  }

  ngOnInit(): void {
    this.currentIndex.set(this.index);
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
      a.download = 'photo.jpg';
      a.click();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('[PhotoViewer] Erreur téléchargement :', error);
      alert('Impossible de télécharger cette photo.');
    }
  }

  ngAfterViewInit(): void {
    const el = this.scrollerRef?.nativeElement;
    if (el) {
      el.addEventListener('scroll', () => {
        const i = Math.round(el.scrollLeft / el.offsetWidth);
        this.currentIndex.set(i);
      });

      setTimeout(() => {
        el.scrollTo({ left: this.index * el.offsetWidth, behavior: 'instant' as ScrollBehavior });
      }, 0);
    }
  }
}
