import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FullscreenService {
  isFullscreen(): boolean {
    return false;
  }

  requestFullscreen(): void {
    // no-op
  }

  ensureFullscreen(): void {
    // no-op
  }
}
