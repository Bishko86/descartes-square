import {IFormStateTracker} from '../interfaces/descartes-form-state-tracker.interface';
import {Maybe} from '@core/types/maybe.type';

export class FormStateTracker implements IFormStateTracker {
  #index: Maybe<number> = null;

  #isCreating = false;

  #value: Maybe<string> = null;

  constructor(index?: Maybe<number>, isCreating?: boolean, value?: Maybe<string>) {
    this.setIndex(index ?? null);
    this.setIsCreating(isCreating ?? false);
    this.setValue(value ?? null);
  }

  get index(): Maybe<number> {
    return this.#index;
  }

  setIndex(index: Maybe<number>): this {
    this.#index = index;
    return this;
  }

  get isCreating(): boolean {
    return this.#isCreating;
  }

  setIsCreating(isCreating: boolean): this {
    this.#isCreating = isCreating;
    return this;
  }

  get value(): Maybe<string> {
    return this.#value;
  }

  setValue(value: Maybe<string>): this {
    this.#value = value;
    return this;
  }
}
