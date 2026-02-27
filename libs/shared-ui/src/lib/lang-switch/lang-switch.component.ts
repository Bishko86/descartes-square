import {
  ChangeDetectionStrategy,
  Component,
  isDevMode,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { LangOptionsMap } from './definitions/consts/lang-options.const';
import { LangCode } from './definitions/enums/lang-code.enum';

@Component({
  selector: 'lib-lang-switch',
  imports: [CommonModule],
  templateUrl: './lang-switch.component.html',
  styleUrl: './lang-switch.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LangSwitchComponent {
  languages = Array.from(LangOptionsMap.values());

  languageMap = LangOptionsMap;

  currentLanguage = signal(LangCode.EN);

  constructor() {
    this.#detectCurrentLanguage();
  }

  switchLanguage(languageCode: LangCode): void {
    //@ts-ignore
    console.log(languageCode);
    if (languageCode === this.currentLanguage()) {
      return;
    }

    if (isDevMode()) {
      this.currentLanguage.set(languageCode);
      return;
    }

    window.location.href = this.#buildTargetUrl(languageCode);
  }

  #detectCurrentLanguage(): void {
    if (isDevMode()) {
      return;
    }

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
