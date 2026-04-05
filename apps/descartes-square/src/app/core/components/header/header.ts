import {
  Component,
  inject,
  isDevMode,
  WritableSignal,
} from '@angular/core';
import { MENU_ITEMS } from '@core/consts/menu-items.const';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MenuItem } from '@core/interfaces/menu-item.interface';
import { ThemeService } from '@core/services/theme.service';
import { MatButton } from '@angular/material/button';
import { DescartesAuthService } from '@auth/services/descartes-auth.service';
import { IUserDto, Maybe } from '@shared/src';
import { MatIconModule } from '@angular/material/icon';
import { MatIcon } from '@core/enums/mat-icon.enum';
import { LangSwitchComponent } from '@shared-ui/src';

@Component({
  selector: 'app-header',
  imports: [
    RouterLink,
    RouterLinkActive,
    MatButton,
    MatIconModule,
    LangSwitchComponent,
  ],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  menuItems: MenuItem[] = MENU_ITEMS;
  userIcon = MatIcon.PROFILE;
  isDevMode = isDevMode();

  readonly #themeService = inject(ThemeService);
  readonly #authService = inject(DescartesAuthService);

  readonly currentUser: WritableSignal<Maybe<IUserDto>> =
    this.#authService.currentUser;

  changeTheme(): void {
    this.#themeService.toggleTheme();
  }

  signOut(): void {
    this.#authService.signOut().subscribe();
  }
}
