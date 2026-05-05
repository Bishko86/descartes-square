import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

import {
  BalanceLean,
  QuadrantCounts,
  confidenceLabel,
} from '@descartes/definitions/utils/balance.util';
import { buildAccentBar } from '@descartes/definitions/utils/accent-bar.util';

const RING_RADIUS = 78;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

@Component({
  selector: 'app-review-balance-card',
  templateUrl: './review-balance-card.html',
  styleUrl: './review-balance-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'review-balance-card',
  },
})
export class ReviewBalanceCard {
  readonly counts = input.required<QuadrantCounts>();
  readonly lean = input.required<BalanceLean>();
  readonly confidence = input<number | null>(null);

  readonly actCount = computed(() => this.counts().q1 + this.counts().q4);
  readonly stayCount = computed(() => this.counts().q2 + this.counts().q3);
  readonly total = computed(() => this.actCount() + this.stayCount());

  readonly actPct = computed(() => {
    const total = this.total();
    return total === 0 ? 50 : Math.round((this.actCount() / total) * 100);
  });
  readonly stayPct = computed(() => 100 - this.actPct());

  readonly accentBar = computed(() =>
    buildAccentBar(this.counts(), this.total()),
  );

  readonly ringRadius = RING_RADIUS;
  readonly ringCircumference = RING_CIRCUMFERENCE;
  readonly ringDashArray = computed(() => {
    const actLen = (this.actPct() / 100) * RING_CIRCUMFERENCE;
    const stayLen = RING_CIRCUMFERENCE - actLen;
    return { actLen, stayLen };
  });

  readonly confidenceLabel = computed<string | null>(() => {
    const value = this.confidence();
    return value === null || value === undefined
      ? null
      : confidenceLabel(value);
  });
}
