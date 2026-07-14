import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { UserService } from '../../../shared/services/user.service';
import {
  DeliveryUi,
  PaymentUi,
  toDeliveryType,
  toDeliveryUi,
  toPaymentType,
  toPaymentUi
} from '../../../shared/utils/order-form.util';
import { UserType } from '../../../../types/user.type';
import { DefaultResponseType } from '../../../../types/default-response.type';

@Component({
  selector: 'app-info',
  templateUrl: './info.component.html',
  styleUrl: './info.component.scss',
  standalone: false
})
export class InfoComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  firstName = '';
  lastName = '';
  patronymic = '';
  phone = '';
  email = '';
  city = '';
  street = '';
  house = '';
  apartment = '';
  delivery: DeliveryUi = 'courier';
  payment: PaymentUi = 'cash';

  loading = true;
  saving = false;
  errorMessage = '';
  successMessage = '';

  constructor(private userService: UserService) {
  }

  ngOnInit(): void {
    this.loading = true;
    this.errorMessage = '';
    this.userService.loadUser().pipe(
      finalize(() => {
        this.loading = false;
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: response => {
        if (this.userService.isUserResponse(response)) {
          this.applyUser(response);
          return;
        }
        this.errorMessage = (response as DefaultResponseType).message || 'Не удалось загрузить профиль';
      },
      error: err => {
        const message = err?.error?.message;
        this.errorMessage = typeof message === 'string' && message
          ? message
          : 'Не удалось загрузить профиль';
      }
    });
  }

  save(): void {
    if (this.saving) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';
    this.saving = true;

    const payload: UserType = {
      firstName: this.firstName.trim(),
      lastName: this.lastName.trim(),
      fatherName: this.patronymic.trim(),
      phone: this.phone.trim(),
      email: this.email.trim(),
      street: this.street.trim(),
      house: this.house.trim(),
      apartment: this.apartment.trim(),
      deliveryType: toDeliveryType(this.delivery),
      paymentType: toPaymentType(this.payment)
    };

    this.userService.updateUser(payload).pipe(
      finalize(() => {
        this.saving = false;
      })
    ).subscribe({
      next: response => {
        if (response.error) {
          this.errorMessage = response.message || 'Не удалось сохранить профиль';
          return;
        }
        this.successMessage = response.message || 'Данные сохранены';
      },
      error: err => {
        const message = err?.error?.message;
        this.errorMessage = typeof message === 'string' && message
          ? message
          : 'Не удалось сохранить профиль';
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
}
