import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthComponent } from '@shared-ui/src/lib/auth/auth';
import { AuthService } from '@shared-ui/src/lib/auth/services/auth.service';
import { DescartesAuthService } from './services/descartes-auth.service';
import { Router } from '@angular/router';
import { MenuRoutes } from '@core/enums/menu-routes.enum';

@Component({
  selector: 'app-auth',
  imports: [CommonModule, AuthComponent],
  providers: [{ provide: AuthService, useClass: DescartesAuthService }],
  templateUrl: './auth.html',
})
export class Auth {
  #router = inject(Router);
  submit(): void {
    this.#router.navigate([MenuRoutes.DESCARTES_SQUARE]).then();
  }
}
