import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FullscreenService {
  isFullscreen(): boolean {
    return !!(document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement);
  }

  requestFullscreen(): void {
    const el = document.documentElement;

    if (this.isFullscreen()) return;

    if (el.requestFullscreen) {
      el.requestFullscreen().catch(err => {
        console.warn('[FullscreenService] Failed to enter fullscreen:', err);
      });
    } else if ((el as any).webkitRequestFullscreen) {
      (el as any).webkitRequestFullscreen(); // Safari
    } else if ((el as any).msRequestFullscreen) {
      (el as any).msRequestFullscreen(); // IE11
    } else if ((el as any).mozRequestFullScreen) {
      (el as any).mozRequestFullScreen(); // Firefox old
    } else {
      console.warn('[FullscreenService] Fullscreen API is not supported on this browser.');
    }
  }

  ensureFullscreen(): void {
    // Call this inside a trusted event (click, touchstart)
    this.requestFullscreen();
  }
}
