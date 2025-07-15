// core/guards/secure-context.guard.ts
import { CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { inject } from '@angular/core';
import { UserContextService } from '../context/user-context.service';
import { AppContextInitializerService } from '../context/app-context-initializer.service';

export const secureContextGuard: CanActivateFn = async (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Promise<boolean | UrlTree> => {
  const userService = inject(UserContextService);
  const router = inject(Router);
  const appContext = inject(AppContextInitializerService);

  if (!userService.isLoggedIn()) {
    return router.createUrlTree(['/login'], {
      queryParams: { returnUrl: state.url }
    });
  }

  const missionId = route.paramMap.get('id');
  const planetId = route.paramMap.get('planetId');

  if (planetId) {
    await appContext.initFromPlanetId(planetId);
  } else if (missionId) {
    await appContext.initFromMissionId(missionId);
  } else {
    await appContext.fromSession();
  }

  return true;
};
