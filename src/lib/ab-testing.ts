import { logger } from 'apos;./logger'apos;;
import { metrics } from 'apos;./metrics'apos;;

export enum ExperimentType {
  BUTTON_TEXT = 'apos;button_text'apos;,
  LAYOUT = 'apos;layout'apos;,
  COLOR_SCHEME = 'apos;color_scheme'apos;,
  PRICING = 'apos;pricing'apos;,
  ONBOARDING = 'apos;onboarding'apos;,
  FEATURE_FLAG = 'apos;feature_flag'apos;,
  CONTENT = 'apos;content'apos;,
  CTA_PLACEMENT = 'apos;cta_placement'apos;
}

export enum VariantType {
  CONTROL = 'apos;control'apos;,
  VARIANT_A = 'apos;variant_a'apos;,
  VARIANT_B = 'apos;variant_b'apos;,
  VARIANT_C = 'apos;variant_c'apos;
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
  userTypes?: string[]; // 'apos;new'apos;, 'apos;returning'apos;, 'apos;premium'apos;, etc.
  segments?: string[]; // Segments marketing
  countries?: string[];
  devices?: string[]; // 'apos;desktop'apos;, 'apos;mobile'apos;, 'apos;tablet'apos;
  browsers?: string[];
  customRules?: Record<string, any>;
}

export interface ExperimentGoal {
  id: string;
  name: string;
  type: 'apos;conversion'apos; | 'apos;engagement'apos; | 'apos;revenue'apos; | 'apos;custom'apos;;
  metric: string; // 'apos;click_rate'apos;, 'apos;signup_rate'apos;, 'apos;purchase_rate'apos;, etc.
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
      id: 'apos;cta-button-test'apos;,
      name: 'apos;Test Bouton CTA Principal'apos;,
      description: 'apos;Test de différents textes pour le bouton CTA principal'apos;,
      type: ExperimentType.BUTTON_TEXT,
      variants: [
        {
          id: 'apos;control'apos;,
          name: 'apos;Contrôle'apos;,
          type: VariantType.CONTROL,
          config: { buttonText: 'apos;Commencer maintenant'apos; },
          weight: 33.33
        },
        {
          id: 'apos;variant-a'apos;,
          name: 'apos;Variant A'apos;,
          type: VariantType.VARIANT_A,
          config: { buttonText: 'apos;Essai gratuit'apos; },
          weight: 33.33
        },
        {
          id: 'apos;variant-b'apos;,
          name: 'apos;Variant B'apos;,
          type: VariantType.VARIANT_B,
          config: { buttonText: 'apos;Démarrer gratuitement'apos; },
          weight: 33.34
        }
      ],
      trafficSplit: { control: 33.33, 'apos;variant-a'apos;: 33.33, 'apos;variant-b'apos;: 33.34 },
      startDate: new Date(),
      isActive: true,
      goals: [
        {
          id: 'apos;signup-rate'apos;,
          name: 'apos;Taux d\'apos;inscription'apos;,
          type: 'apos;conversion'apos;,
          metric: 'apos;signup_rate'apos;,
          weight: 1.0
        }
      ],
      minSampleSize: 1000,
      confidenceLevel: 0.95
    });

    // Expérience 2: Test de la page de pricing
    this.createExperiment({
      id: 'apos;pricing-layout-test'apos;,
      name: 'apos;Test Layout Pricing'apos;,
      description: 'apos;Test de différents layouts pour la page de pricing'apos;,
      type: ExperimentType.LAYOUT,
      variants: [
        {
          id: 'apos;control'apos;,
          name: 'apos;Contrôle'apos;,
          type: VariantType.CONTROL,
          config: { layout: 'apos;grid'apos;, highlightPlan: 'apos;professional'apos; },
          weight: 50
        },
        {
          id: 'apos;variant-a'apos;,
          name: 'apos;Variant A'apos;,
          type: VariantType.VARIANT_A,
          config: { layout: 'apos;list'apos;, highlightPlan: 'apos;enterprise'apos; },
          weight: 50
        }
      ],
      trafficSplit: { control: 50, 'apos;variant-a'apos;: 50 },
      startDate: new Date(),
      isActive: true,
      goals: [
        {
          id: 'apos;purchase-rate'apos;,
          name: 'apos;Taux d\'apos;achat'apos;,
          type: 'apos;conversion'apos;,
          metric: 'apos;purchase_rate'apos;,
          weight: 0.7
        },
        {
          id: 'apos;revenue'apos;,
          name: 'apos;Revenus'apos;,
          type: 'apos;revenue'apos;,
          metric: 'apos;revenue_per_visitor'apos;,
          weight: 0.3
        }
      ],
      minSampleSize: 500,
      confidenceLevel: 0.95
    });

    // Expérience 3: Test de l'apos;onboarding
    this.createExperiment({
      id: 'apos;onboarding-flow-test'apos;,
      name: 'apos;Test Flow Onboarding'apos;,
      description: 'apos;Test de différents flows d\'apos;onboarding'apos;,
      type: ExperimentType.ONBOARDING,
      variants: [
        {
          id: 'apos;control'apos;,
          name: 'apos;Contrôle'apos;,
          type: VariantType.CONTROL,
          config: { steps: 3, showTutorial: true, autoAdvance: false },
          weight: 50
        },
        {
          id: 'apos;variant-a'apos;,
          name: 'apos;Variant A'apos;,
          type: VariantType.VARIANT_A,
          config: { steps: 5, showTutorial: false, autoAdvance: true },
          weight: 50
        }
      ],
      trafficSplit: { control: 50, 'apos;variant-a'apos;: 50 },
      startDate: new Date(),
      isActive: true,
      goals: [
        {
          id: 'apos;completion-rate'apos;,
          name: 'apos;Taux de complétion'apos;,
          type: 'apos;conversion'apos;,
          metric: 'apos;onboarding_completion_rate'apos;,
          weight: 0.6
        },
        {
          id: 'apos;time-to-complete'apos;,
          name: 'apos;Temps de complétion'apos;,
          type: 'apos;engagement'apos;,
          metric: 'apos;onboarding_time'apos;,
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
      throw new Error('apos;Variant weights must sum to 100%'apos;);
    }

    this.experiments.set(config.id, config);
    this.results.set(config.id, []);

    logger.info(`Experiment created: ${config.name}`, {
      action: 'apos;experiment_created'apos;,
      metadata: {
        experimentId: config.id,
        type: config.type,
        variants: config.variants.length
      }
    });

    metrics.increment('apos;experiment_created'apos;, 1, {
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

    // Vérifier si l'apos;expérience est dans sa période active
    const now = new Date();
    if (now < experiment.startDate || (experiment.endDate && now > experiment.endDate)) {
      return null;
    }

    // Vérifier l'apos;audience cible
    if (!this.isUserInTargetAudience(experiment.targetAudience, userId, sessionId)) {
      return null;
    }

    // Vérifier si l'apos;utilisateur a déjà été assigné
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
        action: 'apos;variant_assigned'apos;,
        metadata: {
          experimentId,
          variantId: variant.id,
          userId,
          sessionId
        }
      });

      metrics.increment('apos;variant_assigned'apos;, 1, {
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

  // Vérifier si l'apos;utilisateur est dans l'apos;audience cible
  private isUserInTargetAudience(
    targetAudience: TargetAudience | undefined,
    userId?: string,
    sessionId?: string
  ): boolean {
    if (!targetAudience) {
      return true; // Pas de restrictions
    }

    // Implémentation basique - à étendre selon les besoins
    // Ici on pourrait vérifier le type d'apos;utilisateur, la localisation, etc.
    
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
      action: 'apos;experiment_impression'apos;,
      metadata: {
        experimentId,
        variantId,
        userId,
        sessionId
      }
    });

    metrics.increment('apos;experiment_impression'apos;, 1, {
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
      action: 'apos;experiment_conversion'apos;,
      metadata: {
        experimentId,
        variantId,
        goalId,
        userId,
        sessionId,
        value
      }
    });

    metrics.increment('apos;experiment_conversion'apos;, 1, {
      experimentId,
      variantId,
      goalId
    });

    if (value) {
      metrics.gauge('apos;experiment_revenue'apos;, value, {
        experimentId,
        variantId,
        goalId
      });
    }
  }

  // Obtenir les statistiques d'apos;une expérience
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

    const control = stats.find(s => s.variantId === 'apos;control'apos;);
    const variants = stats.filter(s => s.variantId !== 'apos;control'apos;);

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

  // Fonction d'apos;erreur (approximation)
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
        action: 'apos;experiment_deactivated'apos;,
        metadata: { experimentId }
      });

      metrics.increment('apos;experiment_deactivated'apos;, 1, {
        experimentId
      });
    }
  }

  // Obtenir les résultats bruts d'apos;une expérience
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
        action: 'apos;experiment_cleanup'apos;,
        metadata: { cleanedCount, maxAge }
      });
    }
  }

  // Exporter les données d'apos;expérience
  exportExperimentData(experimentId: string) {
    const experiment = this.experiments.get(experimentId);
    const results = this.getExperimentResults(experimentId);
    const stats = this.getExperimentStats(experimentId);
    const significance = this.calculateSignificance(experimentId, 'apos;default'apos;);

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
