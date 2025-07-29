import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subject, Observable } from 'rxjs';
import { Confirm } from '@core/components/confirm/confirm';

@Injectable({
  providedIn: 'root',
})
export class ConfirmService {
  readonly #isAllowed: Subject<boolean> = new Subject();

  constructor(private readonly dialog: MatDialog) {}

  confirm(message: string): Observable<boolean> {
    this.dialog
      .open(Confirm, {
        data: message,
        width: 'auto',
        height: '180px',
      })
      .afterClosed()
      .subscribe((confirm: boolean) => {
        if (confirm) {
          this.#isAllowed.next(true);
        } else {
          this.#isAllowed.next(false);
        }
      });
    return this.#isAllowed;
  }
}
