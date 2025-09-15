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
    this.currentLanguage.set(languageCode);
    localStorage.setItem('language', languageCode);
  }

  #setLangFromLocaleStorage(): void {
    const savedLanguage = localStorage.getItem('language');

    if (savedLanguage) {
      this.currentLanguage.set(savedLanguage as LangCode);
    }
  }
}
