import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton, MatAnchor } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, EMPTY } from 'rxjs';
import { DescartesAuthService } from '@auth/services/descartes-auth.service';
import { SnackbarComponent } from '@core/components/snackbar/snackbar';
import { MenuRoutes } from '@core/enums/menu-routes.enum';

@Component({
  selector: 'app-forgot-password',
  imports: [
    RouterLink,
    FormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatButton,
    MatAnchor,
    MatIcon,
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForgotPasswordComponent {
  readonly sent = signal(false);
  readonly signInRoute = MenuRoutes.SIGN_IN;

  readonly #authService = inject(DescartesAuthService);
  readonly #snackBar = inject(MatSnackBar);
  readonly #destroyRef = inject(DestroyRef);

  submit(email: string): void {
    if (!email) return;

    this.#authService
      .requestPasswordReset(email)
      .pipe(
        takeUntilDestroyed(this.#destroyRef),
        catchError((err) => {
          if (err.status === 429) {
            this.#snackBar.openFromComponent(SnackbarComponent, {
              data: {
                message: $localize`:@@resendVerificationThrottled:Too many attempts. Please wait a minute before trying again.`,
                type: 'warning',
              },
              duration: 6000,
              panelClass: 'warning-snackbar',
              verticalPosition: 'top',
              horizontalPosition: 'center',
            });
          } else {
            this.#snackBar.openFromComponent(SnackbarComponent, {
              data: {
                message: $localize`:@@authErrorGeneric:Something went wrong. Please try again.`,
                type: 'error',
              },
              duration: 5000,
              panelClass: 'error-snackbar',
              verticalPosition: 'top',
              horizontalPosition: 'center',
            });
          }
          return EMPTY;
        }),
      )
      .subscribe(() => {
        this.sent.set(true);
      });
  }
}
