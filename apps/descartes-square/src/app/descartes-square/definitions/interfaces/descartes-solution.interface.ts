import { Maybe } from '@shared/src/lib/types/maybe.type';

export interface IDescartesSolution {
  id?: string;
  title: Maybe<string>;
  conclusion: Maybe<string>;
  q1: Maybe<string[]>;
  q2: Maybe<string[]>;
  q3: Maybe<string[]>;
  q4: Maybe<string[]>;
}
