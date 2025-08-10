import Stripe from 'stripe';

// Configuration Stripe avec gestion des environnements
const isProduction = process.env.NODE_ENV === 'production';
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY is not configured');
}

// Configuration Stripe
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-07-30.basil',
  typescript: true,
});

// Plans de facturation
export const STRIPE_PLANS = {
  COMPETITOR_INTELLIGENCE: {
    id: isProduction ? 'price_competitor_intelligence_prod' : 'price_competitor_intelligence_test',
    name: 'Competitor Intelligence',
    price: 4500, // 45.00 USD en centimes
    currency: 'usd',
    interval: 'month',
    features: [
      'Veille concurrentielle avancée',
      'Analyses SimilarWeb & SEMrush',
      'Alertes en temps réel',
      'Rapports détaillés',
      'Support prioritaire'
    ]
  },
  COMPETITOR_INTELLIGENCE_YEARLY: {
    id: isProduction ? 'price_competitor_intelligence_yearly_prod' : 'price_competitor_intelligence_yearly_test',
    name: 'Competitor Intelligence (Annuel)',
    price: 36000, // 360.00 USD en centimes (2 mois gratuits)
    currency: 'usd',
    interval: 'year',
    features: [
      'Veille concurrentielle avancée',
      'Analyses SimilarWeb & SEMrush',
      'Alertes en temps réel',
      'Rapports détaillés',
      'Support prioritaire',
      '2 mois gratuits'
    ]
  }
};

// Webhook events à gérer
export const STRIPE_WEBHOOK_EVENTS = [
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.payment_succeeded',
  'invoice.payment_failed',
  'customer.created',
  'customer.updated'
];

// Validation du webhook
export const validateWebhook = (payload: string, signature: string) => {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
  }

  try {
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    throw new Error(`Webhook signature verification failed: ${err.message}`);
  }
};

// Création d'une session de checkout
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
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata,
    allow_promotion_codes: true,
    billing_address_collection: 'required',
    customer_creation: customerId ? undefined : 'always',
  });

  return session;
};

// Création d'un portail client
export const createCustomerPortalSession = async (customerId: string, returnUrl: string) => {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session;
};

// Récupération d'un client
export const getCustomer = async (customerId: string) => {
  return await stripe.customers.retrieve(customerId);
};

// Mise à jour d'un client
export const updateCustomer = async (customerId: string, data: Stripe.CustomerUpdateParams) => {
  return await stripe.customers.update(customerId, data);
};

// Récupération des abonnements d'un client
export const getCustomerSubscriptions = async (customerId: string) => {
  return await stripe.subscriptions.list({
    customer: customerId,
    status: 'all',
    expand: ['data.default_payment_method'],
  });
};

// Annulation d'un abonnement
export const cancelSubscription = async (subscriptionId: string, cancelAtPeriodEnd = true) => {
  if (cancelAtPeriodEnd) {
    return await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
  } else {
    return await stripe.subscriptions.cancel(subscriptionId);
  }
};

// Récupération d'un abonnement
export const getSubscription = async (subscriptionId: string) => {
  return await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ['default_payment_method', 'customer'],
  });
};

// Création d'un remboursement
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
    expand: ['data.payment_intent'],
  });
};

// Vérification du statut d'un paiement
export const getPaymentStatus = async (paymentIntentId: string) => {
  return await stripe.paymentIntents.retrieve(paymentIntentId);
};

// Création d'un coupon
export const createCoupon = async (data: Stripe.CouponCreateParams) => {
  return await stripe.coupons.create(data);
};

// Récupération d'un coupon
export const getCoupon = async (couponId: string) => {
  return await stripe.coupons.retrieve(couponId);
};

// Suppression d'un coupon
export const deleteCoupon = async (couponId: string) => {
  return await stripe.coupons.del(couponId);
};

// Récupération des métriques de facturation
export const getBillingMetrics = async (customerId: string) => {
  const subscriptions = await getCustomerSubscriptions(customerId);
  const invoices = await getBillingEvents(customerId, 50);

  const totalRevenue = invoices.data
    .filter(invoice => invoice.status === 'paid')
    .reduce((sum, invoice) => sum + (invoice.amount_paid || 0), 0);

  const activeSubscriptions = subscriptions.data.filter(sub => 
    ['active', 'trialing'].includes(sub.status)
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
