import {
  Component,
  computed,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IDescartesSolution } from '../../definitions/interfaces/descartes-solution.interface';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { filter, first, tap } from 'rxjs';
import { ConfirmService } from '@core/services/confirm.service';
import { SolutionsRepository } from '@descartes/services/solutions-repository';
import { DescartesSolutionCard } from '../descartes-solution-card/descartes-solution-card';

export type ListFilter = 'all' | 'drafts' | 'solutions';

function isSolution(item: IDescartesSolution): boolean {
  return item.status === 'solution';
}

@Component({
  selector: 'app-descartes-list',
  imports: [MatButton, MatIcon, DescartesSolutionCard],
  templateUrl: './descartes-list.html',
  styleUrl: './descartes-list.scss',
})
export class DescartesList implements OnInit {
  readonly #confirmService = inject(ConfirmService);
  readonly #router = inject(Router);
  readonly #route = inject(ActivatedRoute);
  readonly #repository = inject(SolutionsRepository);

  dataSource = signal<IDescartesSolution[]>([]);

  // The selected tab lives in the URL (`?filter=`), so it survives a refresh
  // and stays consistent however the page was reached.
  readonly statusFilter = input<ListFilter, string>('all', {
    alias: 'filter',
    transform: (value) =>
      value === 'drafts' || value === 'solutions' ? value : 'all',
  });

  readonly solutionCount = computed(
    () => this.dataSource().filter(isSolution).length,
  );
  readonly draftCount = computed(
    () => this.dataSource().length - this.solutionCount(),
  );

  readonly filteredSolutions = computed(() => {
    const items = this.dataSource();
    switch (this.statusFilter()) {
      case 'drafts':
        return items.filter((item) => !isSolution(item));
      case 'solutions':
        return items.filter(isSolution);
      default:
        return items;
    }
  });

  ngOnInit(): void {
    this.dataSource.set(this.#repository.list());
  }

  setFilter(value: ListFilter): void {
    this.#router.navigate([], {
      relativeTo: this.#route,
      queryParams: { filter: value === 'all' ? null : value },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  view(id: string): void {
    this.#router.navigate([`descartes-square/list/${id}/review`], {
      queryParams: { isPreview: true },
    });
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
