import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserContextService } from '../../../core/context/user-context.service';
import { DebugInfoComponent } from "../../../components/debug-info/debug-info.component";

@Component({
  selector: 'app-planet-confirmation',
  standalone: true,
  imports: [CommonModule, DebugInfoComponent],
  templateUrl: './planet-confirmation.component.html',
  styleUrls: ['./planet-confirmation.component.scss']
})
export class PlanetConfirmationComponent {
  planetName;

  constructor(
    public user: UserContextService,
    private router: Router
  ) {
    this.planetName = this.user.temporaryPlanetName() || this.user.planetName();
  }

  onConfirm() {
    if (this.user.userName()) {
      const planetId = this.user.planetId();
      if (planetId) {
        this.router.navigate(['/planet', planetId]);
      } else {
        this.router.navigate(['/auth/planet-selector']);
      }
    } else {
      this.router.navigate(['/auth/username-input']);
    }
  }

  onRefuse() {
    this.router.navigate(['/auth/planet-selector']);
  }
}
