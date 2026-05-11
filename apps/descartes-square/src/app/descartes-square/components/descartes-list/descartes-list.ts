import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { IDescartesSolution } from '../../definitions/interfaces/descartes-solution.interface';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { filter, first, tap } from 'rxjs';
import { ConfirmService } from '@core/services/confirm.service';
import { SolutionsRepository } from '@descartes/services/solutions-repository';
import { DescartesSolutionCard } from '../descartes-solution-card/descartes-solution-card';

@Component({
  selector: 'app-descartes-list',
  imports: [MatButton, MatIcon, DescartesSolutionCard],
  templateUrl: './descartes-list.html',
  styleUrl: './descartes-list.scss',
})
export class DescartesList implements OnInit {
  readonly #confirmService = inject(ConfirmService);
  readonly #router = inject(Router);
  readonly #repository = inject(SolutionsRepository);

  dataSource = signal<IDescartesSolution[]>([]);

  ngOnInit(): void {
    this.dataSource.set(this.#repository.list());
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
          this.dataSource.set(this.#repository.remove(id));
        }),
      )
      .subscribe();
  }

  addData(): void {
    this.#router.navigate(['descartes-square/create']).then();
  }
}
