import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgTemplateOutlet } from '@angular/common';
import { FormField } from '@angular/forms/signals';
import { interval, take, tap } from 'rxjs';

import { DescartesAuthService } from '@auth/services/descartes-auth.service';
import { AiSuggestionService } from '@descartes/services/ai-suggestion';
import { AiSuggestionsStore } from '@descartes/services/ai-suggestions-store';
import { DescartesFormStore } from '@descartes/services/descartes-form-store';
import { DescartesQuestionShortLabels } from '@descartes/definitions/consts/descartes-question-short-labels.const';
import { DescartesQuestionSubtitles } from '@descartes/definitions/consts/descartes-question-subtitles.const';
import {
  QUADRANT_NUMBER,
  QUADRANT_ORDER,
} from '@descartes/definitions/consts/quadrant-order.const';
import { TFormNames } from '@descartes/definitions/interfaces/descartes-form.interface';
import { DescartesQuestionsIds } from '@shared/src';
import { DescartesQuestionsMap } from '@shared/src/lib/consts/descartes-questions-map.const';

import { LockOverlay } from './components/lock-overlay/lock-overlay';
import { ProgressPill } from './components/progress-pill/progress-pill';
import { QuadrantCard } from './components/quadrant-card/quadrant-card';
import { QuadrantChips } from './components/quadrant-chips/quadrant-chips';
import { QuadrantPreview } from './components/quadrant-preview/quadrant-preview';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';

const TYPING_INTERVAL_MS = 12;
const ARROW_KEYS = new Set(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown']);

@Component({
  selector: 'app-descartes-form',
  imports: [
    NgTemplateOutlet,
    FormField,
    MatButtonModule,
    MatSnackBarModule,
    LockOverlay,
    ProgressPill,
    QuadrantCard,
    QuadrantChips,
    QuadrantPreview,
  ],
  providers: [DescartesFormStore, AiSuggestionsStore, AiSuggestionService],
  templateUrl: './descartes-form.html',
  styleUrl: './descartes-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'descartes-form',
    '(keydown)': 'onKeyDown($event)',
  },
})
export class DescartesForm implements OnInit {
  readonly id = input<string>();

  readonly form = inject(DescartesFormStore);
  readonly suggestionsStore = inject(AiSuggestionsStore);

  readonly #authService = inject(DescartesAuthService);
  readonly #destroyRef = inject(DestroyRef);

  readonly order = QUADRANT_ORDER;
  readonly shortLabels = DescartesQuestionShortLabels;
  readonly numbers = QUADRANT_NUMBER;

  readonly activeQuadrant = signal<DescartesQuestionsIds>(
    DescartesQuestionsIds.Q1,
  );
  readonly #previousQuadrant = signal<DescartesQuestionsIds>(
    DescartesQuestionsIds.Q1,
  );

  readonly canSuggest = computed(
    () =>
      !!this.#authService.currentUser() &&
      !this.form.isLocked() &&
      !this.suggestionsStore.isStreaming(),
  );

  readonly activeContext = computed(() => {
    const id = this.activeQuadrant();
    return {
      id,
      number: (QUADRANT_NUMBER.get(id) ?? 1) as 1 | 2 | 3 | 4,
      question: DescartesQuestionsMap.get(id) ?? '',
      subtitle: DescartesQuestionSubtitles.get(id) ?? '',
      items: this.form.model()[id],
      suggestions: this.suggestionsStore.suggestions()[id],
      isStreaming: this.suggestionsStore.streamingQuadrant() === id,
    };
  });

  // Suggestions are scoped to the quadrant that produced them — drop them
  // when the user moves on so they don't reappear on return.
  readonly #syncEffect = effect(() => {
    const current = this.activeQuadrant();
    const previous = this.#previousQuadrant();
    if (previous === current) return;
    this.suggestionsStore.clear(previous);
    this.#previousQuadrant.set(current);
  });

  ngOnInit(): void {
    this.form.init(this.id());
  }

  onKeyDown(event: KeyboardEvent): void {
    if (!ARROW_KEYS.has(event.key) || this.form.isLocked()) return;

    const target = event.target as HTMLElement;
    if (
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement
    ) {
      return;
    }

    event.preventDefault();
    const delta =
      event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : -1;
    const idx = this.order.indexOf(this.activeQuadrant());
    const next =
      this.order[(idx + delta + this.order.length) % this.order.length];
    this.activeQuadrant.set(next);
  }

  onRequestSuggestion(quadrant: TFormNames): void {
    this.suggestionsStore.request(quadrant);
  }

  onDismissSuggestion(quadrant: TFormNames, index: number): void {
    this.suggestionsStore.dismiss(quadrant, index);
  }

  onAcceptSuggestion(
    quadrant: TFormNames,
    text: string,
    suggestionIndex: number,
  ): void {
    const newIndex = this.form.addArgument(quadrant, '');
    this.suggestionsStore.dismiss(quadrant, suggestionIndex);
    this.#animateTyping(quadrant, newIndex, text);
  }

  onArgumentChange(quadrant: TFormNames, index: number, value: string): void {
    this.form.setArgument(quadrant, index, value);
  }

  onArgumentAdd(quadrant: TFormNames): void {
    this.form.addArgument(quadrant);
  }

  onArgumentRemove(quadrant: TFormNames, index: number): void {
    this.form.removeArgument(quadrant, index);
  }

  onArgumentReorder(quadrant: TFormNames, from: number, to: number): void {
    this.form.reorderArgument(quadrant, from, to);
  }

  onActivate(id: DescartesQuestionsIds): void {
    this.activeQuadrant.set(id);
  }

  #animateTyping(quadrant: TFormNames, index: number, text: string): void {
    if (!text) return;
    interval(TYPING_INTERVAL_MS)
      .pipe(
        take(text.length),
        tap((i) =>
          this.form.setArgument(quadrant, index, text.substring(0, i + 1)),
        ),
        takeUntilDestroyed(this.#destroyRef),
      )
      .subscribe();
  }
}
