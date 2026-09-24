import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButton } from '@angular/material/button';

import { MenuRoutes } from '@core/enums/menu-routes.enum';
import { DescartesQuestionsIds } from '@shared/src';
import { DescartesQuestionsMap } from '@shared/src/lib/consts/descartes-questions-map.const';

/**
 * The long read behind the home page's three-step summary — Layer 3 of #52.
 * Prose page, so the content lives in the template; the only logic here is the
 * same scroll-reveal the home page uses, applied per section.
 */
@Component({
  selector: 'app-method',
  imports: [RouterLink, MatButton],
  templateUrl: './method.html',
  styleUrl: './method.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Method implements AfterViewInit {
  @ViewChildren('animatedSection')
  sections: QueryList<ElementRef<HTMLElement>>;

  readonly createRoute = `/${MenuRoutes.DESCARTES_SQUARE}/create`;

  /**
   * The classic double-negative phrasings, reused from the shared map rather
   * than retyped — these are the exact questions the form asks.
   */
  readonly classicQuestions = [
    DescartesQuestionsIds.Q1,
    DescartesQuestionsIds.Q2,
    DescartesQuestionsIds.Q3,
    DescartesQuestionsIds.Q4,
  ].map((id) => DescartesQuestionsMap.get(id));

  readonly #destroyRef = inject(DestroyRef);

  ngAfterViewInit(): void {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    // Reduced motion: reveal every section immediately, no observer.
    if (prefersReducedMotion) {
      this.sections.forEach((section) =>
        section.nativeElement.classList.add('visible'),
      );
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 },
    );

    this.sections.forEach((section) => observer.observe(section.nativeElement));

    this.#destroyRef.onDestroy(() => observer.disconnect());
  }
}
