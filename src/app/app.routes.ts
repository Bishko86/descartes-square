import {Routes} from '@angular/router';
import {MenuRoutes} from '@core/enums/menu-routes.enum';

export const routes: Routes = [{path: '', redirectTo: 'home', pathMatch: 'full'}, {
  path: MenuRoutes.DESCARTES_SQUARE,
  loadComponent: () => import('./descartes-square/descartes-square/descartes-square').then((mod) => mod.DescartesSquare),
  children: [{
    path: 'create',
    loadComponent: () => import('./descartes-square/descartes-form/descartes-form').then((mod) => mod.DescartesForm)
  },]
}, {
  path: MenuRoutes.HOME,
  loadComponent: () => import('./home/home/home').then((mod) => mod.Home)
}];
