import { FormControl, FormGroup } from '@angular/forms';

export type TFormControl<T> = {
  [P in keyof T]: FormControl<T[P]>;
};

export type TFormGroup<T> = {
  [P in keyof T]: FormGroup<TFormControl<T[P]>>;
};
