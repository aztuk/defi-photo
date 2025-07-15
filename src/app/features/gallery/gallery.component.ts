import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PhotoService } from '../../core/services/photo.service';
import { Photo } from '../../core/interfaces/interfaces.models';
import { PhotoGalleryComponent } from '../../components/photo-gallery/photo-gallery.component';
import { PhotoViewerComponent } from '../../components/photo-viewer/photo-viewer.component';
import { UserContextService } from '../../core/context/user-context.service';
import { PhotoUploadComponent } from '../../components/photo-upload/photo-upload.component';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule, PhotoGalleryComponent, PhotoViewerComponent, PhotoUploadComponent],
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss']
})
export class GalleryComponent implements OnInit {
  photos = signal<Photo[]>([]);
  selected = signal<Photo | null>(null);

  constructor(
    private photoService: PhotoService,
    private userContext: UserContextService
  ) {}

  async ngOnInit() {
    await this.photoService.revalidate(true, 'desc');
    this.photos.set(this.photoService.getAll());
  }

  open(photo: Photo) {
    this.selected.set(photo);
  }

  close() {
    this.selected.set(null);
  }

  async onDelete(photo: Photo) {
    const confirmed = confirm('Supprimer cette photo ?');
    if (!confirmed) return;

    const success = await this.photoService.deletePhoto(photo, this.userContext.userName());
    if (success) {
      await this.photoService.revalidate(true, 'desc');
      this.photos.set(this.photoService.getAll());
    }
    this.selected.set(null);
  }

  getSelectedIndex(): number {
    const current = this.selected();
    return current ? this.photos().findIndex(p => p.id === current.id) : 0;
  }

  canEdit(photo: Photo): boolean {
    return photo.user_name === this.userContext.userName();
  }

  async onPhotoUploaded() {
    await this.photoService.revalidate(true, 'desc');
    this.photos.set(this.photoService.getAll());
  }
}
