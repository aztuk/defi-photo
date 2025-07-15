// core/services/app-context-initializer.service.ts
import { Injectable } from '@angular/core';
import { UserContextService } from '../context/user-context.service';
import { PlanetContextService } from '../context/planet-context.service';
import { PlanetService } from '../services/planet.service';
import { PhotoService } from '../services/photo.service';
import { MissionService } from '../services/mission.service';
import { supabase } from '../services/supabase.client';

@Injectable({ providedIn: 'root' })
export class AppContextInitializerService {
  constructor(
    private planetService: PlanetService,
    private userContext: UserContextService,
    private planetContext: PlanetContextService,
    private photoService: PhotoService,
    private missionService: MissionService
  ) {}

  /** Initialise tout ce qui est nécessaire depuis session (localStorage) */
  async fromSession(): Promise<void> {
    await this.planetService.revalidate();
    const planets = this.planetService.getAll();
    this.userContext.initFromPlanetsList(planets);

    // Si aucun contexte planète n'est défini, on prend celui du user
    if (!this.planetContext.currentPlanet()) {
      const userPlanet = this.userContext.planet();
      if (userPlanet) {
        this.planetContext.setPlanet(userPlanet, false);
      }
    }
  }

  /** Initialise le contexte planète en fonction d'un missionId (cas : /defi/:id) */
  async initFromMissionId(missionId: string): Promise<void> {
    const { data, error } = await supabase
      .from('planet_missions')
      .select('planet_id')
      .eq('mission_id', missionId)
      .limit(1)
      .maybeSingle();

    if (error || !data?.planet_id) return;

    await this.initFromPlanetId(data.planet_id);
  }

  async initFromPlanetId(planetId: string): Promise<void> {
    await this.planetService.revalidate();
    const planets = this.planetService.getAll();
    this.userContext.initFromPlanetsList(planets);

    const targetPlanet = planets.find(p => p.id === planetId);
    if (targetPlanet) {
      const userPlanet = this.userContext.planet();
      const readonly = !userPlanet || targetPlanet.id !== userPlanet.id;
      this.planetContext.setPlanet(targetPlanet, readonly);
    }
  }

  /** (Optionnel) Rechargement complet de tous les contextes pertinents */
  async refreshAll(): Promise<void> {
    await Promise.all([
      this.planetService.revalidate(),
      this.photoService.revalidate(),
      this.missionService.revalidate(),
    ]);

    const planets = this.planetService.getAll();
    this.userContext.initFromPlanetsList(planets);

    const userPlanet = this.userContext.planet();
    if (userPlanet) {
      this.planetContext.setPlanet(userPlanet, false);
    }
  }
}
