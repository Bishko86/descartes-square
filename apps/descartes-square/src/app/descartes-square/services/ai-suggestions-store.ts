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
import { IAiSuggestionResponse } from '@shared/src';
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
  readonly #streamingQuadrant = signal<Maybe<TFormNames>>(undefined);
  readonly #errorMessage = signal<Maybe<string>>(undefined);

  readonly suggestions = this.#suggestions.asReadonly();
  readonly streamingQuadrant = this.#streamingQuadrant.asReadonly();
  readonly errorMessage = this.#errorMessage.asReadonly();

  readonly isStreaming = computed(() => !!this.#streamingQuadrant());

  suggestionsFor(quadrant: TFormNames) {
    return computed(() => this.#suggestions()[quadrant]);
  }

  isStreamingFor(quadrant: TFormNames) {
    return computed(() => this.#streamingQuadrant() === quadrant);
  }

  request(quadrant: TFormNames): void {
    if (this.isStreaming()) return;

    this.#streamingQuadrant.set(quadrant);
    this.#errorMessage.set(undefined);

    // TODO(#55): fan out to 3 parallel calls and client-side dedupe once the
    // backend returns a single batch of N suggestions.
    this.#api
      .addAISuggestion({ ...this.#formStore.model(), key: quadrant } as never)
      .pipe(
        take(1),
        tap((response: IAiSuggestionResponse) =>
          this.#handleResponse(quadrant, response),
        ),
        catchError((error: HttpErrorResponse) => {
          this.#errorMessage.set(
            error.error?.message ??
              $localize`:@@unknownError:Something went wrong. Please try again later`,
          );
          this.#streamingQuadrant.set(undefined);
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
    this.#streamingQuadrant.set(undefined);

    if (response.isUnclearTitle) {
      this.#errorMessage.set(
        $localize`:@@unclearTitle:Please provide a clearer decision title before requesting suggestions.`,
      );
      return;
    }

    const text = response.suggestion?.trim();
    if (!text) return;

    this.#suggestions.update((map) => ({
      ...map,
      [quadrant]: [...map[quadrant], text],
    }));
  }
}
