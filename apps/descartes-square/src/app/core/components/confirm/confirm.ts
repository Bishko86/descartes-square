import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import {
  ConfirmDialogData,
  ConfirmDialogType,
} from '@core/definitions/confirm-dialog.model';

@Component({
  selector: 'app-confirm',
  imports: [MatButton, MatIcon],
  templateUrl: './confirm.html',
  styleUrl: './confirm.scss',
})
export class Confirm {
  readonly dialog = inject(MatDialogRef<Confirm>);
  readonly data: ConfirmDialogData = inject(MAT_DIALOG_DATA);

  get dialogTitle(): string {
    if (this.data.title) {
      return this.data.title;
    }

    if (this.data.itemName && this.data.type === ConfirmDialogType.Delete) {
      return $localize`:@@confirm.deleteItemTitle:Delete '${this.data.itemName}'?`;
    }

    switch (this.data.type) {
      case ConfirmDialogType.Delete:
        return $localize`:@@confirm.deleteTitle:Delete record?`;
      case ConfirmDialogType.Warning:
        return $localize`:@@confirm.warningTitle:Unsaved changes`;
      case ConfirmDialogType.Info:
        return $localize`:@@confirm.infoTitle:Are you sure?`;
    }
  }

  get description(): string {
    if (this.data.message) {
      return this.data.message;
    }

    switch (this.data.type) {
      case ConfirmDialogType.Delete:
        return $localize`:@@confirm.defaultMessage:Are you sure you want to delete this record?`;
      case ConfirmDialogType.Warning:
        return $localize`:@@confirm.unsavedChanges:Are you sure you want to clear this form? All unsaved changes will be lost.`;
      case ConfirmDialogType.Info:
        return $localize`:@@confirm.infoMessage:Are you sure?`;
    }
  }

  get confirmLabel(): string {
    switch (this.data.type) {
      case ConfirmDialogType.Delete:
        return $localize`:@@deleteBtn: Delete `;
      default:
        return $localize`:@@confirm.confirmBtn:Confirm`;
    }
  }

  get cancelLabel(): string {
    return $localize`:@@cancelBtn: Cancel `;
  }

  get isDestructive(): boolean {
    return (
      this.data.type === ConfirmDialogType.Delete ||
      this.data.type === ConfirmDialogType.Warning
    );
  }

  get showIcon(): boolean {
    return (
      this.data.type === ConfirmDialogType.Delete ||
      this.data.type === ConfirmDialogType.Warning
    );
  }

  confirm(): void {
    this.dialog.close(true);
  }

  cancel(): void {
    this.dialog.close(false);
  }
}
