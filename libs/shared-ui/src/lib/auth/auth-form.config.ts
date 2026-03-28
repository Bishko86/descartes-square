import { Signal, signal } from '@angular/core';
import {
  form,
  required,
  email,
  hidden,
  validate,
  minLength,
} from '@angular/forms/signals';
import { AuthFormKeys } from './enums/auth-form-keys.enum';
import { IAuthForm } from './interfaces/auth-form-interface';

const PASSWORD_MIN_LENGTH = 6;

export function createAuthForm(isSignUp: Signal<boolean>) {
  const model = signal<IAuthForm>({
    [AuthFormKeys.EMAIL]: '',
    [AuthFormKeys.USERNAME]: '',
    [AuthFormKeys.PASSWORD]: '',
    [AuthFormKeys.CONFIRM_PASSWORD]: '',
  });

  const authForm = form(model, (f) => {
    required(f.email);
    email(f.email);
    required(f.password);
    minLength(f.password, PASSWORD_MIN_LENGTH);

    hidden(f.username, () => !isSignUp());
    required(f.username);

    hidden(f.confirmPassword, () => !isSignUp());
    required(f.confirmPassword);
    minLength(f.confirmPassword, PASSWORD_MIN_LENGTH);

    validate(f.confirmPassword, ({ value }) => {
      const password = model().password;
      if (value() && password && value() !== password) {
        return { kind: 'passwordMismatch', message: 'Passwords do not match' };
      }
      return undefined;
    });
  });

  return { model, authForm };
}
