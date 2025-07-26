import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { LoginComponent } from './features/auth/login.component';
import { PlanetConfirmationComponent } from './features/auth/planet-confirmation/planet-confirmation.component';
import { PlanetSelectorComponent } from './features/auth/planet-selector/planet-selector.component';
import { UsernameInputComponent } from './features/auth/username-input/username-input.component';
import { WelcomeComponent } from './features/auth/welcome/welcome.component';
import { secureContextGuard } from './core/guards/app-context.guard';

export const appRoutes: Routes = [
  {
    path: '',
    canActivate: [authGuard, ],
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'home',
    canActivate: [authGuard],
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent),
  },
  {
  path: 'auth',
  children: [
    { path: '', component: LoginComponent },
    { path: 'planet-confirmation', component: PlanetConfirmationComponent },
    { path: 'planet-selector', component: PlanetSelectorComponent },
    { path: 'username-input', component: UsernameInputComponent },
    { path: 'welcome', component: WelcomeComponent },
  ]
}
,
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin-page.component').then(m => m.AdminPageComponent),
  },
  {
    path: 'planet/:planetId',
  canActivate: [authGuard, secureContextGuard],
    loadComponent: () => import('./features/my-planet/my-planet.component').then(m => m.MyPlanetComponent),
  },
  {
  path: 'planet/:planetId/view',
  canActivate: [authGuard, secureContextGuard],
  loadComponent: () => import('./features/my-planet/my-planet.component').then(m => m.MyPlanetComponent),
},
{
  path: 'test-access',
  loadComponent: () => import('./features/test-access/test-access.component').then(m => m.TestAccessComponent),
},
{
  path: 'test-timestamp',
  loadComponent: () => import('./features/test-access/test-timestamp.component').then(m => m.TestTimestampComponent),
},

  {
    path: 'gallery',
    canActivate: [authGuard],
    loadComponent: () => import('./features/gallery/gallery.component').then(m => m.GalleryComponent),
  },
  {
    path: 'upload',
    canActivate: [authGuard],
    loadComponent: () => import('./features/upload/upload.component').then(m => m.UploadComponent),
  },
  {
    path: 'defi/:planetId/:id',
  canActivate: [authGuard, secureContextGuard],
  loadComponent: () => import('./features/defi/defi.component').then(m => m.DefiComponent)
  },
  {
    path: 'projection',
    loadComponent: () => import('./features/projection/components/projection-screen/projection-screen.component').then(m => m.ProjectionScreenComponent)
  }
];
