import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import {
  BehaviorSubject,
  catchError,
  filter,
  switchMap,
  take,
  tap,
  throwError,
} from 'rxjs';
import { DescartesAuthService } from '@auth/services/descartes-auth.service';
import { inject } from '@angular/core';
import { Maybe } from '@shared/src';

let refreshInProgress = false;
const refreshCompleted$ = new BehaviorSubject<Maybe<boolean>>(null);

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const authReq = req.clone({ withCredentials: true });
  const authService = inject(DescartesAuthService);

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      const isUnauthorized = error.status === 401;
      // Don't try to refresh if the request was already the refresh or login call
      if (
        authReq.url.includes('/auth/refresh') ||
        authReq.url.includes('/auth/login') ||
        !isUnauthorized
      ) {
        return throwError(() => error);
      }

      // If no refresh is in progress, start one
      if (!refreshInProgress) {
        refreshInProgress = true;
        refreshCompleted$.next(null); // indicate the refresh token is "in-progress"

        return authService.refreshTokens().pipe(
          tap(() => {
            refreshInProgress = false;
            refreshCompleted$.next(true); // refresh succeeded
          }),
          switchMap(() => next(authReq)), // retry original request
          catchError((refreshErr) => {
            refreshInProgress = false;
            refreshCompleted$.next(false); // refresh failed
            return throwError(() => refreshErr);
          }),
        );
      }

      // If refresh is in progress, wait until it finishes and then act
      return refreshCompleted$.pipe(
        filter((v) => v !== null), // wait until we have a true/false outcome
        take(1),
        switchMap((success) => {
          if (success === true) {
            // refresh succeeded -> retry original
            return next(authReq);
          }
          // refresh failed -> propagate a proper error (or redirect to login)
          return throwError(
            () =>
              new HttpErrorResponse({
                status: 401,
                statusText: 'Refresh failed',
              }),
          );
        }),
      );
    }),
  );
};
