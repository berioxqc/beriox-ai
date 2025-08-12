import Stripe from 'apos;stripe'apos;;

// Configuration Stripe avec gestion des environnements
const isProduction = process.env.NODE_ENV === 'apos;production'apos;;
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error('apos;STRIPE_SECRET_KEY is not configured'apos;);
}

// Configuration Stripe
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: 'apos;2025-07-30.basil'apos;,
  typescript: true,
});

// Plans de facturation
export const STRIPE_PLANS = {
  COMPETITOR_INTELLIGENCE: {
    id: isProduction ? 'apos;price_competitor_intelligence_prod'apos; : 'apos;price_competitor_intelligence_test'apos;,
    name: 'apos;Competitor Intelligence'apos;,
    price: 4500, // 45.00 USD en centimes
    currency: 'apos;usd'apos;,
    interval: 'apos;month'apos;,
    features: [
      'apos;Veille concurrentielle avancée'apos;,
      'apos;Analyses SimilarWeb & SEMrush'apos;,
      'apos;Alertes en temps réel'apos;,
      'apos;Rapports détaillés'apos;,
      'apos;Support prioritaire'apos;
    ]
  },
  COMPETITOR_INTELLIGENCE_YEARLY: {
    id: isProduction ? 'apos;price_competitor_intelligence_yearly_prod'apos; : 'apos;price_competitor_intelligence_yearly_test'apos;,
    name: 'apos;Competitor Intelligence (Annuel)'apos;,
    price: 36000, // 360.00 USD en centimes (2 mois gratuits)
    currency: 'apos;usd'apos;,
    interval: 'apos;year'apos;,
    features: [
      'apos;Veille concurrentielle avancée'apos;,
      'apos;Analyses SimilarWeb & SEMrush'apos;,
      'apos;Alertes en temps réel'apos;,
      'apos;Rapports détaillés'apos;,
      'apos;Support prioritaire'apos;,
      'apos;2 mois gratuits'apos;
    ]
  }
};

// Webhook events à gérer
export const STRIPE_WEBHOOK_EVENTS = [
  'apos;checkout.session.completed'apos;,
  'apos;customer.subscription.created'apos;,
  'apos;customer.subscription.updated'apos;,
  'apos;customer.subscription.deleted'apos;,
  'apos;invoice.payment_succeeded'apos;,
  'apos;invoice.payment_failed'apos;,
  'apos;customer.created'apos;,
  'apos;customer.updated'apos;
];

// Validation du webhook
export const validateWebhook = (payload: string, signature: string) => {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    throw new Error('apos;STRIPE_WEBHOOK_SECRET is not configured'apos;);
  }

  try {
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    throw new Error(`Webhook signature verification failed: ${err.message}`);
  }
};

// Création d'apos;une session de checkout
export const createCheckoutSession = async ({
  customerId,
  priceId,
  successUrl,
  cancelUrl,
  metadata = {}
}: {
  customerId?: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}) => {
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['apos;card'apos;],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'apos;subscription'apos;,
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata,
    allow_promotion_codes: true,
    billing_address_collection: 'apos;required'apos;,
    customer_creation: customerId ? undefined : 'apos;always'apos;,
  });

  return session;
};

// Création d'apos;un portail client
export const createCustomerPortalSession = async (customerId: string, returnUrl: string) => {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session;
};

// Récupération d'apos;un client
export const getCustomer = async (customerId: string) => {
  return await stripe.customers.retrieve(customerId);
};

// Mise à jour d'apos;un client
export const updateCustomer = async (customerId: string, data: Stripe.CustomerUpdateParams) => {
  return await stripe.customers.update(customerId, data);
};

// Récupération des abonnements d'apos;un client
export const getCustomerSubscriptions = async (customerId: string) => {
  return await stripe.subscriptions.list({
    customer: customerId,
    status: 'apos;all'apos;,
    expand: ['apos;data.default_payment_method'apos;],
  });
};

// Annulation d'apos;un abonnement
export const cancelSubscription = async (subscriptionId: string, cancelAtPeriodEnd = true) => {
  if (cancelAtPeriodEnd) {
    return await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
  } else {
    return await stripe.subscriptions.cancel(subscriptionId);
  }
};

// Récupération d'apos;un abonnement
export const getSubscription = async (subscriptionId: string) => {
  return await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ['apos;default_payment_method'apos;, 'apos;customer'apos;],
  });
};

// Création d'apos;un remboursement
export const createRefund = async (paymentIntentId: string, amount?: number, reason?: Stripe.RefundCreateParams.Reason) => {
  const refundData: Stripe.RefundCreateParams = {
    payment_intent: paymentIntentId,
  };

  if (amount) {
    refundData.amount = amount;
  }

  if (reason) {
    refundData.reason = reason;
  }

  return await stripe.refunds.create(refundData);
};

// Récupération des événements de facturation
export const getBillingEvents = async (customerId: string, limit = 10) => {
  return await stripe.invoices.list({
    customer: customerId,
    limit,
    expand: ['apos;data.payment_intent'apos;],
  });
};

// Vérification du statut d'apos;un paiement
export const getPaymentStatus = async (paymentIntentId: string) => {
  return await stripe.paymentIntents.retrieve(paymentIntentId);
};

// Création d'apos;un coupon
export const createCoupon = async (data: Stripe.CouponCreateParams) => {
  return await stripe.coupons.create(data);
};

// Récupération d'apos;un coupon
export const getCoupon = async (couponId: string) => {
  return await stripe.coupons.retrieve(couponId);
};

// Suppression d'apos;un coupon
export const deleteCoupon = async (couponId: string) => {
  return await stripe.coupons.del(couponId);
};

// Récupération des métriques de facturation
export const getBillingMetrics = async (customerId: string) => {
  const subscriptions = await getCustomerSubscriptions(customerId);
  const invoices = await getBillingEvents(customerId, 50);

  const totalRevenue = invoices.data
    .filter(invoice => invoice.status === 'apos;paid'apos;)
    .reduce((sum, invoice) => sum + (invoice.amount_paid || 0), 0);

  const activeSubscriptions = subscriptions.data.filter(sub => 
    ['apos;active'apos;, 'apos;trialing'apos;].includes(sub.status)
  );

  return {
    totalRevenue,
    activeSubscriptions: activeSubscriptions.length,
    totalInvoices: invoices.data.length,
    lastInvoice: invoices.data[0],
    nextBillingDate: activeSubscriptions[0]?.current_period_end
  };
};

export default stripe;
