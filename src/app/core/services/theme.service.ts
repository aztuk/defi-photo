// core/services/theme.service.ts
import { Injectable, computed, effect, inject } from '@angular/core';
import { UserContextService } from '../context/user-context.service';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly user = inject(UserContextService);

  constructor() {
    effect(() => {
      const rawName = this.user.planetName();
      const name = rawName?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') ?? null;


      document.body.classList.forEach(cls => {
        if (cls.startsWith('planet-')) document.body.classList.remove(cls);
      });

      if (name) {
        document.body.classList.add(`planet-${name}`);
      }
    });
  }
}
