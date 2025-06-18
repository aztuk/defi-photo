// core/services/theme.service.ts
import { Injectable, computed, effect, inject } from '@angular/core';
import { UserContextService } from '../context/user-context.service';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly user = inject(UserContextService);

  constructor() {
      effect(() => {
        const rawName = this.user.planetNameSignal();
        const name = rawName?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') ?? null;

        // Supprime toutes les classes "planet-*"
        document.body.classList.forEach(cls => {
          if (cls.startsWith('planet-')) document.body.classList.remove(cls);
        });

        // Ajoute une classe même si aucun nom
        document.body.classList.add(`planet-${name ?? 'mercure'}`);
      });

  }
}
