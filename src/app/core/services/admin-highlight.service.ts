import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AdminHighlightService {
  readonly hoveredMissionId = signal<string | null>(null);

  setHoveredMission(id: string) {
    this.hoveredMissionId.set(id);
  }

  clearHoveredMission() {
    this.hoveredMissionId.set(null);
  }
}
