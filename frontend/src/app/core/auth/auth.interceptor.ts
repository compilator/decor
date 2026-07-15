import { Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import {
  BehaviorSubject,
  Observable,
  catchError,
  filter,
  switchMap,
  take,
  throwError
} from 'rxjs';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { LoginResponseType } from '../../../types/login-response.type';
import { DefaultResponseType } from '../../../types/default-response.type';
import { environment } from '../../../environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
  }

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (!this.isApiRequest(req.url)) {
      return next.handle(req);
    }

    let authReq = req.clone({ withCredentials: true });
    const tokens = this.authService.getTokens();
    if (tokens.accessToken) {
      authReq = authReq.clone({
        setHeaders: {
          'x-access-token': tokens.accessToken
        }
      });
    }

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (
          error.status === 401
          && !this.shouldSkipRefresh(authReq.url)
        ) {
          return this.handle401Error(authReq, next);
        }
        return throwError(() => error);
      })
    );
  }

  private handle401Error(
    req: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.authService.refresh().pipe(
        switchMap((result: DefaultResponseType | LoginResponseType) => {
          if (!this.authService.isLoginResponse(result)) {
            const message = (result as DefaultResponseType).message || 'Ошибка авторизации';
            return throwError(() => new Error(message));
          }

          this.authService.setTokens(result.accessToken, result.refreshToken);
          this.authService.userId = result.userId;
          this.isRefreshing = false;
          this.refreshTokenSubject.next(result.accessToken);

          return next.handle(req.clone({
            setHeaders: {
              'x-access-token': result.accessToken
            },
            withCredentials: true
          }));
        }),
        catchError(error => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(null);
          this.authService.removeTokens();
          this.authService.userId = null;
          this.router.navigate(['/']);
          return throwError(() => error);
        })
      );
    }

    return this.refreshTokenSubject.pipe(
      filter((token): token is string => token !== null),
      take(1),
      switchMap(token => next.handle(req.clone({
        setHeaders: {
          'x-access-token': token
        },
        withCredentials: true
      })))
    );
  }

  private isApiRequest(url: string): boolean {
    return url.startsWith(environment.api)
      || url.includes(environment.api + '/')
      || url.endsWith(environment.api);
  }

  private shouldSkipRefresh(url: string): boolean {
    return url.includes('/login')
      || url.includes('/signup')
      || url.includes('/refresh');
  }
}
