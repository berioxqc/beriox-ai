import Stripe from 'stripe';

// Configuration Stripe
export const stripeConfig = {
  publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
  secretKey: process.env.STRIPE_SECRET_KEY || '',
  currency: 'cad',
  apiVersion: '2023-10-16' as const
};

// Instance Stripe côté serveur
export const stripe = new Stripe(stripeConfig.secretKey, {
  apiVersion: stripeConfig.apiVersion,
  typescript: true
});

// Plans de tarification
export const pricingPlans = {
  basic: {
    id: 'price_basic',
    name: 'Plan Basic',
    price: 29,
    currency: 'cad',
    interval: 'month',
    features: [
      'Accès aux agents IA de base',
      '5 missions par mois',
      'Support par email',
      'Mises à jour régulières'
    ]
  },
  professional: {
    id: 'price_professional',
    name: 'Plan Professional',
    price: 79,
    currency: 'cad',
    interval: 'month',
    features: [
      'Tous les agents IA',
      'Missions illimitées',
      'Support prioritaire',
      'Analytics avancées',
      'Intégrations tierces',
      'API access'
    ]
  },
  enterprise: {
    id: 'price_enterprise',
    name: 'Plan Enterprise',
    price: 199,
    currency: 'cad',
    interval: 'month',
    features: [
      'Tout du plan Professional',
      'Support dédié',
      'Formation personnalisée',
      'Intégrations sur mesure',
      'SLA garanti',
      'Déploiement privé possible'
    ]
  }
};

// Webhook events à gérer
export const webhookEvents = [
  'payment_intent.succeeded',
  'payment_intent.payment_failed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.payment_succeeded',
  'invoice.payment_failed'
];

// Configuration des produits Stripe
export const stripeProducts = {
  basic: {
    name: 'Beriox AI - Plan Basic',
    description: 'Accès aux agents IA de base avec 5 missions par mois',
    metadata: {
      plan: 'basic',
      missions_limit: '5',
      features: 'basic_agents,email_support'
    }
  },
  professional: {
    name: 'Beriox AI - Plan Professional',
    description: 'Accès complet avec missions illimitées et analytics',
    metadata: {
      plan: 'professional',
      missions_limit: 'unlimited',
      features: 'all_agents,analytics,integrations,api_access'
    }
  },
  enterprise: {
    name: 'Beriox AI - Plan Enterprise',
    description: 'Solution complète avec support dédié et SLA',
    metadata: {
      plan: 'enterprise',
      missions_limit: 'unlimited',
      features: 'all_agents,dedicated_support,sla,custom_integrations'
    }
  }
};

// Utilitaires pour Stripe
export const stripeUtils = {
  // Formater le prix pour l'affichage
  formatPrice: (amount: number, currency: string = 'cad') => {
    return new Intl.NumberFormat('fr-CA', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount / 100);
  },

  // Créer un PaymentIntent
  createPaymentIntent: async (amount: number, currency: string = 'cad', metadata?: Record<string, string>) => {
    return await stripe.paymentIntents.create({
      amount,
      currency,
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });
  },

  // Créer un client Stripe
  createCustomer: async (email: string, name?: string, metadata?: Record<string, string>) => {
    return await stripe.customers.create({
      email,
      name,
      metadata
    });
  },

  // Créer un abonnement
  createSubscription: async (customerId: string, priceId: string, metadata?: Record<string, string>) => {
    return await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      metadata,
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    });
  },

  // Récupérer un client
  getCustomer: async (customerId: string) => {
    return await stripe.customers.retrieve(customerId);
  },

  // Mettre à jour un client
  updateCustomer: async (customerId: string, data: Partial<Stripe.CustomerUpdateParams>) => {
    return await stripe.customers.update(customerId, data);
  },

  // Annuler un abonnement
  cancelSubscription: async (subscriptionId: string) => {
    return await stripe.subscriptions.cancel(subscriptionId);
  },

  // Récupérer les factures d'un client
  getCustomerInvoices: async (customerId: string, limit: number = 10) => {
    return await stripe.invoices.list({
      customer: customerId,
      limit
    });
  },

  // Créer un remboursement
  createRefund: async (paymentIntentId: string, amount?: number, reason?: Stripe.RefundCreateParams.Reason) => {
    return await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount,
      reason
    });
  }
};

// Types pour les événements Stripe
export interface StripeWebhookEvent {
  id: string;
  object: string;
  api_version: string;
  created: number;
  data: {
    object: Record<string, unknown>;
  };
  livemode: boolean;
  pending_webhooks: number;
  request: {
    id: string;
    idempotency_key: string | null;
  };
  type: string;
}

// Interface pour les données de paiement
export interface PaymentData {
  amount: number;
  currency: string;
  customerId?: string;
  paymentMethodId?: string;
  metadata?: Record<string, string>;
  description?: string;
}

// Interface pour les données d'abonnement
export interface SubscriptionData {
  customerId: string;
  priceId: string;
  metadata?: Record<string, string>;
  trialPeriodDays?: number;
}

export default stripe;
