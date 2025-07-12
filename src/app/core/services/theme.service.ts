import {DOCUMENT, Inject, Injectable, Renderer2, RendererFactory2} from '@angular/core';

@Injectable({providedIn: 'root'})
export class ThemeService {
  private _renderer: Renderer2;

  constructor(
    @Inject(DOCUMENT) private readonly _document: Document,
    private readonly _rendererFactory: RendererFactory2,
  ) {
    this._renderer = this._rendererFactory.createRenderer(null, null);
  }

  public toggleTheme(): void {
    const currentTheme = this._document.body.classList.contains('light') ? 'light' : 'dark';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';

    this._renderer.removeClass(
      this._document.body,
      currentTheme
    );

    this._renderer.addClass(
      this._document.body,
      newTheme,
    );

    localStorage.setItem('theme', newTheme);
  }
}
