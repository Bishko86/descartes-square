import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';

import { DescartesQuestionShortLabels } from '@descartes/definitions/consts/descartes-question-short-labels.const';
import {
  QUADRANT_NUMBER,
  QUADRANT_ORDER,
} from '@descartes/definitions/consts/quadrant-order.const';
import { TFormNames } from '@descartes/definitions/interfaces/descartes-form.interface';
import { padQuadrantNumber } from '@descartes/definitions/utils/pad-quadrant-number.util';
import { DescartesQuestionsIds } from '@shared/src';

@Component({
  selector: 'app-quadrant-chips',
  templateUrl: './quadrant-chips.html',
  styleUrl: './quadrant-chips.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'quadrant-chips', role: 'tablist' },
})
export class QuadrantChips {
  readonly activeId = input.required<DescartesQuestionsIds>();
  readonly counts = input.required<Record<TFormNames, number>>();

  readonly select = output<DescartesQuestionsIds>();

  readonly order = QUADRANT_ORDER;
  readonly shortLabels = DescartesQuestionShortLabels;
  readonly numbers = QUADRANT_NUMBER;

  numberLabel(id: DescartesQuestionsIds): string {
    return padQuadrantNumber(this.numbers.get(id) ?? 0);
  }
}
