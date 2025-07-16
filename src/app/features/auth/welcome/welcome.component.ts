import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { UserContextService } from '../../../core/context/user-context.service';
import { PlanetService } from '../../../core/services/planet.service';
import { DebugInfoComponent } from '../../../components/debug-info/debug-info.component';
import { FullscreenService } from '../../../core/services/fullscreen.service';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent implements OnInit {
  private router = inject(Router);
  private user = inject(UserContextService);
  private route = inject(ActivatedRoute);
  private planetService = inject(PlanetService);
  private fullscreenService = inject(FullscreenService);

  async ngOnInit() {
    // Initialize planets
    await this.planetService.revalidate();
    const allPlanets = this.planetService.getAll();
    this.user.initFromPlanetsList(allPlanets);
  }

  enter() {
    this.fullscreenService.requestFullscreen();
    console.log('[Welcome] Starting auth flow...');
    const queryPlanet = this.route.snapshot.queryParamMap.get('planet');

    if (this.user.isLoggedIn()) {
      console.log('[Welcome] User is logged in.');
      const userName = this.user.userName();
      const planetName = this.user.planetName();

      if (userName && planetName) {
        console.log(`[Welcome] User ${userName} on planet ${planetName} is fully authenticated.`);
        const planetId = this.user.planetId();
        this.router.navigate(['/planet', planetId]);
        return;
      }

      console.warn('[Welcome] User is logged in but session data is incomplete.');
      if (!planetName) {
        console.log('[Welcome] Missing planet name. Redirecting to planet-selector.');
        this.router.navigate(['/auth/planet-selector']);
        return;
      }
      if (!userName) {
        console.log('[Welcome] Missing user name. Redirecting to username-input.');
        this.router.navigate(['/auth/username-input']);
        return;
      }
    } else {
      // New user
      console.log('[Welcome] New user detected.');
      if (queryPlanet) {
        console.log(`[Welcome] New user with query param planet: ${queryPlanet}.`);
        this.user.setTemporaryPlanet(queryPlanet);
        this.router.navigate(['/auth/planet-confirmation']);
        return;
      } else {
        console.log('[Welcome] New user without query param. Redirecting to planet-selector.');
        this.router.navigate(['/auth/planet-selector']);
        return;
      }
    }
  }
}
