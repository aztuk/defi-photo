import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Upload, UploadProgressService } from '../../core/services/upload-progress.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-upload-progress-toast',
  standalone: true,
  imports: [CommonModule, MatProgressBarModule],
  templateUrl: './upload-progress-toast.component.html',
  styleUrls: ['./upload-progress-toast.component.scss']
})
export class UploadProgressToastComponent implements OnInit {
  uploads$: Observable<Upload[]>;

  constructor(private uploadProgressService: UploadProgressService) {
    this.uploads$ = this.uploadProgressService.uploads$;
  }

  ngOnInit(): void {}

  trackById(index: number, item: Upload): string {
    return item.id;
  }
}
