import { Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
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
  @ViewChild('cameraInput') cameraInputRef?: ElementRef<HTMLInputElement>;
  @ViewChild('libraryInput') libraryInputRef?: ElementRef<HTMLInputElement>;


  uploading = false;
  showOptions = false;

  constructor(
    private photoService: PhotoService,
    private user: UserContextService,
    private elementRef: ElementRef
  ) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.showOptions = false;
    }
  }

  toggleOptions(event: MouseEvent) {
    event.stopPropagation();
    this.showOptions = !this.showOptions;
  }

  async onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    const planet = this.user.planetId();
    const name = this.user.userName();

    if (!files || files.length === 0 || !name) {
      return;
    }


    this.photoService.queueFilesForUpload(files, this.missionId, planet ?? null, name);

    for (let i = 0; i < files.length; i++) {
      this.photoUploaded.emit(files[i]);
    }

    // Reset input fields to allow selecting the same file again
    if (this.cameraInputRef) this.cameraInputRef.nativeElement.value = '';
    if (this.libraryInputRef) this.libraryInputRef.nativeElement.value = '';
    this.showOptions = false;
  }

  takePhoto() {
    this.cameraInputRef?.nativeElement.click();
  }

  chooseFromLibrary() {
    this.libraryInputRef?.nativeElement.click();
  }

}
