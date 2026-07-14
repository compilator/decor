import { DeliveryType } from './delivery.type';
import { PaymentType } from './payment.type';

export type OrderStatusType = 'new' | 'pending' | 'delivery' | 'cancelled' | 'success';

export type OrderType = {
  items: {
    id: string,
    name: string,
    quantity: number,
    price: number,
    total: number
  }[],
  deliveryCost: number,
  totalAmount: number,
  deliveryType: DeliveryType | string,
  firstName: string,
  lastName: string,
  fatherName?: string,
  phone: string,
  email: string,
  deliveryInfo?: {
    street?: string,
    house?: string,
    entrance?: string,
    apartment?: string
  },
  paymentType: PaymentType | string,
  comment?: string,
  status: OrderStatusType | string,
  createdAt: string
};

export type CreateOrderType = {
  deliveryType: DeliveryType,
  firstName: string,
  lastName: string,
  phone: string,
  email: string,
  paymentType: PaymentType,
  street?: string,
  house?: string,
  entrance?: string,
  apartment?: string,
  comment?: string,
  fatherName?: string
};
