import { Component, input, output } from '@angular/core';
import { MoreOptionAction } from '@core/enums/more-options-action.enum';
import { MatIcon } from '@core/enums/mat-icon.enum';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatIconButton } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { IMoreOptions } from '@core/interfaces/more-options.interface';

@Component({
  selector: 'app-more-options',
  imports: [MatMenuTrigger, MatMenu, MatMenuItem, MatIconButton, MatIconModule],
  templateUrl: './more-options.html',
  styleUrl: './more-options.scss',
})
export class MoreOptions {
  public moreOptions = input<IMoreOptions[]>();

  public add = output<void>();
  public openAction = output<void>();
  public closeAction = output<void>();
  public update = output<void>();
  public delete = output<void>();
  public showUp = output<void>();

  public readonly moreOptionsIcon = MatIcon.MORE_OPTIONS;

  public emitAction(action: MoreOptionAction): void {
    switch (action) {
      case MoreOptionAction.Add:
        this.add.emit();
        break;
      case MoreOptionAction.Open:
        this.openAction.emit();
        break;
      case MoreOptionAction.Close:
        this.closeAction.emit();
        break;
      case MoreOptionAction.Update:
        this.update.emit();
        break;
      case MoreOptionAction.Delete:
        this.delete.emit();
        break;
      case MoreOptionAction.ShowUp:
        this.showUp.emit();
        break;
    }
  }
}
