import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserType } from '../../../types/user.type';
import { DefaultResponseType } from '../../../types/default-response.type';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private userSubject = new BehaviorSubject<UserType | null>(null);
  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {
  }

  getUser(): Observable<UserType | DefaultResponseType> {
    return this.http.get<UserType | DefaultResponseType>(environment.api + '/user');
  }

  updateUser(user: UserType): Observable<DefaultResponseType> {
    return this.http.post<DefaultResponseType>(environment.api + '/user', user);
  }

  loadUser(): Observable<UserType | DefaultResponseType> {
    return this.getUser().pipe(
      tap(response => {
        if (this.isUserResponse(response)) {
          this.userSubject.next(response);
        }
      })
    );
  }

  clearLocalState(): void {
    this.userSubject.next(null);
  }

  isUserResponse(data: UserType | DefaultResponseType): data is UserType {
    return !('error' in (data as DefaultResponseType)
      && typeof (data as DefaultResponseType).error === 'boolean');
  }
}
