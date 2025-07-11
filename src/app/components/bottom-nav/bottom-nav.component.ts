import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { UserContextService } from '../../core/context/user-context.service';
import { PlanetAvatarComponent } from "../planet-avatar/planet-avatar.component";
import { filter } from 'rxjs';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './bottom-nav.component.html',
  styleUrls: ['./bottom-nav.component.scss'],
})
export class BottomNavComponent {
  private user = inject(UserContextService);
  private router = inject(Router);

  readonly currentUrl = signal('');

  constructor() {
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(e => {
        this.currentUrl.set((e as NavigationEnd).urlAfterRedirects);
      });
  }

  readonly planetLink = computed(() => {
    const planet = this.user.planet();
    return planet ? `/planet/${planet.id}` : '/planet/unknown';
  });

  readonly isPlanetActive = computed(() =>
    this.currentUrl().startsWith('/planet')
  );

  readonly isGalleryActive = computed(() =>
    this.currentUrl().startsWith('/gallery')
  );

readonly isHomeActive = computed(() =>
  this.currentUrl().startsWith('/') &&
  !this.currentUrl().startsWith('/planet') &&
  !this.currentUrl().startsWith('/gallery')
);

  logout() {
    this.user.logout();
  }
}
