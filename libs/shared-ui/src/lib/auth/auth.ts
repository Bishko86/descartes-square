import { Component, computed, inject, output, signal } from '@angular/core';

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
  submitEvent = output<IAuthSubmit>();

  isHiddenPassword = signal(true);

  isSignUp = signal(!!inject(ActivatedRoute).snapshot.data['isSignUp']);

  authTitle = computed(() =>
    this.isSignUp()
      ? $localize`:@@signUp: Sign Up `
      : $localize`:@@signIn: Sign In `,
  );

  #form = createAuthForm(this.isSignUp);
  #model = this.#form.model;
  authForm = this.#form.authForm;

  hasPasswordMinLength = computed(() =>
    this.authForm
      .password()
      .errors()
      .some((e) => e.kind === 'minLength'),
  );

  hasConfirmPasswordMinLength = computed(
    () =>
      !this.authForm.confirmPassword().hidden() &&
      this.authForm
        .confirmPassword()
        .errors()
        .some((e) => e.kind === 'minLength'),
  );

  hasPasswordMismatch = computed(
    () =>
      !this.authForm.confirmPassword().hidden() &&
      this.authForm
        .confirmPassword()
        .errors()
        .some((e) => e.kind === 'passwordMismatch'),
  );

  submitDisabled = computed(
    () => this.authForm().invalid() || !this.authForm().dirty(),
  );

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
