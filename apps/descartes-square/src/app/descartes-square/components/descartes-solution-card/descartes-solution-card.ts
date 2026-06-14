import { Component, computed, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { IDescartesSolution } from '../../definitions/interfaces/descartes-solution.interface';
import {
  classifyLean,
  QuadrantCounts,
} from '@descartes/definitions/utils/balance.util';
import { buildAccentBar } from '@descartes/definitions/utils/accent-bar.util';
import { DescartesQuestionsIds } from '@shared/src';

@Component({
  selector: 'app-descartes-solution-card',
  imports: [DatePipe, MatIconButton, MatIcon, MatTooltipModule],
  templateUrl: './descartes-solution-card.html',
  styleUrl: './descartes-solution-card.scss',
})
export class DescartesSolutionCard {
  readonly solution = input.required<IDescartesSolution>();

  readonly view = output<string>();
  readonly edit = output<string>();
  readonly remove = output<string>();

  readonly counts = computed<QuadrantCounts>(() => {
    const solution = this.solution();
    return {
      q1: solution.q1?.length ?? 0,
      q2: solution.q2?.length ?? 0,
      q3: solution.q3?.length ?? 0,
      q4: solution.q4?.length ?? 0,
    };
  });

  readonly total = computed(() => {
    const counts = this.counts();
    return counts.q1 + counts.q2 + counts.q3 + counts.q4;
  });

  readonly accentBar = computed(() =>
    buildAccentBar(this.counts(), this.total()),
  );

  readonly lean = computed(() => classifyLean(this.counts()));

  readonly isSolution = computed(() => this.solution().status === 'solution');

  readonly quadrants = computed(() => {
    const counts = this.counts();
    return [
      { id: DescartesQuestionsIds.Q1, count: counts.q1 },
      { id: DescartesQuestionsIds.Q2, count: counts.q2 },
      { id: DescartesQuestionsIds.Q3, count: counts.q3 },
      { id: DescartesQuestionsIds.Q4, count: counts.q4 },
    ];
  });

  readonly viewLabel = $localize`:@@viewBtn:View details`;
  readonly editLabel = $localize`:@@editBtn: Edit `;
  readonly deleteLabel = $localize`:@@deleteBtn: Delete `;
}
