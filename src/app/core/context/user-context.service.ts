import { Injectable, computed, effect, signal } from '@angular/core';

export interface UserIdentity {
  name: string;
  planet: string;
}

const LOCAL_STORAGE_KEY = 'defi-photo-user';

@Injectable({ providedIn: 'root' })
export class UserContextService {
  private readonly _user = signal<UserIdentity | null>(null);
  readonly user = computed(() => this._user());

  constructor() {

    // Étape 1 : lire localStorage
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        this._user.set(parsed);
      } catch (e) {
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

  login(name: string, planet: string) {
    console.log('[UserContext] Connexion :', name, planet);
    this._user.set({ name, planet });
  }

  logout() {
    this._user.set(null);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }

  isLoggedIn(): boolean {
    return this._user() !== null;
  }

  get name(): string | null {
    return this._user()?.name ?? null;
  }

  get planet(): string | null {
    return this._user()?.planet ?? null;
  }
}
