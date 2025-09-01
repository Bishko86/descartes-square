import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-descartes-square',
  imports: [RouterOutlet, MatButtonModule],
  templateUrl: './descartes-square.html',
  styleUrl: './descartes-square.scss',
})
export class DescartesSquare {}
