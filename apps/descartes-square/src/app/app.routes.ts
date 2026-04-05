import { Routes } from '@angular/router';
import { MenuRoutes } from '@core/enums/menu-routes.enum';

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
    loadComponent: () => import('./auth/auth').then((mod) => mod.Auth),
  },
  {
    path: MenuRoutes.SIGN_UP,
    data: { isSignUp: true },
    loadComponent: () => import('./auth/auth').then((mod) => mod.Auth),
  },
  {
    path: MenuRoutes.AUTH_ERROR,
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
];
