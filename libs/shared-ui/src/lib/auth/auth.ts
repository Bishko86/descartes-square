import { Component, computed, inject, input, output, signal } from '@angular/core';
import { Maybe } from '@shared/src';

import {
  MatFormField,
  MatInput,
  MatLabel,
  MatSuffix,
} from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatIconButton } from '@angular/material/button';
import { ActivatedRoute } from '@angular/router';
import { FormField } from '@angular/forms/signals';
import { IAuthSubmit } from './interfaces/submit-payload.interface';
import { createAuthForm } from './auth-form.config';

@Component({
  selector: 'lib-auth',
  imports: [
    MatFormField,
    MatLabel,
    MatIcon,
    MatInput,
    MatIconButton,
    MatButton,
    MatSuffix,
    FormField,
  ],
  templateUrl: './auth.html',
  styleUrl: './auth.scss',
})
export class AuthComponent {
  readonly apiUrl = input.required<string>();
  readonly locale = input<Maybe<string>>(null);

  readonly submitEvent = output<IAuthSubmit>();

  readonly isHiddenPassword = signal(true);

  readonly isSignUp = signal(
    !!inject(ActivatedRoute).snapshot.data['isSignUp'],
  );

  readonly authTitle = computed(() =>
    this.isSignUp()
      ? $localize`:@@signUp: Sign Up `
      : $localize`:@@signIn: Sign In `,
  );

  readonly #form = createAuthForm(this.isSignUp);
  readonly #model = this.#form.model;
  readonly authForm = this.#form.authForm;

  readonly hasPasswordMinLength = computed(() =>
    this.authForm
      .password()
      .errors()
      .some((e) => e.kind === 'minLength'),
  );

  readonly hasConfirmPasswordMinLength = computed(
    () =>
      !this.authForm.confirmPassword().hidden() &&
      this.authForm
        .confirmPassword()
        .errors()
        .some((e) => e.kind === 'minLength'),
  );

  readonly hasPasswordMismatch = computed(
    () =>
      !this.authForm.confirmPassword().hidden() &&
      this.authForm
        .confirmPassword()
        .errors()
        .some((e) => e.kind === 'passwordMismatch'),
  );

  readonly submitDisabled = computed(
    () => this.authForm().invalid() || !this.authForm().dirty(),
  );

  googleSignIn(): void {
    const locale = this.locale();
    const url = `${this.apiUrl()}/auth/google${locale ? `?locale=${locale}` : ''}`;
    window.location.href = url;
  }

  submit(): void {
    const { email, password, username } = this.#model();
    const payload = this.isSignUp()
      ? {
          email,
          password,
          username,
          confirmPassword: this.#model().confirmPassword,
        }
      : { email, password, username: '', confirmPassword: '' };

    this.submitEvent.emit({ isSignUp: this.isSignUp(), payload });
  }
}
