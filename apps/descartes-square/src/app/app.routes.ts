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
      import('./descartes-square/descartes-square/descartes-square').then(
        (mod) => mod.DescartesSquare,
      ),
    children: [
      {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full',
      },
      {
        path: 'create',
        loadComponent: () =>
          import('./descartes-square/descartes-form/descartes-form').then(
            (mod) => mod.DescartesForm,
          ),
      },
      {
        path: 'list',
        loadComponent: () =>
          import('./descartes-square/descartes-list/descartes-list').then(
            (mod) => mod.DescartesList,
          ),
      },
      {
        path: 'list/:id/details',
        loadComponent: () =>
          import('./descartes-square/descartes-details/descartes-details').then(
            (mod) => mod.DescartesDetails,
          ),
      },
      {
        path: 'list/:id/edit',
        loadComponent: () =>
          import('./descartes-square/descartes-form/descartes-form').then(
            (mod) => mod.DescartesForm,
          ),
      },
    ],
  },
  {
    path: MenuRoutes.HOME,
    loadComponent: () => import('./home/home/home').then((mod) => mod.Home),
  },
];
