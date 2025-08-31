import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '@shared-ui/src/lib/auth/services/auth.service';
import { catchError, Observable, of, tap } from 'rxjs';
import { environment } from '@environment/environment';
import {
  ISignInPayload,
  ISignUpPayload,
} from '@shared-ui/src/lib/auth/interfaces/submit-payload.interface';
import { IUserDto, IAuthLogin, Maybe } from '@shared/src';

@Injectable()
export class DescartesAuthService extends AuthService {
  currentUser = signal<Maybe<IUserDto>>(null);

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

  signOut(): Observable<void> {
    return this.#httpClient.get<void>(`${this.#baseUrl}/auth/logout`).pipe(
      tap(() => {
        this.currentUser.set(null);
      }),
    );
  }

  refreshTokens(): Observable<IAuthLogin> {
    return this.#httpClient.get<IAuthLogin>(`${this.#baseUrl}/auth/refresh`, {
      withCredentials: true,
    });
  }

  getUserById(userId: string): Observable<IUserDto> {
    return this.#httpClient.get<IUserDto>(`${this.#baseUrl}/users/${userId}`);
  }

  getCurrentUser(): Observable<Maybe<IUserDto>> {
    return this.#httpClient.get<IUserDto>(`${this.#baseUrl}/users/me`).pipe(
      tap((user: IUserDto) => {
        this.currentUser.set(user);
      }),
      catchError(() => {
        this.currentUser.set(null);
        return of(null);
      }),
    );
  }
}
