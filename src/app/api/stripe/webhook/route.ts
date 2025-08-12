import { NextRequest, NextResponse } from 'apos;next/server'apos;;
import { headers } from 'apos;next/headers'apos;;
import { validateWebhook, STRIPE_WEBHOOK_EVENTS } from 'apos;@/lib/stripe'apos;;
import { prisma } from 'apos;@/lib/prisma'apos;;
import { logger } from 'apos;@/lib/logger'apos;;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('apos;stripe-signature'apos;);

    if (!signature) {
      logger.error('apos;Webhook: Missing stripe-signature header'apos;);
      return NextResponse.json(
        { error: 'apos;Missing stripe-signature header'apos; },
        { status: 400 }
      );
    }

    // Validation du webhook
    let event;
    try {
      event = validateWebhook(body, signature);
    } catch (err) {
      logger.error('apos;Webhook: Invalid signature'apos;, { error: err.message });
      return NextResponse.json(
        { error: 'apos;Invalid signature'apos; },
        { status: 400 }
      );
    }

    logger.info('apos;Webhook: Event received'apos;, { 
      type: event.type, 
      id: event.id 
    });

    // Traitement des événements
    switch (event.type) {
      case 'apos;checkout.session.completed'apos;:
        await handleCheckoutSessionCompleted(event.data.object);
        break;

      case 'apos;customer.subscription.created'apos;:
        await handleSubscriptionCreated(event.data.object);
        break;

      case 'apos;customer.subscription.updated'apos;:
        await handleSubscriptionUpdated(event.data.object);
        break;

      case 'apos;customer.subscription.deleted'apos;:
        await handleSubscriptionDeleted(event.data.object);
        break;

      case 'apos;invoice.payment_succeeded'apos;:
        await handleInvoicePaymentSucceeded(event.data.object);
        break;

      case 'apos;invoice.payment_failed'apos;:
        await handleInvoicePaymentFailed(event.data.object);
        break;

      case 'apos;customer.created'apos;:
        await handleCustomerCreated(event.data.object);
        break;

      case 'apos;customer.updated'apos;:
        await handleCustomerUpdated(event.data.object);
        break;

      default:
        logger.warn('apos;Webhook: Unhandled event type'apos;, { type: event.type });
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    logger.error('apos;Webhook: Error processing event'apos;, { error: error.message });
    return NextResponse.json(
      { error: 'apos;Webhook processing failed'apos; },
      { status: 500 }
    );
  }
}

// Gestion de la session de checkout complétée
async function handleCheckoutSessionCompleted(session: any) {
  try {
    const { customer, subscription, metadata } = session;
    
    if (!customer || !subscription) {
      logger.error('apos;Webhook: Missing customer or subscription in checkout session'apos;);
      return;
    }

    // Mise à jour de l'apos;utilisateur avec les informations Stripe
    await prisma.user.updateMany({
      where: { 
        email: metadata?.email || customer.email 
      },
      data: {
        stripeCustomerId: customer,
        subscriptionId: subscription,
        subscriptionStatus: 'apos;active'apos;,
        subscriptionPlan: getPlanFromPriceId(session.line_items?.data?.[0]?.price?.id),
        updatedAt: new Date()
      }
    });

    logger.info('apos;Webhook: Checkout session completed'apos;, {
      customerId: customer,
      subscriptionId: subscription,
      plan: getPlanFromPriceId(session.line_items?.data?.[0]?.price?.id)
    });

  } catch (error) {
    logger.error('apos;Webhook: Error handling checkout session completed'apos;, { error: error.message });
  }
}

// Gestion de la création d'apos;abonnement
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

    logger.info('apos;Webhook: Subscription created'apos;, {
      subscriptionId: id,
      customerId: customer,
      status
    });

  } catch (error) {
    logger.error('apos;Webhook: Error handling subscription created'apos;, { error: error.message });
  }
}

// Gestion de la mise à jour d'apos;abonnement
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

    logger.info('apos;Webhook: Subscription updated'apos;, {
      subscriptionId: id,
      customerId: customer,
      status,
      cancelAtPeriodEnd: cancel_at_period_end
    });

  } catch (error) {
    logger.error('apos;Webhook: Error handling subscription updated'apos;, { error: error.message });
  }
}

// Gestion de la suppression d'apos;abonnement
async function handleSubscriptionDeleted(subscription: any) {
  try {
    const { id, customer } = subscription;
    
    await prisma.user.updateMany({
      where: { stripeCustomerId: customer },
      data: {
        subscriptionStatus: 'apos;canceled'apos;,
        subscriptionEndDate: new Date(),
        updatedAt: new Date()
      }
    });

    logger.info('apos;Webhook: Subscription deleted'apos;, {
      subscriptionId: id,
      customerId: customer
    });

  } catch (error) {
    logger.error('apos;Webhook: Error handling subscription deleted'apos;, { error: error.message });
  }
}

// Gestion du paiement d'apos;invoice réussi
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
        status: 'apos;succeeded'apos;,
        paymentDate: new Date()
      }
    });

    logger.info('apos;Webhook: Invoice payment succeeded'apos;, {
      invoiceId: invoice.id,
      customerId: customer,
      amount: amount_paid,
      currency
    });

  } catch (error) {
    logger.error('apos;Webhook: Error handling invoice payment succeeded'apos;, { error: error.message });
  }
}

// Gestion du paiement d'apos;invoice échoué
async function handleInvoicePaymentFailed(invoice: any) {
  try {
    const { customer, subscription, amount_due, currency } = invoice;
    
    // Enregistrement de l'apos;échec de paiement
    await prisma.payment.create({
      data: {
        stripeInvoiceId: invoice.id,
        stripeCustomerId: customer,
        stripeSubscriptionId: subscription,
        amount: amount_due,
        currency: currency,
        status: 'apos;failed'apos;,
        paymentDate: new Date()
      }
    });

    logger.warn('apos;Webhook: Invoice payment failed'apos;, {
      invoiceId: invoice.id,
      customerId: customer,
      amount: amount_due,
      currency
    });

  } catch (error) {
    logger.error('apos;Webhook: Error handling invoice payment failed'apos;, { error: error.message });
  }
}

// Gestion de la création de client
async function handleCustomerCreated(customer: any) {
  try {
    logger.info('apos;Webhook: Customer created'apos;, {
      customerId: customer.id,
      email: customer.email
    });

  } catch (error) {
    logger.error('apos;Webhook: Error handling customer created'apos;, { error: error.message });
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

    logger.info('apos;Webhook: Customer updated'apos;, {
      customerId: id,
      email,
      name
    });

  } catch (error) {
    logger.error('apos;Webhook: Error handling customer updated'apos;, { error: error.message });
  }
}

// Fonction utilitaire pour déterminer le plan à partir du price ID
function getPlanFromPriceId(priceId: string): string {
  if (!priceId) return 'apos;unknown'apos;;
  
  if (priceId.includes('apos;competitor_intelligence_yearly'apos;)) {
    return 'apos;competitor_intelligence_yearly'apos;;
  } else if (priceId.includes('apos;competitor_intelligence'apos;)) {
    return 'apos;competitor_intelligence'apos;;
  }
  
  return 'apos;unknown'apos;;
}
