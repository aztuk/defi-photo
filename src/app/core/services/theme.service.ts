// core/services/theme.service.ts
import { Injectable, inject } from '@angular/core';
import { UserContextService } from '../context/user-context.service';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly user = inject(UserContextService);

  initGlobalTheme() {
    const name = this.user.planetName()?.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') || 'mercure';

    // Supprime les anciennes classes
    document.body.classList.forEach(cls => {
      if (cls.startsWith('planet-')) document.body.classList.remove(cls);
    });

    // Ajoute la nouvelle classe
    document.body.classList.add(`planet-${name}`);
  }
}
