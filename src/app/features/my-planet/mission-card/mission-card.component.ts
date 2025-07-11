// features/my-planet/mission-card/mission-card.component.ts
import { Component, Input, ViewChild, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MissionProgress } from '../../../core/interfaces/interfaces.models';
import { PhotoService } from '../../../core/services/photo.service';
import { UserContextService } from '../../../core/context/user-context.service';
import { PlanetContextService } from '../../../core/context/planet-context.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-mission-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './mission-card.component.html',
  styleUrls: ['./mission-card.component.scss']
})
export class MissionCardComponent implements OnInit {
  @Input({ required: true }) mission!: MissionProgress;
  @Input({ required: true }) nb!: number;

  readonly isReadonly;

  private photoService = inject(PhotoService);
  private context = inject(PlanetContextService);
  private user = inject(UserContextService);

  constructor() {
    this.isReadonly = this.context.readonly();
  }

  async ngOnInit() {
    await this.photoService.revalidate();
  }


  get routerLink(): string {
    return `/defi/${this.mission.id}`;
  }
get photosCount(): number {
  const planet = this.context.currentPlanet();
  if (!planet) return 0;
  return this.photoService.getByMissionAndPlanet(this.mission.id, planet.id).length;
}

}
