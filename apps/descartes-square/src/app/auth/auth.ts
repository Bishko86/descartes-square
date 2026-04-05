import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { AuthComponent } from '@shared-ui/src/lib/auth/auth';
import { DescartesAuthService } from './services/descartes-auth.service';
import { Router, RouterLink } from '@angular/router';
import { MenuRoutes } from '@core/enums/menu-routes.enum';
import { catchError, EMPTY, switchMap, take } from 'rxjs';
import { IAuthSubmit } from '@shared-ui/src/lib/auth/interfaces/submit-payload.interface';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarComponent } from '@core/components/snackbar/snackbar';
import { environment } from '@environment/environment';
import { MatButton, MatAnchor } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'User with such email already in use': $localize`:@@authErrorEmailInUse:A user with this email already exists`,
  'Email or password is incorrect': $localize`:@@authErrorInvalidCredentials:Email or password is incorrect`,
};

@Component({
  selector: 'app-auth',
  imports: [AuthComponent, MatButton, MatAnchor, MatIcon, RouterLink],
  templateUrl: './auth.html',
  styleUrl: './auth.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Auth {
  readonly apiUrl = environment.apiUrl;
  readonly locale = environment.locale;

  readonly signUpSuccess = signal(false);
  readonly showResend = signal(false);
  #lastEmail = '';

  readonly #router = inject(Router);
  readonly #authService = inject(DescartesAuthService);
  readonly #snackBar = inject(MatSnackBar);

  submit({ isSignUp, payload }: IAuthSubmit): void {
    if (isSignUp) {
      this.#authService
        .signUp({ ...payload, locale: this.locale ?? 'en' })
        .pipe(
          take(1),
          catchError((err: HttpErrorResponse) => {
            this.#showError(err);
            return EMPTY;
          }),
        )
        .subscribe(() => {
          this.signUpSuccess.set(true);
        });
    } else {
      this.#lastEmail = payload.email;
      this.showResend.set(false);

      this.#authService
        .signIn(payload)
        .pipe(
          take(1),
          switchMap(() => this.#authService.getCurrentUser()),
          switchMap(() => this.#router.navigate([MenuRoutes.HOME])),
          catchError((err: HttpErrorResponse) => {
            if (err.error?.error === 'EMAIL_NOT_VERIFIED') {
              this.showResend.set(true);
            } else {
              this.#showError(err);
            }
            return EMPTY;
          }),
        )
        .subscribe();
    }
  }

  resendVerification(): void {
    this.#authService
      .resendVerification(this.#lastEmail)
      .pipe(
        take(1),
        catchError((err: HttpErrorResponse) => {
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
            this.#showError(err);
          }
          return EMPTY;
        }),
      )

      .subscribe(() => {
        this.#snackBar.openFromComponent(SnackbarComponent, {
          data: {
            message: $localize`:@@resendVerificationSent:Verification email sent — check your inbox.`,
            type: 'info',
          },
          duration: 5000,
          panelClass: 'info-snackbar',
          verticalPosition: 'top',
          horizontalPosition: 'center',
        });
        this.showResend.set(false);
      });
  }

  #showError(err: HttpErrorResponse): void {
    const serverMessage = err.error?.message;
    const message =
      AUTH_ERROR_MESSAGES[serverMessage] ??
      $localize`:@@authErrorGeneric:Something went wrong. Please try again.`;

    this.#snackBar.openFromComponent(SnackbarComponent, {
      data: { message },
      duration: 5000,
      panelClass: 'error-snackbar',
      verticalPosition: 'top',
      horizontalPosition: 'center',
    });
  }
}
