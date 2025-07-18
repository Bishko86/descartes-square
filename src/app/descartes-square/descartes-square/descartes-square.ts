import {Component, effect, OnInit, signal, inject, Injector,} from '@angular/core';
import {NgClass} from '@angular/common';
import {ActivatedRoute, Router, RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-descartes-square',
  imports: [
    NgClass,
    RouterOutlet
  ],
  templateUrl: './descartes-square.html',
  styleUrl: './descartes-square.scss'
})
export class DescartesSquare implements OnInit {
  private readonly _router = inject(Router);
  private readonly _route = inject(ActivatedRoute);
  private readonly _injector = inject(Injector);

  public isClicked = signal(false);

  public onClick(): void {
    this.isClicked.update((isClicked) => !isClicked)
  }

  public ngOnInit(): void {
    this.listenToFormVisibility();
  }

  private listenToFormVisibility(): void {
    effect(() => {
      if (this.isClicked()) {
        this._router.navigate(['create'], {relativeTo: this._route});
      } else {
        this._router.navigate(['descartes-square']);
      }
    }, {injector: this._injector});
  }
}
