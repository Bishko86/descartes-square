import {Component, inject, input, OnInit, signal} from '@angular/core';
import {FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {IDescartesForm, TFormNames} from '../definitions/interfaces/descartes-form.interface';
import {NgTemplateOutlet} from '@angular/common';
import {Maybe} from '@core/types/maybe.type';
import {LocalStorageKeys} from '@core/enums/local-storage-key.enum';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {IDescartesSolution} from '../definitions/interfaces/descartes-solution.interface';
import {MatButton} from '@angular/material/button';
import {Router} from '@angular/router';
import {MatTooltipModule} from '@angular/material/tooltip';
import {ConfirmService} from '@core/services/confirm.service';
import {filter, first, tap} from 'rxjs';

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
  styleUrl: './descartes-form.scss'
})
export class DescartesForm implements OnInit {
  readonly id = input<string>();

  readonly #confirmService = inject(ConfirmService);

  form: FormGroup<IDescartesForm>;

  formEditTracker = new Map<TFormNames, Maybe<number>>()
    .set('q1', null)
    .set('q2', null)
    .set('q3', null)
    .set('q4', null);

  isAddingArgument = signal(false);

  readonly #snackBar = inject(MatSnackBar);

  readonly #router = inject(Router);

  ngOnInit(): void {
    this.#initForm();
  }

  addArgument(key: TFormNames): void {
    const formArray = this.#getArgumentForm(key);

    if (formArray.valid) {
      formArray.push(new FormControl('', Validators.required));
      this.formEditTracker.set(key, formArray.length - 1);
      this.isAddingArgument.set(true);
    }
  }

  deleteArgument(index: number, key: TFormNames): void {
    const formArray = this.#getArgumentForm(key);

    if (index === formArray.length - 1) {
      this.formEditTracker.set(key, null);
      this.isAddingArgument.set(false);
    }

    formArray.removeAt(index);
    formArray.markAsDirty();
  }

  cancelArgument(index: number, key: TFormNames): void {
    if (this.isAddingArgument()) {
      this.deleteArgument(index, key);
    } else {
      this.formEditTracker.set(key, null);
    }
  }

  editArgument(index: number, key: TFormNames): void {
    const formArray = this.#getArgumentForm(key);

    if (formArray.valid) {
      this.formEditTracker.set(key, index);
    }
  }

  saveArgument(key: TFormNames): void {
    const formArray = this.#getArgumentForm(key);
    if (formArray.valid) {
      this.formEditTracker.set(key, null);
      this.isAddingArgument.set(false);
    }
  }

  getFormArrayControls(key: TFormNames): FormControl<Maybe<string>>[] {
    const formArray = this.#getArgumentForm(key);
    return formArray?.controls || [];
  }

  clearForm(): void {
    this.#confirmService.confirm('Are you sure you want to clear this form? All unsaved changes will be lost.')
      .pipe(
        first(),
        filter(Boolean),
        tap(() => {
          this.#initForm();
        })).subscribe()
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

  #create(): void {
    const list: IDescartesSolution[] = JSON.parse(localStorage.getItem(LocalStorageKeys.LIST) || '[]');
    const id = crypto.randomUUID();
    list.push(<IDescartesSolution>{...this.form.value, id});

    localStorage.setItem(LocalStorageKeys.LIST, JSON.stringify(list));

    this.#snackBar.open('Form is saved', 'Close', {})
    this.#redirectToDescartesDetails(id);
  }

  #update(): void {
    const list: IDescartesSolution[] = JSON.parse(localStorage.getItem(LocalStorageKeys.LIST) || '[]');
    const updatedList = list.map((item) => this.id() === item.id ? {...item, ...this.form.value} : item);

    localStorage.setItem(LocalStorageKeys.LIST, JSON.stringify(updatedList));

    this.#snackBar.open('Form is updated', 'Close', {})
    this.#redirectToDescartesDetails(<string>this.id());
  }

  #redirectToDescartesDetails(id: string): void {
    this.#router.navigate([`descartes-square/list/${id}/details`]).then();
  }
}
