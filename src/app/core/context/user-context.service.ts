// core/context/user-context.service.ts
import { Injectable, signal, computed, effect } from '@angular/core';
import { Planet, UserIdentity } from '../interfaces/interfaces.models';

export const LOCAL_STORAGE_KEY = 'defi-photo-user';

@Injectable({ providedIn: 'root' })
export class UserContextService {
  private readonly _identity = signal<UserIdentity | null>(null);
  private readonly _allPlanets = signal<Planet[]>([]);
  private readonly _temporaryPlanetName = signal<string | null>(null);

  readonly isLoggedIn = computed(() => !!this._identity());
  readonly userName = computed(() => this._identity()?.name ?? null);
  readonly planetName = computed(() => this._identity()?.planet ?? null);
  readonly planet = computed(() => {
    const planetName = this.planetName();
    if (!planetName) return null;
    return this._allPlanets().find(p => p.name.toLowerCase() === planetName.toLowerCase()) ?? null;
  });
  readonly planetId = computed(() => this.planet()?.id ?? null);

  constructor() {
    // Lecture du localStorage au démarrage
    this.loadFromStorage();

    // Sync automatique vers localStorage
    effect(() => {
      const identity = this._identity();
      if (identity) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(identity));
      }
    });
  }

  /**
   * Utilisé dans la phase de login : permet de stocker temporairement une planète avant validation finale.
   */
  setTemporaryPlanet(name: string | null) {
    this._temporaryPlanetName.set(name);
  }

  /**
   * Finalise le login : définit le nom d'utilisateur + la planète (par nom)
   */
  login(name: string, planetName: string) {
    this._identity.set({ name, planet: planetName });
    this._temporaryPlanetName.set(null); // Reset car on est officiellement logué
  }

  /**
   * Déconnexion complète
   */
  logout() {
    this._identity.set(null);
    this._temporaryPlanetName.set(null);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }

  /**
   * Charge l'identité depuis le localStorage.
   */
  private loadFromStorage() {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      try {
        const parsed: UserIdentity = JSON.parse(stored);
        this._identity.set(parsed);
      } catch (e) {
        console.warn('[UserContext] Erreur parsing localStorage');
      }
    }
  }

  /**
   * Met à jour la liste des planètes disponibles.
   */
  initFromPlanetsList(planets: Planet[]) {
    this._allPlanets.set(planets);
  }

}
