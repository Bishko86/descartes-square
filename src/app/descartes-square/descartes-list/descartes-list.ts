import {Component, inject, OnInit, signal} from '@angular/core';
import {LocalStorageKeys} from '@core/enums/local-storage-key.enum';
import {MatTableModule} from '@angular/material/table';
import {MoreOptions} from '@core/components/more-options/more-options';
import {IMoreOptions} from '@core/interfaces/more-options.interface';
import {MatIcon} from '@core/enums/mat-icon.enum';
import {MoreOptionAction} from '@core/enums/more-options-action.enum';
import {Router} from '@angular/router';
import {IDescartesSolution} from '../definitions/interfaces/descartes-solution.interface';
import {MatButton} from '@angular/material/button';

@Component({
  selector: 'app-descartes-list',
  imports: [MatTableModule, MoreOptions, MatButton],
  templateUrl: './descartes-list.html',
  styleUrl: './descartes-list.scss'
})
export class DescartesList implements OnInit {
  readonly moreOptions: IMoreOptions[] = [
    {
      icon: MatIcon.EDIT,
      text: 'Edit',
      action: MoreOptionAction.Update
    },
    {
      icon: MatIcon.DELETE,
      text: 'Delete',
      action: MoreOptionAction.Delete
    }]
  dataSource = signal<IDescartesSolution[]>([]);
  displayedColumns = ['id', 'title', 'conclusion', 'options'];

  #router = inject(Router);

  ngOnInit(): void {
    const currList: IDescartesSolution[] = JSON.parse(localStorage.getItem(LocalStorageKeys.LIST) || '[]');
    this.dataSource.set(currList);
  }


  update(id: string): void {
    this.#router.navigate(['descartes-square/edit', id]);
  }

  delete(id: string): void {
    const currList: IDescartesSolution[] = JSON.parse(localStorage.getItem(LocalStorageKeys.LIST) || '[]')
      .filter((item: IDescartesSolution) => item.id !== id);
    localStorage.setItem(
      LocalStorageKeys.LIST,
      JSON.stringify(currList)
    )

    this.dataSource.set(currList);
  }

  addData(): void {
    this.#router.navigate(['descartes-square/create']).then();
  }
}
