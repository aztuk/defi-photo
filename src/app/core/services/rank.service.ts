import { Injectable, signal } from '@angular/core';
import { MissionService } from './mission.service';

@Injectable({ providedIn: 'root' })
export class RankService {
  readonly planetRank = signal<number | null>(null);
  readonly totalPlanets = signal(0);

  constructor(private missionService: MissionService) {}

  async calculateRank(planetId: string) {
    const allProgressMap = await this.missionService.getAllMissionProgress();
    const planetProgress = allProgressMap.get(planetId) || [];
    const planetScore = planetProgress.filter(m => m.validated).reduce((acc, m) => acc + m.points, 0);
    const allScores = Array.from(allProgressMap.values()).map(
      missions => missions.filter(m => m.validated).reduce((acc, m) => acc + m.points, 0)
    );
    const sorted = [...allScores].sort((a, b) => b - a);
    const rank = sorted.indexOf(planetScore) + 1;

    this.planetRank.set(rank);
    this.totalPlanets.set(allScores.length);
  }
}
