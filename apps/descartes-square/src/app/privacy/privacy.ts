import { ChangeDetectionStrategy, Component } from '@angular/core';

import { CONTACT_EMAIL } from '@core/consts/contact.const';

/**
 * Placeholder privacy page — deliberately honest rather than filler, because the
 * app stores accounts and personal decision text and forwards that text to a
 * third-party model. Replace with reviewed copy when it exists (#67).
 */
@Component({
  selector: 'app-privacy',
  imports: [],
  templateUrl: './privacy.html',
  styleUrl: './privacy.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Privacy {
  readonly contactEmail = CONTACT_EMAIL;
  readonly contactHref = `mailto:${CONTACT_EMAIL}`;
}
