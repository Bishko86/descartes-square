import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { Confirm } from '@core/components/confirm/confirm';
import { ConfirmDialogType } from '@core/enums/confirm-dialog-type.enum';
import { IConfirmDialogData } from '@core/interfaces/confirm-dialog-data.interface';

@Injectable({
  providedIn: 'root',
})
export class ConfirmService {
  readonly #dialog = inject(MatDialog);

  confirm(
    data: IConfirmDialogData = { type: ConfirmDialogType.Delete },
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
