import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlanetAvatarComponent } from '../planet-avatar/planet-avatar.component';
import { PlanetWithMissionsProgress } from '../../core/interfaces/interfaces.models';
import { UserContextService } from '../../core/context/user-context.service';
import { Router } from '@angular/router';
import { PlanetService } from '../../core/services/planet.service';
import { MissionService } from '../../core/services/mission.service';

@Component({
  selector: 'app-ranking',
  standalone: true,
  imports: [CommonModule, PlanetAvatarComponent],
  templateUrl: './ranking.component.html',
  styleUrls: ['./ranking.component.scss']
})
export class RankingComponent implements OnInit {
  readonly planetsProgress = signal<PlanetWithMissionsProgress[]>([]);
  readonly loading = signal(true);

  readonly userPlanet;

  constructor(
    private planetService: PlanetService,
    private missionService: MissionService,
    private userContext: UserContextService,
    private router: Router
  ) {
    this.planetsProgress = signal<PlanetWithMissionsProgress[]>([]);
    this.loading = signal(true);
    this.userPlanet = this.userContext.planet;
  }

  isUserPlanet(planetName: string): boolean {
    const userPlanet = this.userPlanet();
    return userPlanet ? planetName.toLowerCase() === userPlanet.name.toLowerCase() : false;
  }

  onPlanetClick(planet: PlanetWithMissionsProgress) {
    const userPlanetId = this.userPlanet()?.id;
    const targetPlanetId = planet.id;

    if (targetPlanetId === userPlanetId) {
      this.router.navigate(['/planet', targetPlanetId]);
    } else {
      this.router.navigate(['/planet', targetPlanetId, 'view']);
    }
  }

  async ngOnInit() {
    this.loading.set(true);

    await Promise.all([
      this.planetService.revalidate(),
      this.missionService.revalidate(),
    ]);

    const allPlanets = this.planetService.getAll();
    if (!this.userContext.planet()) {
      this.userContext.initFromPlanetsList(allPlanets);
    }

    const progressMap = await this.missionService.getAllMissionProgress();

    const fullList: PlanetWithMissionsProgress[] = this.planetService.getAll().map(p => {
      const progress = progressMap.get(p.id) || [];
      const validated = progress.filter(m => m.validated);
      const score = validated.reduce((acc, m) => acc + m.points, 0);
      const percent = progress.length === 0 ? 0 : Math.round((validated.length / progress.length) * 100);
      return {
        ...p,
        missionsProgress: progress,
        missionsValidated: validated.length,
        progressPercent: percent,
        score: score
      };
    });

    // Tri décroissant par score
    fullList.sort((a, b) => b.score - a.score);

    this.planetsProgress.set(fullList);
    this.loading.set(false);
  }
}
