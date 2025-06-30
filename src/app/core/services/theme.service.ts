// core/services/theme.service.ts
import { Injectable, computed, effect, inject } from '@angular/core';
import { UserContextService } from '../context/user-context.service';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly user = inject(UserContextService);

  /**
   * Applique un thème CSS sur le <body> selon le nom de la planète
   */
  setTheme(planetName: string | null) {
    const name = planetName?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') ?? 'mercure';

    document.body.classList.forEach(cls => {
      if (cls.startsWith('planet-')) document.body.classList.remove(cls);
    });

    document.body.classList.add(`planet-${name}`);
  }

}
