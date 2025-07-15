import { Component, EventEmitter, Input, Output, ElementRef, AfterViewInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Photo } from '../../core/interfaces/interfaces.models';

@Component({
  selector: 'app-photo-gallery',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './photo-gallery.component.html',
  styleUrls: ['./photo-gallery.component.scss']
})
export class PhotoGalleryComponent implements AfterViewInit, OnDestroy, OnChanges {
  @Input() photos: Photo[] = [];
  @Input() canEdit = false;
@Input() size: 'sm' | 'lg' = 'lg';

  @Output() photoClick = new EventEmitter<Photo>();
  @Output() deletePhoto = new EventEmitter<Photo>();

  private observer?: IntersectionObserver;

  constructor(private el: ElementRef) {}

  ngAfterViewInit() {
    this.observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const src = img.getAttribute('data-src');
          if (src) {
            img.setAttribute('src', src);
            img.removeAttribute('data-src');
            this.observer?.unobserve(img);
          }
        }
      });
    });
    this.observeImages();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['photos'] && !changes['photos'].firstChange) {
      setTimeout(() => this.observeImages());
    }
  }

  observeImages() {
    if (!this.observer) return;
    this.el.nativeElement.querySelectorAll('img[data-src]').forEach((img: HTMLImageElement) => {
      this.observer?.observe(img);
    });
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  onClick(photo: Photo) {
    this.photoClick.emit(photo);
  }

  onDelete(photo: Photo, e: Event) {
    e.stopPropagation();
    this.deletePhoto.emit(photo);
  }
}
