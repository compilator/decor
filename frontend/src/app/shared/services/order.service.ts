import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateOrderType, OrderType } from '../../../types/order.type';
import { DefaultResponseType } from '../../../types/default-response.type';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private orderJustCompleted = false;

  constructor(private http: HttpClient) {
  }

  getOrders(): Observable<OrderType[] | DefaultResponseType> {
    return this.http.get<OrderType[] | DefaultResponseType>(environment.api + '/orders');
  }

  createOrder(order: CreateOrderType): Observable<OrderType | DefaultResponseType> {
    return this.http.post<OrderType | DefaultResponseType>(environment.api + '/orders', order);
  }

  markOrderCompleted(): void {
    this.orderJustCompleted = true;
  }

  consumeOrderCompleted(): boolean {
    const value = this.orderJustCompleted;
    this.orderJustCompleted = false;
    return value;
  }

  clearLocalState(): void {
    this.orderJustCompleted = false;
  }
}
