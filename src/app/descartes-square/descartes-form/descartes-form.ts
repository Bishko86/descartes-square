import {Component, OnInit, signal} from '@angular/core';
import {FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {IDescartesForm, TFormNames} from '../definitions/interfaces/descartes-form.interface';
import {NgTemplateOutlet} from '@angular/common';
import {Maybe} from '@core/types/maybe.type';

@Component({
  selector: 'app-descartes-form',
  imports: [
    ReactiveFormsModule,
    NgTemplateOutlet
  ],
  templateUrl: './descartes-form.html',
  styleUrl: './descartes-form.scss'
})
export class DescartesForm implements OnInit {
  form: FormGroup<IDescartesForm>;
  formEditTracker = new Map<TFormNames, boolean>()
    .set('q1', false)
    .set('q2', false)
    .set('q3', false)
    .set('q4', false);

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
    this. #initForm();
  }

  saveForm(): void {
    console.log(this.form.value);
  }

  #getArgumentForm(key: string): FormArray<FormControl<Maybe<string>>> {
    return this.form.get(key) as FormArray<FormControl<Maybe<string>>>;
  }


  #initForm(): void {
    this.form = new FormGroup<IDescartesForm>({
      title: new FormControl(null),
      q1: new FormArray<FormControl<Maybe<string>>>([]),
      q2: new FormArray<FormControl<Maybe<string>>>([]),
      q3: new FormArray<FormControl<Maybe<string>>>([]),
      q4: new FormArray<FormControl<Maybe<string>>>([]),
      conclusion: new FormControl(null)
    })
  }
}
