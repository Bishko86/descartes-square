import {Component, inject, input, OnInit, signal} from '@angular/core';
import {FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {IDescartesForm, TFormNames} from '../definitions/interfaces/descartes-form.interface';
import {NgTemplateOutlet} from '@angular/common';
import {Maybe} from '@core/types/maybe.type';
import {LocalStorageKeys} from '@core/enums/local-storage-key.enum';
import {MatSnackBar, MatSnackBarModule, MatSnackBarRef} from '@angular/material/snack-bar';
import {IDescartesSolution} from '../definitions/interfaces/descartes-solution.interface';

@Component({
  selector: 'app-descartes-form',
  imports: [
    ReactiveFormsModule,
    NgTemplateOutlet,
    MatSnackBarModule,
  ],
  templateUrl: './descartes-form.html',
  styleUrl: './descartes-form.scss'
})
export class DescartesForm implements OnInit {
  id = input<string>();
  form: FormGroup<IDescartesForm>;
  formEditTracker = new Map<TFormNames, boolean>()
    .set('q1', false)
    .set('q2', false)
    .set('q3', false)
    .set('q4', false);

  #snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    this.#initForm();
  }

  addArgument(key: TFormNames): void {
    const formArray = this.#getArgumentForm(key);
    if (formArray.valid) {
      formArray.push(new FormControl('', Validators.required));
      this.formEditTracker.set(key, true);
    }
  }

  deleteArgument(index: number, key: TFormNames,): void {
    const formArray = this.#getArgumentForm(key);

    if (index === formArray.length - 1) {
      this.formEditTracker.set(key, false);
    }

    formArray.removeAt(index);
  }

  saveArgument(key: TFormNames): void {
    const formArray = this.#getArgumentForm(key);
    if (formArray.valid) {
      this.formEditTracker.set(key, false);
    }
  }

  getFormArrayControls(key: TFormNames): FormControl<Maybe<string>>[] {
    const formArray = this.#getArgumentForm(key);
    return formArray?.controls || [];
  }

  clearForm(): void {
    this.#initForm();
  }

  saveForm(): void {
    const list = JSON.parse(localStorage.getItem(LocalStorageKeys.LIST) || '[]');
    const id = crypto.randomUUID();
    list.push({...this.form.value, id});

    localStorage.setItem(LocalStorageKeys.LIST, JSON.stringify(list));

    this.#snackBar.open('Form saved', 'Close', {})
    this.form.markAsPristine();
    this.form.markAsUntouched();
  }

  #getArgumentForm(key: string): FormArray<FormControl<Maybe<string>>> {
    return this.form.get(key) as FormArray<FormControl<Maybe<string>>>;
  }


  #initForm(): void {
    const list: IDescartesSolution[] = JSON.parse(localStorage.getItem(LocalStorageKeys.LIST) || '[]');
    const editedEntity = list.find(form => form.id === this.id());

    this.form = new FormGroup<IDescartesForm>({
      title: new FormControl(editedEntity?.title || null),
      q1: new FormArray<FormControl<Maybe<string>>>(this.#mapFormArrayControls(editedEntity?.q1)),
      q2: new FormArray<FormControl<Maybe<string>>>(this.#mapFormArrayControls(editedEntity?.q2)),
      q3: new FormArray<FormControl<Maybe<string>>>(this.#mapFormArrayControls(editedEntity?.q3)),
      q4: new FormArray<FormControl<Maybe<string>>>(this.#mapFormArrayControls(editedEntity?.q4)),
      conclusion: new FormControl(editedEntity?.conclusion)
    })
  }


  #mapFormArrayControls(collection: Maybe<string[]>): FormControl<Maybe<string>>[] {
    return (collection || []).map((item: string) => new FormControl(item))
  }
}
