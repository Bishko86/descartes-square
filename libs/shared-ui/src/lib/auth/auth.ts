import {
  Component,
  computed,
  inject,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
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
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthFormKeys } from './enums/auth-form-keys.enum';
import { IAuthForm } from './interfaces/auth-form-interface';
import { TFormControl } from '@shared/src/lib/types/form-utility.type';
import { IAuthSubmit } from './interfaces/submit-payload.interface';

@Component({
  selector: 'lib-auth',
  imports: [
    CommonModule,
    MatFormField,
    MatLabel,
    MatFormField,
    MatIcon,
    MatInput,
    MatIconButton,
    MatButton,
    MatSuffix,
    ReactiveFormsModule,
  ],
  templateUrl: './auth.html',
  styleUrl: './auth.scss',
})
export class AuthComponent implements OnInit {
  form: FormGroup<TFormControl<IAuthForm>>;
  formKeys = AuthFormKeys;
  hidePassword = true;
  isSignUp = signal(false);

  authTitle = computed(() => (this.isSignUp() ? $localize`:@@signUp: Sign Up ` : $localize`:@@signIn: Sign In `));

  submitEvent = output<IAuthSubmit>();

  #activatedRoute = inject(ActivatedRoute);

  ngOnInit(): void {
    this.isSignUp.set(!!this.#activatedRoute.snapshot.data['isSignUp']);
    this.#initForm();
  }

  submit(): void {
    const { email, password, username } = this.form.getRawValue();
    const payload = this.isSignUp()
      ? { email, password, username }
      : { email, password };

    this.submitEvent.emit({ isSignUp: this.isSignUp(), payload });
  }

  #initForm(): void {
    this.form = new FormGroup<TFormControl<IAuthForm>>({
      [AuthFormKeys.EMAIL]: new FormControl(null, [
        Validators.required,
        Validators.email,
      ]),
      [AuthFormKeys.USERNAME]: new FormControl(
        null,
        this.isSignUp() ? [Validators.required] : [],
      ),
      [AuthFormKeys.PASSWORD]: new FormControl(null, [Validators.required]),
      [AuthFormKeys.CONFIRM_PASSWORD]: new FormControl(
        null,
        this.isSignUp() ? [Validators.required] : [],
      ),
    });
  }
}
