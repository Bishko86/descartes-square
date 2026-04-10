import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  MatFormField,
  MatLabel,
  MatSuffix,
} from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton, MatAnchor, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, EMPTY } from 'rxjs';
import { DescartesAuthService } from '@auth/services/descartes-auth.service';
import { SnackbarComponent } from '@core/components/snackbar/snackbar';
import { MenuRoutes } from '@core/enums/menu-routes.enum';

type ResetStatus = 'ready' | 'expired' | 'invalid';

@Component({
  selector: 'app-reset-password',
  imports: [
    RouterLink,
    FormsModule,
    MatFormField,
    MatLabel,
    MatSuffix,
    MatInput,
    MatButton,
    MatAnchor,
    MatIconButton,
    MatIcon,
  ],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResetPasswordComponent implements OnInit {
  readonly status = signal<ResetStatus>('ready');
  readonly isHiddenPassword = signal(true);
  readonly signInRoute = MenuRoutes.SIGN_IN;
  readonly forgotPasswordRoute = MenuRoutes.FORGOT_PASSWORD;

  #token = '';

  readonly #route = inject(ActivatedRoute);
  readonly #router = inject(Router);
  readonly #authService = inject(DescartesAuthService);
  readonly #snackBar = inject(MatSnackBar);
  readonly #destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    const token = this.#route.snapshot.queryParamMap.get('token');
    if (!token) {
      this.status.set('invalid');
      return;
    }
    this.#token = token;
  }

  submit(newPassword: string, confirmPassword: string): void {
    if (!newPassword || newPassword !== confirmPassword) return;

    this.#authService
      .resetPassword(this.#token, newPassword)
      .pipe(
        takeUntilDestroyed(this.#destroyRef),
        catchError((err) => {
          if (err.status === 410) {
            this.status.set('expired');
          } else {
            this.status.set('invalid');
          }
          return EMPTY;
        }),
      )
      .subscribe(() => {
        this.#snackBar.openFromComponent(SnackbarComponent, {
          data: {
            message: $localize`:@@resetPasswordSuccessMessage:Password updated! Please sign in with your new password.`,
            type: 'success',
          },
          duration: 6000,
          panelClass: 'success-snackbar',
          verticalPosition: 'top',
          horizontalPosition: 'center',
        });
        this.#router.navigate([MenuRoutes.SIGN_IN]);
      });
  }
}
