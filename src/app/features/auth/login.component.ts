import { Component, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserContextService } from '../../core/context/user-context.service';
import { PlanetAvatarComponent } from '../../components/planet-avatar/planet-avatar.component';
import { PlanetService } from '../../core/services/planet.service';
import { Planet } from '../../core/interfaces/interfaces.models';
import { PreFillService } from '../../core/services/pre-fill.service';
import { supabase } from '../../core/services/supabase.client';
import { PlanetSelectorComponent } from "./login/planet-selector.component";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, PlanetAvatarComponent, PlanetSelectorComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  name = 'Quentin';
  selectedPlanet: Planet | null = null;
  showPlanetPicker = false;


  private returnUrl: string = '/';

  constructor(
    private route: ActivatedRoute,
    private user: UserContextService,
    private router: Router,
    private preFillService: PreFillService,
    private planetService: PlanetService
  ) {effect(() => {
  const data = this.preFillService.prefillData();
  this.name = data.name ?? '';
  this.selectedPlanet = data.planet ?? null;

  const urlParam = this.route.snapshot.queryParamMap.get('returnUrl');
  this.returnUrl = urlParam || '/';

  const planetNameFromUrl = this.returnUrl.match(/\/planet\/([^\/]+)/)?.[1];

  if (!this.selectedPlanet && planetNameFromUrl) {
    const p = this.planets().find(p => p.name.toLowerCase() === planetNameFromUrl.toLowerCase());
    if (p) {
      this.selectedPlanet = { ...p };
      this.user.setTemporaryPlanet(p.name);
      this.showPlanetPicker = false;
    }
  }

  // Si aucune planète, fallback immédiat sur Mercure + ouverture du sélecteur
  if (!this.selectedPlanet && this.planets().length > 0) {
    const mercury = this.planets().find(p => p.name.toLowerCase() === 'mercure');
    if (mercury) {
      this.selectedPlanet = { ...mercury };
      this.user.setTemporaryPlanet(mercury.name);
      this.showPlanetPicker = true;
    }
  }

  if (this.user.isLoggedIn() && this.user.planetName()) {
    this.router.navigateByUrl('/planet/' + this.user.planetName());
  }
});


  }


  get planets() {
    return this.preFillService.planetService.planets;
  }

  onPlanetSelect(planet: Planet) {
    this.selectedPlanet = { ...planet }; // force un nouveau ref
    this.showPlanetPicker = false;
    this.user.setTemporaryPlanet(planet.name);
  }

  async login() {
    this.enterFullscreen();
    if (!this.name.trim() || !this.selectedPlanet) {
      alert('Merci de renseigner un prénom et de sélectionner une planète.');
      return;
    }

    console.log('[UserContext] Connexion :', this.name.trim(), this.selectedPlanet.name);
    this.user.login(this.name.trim(), this.selectedPlanet.name);
    this.user.setTemporaryPlanet(null); // 👈 on efface la valeur temporaire

    await this.refreshSupabaseSession();
    await this.planetService.revalidate();
    this.user.initFromPlanetsList(this.planetService.getAll());

    const target = this.returnUrl || `/planet/${this.selectedPlanet.name}`;
    console.log('Navigation vers :', target);
    this.router.navigateByUrl(target);
  }

  enterFullscreen() {
  const elem = document.documentElement;
  const method =
    elem.requestFullscreen ||
    (elem as any).webkitRequestFullscreen ||
    (elem as any).msRequestFullscreen;

  if (method) {
    method.call(elem).catch(err => {
      console.warn('Le plein écran a été refusé :', err);
    });
  } else {
    console.warn('Fullscreen API non disponible sur ce navigateur.');
  }
  }


  async refreshSupabaseSession() {
    const { error } = await supabase.auth.refreshSession();
    if (error) {
      console.warn('[Supabase] Erreur refresh session :', error.message);
    } else {
      console.log('[Supabase] Session refresh réussie');
    }
  }


}
