import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserContextService } from '../../core/context/user-context.service';
import { PlanetService } from '../../core/services/planet.service';

@Component({
  selector: 'app-login',
  standalone: true,
  template: '',
})
export class LoginComponent implements OnInit {
  private user = inject(UserContextService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private planetService = inject(PlanetService);

  async ngOnInit() {
    await this.planetService.revalidate();
    const allPlanets = this.planetService.getAll();
    this.user.initFromPlanetsList(allPlanets); // Définit la planète active si possible

    const hasSession = this.user.isLoggedIn();
    const queryPlanet = this.route.snapshot.queryParamMap.get('planet');

    if (hasSession) {
      this.router.navigate(['/auth/planet-confirmation']);
      return;
    }

    if (queryPlanet) {
      this.user.setTemporaryPlanet(queryPlanet); // stock temporaire
      this.router.navigate(['/auth/planet-confirmation']);
      return;
    }

    this.router.navigate(['/auth/planet-selector']);
  }
}
