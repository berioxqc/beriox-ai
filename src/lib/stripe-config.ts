import Stripe from 'apos;stripe'apos;;

// Configuration Stripe
export const stripeConfig = {
  publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || 'apos;'apos;,
  secretKey: process.env.STRIPE_SECRET_KEY || 'apos;'apos;,
  currency: 'apos;cad'apos;, // Devise canadienne
  apiVersion: 'apos;2023-10-16'apos; as const
};

// Instance Stripe côté serveur
export const stripe = new Stripe(stripeConfig.secretKey, {
  apiVersion: stripeConfig.apiVersion,
  typescript: true
});

// Plans de tarification
export const pricingPlans = {
  basic: {
    id: 'apos;price_basic'apos;,
    name: 'apos;Plan Basic'apos;,
    price: 29,
    currency: 'apos;cad'apos;,
    interval: 'apos;month'apos;,
    features: [
      'apos;Accès aux agents IA de base'apos;,
      'apos;5 missions par mois'apos;,
      'apos;Support par email'apos;,
      'apos;Mises à jour régulières'apos;
    ]
  },
  professional: {
    id: 'apos;price_professional'apos;,
    name: 'apos;Plan Professional'apos;,
    price: 79,
    currency: 'apos;cad'apos;,
    interval: 'apos;month'apos;,
    features: [
      'apos;Tous les agents IA'apos;,
      'apos;Missions illimitées'apos;,
      'apos;Support prioritaire'apos;,
      'apos;Analytics avancées'apos;,
      'apos;Intégrations tierces'apos;,
      'apos;API access'apos;
    ]
  },
  enterprise: {
    id: 'apos;price_enterprise'apos;,
    name: 'apos;Plan Enterprise'apos;,
    price: 199,
    currency: 'apos;cad'apos;,
    interval: 'apos;month'apos;,
    features: [
      'apos;Tout du plan Professional'apos;,
      'apos;Support dédié'apos;,
      'apos;Formation personnalisée'apos;,
      'apos;Intégrations sur mesure'apos;,
      'apos;SLA garanti'apos;,
      'apos;Déploiement privé possible'apos;
    ]
  }
};

// Webhook events à gérer
export const webhookEvents = [
  'apos;payment_intent.succeeded'apos;,
  'apos;payment_intent.payment_failed'apos;,
  'apos;customer.subscription.created'apos;,
  'apos;customer.subscription.updated'apos;,
  'apos;customer.subscription.deleted'apos;,
  'apos;invoice.payment_succeeded'apos;,
  'apos;invoice.payment_failed'apos;
];

// Configuration des produits Stripe
export const stripeProducts = {
  basic: {
    name: 'apos;Beriox AI - Plan Basic'apos;,
    description: 'apos;Accès aux agents IA de base avec 5 missions par mois'apos;,
    metadata: {
      plan: 'apos;basic'apos;,
      missions_limit: 'apos;5'apos;,
      features: 'apos;basic_agents,email_support'apos;
    }
  },
  professional: {
    name: 'apos;Beriox AI - Plan Professional'apos;,
    description: 'apos;Accès complet avec missions illimitées et analytics'apos;,
    metadata: {
      plan: 'apos;professional'apos;,
      missions_limit: 'apos;unlimited'apos;,
      features: 'apos;all_agents,analytics,integrations,api_access'apos;
    }
  },
  enterprise: {
    name: 'apos;Beriox AI - Plan Enterprise'apos;,
    description: 'apos;Solution complète avec support dédié et SLA'apos;,
    metadata: {
      plan: 'apos;enterprise'apos;,
      missions_limit: 'apos;unlimited'apos;,
      features: 'apos;all_agents,dedicated_support,sla,custom_integrations'apos;
    }
  }
};

// Utilitaires pour Stripe
export const stripeUtils = {
  // Formater le prix pour l'apos;affichage
  formatPrice: (amount: number, currency: string = 'apos;cad'apos;) => {
    return new Intl.NumberFormat('apos;fr-CA'apos;, {
      style: 'apos;currency'apos;,
      currency: currency.toUpperCase()
    }).format(amount / 100);
  },

  // Créer un PaymentIntent
  createPaymentIntent: async (amount: number, currency: string = 'apos;cad'apos;, metadata?: Record<string, string>) => {
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
      payment_behavior: 'apos;default_incomplete'apos;,
      payment_settings: { save_default_payment_method: 'apos;on_subscription'apos; },
      expand: ['apos;latest_invoice.payment_intent'apos;],
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

  // Récupérer les factures d'apos;un client
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
    object: any;
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

// Interface pour les données d'apos;abonnement
export interface SubscriptionData {
  customerId: string;
  priceId: string;
  metadata?: Record<string, string>;
  trialPeriodDays?: number;
}

export default stripe;
