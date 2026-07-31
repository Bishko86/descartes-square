import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Mark } from '@core/components/mark/mark';
import { CONTACT_EMAIL } from '@core/consts/contact.const';
import { MenuRoutes } from '@core/enums/menu-routes.enum';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, Mark],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Footer {
  readonly currentYear = new Date().getFullYear();

  readonly homeRoute = `/${MenuRoutes.HOME}`;
  readonly privacyRoute = `/${MenuRoutes.PRIVACY}`;

  /**
   * `/method` (Layer 3 of #52) doesn't exist yet, so `The method` points at the
   * home page's how-it-works section. Re-point when the route lands.
   */
  readonly methodFragment = 'how-it-works';

  readonly feedbackHref = `mailto:${CONTACT_EMAIL}`;
}
