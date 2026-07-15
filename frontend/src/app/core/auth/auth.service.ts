import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { DefaultResponseType } from '../../../types/default-response.type';
import { LoginResponseType } from '../../../types/login-response.type';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public accessTokenKey = 'accessToken';
  public refreshTokenKey = 'refreshToken';
  public userIdKey = 'userId';

  private isLoggedSubject = new BehaviorSubject<boolean>(!!localStorage.getItem(this.accessTokenKey));
  public isLogged$: Observable<boolean> = this.isLoggedSubject.asObservable();

  constructor(private http: HttpClient) {
  }

  signup(
    email: string,
    password: string,
    passwordRepeat: string
  ): Observable<DefaultResponseType | LoginResponseType> {
    return this.http.post<DefaultResponseType | LoginResponseType>(environment.api + '/signup', {
      email,
      password,
      passwordRepeat
    });
  }

  login(
    email: string,
    password: string,
    rememberMe: boolean = false
  ): Observable<DefaultResponseType | LoginResponseType> {
    return this.http.post<DefaultResponseType | LoginResponseType>(environment.api + '/login', {
      email,
      password,
      rememberMe
    });
  }

  logout(): Observable<DefaultResponseType> {
    const tokens = this.getTokens();
    if (!tokens.refreshToken) {
      return of({ error: false, message: 'Нет активного сеанса' });
    }

    return this.http.post<DefaultResponseType>(environment.api + '/logout', {
      refreshToken: tokens.refreshToken
    }).pipe(
      catchError(() => of({ error: true, message: 'Ошибка выхода' }))
    );
  }

  refresh(): Observable<DefaultResponseType | LoginResponseType> {
    const tokens = this.getTokens();
    if (!tokens.refreshToken) {
      return of({ error: true, message: 'Unable to find token' });
    }

    return this.http.post<DefaultResponseType | LoginResponseType>(environment.api + '/refresh', {
      refreshToken: tokens.refreshToken
    });
  }

  isLogged(): boolean {
    return this.isLoggedSubject.value;
  }

  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(this.accessTokenKey, accessToken);
    localStorage.setItem(this.refreshTokenKey, refreshToken);
    this.isLoggedSubject.next(true);
  }

  removeTokens(): void {
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    this.isLoggedSubject.next(false);
  }

  getTokens(): { accessToken: string | null, refreshToken: string | null } {
    return {
      accessToken: localStorage.getItem(this.accessTokenKey),
      refreshToken: localStorage.getItem(this.refreshTokenKey)
    };
  }

  get userId(): string | null {
    return localStorage.getItem(this.userIdKey);
  }

  set userId(id: string | null) {
    if (id) {
      localStorage.setItem(this.userIdKey, id);
    } else {
      localStorage.removeItem(this.userIdKey);
    }
  }

  isLoginResponse(data: DefaultResponseType | LoginResponseType): data is LoginResponseType {
    return !!(data as LoginResponseType).accessToken
      && !!(data as LoginResponseType).refreshToken
      && !!(data as LoginResponseType).userId;
  }
}
