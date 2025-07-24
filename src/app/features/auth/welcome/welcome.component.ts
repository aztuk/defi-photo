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
    const queryPlanet = this.route.snapshot.queryParamMap.get('planet');

    if (this.user.isLoggedIn()) {
      const userName = this.user.userName();
      const planetName = this.user.planetName();

      if (userName && planetName) {
        const planetId = this.user.planetId();
        this.router.navigate(['/planet', planetId]);
        return;
      }

      console.warn('[Welcome] User is logged in but session data is incomplete.');
      if (!planetName) {
        this.router.navigate(['/auth/planet-selector']);
        return;
      }
      if (!userName) {
        this.router.navigate(['/auth/username-input']);
        return;
      }
    } else {
      // New user
      if (queryPlanet) {
        this.user.setTemporaryPlanet(queryPlanet);
        this.router.navigate(['/auth/planet-confirmation']);
        return;
      } else {
        this.router.navigate(['/auth/planet-selector']);
        return;
      }
    }
  }
}
