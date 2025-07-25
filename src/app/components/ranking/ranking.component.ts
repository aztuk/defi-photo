import { Component, OnInit, signal, Input, OnChanges, SimpleChanges, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlanetAvatarComponent } from '../planet-avatar/planet-avatar.component';
import { PlanetWithMissionsProgress, ClassementPlanet } from '../../core/interfaces/interfaces.models';
import { UserContextService } from '../../core/context/user-context.service';
import { Router } from '@angular/router';
import { PlanetService } from '../../core/services/planet.service';
import { MissionService } from '../../core/services/mission.service';
import { RankingService } from '../../core/services/ranking.service';

@Component({
  selector: 'app-ranking',
  standalone: true,
  imports: [CommonModule, PlanetAvatarComponent],
  templateUrl: './ranking.component.html',
  styleUrls: ['./ranking.component.scss']
})
export class RankingComponent implements OnInit, OnChanges {
  @Input() planets?: ClassementPlanet[];
  @Input() view: 'default' | 'projection' = 'default';

  @HostBinding('attr.data-view') get viewAtt() { return this.view; }

  readonly planetsProgress = signal<any[]>([]);
  readonly loading = signal(true);

  readonly userPlanet;

  constructor(
    private planetService: PlanetService,
    private missionService: MissionService,
    private rankingService: RankingService,
    private userContext: UserContextService,
    private router: Router
  ) {
    this.userPlanet = this.userContext.planet;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['planets'] && this.planets) {
      this.planetsProgress.set(this.planets);
      this.loading.set(false);
    }
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
    if (this.planets) {
      this.planetsProgress.set(this.planets);
      this.loading.set(false);
      return;
    }

    this.loading.set(true);

    try {
      // Utilise le service centralisé pour récupérer le classement
      const classement = await this.rankingService.getClassement();

      // Si nécessaire, initialise le contexte utilisateur
      const allPlanets = this.planetService.getAll();
      if (!this.userContext.planet()) {
        this.userContext.initFromPlanetsList(allPlanets);
      }

      this.planetsProgress.set(classement);
    } catch (error) {
      console.error('Error fetching ranking:', error);
    } finally {
      this.loading.set(false);
    }
  }
}
