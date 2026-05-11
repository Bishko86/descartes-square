import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';

import { DescartesQuestionShortLabels } from '@descartes/definitions/consts/descartes-question-short-labels.const';
import { DescartesReviewHelpers } from '@descartes/definitions/consts/descartes-review-helpers.const';
import {
  QUADRANT_NUMBER,
} from '@descartes/definitions/consts/quadrant-order.const';
import { padQuadrantNumber } from '@descartes/definitions/utils/pad-quadrant-number.util';
import { DescartesQuestionsIds } from '@shared/src';

@Component({
  selector: 'app-review-quadrant-card',
  templateUrl: './review-quadrant-card.html',
  styleUrl: './review-quadrant-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'review-quadrant-card',
    '[attr.data-quadrant]': 'questionId()',
  },
})
export class ReviewQuadrantCard {
  readonly questionId = input.required<DescartesQuestionsIds>();
  readonly items = input.required<string[]>();

  readonly edit = output<DescartesQuestionsIds>();

  readonly numberLabel = computed(() =>
    padQuadrantNumber(QUADRANT_NUMBER.get(this.questionId()) ?? 1),
  );
  readonly shortLabel = computed(
    () => DescartesQuestionShortLabels.get(this.questionId()) ?? '',
  );
  readonly helper = computed(
    () => DescartesReviewHelpers.get(this.questionId()) ?? '',
  );
  readonly count = computed(() => this.items().length);
  readonly isEmpty = computed(() => this.count() === 0);

  onEdit(): void {
    this.edit.emit(this.questionId());
  }
}
