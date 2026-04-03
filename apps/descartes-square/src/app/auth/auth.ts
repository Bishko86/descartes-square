import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { AuthComponent } from '@shared-ui/src/lib/auth/auth';
import { DescartesAuthService } from './services/descartes-auth.service';
import { Router } from '@angular/router';
import { MenuRoutes } from '@core/enums/menu-routes.enum';
import { catchError, EMPTY, switchMap, take } from 'rxjs';
import { IAuthSubmit } from '@shared-ui/src/lib/auth/interfaces/submit-payload.interface';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ErrorSnackbarComponent } from '@core/components/error-snackbar/error-snackbar';
import { environment } from '@environment/environment';

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'User with such email already in use': $localize`:@@authErrorEmailInUse:A user with this email already exists`,
  'Email or password is incorrect': $localize`:@@authErrorInvalidCredentials:Email or password is incorrect`,
};

@Component({
  selector: 'app-auth',
  imports: [AuthComponent],
  templateUrl: './auth.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Auth {
  readonly apiUrl = environment.apiUrl;
  readonly locale = environment.locale;

  readonly #router = inject(Router);

  readonly #authService = inject(DescartesAuthService);

  readonly #snackBar = inject(MatSnackBar);

  submit({ isSignUp, payload }: IAuthSubmit): void {
    if (isSignUp) {
      this.#authService
        .signUp(payload)
        .pipe(
          take(1),
          switchMap(() => this.#router.navigate([MenuRoutes.SIGN_IN])),
          catchError((err: HttpErrorResponse) => {
            this.#showError(err);
            return EMPTY;
          }),
        )
        .subscribe();
    } else {
      this.#authService
        .signIn(payload)
        .pipe(
          take(1),
          switchMap(() => this.#authService.getCurrentUser()),
          switchMap(() => this.#router.navigate([MenuRoutes.HOME])),
          catchError((err: HttpErrorResponse) => {
            this.#showError(err);
            return EMPTY;
          }),
        )
        .subscribe();
    }
  }

  #showError(err: HttpErrorResponse): void {
    const serverMessage = err.error?.message;
    const message =
      AUTH_ERROR_MESSAGES[serverMessage] ??
      $localize`:@@authErrorGeneric:Something went wrong. Please try again.`;

    this.#snackBar.openFromComponent(ErrorSnackbarComponent, {
      data: { message },
      duration: 5000,
      panelClass: 'error-snackbar',
      verticalPosition: 'top',
      horizontalPosition: 'center',
    });
  }
}
