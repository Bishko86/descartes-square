import {
  computed,
  DOCUMENT,
  inject,
  Injectable,
  Renderer2,
  RendererFactory2,
  signal,
} from '@angular/core';

type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly #document: Document = inject(DOCUMENT);
  readonly #rendererFactory: RendererFactory2 = inject(RendererFactory2);
  readonly #renderer: Renderer2 = this.#rendererFactory.createRenderer(
    null,
    null,
  );

  /**
   * Seeded from the class the inline script in index.html has already applied,
   * so the signal agrees with the DOM on the very first read.
   */
  readonly #theme = signal<Theme>(this.#readThemeFromDom());

  readonly theme = this.#theme.asReadonly();

  /** Lets components bind to the active theme — e.g. a crescent/sun toggle. */
  readonly isDark = computed(() => this.#theme() === 'dark');

  public toggleTheme(): void {
    const root = this.#document.documentElement;
    const currentTheme = this.#readThemeFromDom();
    const newTheme: Theme = currentTheme === 'light' ? 'dark' : 'light';

    this.#renderer.removeClass(root, currentTheme);
    this.#renderer.addClass(root, newTheme);
    this.#theme.set(newTheme);

    localStorage.setItem('theme', newTheme);
  }

  #readThemeFromDom(): Theme {
    return this.#document.documentElement.classList.contains('light')
      ? 'light'
      : 'dark';
  }
}
