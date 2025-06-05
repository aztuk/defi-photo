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
    effect(() => {
      const planets = this.planetService.getAll();
      if (planets.length === 0) return;

      // 1. Query param (prioritaire)
      const planetNameFromUrl = this.route.snapshot.queryParamMap.get('planet');
      const planetFromUrl = planetNameFromUrl
        ? planets.find(p => p.name.toLowerCase() === planetNameFromUrl.toLowerCase()) ?? null
        : null;

      // 2. Stockage local via UserContextService
      const storedName = this.userService.userName(); // signal()
      const storedPlanetName = this.userService.planetName(); // signal()
      const planetFromStorage = storedPlanetName
        ? planets.find(p => p.name.toLowerCase() === storedPlanetName.toLowerCase()) ?? null
        : null;

      // 3. Préférence URL > localStorage
      this.prefillData.set({
        name: storedName ?? null,
        planet: planetFromUrl ?? planetFromStorage ?? null,
      });
    });
  }
}
