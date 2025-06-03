import { Injectable, signal, effect } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserContextService } from '../context/user-context.service';
import { PlanetService } from './planet.service';
import { Planet, PreFillData } from '../interfaces/interfaces.models';

@Injectable({ providedIn: 'root' })
export class PreFillService {
  readonly prefillData = signal<PreFillData>({
    name: null,
    planet: null,
  });

  constructor(
    private route: ActivatedRoute,
    public planetService: PlanetService,
    private userService: UserContextService
  ) {
    // Effet pour gérer la pré-remplissage
    effect(() => {
      // 1. Priorité 1 : Query param "planet"
      const planetNameParam = this.route.snapshot.queryParamMap.get('planet');

      // 2. Planètes chargées
      const planets = this.planetService.getAll();

      // 3. Chercher la planète dans les planètes chargées
      let matchedPlanet: Planet | null = null;
      if (planetNameParam && planets.length > 0) {
        matchedPlanet =
          planets.find(
            p => p.name.toLowerCase() === planetNameParam.toLowerCase()
          ) || null;
      }

      // 4. Prénom & planète dans localStorage via UserContext
      const storedName = this.userService.name;
      const storedPlanetName = this.userService.planet;
      let storedPlanet: Planet | null = null;
      if (!matchedPlanet && storedPlanetName && planets.length > 0) {
        storedPlanet =
          planets.find(
            p => p.name.toLowerCase() === storedPlanetName.toLowerCase()
          ) || null;
      }

      // 5. Compose la donnée finale selon priorité
      this.prefillData.set({
        name: storedName || null,
        planet: matchedPlanet || storedPlanet || null,
      });
    });
  }
}
