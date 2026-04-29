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

import { LocalStorageKeys } from '@core/enums/local-storage-key.enum';
import { SnackbarComponent } from '@core/components/snackbar/snackbar';
import { IDescartesSolution } from '@descartes/definitions/interfaces/descartes-solution.interface';
import { TFormNames } from '@descartes/definitions/interfaces/descartes-form.interface';
import { Maybe } from '@shared/src/lib/types/maybe.type';

interface IFormModel {
  title: string;
  q1: string[];
  q2: string[];
  q3: string[];
  q4: string[];
  conclusion: string;
}

const MIN_TITLE_LENGTH = 3;
const MAX_TITLE_LENGTH = 255;
const MIN_ARG_LENGTH = 3;
const MAX_ARG_LENGTH = 255;

const argumentSchema = schema<string>((item) => {
  required(item, { message: $localize`:@@errRequired:This field is required` });
  minLength(item, MIN_ARG_LENGTH);
  maxLength(item, MAX_ARG_LENGTH);
});

@Injectable()
export class DescartesFormStore {
  readonly #router = inject(Router);
  readonly #snackBar = inject(MatSnackBar);

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

  setConclusion(value: string): void {
    this.model.update((m) => ({ ...m, conclusion: value }));
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

  saveDraft(): void {
    this.#persist();
    this.#showInfoSnackbar($localize`:@@draftSaved:Draft saved`);
  }

  reviewAndConclude(): void {
    const id = this.#persist();
    this.#showInfoSnackbar(
      this.isEditing()
        ? $localize`:@@formUpdated:Form is updated`
        : $localize`:@@formSaved:Form is saved`,
    );
    this.#router.navigate(['descartes-square', 'list', id, 'details']);
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

  #persist(): string {
    const list = this.#readList();
    const currentId = this.#id();
    const payload = this.#sanitize(this.model());

    if (currentId) {
      const next = list.map((item) =>
        item.id === currentId ? { ...item, ...payload } : item,
      );
      this.#writeList(next);
      return currentId;
    }

    const newId = crypto.randomUUID();
    const entity: IDescartesSolution = {
      ...payload,
      id: newId,
      createdAt: new Date().toISOString(),
    };
    this.#writeList([...list, entity]);
    this.#id.set(newId);
    this.#router.navigate(['descartes-square', 'list', newId, 'edit'], {
      replaceUrl: true,
    });
    return newId;
  }

  #readList(): IDescartesSolution[] {
    return JSON.parse(localStorage.getItem(LocalStorageKeys.LIST) ?? '[]');
  }

  #writeList(list: IDescartesSolution[]): void {
    localStorage.setItem(LocalStorageKeys.LIST, JSON.stringify(list));
  }

  #loadById(id: string): Maybe<IDescartesSolution> {
    return this.#readList().find((item) => item.id === id);
  }

  #emptyModel(): IFormModel {
    return { title: '', q1: [], q2: [], q3: [], q4: [], conclusion: '' };
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
