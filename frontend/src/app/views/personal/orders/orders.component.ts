import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { OrderService } from '../../../shared/services/order.service';
import { DefaultResponseType } from '../../../../types/default-response.type';
import { OrderStatusType, OrderType } from '../../../../types/order.type';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss',
  standalone: false
})
export class OrdersComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  orders: OrderType[] = [];
  loading = true;
  errorMessage = '';

  constructor(private orderService: OrderService) {
  }

  ngOnInit(): void {
    this.loading = true;
    this.errorMessage = '';

    this.orderService.getOrders().pipe(
      finalize(() => {
        this.loading = false;
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: response => {
        if (this.isErrorResponse(response)) {
          this.orders = [];
          this.errorMessage = response.message || 'Не удалось загрузить заказы';
          return;
        }

        if (!Array.isArray(response)) {
          this.orders = [];
          this.errorMessage = 'Не удалось загрузить заказы';
          return;
        }

        this.orders = [...response].sort((a, b) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
      },
      error: err => {
        this.orders = [];
        const message = err?.error?.message;
        this.errorMessage = typeof message === 'string' && message
          ? message
          : 'Не удалось загрузить заказы';
      }
    });
  }

  orderNumber(order: OrderType): string {
    const stamp = new Date(order.createdAt).getTime();
    if (Number.isNaN(stamp)) {
      return '—';
    }
    return String(stamp).slice(-4);
  }

  statusLabel(status: OrderStatusType | string): string {
    switch (status) {
      case 'new':
        return 'Новый';
      case 'pending':
        return 'В обработке';
      case 'delivery':
        return 'Доставка';
      case 'cancelled':
        return 'Отменён';
      case 'success':
        return 'Выполнен';
      default:
        return String(status || '');
    }
  }

  statusClass(status: OrderStatusType | string): string {
    if (status === 'success') {
      return 'orders-item__status--completed';
    }
    if (status === 'cancelled') {
      return 'orders-item__status--cancelled';
    }
    return '';
  }

  productsCount(order: OrderType): number {
    return order.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  formatDate(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '';
    }
    return date.toLocaleDateString('ru-RU');
  }

  private isErrorResponse(data: OrderType[] | DefaultResponseType): data is DefaultResponseType {
    return !Array.isArray(data)
      && typeof (data as DefaultResponseType).error === 'boolean';
  }
}
