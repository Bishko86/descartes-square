import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthComponent } from '@shared-ui/src/lib/auth/auth';
import { DescartesAuthService } from './services/descartes-auth.service';
import { Router } from '@angular/router';
import { MenuRoutes } from '@core/enums/menu-routes.enum';
import { switchMap, take } from 'rxjs';
import { IAuthSubmit } from '@shared-ui/src/lib/auth/interfaces/submit-payload.interface';

@Component({
  selector: 'app-auth',
  imports: [CommonModule, AuthComponent],
  templateUrl: './auth.html',
})
export class Auth {
  #router = inject(Router);
  #authService = inject(DescartesAuthService);

  submit({ isSignUp, payload }: IAuthSubmit): void {
    if (isSignUp) {
      this.#authService
        .signUp(payload)
        .pipe(
          take(1),
          switchMap(() => this.#router.navigate([MenuRoutes.SIGN_IN])),
        )
        .subscribe();
    } else {
      this.#authService
        .signIn(payload)
        .pipe(
          take(1),
          switchMap(() => this.#authService.getCurrentUser()),
          switchMap(() => this.#router.navigate([MenuRoutes.DESCARTES_SQUARE])),
        )
        .subscribe();
    }
  }
}
