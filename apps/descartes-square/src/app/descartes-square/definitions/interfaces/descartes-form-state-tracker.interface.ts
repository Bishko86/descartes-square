import { Maybe } from '@shared/src/lib/types/maybe.type';

export interface IFormStateTracker {
  index: Maybe<number>;
  isCreating: boolean;
  value: Maybe<string>;
  setValue(value: Maybe<string>): this;
  setIndex(index: Maybe<number>): this;
  setIsCreating(isCreating: boolean): this;
}
