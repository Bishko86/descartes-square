import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { DescartesAuthService } from '@auth/services/descartes-auth.service';
import { MenuRoutes } from '@core/enums/menu-routes.enum';

/**
 * Prevents logged-in users from accessing guest-only pages (sign-in, sign-up, etc.).
 * Redirects to /home if already authenticated.
 * Relies on currentUser signal being populated by APP_INITIALIZER on app start.
 */
export const guestGuard: CanActivateFn = () => {
  const authService = inject(DescartesAuthService);
  const router = inject(Router);

  return authService.currentUser()
    ? router.createUrlTree([MenuRoutes.HOME])
    : true;
};
