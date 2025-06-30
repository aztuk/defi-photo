import { Component, computed, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlanetService } from '../../core/services/planet.service';
import { MissionService } from '../../core/services/mission.service';
import { MissionProgress, PlanetWithMissionsProgress } from '../../core/interfaces/interfaces.models';
import { ScrollHeaderComponent } from "../../components/scroll-header/scroll-header.component";
import { PlanetAvatarComponent } from "../../components/planet-avatar/planet-avatar.component";
import { UserContextService } from '../../core/context/user-context.service';
import { ProgressComponent } from '../../components/progress/progress.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ScrollHeaderComponent, PlanetAvatarComponent, ProgressComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  readonly planetsProgress = signal<PlanetWithMissionsProgress[]>([]);
  readonly loading = signal(true);

  readonly userPlanet = computed(() => this.userContext.planet());
  readonly userName = computed(() => this.userContext.userName());
  readonly userRank = computed(() => this.getUserRank());

  constructor(
    private planetService: PlanetService,
    private missionService: MissionService,
    private userContext: UserContextService,
  private router: Router
  ) {}

isUserPlanet(planetName: string): boolean {
  return planetName.toLowerCase() === this.userPlanet()?.name.toLowerCase();
}

getUserRank(): number | null {
  const list = this.planetsProgress();
  const planetName = this.userPlanet()?.name.toLowerCase();
  const index = list.findIndex(p => p.name.toLowerCase() === planetName);
  return index >= 0 ? index + 1 : null;
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
    this.userContext.initFromPlanetsList(allPlanets);

    const progressMap = await this.missionService.getAllMissionProgress();

    const fullList: PlanetWithMissionsProgress[] = this.planetService.getAll().map(p => {
      const progress = progressMap.get(p.id) || [];
      const validated = progress.filter(m => m.validated).length;
      const percent = progress.length === 0 ? 0 : Math.round((validated / progress.length) * 100);
      return {
        ...p,
        missionsProgress: progress,
        missionsValidated: validated,
        progressPercent: percent
      };
    });

    // Tri décroissant par nb de missions validées
    fullList.sort((a, b) => b.missionsValidated - a.missionsValidated);

    this.planetsProgress.set(fullList);
    this.loading.set(false);
  }
}
