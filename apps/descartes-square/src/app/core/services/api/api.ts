import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environment/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  readonly #apiUrl = environment.apiUrl;
  readonly #httpClient = inject(HttpClient);

  getApi(): Observable<unknown> {
    return this.#httpClient.get(this.#apiUrl);
  }

  test(): Observable<unknown> {
    return this.#httpClient.get(`${this.#apiUrl}/users/test-connection`);
  }

  getAllUsers(): Observable<unknown> {
    return this.#httpClient.get(`${this.#apiUrl}/users`);
  }

  createTestUser(): Observable<unknown> {
    return this.#httpClient.post(`${this.#apiUrl}/users/create`, {
      username: 'Roman',
      email: 'test@emal.com',
      password: 'PASSWORD',
      createdAt: Date.now(),
    });
  }
}
