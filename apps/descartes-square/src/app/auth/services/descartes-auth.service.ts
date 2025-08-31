import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of, tap } from 'rxjs';
import { environment } from '@environment/environment';
import { IUserDto, IAuthLogin, Maybe, IAuthLogout } from '@shared/src';
import { IAuthForm } from '@shared-ui/src/lib/auth/interfaces/auth-form-interface';

@Injectable({ providedIn: 'root' })
export class DescartesAuthService {
  currentUser = signal<Maybe<IUserDto>>(null);

  #httpClient = inject(HttpClient);
  #baseUrl = environment.apiUrl;

  signIn(payload: IAuthForm): Observable<IAuthLogin> {
    return this.#httpClient.post<IAuthLogin>(
      `${this.#baseUrl}/auth/login`,
      payload,
    );
  }

  signUp(payload: IAuthForm): Observable<IAuthLogin> {
    return this.#httpClient.post<IAuthLogin>(
      `${this.#baseUrl}/auth/signup`,
      payload,
    );
  }

  signOut(): Observable<IAuthLogout> {
    return this.#httpClient
      .get<IAuthLogout>(`${this.#baseUrl}/auth/logout`)
      .pipe(
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
