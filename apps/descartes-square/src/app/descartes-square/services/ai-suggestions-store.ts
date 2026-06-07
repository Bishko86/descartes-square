import {
  computed,
  DestroyRef,
  inject,
  Injectable,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, of, take, tap } from 'rxjs';
import { AiSuggestionService } from '@descartes/services/ai-suggestion';
import { DescartesFormStore } from '@descartes/services/descartes-form-store';
import { TFormNames } from '@descartes/definitions/interfaces/descartes-form.interface';
import {
  AiSafetyTier,
  DescartesQuestionsIds,
  IAiSuggestionRequest,
  IAiSuggestionResponse,
} from '@shared/src';
import { Maybe } from '@shared/src/lib/types/maybe.type';
import { SnackbarComponent } from '@core/components/snackbar/snackbar';

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
  readonly #snackBar = inject(MatSnackBar);

  readonly #suggestions = signal<ISuggestionsMap>({
    q1: [],
    q2: [],
    q3: [],
    q4: [],
  });
  readonly #streamingQuadrant = signal<Maybe<TFormNames>>(null);
  readonly #isQuotaExhausted = signal(false);
  readonly #safetyBlocked = signal<Partial<Record<TFormNames, boolean>>>({});

  readonly suggestions = this.#suggestions.asReadonly();
  readonly streamingQuadrant = this.#streamingQuadrant.asReadonly();
  readonly isQuotaExhausted = this.#isQuotaExhausted.asReadonly();
  readonly safetyBlocked = this.#safetyBlocked.asReadonly();

  readonly isStreaming = computed(() => !!this.#streamingQuadrant());

  request(quadrant: TFormNames): void {
    if (this.isStreaming()) return;

    this.#streamingQuadrant.set(quadrant);
    this.#safetyBlocked.update((m) => ({ ...m, [quadrant]: false }));

    const model = this.#formStore.model();
    const payload: IAiSuggestionRequest = {
      ...model,
      key: quadrant as DescartesQuestionsIds,
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

  resetSafety(): void {
    this.#safetyBlocked.set({});
  }

  #handleResponse(quadrant: TFormNames, response: IAiSuggestionResponse): void {
    this.#streamingQuadrant.set(null);

    if (this.#isSafetyBlocked(response.tier)) {
      this.#safetyBlocked.update((m) => ({ ...m, [quadrant]: true }));
      return;
    }

    if (response.isUnclearTitle) {
      this.#showError(
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

  #isSafetyBlocked(tier: AiSafetyTier): boolean {
    return tier === 'crisis' || tier === 'harm_illegal';
  }

  #handleError(error: HttpErrorResponse): void {
    this.#streamingQuadrant.set(undefined);

    // Quota exhausted — flip the flag (disables the button + shows its
    // tooltip) AND surface a toast so the user gets immediate feedback on
    // the attempt that hit the limit.
    // Gemini's transient rate-limit shares the 429 status but uses a
    // different body shape — discriminate so a blip doesn't permanently
    // disable the button.
    if (error.status === 429 && error.error?.error === 'AI_QUOTA_EXHAUSTED') {
      this.#isQuotaExhausted.set(true);
      this.#showError(
        $localize`:@@aiQuotaExhausted:You've used all your free AI suggestions for today.`,
      );
      return;
    }

    if (error.status === 503) {
      this.#showError(
        $localize`:@@aiOverloaded:AI service is currently overloaded. Please try again later.`,
      );
      return;
    }

    this.#showError(
      error.error?.message ??
        $localize`:@@unknownError:Something went wrong. Please try again later`,
    );
  }

  #showError(message: string): void {
    this.#snackBar.openFromComponent(SnackbarComponent, {
      data: { message, type: 'error' },
      duration: 5000,
      panelClass: 'error-snackbar',
      verticalPosition: 'top',
      horizontalPosition: 'center',
    });
  }
}
