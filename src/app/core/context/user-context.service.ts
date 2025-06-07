import { Injectable, computed, effect, signal } from '@angular/core';
import { Planet, UserIdentity } from '../interfaces/interfaces.models';

const LOCAL_STORAGE_KEY = 'defi-photo-user';

@Injectable({ providedIn: 'root' })
export class UserContextService {
  private readonly _user = signal<UserIdentity | null>(null);
  private readonly _planet = signal<Planet | null>(null);

  readonly user = computed(() => this._user());
  readonly userName = computed(() => this._user()?.name ?? null);
  readonly planetName = computed(() => this._user()?.planet ?? null);
  readonly planet = computed(() => this._planet());
  readonly planetId = computed(() => this._planet()?.id ?? null);

  constructor() {
    // Étape 1 : lire localStorage
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      try {
        const parsed: UserIdentity = JSON.parse(stored);
        this._user.set(parsed);
      } catch (e) {
        console.warn('[UserContext] Erreur parsing localStorage');
      }
    } else {
      console.log('[UserContext] Aucun utilisateur enregistré.');
    }

    // Étape 2 : sync vers localStorage à chaque changement
    effect(() => {
      const u = this._user();
      if (u) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(u));
      }
    });
  }

  login(name: string, planetName: string) {
    this._user.set({ name, planet: planetName });
  }

  logout() {
    this._user.set(null);
    this._planet.set(null);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }

  /**
   * Appelé une fois que les planètes sont chargées
   */
  initFromPlanetsList(planets: Planet[]) {
    const planetName = this._user()?.planet;
    if (!planetName) return;

    const match = planets.find(p => p.name.toLowerCase() === planetName.toLowerCase());
    if (match) {
      this._planet.set(match);
    } else {
      console.warn('[UserContext] Planète non trouvée dans la liste :', planetName);
    }
  }

  isLoggedIn(strict = false): boolean {
    const user = this._user();
    const planet = this._planet();

    return !!user && (!strict || !!planet);
  }

}
