import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { MatAnchor } from '@angular/material/button';

const ERROR_MESSAGES: Record<string, { title: string; message: string }> = {
  EMAIL_CONFLICT: {
    title: $localize`:@@authErrorConflictTitle:Email already registered`,
    message: $localize`:@@authErrorConflictMessage:An account with this email already exists. Please sign in with your password.`,
  },
  UNKNOWN: {
    title: $localize`:@@authErrorUnknownTitle:Something went wrong`,
    message: $localize`:@@authErrorUnknownMessage:An unexpected error occurred during sign-in. Please try again.`,
  },
};

@Component({
  selector: 'app-auth-error',
  imports: [RouterLink, MatIcon, MatAnchor],
  templateUrl: './auth-error.html',
  styleUrl: './auth-error.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthError {
  readonly #error =
    ERROR_MESSAGES[inject(ActivatedRoute).snapshot.queryParams['code']] ??
    ERROR_MESSAGES['UNKNOWN'];

  readonly errorTitle = this.#error.title;
  readonly errorMessage = this.#error.message;
}
