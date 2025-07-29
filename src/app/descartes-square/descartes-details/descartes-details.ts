import {Component, inject, input, OnInit, signal} from '@angular/core';
import {IDescartesSolution} from '../definitions/interfaces/descartes-solution.interface';
import {LocalStorageKeys} from '@core/enums/local-storage-key.enum';
import {Maybe} from '@core/types/maybe.type';
import {MatButton} from '@angular/material/button';
import {Router} from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ConfirmService} from '@core/services/confirm.service';
import {tap, first, filter} from 'rxjs';

@Component({
  selector: 'app-descartes-details',
  imports: [
    MatButton
  ],
  templateUrl: './descartes-details.html',
  styleUrl: './descartes-details.scss'
})
export class DescartesDetails implements OnInit {
  id = input<string>();
  overviewedEntity = signal<Maybe<IDescartesSolution>>(null);

  readonly #router = inject(Router);

  readonly #snackBar = inject(MatSnackBar);

  readonly #confirmService = inject(ConfirmService);

  ngOnInit(): void {
    const list: IDescartesSolution[] = JSON.parse(localStorage.getItem(LocalStorageKeys.LIST) || '[]');
    const overviewedEntity = list.find(form => form.id === this.id());

    this.overviewedEntity.set(overviewedEntity);
  }

  back(): void {
    this.#router.navigate(['descartes-square']).then();
  }

  delete(): void {
    this.#confirmService.confirm('Are you sure you want to delete this record?')
      .pipe(
        first(),
        filter(Boolean),
        tap(() => {
          const list: IDescartesSolution[] = JSON.parse(localStorage.getItem(LocalStorageKeys.LIST) || '[]');
          const updatedList = list.filter((item) => item.id !== this.id());

          localStorage.setItem(
            LocalStorageKeys.LIST,
            JSON.stringify(updatedList)
          )

          this.#router.navigate(['descartes-square']).then();
          this.#snackBar.open(`Record ${this.id()} is deleted`, 'Close', {})
        })).subscribe()

  }

  edit(): void {
    this.#router.navigate([`descartes-square/list/${this.id()}/edit`]).then();
  }
}
