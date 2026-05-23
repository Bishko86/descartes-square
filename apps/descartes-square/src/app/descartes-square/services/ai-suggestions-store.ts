import {
  computed,
  DestroyRef,
  inject,
  Injectable,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, of, take, tap } from 'rxjs';
import { AiSuggestionService } from '@descartes/services/ai-suggestion';
import { DescartesFormStore } from '@descartes/services/descartes-form-store';
import { TFormNames } from '@descartes/definitions/interfaces/descartes-form.interface';
import {
  DescartesQuestionsIds,
  IAiSuggestionRequest,
  IAiSuggestionResponse,
} from '@shared/src';
import { AI_SUGGESTION_COUNT_DEFAULT } from '@shared/src/lib/consts/ai-suggestion-limits.const';
import { Maybe } from '@shared/src/lib/types/maybe.type';

interface ISuggestionsMap {
  q1: string[];
  q2: string[];
  q3: string[];
  q4: string[];
}

@Injectable()
export class AiSuggestionsStore {
  readonly #api = inject(AiSuggestionService);
  readonly #formStore = inject(DescartesFormStore);
  readonly #destroyRef = inject(DestroyRef);

  readonly #suggestions = signal<ISuggestionsMap>({
    q1: [],
    q2: [],
    q3: [],
    q4: [],
  });
  readonly #streamingQuadrant = signal<Maybe<TFormNames>>(null);
  readonly #errorMessage = signal<Maybe<string>>(null);
  readonly #isQuotaExhausted = signal(false);

  readonly suggestions = this.#suggestions.asReadonly();
  readonly streamingQuadrant = this.#streamingQuadrant.asReadonly();
  readonly isQuotaExhausted = this.#isQuotaExhausted.asReadonly();

  readonly isStreaming = computed(() => !!this.#streamingQuadrant());

  request(quadrant: TFormNames): void {
    if (this.isStreaming()) return;

    this.#streamingQuadrant.set(quadrant);
    this.#errorMessage.set(undefined);

    const model = this.#formStore.model();
    const payload: IAiSuggestionRequest = {
      ...model,
      key: quadrant as DescartesQuestionsIds,
      count: AI_SUGGESTION_COUNT_DEFAULT,
      existing: model[quadrant],
    };

    this.#api
      .addAISuggestion(payload)
      .pipe(
        take(1),
        tap((response: IAiSuggestionResponse) =>
          this.#handleResponse(quadrant, response),
        ),
        catchError((error: HttpErrorResponse) => {
          this.#handleError(error);
          return of(null);
        }),
        takeUntilDestroyed(this.#destroyRef),
      )
      .subscribe();
  }

  dismiss(quadrant: TFormNames, index: number): void {
    this.#suggestions.update((map) => ({
      ...map,
      [quadrant]: map[quadrant].filter((_, i) => i !== index),
    }));
  }

  clear(quadrant: TFormNames): void {
    if (this.#suggestions()[quadrant].length === 0) return;
    this.#suggestions.update((map) => ({ ...map, [quadrant]: [] }));
  }

  dismissAll(): void {
    this.#suggestions.set({ q1: [], q2: [], q3: [], q4: [] });
  }

  #handleResponse(quadrant: TFormNames, response: IAiSuggestionResponse): void {
    this.#streamingQuadrant.set(null);

    if (response.isUnclearTitle) {
      this.#errorMessage.set(
        $localize`:@@unclearTitle:Please provide a clearer decision title before requesting suggestions.`,
      );
      return;
    }

    const fresh = (response.suggestions ?? [])
      .map((s) => s.trim())
      .filter(Boolean);
    if (!fresh.length) return;

    this.#suggestions.update((map) => ({
      ...map,
      [quadrant]: [...map[quadrant], ...fresh],
    }));
  }

  #handleError(error: HttpErrorResponse): void {
    this.#streamingQuadrant.set(undefined);

    // Quota exhausted — the button-state UI handles messaging via tooltip,
    // so we flip the flag silently and skip the generic toast.
    if (error.status === 429) {
      this.#isQuotaExhausted.set(true);
      return;
    }

    this.#errorMessage.set(
      error.error?.message ??
        $localize`:@@unknownError:Something went wrong. Please try again later`,
    );
  }
}
