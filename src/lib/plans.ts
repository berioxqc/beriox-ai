// Système de plans et paywall pour Beriox AI

export interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'apos;month'apos; | 'apos;year'apos;;
  stripeProductId?: string;
  stripePriceId?: string;
  features: string[];
  limits: {
    missionsPerMonth: number;
    agentsAvailable: string[];
    apiIntegrations: string[];
    supportLevel: 'apos;community'apos; | 'apos;email'apos; | 'apos;priority'apos; | 'apos;dedicated'apos;;
    customIntegrations: boolean;
    whiteLabel: boolean;
  };
  popular?: boolean;
}

export const PLANS: Record<string, Plan> = {
  FREE: {
    id: 'apos;free'apos;,
    name: 'apos;🧪 Apprenti'apos;,
    price: 0,
    currency: 'apos;CAD'apos;,
    interval: 'apos;month'apos;,
    features: [
      'apos;3 missions par mois'apos;,
      'apos;4 agents IA de base'apos;,
      'apos;Questions d\'apos;alignement standards'apos;,
      'apos;Rapports standards'apos;,
      'apos;Support communautaire'apos;
    ],
    limits: {
      missionsPerMonth: 3,
      agentsAvailable: ['apos;karine'apos;, 'apos;hugo'apos;, 'apos;jpbot'apos;, 'apos;elodie'apos;],
      apiIntegrations: [],
      supportLevel: 'apos;community'apos;,
      customIntegrations: false,
      whiteLabel: false
    }
  },

  STARTER: {
    id: 'apos;starter'apos;,
    name: 'apos;⚗️ Alchimiste'apos;,
    price: 49,
    currency: 'apos;CAD'apos;,
    interval: 'apos;month'apos;,
    stripePriceId: process.env.STRIPE_STARTER_PRICE_ID,
    features: [
      'apos;25 missions par mois'apos;,
      'apos;Tous les agents IA workflow'apos;,
      'apos;🤖 Questions GPT personnalisées'apos;,
      'apos;Rapports avancés'apos;,
      'apos;Support par email'apos;,
      'apos;3 intégrations API essentielles'apos;,
      'apos;Tableaux de bord basiques'apos;,
      'apos;Export données CSV'apos;
    ],
    limits: {
      missionsPerMonth: 25,
      agentsAvailable: ['apos;karine'apos;, 'apos;hugo'apos;, 'apos;jpbot'apos;, 'apos;elodie'apos;, 'apos;clara'apos;, 'apos;faucon'apos;],
      apiIntegrations: ['apos;pagespeed'apos;, 'apos;security'apos;, 'apos;uptime'apos;],
      supportLevel: 'apos;email'apos;,
      customIntegrations: false,
      whiteLabel: false
    },
    popular: true
  },

  PRO: {
    id: 'apos;pro'apos;,
    name: 'apos;🔮 Mage'apos;,
    price: 149,
    currency: 'apos;CAD'apos;,
    interval: 'apos;month'apos;,
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID,
    features: [
      'apos;100 missions par mois'apos;,
      'apos;Tous les agents + bots spécialisés'apos;,
      'apos;🤖 Questions GPT personnalisées'apos;,
      'apos;Toutes les intégrations API premium'apos;,
      'apos;Analyses automatiques quotidiennes'apos;,
      'apos;Support prioritaire'apos;,
      'apos;Tableaux de bord avancés avec graphiques'apos;,
      'apos;Export PDF/Excel'apos;,
      'apos;Alertes temps réel'apos;,
      'apos;Données historiques 12 mois'apos;
    ],
    limits: {
      missionsPerMonth: 100,
      agentsAvailable: ['apos;all'apos;],
      apiIntegrations: ['apos;all'apos;],
      supportLevel: 'apos;priority'apos;,
      customIntegrations: true,
      whiteLabel: false
    }
  },

  ENTERPRISE: {
    id: 'apos;enterprise'apos;,
    name: 'apos;👑 Archimage'apos;,
    price: 449,
    currency: 'apos;CAD'apos;,
    interval: 'apos;month'apos;,
    stripePriceId: process.env.STRIPE_ENTERPRISE_PRICE_ID,
    features: [
      'apos;Missions illimitées'apos;,
      'apos;Tous les agents + bots custom'apos;,
      'apos;🤖 Questions GPT personnalisées'apos;,
      'apos;Intégrations personnalisées illimitées'apos;,
      'apos;API dédiée avec webhooks'apos;,
      'apos;Support dédié 24/7'apos;,
      'apos;White-label complet'apos;,
      'apos;SLA 99.9%'apos;,
      'apos;Formation équipe'apos;,
      'apos;Tableaux de bord multi-clients'apos;,
      'apos;Données historiques illimitées'apos;,
      'apos;Rapports automatisés personnalisés'apos;
    ],
    limits: {
      missionsPerMonth: -1, // Illimité
      agentsAvailable: ['apos;all'apos;],
      apiIntegrations: ['apos;all'apos;],
      supportLevel: 'apos;dedicated'apos;,
      customIntegrations: true,
      whiteLabel: true
    }
  }
};

// Bots disponibles par plan
export const BOT_ACCESS: Record<string, string[]> = {
  free: [],
  starter: ['apos;speedbot'apos;, 'apos;securitybot'apos;],
  pro: ['apos;speedbot'apos;, 'apos;securitybot'apos;, 'apos;analyticsbot'apos;, 'apos;seobot'apos;, 'apos;uptimebot'apos;, 'apos;accessibilitybot'apos;, 'apos;competitorbot'apos;],
  enterprise: ['apos;all'apos;] // Tous les bots actuels et futurs
};

// APIs externes disponibles par plan (avec coûts réels considérés)
export const API_INTEGRATIONS: Record<string, string[]> = {
  free: [], // Aucune API externe (coûteuse)
  starter: ['apos;pagespeed'apos;, 'apos;security'apos;, 'apos;uptime'apos;], // APIs basiques
  pro: [
    'apos;pagespeed'apos;, 'apos;security'apos;, 'apos;analytics'apos;, 'apos;searchconsole'apos;, 
    'apos;social'apos;, 'apos;ads'apos;, 'apos;reviews'apos;, 'apos;uptime'apos;, 'apos;seo'apos;, 'apos;accessibility'apos;
  ], // APIs premium avec limites
  enterprise: ['apos;all'apos;] // Toutes les APIs sans limites
};

// Limites d'apos;appels API par plan (par mois)
export const API_LIMITS: Record<string, Record<string, number>> = {
  free: {},
  starter: {
    'apos;pagespeed'apos;: 500,
    'apos;security'apos;: 100,
    'apos;uptime'apos;: 1000
  },
  pro: {
    'apos;pagespeed'apos;: 2000,
    'apos;security'apos;: 500,
    'apos;analytics'apos;: 1000,
    'apos;searchconsole'apos;: 1000,
    'apos;social'apos;: 500,
    'apos;ads'apos;: 300,
    'apos;reviews'apos;: 200,
    'apos;uptime'apos;: 5000,
    'apos;seo'apos;: 1000,
    'apos;accessibility'apos;: 200
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
    
    if (plan.limits.agentsAvailable.includes('apos;all'apos;)) return true;
    return plan.limits.agentsAvailable.includes(agentId);
  }

  /**
   * Vérifie si une intégration API est disponible
   */
  static canUseIntegration(userPlan: string, integrationId: string): boolean {
    const plan = PLANS[userPlan.toUpperCase()];
    if (!plan) return false;
    
    if (plan.limits.apiIntegrations.includes('apos;all'apos;)) return true;
    return plan.limits.apiIntegrations.includes(integrationId);
  }

  /**
   * Obtient les agents disponibles pour un plan
   */
  static getAvailableAgents(userPlan: string): string[] {
    const plan = PLANS[userPlan.toUpperCase()];
    if (!plan) return [];
    
    if (plan.limits.agentsAvailable.includes('apos;all'apos;)) {
      return ['apos;karine'apos;, 'apos;hugo'apos;, 'apos;jpbot'apos;, 'apos;elodie'apos;, 'apos;clara'apos;, 'apos;faucon'apos;, 'apos;speedbot'apos;, 'apos;securitybot'apos;, 'apos;analyticsbot'apos;];
    }
    
    return plan.limits.agentsAvailable;
  }

  /**
   * Obtient les bots spécialisés disponibles pour un plan
   */
  static getAvailableBots(userPlan: string): string[] {
    const bots = BOT_ACCESS[userPlan.toLowerCase()] || [];
    if (bots.includes('apos;all'apos;)) {
      return ['apos;speedbot'apos;, 'apos;securitybot'apos;, 'apos;analyticsbot'apos;, 'apos;seobot'apos;, 'apos;uptimebot'apos;, 'apos;accessibilitybot'apos;];
    }
    return bots;
  }

  /**
   * Vérifie si l'apos;utilisateur peut utiliser les questions GPT personnalisées
   * Fonctionnalité premium réservée aux plans payants
   */
  static canUseGPTQuestions(userPlan: string): boolean {
    const plan = PLANS[userPlan.toUpperCase()];
    if (!plan) return false;
    
    // Questions GPT réservées aux plans payants (pas gratuit)
    return plan.id !== 'apos;free'apos;;
  }

  /**
   * Détermine le plan effectif d'apos;un utilisateur (en tenant compte des accès premium temporaires)
   */
  static getEffectivePlan(userPlan: string, premiumAccess?: {
    planId: string;
    endDate: Date;
    isActive: boolean;
  }): string {
    // Si l'apos;utilisateur a un accès premium actif et non expiré
    if (premiumAccess && premiumAccess.isActive && premiumAccess.endDate > new Date()) {
      return premiumAccess.planId;
    }
    
    // Sinon, retourner le plan de base
    return userPlan || 'apos;free'apos;;
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
   * Calcule les jours restants d'apos;accès premium
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
   * Formate le prix avec taxes pour l'apos;affichage
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
        basePrice: 'apos;Gratuit'apos;,
        tps: 'apos;0,00 $'apos;,
        tvq: 'apos;0,00 $'apos;,
        totalPrice: 'apos;0,00 $'apos;,
        monthlyTotal: 'apos;Gratuit'apos;,
        annualTotal: 'apos;Gratuit'apos;
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
      product: 'apos;beriox-ai'apos;,
      version: 'apos;1.0'apos;
    };
  }

  /**
   * Vérifie les limites d'apos;usage
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
        blockedReasons: ['apos;Plan invalide'apos;],
        upgradeRequired: 'apos;starter'apos;
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
      blockedReasons.push(`Agents non disponibles: ${unavailableAgents.join('apos;, 'apos;)}`);
    }

    // Vérifier les intégrations
    const unavailableIntegrations = usage.requestedIntegrations.filter(integration => 
      !this.canUseIntegration(userPlan, integration)
    );
    if (unavailableIntegrations.length > 0) {
      blockedReasons.push(`Intégrations non disponibles: ${unavailableIntegrations.join('apos;, 'apos;)}`);
    }

    // Suggérer une mise à niveau
    let upgradeRequired: string | undefined;
    if (blockedReasons.length > 0) {
      if (userPlan === 'apos;free'apos;) upgradeRequired = 'apos;starter'apos;;
      else if (userPlan === 'apos;starter'apos;) upgradeRequired = 'apos;pro'apos;;
      else if (userPlan === 'apos;pro'apos;) upgradeRequired = 'apos;enterprise'apos;;
    }

    return {
      canProceed: blockedReasons.length === 0,
      blockedReasons,
      upgradeRequired
    };
  }
}

// Messages d'apos;upgrade personnalisés
export const UPGRADE_MESSAGES = {
  missions: (current: number, limit: number) => 
    `Vous avez utilisé ${current}/${limit} missions ce mois-ci. Passez au plan supérieur pour continuer !`,
  
  agents: (agents: string[]) => 
    `Les agents ${agents.join('apos;, 'apos;)} nécessitent un plan supérieur. Débloquez toute l'apos;équipe !`,
  
  integrations: (integrations: string[]) => 
    `Les intégrations ${integrations.join('apos;, 'apos;)} sont réservées aux plans payants. Accédez à toutes les APIs !`,
  
  general: 'apos;Débloquez tout le potentiel de Beriox AI avec un plan supérieur !'apos;
};

export default PlanService;
