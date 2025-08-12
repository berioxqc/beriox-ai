// Système de plans et paywall pour Beriox AI

export interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  stripeProductId?: string;
  stripePriceId?: string;
  features: string[];
  limits: {
    missionsPerMonth: number;
    agentsAvailable: string[];
    apiIntegrations: string[];
    supportLevel: 'community' | 'email' | 'priority' | 'dedicated';
    customIntegrations: boolean;
    whiteLabel: boolean;
  };
  popular?: boolean;
}

export const PLANS: Record<string, Plan> = {
  FREE: {
    id: 'free',
    name: '🧪 Apprenti',
    price: 0,
    currency: 'CAD',
    interval: 'month',
    features: [
      '3 missions par mois',
      '4 agents IA de base',
      'Questions d\'alignement standards',
      'Rapports standards',
      'Support communautaire'
    ],
    limits: {
      missionsPerMonth: 3,
      agentsAvailable: ['karine', 'hugo', 'jpbot', 'elodie'],
      apiIntegrations: [],
      supportLevel: 'community',
      customIntegrations: false,
      whiteLabel: false
    }
  },

  STARTER: {
    id: 'starter',
    name: '⚗️ Alchimiste',
    price: 49,
    currency: 'CAD',
    interval: 'month',
    stripePriceId: process.env.STRIPE_STARTER_PRICE_ID,
    features: [
      '25 missions par mois',
      'Tous les agents IA workflow',
      '🤖 Questions GPT personnalisées',
      'Rapports avancés',
      'Support par email',
      '3 intégrations API essentielles',
      'Tableaux de bord basiques',
      'Export données CSV'
    ],
    limits: {
      missionsPerMonth: 25,
      agentsAvailable: ['karine', 'hugo', 'jpbot', 'elodie', 'clara', 'faucon'],
      apiIntegrations: ['pagespeed', 'security', 'uptime'],
      supportLevel: 'email',
      customIntegrations: false,
      whiteLabel: false
    },
    popular: true
  },

  PRO: {
    id: 'pro',
    name: '🔮 Mage',
    price: 149,
    currency: 'CAD',
    interval: 'month',
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID,
    features: [
      '100 missions par mois',
      'Tous les agents + bots spécialisés',
      '🤖 Questions GPT personnalisées',
      'Toutes les intégrations API premium',
      'Analyses automatiques quotidiennes',
      'Support prioritaire',
      'Tableaux de bord avancés avec graphiques',
      'Export PDF/Excel',
      'Alertes temps réel',
      'Données historiques 12 mois'
    ],
    limits: {
      missionsPerMonth: 100,
      agentsAvailable: ['all'],
      apiIntegrations: ['all'],
      supportLevel: 'priority',
      customIntegrations: true,
      whiteLabel: false
    }
  },

  ENTERPRISE: {
    id: 'enterprise',
    name: '👑 Archimage',
    price: 449,
    currency: 'CAD',
    interval: 'month',
    stripePriceId: process.env.STRIPE_ENTERPRISE_PRICE_ID,
    features: [
      'Missions illimitées',
      'Tous les agents + bots custom',
      '🤖 Questions GPT personnalisées',
      'Intégrations personnalisées illimitées',
      'API dédiée avec webhooks',
      'Support dédié 24/7',
      'White-label complet',
      'SLA 99.9%',
      'Formation équipe',
      'Tableaux de bord multi-clients',
      'Données historiques illimitées',
      'Rapports automatisés personnalisés'
    ],
    limits: {
      missionsPerMonth: -1, // Illimité
      agentsAvailable: ['all'],
      apiIntegrations: ['all'],
      supportLevel: 'dedicated',
      customIntegrations: true,
      whiteLabel: true
    }
  }
};

// Bots disponibles par plan
export const BOT_ACCESS: Record<string, string[]> = {
  free: [],
  starter: ['speedbot', 'securitybot'],
  pro: ['speedbot', 'securitybot', 'analyticsbot', 'seobot', 'uptimebot', 'accessibilitybot', 'competitorbot'],
  enterprise: ['all'] // Tous les bots actuels et futurs
};

// APIs externes disponibles par plan (avec coûts réels considérés)
export const API_INTEGRATIONS: Record<string, string[]> = {
  free: [], // Aucune API externe (coûteuse)
  starter: ['pagespeed', 'security', 'uptime'], // APIs basiques
  pro: [
    'pagespeed', 'security', 'analytics', 'searchconsole', 
    'social', 'ads', 'reviews', 'uptime', 'seo', 'accessibility'
  ], // APIs premium avec limites
  enterprise: ['all'] // Toutes les APIs sans limites
};

// Limites d'appels API par plan (par mois)
export const API_LIMITS: Record<string, Record<string, number>> = {
  free: {},
  starter: {
    'pagespeed': 500,
    'security': 100,
    'uptime': 1000
  },
  pro: {
    'pagespeed': 2000,
    'security': 500,
    'analytics': 1000,
    'searchconsole': 1000,
    'social': 500,
    'ads': 300,
    'reviews': 200,
    'uptime': 5000,
    'seo': 1000,
    'accessibility': 200
  },
  enterprise: {} // Illimité
};

export class PlanService {
  /**
   * Vérifie si un utilisateur peut créer une mission
   */
  static canCreateMission(userPlan: string, currentMissions: number): boolean {
    const plan = PLANS[userPlan.toUpperCase()];
    if (!plan) return false;
    
    if (plan.limits.missionsPerMonth === -1) return true; // Illimité
    return currentMissions < plan.limits.missionsPerMonth;
  }

  /**
   * Vérifie si un agent est disponible pour un plan
   */
  static canUseAgent(userPlan: string, agentId: string): boolean {
    const plan = PLANS[userPlan.toUpperCase()];
    if (!plan) return false;
    
    if (plan.limits.agentsAvailable.includes('all')) return true;
    return plan.limits.agentsAvailable.includes(agentId);
  }

  /**
   * Vérifie si une intégration API est disponible
   */
  static canUseIntegration(userPlan: string, integrationId: string): boolean {
    const plan = PLANS[userPlan.toUpperCase()];
    if (!plan) return false;
    
    if (plan.limits.apiIntegrations.includes('all')) return true;
    return plan.limits.apiIntegrations.includes(integrationId);
  }

  /**
   * Obtient les agents disponibles pour un plan
   */
  static getAvailableAgents(userPlan: string): string[] {
    const plan = PLANS[userPlan.toUpperCase()];
    if (!plan) return [];
    
    if (plan.limits.agentsAvailable.includes('all')) {
      return ['karine', 'hugo', 'jpbot', 'elodie', 'clara', 'faucon', 'speedbot', 'securitybot', 'analyticsbot'];
    }
    
    return plan.limits.agentsAvailable;
  }

  /**
   * Obtient les bots spécialisés disponibles pour un plan
   */
  static getAvailableBots(userPlan: string): string[] {
    const bots = BOT_ACCESS[userPlan.toLowerCase()] || [];
    if (bots.includes('all')) {
      return ['speedbot', 'securitybot', 'analyticsbot', 'seobot', 'uptimebot', 'accessibilitybot'];
    }
    return bots;
  }

  /**
   * Vérifie si l'utilisateur peut utiliser les questions GPT personnalisées
   * Fonctionnalité premium réservée aux plans payants
   */
  static canUseGPTQuestions(userPlan: string): boolean {
    const plan = PLANS[userPlan.toUpperCase()];
    if (!plan) return false;
    
    // Questions GPT réservées aux plans payants (pas gratuit)
    return plan.id !== 'free';
  }

  /**
   * Détermine le plan effectif d'un utilisateur (en tenant compte des accès premium temporaires)
   */
  static getEffectivePlan(userPlan: string, premiumAccess?: {
    planId: string;
    endDate: Date;
    isActive: boolean;
  }): string {
    // Si l'utilisateur a un accès premium actif et non expiré
    if (premiumAccess && premiumAccess.isActive && premiumAccess.endDate > new Date()) {
      return premiumAccess.planId;
    }
    
    // Sinon, retourner le plan de base
    return userPlan || 'free';
  }

  /**
   * Vérifie si un utilisateur a un accès premium temporaire actif
   */
  static hasPremiumAccess(premiumAccess?: {
    planId: string;
    endDate: Date;
    isActive: boolean;
  }): boolean {
    return !!(premiumAccess && premiumAccess.isActive && premiumAccess.endDate > new Date());
  }

  /**
   * Calcule les jours restants d'accès premium
   */
  static getPremiumDaysLeft(premiumAccess?: {
    endDate: Date;
    isActive: boolean;
  }): number {
    if (!premiumAccess || !premiumAccess.isActive) return 0;
    
    const now = new Date();
    const endDate = new Date(premiumAccess.endDate);
    
    if (endDate <= now) return 0;
    
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }

  /**
   * Calcule le prix avec réduction annuelle
   */
  static getAnnualPrice(plan: Plan): number {
    return Math.round(plan.price * 12 * 0.83); // 17% de réduction
  }

  /**
   * Calcule les taxes canadiennes (TPS 5% + TVQ 9.975%)
   */
  static getCanadianTaxes(price: number): { tps: number; tvq: number; total: number } {
    const tps = price * 0.05; // TPS 5%
    const tvq = (price + tps) * 0.09975; // TVQ 9.975% sur le montant + TPS
    const total = price + tps + tvq;
    
    return {
      tps: Math.round(tps * 100) / 100,
      tvq: Math.round(tvq * 100) / 100,
      total: Math.round(total * 100) / 100
    };
  }

  /**
   * Formate le prix avec taxes pour l'affichage
   */
  static formatPriceWithTaxes(plan: Plan): {
    basePrice: string;
    tps: string;
    tvq: string;
    totalPrice: string;
    monthlyTotal: string;
    annualTotal: string;
  } {
    if (plan.price === 0) {
      return {
        basePrice: 'Gratuit',
        tps: '0,00 $',
        tvq: '0,00 $',
        totalPrice: '0,00 $',
        monthlyTotal: 'Gratuit',
        annualTotal: 'Gratuit'
      };
    }

    const taxes = this.getCanadianTaxes(plan.price);
    const annualPrice = this.getAnnualPrice(plan);
    const annualTaxes = this.getCanadianTaxes(annualPrice / 12);

    return {
      basePrice: `${plan.price.toFixed(2)} $`,
      tps: `${taxes.tps.toFixed(2)} $`,
      tvq: `${taxes.tvq.toFixed(2)} $`,
      totalPrice: `${taxes.total.toFixed(2)} $`,
      monthlyTotal: `${taxes.total.toFixed(2)} $/mois`,
      annualTotal: `${(annualPrice + annualTaxes.total * 12).toFixed(2)} $/an`
    };
  }

  /**
   * Génère les métadonnées Stripe pour un plan
   */
  static getStripeMetadata(planId: string, userId: string) {
    return {
      planId,
      userId,
      product: 'beriox-ai',
      version: '1.0'
    };
  }

  /**
   * Vérifie les limites d'usage
   */
  static checkLimits(userPlan: string, usage: {
    missionsThisMonth: number;
    requestedAgents: string[];
    requestedIntegrations: string[];
  }): {
    canProceed: boolean;
    blockedReasons: string[];
    upgradeRequired?: string;
  } {
    const plan = PLANS[userPlan.toUpperCase()];
    const blockedReasons: string[] = [];

    if (!plan) {
      return {
        canProceed: false,
        blockedReasons: ['Plan invalide'],
        upgradeRequired: 'starter'
      };
    }

    // Vérifier les missions
    if (!this.canCreateMission(userPlan, usage.missionsThisMonth)) {
      blockedReasons.push(`Limite de ${plan.limits.missionsPerMonth} missions/mois atteinte`);
    }

    // Vérifier les agents
    const unavailableAgents = usage.requestedAgents.filter(agent => 
      !this.canUseAgent(userPlan, agent)
    );
    if (unavailableAgents.length > 0) {
      blockedReasons.push(`Agents non disponibles: ${unavailableAgents.join(', ')}`);
    }

    // Vérifier les intégrations
    const unavailableIntegrations = usage.requestedIntegrations.filter(integration => 
      !this.canUseIntegration(userPlan, integration)
    );
    if (unavailableIntegrations.length > 0) {
      blockedReasons.push(`Intégrations non disponibles: ${unavailableIntegrations.join(', ')}`);
    }

    // Suggérer une mise à niveau
    let upgradeRequired: string | undefined;
    if (blockedReasons.length > 0) {
      if (userPlan === 'free') upgradeRequired = 'starter';
      else if (userPlan === 'starter') upgradeRequired = 'pro';
      else if (userPlan === 'pro') upgradeRequired = 'enterprise';
    }

    return {
      canProceed: blockedReasons.length === 0,
      blockedReasons,
      upgradeRequired
    };
  }
}

// Messages d'upgrade personnalisés
export const UPGRADE_MESSAGES = {
  missions: (current: number, limit: number) => 
    `Vous avez utilisé ${current}/${limit} missions ce mois-ci. Passez au plan supérieur pour continuer !`,
  
  agents: (agents: string[]) => 
    `Les agents ${agents.join(', ')} nécessitent un plan supérieur. Débloquez toute l'équipe !`,
  
  integrations: (integrations: string[]) => 
    `Les intégrations ${integrations.join(', ')} sont réservées aux plans payants. Accédez à toutes les APIs !`,
  
  general: 'Débloquez tout le potentiel de Beriox AI avec un plan supérieur !'
};

export default PlanService;
