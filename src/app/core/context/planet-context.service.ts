// core/context/planet-context.service.ts
import { Injectable, signal } from "@angular/core";
import { Planet } from "../interfaces/interfaces.models";

@Injectable({ providedIn: 'root' })
export class PlanetContextService {
  readonly currentPlanet = signal<Planet | null>(null);
  readonly readonly = signal(false);

  setPlanet(planet: Planet, readonly: boolean) {
    this.currentPlanet.set(planet);
    this.readonly.set(readonly);
  }

  initFromRoute(planetId: string | null, planets: Planet[], userPlanet: Planet | null) {
    if (!planetId) return;

    const target = planets.find(p => p.id === planetId);
    if (!target) {
      console.warn('[PlanetContext] Planète introuvable :', planetId);
      return;
    }

    const isReadonly = !userPlanet || target.id !== userPlanet.id;
    this.setPlanet(target, isReadonly);
  }
}
