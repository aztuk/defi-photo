import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MissionProgress, Planet } from '../../../core/interfaces/interfaces.models';
import { PlanetAvatarComponent } from "../../../components/planet-avatar/planet-avatar.component";
import { UserContextService } from '../../../core/context/user-context.service';

@Component({
  selector: 'app-my-planet-header',
  imports: [CommonModule, PlanetAvatarComponent],
  templateUrl: './my-planet-header.component.html',
  styleUrl: './my-planet-header.component.scss'
})
export class MyPlanetHeaderComponent {
  @Input({ required: true }) progress!: MissionProgress[];
  @Input({ required: true }) rank!: number;
  @Input({ required: true }) total!: number;

  readonly userName;
  readonly planet;

  constructor(private userService: UserContextService) {
    this.userName = this.userService.userName();
    this.planet = this.userService.planet();
  }

  get completed(): number {
    return this.progress.filter(p => p.validated).length;
  }

  get percent(): number {
    return this.progress.length === 0 ? 0 : Math.round((this.completed / this.progress.length) * 100);
  }
}
