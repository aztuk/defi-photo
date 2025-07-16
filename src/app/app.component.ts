import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { UserContextService } from './core/context/user-context.service';
import { BottomNavComponent } from "./components/bottom-nav/bottom-nav.component";
import { ThemeService } from './core/services/theme.service';
import { filter } from 'rxjs';
import { NotificationComponent } from './components/notification/notification.component';
import { FullscreenService } from './core/services/fullscreen.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, BottomNavComponent, CommonModule, NotificationComponent],
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
})
export class AppComponent {
  currentUrl = signal('');

// app.component.ts
constructor(
  public router: Router,
  public theme: ThemeService,
  private user: UserContextService,
  private fullscreenService: FullscreenService
) {
  this.router.events
    .pipe(filter(e => e instanceof NavigationEnd))
    .subscribe(() => {
      this.theme.initGlobalTheme(); // <-- ici
      this.currentUrl.set(this.router.url);
      this.fullscreenService.ensureFullscreen();
    });
}

ngOnInit(): void {
  if (this.user.isLoggedIn()) {
    this.fullscreenService.ensureFullscreen();
  }
}

  // ✅ computed pour que ça se mette à jour
  readonly shouldShowBottomNav = computed(() => {
    const url = this.currentUrl();
    return !url.startsWith('/login') && !url.startsWith('/auth');
  });

}
