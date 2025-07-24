import { Component, computed, inject, signal, OnInit, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { UserContextService } from '../../core/context/user-context.service';
import { PlanetAvatarComponent } from "../planet-avatar/planet-avatar.component";
import { PlanetContextService } from '../../core/context/planet-context.service';
import { FullscreenService } from '../../core/services/fullscreen.service';
import { filter } from 'rxjs';
import { RankService } from '../../core/services/rank.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './bottom-nav.component.html',
  styleUrls: ['./bottom-nav.component.scss'],
})
export class BottomNavComponent implements OnInit {
  private user = inject(UserContextService);
  private router = inject(Router);
  private fullscreenService = inject(FullscreenService);
  private planetContext = inject(PlanetContextService);
  private rankService = inject(RankService);

  readonly currentUrl = signal('');
  readonly userPlanet = computed(() => this.user.planet());
  readonly currentViewedPlanet = computed(() => this.planetContext.currentPlanet());
  readonly isReadonly = computed(() => this.planetContext.readonly());
  private destroyRef = inject(DestroyRef);

  constructor() {
    this.router.events
      .pipe(
        filter(e => e instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(e => {
        this.currentUrl.set((e as NavigationEnd).urlAfterRedirects);
      });
  }

  ngOnInit() {
    const planet = this.user.planet();
    if (planet) {
      this.rankService.calculateRank(planet.id);
    }
  }

  onClick() {
    this.fullscreenService.ensureFullscreen();
  }

  readonly planetLink = computed(() => {
    const planet = this.userPlanet();
    return planet ? `/planet/${planet.id}` : '/';
  });

  readonly isHomeActive = computed(() => {
    const url = this.currentUrl();
    if (this.isReadonly() && url.startsWith('/planet')) {
      return true;
    }
    return url === '/';
  });

  readonly isPlanetActive = computed(() => {
    const url = this.currentUrl();
    if (this.isReadonly()) {
      return false;
    }
    return url.startsWith('/planet') || (url.startsWith('/defi') && !this.isReadonly());
  });

  readonly isClassementActive = computed(() => {
    const url = this.currentUrl();
    return url.startsWith('/defi') && this.isReadonly();
  });

  readonly classementLink = computed(() => {
    const url = this.currentUrl();
    if (url.startsWith('/defi') && this.isReadonly()) {
      const planetId = this.router.url.split('/')[2];
      return `/planet/${planetId}/view`;
    }
    return '/';
  });

  readonly classementLabel = computed(() => {
    const url = this.currentUrl();
    if (url.startsWith('/defi') && this.isReadonly()) {
      return this.currentViewedPlanet()?.name;
    }

    const rank = this.rankService.planetRank();
    if (rank === null) {
      return 'Classement';
    }

    return this.formatRank(rank);
  });

  private formatRank(rank: number): string {
    if (rank === 1) {
      return '1<sup>er</sup>';
    }
    return `${rank}<sup>ème</sup>`;
  }

  readonly isGalleryActive = computed(() =>
    this.currentUrl().startsWith('/gallery')
  );

  logout() {
    this.user.logout();
    this.router.navigate(['/home']);
  }
}
