import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Subject, debounceTime, tap } from 'rxjs';

import { SnackbarComponent } from '@core/components/snackbar/snackbar';
import { IDescartesSolution } from '@descartes/definitions/interfaces/descartes-solution.interface';
import {
  DEFAULT_CONFIDENCE,
  classifyLean,
  confidenceLabel,
} from '@descartes/definitions/utils/balance.util';
import { SolutionsRepository } from '@descartes/services/solutions-repository';
import { DescartesQuestionsIds } from '@shared/src';
import { Maybe } from '@shared/src/lib/types/maybe.type';

import { ReviewBalanceCard } from './components/review-balance-card/review-balance-card';
import { ReviewQuadrantCard } from './components/review-quadrant-card/review-quadrant-card';
import { ReviewSynthesisCard } from './components/review-synthesis-card/review-synthesis-card';

const PERSIST_DEBOUNCE_MS = 300;

const REVIEW_VISUAL_ORDER: readonly DescartesQuestionsIds[] = [
  DescartesQuestionsIds.Q1,
  DescartesQuestionsIds.Q3,
  DescartesQuestionsIds.Q2,
  DescartesQuestionsIds.Q4,
];

@Component({
  selector: 'app-descartes-review',
  templateUrl: './descartes-review.html',
  styleUrl: './descartes-review.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatButtonModule,
    ReviewBalanceCard,
    ReviewQuadrantCard,
    ReviewSynthesisCard,
  ],
  host: {
    class: 'descartes-review',
  },
})
export class DescartesReview implements OnInit {
  readonly id = input<string>();

  readonly visualOrder = REVIEW_VISUAL_ORDER;

  readonly entity = signal<Maybe<IDescartesSolution>>(null);

  readonly title = computed(() => this.entity()?.title?.trim() ?? '');
  readonly confidence = computed(
    () => this.entity()?.confidence ?? DEFAULT_CONFIDENCE,
  );

  readonly counts = computed(() => ({
    q1: this.entity()?.q1?.length ?? 0,
    q2: this.entity()?.q2?.length ?? 0,
    q3: this.entity()?.q3?.length ?? 0,
    q4: this.entity()?.q4?.length ?? 0,
  }));

  readonly totalArgs = computed(() => {
    const c = this.counts();
    return c.q1 + c.q2 + c.q3 + c.q4;
  });

  readonly canSave = computed(
    () => this.title().length > 0 && this.totalArgs() > 0,
  );

  readonly quadrantItems = computed<Record<DescartesQuestionsIds, string[]>>(
    () => {
      const e = this.entity();
      return {
        [DescartesQuestionsIds.Q1]: e?.q1 ?? [],
        [DescartesQuestionsIds.Q2]: e?.q2 ?? [],
        [DescartesQuestionsIds.Q3]: e?.q3 ?? [],
        [DescartesQuestionsIds.Q4]: e?.q4 ?? [],
      };
    },
  );

  readonly synthesisPayload = computed(() => ({
    title: this.entity()?.title ?? '',
    q1: this.entity()?.q1 ?? [],
    q2: this.entity()?.q2 ?? [],
    q3: this.entity()?.q3 ?? [],
    q4: this.entity()?.q4 ?? [],
  }));

  readonly balanceLean = computed(() => classifyLean(this.counts()));

  readonly confidenceLabel = confidenceLabel;

  readonly #router = inject(Router);
  readonly #snackBar = inject(MatSnackBar);
  readonly #destroyRef = inject(DestroyRef);
  readonly #repository = inject(SolutionsRepository);

  readonly #persistTrigger = new Subject<void>();

  ngOnInit(): void {
    const id = this.id();
    if (id) {
      const found = this.#repository.findById(id);
      if (found) {
        this.entity.set({
          ...found,
          confidence: found.confidence ?? DEFAULT_CONFIDENCE,
        });
      }
    }

    this.#persistTrigger
      .pipe(
        debounceTime(PERSIST_DEBOUNCE_MS),
        tap(() => this.#persist()),
        takeUntilDestroyed(this.#destroyRef),
      )
      .subscribe();
  }

  onConclusionInput(event: Event): void {
    const value = (event.target as HTMLTextAreaElement).value;
    this.#patch({ conclusion: value });
  }

  onConfidenceInput(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this.#patch({ confidence: value });
  }

  onEditQuadrant(quadrant: DescartesQuestionsIds): void {
    this.#persist();
    this.#router.navigate(['descartes-square', 'list', this.id(), 'edit'], {
      queryParams: { quadrant },
    });
  }

  onBackToSquare(): void {
    this.#persist();
    this.#router.navigate(['descartes-square', 'list', this.id(), 'edit']);
  }

  onSaveDraft(): void {
    this.#persist();
    this.#showInfoSnackbar($localize`:@@draftSaved:Draft saved`);
  }

  onSaveDecision(): void {
    if (!this.canSave()) return;
    this.#persist();
    this.#showInfoSnackbar($localize`:@@decisionSaved:Decision saved`);
    this.#router.navigate(['descartes-square', 'list']);
  }

  #patch(partial: Partial<IDescartesSolution>): void {
    this.entity.update((e) => (e ? { ...e, ...partial } : e));
    this.#persistTrigger.next();
  }

  #persist(): void {
    const current = this.entity();
    if (!current?.id) return;
    this.#repository.upsert(current);
  }

  #showInfoSnackbar(message: string): void {
    this.#snackBar.openFromComponent(SnackbarComponent, {
      data: { message, type: 'info' },
      duration: 3000,
      panelClass: 'info-snackbar',
      verticalPosition: 'top',
      horizontalPosition: 'center',
    });
  }
}
