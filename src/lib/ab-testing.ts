import { logger } from './logger';
import { metrics } from './metrics';

export enum ExperimentType {
  BUTTON_TEXT = 'button_text',
  LAYOUT = 'layout',
  COLOR_SCHEME = 'color_scheme',
  PRICING = 'pricing',
  ONBOARDING = 'onboarding',
  FEATURE_FLAG = 'feature_flag',
  CONTENT = 'content',
  CTA_PLACEMENT = 'cta_placement'
}

export enum VariantType {
  CONTROL = 'control',
  VARIANT_A = 'variant_a',
  VARIANT_B = 'variant_b',
  VARIANT_C = 'variant_c'
}

export interface ExperimentConfig {
  id: string;
  name: string;
  description: string;
  type: ExperimentType;
  variants: ExperimentVariant[];
  trafficSplit: Record<string, number>; // Pourcentage par variant
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  targetAudience?: TargetAudience;
  goals: ExperimentGoal[];
  minSampleSize?: number;
  confidenceLevel?: number; // 0.95 pour 95%
}

export interface ExperimentVariant {
  id: string;
  name: string;
  type: VariantType;
  config: Record<string, any>;
  weight: number; // Pourcentage de trafic
}

export interface TargetAudience {
  userTypes?: string[]; // 'new', 'returning', 'premium', etc.
  segments?: string[]; // Segments marketing
  countries?: string[];
  devices?: string[]; // 'desktop', 'mobile', 'tablet'
  browsers?: string[];
  customRules?: Record<string, any>;
}

export interface ExperimentGoal {
  id: string;
  name: string;
  type: 'conversion' | 'engagement' | 'revenue' | 'custom';
  metric: string; // 'click_rate', 'signup_rate', 'purchase_rate', etc.
  targetValue?: number;
  weight?: number; // Importance relative du goal
}

export interface ExperimentResult {
  experimentId: string;
  variantId: string;
  userId?: string;
  sessionId?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface ExperimentStats {
  experimentId: string;
  variantId: string;
  impressions: number;
  conversions: number;
  conversionRate: number;
  revenue?: number;
  averageOrderValue?: number;
  confidenceInterval?: {
    lower: number;
    upper: number;
  };
  isSignificant?: boolean;
  pValue?: number;
}

class ABTestingFramework {
  private experiments: Map<string, ExperimentConfig> = new Map();
  private results: Map<string, ExperimentResult[]> = new Map();
  private userAssignments: Map<string, Map<string, string>> = new Map(); // userId -> experimentId -> variantId
  private sessionAssignments: Map<string, Map<string, string>> = new Map(); // sessionId -> experimentId -> variantId

  constructor() {
    this.initializeDefaultExperiments();
  }

  private initializeDefaultExperiments() {
    // Expérience 1: Test du bouton CTA principal
    this.createExperiment({
      id: 'cta-button-test',
      name: 'Test Bouton CTA Principal',
      description: 'Test de différents textes pour le bouton CTA principal',
      type: ExperimentType.BUTTON_TEXT,
      variants: [
        {
          id: 'control',
          name: 'Contrôle',
          type: VariantType.CONTROL,
          config: { buttonText: 'Commencer maintenant' },
          weight: 33.33
        },
        {
          id: 'variant-a',
          name: 'Variant A',
          type: VariantType.VARIANT_A,
          config: { buttonText: 'Essai gratuit' },
          weight: 33.33
        },
        {
          id: 'variant-b',
          name: 'Variant B',
          type: VariantType.VARIANT_B,
          config: { buttonText: 'Démarrer gratuitement' },
          weight: 33.34
        }
      ],
      trafficSplit: { control: 33.33, 'variant-a': 33.33, 'variant-b': 33.34 },
      startDate: new Date(),
      isActive: true,
      goals: [
        {
          id: 'signup-rate',
          name: 'Taux d\'inscription',
          type: 'conversion',
          metric: 'signup_rate',
          weight: 1.0
        }
      ],
      minSampleSize: 1000,
      confidenceLevel: 0.95
    });

    // Expérience 2: Test de la page de pricing
    this.createExperiment({
      id: 'pricing-layout-test',
      name: 'Test Layout Pricing',
      description: 'Test de différents layouts pour la page de pricing',
      type: ExperimentType.LAYOUT,
      variants: [
        {
          id: 'control',
          name: 'Contrôle',
          type: VariantType.CONTROL,
          config: { layout: 'grid', highlightPlan: 'professional' },
          weight: 50
        },
        {
          id: 'variant-a',
          name: 'Variant A',
          type: VariantType.VARIANT_A,
          config: { layout: 'list', highlightPlan: 'enterprise' },
          weight: 50
        }
      ],
      trafficSplit: { control: 50, 'variant-a': 50 },
      startDate: new Date(),
      isActive: true,
      goals: [
        {
          id: 'purchase-rate',
          name: 'Taux d\'achat',
          type: 'conversion',
          metric: 'purchase_rate',
          weight: 0.7
        },
        {
          id: 'revenue',
          name: 'Revenus',
          type: 'revenue',
          metric: 'revenue_per_visitor',
          weight: 0.3
        }
      ],
      minSampleSize: 500,
      confidenceLevel: 0.95
    });

    // Expérience 3: Test de l'onboarding
    this.createExperiment({
      id: 'onboarding-flow-test',
      name: 'Test Flow Onboarding',
      description: 'Test de différents flows d\'onboarding',
      type: ExperimentType.ONBOARDING,
      variants: [
        {
          id: 'control',
          name: 'Contrôle',
          type: VariantType.CONTROL,
          config: { steps: 3, showTutorial: true, autoAdvance: false },
          weight: 50
        },
        {
          id: 'variant-a',
          name: 'Variant A',
          type: VariantType.VARIANT_A,
          config: { steps: 5, showTutorial: false, autoAdvance: true },
          weight: 50
        }
      ],
      trafficSplit: { control: 50, 'variant-a': 50 },
      startDate: new Date(),
      isActive: true,
      goals: [
        {
          id: 'completion-rate',
          name: 'Taux de complétion',
          type: 'conversion',
          metric: 'onboarding_completion_rate',
          weight: 0.6
        },
        {
          id: 'time-to-complete',
          name: 'Temps de complétion',
          type: 'engagement',
          metric: 'onboarding_time',
          weight: 0.4
        }
      ],
      minSampleSize: 200,
      confidenceLevel: 0.95
    });
  }

  // Créer une nouvelle expérience
  createExperiment(config: ExperimentConfig): void {
    // Validation
    if (this.experiments.has(config.id)) {
      throw new Error(`Experiment with ID ${config.id} already exists`);
    }

    // Vérifier que les poids totalisent 100%
    const totalWeight = config.variants.reduce((sum, variant) => sum + variant.weight, 0);
    if (Math.abs(totalWeight - 100) > 0.01) {
      throw new Error('Variant weights must sum to 100%');
    }

    this.experiments.set(config.id, config);
    this.results.set(config.id, []);

    logger.info(`Experiment created: ${config.name}`, {
      action: 'experiment_created',
      metadata: {
        experimentId: config.id,
        type: config.type,
        variants: config.variants.length
      }
    });

    metrics.increment('experiment_created', 1, {
      type: config.type,
      variants: config.variants.length.toString()
    });
  }

  // Obtenir une variante pour un utilisateur/session
  getVariant(experimentId: string, userId?: string, sessionId?: string): ExperimentVariant | null {
    const experiment = this.experiments.get(experimentId);
    if (!experiment || !experiment.isActive) {
      return null;
    }

    // Vérifier si l'expérience est dans sa période active
    const now = new Date();
    if (now < experiment.startDate || (experiment.endDate && now > experiment.endDate)) {
      return null;
    }

    // Vérifier l'audience cible
    if (!this.isUserInTargetAudience(experiment.targetAudience, userId, sessionId)) {
      return null;
    }

    // Vérifier si l'utilisateur a déjà été assigné
    const assignmentKey = userId || sessionId;
    if (!assignmentKey) {
      return null;
    }

    const assignments = userId ? this.userAssignments : this.sessionAssignments;
    const userAssignments = assignments.get(assignmentKey) || new Map();
    
    if (userAssignments.has(experimentId)) {
      const variantId = userAssignments.get(experimentId)!;
      return experiment.variants.find(v => v.id === variantId) || null;
    }

    // Assigner une nouvelle variante
    const variant = this.assignVariant(experiment);
    if (variant) {
      userAssignments.set(experimentId, variant.id);
      assignments.set(assignmentKey, userAssignments);

      logger.info(`Variant assigned: ${variant.name}`, {
        action: 'variant_assigned',
        metadata: {
          experimentId,
          variantId: variant.id,
          userId,
          sessionId
        }
      });

      metrics.increment('variant_assigned', 1, {
        experimentId,
        variantId: variant.id
      });
    }

    return variant;
  }

  // Assigner une variante selon la répartition du trafic
  private assignVariant(experiment: ExperimentConfig): ExperimentVariant | null {
    const random = Math.random() * 100;
    let cumulativeWeight = 0;

    for (const variant of experiment.variants) {
      cumulativeWeight += variant.weight;
      if (random <= cumulativeWeight) {
        return variant;
      }
    }

    return experiment.variants[0] || null;
  }

  // Vérifier si l'utilisateur est dans l'audience cible
  private isUserInTargetAudience(
    targetAudience: TargetAudience | undefined,
    userId?: string,
    sessionId?: string
  ): boolean {
    if (!targetAudience) {
      return true; // Pas de restrictions
    }

    // Implémentation basique - à étendre selon les besoins
    // Ici on pourrait vérifier le type d'utilisateur, la localisation, etc.
    
    return true;
  }

  // Enregistrer une impression
  recordImpression(
    experimentId: string,
    variantId: string,
    userId?: string,
    sessionId?: string,
    metadata?: Record<string, any>
  ): void {
    const result: ExperimentResult = {
      experimentId,
      variantId,
      userId,
      sessionId,
      timestamp: new Date(),
      metadata
    };

    const experimentResults = this.results.get(experimentId) || [];
    experimentResults.push(result);
    this.results.set(experimentId, experimentResults);

    logger.info(`Impression recorded: ${experimentId}`, {
      action: 'experiment_impression',
      metadata: {
        experimentId,
        variantId,
        userId,
        sessionId
      }
    });

    metrics.increment('experiment_impression', 1, {
      experimentId,
      variantId
    });
  }

  // Enregistrer une conversion
  recordConversion(
    experimentId: string,
    variantId: string,
    goalId: string,
    userId?: string,
    sessionId?: string,
    value?: number,
    metadata?: Record<string, any>
  ): void {
    const result: ExperimentResult = {
      experimentId,
      variantId,
      userId,
      sessionId,
      timestamp: new Date(),
      metadata: {
        ...metadata,
        goalId,
        value
      }
    };

    const experimentResults = this.results.get(experimentId) || [];
    experimentResults.push(result);
    this.results.set(experimentId, experimentResults);

    logger.info(`Conversion recorded: ${experimentId}`, {
      action: 'experiment_conversion',
      metadata: {
        experimentId,
        variantId,
        goalId,
        userId,
        sessionId,
        value
      }
    });

    metrics.increment('experiment_conversion', 1, {
      experimentId,
      variantId,
      goalId
    });

    if (value) {
      metrics.gauge('experiment_revenue', value, {
        experimentId,
        variantId,
        goalId
      });
    }
  }

  // Obtenir les statistiques d'une expérience
  getExperimentStats(experimentId: string): ExperimentStats[] {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) {
      return [];
    }

    const results = this.results.get(experimentId) || [];
    const stats: ExperimentStats[] = [];

    for (const variant of experiment.variants) {
      const variantResults = results.filter(r => r.variantId === variant.id);
      const impressions = variantResults.length;
      const conversions = variantResults.filter(r => r.metadata?.goalId).length;
      const conversionRate = impressions > 0 ? (conversions / impressions) * 100 : 0;

      const revenue = variantResults
        .filter(r => r.metadata?.value)
        .reduce((sum, r) => sum + (r.metadata?.value || 0), 0);

      const averageOrderValue = conversions > 0 ? revenue / conversions : 0;

      stats.push({
        experimentId,
        variantId: variant.id,
        impressions,
        conversions,
        conversionRate,
        revenue,
        averageOrderValue
      });
    }

    return stats;
  }

  // Calculer la significativité statistique
  calculateSignificance(experimentId: string, goalId: string): Record<string, any> {
    const stats = this.getExperimentStats(experimentId);
    if (stats.length < 2) {
      return {};
    }

    const control = stats.find(s => s.variantId === 'control');
    const variants = stats.filter(s => s.variantId !== 'control');

    if (!control) {
      return {};
    }

    const results: Record<string, any> = {};

    for (const variant of variants) {
      // Test de significativité (test Z pour proportions)
      const p1 = control.conversionRate / 100;
      const p2 = variant.conversionRate / 100;
      const n1 = control.impressions;
      const n2 = variant.impressions;

      if (n1 === 0 || n2 === 0) {
        results[variant.variantId] = { isSignificant: false, pValue: 1 };
        continue;
      }

      const pooledP = (p1 * n1 + p2 * n2) / (n1 + n2);
      const standardError = Math.sqrt(pooledP * (1 - pooledP) * (1/n1 + 1/n2));
      const zScore = Math.abs(p2 - p1) / standardError;
      const pValue = 2 * (1 - this.normalCDF(zScore));

      const isSignificant = pValue < 0.05; // 95% de confiance

      results[variant.variantId] = {
        isSignificant,
        pValue,
        improvement: ((p2 - p1) / p1) * 100,
        confidenceInterval: {
          lower: (p2 - p1) - 1.96 * standardError,
          upper: (p2 - p1) + 1.96 * standardError
        }
      };
    }

    return results;
  }

  // Fonction de distribution normale cumulative (approximation)
  private normalCDF(x: number): number {
    return 0.5 * (1 + this.erf(x / Math.sqrt(2)));
  }

  // Fonction d'erreur (approximation)
  private erf(x: number): number {
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;

    const sign = x >= 0 ? 1 : -1;
    x = Math.abs(x);

    const t = 1 / (1 + p * x);
    const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return sign * y;
  }

  // Obtenir toutes les expériences actives
  getActiveExperiments(): ExperimentConfig[] {
    return Array.from(this.experiments.values()).filter(e => e.isActive);
  }

  // Désactiver une expérience
  deactivateExperiment(experimentId: string): void {
    const experiment = this.experiments.get(experimentId);
    if (experiment) {
      experiment.isActive = false;
      experiment.endDate = new Date();

      logger.info(`Experiment deactivated: ${experiment.name}`, {
        action: 'experiment_deactivated',
        metadata: { experimentId }
      });

      metrics.increment('experiment_deactivated', 1, {
        experimentId
      });
    }
  }

  // Obtenir les résultats bruts d'une expérience
  getExperimentResults(experimentId: string): ExperimentResult[] {
    return this.results.get(experimentId) || [];
  }

  // Nettoyer les anciens résultats
  cleanupOldResults(maxAge: number = 90 * 24 * 60 * 60 * 1000): void { // 90 jours par défaut
    const cutoff = new Date(Date.now() - maxAge);
    let cleanedCount = 0;

    for (const [experimentId, results] of this.results.entries()) {
      const filteredResults = results.filter(r => r.timestamp > cutoff);
      if (filteredResults.length !== results.length) {
        this.results.set(experimentId, filteredResults);
        cleanedCount += results.length - filteredResults.length;
      }
    }

    if (cleanedCount > 0) {
      logger.info(`Cleaned up ${cleanedCount} old experiment results`, {
        action: 'experiment_cleanup',
        metadata: { cleanedCount, maxAge }
      });
    }
  }

  // Exporter les données d'expérience
  exportExperimentData(experimentId: string) {
    const experiment = this.experiments.get(experimentId);
    const results = this.getExperimentResults(experimentId);
    const stats = this.getExperimentStats(experimentId);
    const significance = this.calculateSignificance(experimentId, 'default');

    return {
      experiment,
      results,
      stats,
      significance,
      exportDate: new Date().toISOString()
    };
  }
}

// Instance globale
export const abTesting = new ABTestingFramework();

// Fonctions utilitaires
export const getVariant = (experimentId: string, userId?: string, sessionId?: string) => {
  return abTesting.getVariant(experimentId, userId, sessionId);
};

export const recordImpression = (experimentId: string, variantId: string, userId?: string, sessionId?: string, metadata?: Record<string, any>) => {
  abTesting.recordImpression(experimentId, variantId, userId, sessionId, metadata);
};

export const recordConversion = (experimentId: string, variantId: string, goalId: string, userId?: string, sessionId?: string, value?: number, metadata?: Record<string, any>) => {
  abTesting.recordConversion(experimentId, variantId, goalId, userId, sessionId, value, metadata);
};

export const getExperimentStats = (experimentId: string) => {
  return abTesting.getExperimentStats(experimentId);
};

export const createExperiment = (config: ExperimentConfig) => {
  abTesting.createExperiment(config);
};
