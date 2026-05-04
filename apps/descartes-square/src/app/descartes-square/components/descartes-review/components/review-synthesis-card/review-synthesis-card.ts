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

  readonly expanded = signal(false);
  readonly loading = signal(false);
  readonly synthesis = signal<string | null>(null);

  readonly hasContent = computed(() => !!this.synthesis() && !this.loading());

  readonly #invalidateOnInputChange = effect(() => {
    this.payload();
    this.lean();
    untracked(() => {
      this.synthesis.set(null);
      if (this.expanded()) this.#fetch();
    });
  });

  expand(): void {
    if (this.expanded()) return;
    this.expanded.set(true);
    if (this.synthesis()) return;
    this.#fetch();
  }

  collapse(): void {
    this.expanded.set(false);
  }

  refresh(): void {
    this.synthesis.set(null);
    this.#fetch();
  }

  #fetch(): void {
    this.loading.set(true);
    this.#service
      .requestSynthesis(this.payload(), this.lean())
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe({
        next: (response) => {
          this.synthesis.set(response.text);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        },
      });
  }
}
