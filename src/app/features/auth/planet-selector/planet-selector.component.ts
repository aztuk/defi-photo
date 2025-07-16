import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlanetService } from '../../../core/services/planet.service';
import { PlanetAvatarComponent } from '../../../components/planet-avatar/planet-avatar.component';
import { Planet } from '../../../core/interfaces/interfaces.models';
import { Router } from '@angular/router';
import { UserContextService } from '../../../core/context/user-context.service';
import { ScrollHeaderComponent } from "../../../components/scroll-header/scroll-header.component";
import { DebugInfoComponent } from "../../../components/debug-info/debug-info.component";

@Component({
  selector: 'app-planet-selector',
  standalone: true,
  imports: [CommonModule, PlanetAvatarComponent],
  styleUrl: './planet-selector.component.scss',
  templateUrl: './planet-selector.component.html',
})
export class PlanetSelectorComponent implements OnInit {
  planets: Planet[] = [];

  constructor(
    private planetService: PlanetService,
    private user: UserContextService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.planets = this.planetService.getAll();
  }

  onSelect(p: Planet) {
    this.user.setTemporaryPlanet(p.name); // ✅ planète temporaire stockée
    // Si un nom d'utilisateur existe déjà (cas 1), on demande confirmation.
    // Sinon, on demande une saisie.
    this.router.navigate(['/auth/username-input']);
  }
}
