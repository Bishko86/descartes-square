import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-ai-suggestion-card',
  imports: [MatIconModule, MatTooltipModule],
  templateUrl: './ai-suggestion-card.html',
  styleUrl: './ai-suggestion-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ai-suggestion-card' },
})
export class AiSuggestionCard {
  readonly text = input.required<string>();

  readonly accept = output<string>();
  readonly dismiss = output<void>();

  onAccept(): void {
    this.accept.emit(this.text());
  }

  onDismiss(): void {
    this.dismiss.emit();
  }
}
