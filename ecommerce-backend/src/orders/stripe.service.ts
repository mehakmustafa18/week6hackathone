import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Stripe } from 'stripe';
import { OrderDocument } from './order.schema';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(private configService: ConfigService) {
    const StripeClass = require('stripe');
    this.stripe = new StripeClass(this.configService.get<string>('STRIPE_SECRET_KEY'), {
      apiVersion: '2023-10-16',
    });
  }

  async createCheckoutSession(order: OrderDocument, userEmail: string) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
    
    const lineItems = order.items
      .filter(item => !item.paidWithPoints) // Only pay for money items
      .map(item => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.productName,
            images: item.productImage ? [item.productImage] : [],
          },
          unit_amount: Math.round(item.price * 100), // Stripe expects amounts in cents
        },
        quantity: item.quantity,
      }));

    // Add shipping if it's not already included in the total or items
    // Based on checkout/page.tsx, there's a $15 shipping fee
    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'Shipping Fee',
          images: [],
        },
        unit_amount: 1500, // $15.00
      },
      quantity: 1,
    });

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${frontendUrl}/profile?orderId=${order._id}&success=true`,
      cancel_url: `${frontendUrl}/checkout?orderId=${order._id}&cancelled=true`,
      customer_email: userEmail,
      metadata: {
        orderId: order._id.toString(),
        userId: order.user.toString(),
      },
    });

    return session;
  }

  verifyWebhookSignature(payload: string | Buffer, signature: string, secret: string) {
    return this.stripe.webhooks.constructEvent(payload, signature, secret);
  }
}
