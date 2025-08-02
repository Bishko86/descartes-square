import { Component, inject, input, OnInit } from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  IDescartesForm,
  TFormNames,
} from '../definitions/interfaces/descartes-form.interface';
import { NgTemplateOutlet } from '@angular/common';
import { Maybe } from '@core/types/maybe.type';
import { LocalStorageKeys } from '@core/enums/local-storage-key.enum';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { IDescartesSolution } from '../definitions/interfaces/descartes-solution.interface';
import { MatButton } from '@angular/material/button';
import { Router } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ConfirmService } from '@core/services/confirm.service';
import { filter, first, tap } from 'rxjs';
import { IFormStateTracker } from '../definitions/interfaces/descartes-form-state-tracker.interface';
import { FormStateTracker } from '../definitions/models/form-state-tracker.model';

@Component({
  selector: 'app-descartes-form',
  imports: [
    ReactiveFormsModule,
    NgTemplateOutlet,
    MatSnackBarModule,
    MatButton,
    MatTooltipModule,
  ],
  templateUrl: './descartes-form.html',
  styleUrl: './descartes-form.scss',
})
export class DescartesForm implements OnInit {
  readonly id = input<string>();

  readonly #confirmService = inject(ConfirmService);

  form: FormGroup<IDescartesForm>;

  formEditTracker = new Map<TFormNames, IFormStateTracker>()
    .set('q1', new FormStateTracker())
    .set('q2', new FormStateTracker())
    .set('q3', new FormStateTracker())
    .set('q4', new FormStateTracker());

  readonly #snackBar = inject(MatSnackBar);

  readonly #router = inject(Router);

  ngOnInit(): void {
    this.#initForm();
  }

  addArgument(key: TFormNames): void {
    const formArray = this.#getArgumentForm(key);

    if (formArray.valid) {
      formArray.push(new FormControl('', Validators.required));
      const tracker = new FormStateTracker(formArray.length - 1, true);
      this.formEditTracker.set(key, tracker);
    }
  }

  deleteArgument(index: number, key: TFormNames): void {
    const formArray = this.#getArgumentForm(key);

    if (index === formArray.length - 1) {
      this.formEditTracker.set(key, new FormStateTracker());
    }

    formArray.removeAt(index);
    formArray.markAsDirty();
  }

  cancelArgument(index: number, key: TFormNames): void {
    if (this.formEditTracker.get(key)?.isCreating) {
      this.deleteArgument(index, key);
    } else {
      const formArray = this.#getArgumentForm(key);
      formArray.at(index)?.setValue(this.formEditTracker.get(key)?.value);
      this.formEditTracker.set(key, new FormStateTracker());
    }
  }

  editArgument(index: number, key: TFormNames): void {
    const formArray = this.#getArgumentForm(key);

    if (formArray.valid) {
      const value = formArray.at(index)?.value;
      const tracker = (this.formEditTracker.get(key) as IFormStateTracker)
        .setIndex(index)
        .setValue(value);
      this.formEditTracker.set(key, tracker);
    }
  }

  saveArgument(key: TFormNames): void {
    const formArray = this.#getArgumentForm(key);
    if (formArray.valid) {
      this.formEditTracker.set(key, new FormStateTracker());
    }
  }

  getFormArrayControls(key: TFormNames): FormControl<Maybe<string>>[] {
    const formArray = this.#getArgumentForm(key);
    return formArray?.controls || [];
  }

  clearForm(): void {
    this.#confirmService
      .confirm(
        'Are you sure you want to clear this form? All unsaved changes will be lost.',
      )
      .pipe(
        first(),
        filter(Boolean),
        tap(() => {
          this.#initForm();
        }),
      )
      .subscribe();
  }

  saveForm(): void {
    if (this.id()) {
      this.#update();
    } else {
      this.#create();
    }
  }

  cancelForm(): void {
    this.#router.navigate(['descartes-square']).then();
  }

  #getArgumentForm(key: string): FormArray<FormControl<Maybe<string>>> {
    return this.form.get(key) as FormArray<FormControl<Maybe<string>>>;
  }

  #initForm(): void {
    const list: IDescartesSolution[] = JSON.parse(
      localStorage.getItem(LocalStorageKeys.LIST) || '[]',
    );
    const editedEntity = list.find((form) => form.id === this.id());

    this.form = new FormGroup<IDescartesForm>({
      title: new FormControl(editedEntity?.title || null),
      q1: new FormArray<FormControl<Maybe<string>>>(
        this.#mapFormArrayControls(editedEntity?.q1),
      ),
      q2: new FormArray<FormControl<Maybe<string>>>(
        this.#mapFormArrayControls(editedEntity?.q2),
      ),
      q3: new FormArray<FormControl<Maybe<string>>>(
        this.#mapFormArrayControls(editedEntity?.q3),
      ),
      q4: new FormArray<FormControl<Maybe<string>>>(
        this.#mapFormArrayControls(editedEntity?.q4),
      ),
      conclusion: new FormControl(editedEntity?.conclusion),
    });
  }

  #mapFormArrayControls(
    collection: Maybe<string[]>,
  ): FormControl<Maybe<string>>[] {
    return (collection || []).map(
      (item: string) => new FormControl(item, Validators.required),
    );
  }

  #create(): void {
    const list: IDescartesSolution[] = JSON.parse(
      localStorage.getItem(LocalStorageKeys.LIST) || '[]',
    );
    const id = crypto.randomUUID();
    list.push({ ...this.form.value, id } as IDescartesSolution);

    localStorage.setItem(LocalStorageKeys.LIST, JSON.stringify(list));

    this.#snackBar.open('Form is saved', 'Close', {});
    this.#redirectToDescartesDetails(id);
  }

  #update(): void {
    const list: IDescartesSolution[] = JSON.parse(
      localStorage.getItem(LocalStorageKeys.LIST) || '[]',
    );
    const updatedList = list.map((item) =>
      this.id() === item.id ? { ...item, ...this.form.value } : item,
    );

    localStorage.setItem(LocalStorageKeys.LIST, JSON.stringify(updatedList));

    this.#snackBar.open('Form is updated', 'Close', {});
    this.#redirectToDescartesDetails(this.id() as string);
  }

  #redirectToDescartesDetails(id: string): void {
    this.#router.navigate([`descartes-square/list/${id}/details`]).then();
  }
}
