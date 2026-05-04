import { Component, inject, input, OnInit, signal } from '@angular/core';
import { IDescartesSolution } from '../../definitions/interfaces/descartes-solution.interface';
import { Maybe } from '@shared/src/lib/types/maybe.type';
import { MatButton } from '@angular/material/button';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmService } from '@core/services/confirm.service';
import { tap, first, filter } from 'rxjs';
import { SnackbarComponent } from '@core/components/snackbar/snackbar';
import { SolutionsRepository } from '@descartes/services/solutions-repository';

@Component({
  selector: 'app-descartes-details',
  imports: [MatButton],
  templateUrl: './descartes-details.html',
  styleUrl: './descartes-details.scss',
})
export class DescartesDetails implements OnInit {
  id = input<string>();
  overviewedEntity = signal<Maybe<IDescartesSolution>>(null);

  readonly #router = inject(Router);

  readonly #snackBar = inject(MatSnackBar);

  readonly #confirmService = inject(ConfirmService);

  readonly #repository = inject(SolutionsRepository);

  ngOnInit(): void {
    const id = this.id();
    if (!id) return;
    this.overviewedEntity.set(this.#repository.findById(id));
  }

  back(): void {
    this.#router.navigate(['descartes-square']).then();
  }

  delete(): void {
    this.#confirmService
      .confirm()
      .pipe(
        first(),
        filter(Boolean),
        tap(() => {
          const id = this.id();
          if (!id) return;
          this.#repository.remove(id);

          this.#router.navigate(['descartes-square']).then();
          this.#snackBar.openFromComponent(SnackbarComponent, {
            data: {
              message: $localize`:@@deleteRecordSuccess:Record deleted successfully`,
              type: 'success',
            },
            duration: 3000,
            panelClass: 'success-snackbar',
            verticalPosition: 'top',
            horizontalPosition: 'center',
          });
        }),
      )
      .subscribe();
  }

  edit(): void {
    this.#router.navigate([`descartes-square/list/${this.id()}/edit`]).then();
  }
}
