import { Component, OnInit, signal, computed } from '@angular/core';
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
  photoCount = signal(0);

  viewerPhotos = computed(() => {
    const mainPhotos = this.photos();
    const selectedPhoto = this.selected();

    if (selectedPhoto && mainPhotos.findIndex(p => p.id === selectedPhoto.id) === -1) {
      // This is our temporary photo, add it to the start of the list for the viewer
      return [selectedPhoto, ...mainPhotos];
    }
    // Otherwise, just use the main photo list
    return mainPhotos;
  });

  constructor(
    private photoService: PhotoService,
    private userContext: UserContextService
  ) {}

  async ngOnInit() {
    await this.photoService.revalidate(false, 'desc');
    this.photos.set(this.photoService.getAll());
  }

  open(photo: Photo) {
    this.selected.set(photo);
  }

  close() {
    this.selected.set(null);
  }

  async onDelete(photo: Photo) {
    const confirmed = confirm('Êtes-vous sûr de vouloir supprimer cette photo ? Elle disparaîtra pour de bon !');
    if (!confirmed) return;

    const success = await this.photoService.deletePhoto(photo, this.userContext.userName());
    if (success) {
      // No need to revalidate here, the service already does it.
      // We just need to update the local signal.
      this.photos.set(this.photoService.getAll());
    }
    this.selected.set(null);
  }

  getSelectedIndex(): number {
    const current = this.selected();
    if (!current) return 0;

    const photosForViewer = this.viewerPhotos();
    const index = photosForViewer.findIndex(p => p.id === current.id);

    return index === -1 ? 0 : index;
  }

  canEdit(photo: Photo): boolean {
    return photo.user_name === this.userContext.userName();
  }

  async onPhotoUploaded() {
    // No need to revalidate here, the service already does it.
    // We just need to update the local signal.
    this.photos.set(this.photoService.getAll());
  }
  onCountChange(count: number) {
    this.photoCount.set(count);
  }
}
