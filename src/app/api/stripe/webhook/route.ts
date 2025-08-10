import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { validateWebhook, STRIPE_WEBHOOK_EVENTS } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      logger.error('Webhook: Missing stripe-signature header');
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    // Validation du webhook
    let event;
    try {
      event = validateWebhook(body, signature);
    } catch (err) {
      logger.error('Webhook: Invalid signature', { error: err.message });
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    logger.info('Webhook: Event received', { 
      type: event.type, 
      id: event.id 
    });

    // Traitement des événements
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object);
        break;

      case 'customer.created':
        await handleCustomerCreated(event.data.object);
        break;

      case 'customer.updated':
        await handleCustomerUpdated(event.data.object);
        break;

      default:
        logger.warn('Webhook: Unhandled event type', { type: event.type });
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    logger.error('Webhook: Error processing event', { error: error.message });
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Gestion de la session de checkout complétée
async function handleCheckoutSessionCompleted(session: any) {
  try {
    const { customer, subscription, metadata } = session;
    
    if (!customer || !subscription) {
      logger.error('Webhook: Missing customer or subscription in checkout session');
      return;
    }

    // Mise à jour de l'utilisateur avec les informations Stripe
    await prisma.user.updateMany({
      where: { 
        email: metadata?.email || customer.email 
      },
      data: {
        stripeCustomerId: customer,
        subscriptionId: subscription,
        subscriptionStatus: 'active',
        subscriptionPlan: getPlanFromPriceId(session.line_items?.data?.[0]?.price?.id),
        updatedAt: new Date()
      }
    });

    logger.info('Webhook: Checkout session completed', {
      customerId: customer,
      subscriptionId: subscription,
      plan: getPlanFromPriceId(session.line_items?.data?.[0]?.price?.id)
    });

  } catch (error) {
    logger.error('Webhook: Error handling checkout session completed', { error: error.message });
  }
}

// Gestion de la création d'abonnement
async function handleSubscriptionCreated(subscription: any) {
  try {
    const { id, customer, status, current_period_end } = subscription;
    
    await prisma.user.updateMany({
      where: { stripeCustomerId: customer },
      data: {
        subscriptionId: id,
        subscriptionStatus: status,
        subscriptionEndDate: new Date(current_period_end * 1000),
        updatedAt: new Date()
      }
    });

    logger.info('Webhook: Subscription created', {
      subscriptionId: id,
      customerId: customer,
      status
    });

  } catch (error) {
    logger.error('Webhook: Error handling subscription created', { error: error.message });
  }
}

// Gestion de la mise à jour d'abonnement
async function handleSubscriptionUpdated(subscription: any) {
  try {
    const { id, customer, status, current_period_end, cancel_at_period_end } = subscription;
    
    await prisma.user.updateMany({
      where: { stripeCustomerId: customer },
      data: {
        subscriptionStatus: status,
        subscriptionEndDate: new Date(current_period_end * 1000),
        cancelAtPeriodEnd: cancel_at_period_end,
        updatedAt: new Date()
      }
    });

    logger.info('Webhook: Subscription updated', {
      subscriptionId: id,
      customerId: customer,
      status,
      cancelAtPeriodEnd: cancel_at_period_end
    });

  } catch (error) {
    logger.error('Webhook: Error handling subscription updated', { error: error.message });
  }
}

// Gestion de la suppression d'abonnement
async function handleSubscriptionDeleted(subscription: any) {
  try {
    const { id, customer } = subscription;
    
    await prisma.user.updateMany({
      where: { stripeCustomerId: customer },
      data: {
        subscriptionStatus: 'canceled',
        subscriptionEndDate: new Date(),
        updatedAt: new Date()
      }
    });

    logger.info('Webhook: Subscription deleted', {
      subscriptionId: id,
      customerId: customer
    });

  } catch (error) {
    logger.error('Webhook: Error handling subscription deleted', { error: error.message });
  }
}

// Gestion du paiement d'invoice réussi
async function handleInvoicePaymentSucceeded(invoice: any) {
  try {
    const { customer, subscription, amount_paid, currency } = invoice;
    
    // Enregistrement du paiement
    await prisma.payment.create({
      data: {
        stripeInvoiceId: invoice.id,
        stripeCustomerId: customer,
        stripeSubscriptionId: subscription,
        amount: amount_paid,
        currency: currency,
        status: 'succeeded',
        paymentDate: new Date()
      }
    });

    logger.info('Webhook: Invoice payment succeeded', {
      invoiceId: invoice.id,
      customerId: customer,
      amount: amount_paid,
      currency
    });

  } catch (error) {
    logger.error('Webhook: Error handling invoice payment succeeded', { error: error.message });
  }
}

// Gestion du paiement d'invoice échoué
async function handleInvoicePaymentFailed(invoice: any) {
  try {
    const { customer, subscription, amount_due, currency } = invoice;
    
    // Enregistrement de l'échec de paiement
    await prisma.payment.create({
      data: {
        stripeInvoiceId: invoice.id,
        stripeCustomerId: customer,
        stripeSubscriptionId: subscription,
        amount: amount_due,
        currency: currency,
        status: 'failed',
        paymentDate: new Date()
      }
    });

    logger.warn('Webhook: Invoice payment failed', {
      invoiceId: invoice.id,
      customerId: customer,
      amount: amount_due,
      currency
    });

  } catch (error) {
    logger.error('Webhook: Error handling invoice payment failed', { error: error.message });
  }
}

// Gestion de la création de client
async function handleCustomerCreated(customer: any) {
  try {
    logger.info('Webhook: Customer created', {
      customerId: customer.id,
      email: customer.email
    });

  } catch (error) {
    logger.error('Webhook: Error handling customer created', { error: error.message });
  }
}

// Gestion de la mise à jour de client
async function handleCustomerUpdated(customer: any) {
  try {
    const { id, email, name, metadata } = customer;
    
    await prisma.user.updateMany({
      where: { stripeCustomerId: id },
      data: {
        name: name || undefined,
        email: email || undefined,
        updatedAt: new Date()
      }
    });

    logger.info('Webhook: Customer updated', {
      customerId: id,
      email,
      name
    });

  } catch (error) {
    logger.error('Webhook: Error handling customer updated', { error: error.message });
  }
}

// Fonction utilitaire pour déterminer le plan à partir du price ID
function getPlanFromPriceId(priceId: string): string {
  if (!priceId) return 'unknown';
  
  if (priceId.includes('competitor_intelligence_yearly')) {
    return 'competitor_intelligence_yearly';
  } else if (priceId.includes('competitor_intelligence')) {
    return 'competitor_intelligence';
  }
  
  return 'unknown';
}
