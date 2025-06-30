import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { UserContextService } from './core/context/user-context.service';
import { BottomNavComponent } from "./components/bottom-nav/bottom-nav.component";
import { ThemeService } from './core/services/theme.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, BottomNavComponent, CommonModule],
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
})
export class AppComponent {
  currentUrl = signal('');

  constructor(public router: Router, public theme: ThemeService,
  private user: UserContextService) {
    // ✅ À la fin de chaque navigation, on met à jour l'URL courante
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(e => {
        this.currentUrl.set((e as NavigationEnd).urlAfterRedirects);
      });

  }
ngOnInit(): void {
  if (this.user.isLoggedIn()) {
    const name = this.user.planetName();
    this.theme.setTheme(name);
  }
}

  // ✅ computed pour que ça se mette à jour
  readonly shouldShowBottomNav = computed(() =>
    !this.currentUrl().startsWith('/login')
  );

}
