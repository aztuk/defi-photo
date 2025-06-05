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
    private preFillService: PreFillService,
    private planetService: PlanetService
  ) {
    effect(() => {
      // Pré-remplissage si dispo
      const data = this.preFillService.prefillData();
      this.name = data.name ?? '';
      this.selectedPlanet = data.planet;

      // Récupération du paramètre returnUrl
      this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/planet/' + (data.planet?.name ?? '');

      // Redirection automatique si déjà connecté et planète définie
      if (this.user.isLoggedIn() && this.user.planetName()) {
        this.router.navigateByUrl('/planet/' + this.user.planetName());
      }
    });
  }


  get planets() {
    return this.preFillService.planetService.planets;
  }

  onPlanetSelect(planet: Planet) {
    this.selectedPlanet = planet;
  }

  async login() {
    if (!this.name.trim() || !this.selectedPlanet) {
      alert('Merci de renseigner un prénom et de sélectionner une planète.');
      return;
    }

    console.log('[UserContext] Connexion :', this.name.trim(), this.selectedPlanet.name);
    this.user.login(this.name.trim(), this.selectedPlanet.name);

    await this.planetService.refresh();
    this.user.initFromPlanetsList(this.planetService.getAll());

    const target = this.returnUrl || `/planet/${this.selectedPlanet.name}`;
    console.log('Navigation vers :', target);
    this.router.navigateByUrl(target);
  }

}
