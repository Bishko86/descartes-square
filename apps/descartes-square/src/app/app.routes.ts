import { Routes } from '@angular/router';
import { MenuRoutes } from '@core/enums/menu-routes.enum';
import { guestGuard } from '@core/guards/guest.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: MenuRoutes.DESCARTES_SQUARE,
    loadComponent: () =>
      import(
        './descartes-square/components/descartes-square/descartes-square'
      ).then((mod) => mod.DescartesSquare),
    children: [
      {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full',
      },
      {
        path: 'create',
        loadComponent: () =>
          import(
            './descartes-square/components/descartes-form/descartes-form'
          ).then((mod) => mod.DescartesForm),
      },
      {
        path: 'list',
        loadComponent: () =>
          import(
            './descartes-square/components/descartes-list/descartes-list'
          ).then((mod) => mod.DescartesList),
      },
      {
        path: 'list/:id/details',
        loadComponent: () =>
          import(
            './descartes-square/components/descartes-details/descartes-details'
          ).then((mod) => mod.DescartesDetails),
      },
      {
        path: 'list/:id/edit',
        loadComponent: () =>
          import(
            './descartes-square/components/descartes-form/descartes-form'
          ).then((mod) => mod.DescartesForm),
      },
    ],
  },
  {
    path: MenuRoutes.HOME,
    loadComponent: () => import('./home/home/home').then((mod) => mod.Home),
  },
  {
    path: MenuRoutes.SIGN_IN,
    canActivate: [guestGuard],
    loadComponent: () => import('./auth/auth').then((mod) => mod.Auth),
  },
  {
    path: MenuRoutes.SIGN_UP,
    canActivate: [guestGuard],
    data: { isSignUp: true },
    loadComponent: () => import('./auth/auth').then((mod) => mod.Auth),
  },
  {
    path: MenuRoutes.AUTH_ERROR,
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./auth/auth-error/auth-error').then((mod) => mod.AuthError),
  },
  {
    path: MenuRoutes.VERIFY_EMAIL,
    loadComponent: () =>
      import('./auth/verify-email/verify-email.component').then(
        (mod) => mod.VerifyEmailComponent,
      ),
  },
  {
    path: MenuRoutes.FORGOT_PASSWORD,
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./auth/forgot-password/forgot-password.component').then(
        (mod) => mod.ForgotPasswordComponent,
      ),
  },
  {
    path: MenuRoutes.RESET_PASSWORD,
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./auth/reset-password/reset-password.component').then(
        (mod) => mod.ResetPasswordComponent,
      ),
  },
];
