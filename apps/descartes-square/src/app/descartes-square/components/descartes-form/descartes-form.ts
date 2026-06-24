import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  Injector,
  input,
  OnInit,
  signal,
  viewChildren,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgTemplateOutlet } from '@angular/common';
import { FormField } from '@angular/forms/signals';

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
import { QuadrantPreview } from './components/quadrant-preview/quadrant-preview';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';

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
  readonly #route = inject(ActivatedRoute);
  readonly #injector = inject(Injector);

  private readonly quadrantCards = viewChildren(QuadrantCard);

  readonly order = QUADRANT_ORDER;
  readonly shortLabels = DescartesQuestionShortLabels;
  readonly numbers = QUADRANT_NUMBER;
  readonly questions = DescartesQuestionsMap;
  readonly subtitles = DescartesQuestionSubtitles;

  readonly activeQuadrant = signal<DescartesQuestionsIds>(
    DescartesQuestionsIds.Q1,
  );
  readonly #previousQuadrant = signal<DescartesQuestionsIds>(
    DescartesQuestionsIds.Q1,
  );

  readonly isLoggedIn = computed(() => !!this.#authService.currentUser());

  readonly canSuggest = computed(
    () =>
      this.isLoggedIn() &&
      !this.suggestionsStore.isQuotaExhausted() &&
      !this.form.isLocked() &&
      !this.suggestionsStore.isStreaming(),
  );

  readonly suggestTooltip = computed(() => {
    if (!this.isLoggedIn()) {
      return $localize`:@@suggestAiLoggedOutTooltip:Log in to unlock AI suggestions and get 3–5 automated arguments for your decision.`;
    }
    if (this.suggestionsStore.isQuotaExhausted()) {
      return $localize`:@@suggestAiQuotaExhaustedTooltip:You've used all your free AI suggestions for today.`;
    }
    return '';
  });

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
      safetyBlocked: this.suggestionsStore.safetyBlocked()[id] ?? false,
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

  // Reset safety state whenever the title changes so the notice disappears
  // and the button re-enables after the user corrects their decision title.
  readonly #titleEffect = effect(() => {
    this.form.field.title().value();
    this.suggestionsStore.resetSafety();
  });

  ngOnInit(): void {
    this.form.init(this.id());
    this.#applyQuadrantQueryParam();
  }

  #applyQuadrantQueryParam(): void {
    const requested = this.#route.snapshot.queryParamMap.get('quadrant');
    if (!requested || !this.order.includes(requested as DescartesQuestionsIds))
      return;
    const quadrant = requested as DescartesQuestionsIds;
    this.activeQuadrant.set(quadrant);
    this.#previousQuadrant.set(quadrant);
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
    this.form.setArgument(quadrant, newIndex, text);
    this.form.saveDraft(false);
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

  onArgumentBlur(): void {
    this.form.saveDraft(false);
  }

  onActivate(id: DescartesQuestionsIds): void {
    this.activeQuadrant.set(id);
  }

  onConclude(): void {
    const invalid = this.form.reviewAndConclude();
    if (invalid) {
      this.#focusArgument(invalid.quadrant, invalid.index);
    }
  }

  // Desktop renders only the active quadrant, so switch to the offending one
  // first, then ask its card to focus the argument once it's in the DOM. The
  // grid + mobile layouts both render a card for the quadrant; focusing the
  // one in the hidden (display:none) layout is a no-op, so calling both is
  // safe and only the visible card actually takes focus.
  #focusArgument(quadrant: TFormNames, index: number): void {
    const target = quadrant as DescartesQuestionsIds;
    this.activeQuadrant.set(target);

    afterNextRender(
      () => {
        this.quadrantCards()
          .filter((card) => card.questionId() === target)
          .forEach((card) => card.focusArgument(index));
      },
      { injector: this.#injector },
    );
  }
}
