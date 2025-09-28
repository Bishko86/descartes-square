import { MenuItem } from '@core/interfaces/menu-item.interface';
import { MenuRoutes } from '@core/enums/menu-routes.enum';

export const MENU_ITEMS: MenuItem[] = [
  {
    name: $localize`:@@home:Home`,
    route: MenuRoutes.HOME,
  },
  {
    name: $localize`:@@descartesSquare:Descartes Square`,
    route: MenuRoutes.DESCARTES_SQUARE,
  },
];
