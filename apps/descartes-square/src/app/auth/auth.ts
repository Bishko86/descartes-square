import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthComponent } from '@shared-ui/src/lib/auth/auth';
import { AuthService } from '@shared-ui/src/lib/auth/services/auth.service';
import { DescartesAuthService } from './services/descartes-auth.service';
import { Router } from '@angular/router';
import { MenuRoutes } from '@core/enums/menu-routes.enum';
import { Maybe } from '@shared/src/lib/types/maybe.type';
import { iif, of, tap } from 'rxjs';

@Component({
  selector: 'app-auth',
  imports: [CommonModule, AuthComponent],
  providers: [{ provide: AuthService, useClass: DescartesAuthService }],
  templateUrl: './auth.html',
})
export class Auth {
  #router = inject(Router);
  #authService = inject(DescartesAuthService);

  submit(userId: Maybe<string>): void {
    iif(
      () => !!userId,
      this.#authService.getUserById(userId as string),
      of(null),
    )
      .pipe(
        tap(() => {
          this.#router.navigate([MenuRoutes.DESCARTES_SQUARE]).then();
        }),
      )
      .subscribe();
  }
}
