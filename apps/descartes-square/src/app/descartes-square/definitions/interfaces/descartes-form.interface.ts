import { Maybe } from '@shared/src/lib/types/maybe.type';

export type TFormNames = 'q1' | 'q2' | 'q3' | 'q4';

export interface IDescartesFormValues {
  title: Maybe<string>;
  q1: Maybe<string[]>;
  q2: Maybe<string[]>;
  q3: Maybe<string[]>;
  q4: Maybe<string[]>;
  conclusion: Maybe<string>;
}
