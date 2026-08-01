import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';

import { LangOptionsMap } from './definitions/consts/lang-options.const';
import { LangCode } from './definitions/enums/lang-code.enum';

/**
 * Locale switcher, rendered as a bordered `EN ⌄` pill.
 *
 * Presentation is a MatMenu rather than the previous CSS `:hover` dropdown: the
 * panel could not be opened from the keyboard at all, so the control was
 * unreachable without a pointer.
 *
 * Switching locale is a full page load by design — every locale is a separate
 * Angular i18n build served under its own path prefix, so there is no
 * client-side route to navigate to.
 */
@Component({
  selector: 'lib-lang-switch',
  imports: [MatMenu, MatMenuItem, MatMenuTrigger, MatIconModule],
  templateUrl: './lang-switch.component.html',
  styleUrl: './lang-switch.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LangSwitchComponent {
  languages = Array.from(LangOptionsMap.values());

  languageMap = LangOptionsMap;

  currentLanguage = signal(LangCode.EN);

  /** Locale code shown on the pill, e.g. `EN`. */
  readonly currentLabel = computed(() => this.currentLanguage().toUpperCase());

  constructor() {
    this.#detectCurrentLanguage();
  }

  switchLanguage(languageCode: LangCode): void {
    if (languageCode === this.currentLanguage()) {
      return;
    }

    this.currentLanguage.set(languageCode);
    window.location.href = this.#buildTargetUrl(languageCode);
  }

  #detectCurrentLanguage(): void {
    const localeFromPath = this.#extractLocaleFromPath(
      window.location.pathname,
    );

    if (localeFromPath) {
      this.currentLanguage.set(localeFromPath);
    }
  }

  #extractLocaleFromPath(pathname: string): LangCode | null {
    const localeCodes = Object.values(LangCode);
    const match = pathname.match(
      new RegExp(`^/(${localeCodes.join('|')})(/|$)`),
    );

    return match ? (match[1] as LangCode) : null;
  }

  #buildTargetUrl(languageCode: LangCode): string {
    const { protocol, host, pathname, search, hash } = window.location;
    const pathWithoutLocale = this.#removeLocaleFromPath(pathname);
    const newPath = `/${languageCode}${pathWithoutLocale}`;

    return `${protocol}//${host}${newPath}${search}${hash}`;
  }

  #removeLocaleFromPath(pathname: string): string {
    const localePattern = new RegExp(
      `^/(${Object.values(LangCode).join('|')})(/|$)`,
    );

    return pathname.replace(localePattern, '/').replace(/\/+/g, '/');
  }
}
