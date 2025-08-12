import { logger } from 'apos;./logger'apos;;
import { metrics } from 'apos;./metrics'apos;;

export enum OnboardingStepType {
  WELCOME = 'apos;welcome'apos;,
  PROFILE_SETUP = 'apos;profile_setup'apos;,
  PREFERENCES = 'apos;preferences'apos;,
  FIRST_MISSION = 'apos;first_mission'apos;,
  FEATURES_TOUR = 'apos;features_tour'apos;,
  INTEGRATIONS = 'apos;integrations'apos;,
  BILLING = 'apos;billing'apos;,
  COMPLETION = 'apos;completion'apos;
}

export enum OnboardingStatus {
  NOT_STARTED = 'apos;not_started'apos;,
  IN_PROGRESS = 'apos;in_progress'apos;,
  COMPLETED = 'apos;completed'apos;,
  SKIPPED = 'apos;skipped'apos;
}

export interface OnboardingStep {
  id: string;
  type: OnboardingStepType;
  title: string;
  description: string;
  isRequired: boolean;
  isSkippable: boolean;
  estimatedTime: number; // en secondes
  dependencies?: string[]; // IDs des étapes requises
  config: OnboardingStepConfig;
  validation?: (data: any) => boolean | Promise<boolean>;
}

export interface OnboardingStepConfig {
  component: string;
  props?: Record<string, any>;
  actions?: OnboardingAction[];
  hints?: string[];
  successMessage?: string;
  errorMessage?: string;
}

export interface OnboardingAction {
  id: string;
  label: string;
  type: 'apos;primary'apos; | 'apos;secondary'apos; | 'apos;skip'apos;;
  action: string;
  url?: string;
  data?: Record<string, any>;
}

export interface OnboardingProgress {
  userId: string;
  currentStep: string;
  completedSteps: string[];
  skippedSteps: string[];
  startDate: Date;
  lastActivity: Date;
  status: OnboardingStatus;
  data: Record<string, any>;
  timeSpent: number; // en secondes
  completionRate: number; // 0-100
}

export interface OnboardingSession {
  id: string;
  userId: string;
  stepId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  actions: OnboardingAction[];
  data: Record<string, any>;
  errors: string[];
}

class OnboardingManager {
  private steps: Map<string, OnboardingStep> = new Map();
  private progress: Map<string, OnboardingProgress> = new Map();
  private sessions: Map<string, OnboardingSession[]> = new Map();

  constructor() {
    this.initializeDefaultSteps();
  }

  private initializeDefaultSteps() {
    // Étape 1: Bienvenue
    this.addStep({
      id: 'apos;welcome'apos;,
      type: OnboardingStepType.WELCOME,
      title: 'apos;Bienvenue sur Beriox AI !'apos;,
      description: 'apos;Découvrez comment notre plateforme peut transformer votre business avec l\'apos;IA.'apos;,
      isRequired: true,
      isSkippable: false,
      estimatedTime: 30,
      config: {
        component: 'apos;WelcomeStep'apos;,
        props: {
          showVideo: true,
          showDemo: true
        },
        actions: [
          {
            id: 'apos;start-onboarding'apos;,
            label: 'apos;Commencer l\'apos;onboarding'apos;,
            type: 'apos;primary'apos;,
            action: 'apos;next'apos;
          }
        ],
        hints: [
          'apos;Prenez le temps de regarder la vidéo de présentation'apos;,
          'apos;Explorez la démo interactive pour comprendre les fonctionnalités'apos;
        ],
        successMessage: 'apos;Parfait ! Vous êtes prêt à commencer votre voyage avec Beriox AI.'apos;
      }
    });

    // Étape 2: Configuration du profil
    this.addStep({
      id: 'apos;profile-setup'apos;,
      type: OnboardingStepType.PROFILE_SETUP,
      title: 'apos;Configurez votre profil'apos;,
      description: 'apos;Personnalisez votre profil pour une expérience optimale.'apos;,
      isRequired: true,
      isSkippable: false,
      estimatedTime: 60,
      dependencies: ['apos;welcome'apos;],
      config: {
        component: 'apos;ProfileSetupStep'apos;,
        props: {
          fields: ['apos;name'apos;, 'apos;company'apos;, 'apos;role'apos;, 'apos;industry'apos;, 'apos;goals'apos;],
          showAvatar: true
        },
        actions: [
          {
            id: 'apos;save-profile'apos;,
            label: 'apos;Sauvegarder et continuer'apos;,
            type: 'apos;primary'apos;,
            action: 'apos;save_profile'apos;
          },
          {
            id: 'apos;skip-profile'apos;,
            label: 'apos;Compléter plus tard'apos;,
            type: 'apos;secondary'apos;,
            action: 'apos;skip'apos;
          }
        ],
        hints: [
          'apos;Ajoutez une photo de profil pour personnaliser votre expérience'apos;,
          'apos;Sélectionnez votre industrie pour des recommandations pertinentes'apos;
        ],
        successMessage: 'apos;Profil configuré avec succès !'apos;
      },
      validation: async (data) => {
        return data.name && data.company && data.role;
      }
    });

    // Étape 3: Préférences
    this.addStep({
      id: 'apos;preferences'apos;,
      type: OnboardingStepType.PREFERENCES,
      title: 'apos;Définissez vos préférences'apos;,
      description: 'apos;Configurez vos préférences pour des recommandations personnalisées.'apos;,
      isRequired: false,
      isSkippable: true,
      estimatedTime: 45,
      dependencies: ['apos;profile-setup'apos;],
      config: {
        component: 'apos;PreferencesStep'apos;,
        props: {
          categories: ['apos;seo'apos;, 'apos;content'apos;, 'apos;analytics'apos;, 'apos;competitors'apos;, 'apos;social'apos;],
          showExamples: true
        },
        actions: [
          {
            id: 'apos;save-preferences'apos;,
            label: 'apos;Sauvegarder les préférences'apos;,
            type: 'apos;primary'apos;,
            action: 'apos;save_preferences'apos;
          },
          {
            id: 'apos;skip-preferences'apos;,
            label: 'apos;Passer cette étape'apos;,
            type: 'apos;secondary'apos;,
            action: 'apos;skip'apos;
          }
        ],
        hints: [
          'apos;Sélectionnez au moins 2 catégories d\'apos;intérêt'apos;,
          'apos;Vous pourrez modifier ces préférences plus tard'apos;
        ],
        successMessage: 'apos;Préférences enregistrées !'apos;
      }
    });

    // Étape 4: Première mission
    this.addStep({
      id: 'apos;first-mission'apos;,
      type: OnboardingStepType.FIRST_MISSION,
      title: 'apos;Créez votre première mission'apos;,
      description: 'apos;Lancez votre première mission IA pour voir Beriox en action.'apos;,
      isRequired: true,
      isSkippable: false,
      estimatedTime: 120,
      dependencies: ['apos;preferences'apos;],
      config: {
        component: 'apos;FirstMissionStep'apos;,
        props: {
          templates: ['apos;seo_audit'apos;, 'apos;content_analysis'apos;, 'apos;competitor_research'apos;],
          showTutorial: true,
          guidedMode: true
        },
        actions: [
          {
            id: 'apos;create-mission'apos;,
            label: 'apos;Créer ma première mission'apos;,
            type: 'apos;primary'apos;,
            action: 'apos;create_mission'apos;
          },
          {
            id: 'apos;view-templates'apos;,
            label: 'apos;Voir les templates'apos;,
            type: 'apos;secondary'apos;,
            action: 'apos;view_templates'apos;
          }
        ],
        hints: [
          'apos;Choisissez un template simple pour commencer'apos;,
          'apos;Suivez le guide étape par étape'apos;,
          'apos;Vous pourrez créer des missions personnalisées plus tard'apos;
        ],
        successMessage: 'apos;Félicitations ! Votre première mission est en cours.'apos;
      }
    });

    // Étape 5: Tour des fonctionnalités
    this.addStep({
      id: 'apos;features-tour'apos;,
      type: OnboardingStepType.FEATURES_TOUR,
      title: 'apos;Découvrez les fonctionnalités'apos;,
      description: 'apos;Explorez les principales fonctionnalités de Beriox AI.'apos;,
      isRequired: false,
      isSkippable: true,
      estimatedTime: 90,
      dependencies: ['apos;first-mission'apos;],
      config: {
        component: 'apos;FeaturesTourStep'apos;,
        props: {
          features: ['apos;dashboard'apos;, 'apos;missions'apos;, 'apos;analytics'apos;, 'apos;integrations'apos;],
          interactive: true,
          showProgress: true
        },
        actions: [
          {
            id: 'apos;complete-tour'apos;,
            label: 'apos;Terminer le tour'apos;,
            type: 'apos;primary'apos;,
            action: 'apos;complete_tour'apos;
          },
          {
            id: 'apos;skip-tour'apos;,
            label: 'apos;Passer le tour'apos;,
            type: 'apos;secondary'apos;,
            action: 'apos;skip'apos;
          }
        ],
        hints: [
          'apos;Cliquez sur chaque fonctionnalité pour en savoir plus'apos;,
          'apos;Prenez votre temps pour explorer chaque section'apos;
        ],
        successMessage: 'apos;Excellent ! Vous connaissez maintenant les principales fonctionnalités.'apos;
      }
    });

    // Étape 6: Intégrations
    this.addStep({
      id: 'apos;integrations'apos;,
      type: OnboardingStepType.INTEGRATIONS,
      title: 'apos;Connectez vos outils'apos;,
      description: 'apos;Intégrez vos outils existants pour une expérience optimale.'apos;,
      isRequired: false,
      isSkippable: true,
      estimatedTime: 60,
      dependencies: ['apos;features-tour'apos;],
      config: {
        component: 'apos;IntegrationsStep'apos;,
        props: {
          integrations: ['apos;google_analytics'apos;, 'apos;google_search_console'apos;, 'apos;semrush'apos;, 'apos;slack'apos;],
          showBenefits: true
        },
        actions: [
          {
            id: 'apos;connect-integrations'apos;,
            label: 'apos;Connecter mes outils'apos;,
            type: 'apos;primary'apos;,
            action: 'apos;connect_integrations'apos;
          },
          {
            id: 'apos;skip-integrations'apos;,
            label: 'apos;Plus tard'apos;,
            type: 'apos;secondary'apos;,
            action: 'apos;skip'apos;
          }
        ],
        hints: [
          'apos;Connectez au moins Google Analytics pour commencer'apos;,
          'apos;Vous pourrez ajouter d\'apos;autres intégrations plus tard'apos;
        ],
        successMessage: 'apos;Intégrations configurées avec succès !'apos;
      }
    });

    // Étape 7: Facturation
    this.addStep({
      id: 'apos;billing'apos;,
      type: OnboardingStepType.BILLING,
      title: 'apos;Configurez votre facturation'apos;,
      description: 'apos;Choisissez le plan qui correspond à vos besoins.'apos;,
      isRequired: false,
      isSkippable: true,
      estimatedTime: 45,
      dependencies: ['apos;integrations'apos;],
      config: {
        component: 'apos;BillingStep'apos;,
        props: {
          showPlans: true,
          showComparison: true,
          trialDays: 14
        },
        actions: [
          {
            id: 'apos;select-plan'apos;,
            label: 'apos;Choisir un plan'apos;,
            type: 'apos;primary'apos;,
            action: 'apos;select_plan'apos;
          },
          {
            id: 'apos;continue-trial'apos;,
            label: 'apos;Continuer l\'apos;essai gratuit'apos;,
            type: 'apos;secondary'apos;,
            action: 'apos;continue_trial'apos;
          }
        ],
        hints: [
          'apos;Vous avez 14 jours d\'apos;essai gratuit'apos;,
          'apos;Comparez les plans pour choisir le meilleur'apos;,
          'apos;Vous pouvez changer de plan à tout moment'apos;
        ],
        successMessage: 'apos;Plan configuré ! Profitez de votre essai gratuit.'apos;
      }
    });

    // Étape 8: Finalisation
    this.addStep({
      id: 'apos;completion'apos;,
      type: OnboardingStepType.COMPLETION,
      title: 'apos;Félicitations !'apos;,
      description: 'apos;Vous êtes prêt à utiliser Beriox AI au maximum de son potentiel.'apos;,
      isRequired: true,
      isSkippable: false,
      estimatedTime: 30,
      dependencies: ['apos;billing'apos;],
      config: {
        component: 'apos;CompletionStep'apos;,
        props: {
          showSummary: true,
          showNextSteps: true,
          showSupport: true
        },
        actions: [
          {
            id: 'apos;go-to-dashboard'apos;,
            label: 'apos;Aller au dashboard'apos;,
            type: 'apos;primary'apos;,
            action: 'apos;navigate'apos;,
            url: 'apos;/dashboard'apos;
          },
          {
            id: 'apos;view-resources'apos;,
            label: 'apos;Voir les ressources'apos;,
            type: 'apos;secondary'apos;,
            action: 'apos;navigate'apos;,
            url: 'apos;/resources'apos;
          }
        ],
        hints: [
          'apos;Consultez les ressources pour en savoir plus'apos;,
          'apos;N\'apos;hésitez pas à contacter le support si vous avez des questions'apos;
        ],
        successMessage: 'apos;Onboarding terminé avec succès !'apos;
      }
    });
  }

  // Ajouter une étape
  addStep(step: OnboardingStep): void {
    this.steps.set(step.id, step);

    logger.info(`Onboarding step added: ${step.title}`, {
      action: 'apos;onboarding_step_added'apos;,
      metadata: {
        stepId: step.id,
        type: step.type,
        isRequired: step.isRequired
      }
    });

    metrics.increment('apos;onboarding_step_added'apos;, 1, {
      type: step.type,
      required: step.isRequired.toString()
    });
  }

  // Démarrer l'apos;onboarding pour un utilisateur
  startOnboarding(userId: string): OnboardingProgress {
    const firstStep = Array.from(this.steps.values()).find(step => !step.dependencies || step.dependencies.length === 0);
    
    if (!firstStep) {
      throw new Error('apos;No initial step found'apos;);
    }

    const progress: OnboardingProgress = {
      userId,
      currentStep: firstStep.id,
      completedSteps: [],
      skippedSteps: [],
      startDate: new Date(),
      lastActivity: new Date(),
      status: OnboardingStatus.IN_PROGRESS,
      data: {},
      timeSpent: 0,
      completionRate: 0
    };

    this.progress.set(userId, progress);

    logger.info(`Onboarding started for user: ${userId}`, {
      action: 'apos;onboarding_started'apos;,
      metadata: { userId, firstStep: firstStep.id }
    });

    metrics.increment('apos;onboarding_started'apos;, 1);

    return progress;
  }

  // Obtenir le progrès d'apos;un utilisateur
  getProgress(userId: string): OnboardingProgress | null {
    return this.progress.get(userId) || null;
  }

  // Obtenir l'apos;étape actuelle
  getCurrentStep(userId: string): OnboardingStep | null {
    const progress = this.getProgress(userId);
    if (!progress) return null;

    return this.steps.get(progress.currentStep) || null;
  }

  // Passer à l'apos;étape suivante
  async nextStep(userId: string, stepData?: Record<string, any>): Promise<OnboardingStep | null> {
    const progress = this.getProgress(userId);
    if (!progress) {
      throw new Error('apos;No onboarding progress found'apos;);
    }

    const currentStep = this.steps.get(progress.currentStep);
    if (!currentStep) {
      throw new Error('apos;Current step not found'apos;);
    }

    // Sauvegarder les données de l'apos;étape
    if (stepData) {
      progress.data[progress.currentStep] = stepData;
    }

    // Marquer l'apos;étape comme complétée
    if (!progress.completedSteps.includes(progress.currentStep)) {
      progress.completedSteps.push(progress.currentStep);
    }

    // Calculer le taux de complétion
    progress.completionRate = (progress.completedSteps.length / this.steps.size) * 100;

    // Trouver la prochaine étape
    const nextStep = this.findNextStep(progress.currentStep, progress.completedSteps);
    
    if (nextStep) {
      progress.currentStep = nextStep.id;
      progress.lastActivity = new Date();
    } else {
      // Onboarding terminé
      progress.status = OnboardingStatus.COMPLETED;
      progress.completionRate = 100;
    }

    this.progress.set(userId, progress);

    logger.info(`Onboarding step completed: ${currentStep.title}`, {
      action: 'apos;onboarding_step_completed'apos;,
      metadata: {
        userId,
        stepId: currentStep.id,
        completionRate: progress.completionRate
      }
    });

    metrics.increment('apos;onboarding_step_completed'apos;, 1, {
      stepId: currentStep.id,
      type: currentStep.type
    });

    return nextStep;
  }

  // Passer une étape
  skipStep(userId: string): OnboardingStep | null {
    const progress = this.getProgress(userId);
    if (!progress) {
      throw new Error('apos;No onboarding progress found'apos;);
    }

    const currentStep = this.steps.get(progress.currentStep);
    if (!currentStep) {
      throw new Error('apos;Current step not found'apos;);
    }

    if (!currentStep.isSkippable) {
      throw new Error('apos;Step cannot be skipped'apos;);
    }

    // Marquer l'apos;étape comme passée
    if (!progress.skippedSteps.includes(progress.currentStep)) {
      progress.skippedSteps.push(progress.currentStep);
    }

    // Trouver la prochaine étape
    const nextStep = this.findNextStep(progress.currentStep, [...progress.completedSteps, ...progress.skippedSteps]);
    
    if (nextStep) {
      progress.currentStep = nextStep.id;
      progress.lastActivity = new Date();
    } else {
      // Onboarding terminé
      progress.status = OnboardingStatus.COMPLETED;
      progress.completionRate = 100;
    }

    this.progress.set(userId, progress);

    logger.info(`Onboarding step skipped: ${currentStep.title}`, {
      action: 'apos;onboarding_step_skipped'apos;,
      metadata: {
        userId,
        stepId: currentStep.id
      }
    });

    metrics.increment('apos;onboarding_step_skipped'apos;, 1, {
      stepId: currentStep.id,
      type: currentStep.type
    });

    return nextStep;
  }

  // Trouver la prochaine étape
  private findNextStep(currentStepId: string, completedSteps: string[]): OnboardingStep | null {
    const currentStep = this.steps.get(currentStepId);
    if (!currentStep) return null;

    // Trouver toutes les étapes qui peuvent suivre
    const possibleNextSteps = Array.from(this.steps.values()).filter(step => {
      // Vérifier les dépendances
      if (!step.dependencies) return true;
      
      return step.dependencies.every(dep => completedSteps.includes(dep));
    });

    // Trouver l'apos;étape avec le moins de dépendances non satisfaites
    const nextStep = possibleNextSteps
      .filter(step => step.id !== currentStepId)
      .sort((a, b) => {
        const aDeps = a.dependencies?.length || 0;
        const bDeps = b.dependencies?.length || 0;
        return aDeps - bDeps;
      })[0];

    return nextStep || null;
  }

  // Valider une étape
  async validateStep(userId: string, stepData: any): Promise<boolean> {
    const progress = this.getProgress(userId);
    if (!progress) return false;

    const currentStep = this.steps.get(progress.currentStep);
    if (!currentStep || !currentStep.validation) return true;

    try {
      const isValid = await currentStep.validation(stepData);
      return isValid;
    } catch (error) {
      logger.error('apos;Step validation failed'apos;, error as Error, {
        action: 'apos;onboarding_step_validation_error'apos;,
        metadata: { userId, stepId: progress.currentStep }
      });
      return false;
    }
  }

  // Enregistrer une session d'apos;étape
  startStepSession(userId: string, stepId: string): string {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const session: OnboardingSession = {
      id: sessionId,
      userId,
      stepId,
      startTime: new Date(),
      actions: [],
      data: {},
      errors: []
    };

    const userSessions = this.sessions.get(userId) || [];
    userSessions.push(session);
    this.sessions.set(userId, userSessions);

    return sessionId;
  }

  // Terminer une session d'apos;étape
  endStepSession(userId: string, sessionId: string, data?: Record<string, any>): void {
    const userSessions = this.sessions.get(userId) || [];
    const session = userSessions.find(s => s.id === sessionId);
    
    if (session) {
      session.endTime = new Date();
      session.duration = session.endTime.getTime() - session.startTime.getTime();
      if (data) {
        session.data = { ...session.data, ...data };
      }

      // Mettre à jour le temps total passé
      const progress = this.getProgress(userId);
      if (progress) {
        progress.timeSpent += session.duration || 0;
        this.progress.set(userId, progress);
      }
    }
  }

  // Obtenir toutes les étapes
  getAllSteps(): OnboardingStep[] {
    return Array.from(this.steps.values());
  }

  // Obtenir les statistiques d'apos;onboarding
  getOnboardingStats(): Record<string, any> {
    const allProgress = Array.from(this.progress.values());
    
    return {
      totalUsers: allProgress.length,
      completedUsers: allProgress.filter(p => p.status === OnboardingStatus.COMPLETED).length,
      inProgressUsers: allProgress.filter(p => p.status === OnboardingStatus.IN_PROGRESS).length,
      averageCompletionRate: allProgress.reduce((sum, p) => sum + p.completionRate, 0) / allProgress.length,
      averageTimeSpent: allProgress.reduce((sum, p) => sum + p.timeSpent, 0) / allProgress.length,
      stepCompletionRates: Array.from(this.steps.values()).map(step => ({
        stepId: step.id,
        title: step.title,
        completed: allProgress.filter(p => p.completedSteps.includes(step.id)).length,
        skipped: allProgress.filter(p => p.skippedSteps.includes(step.id)).length
      }))
    };
  }

  // Réinitialiser l'apos;onboarding pour un utilisateur
  resetOnboarding(userId: string): void {
    this.progress.delete(userId);
    this.sessions.delete(userId);

    logger.info(`Onboarding reset for user: ${userId}`, {
      action: 'apos;onboarding_reset'apos;,
      metadata: { userId }
    });

    metrics.increment('apos;onboarding_reset'apos;, 1);
  }
}

// Instance globale
export const onboardingManager = new OnboardingManager();

// Fonctions utilitaires
export const startOnboarding = (userId: string) => {
  return onboardingManager.startOnboarding(userId);
};

export const getOnboardingProgress = (userId: string) => {
  return onboardingManager.getProgress(userId);
};

export const getCurrentOnboardingStep = (userId: string) => {
  return onboardingManager.getCurrentStep(userId);
};

export const nextOnboardingStep = (userId: string, stepData?: Record<string, any>) => {
  return onboardingManager.nextStep(userId, stepData);
};

export const skipOnboardingStep = (userId: string) => {
  return onboardingManager.skipStep(userId);
};

export const validateOnboardingStep = (userId: string, stepData: any) => {
  return onboardingManager.validateStep(userId, stepData);
};

export const getOnboardingStats = () => {
  return onboardingManager.getOnboardingStats();
};
