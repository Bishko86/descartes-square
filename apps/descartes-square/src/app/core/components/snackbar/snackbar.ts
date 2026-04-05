import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import {
  MAT_SNACK_BAR_DATA,
  MatSnackBarRef,
} from '@angular/material/snack-bar';

export type SnackbarType = 'error' | 'warning' | 'success' | 'info';

const SNACKBAR_ICONS: Record<SnackbarType, string> = {
  error: 'error',
  warning: 'warning',
  success: 'check_circle',
  info: 'info',
};

@Component({
  selector: 'app-snackbar',
  imports: [MatIcon, MatIconButton],
  templateUrl: './snackbar.html',
  styleUrl: './snackbar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SnackbarComponent {
  readonly data = inject<{ message: string; type?: SnackbarType }>(
    MAT_SNACK_BAR_DATA,
  );
  readonly #snackBarRef = inject(MatSnackBarRef);

  get type(): SnackbarType {
    return this.data.type ?? 'error';
  }

  get icon(): string {
    return SNACKBAR_ICONS[this.type];
  }

  dismiss(): void {
    this.#snackBarRef.dismiss();
  }
}
