import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FullscreenService {

  isFullscreen(): boolean {
    return document.fullscreenElement !== null;
  }

  requestFullscreen(): void {
    if (!this.isFullscreen()) {
      document.documentElement.requestFullscreen();
    }
  }

  ensureFullscreen(): void {
    // This method is intended to be called after a user interaction.
    // It will request fullscreen if not already active.
    this.requestFullscreen();
  }
}
