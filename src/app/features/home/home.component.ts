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
  ) {}

  async ngOnInit() {
    this.loading.set(true);

    await Promise.all([
      this.planetService.revalidate(),
      this.missionService.revalidate(),
    ]);

    const allPlanets = this.planetService.getAll();
    const allProgressMap = await this.missionService.getAllMissionProgress();

    const result: PlanetWithMissionsProgress[] = allPlanets.map(planet => {
      const missions = allProgressMap.get(planet.id) || [];
      const validated = missions.filter(m => m.validated).length;
      const progressPercent = missions.length === 0
        ? 0
        : Math.round((validated / missions.length) * 100);

      return {
        ...planet,
        missionsProgress: missions,
        missionsValidated: validated,
        progressPercent,
      };
    });

    this.planetsWithProgress.set(result);
    this.loading.set(false);
  }
}
