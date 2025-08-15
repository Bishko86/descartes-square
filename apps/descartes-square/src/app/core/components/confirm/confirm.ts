import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-confirm',
  imports: [MatButton],
  templateUrl: './confirm.html',
  styleUrl: './confirm.scss',
})
export class Confirm {
  readonly dialog = inject(MatDialogRef<Confirm>);
  readonly title: string = inject(MAT_DIALOG_DATA);

  confirm(): void {
    this.dialog.close(true);
  }

  cancel(): void {
    this.dialog.close(false);
  }
}
