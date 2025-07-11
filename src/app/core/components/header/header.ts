import {Component} from '@angular/core';
import {MENU_ITEMS} from '@core/consts/menu-items.const';
import {RouterLink} from '@angular/router';
import {MenuItem} from '@core/interfaces/menu-item.interface';

@Component({
  selector: 'app-header',
  imports: [
    RouterLink
  ],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {
  public menuItems: MenuItem[] = MENU_ITEMS;
}
