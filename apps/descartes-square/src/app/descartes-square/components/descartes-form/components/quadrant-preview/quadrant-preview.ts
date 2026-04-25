import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';

import { padQuadrantNumber } from '@descartes/definitions/utils/pad-quadrant-number.util';
import { DescartesQuestionsIds } from '@shared/src';

const PREVIEW_LIMIT = 3;

@Component({
  selector: 'app-quadrant-preview',
  templateUrl: './quadrant-preview.html',
  styleUrl: './quadrant-preview.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'quadrant-preview',
    role: 'button',
    tabindex: '0',
    '[attr.data-quadrant]': 'questionId()',
    '[attr.aria-label]': 'shortLabel()',
    '(click)': 'activate.emit()',
    '(keydown.enter)': 'activate.emit()',
    '(keydown.space)': '$event.preventDefault(); activate.emit()',
  },
})
export class QuadrantPreview {
  readonly questionId = input.required<DescartesQuestionsIds>();
  readonly questionNumber = input.required<1 | 2 | 3 | 4>();
  readonly shortLabel = input.required<string>();
  readonly items = input.required<string[]>();

  readonly activate = output<void>();

  readonly previewItems = computed(() => this.items().slice(0, PREVIEW_LIMIT));
  readonly overflow = computed(() =>
    Math.max(0, this.items().length - PREVIEW_LIMIT),
  );
  readonly count = computed(() => this.items().length);
  readonly numberLabel = computed(() =>
    padQuadrantNumber(this.questionNumber()),
  );
}
