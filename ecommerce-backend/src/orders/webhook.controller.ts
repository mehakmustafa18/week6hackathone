import { Controller, Post, Headers, Req, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OrdersService } from './orders.service';
import { StripeService } from './stripe.service';
import { Request } from 'express';
import { Public } from '../common/decorators/public.decorator';

@Controller('orders/webhook')
export class WebhookController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly stripeService: StripeService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Post()
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() request: Request,
  ) {
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }

    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
    let event;

    try {
      // We need the raw body for Stripe signature verification
      // Note: NestJS by default parses the body. We might need to adjust main.ts 
      // or use a middleware to get the raw body.
      const rawBody = (request as any).rawBody || request.body;
      event = this.stripeService.verifyWebhookSignature(
        rawBody,
        signature,
        webhookSecret,
      );
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    console.log(`[Webhook] Received event type: ${event.type}`);

    const session = event.data.object as any;

    try {
      switch (event.type) {
        case 'checkout.session.completed':
          console.log(`[Webhook] Finalizing order for session: ${session.id}`);
          await this.ordersService.finalizeStripeOrder(session.id, session.payment_intent);
          console.log(`[Webhook] Successfully finalized order.`);
          break;
        case 'checkout.session.expired':
        case 'checkout.session.async_payment_failed':
          console.log(`[Webhook] Failing order for session: ${session.id}`);
          await this.ordersService.failStripeOrder(session.id);
          break;
        default:
          console.log(`[Webhook] Unhandled event type ${event.type}`);
      }
    } catch (procErr) {
      console.error(`[Webhook] Error processing event ${event.type}:`, procErr.message);
      // We still return 200 to Stripe to avoid retries if the error is on our side logic
    }

    return { received: true };
  }
}
