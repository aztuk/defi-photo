import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MissionFormComponent } from './mission-form/mission-form.component';
import { MissionByPlanetComponent } from "./mission-by-planet/mission-by-planet.component";

@Component({
  selector: 'app-admin-page',
  standalone: true,
  imports: [CommonModule, MissionFormComponent, MissionByPlanetComponent],
  templateUrl: './admin-page.component.html',
  styleUrl: './admin-page.component.scss',
})
export class AdminPageComponent {
  readonly showPanel = signal(false);

  constructor() {
  }

}
