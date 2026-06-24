import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  applyEach,
  form,
  maxLength,
  minLength,
  required,
  schema,
} from '@angular/forms/signals';

import { SnackbarComponent } from '@core/components/snackbar/snackbar';
import {
  IDescartesSolution,
  SolutionStatus,
} from '@descartes/definitions/interfaces/descartes-solution.interface';
import { TFormNames } from '@descartes/definitions/interfaces/descartes-form.interface';
import { Maybe } from '@shared/src/lib/types/maybe.type';

import { SolutionsRepository } from './solutions-repository';
import { IArgumentLocation } from '@descartes/definitions/interfaces/descartes-square-argument-location.interface';

interface IFormModel {
  title: string;
  q1: string[];
  q2: string[];
  q3: string[];
  q4: string[];
  conclusion: string;
}

const QUADRANTS: readonly TFormNames[] = ['q1', 'q2', 'q3', 'q4'];

const MIN_TITLE_LENGTH = 3;
const MAX_TITLE_LENGTH = 255;
const MIN_ARG_LENGTH = 3;
const MAX_ARG_LENGTH = 255;

// No `required` here on purpose: a blank argument row is allowed (it's
// dropped on save). `minLength`/`maxLength` skip empty values, so the schema
// flags only partially-typed entries (1–2 chars) or over-long ones.
const argumentSchema = schema<string>((item) => {
  minLength(item, MIN_ARG_LENGTH);
  maxLength(item, MAX_ARG_LENGTH);
});

@Injectable()
export class DescartesFormStore {
  readonly #router = inject(Router);
  readonly #snackBar = inject(MatSnackBar);
  readonly #repository = inject(SolutionsRepository);

  readonly #id = signal<Maybe<string>>(undefined);

  readonly model = signal<IFormModel>(this.#emptyModel());

  readonly field = form(this.model, (path) => {
    required(path.title, {
      message: $localize`:@@errRequired:This field is required`,
    });
    minLength(path.title, MIN_TITLE_LENGTH);
    maxLength(path.title, MAX_TITLE_LENGTH);

    applyEach(path.q1, argumentSchema);
    applyEach(path.q2, argumentSchema);
    applyEach(path.q3, argumentSchema);
    applyEach(path.q4, argumentSchema);
  });

  readonly isLocked = computed(
    () => (this.model().title ?? '').trim().length < MIN_TITLE_LENGTH,
  );

  readonly counts = computed<Record<TFormNames, number>>(() => {
    const m = this.model();
    return {
      q1: m.q1.length,
      q2: m.q2.length,
      q3: m.q3.length,
      q4: m.q4.length,
    };
  });

  readonly isEditing = computed(() => !!this.#id());

  init(id: Maybe<string>): void {
    this.#id.set(id);
    if (!id) return;

    const entity = this.#loadById(id);
    if (entity) {
      this.model.set(this.#fromSolution(entity));
    }
  }

  setTitle(value: string): void {
    this.model.update((m) => ({ ...m, title: value }));
  }

  setArgument(quadrant: TFormNames, index: number, value: string): void {
    this.model.update((m) => {
      const next = [...m[quadrant]];
      next[index] = value;
      return { ...m, [quadrant]: next };
    });
  }

  addArgument(quadrant: TFormNames, value = ''): number {
    const current = this.model()[quadrant];
    this.model.update((m) => ({ ...m, [quadrant]: [...m[quadrant], value] }));
    return current.length;
  }

  removeArgument(quadrant: TFormNames, index: number): void {
    this.model.update((m) => ({
      ...m,
      [quadrant]: m[quadrant].filter((_, i) => i !== index),
    }));
  }

  reorderArgument(quadrant: TFormNames, from: number, to: number): void {
    if (from === to) return;
    this.model.update((m) => {
      const next = [...m[quadrant]];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return { ...m, [quadrant]: next };
    });

    this.#persist();
  }

  cancel(): void {
    this.#router.navigate(['descartes-square']);
  }

  saveDraft(isSnackbarShown = true): void {
    // An explicit "Save draft" click marks the card a draft; the silent
    // autosaves (argument blur, accepting a suggestion) only persist and
    // must not change an already-concluded card's status.
    const id = this.#persist(isSnackbarShown ? 'draft' : undefined);

    if (isSnackbarShown && id) {
      this.#showInfoSnackbar($localize`:@@draftSaved:Draft saved`);
    }
  }

  // Returns the first invalid argument's location when the form can't be
  // concluded (and surfaces a snackbar) so the caller can focus it; returns
  // `undefined` once the card is saved.
  reviewAndConclude(): Maybe<IArgumentLocation> {
    // Empty argument slots are dropped on save, but partially-typed entries
    // (1–2 chars) would persist as invalid data — block the conclusion and
    // tell the user why rather than silently saving a malformed card.
    const invalid = this.#firstInvalidArgument();
    if (invalid) {
      this.#showErrorSnackbar(
        $localize`:@@argLengthInvalid:Each argument must be 3–255 characters. Fix or remove the short ones before concluding.`,
      );
      return invalid;
    }

    const id = this.#persist();
    if (!id) return undefined;

    this.#router.navigate(['descartes-square', 'list', id, 'review']);
    return undefined;
  }

  // Lean on the declared schema instead of re-checking lengths by hand: an
  // argument item is invalid when it fails `minLength`/`maxLength` (both skip
  // empty values, so blank rows never count).
  #firstInvalidArgument(): Maybe<IArgumentLocation> {
    for (const quadrant of QUADRANTS) {
      const field = this.field[quadrant];
      const length = this.model()[quadrant].length;
      for (let index = 0; index < length; index++) {
        if (field[index]?.().invalid()) {
          return { quadrant, index };
        }
      }
    }
    return undefined;
  }

  #showInfoSnackbar(message: string): void {
    this.#snackBar.openFromComponent(SnackbarComponent, {
      data: { message, type: 'info' },
      duration: 3000,
      panelClass: 'info-snackbar',
      verticalPosition: 'top',
      horizontalPosition: 'center',
    });
  }

  #showErrorSnackbar(message: string): void {
    this.#snackBar.openFromComponent(SnackbarComponent, {
      data: { message, type: 'error' },
      duration: 5000,
      panelClass: 'error-snackbar',
      verticalPosition: 'top',
      horizontalPosition: 'center',
    });
  }

  // Returns the persisted id, or `undefined` when the write failed (e.g.
  // storage quota exceeded) so callers can abort navigation/feedback.
  #persist(status?: SolutionStatus): Maybe<string> {
    const currentId = this.#id();
    const payload = this.#sanitize(this.model());

    try {
      if (currentId) {
        this.#repository.upsert({
          ...payload,
          id: currentId,
          ...(status ? { status } : {}),
        });
        return currentId;
      }

      const newId = crypto.randomUUID();
      this.#repository.upsert({
        ...payload,
        id: newId,
        status: status ?? 'draft',
        createdAt: new Date().toISOString(),
      });
      this.#id.set(newId);
      this.#router.navigate(['descartes-square', 'list', newId, 'edit'], {
        replaceUrl: true,
      });
      return newId;
    } catch {
      this.#showErrorSnackbar(
        $localize`:@@unknownError:Something went wrong. Please try again later`,
      );
      return undefined;
    }
  }

  #loadById(id: string): Maybe<IDescartesSolution> {
    return this.#repository.findById(id);
  }

  #emptyModel(): IFormModel {
    return {
      title: '',
      q1: [],
      q2: [],
      q3: [],
      q4: [],
      conclusion: '',
    };
  }

  #fromSolution(s: IDescartesSolution): IFormModel {
    return {
      title: s.title ?? '',
      q1: s.q1 ?? [],
      q2: s.q2 ?? [],
      q3: s.q3 ?? [],
      q4: s.q4 ?? [],
      conclusion: s.conclusion ?? '',
    };
  }

  #sanitize(model: IFormModel): IFormModel {
    const compact = (items: string[]): string[] =>
      items.map((item) => item.trim()).filter((item) => item.length > 0);
    return {
      ...model,
      title: model.title.trim(),
      q1: compact(model.q1),
      q2: compact(model.q2),
      q3: compact(model.q3),
      q4: compact(model.q4),
    };
  }
}
