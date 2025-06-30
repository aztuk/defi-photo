import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MyPlanetHeaderComponent } from './my-planet-header/my-planet-header.component';
import { MissionCardComponent } from './mission-card/mission-card.component';
import { PlanetService } from '../../core/services/planet.service';
import { MissionService } from '../../core/services/mission.service';
import { UserContextService } from '../../core/context/user-context.service';
import { MissionProgress } from '../../core/interfaces/interfaces.models';
import { ActivatedRoute } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';
import { PlanetContextService } from '../../core/context/planet-context.service';
import { PhotoService } from '../../core/services/photo.service';

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
    private user: UserContextService,
    private theme: ThemeService,
    private route: ActivatedRoute,
    private photoService: PhotoService,
    private planetContext: PlanetContextService // 🆕
  ) {}

  async ngOnInit() {
    this.loading.set(true);

    // ⏫ Récupération des données de base
    await Promise.all([
      this.planetService.revalidate(),
      this.missionService.revalidate(),
    this.photoService.revalidate(true) // <-- AJOUT ici
    ]);

    const allPlanets = this.planetService.getAll();
    this.user.initFromPlanetsList(allPlanets);

    // ⏳ Résolution de la planète cible
    const planetId = this.route.snapshot.paramMap.get('planetId');
    const userPlanet = this.user.planet();

    this.planetContext.initFromRoute(planetId, allPlanets, userPlanet);

    const target = this.planetContext.currentPlanet();
    const isReadonly = this.planetContext.readonly();

    if (!target) {
      console.error('[MyPlanet] Planète cible introuvable');
      return;
    }

    // 🎨 Appliquer le thème à partir du nom
    this.theme.setTheme(target.name);

    // 📸 Récupération des missions pour cette planète
    const allProgressMap = await this.missionService.getAllMissionProgress();
    const planetProgress = allProgressMap.get(target.id) || [];
    this.missionProgress.set(planetProgress);

    // 🏅 Calcul du rang
    const planetScore = planetProgress.filter(m => m.validated).length;
    const allScores = Array.from(allProgressMap.values()).map(
      missions => missions.filter(m => m.validated).length
    );
    const sorted = [...allScores].sort((a, b) => b - a);
    const rank = sorted.indexOf(planetScore) + 1;

    this.planetRank.set(rank);
    this.totalPlanets.set(allScores.length);

    this.loading.set(false);
  }
}
