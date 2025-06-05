import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlanetService } from '../../core/services/planet.service';
import { MissionService } from '../../core/services/mission.service';
import { MissionProgress, PlanetWithMissionsProgress } from '../../core/interfaces/interfaces.models';



@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  readonly loading = signal(true);
  readonly planetsWithProgress = signal<PlanetWithMissionsProgress[]>([]);

  constructor(
    private planetService: PlanetService,
    private missionService: MissionService
  ) { }

  async ngOnInit() {
    await this.planetService.refresh();
    await this.missionService.refresh();

    const result: PlanetWithMissionsProgress[] = [];

    for (const planet of this.planetService.planets()) {
      const missions = await this.missionService.getMissionProgressByPlanet(planet.id);
      const validated = missions.filter(m => m.validated).length;
      const progressPercent = missions.length === 0
        ? 0
        : Math.round((validated / missions.length) * 100);

      result.push({
        ...planet,
        missionsProgress: missions,
        missionsValidated: validated,
        progressPercent,
      });
    }

    this.planetsWithProgress.set(result);
    this.loading.set(false);
  }



}
