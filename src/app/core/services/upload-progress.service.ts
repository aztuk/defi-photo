import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Upload {
  id: string;
  file: File;
  progress$: Observable<number>;
  error: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class UploadProgressService {
  private uploads = new BehaviorSubject<Upload[]>([]);
  uploads$ = this.uploads.asObservable();

  addUpload(file: File, uploaderFn: (onProgress: (progress: number) => void) => Promise<any>) {
    const id = Math.random().toString(36).substring(2);
    const progressSubject = new BehaviorSubject<number>(0);

    const newUpload: Upload = {
      id,
      file,
      progress$: progressSubject.asObservable(),
      error: null
    };

    this.uploads.next([...this.uploads.getValue(), newUpload]);

    const onProgress = (progress: number) => {
      progressSubject.next(progress);
    };

    uploaderFn(onProgress)
      .then(() => {
        progressSubject.next(100);
        setTimeout(() => this.removeUpload(id), 5000);
      })
      .catch(err => {
        const currentUploads = this.uploads.getValue();
        const uploadIndex = currentUploads.findIndex(u => u.id === id);
        if (uploadIndex > -1) {
          currentUploads[uploadIndex].error = err.message;
          this.uploads.next([...currentUploads]);
        }
      });
  }

  private removeUpload(id: string) {
    const currentUploads = this.uploads.getValue();
    this.uploads.next(currentUploads.filter(u => u.id !== id));
  }
}
