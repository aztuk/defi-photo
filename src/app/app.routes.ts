import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const appRoutes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
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
    path: 'admin',
    loadComponent: () => import('./features/admin/admin-page.component').then(m => m.AdminPageComponent),
  },
  {
    path: 'planet/:planetId',
    canActivate: [authGuard],
    loadComponent: () => import('./features/my-planet/my-planet.component').then(m => m.MyPlanetComponent),
  },
  {
  path: 'planet/:planetId/view',
  canActivate: [authGuard],
  loadComponent: () => import('./features/my-planet/my-planet.component').then(m => m.MyPlanetComponent),
},

  {
    path: 'gallery',
    canActivate: [authGuard],
    loadComponent: () => import('./features/gallery/gallery.component').then(m => m.GalleryComponent),
  },
  {
    path: 'history',
    canActivate: [authGuard],
    loadComponent: () => import('./features/history/history.component').then(m => m.HistoryComponent),
  }
];
