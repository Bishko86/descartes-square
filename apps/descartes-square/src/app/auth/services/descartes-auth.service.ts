import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '@shared-ui/src/lib/auth/services/auth.service';
import { Observable } from 'rxjs';
import { environment } from '@environment/environment';
import {
  ISignInPayload,
  ISignUpPayload,
} from '@shared-ui/src/lib/auth/interfaces/submit-payload.interface';
import { IUserDto, IAuthLogin } from '@shared/src';

@Injectable()
export class DescartesAuthService extends AuthService {
  #httpClient = inject(HttpClient);
  #baseUrl = environment.apiUrl;

  signIn(payload: ISignInPayload): Observable<IAuthLogin> {
    return this.#httpClient.post<IAuthLogin>(
      `${this.#baseUrl}/auth/login`,
      payload,
    );
  }

  signUp(payload: ISignUpPayload): Observable<IAuthLogin> {
    return this.#httpClient.post<IAuthLogin>(
      `${this.#baseUrl}/auth/signup`,
      payload,
    );
  }

  refreshTokens(): Observable<IAuthLogin> {
    return this.#httpClient.get<IAuthLogin>(
      `${this.#baseUrl}/auth/refresh`,
      {},
    );
  }

  getUserById(userId: string): Observable<IUserDto> {
    return this.#httpClient.get<IUserDto>(`${this.#baseUrl}/users/${userId}`);
  }
}
