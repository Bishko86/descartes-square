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
  readonly safetyBlocked = input<boolean>(false);
  readonly canSuggest = input<boolean>(false);
  readonly isStreaming = input<boolean>(false);
  readonly suggestTooltip = input<string>('');

  readonly add = output<void>();
  readonly remove = output<number>();
  readonly changeArgument = output<{ index: number; value: string }>();
  readonly reorder = output<{ from: number; to: number }>();
  readonly requestSuggestion = output<void>();
  readonly acceptSuggestion = output<string>();
  readonly dismissSuggestion = output<number>();
  readonly blurEvent = output<void>();

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

  // Public so the parent form can focus a specific argument (e.g. the first
  // invalid one when concluding) without reaching into this card's DOM.
  focusArgument(index: number): void {
    this.textareas()[index]?.nativeElement.focus();
  }

  #focusLast(): void {
    this.focusArgument(this.textareas().length - 1);
  }
}
