import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import {
  AiSynthesisService,
  IAiSynthesisPayload,
} from '@descartes/services/ai-synthesis';
import { BalanceLean } from '@descartes/definitions/utils/balance.util';

@Component({
  selector: 'app-review-synthesis-card',
  templateUrl: './review-synthesis-card.html',
  styleUrl: './review-synthesis-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'review-synthesis-card',
  },
})
export class ReviewSynthesisCard {
  readonly payload = input.required<IAiSynthesisPayload>();
  readonly lean = input.required<BalanceLean>();

  readonly #service = inject(AiSynthesisService);
  readonly #destroyRef = inject(DestroyRef);

  readonly isExpanded = signal(false);
  readonly isLoading = signal(false);
  readonly synthesis = signal<string | null>(null);

  readonly hasContent = computed(() => !!this.synthesis() && !this.isLoading());

  readonly #invalidateOnInputChange = effect(() => {
    this.payload();
    this.lean();
    untracked(() => {
      this.synthesis.set(null);
      if (this.isExpanded()) this.#fetch();
    });
  });

  expand(): void {
    if (this.isExpanded()) return;
    this.isExpanded.set(true);
    if (this.synthesis()) return;
    this.#fetch();
  }

  collapse(): void {
    this.isExpanded.set(false);
  }

  refresh(): void {
    this.synthesis.set(null);
    this.#fetch();
  }

  #fetch(): void {
    this.isLoading.set(true);
    this.#service
      .requestSynthesis(this.payload(), this.lean())
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe({
        next: (response) => {
          this.synthesis.set(response.text);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
        },
      });
  }
}
