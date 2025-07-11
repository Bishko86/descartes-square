import {MenuItem} from '@core/interfaces/menu-item.interface';
import {MenuTitle} from '@core/enums/menu-title.enum';
import {MenuRoutes} from '@core/enums/menu-routes.enum';

export const MENU_ITEMS: MenuItem[] = [
  {
    name: MenuTitle.HOME,
    route: MenuRoutes.HOME,
  },
  {
    name: MenuTitle.DESCARTES_SQUARE,
    route: MenuRoutes.DESCARTES_SQUARE
  }
];
