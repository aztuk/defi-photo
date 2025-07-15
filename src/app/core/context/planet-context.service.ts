// core/context/planet-context.service.ts
import { Injectable, signal, effect } from "@angular/core";
import { Planet } from "../interfaces/interfaces.models";

const SESSION_STORAGE_KEY = 'defi-photo-planet-context';

@Injectable({ providedIn: 'root' })
export class PlanetContextService {
  readonly currentPlanet = signal<Planet | null>(null);
  readonly readonly = signal(false);

  constructor() {
    this.loadFromSession();

    effect(() => {
      const planet = this.currentPlanet();
      const readonly = this.readonly();
      if (planet) {
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ planet, readonly }));
      } else {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
      }
    });
  }

  setPlanet(planet: Planet | null, readonly: boolean) {
    this.currentPlanet.set(planet);
    this.readonly.set(readonly);
  }

  private loadFromSession() {
    const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (stored) {
      try {
        const { planet, readonly } = JSON.parse(stored);
        this.currentPlanet.set(planet);
        this.readonly.set(readonly);
      } catch (e) {
        console.warn('[PlanetContext] Erreur parsing sessionStorage');
      }
    }
  }
}
