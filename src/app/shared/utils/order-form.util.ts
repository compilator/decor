import { DeliveryType } from '../../../types/delivery.type';
import { PaymentType } from '../../../types/payment.type';

export type DeliveryUi = 'courier' | 'pickup';
export type PaymentUi = 'card-online' | 'cashless' | 'cash';

export function toDeliveryType(ui: DeliveryUi): DeliveryType {
  return ui === 'pickup' ? 'self' : 'delivery';
}

export function toDeliveryUi(type: string | null | undefined): DeliveryUi {
  return type === 'self' ? 'pickup' : 'courier';
}

export function toPaymentType(ui: PaymentUi): PaymentType {
  if (ui === 'card-online') {
    return 'cardOnline';
  }
  if (ui === 'cashless') {
    return 'cardToCourier';
  }
  return 'cashToCourier';
}

export function toPaymentUi(type: string | null | undefined): PaymentUi {
  if (type === 'cardOnline') {
    return 'card-online';
  }
  if (type === 'cardToCourier') {
    return 'cashless';
  }
  return 'cash';
}
