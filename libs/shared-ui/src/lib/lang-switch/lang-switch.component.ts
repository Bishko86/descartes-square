import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
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
    this.#setLangFromLocaleStorage();
  }

  switchLanguage(languageCode: LangCode): void {
    if (languageCode === this.currentLanguage()) {
      return;
    }

    this.currentLanguage.set(languageCode);
    localStorage.setItem('language', languageCode);

    // Build the target URL
    const targetUrl = this.#buildTargetUrl(languageCode);

    console.log(targetUrl)

    // Redirect to the appropriate build
    // window.location.href = targetUrl;
  }

  #setLangFromLocaleStorage(): void {
    const savedLanguage = localStorage.getItem('language');

    if (savedLanguage) {
      this.currentLanguage.set(savedLanguage as LangCode);
    }
  }

  #buildTargetUrl(languageCode: LangCode): string {
    const currentUrl = window.location;

    console.log(currentUrl)
    const { protocol, host, pathname, search, hash } = currentUrl;

    // Remove current locale from path if present
    const pathWithoutLocale = this.#removeLocaleFromPath(pathname);

    // Build new path with target locale
    let newPath = pathWithoutLocale;
    if (languageCode !== LangCode.EN) {
      newPath = `/${languageCode}${pathWithoutLocale}`;
    }

    // Ensure path starts with /
    if (!newPath.startsWith('/')) {
      newPath = '/' + newPath;
    }

    return `${protocol}//${host}${newPath}${search}${hash}`;
  }

  #removeLocaleFromPath(pathname: string): string {
    // Remove locale codes from the beginning of the path
    // This handles cases like /uk/some/path or /en/some/path
    const localePattern = new RegExp(
      `^/(${Object.values(LangCode).join('|')})(\/|$)`,
    );
    return pathname.replace(localePattern, '/').replace(/\/+/g, '/');
  }
}
