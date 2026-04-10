import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { Confirm } from '@core/components/confirm/confirm';
import {
  ConfirmDialogData,
  ConfirmDialogType,
} from '@core/definitions/confirm-dialog.model';

@Injectable({
  providedIn: 'root',
})
export class ConfirmService {
  readonly #dialog = inject(MatDialog);

  confirm(
    data: ConfirmDialogData = { type: ConfirmDialogType.Delete },
  ): Observable<boolean> {
    return this.#dialog
      .open(Confirm, {
        data,
        width: 'auto',
        height: 'auto',
        panelClass: 'confirm-dialog-panel',
      })
      .afterClosed();
  }
}
