import { Component, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserContextService } from '../../core/context/user-context.service';
import { PlanetAvatarComponent } from '../../components/planet-avatar/planet-avatar.component';
import { PlanetService } from '../../core/services/planet.service';
import { Planet } from '../../core/interfaces/interfaces.models';
import { PreFillService } from '../../core/services/pre-fill.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, PlanetAvatarComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  name = 'Quentin';
  selectedPlanet: Planet | null = null;

  private returnUrl: string = '/';

  constructor(
    private route: ActivatedRoute,
    private user: UserContextService,
    private router: Router,
    private preFillService: PreFillService
  ) {

     effect(() => {
       this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/';

      const data = this.preFillService.prefillData();
      if (data) {
        this.name = data.name ?? 'Quentin';
        this.selectedPlanet = data.planet;
      }
    });

    if (user.isLoggedIn()) {
      this.router.navigateByUrl('/');
    }
  }

  get planets() {
    return this.preFillService.planetService.planets;
  }

  onPlanetSelect(planet: Planet) {
    this.selectedPlanet = planet;
  }

  login() {
    if (!this.name.trim() || !this.selectedPlanet) {
      alert('Merci de renseigner un prénom et de sélectionner une planète.');
      return;
    }
    this.user.login(this.name.trim(), this.selectedPlanet.name);
    this.router.navigateByUrl(this.returnUrl);
  }
}
