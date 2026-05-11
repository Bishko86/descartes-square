import { Injectable } from '@angular/core';

import { LocalStorageKeys } from '@core/enums/local-storage-key.enum';
import { IDescartesSolution } from '@descartes/definitions/interfaces/descartes-solution.interface';
import { Maybe } from '@shared/src/lib/types/maybe.type';

@Injectable({ providedIn: 'root' })
export class SolutionsRepository {
  list(): IDescartesSolution[] {
    return JSON.parse(localStorage.getItem(LocalStorageKeys.LIST) ?? '[]');
  }

  findById(id: string): Maybe<IDescartesSolution> {
    return this.list().find((item) => item.id === id);
  }

  upsert(solution: IDescartesSolution): void {
    if (!solution.id) return;
    const list = this.list();
    const idx = list.findIndex((item) => item.id === solution.id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...solution };
    } else {
      list.push(solution);
    }
    this.#write(list);
  }

  remove(id: string): IDescartesSolution[] {
    const next = this.list().filter((item) => item.id !== id);
    this.#write(next);
    return next;
  }

  #write(list: IDescartesSolution[]): void {
    localStorage.setItem(LocalStorageKeys.LIST, JSON.stringify(list));
  }
}
