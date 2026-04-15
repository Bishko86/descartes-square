import { Component, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { IDescartesSolution } from '../../definitions/interfaces/descartes-solution.interface';

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

  readonly viewLabel = $localize`:@@viewBtn:View details`;
  readonly editLabel = $localize`:@@editBtn: Edit `;
  readonly deleteLabel = $localize`:@@deleteBtn: Delete `;
}
