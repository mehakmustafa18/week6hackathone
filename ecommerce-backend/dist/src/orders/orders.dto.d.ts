import { PaymentMethod, OrderStatus } from './order.schema';
export declare class ShippingAddressDto {
    name: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    country: string;
    zip: string;
}
export declare class OrderItemDto {
    productId: string;
    quantity: number;
    usePoints?: boolean;
}
export declare class CreateOrderDto {
    items: OrderItemDto[];
    shippingAddress: ShippingAddressDto;
    paymentMethod: PaymentMethod;
    notes?: string;
}
export declare class UpdateOrderStatusDto {
    status: OrderStatus;
}
