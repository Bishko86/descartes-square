import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import {
  MAT_SNACK_BAR_DATA,
  MatSnackBarRef,
} from '@angular/material/snack-bar';

@Component({
  selector: 'app-error-snackbar',
  imports: [MatIcon, MatIconButton],
  templateUrl: './error-snackbar.html',
  styleUrl: './error-snackbar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorSnackbarComponent {
  readonly data = inject<{ message: string }>(MAT_SNACK_BAR_DATA);
  readonly #snackBarRef = inject(MatSnackBarRef);

  dismiss(): void {
    this.#snackBarRef.dismiss();
  }
}
