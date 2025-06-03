import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { UserContextService } from '../context/user-context.service';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree => {
  const userService = inject(UserContextService);
  const router = inject(Router);

  if (userService.isLoggedIn()) {
    return true;
  }

  // Redirige vers login en passant l'URL demandée en query param `returnUrl`
  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url }
  });
};
