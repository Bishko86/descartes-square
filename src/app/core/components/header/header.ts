import {Component, inject} from '@angular/core';
import {MENU_ITEMS} from '@core/consts/menu-items.const';
import {RouterLink, RouterLinkActive} from '@angular/router';
import {MenuItem} from '@core/interfaces/menu-item.interface';
import {ThemeService} from '@core/services/theme.service';
import {MatButton} from '@angular/material/button';

@Component({
  selector: 'app-header',
  imports: [
    RouterLink,
    RouterLinkActive,
    MatButton,
  ],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {
  public menuItems: MenuItem[] = MENU_ITEMS;

  private readonly _themeService = inject(ThemeService);

  public changeTheme(): void {
    this._themeService.toggleTheme();
  }
}
