import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  Injector,
  input,
  output,
  viewChildren,
} from '@angular/core';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDragHandle,
  CdkDropList,
} from '@angular/cdk/drag-drop';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { padQuadrantNumber } from '@descartes/definitions/utils/pad-quadrant-number.util';
import { DescartesQuestionsIds } from '@shared/src';
import { AiSuggestionCard } from '../ai-suggestion-card/ai-suggestion-card';

@Component({
  selector: 'app-quadrant-card',
  imports: [
    CdkDrag,
    CdkDragHandle,
    CdkDropList,
    CdkTextareaAutosize,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    AiSuggestionCard,
  ],
  templateUrl: './quadrant-card.html',
  styleUrl: './quadrant-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'quadrant-card',
    '[attr.data-quadrant]': 'questionId()',
  },
})
export class QuadrantCard {
  readonly questionId = input.required<DescartesQuestionsIds>();
  readonly questionNumber = input.required<1 | 2 | 3 | 4>();
  readonly question = input.required<string>();
  readonly subtitle = input.required<string>();
  readonly items = input.required<string[]>();
  readonly suggestions = input<string[]>([]);
  readonly canSuggest = input<boolean>(false);
  readonly isStreaming = input<boolean>(false);

  readonly add = output<void>();
  readonly remove = output<number>();
  readonly changeArgument = output<{ index: number; value: string }>();
  readonly reorder = output<{ from: number; to: number }>();
  readonly requestSuggestion = output<void>();
  readonly acceptSuggestion = output<string>();
  readonly dismissSuggestion = output<number>();

  protected readonly textareas =
    viewChildren<ElementRef<HTMLTextAreaElement>>('argInput');
  readonly #injector = inject(Injector);

  readonly numberLabel = computed(() =>
    padQuadrantNumber(this.questionNumber()),
  );

  onInput(index: number, event: Event): void {
    const value = (event.target as HTMLTextAreaElement).value;
    this.changeArgument.emit({ index, value });
  }

  onDrop(event: CdkDragDrop<string[]>): void {
    if (event.previousIndex === event.currentIndex) return;
    this.reorder.emit({ from: event.previousIndex, to: event.currentIndex });
  }

  onAdd(): void {
    this.add.emit();
    afterNextRender(() => this.#focusLast(), { injector: this.#injector });
  }

  #focusLast(): void {
    const textareas = this.textareas();
    textareas[textareas.length - 1]?.nativeElement.focus();
  }
}
