import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

import { OnEvent } from '../../base';
import { SubscriptionService } from './service';
import { StripeFactory } from './stripe';


@Injectable()
export class StripeWebhook {
  constructor(
    private readonly service: SubscriptionService,
    private readonly stripeProvider: StripeFactory
  ) {}

  get stripe() {
    return this.stripeProvider.stripe;
  }

  @OnEvent('stripe.invoice.created')
  @OnEvent('stripe.invoice.updated')
  @OnEvent('stripe.invoice.finalization_failed')
  @OnEvent('stripe.invoice.payment_failed')
  @OnEvent('stripe.invoice.paid')
  async onInvoiceUpdated(
    event:
      | Stripe.InvoiceCreatedEvent
      | Stripe.InvoiceUpdatedEvent
      | Stripe.InvoiceFinalizationFailedEvent
      | Stripe.InvoicePaymentFailedEvent
      | Stripe.InvoicePaidEvent
  ) {
    const invoice = await this.stripe.invoices.retrieve(event.data.object.id);
    await this.service.saveStripeInvoice(invoice);
  }

  @OnEvent('stripe.customer.subscription.created')
  @OnEvent('stripe.customer.subscription.updated')
  async onSubscriptionChanges(
    event:
      | Stripe.CustomerSubscriptionUpdatedEvent
      | Stripe.CustomerSubscriptionCreatedEvent
  ) {
    const subscription = await this.stripe.subscriptions.retrieve(
      event.data.object.id,
      {
        expand: ['customer'],
      }
    );

    await this.service.saveStripeSubscription(subscription);
  }

  @OnEvent('stripe.customer.subscription.deleted')
  async onSubscriptionDeleted(event: Stripe.CustomerSubscriptionDeletedEvent) {
    await this.service.deleteStripeSubscription(event.data.object);
  }
}
