import {
  ChangeDetectorRef,
  Component,
  inject,
  input,
  OnInit,
  signal,
  WritableSignal,
} from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  IDescartesForm,
  IDescartesFormValues,
  TFormNames,
} from '@descartes/definitions/interfaces/descartes-form.interface';
import { NgTemplateOutlet } from '@angular/common';
import { Maybe } from '@shared/src/lib/types/maybe.type';
import { LocalStorageKeys } from '@core/enums/local-storage-key.enum';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { IDescartesSolution } from '@descartes/definitions/interfaces/descartes-solution.interface';
import { MatButton } from '@angular/material/button';
import { Router } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ConfirmService } from '@core/services/confirm.service';
import {
  filter,
  finalize,
  first,
  interval,
  of,
  switchMap,
  take,
  tap,
} from 'rxjs';
import { IFormStateTracker } from '@descartes/definitions/interfaces/descartes-form-state-tracker.interface';
import { FormStateTracker } from '@descartes/definitions/models/form-state-tracker.model';
import { AutoFocus } from '@core/directives/auto-focus/auto-focus';
import {
  DescartesQuestionsIds,
  DescartesQuestionsMap,
  IAiSuggestionResponse,
  IUserDto,
} from '@shared/src';
import { DescartesAuthService } from '@auth/services/descartes-auth.service';
import { AiSuggestionService } from '@descartes/services/ai-suggestion';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';

@Component({
  selector: 'app-descartes-form',
  imports: [
    ReactiveFormsModule,
    NgTemplateOutlet,
    MatSnackBarModule,
    MatButton,
    MatTooltipModule,
    AutoFocus,
    CdkTextareaAutosize,
  ],
  providers: [AiSuggestionService],
  templateUrl: './descartes-form.html',
  styleUrl: './descartes-form.scss',
})
export class DescartesForm implements OnInit {
  readonly id = input<string>();

  readonly descartesQuestions = DescartesQuestionsMap;

  readonly descartesQuestionsIds = DescartesQuestionsIds;

  currentUser: WritableSignal<Maybe<IUserDto>>;

  isLoading = signal<boolean>(false);

  form: FormGroup<IDescartesForm>;

  formEditTracker = new Map<TFormNames, IFormStateTracker>()
    .set('q1', new FormStateTracker())
    .set('q2', new FormStateTracker())
    .set('q3', new FormStateTracker())
    .set('q4', new FormStateTracker());

  readonly #confirmService = inject(ConfirmService);

  readonly #snackBar = inject(MatSnackBar);

  readonly #router = inject(Router);

  readonly #authService = inject(DescartesAuthService);

  readonly #aiSuggestionService = inject(AiSuggestionService);

  readonly #cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.#initForm();
    this.#setCurrUser();
  }

  addArgument(key: TFormNames): void {
    const formArray = this.#getArgumentForm(key);

    if (formArray.valid) {
      formArray.push(this.#createFormControl(''));
      const tracker = new FormStateTracker(formArray.length - 1, true);
      this.formEditTracker.set(key, tracker);
    }
  }

  deleteArgument(index: number, key: TFormNames): void {
    this.#confirmService
      .confirm('Are you sure you want to delete this record?')
      .pipe(
        first(),
        filter(Boolean),
        tap(() => {
          this.#deleteFormControl(key, index);
        }),
      )
      .subscribe();
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
      formArray.markAsDirty();
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

  addAISuggestion(key: TFormNames): void {
    const typingSpeed = 10;

    this.isLoading.set(true);
    this.addArgument(key);

    this.#aiSuggestionService
      .addAISuggestion({
        ...this.form.getRawValue(),
        key,
      } as IDescartesFormValues)
      .pipe(
        take(1),
        switchMap((data: IAiSuggestionResponse) => {
          const formArray = this.#getArgumentForm(key);

          if (data.isUnclearTitle) {
            this.#setUnclearTitleError(formArray, key);
            return of(0);
          }

          const newControl = formArray.at(formArray.length - 1);

          const tracker = new FormStateTracker(formArray.length - 1, true);
          this.formEditTracker.set(key, tracker);
          this.#cdr.markForCheck();

          return interval(typingSpeed).pipe(
            take(data.suggestion?.length || 0),
            tap((i) => {
              newControl.setValue(data.suggestion?.substring(0, i + 1));
              this.#cdr.markForCheck();
            }),
          );
        }),
        finalize(() => {
          this.isLoading.set(false);
        }),
      )
      .subscribe();
  }

  onBlur(event: FocusEvent, key: TFormNames, index: number): void {
    const target = event.target as HTMLInputElement;
    const relatedTarget = event.relatedTarget as HTMLElement;

    // Skip blur handling if focus moved to an element within the same row
    if (this.#isFocusWithinSameRow(relatedTarget, index)) {
      return;
    }

    // Auto-save if there's content in the input
    if (target.value.trim()) {
      this.saveArgument(key);
      return;
    }

    // Clean up empty new entries
    this.#handleEmptyNewEntry(key);
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
      title: new FormControl(editedEntity?.title || null, Validators.required),
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
    return (collection || []).map(this.#createFormControl);
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

  #setCurrUser(): void {
    this.currentUser = this.#authService.currentUser;
  }

  #createFormControl(value: Maybe<string>): FormControl<Maybe<string>> {
    return new FormControl(value, [
      Validators.required,
      Validators.maxLength(255),
      Validators.minLength(3),
    ]);
  }

  #setUnclearTitleError(
    formArray: FormArray<FormControl<Maybe<string>>>,
    key: TFormNames,
  ): void {
    this.form.controls.title.setErrors({
      unclearTitle: true,
    });

    this.formEditTracker.set(key, new FormStateTracker());

    formArray.removeAt(formArray.length - 1);
  }

  #deleteFormControl(key: TFormNames, index: number): void {
    const formArray = this.#getArgumentForm(key);

    if (index === formArray.length - 1) {
      this.formEditTracker.set(key, new FormStateTracker());
    }

    formArray.removeAt(index);
    formArray.markAsDirty();
  }

  #isFocusWithinSameRow(
    relatedTarget: Maybe<HTMLElement>,
    currentIndex: number,
  ): boolean {
    return relatedTarget?.dataset?.['index'] === currentIndex.toString();
  }

  #handleEmptyNewEntry(key: TFormNames): void {
    const tracker = this.formEditTracker.get(key);

    if (tracker?.isCreating && !tracker.value) {
      this.#deleteFormControl(key, tracker.index ?? 0);
    }
  }
}
