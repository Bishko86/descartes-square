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
import {
  form,
  FormField,
  required,
  email,
  hidden,
  validate,
} from '@angular/forms/signals';
import { AuthFormKeys } from './enums/auth-form-keys.enum';
import { IAuthForm } from './interfaces/auth-form-interface';
import { IAuthSubmit } from './interfaces/submit-payload.interface';

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
  hidePassword = signal(true);

  isSignUp = signal(!!inject(ActivatedRoute).snapshot.data['isSignUp']);

  authTitle = computed(() =>
    this.isSignUp()
      ? $localize`:@@signUp: Sign Up `
      : $localize`:@@signIn: Sign In `,
  );

  submitEvent = output<IAuthSubmit>();

  #model = signal<IAuthForm>({
    [AuthFormKeys.EMAIL]: '',
    [AuthFormKeys.USERNAME]: '',
    [AuthFormKeys.PASSWORD]: '',
    [AuthFormKeys.CONFIRM_PASSWORD]: '',
  });

  authForm = form(this.#model, (f) => {
    required(f.email);
    email(f.email);
    required(f.password);

    hidden(f.username, () => !this.isSignUp());
    required(f.username);

    hidden(f.confirmPassword, () => !this.isSignUp());
    required(f.confirmPassword);

    validate(f.confirmPassword, ({ value }) => {
      const password = this.#model().password;
      if (value() && password && value() !== password) {
        return { kind: 'passwordMismatch', message: 'Passwords do not match' };
      }
      return undefined;
    });
  });

  hasPasswordMismatch = computed(
    () =>
      !this.authForm.confirmPassword().hidden() &&
      this.authForm.confirmPassword().errors().some((e) => e.kind === 'passwordMismatch'),
  );

  submitDisabled = computed(() => this.authForm().invalid() || !this.authForm().dirty());

  submit(): void {
    const { email, password, username } = this.#model();
    const payload = this.isSignUp()
      ? { email, password, username, confirmPassword: this.#model().confirmPassword }
      : { email, password, username: '', confirmPassword: '' };

    console.log(payload);

    // this.submitEvent.emit({ isSignUp: this.isSignUp(), payload });
  }
}
