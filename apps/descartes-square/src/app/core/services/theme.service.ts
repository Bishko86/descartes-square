import {
  DOCUMENT,
  inject,
  Injectable,
  Renderer2,
  RendererFactory2,
} from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly #document: Document = inject(DOCUMENT);
  readonly #rendererFactory: RendererFactory2 = inject(RendererFactory2);
  readonly #renderer: Renderer2 = this.#rendererFactory.createRenderer(
    null,
    null,
  );

  public toggleTheme(): void {
    const currentTheme = this.#document.body.classList.contains('light')
      ? 'light'
      : 'dark';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';

    this.#renderer.removeClass(this.#document.body, currentTheme);

    this.#renderer.addClass(this.#document.body, newTheme);

    localStorage.setItem('theme', newTheme);
  }
}
