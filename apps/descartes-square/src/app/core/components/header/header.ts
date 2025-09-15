import { Component, inject, OnInit, WritableSignal } from '@angular/core';
import { MENU_ITEMS } from '@core/consts/menu-items.const';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MenuItem } from '@core/interfaces/menu-item.interface';
import { ThemeService } from '@core/services/theme.service';
import { MatButton } from '@angular/material/button';
import { DescartesAuthService } from '@auth/services/descartes-auth.service';
import { take } from 'rxjs';
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
export class Header implements OnInit {
  menuItems: MenuItem[] = MENU_ITEMS;
  userIcon = MatIcon.PROFILE;
  currentUser: WritableSignal<Maybe<IUserDto>>;

  readonly #themeService = inject(ThemeService);
  readonly #authService = inject(DescartesAuthService);

  ngOnInit(): void {
    this.#getCurrUser();
    this.#setCurrUser();
  }

  changeTheme(): void {
    this.#themeService.toggleTheme();
  }

  signOut(): void {
    this.#authService.signOut().pipe(take(1)).subscribe();
  }

  #getCurrUser(): void {
    this.#authService.getCurrentUser().pipe(take(1)).subscribe();
  }

  #setCurrUser(): void {
    this.currentUser = this.#authService.currentUser;
  }
}
