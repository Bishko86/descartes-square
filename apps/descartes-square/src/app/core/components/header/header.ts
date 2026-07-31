import { A11yModule } from '@angular/cdk/a11y';
import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DOCUMENT,
  ElementRef,
  inject,
  Renderer2,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButton } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatTooltip } from '@angular/material/tooltip';
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
} from '@angular/router';
import { filter } from 'rxjs';

import { DescartesAuthService } from '@auth/services/descartes-auth.service';
import { Mark } from '@core/components/mark/mark';
import { MENU_ITEMS } from '@core/consts/menu-items.const';
import { MatIcon } from '@core/enums/mat-icon.enum';
import { MenuRoutes } from '@core/enums/menu-routes.enum';
import { MenuItem } from '@core/interfaces/menu-item.interface';
import { ThemeService } from '@core/services/theme.service';
import { LangSwitchComponent } from '@shared-ui/src';

/** Splits a username into words, so `anna.kovalenko` yields `AK`. */
const WORD_SEPARATORS = /[\s._-]+/;

const INITIALS_LENGTH = 2;

@Component({
  selector: 'app-header',
  imports: [
    A11yModule,
    NgTemplateOutlet,
    RouterLink,
    RouterLinkActive,
    MatButton,
    MatDivider,
    MatIconModule,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    MatTooltip,
    LangSwitchComponent,
    Mark,
  ],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    // Focus is trapped inside the panel while it is open, so a host-level
    // listener is enough to catch Escape from anywhere within it.
    '(keydown.escape)': 'closePanel()',
  },
})
export class Header {
  readonly menuItems: MenuItem[] = MENU_ITEMS;

  readonly homeRoute = `/${MenuRoutes.HOME}`;
  readonly signInRoute = `/${MenuRoutes.SIGN_IN}`;
  readonly signUpRoute = `/${MenuRoutes.SIGN_UP}`;
  readonly squaresRoute = `/${MenuRoutes.DESCARTES_SQUARE}`;

  readonly profileIcon = MatIcon.PROFILE;
  readonly chevronIcon = MatIcon.EXPAND_MORE;
  readonly menuIcon = MatIcon.MENU;
  readonly closeIcon = MatIcon.CLOSE;

  // Declared once and reused by both the desktop account menu and the mobile
  // panel, so the two presentations cannot drift apart.
  readonly mySquaresLabel = $localize`:@@header.mySquares:My squares`;
  readonly signOutLabel = $localize`:@@signOut:Sign Out`;
  readonly accountLabel = $localize`:@@header.accountMenu:Account menu`;
  readonly openMenuLabel = $localize`:@@header.openMenu:Open menu`;
  readonly closeMenuLabel = $localize`:@@header.closeMenu:Close menu`;

  readonly #themeService = inject(ThemeService);
  readonly #authService = inject(DescartesAuthService);
  readonly #document = inject(DOCUMENT);
  readonly #renderer = inject(Renderer2);
  readonly #router = inject(Router);

  readonly currentUser = this.#authService.currentUser;
  readonly isDark = this.#themeService.isDark;

  readonly panelOpen = signal(false);

  // TS-private rather than `#private`: Angular rejects ES-private signal
  // queries (NG1053).
  private readonly burgerRef =
    viewChild<ElementRef<HTMLButtonElement>>('burger');

  readonly themeIcon = computed(() =>
    this.isDark() ? MatIcon.LIGHT_MODE : MatIcon.DARK_MODE,
  );

  /** Doubles as tooltip and accessible name — translated, and never an emoji. */
  readonly themeLabel = computed(() =>
    this.isDark()
      ? $localize`:@@header.themeToLight:Switch to light theme`
      : $localize`:@@header.themeToDark:Switch to dark theme`,
  );

  /**
   * Avatar initials, from the username and falling back to the email local
   * part. Null when neither yields letters, in which case the template shows
   * the person icon instead.
   */
  readonly initials = computed(() => {
    const user = this.currentUser();

    if (!user) {
      return null;
    }

    const source = user.username?.trim() || user.email.split('@')[0];
    const words = source?.split(WORD_SEPARATORS).filter(Boolean) ?? [];

    if (!words.length) {
      return null;
    }

    const letters =
      words.length > 1
        ? `${words[0][0]}${words[1][0]}`
        : words[0].slice(0, INITIALS_LENGTH);

    return letters.toUpperCase();
  });

  constructor() {
    // Navigating from inside the panel dismisses it, so links don't each need
    // their own close handler.
    this.#router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.closePanel());
  }

  togglePanel(): void {
    if (this.panelOpen()) {
      this.closePanel();
      return;
    }

    this.panelOpen.set(true);
    this.#lockBodyScroll(true);
  }

  closePanel(): void {
    if (!this.panelOpen()) {
      return;
    }

    this.panelOpen.set(false);
    this.#lockBodyScroll(false);
    // Focus came from the trigger, so that is where it returns.
    this.burgerRef()?.nativeElement.focus();
  }

  changeTheme(): void {
    this.#themeService.toggleTheme();
  }

  signOut(): void {
    this.closePanel();
    this.#authService.signOut().subscribe();
  }

  #lockBodyScroll(locked: boolean): void {
    const body = this.#document.body;

    if (locked) {
      this.#renderer.setStyle(body, 'overflow', 'hidden');
    } else {
      this.#renderer.removeStyle(body, 'overflow');
    }
  }
}
