import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MyPlanetHeaderComponent } from './my-planet-header/my-planet-header.component';
import { MissionCardComponent } from './mission-card/mission-card.component';
import { PlanetService } from '../../core/services/planet.service';
import { MissionService } from '../../core/services/mission.service';
import { UserContextService } from '../../core/context/user-context.service';
import { MissionProgress } from '../../core/interfaces/interfaces.models';

@Component({
  selector: 'app-my-planet',
  standalone: true,
  imports: [CommonModule, MyPlanetHeaderComponent, MissionCardComponent],
  templateUrl: './my-planet.component.html',
  styleUrls: ['./my-planet.component.scss']
})
export class MyPlanetComponent implements OnInit {
  readonly loading = signal(true);
  readonly missionProgress = signal<MissionProgress[]>([]);
  readonly planetRank = signal<number | null>(null);
  readonly totalPlanets = signal(0);

  constructor(
    private planetService: PlanetService,
    private missionService: MissionService,
    public user: UserContextService
  ) {}

  async ngOnInit() {
    this.loading.set(true);

    await Promise.all([
      this.planetService.revalidate(),
      this.missionService.revalidate(),
    ]);

    const allPlanets = this.planetService.getAll();
    this.user.initFromPlanetsList(allPlanets);

    const userPlanet = this.user.planet();
    if (!userPlanet) {
      console.error('[MyPlanet] Planète utilisateur introuvable.');
      return;
    }

    const allProgressMap = await this.missionService.getAllMissionProgress();
    const userProgress = allProgressMap.get(userPlanet.id) || [];

    this.missionProgress.set(userProgress);

    const userScore = userProgress.filter(m => m.validated).length;
    const allScores = Array.from(allProgressMap.values()).map(missions =>
      missions.filter(m => m.validated).length
    );

    const sorted = [...allScores].sort((a, b) => b - a);
    const rank = sorted.indexOf(userScore) + 1;

    this.planetRank.set(rank);
    this.totalPlanets.set(allScores.length);
    this.loading.set(false);
  }

  logout() {
    this.user.logout();
  }
}
