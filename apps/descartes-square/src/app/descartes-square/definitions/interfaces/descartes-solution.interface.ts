import { Maybe } from '@shared/src/lib/types/maybe.type';

export type SolutionStatus = 'draft' | 'solution';

export interface IDescartesSolution {
  id?: string;
  title: Maybe<string>;
  conclusion: Maybe<string>;
  status?: SolutionStatus;
  confidence?: Maybe<number>;
  q1: Maybe<string[]>;
  q2: Maybe<string[]>;
  q3: Maybe<string[]>;
  q4: Maybe<string[]>;
  createdAt?: string;
}
