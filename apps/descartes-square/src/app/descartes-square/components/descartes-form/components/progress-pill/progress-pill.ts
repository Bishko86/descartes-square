import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { QUADRANT_ORDER } from '@descartes/definitions/consts/quadrant-order.const';
import { TFormNames } from '@descartes/definitions/interfaces/descartes-form.interface';

@Component({
  selector: 'app-progress-pill',
  templateUrl: './progress-pill.html',
  styleUrl: './progress-pill.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'progress-pill' },
})
export class ProgressPill {
  readonly counts = input.required<Record<TFormNames, number>>();

  readonly order = QUADRANT_ORDER;

  readonly exploredCount = computed(() =>
    this.order.reduce((acc, id) => acc + (this.counts()[id] > 0 ? 1 : 0), 0),
  );
}
