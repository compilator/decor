import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  BehaviorSubject,
  Observable,
  catchError,
  finalize,
  map,
  of,
  tap,
  throwError
} from 'rxjs';
import { environment } from '../../../environments/environment';
import { CartCountType, CartType } from '../../../types/cart.type';
import { DefaultResponseType } from '../../../types/default-response.type';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartSubject = new BehaviorSubject<CartType | null>(null);
  private cartCountSubject = new BehaviorSubject<number>(0);
  private updatingIds = new Set<string>();
  private updatingSubject = new BehaviorSubject<ReadonlySet<string>>(new Set());

  cart$ = this.cartSubject.asObservable();
  cartCount$ = this.cartCountSubject.asObservable();
  updatingIds$ = this.updatingSubject.asObservable();

  constructor(private http: HttpClient) {
  }

  getCart(): Observable<CartType | DefaultResponseType> {
    return this.http.get<CartType | DefaultResponseType>(environment.api + '/cart');
  }

  getCartCount(): Observable<CartCountType | DefaultResponseType> {
    return this.http.get<CartCountType | DefaultResponseType>(environment.api + '/cart/count');
  }

  updateCart(productId: string, quantity: number): Observable<CartType | DefaultResponseType> {
    return this.http.post<CartType | DefaultResponseType>(environment.api + '/cart', {
      productId,
      quantity
    });
  }

  clearCart(): Observable<DefaultResponseType> {
    return this.http.delete<DefaultResponseType>(environment.api + '/cart');
  }

  getProductQuantity(productId: string): number {
    const cart = this.cartSubject.value;
    if (!cart) {
      return 0;
    }
    const item = cart.items.find(cartItem => cartItem.product.id === productId);
    return item ? item.quantity : 0;
  }

  isUpdating(productId: string): boolean {
    return this.updatingIds.has(productId);
  }

  loadCartCount(): Observable<number> {
    return this.getCartCount().pipe(
      map(response => {
        if (this.isCountResponse(response)) {
          this.cartCountSubject.next(response.count);
          return response.count;
        }
        this.cartCountSubject.next(0);
        return 0;
      }),
      catchError(() => {
        this.cartCountSubject.next(0);
        return of(0);
      })
    );
  }

  loadCart(): Observable<CartType> {
    return this.getCart().pipe(
      map(response => {
        if (this.isCartResponse(response)) {
          this.applyCart(response);
          return response;
        }
        const empty: CartType = { items: [] };
        this.applyCart(empty);
        return empty;
      }),
      catchError(() => {
        const empty: CartType = { items: [] };
        this.applyCart(empty);
        return of(empty);
      })
    );
  }

  setProductQuantity(productId: string, quantity: number): Observable<CartType> {
    if (this.updatingIds.has(productId)) {
      return throwError(() => new Error('Обновление уже выполняется'));
    }

    this.setUpdating(productId, true);

    return this.updateCart(productId, quantity).pipe(
      map(response => {
        if (this.isCartResponse(response)) {
          this.applyCart(response);
          return response;
        }
        throw new Error((response as DefaultResponseType).message || 'Не удалось обновить корзину');
      }),
      catchError(error => throwError(() => error)),
      finalize(() => this.setUpdating(productId, false))
    );
  }

  isCartResponse(data: CartType | DefaultResponseType): data is CartType {
    return Array.isArray((data as CartType).items);
  }

  isCountResponse(data: CartCountType | DefaultResponseType): data is CartCountType {
    return typeof (data as CartCountType).count === 'number';
  }

  private applyCart(cart: CartType): void {
    this.cartSubject.next(cart);
    const count = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    this.cartCountSubject.next(count);
  }

  private setUpdating(productId: string, value: boolean): void {
    if (value) {
      this.updatingIds.add(productId);
    } else {
      this.updatingIds.delete(productId);
    }
    this.updatingSubject.next(new Set(this.updatingIds));
  }
}
