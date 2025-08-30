import { Maybe } from '@shared/src/lib/types/maybe.type';
import { FormArray, FormControl } from '@angular/forms';
import { TFormControl } from '@core/types/form-utility.type';

export type TFormNames = 'q1' | 'q2' | 'q3' | 'q4';

export interface IDescartesFormValues {
  title: Maybe<string>;
  q1: Maybe<string[]>;
  q2: Maybe<string[]>;
  q3: Maybe<string[]>;
  q4: Maybe<string[]>;
  conclusion: Maybe<string>;
}

export interface IDescartesForm
  extends Omit<TFormControl<IDescartesFormValues>, TFormNames> {
  q1: FormArray<FormControl<Maybe<string>>>;
  q2: FormArray<FormControl<Maybe<string>>>;
  q3: FormArray<FormControl<Maybe<string>>>;
  q4: FormArray<FormControl<Maybe<string>>>;
}
