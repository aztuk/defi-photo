import { Component } from '@angular/core';
import { PhotoUploadComponent } from '../../components/photo-upload/photo-upload.component';

@Component({
  selector: 'app-upload',
  template: `<app-photo-upload></app-photo-upload>`,
  standalone: true,
  imports: [PhotoUploadComponent]
})
export class UploadComponent { }
