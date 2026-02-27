import { inject, Injectable, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { LangCode } from '@shared-ui/src/lib/lang-switch/definitions/enums/lang-code.enum';

@Injectable({ providedIn: 'root' })
export class LangService {
  readonly lang = signal<LangCode>(LangCode.EN);

  readonly #router = inject(Router);

  constructor() {
    this.#extractLang(this.#router.url);

    this.#router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => this.#extractLang(event.urlAfterRedirects));
  }

  buildRoute(...segments: string[]): string[] {
    return ['/', this.lang(), ...segments];
  }

  #extractLang(url: string): void {
    const localeCodes = Object.values(LangCode);
    const match = url.match(new RegExp(`^/(${localeCodes.join('|')})(/|$)`));

    if (match) {
      this.lang.set(match[1] as LangCode);
    }
  }
}
