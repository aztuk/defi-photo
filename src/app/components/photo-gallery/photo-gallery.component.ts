import { Component, EventEmitter, Input, Output, inject, effect, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Photo } from '../../core/interfaces/interfaces.models';
import { PhotoService, UploadPreview } from '../../core/services/photo.service';
import { UserContextService } from '../../core/context/user-context.service';

@Component({
  selector: 'app-photo-gallery',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './photo-gallery.component.html',
  styleUrls: ['./photo-gallery.component.scss']
})
export class PhotoGalleryComponent implements OnChanges {
  @Input() photos: Photo[] = [];
  @Input() canEdit = false;
  @Input() size: 'sm' | 'lg' = 'lg';

  temporaryPhotos;

  @Output() photoClick = new EventEmitter<Photo>();
  @Output() deletePhoto = new EventEmitter<Photo>();
  @Output() countChange = new EventEmitter<number>();

  private user = inject(UserContextService);

  constructor(private photoService: PhotoService) {
    this.temporaryPhotos = this.photoService.temporaryPhotos;
    effect(() => {
      this.emitCount();
    });
  }

  onClick(photo: Photo | UploadPreview) {
    // Check if it's a temporary upload preview
    if ('file' in photo) {
      if (photo.status === 'success') {
        const realPhoto = this.photos.find(p => p.url === photo.publicUrl);
        if (realPhoto) {
          this.photoClick.emit(realPhoto);
          // The temporary photo will be cleared by the ngOnChanges logic
        } else if (photo.publicUrl) {
          // If the real photo is not in the list yet, create a temporary one for the viewer
          const tempPhoto: Photo = {
            id: photo.id, // Use temporary id from UploadPreview
            url: photo.publicUrl,
            user_name: this.user.userName() || '', // Get current user's name
            mission_id: null,
            planet_id: null,
            status: 'published',
            created_at: new Date().toISOString(),
            media_type: photo.file.type.startsWith('video/') ? 'video' : 'photo',
          };
          this.photoClick.emit(tempPhoto);
        }
      }
      // For 'uploading' or 'error' status, do nothing.
    } else {
      // It's a real Photo object
      this.photoClick.emit(photo);
    }
  }

  onDelete(photo: Photo, e: Event) {
    e.stopPropagation();
    this.deletePhoto.emit(photo);
  }
  emitCount() {
    const count = (this.photos?.length || 0) + (this.temporaryPhotos()?.length || 0);
    this.countChange.emit(count);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['photos']) {
      this.emitCount();
      // The main photos array has been updated from the parent.
      // We can now check if any of our "success" temporary photos are redundant and clear them.
      const realPhotoUrls = new Set(this.photos.map(p => p.url));
      const temporarySuccessPhotos = this.temporaryPhotos().filter(p => p.status === 'success');

      for (const tempPhoto of temporarySuccessPhotos) {
        if (tempPhoto.publicUrl && realPhotoUrls.has(tempPhoto.publicUrl)) {
          this.photoService.clearTemporaryPhoto(tempPhoto.id);
        }
      }
    }
  }
}
