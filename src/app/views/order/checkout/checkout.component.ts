import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { catchError, finalize, of, switchMap, throwError } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { CartService } from '../../../shared/services/cart.service';
import { OrderService } from '../../../shared/services/order.service';
import { UserService } from '../../../shared/services/user.service';
import {
  DeliveryUi,
  PaymentUi,
  toDeliveryType,
  toDeliveryUi,
  toPaymentType,
  toPaymentUi
} from '../../../shared/utils/order-form.util';
import { CartType } from '../../../../types/cart.type';
import { CreateOrderType, OrderType } from '../../../../types/order.type';
import { DefaultResponseType } from '../../../../types/default-response.type';
import { UserType } from '../../../../types/user.type';

const DELIVERY_COST = 10;

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss',
  standalone: false
})
export class CheckoutComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  delivery: DeliveryUi = 'courier';
  payment: PaymentUi = 'cash';

  firstName = '';
  lastName = '';
  patronymic = '';
  phone = '';
  email = '';
  city = '';
  street = '';
  house = '';
  apartment = '';
  comment = '';

  items: CartType['items'] = [];
  submitting = false;
  errorMessage = '';

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private userService: UserService,
    private authService: AuthService,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    this.cartService.cart$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(cart => {
      this.items = cart?.items || [];
    });

    this.cartService.loadCart().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();

    if (this.authService.isLogged()) {
      this.userService.loadUser().pipe(
        takeUntilDestroyed(this.destroyRef)
      ).subscribe({
        next: response => {
          if (this.userService.isUserResponse(response)) {
            this.applyUser(response);
          }
        },
        error: () => undefined
      });
    }
  }

  get itemsCount(): number {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  get productsTotal(): number {
    return this.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }

  get deliveryPrice(): number {
    return this.delivery === 'courier' ? DELIVERY_COST : 0;
  }

  get grandTotal(): number {
    return this.productsTotal + this.deliveryPrice;
  }

  get deliveryCostLabel(): string {
    return this.delivery === 'courier' ? `${DELIVERY_COST} BYN` : '0 BYN';
  }

  submit(): void {
    if (this.submitting || this.itemsCount === 0) {
      return;
    }

    this.errorMessage = '';
    this.submitting = true;

    const payload: CreateOrderType = {
      deliveryType: toDeliveryType(this.delivery),
      firstName: this.firstName.trim(),
      lastName: this.lastName.trim(),
      phone: this.phone.trim(),
      email: this.email.trim(),
      paymentType: toPaymentType(this.payment)
    };

    const fatherName = this.patronymic.trim();
    if (fatherName) {
      payload.fatherName = fatherName;
    }

    const comment = this.comment.trim();
    if (comment) {
      payload.comment = comment;
    }

    if (payload.deliveryType === 'delivery') {
      payload.street = this.street.trim();
      payload.house = this.house.trim();
      const apartment = this.apartment.trim();
      if (apartment) {
        payload.apartment = apartment;
      }
    }

    this.orderService.createOrder(payload).pipe(
      switchMap(response => {
        if (this.isErrorResponse(response)) {
          return throwError(() => new Error(response.message || 'Не удалось оформить заказ'));
        }

        if (!this.isOrderResponse(response)) {
          return throwError(() => new Error('Не удалось оформить заказ'));
        }

        this.orderService.markOrderCompleted();
        return this.cartService.loadCart().pipe(
          catchError(() => of(null)),
          switchMap(() => of(response))
        );
      }),
      finalize(() => {
        this.submitting = false;
      })
    ).subscribe({
      next: () => {
        this.router.navigate(['/order-success']);
      },
      error: err => {
        const message = err?.error?.message || err?.message;
        this.errorMessage = typeof message === 'string' && message
          ? message
          : 'Не удалось оформить заказ';
      }
    });
  }

  private applyUser(user: UserType): void {
    this.firstName = user.firstName || '';
    this.lastName = user.lastName || '';
    this.patronymic = user.fatherName || '';
    this.phone = user.phone || '';
    this.email = user.email || '';
    this.street = user.street || '';
    this.house = user.house || '';
    this.apartment = user.apartment || '';
    this.delivery = toDeliveryUi(user.deliveryType);
    this.payment = toPaymentUi(user.paymentType);
  }

  private isErrorResponse(data: OrderType | DefaultResponseType): data is DefaultResponseType {
    return typeof (data as DefaultResponseType).error === 'boolean'
      && (data as DefaultResponseType).error;
  }

  private isOrderResponse(data: OrderType | DefaultResponseType): data is OrderType {
    return Array.isArray((data as OrderType).items)
      && typeof (data as OrderType).totalAmount === 'number';
  }
}
