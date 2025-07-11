import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserContextService } from '../../../core/context/user-context.service';

@Component({
  selector: 'app-planet-confirmation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './planet-confirmation.component.html',
  styleUrls: ['./planet-confirmation.component.scss']
})
export class PlanetConfirmationComponent {
  planetName;

  constructor(
    private user: UserContextService,
    private router: Router
  ) {
    this.planetName = this.user.planetName();
  }

  onConfirm() {
    // Si l'utilisateur a déjà une session (cas 1), on confirme son nom.
    // Sinon (cas 2), on lui demande de saisir un nom.
    if (this.user.isLoggedIn()) {
      this.router.navigate(['/auth/username-confirmation']);
    } else {
      this.router.navigate(['/auth/username-input']);
    }
  }

  onRefuse() {
    this.router.navigate(['/auth/planet-selector']);
  }
}
