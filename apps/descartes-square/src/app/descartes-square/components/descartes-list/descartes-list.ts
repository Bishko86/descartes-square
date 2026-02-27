import { Component, inject, OnInit, signal } from '@angular/core';
import { LocalStorageKeys } from '@core/enums/local-storage-key.enum';
import { MatTableModule } from '@angular/material/table';
import { IMoreOptions } from '@core/interfaces/more-options.interface';
import { MatIcon } from '@core/enums/mat-icon.enum';
import { MoreOptionAction } from '@core/enums/more-options-action.enum';
import { Router, RouterLink } from '@angular/router';
import { IDescartesSolution } from '../../definitions/interfaces/descartes-solution.interface';
import { MatButton } from '@angular/material/button';
import { LangService } from '@core/services/lang.service';
import { filter, first, tap } from 'rxjs';
import { MoreOptions } from '@core/components/more-options/more-options';
import { ConfirmService } from '@core/services/confirm.service';

@Component({
  selector: 'app-descartes-list',
  imports: [MatTableModule, MoreOptions, MatButton, RouterLink],
  templateUrl: './descartes-list.html',
  styleUrl: './descartes-list.scss',
})
export class DescartesList implements OnInit {
  readonly moreOptions: IMoreOptions[] = [
    {
      icon: MatIcon.EDIT,
      text: $localize`:@@editBtn: Edit `,
      action: MoreOptionAction.Update,
    },
    {
      icon: MatIcon.DELETE,
      text: $localize`:@@deleteBtn: Delete `,
      action: MoreOptionAction.Delete,
    },
  ];

  readonly #confirmService = inject(ConfirmService);

  dataSource = signal<IDescartesSolution[]>([]);

  displayedColumns = ['id', 'title', 'conclusion', 'options'];

  readonly #router = inject(Router);

  readonly #langService = inject(LangService);

  ngOnInit(): void {
    const currList: IDescartesSolution[] = JSON.parse(
      localStorage.getItem(LocalStorageKeys.LIST) || '[]',
    );
    this.dataSource.set(currList);
  }

  update(id: string): void {
    this.#router.navigate(
      this.#langService.buildRoute('descartes-square', 'list', id, 'edit'),
    );
  }

  delete(id: string): void {
    this.#confirmService
      .confirm()
      .pipe(
        first(),
        filter(Boolean),
        tap(() => {
          const currList: IDescartesSolution[] = JSON.parse(
            localStorage.getItem(LocalStorageKeys.LIST) || '[]',
          ).filter((item: IDescartesSolution) => item.id !== id);
          localStorage.setItem(LocalStorageKeys.LIST, JSON.stringify(currList));

          this.dataSource.set(currList);
        }),
      )
      .subscribe();
  }

  addData(): void {
    this.#router
      .navigate(this.#langService.buildRoute('descartes-square', 'create'))
      .then();
  }
}
