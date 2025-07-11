import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserContextService, LOCAL_STORAGE_KEY } from '../../core/context/user-context.service';

@Component({
  selector: 'app-test-access',
  standalone: true,
  imports: [],
  templateUrl: './test-access.component.html'
})
export class TestAccessComponent {
  constructor(private router: Router, private user: UserContextService) {}

  simulateScenario(id: number) {
    // Toujours partir d'une session propre
    this.user.logout();

    switch (id) {
      case 1:
        // ✅ Cas 1 : déjà logué
        this.user.login('Alice', 'Saturne');
        this.router.navigate(['/login']);
        break;

      case 2:
        // ✅ Cas 2 : planète dans URL
        this.router.navigate(['/login'], { queryParams: { planet: 'venus' } });
        break;

      case 3:
        // ✅ Cas 3 : accès direct sans session ni planète
        this.router.navigate(['/login']);
        break;

      case 4:
        // 🧪 Cas 4 : localStorage corrompu
        localStorage.setItem(LOCAL_STORAGE_KEY, '%%%bad_json');
        this.router.navigate(['/login']);
        break;

      case 5:
        // ❌ Cas 5 : planète invalide (non présente dans la DB)
        this.user.login('Bob', 'Pluton');
        this.router.navigate(['/login']);
        break;

      case 6:
        // 🔀 Cas 6 : connecté à Mercure mais accède à Mars
        this.user.login('Zoe', 'Mercure');
        this.router.navigate(['/planet/mars/view']);
        break;

      case 7:
        // 🔄 Déconnexion forcée
        this.user.logout();
        this.router.navigate(['/login']);
        break;
    }
  }
}
