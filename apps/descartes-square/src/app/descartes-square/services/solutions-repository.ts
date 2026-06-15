import { Injectable } from '@angular/core';

import { LocalStorageKeys } from '@core/enums/local-storage-key.enum';
import {
  IDescartesSolution,
  SolutionStatus,
} from '@descartes/definitions/interfaces/descartes-solution.interface';
import { Maybe } from '@shared/src/lib/types/maybe.type';

@Injectable({ providedIn: 'root' })
export class SolutionsRepository {
  list(): IDescartesSolution[] {
    const stored = this.#read();
    const migrated = stored.map((item) => this.#ensureStatus(item));
    const changed = migrated.some(
      (item, index) => item.status !== stored[index].status,
    );
    if (changed) {
      this.#write(migrated);
    }
    return migrated;
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

  // Corrupted or non-array storage (manual edits, partial writes, foreign
  // data on the key) would otherwise crash the whole list view — degrade to
  // an empty list instead.
  #read(): IDescartesSolution[] {
    try {
      const parsed: unknown = JSON.parse(
        localStorage.getItem(LocalStorageKeys.LIST) ?? '[]',
      );
      return Array.isArray(parsed) ? (parsed as IDescartesSolution[]) : [];
    } catch {
      return [];
    }
  }

  #write(list: IDescartesSolution[]): void {
    localStorage.setItem(LocalStorageKeys.LIST, JSON.stringify(list));
  }

  // Back-fills the explicit `status` for cards saved before it existed,
  // deriving it from the legacy "conclusion present → solution" rule.
  #ensureStatus(item: IDescartesSolution): IDescartesSolution {
    if (item.status === 'draft' || item.status === 'solution') {
      return item;
    }
    const status: SolutionStatus = item.conclusion?.trim()
      ? 'solution'
      : 'draft';
    return { ...item, status };
  }
}
