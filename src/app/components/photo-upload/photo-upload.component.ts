import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PhotoService } from '../../core/services/photo.service';
import { UserContextService } from '../../core/context/user-context.service';

@Component({
  selector: 'app-photo-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './photo-upload.component.html',
  styleUrls: ['./photo-upload.component.scss']
})
export class PhotoUploadComponent {
  @Input() missionId: string | null = null;
  @Output() photoUploaded = new EventEmitter<File>();
  @ViewChild('fileInput') fileInputRef?: ElementRef<HTMLInputElement>;


  uploading = false;

  constructor(
    private photoService: PhotoService,
    private user: UserContextService
  ) {}

  async onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    const planet = this.user.planet();
    const name = this.user.userName();

    if (!file || !name) {
      alert("Utilisateur non défini.");
      return;
    }

    this.uploading = true;
    try {
      await this.photoService.upload(file, this.missionId, planet?.id ?? null, name);

  this.photoUploaded.emit(file);
      } catch (err: any) {
        console.error(err);
        alert('❌ Erreur upload : ' + err.message);
      } finally {
        this.uploading = false;
      }
    }

  onClick() {
    this.fileInputRef?.nativeElement.click();
  }

}
