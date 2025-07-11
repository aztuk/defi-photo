import {
  Component,
  Input,
  Output,
  EventEmitter,
  AfterViewInit,
  ElementRef,
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Photo } from '../../core/interfaces/interfaces.models';

@Component({
  selector: 'app-photo-viewer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './photo-viewer.component.html',
  styleUrls: ['./photo-viewer.component.scss']
})
export class PhotoViewerComponent implements AfterViewInit {
  @Input() photos: Photo[] = [];
  @Input() index = 0;
  @Input() canEdit = false;

  @Output() close = new EventEmitter<void>();
  @Output() delete = new EventEmitter<Photo>();
  @Output() download = new EventEmitter<Photo>();

  @ViewChild('scroller') scrollerRef!: ElementRef<HTMLDivElement>;

  get currentPhoto(): Photo {
    const i = this.currentIndex();
    return this.photos[i];
  }

  currentIndex(): number {
    const el = this.scrollerRef?.nativeElement;
    if (!el) return this.index;
    const scrollLeft = el.scrollLeft;
    const width = el.offsetWidth;
    return Math.round(scrollLeft / width);
  }

  onDelete() {
    this.delete.emit(this.currentPhoto);
  }

  onDownload() {
    this.download.emit(this.currentPhoto);
  }

  ngAfterViewInit(): void {
    const el = this.scrollerRef?.nativeElement;
    if (el) {
      setTimeout(() => {
        el.scrollTo({ left: this.index * el.offsetWidth, behavior: 'instant' as ScrollBehavior });
      }, 0);
    }
  }
}
