import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Photo } from '../../core/interfaces/interfaces.models';

@Component({
  selector: 'app-photo-gallery',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './photo-gallery.component.html',
  styleUrls: ['./photo-gallery.component.scss']
})
export class PhotoGalleryComponent {
  @Input() photos: Photo[] = [];
  @Input() canEdit = false;

  @Output() photoClick = new EventEmitter<Photo>();
  @Output() deletePhoto = new EventEmitter<Photo>();

  onClick(photo: Photo) {
    this.photoClick.emit(photo);
  }

  onDelete(photo: Photo, e: Event) {
    e.stopPropagation();
    this.deletePhoto.emit(photo);
  }
}
