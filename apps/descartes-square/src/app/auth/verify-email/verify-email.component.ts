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
import { MatIcon } from '@angular/material/icon';
import { MatAnchor, MatButton } from '@angular/material/button';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, EMPTY, switchMap } from 'rxjs';
import { DescartesAuthService } from '@auth/services/descartes-auth.service';
import { SnackbarComponent } from '@core/components/snackbar/snackbar';
import { MenuRoutes } from '@core/enums/menu-routes.enum';

type VerifyStatus = 'verifying' | 'expired' | 'invalid';

@Component({
  selector: 'app-verify-email',
  imports: [
    RouterLink,
    MatIcon,
    MatAnchor,
    MatButton,
    MatFormField,
    MatLabel,
    MatInput,
    FormsModule,
  ],
  templateUrl: './verify-email.component.html',
  styleUrl: './verify-email.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VerifyEmailComponent implements OnInit {
  readonly status = signal<VerifyStatus>('verifying');
  readonly resent = signal(false);

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

    this.#authService
      .verifyEmail(token)
      .pipe(
        switchMap(() => this.#authService.getCurrentUser()),
        takeUntilDestroyed(this.#destroyRef),
      )
      .subscribe({
        next: () => {
          this.#router.navigate([MenuRoutes.HOME]);
        },
        error: (err) => {
          this.status.set(err.status === 410 ? 'expired' : 'invalid');
        },
      });
  }

  resend(email: string): void {
    if (!email) return;
    this.#authService
      .resendVerification(email)
      .pipe(
        catchError((err) => {
          const message = err.status === 429
            ? $localize`:@@resendVerificationThrottled:Too many attempts. Please wait a minute before trying again.`
            : $localize`:@@authErrorGeneric:Something went wrong. Please try again.`;
          this.#snackBar.openFromComponent(SnackbarComponent, {
            data: { message, type: err.status === 429 ? 'warning' : 'error' },
            duration: 6000,
            panelClass: err.status === 429 ? 'warning-snackbar' : 'error-snackbar',
            verticalPosition: 'top',
            horizontalPosition: 'center',
          });
          return EMPTY;
        }),
      )
      .subscribe(() => {
        this.resent.set(true);
      });
  }
}
