import { Component, inject, OnInit, signal } from '@angular/core';
import { LocalStorageKeys } from '@core/enums/local-storage-key.enum';
import { Router } from '@angular/router';
import { IDescartesSolution } from '../../definitions/interfaces/descartes-solution.interface';
import { MatButton } from '@angular/material/button';
import { filter, first, tap } from 'rxjs';
import { ConfirmService } from '@core/services/confirm.service';
import { DescartesSolutionCard } from '../descartes-solution-card/descartes-solution-card';

@Component({
  selector: 'app-descartes-list',
  imports: [MatButton, DescartesSolutionCard],
  templateUrl: './descartes-list.html',
  styleUrl: './descartes-list.scss',
})
export class DescartesList implements OnInit {
  readonly #confirmService = inject(ConfirmService);
  readonly #router = inject(Router);

  dataSource = signal<IDescartesSolution[]>([]);

  ngOnInit(): void {
    const currList: IDescartesSolution[] = JSON.parse(
      localStorage.getItem(LocalStorageKeys.LIST) || '[]',
    );
    this.dataSource.set(currList);
  }

  view(id: string): void {
    this.#router.navigate([`descartes-square/list/${id}/details`]);
  }

  update(id: string): void {
    this.#router.navigate([`descartes-square/list/${id}/edit`]);
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
    this.#router.navigate(['descartes-square/create']).then();
  }
}
