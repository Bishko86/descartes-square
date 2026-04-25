import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-lock-overlay',
  imports: [MatIconModule],
  templateUrl: './lock-overlay.html',
  styleUrl: './lock-overlay.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'lock-overlay', 'aria-hidden': 'true' },
})
export class LockOverlay {}
