import { logger } from './logger'
import { metrics } from './metrics'
export enum OnboardingStepType {
  WELCOME = 'welcome',
  PROFILE_SETUP = 'profile_setup',
  PREFERENCES = 'preferences',
  FIRST_MISSION = 'first_mission',
  FEATURES_TOUR = 'features_tour',
  INTEGRATIONS = 'integrations',
  BILLING = 'billing',
  COMPLETION = 'completion'
}

export enum OnboardingStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  SKIPPED = 'skipped'
}

export interface OnboardingStep {
  id: string
  type: OnboardingStepType
  title: string
  description: string
  isRequired: boolean
  isSkippable: boolean
  estimatedTime: number; // en secondes
  dependencies?: string[]; // IDs des étapes requises
  config: OnboardingStepConfig
  validation?: (data: any) => boolean | Promise<boolean>
}

export interface OnboardingStepConfig {
  component: string
  props?: Record<string, any>
  actions?: OnboardingAction[]
  hints?: string[]
  successMessage?: string
  errorMessage?: string
}

export interface OnboardingAction {
  id: string
  label: string
  type: 'primary' | 'secondary' | 'skip'
  action: string
  url?: string
  data?: Record<string, any>
}

export interface OnboardingProgress {
  userId: string
  currentStep: string
  completedSteps: string[]
  skippedSteps: string[]
  startDate: Date
  lastActivity: Date
  status: OnboardingStatus
  data: Record<string, any>
  timeSpent: number; // en secondes
  completionRate: number; // 0-100
}

export interface OnboardingSession {
  id: string
  userId: string
  stepId: string
  startTime: Date
  endTime?: Date
  duration?: number
  actions: OnboardingAction[]
  data: Record<string, any>
  errors: string[]
}

class OnboardingManager {
  private steps: Map<string, OnboardingStep> = new Map()
  private progress: Map<string, OnboardingProgress> = new Map()
  private sessions: Map<string, OnboardingSession[]> = new Map()
  constructor() {
    this.initializeDefaultSteps()
  }

  private initializeDefaultSteps() {
    // Étape 1: Bienvenue
    this.addStep({
      id: 'welcome',
      type: OnboardingStepType.WELCOME,
      title: 'Bienvenue sur Beriox AI !',
      description: 'Découvrez comment notre plateforme peut transformer votre business avec l\'IA.',
      isRequired: true,
      isSkippable: false,
      estimatedTime: 30,
      config: {
        component: 'WelcomeStep',
        props: {
          showVideo: true,
          showDemo: true
        },
        actions: [
          {
            id: 'start-onboarding',
            label: 'Commencer l\'onboarding',
            type: 'primary',
            action: 'next'
          }
        ],
        hints: [
          'Prenez le temps de regarder la vidéo de présentation',
          'Explorez la démo interactive pour comprendre les fonctionnalités'
        ],
        successMessage: 'Parfait ! Vous êtes prêt à commencer votre voyage avec Beriox AI.'
      }
    })
    // Étape 2: Configuration du profil
    this.addStep({
      id: 'profile-setup',
      type: OnboardingStepType.PROFILE_SETUP,
      title: 'Configurez votre profil',
      description: 'Personnalisez votre profil pour une expérience optimale.',
      isRequired: true,
      isSkippable: false,
      estimatedTime: 60,
      dependencies: ['welcome'],
      config: {
        component: 'ProfileSetupStep',
        props: {
          fields: ['name', 'company', 'role', 'industry', 'goals'],
          showAvatar: true
        },
        actions: [
          {
            id: 'save-profile',
            label: 'Sauvegarder et continuer',
            type: 'primary',
            action: 'save_profile'
          },
          {
            id: 'skip-profile',
            label: 'Compléter plus tard',
            type: 'secondary',
            action: 'skip'
          }
        ],
        hints: [
          'Ajoutez une photo de profil pour personnaliser votre expérience',
          'Sélectionnez votre industrie pour des recommandations pertinentes'
        ],
        successMessage: 'Profil configuré avec succès !'
      },
      validation: async (data) => {
        return data.name && data.company && data.role
      }
    })
    // Étape 3: Préférences
    this.addStep({
      id: 'preferences',
      type: OnboardingStepType.PREFERENCES,
      title: 'Définissez vos préférences',
      description: 'Configurez vos préférences pour des recommandations personnalisées.',
      isRequired: false,
      isSkippable: true,
      estimatedTime: 45,
      dependencies: ['profile-setup'],
      config: {
        component: 'PreferencesStep',
        props: {
          categories: ['seo', 'content', 'analytics', 'competitors', 'social'],
          showExamples: true
        },
        actions: [
          {
            id: 'save-preferences',
            label: 'Sauvegarder les préférences',
            type: 'primary',
            action: 'save_preferences'
          },
          {
            id: 'skip-preferences',
            label: 'Passer cette étape',
            type: 'secondary',
            action: 'skip'
          }
        ],
        hints: [
          'Sélectionnez au moins 2 catégories d\'intérêt',
          'Vous pourrez modifier ces préférences plus tard'
        ],
        successMessage: 'Préférences enregistrées !'
      }
    })
    // Étape 4: Première mission
    this.addStep({
      id: 'first-mission',
      type: OnboardingStepType.FIRST_MISSION,
      title: 'Créez votre première mission',
      description: 'Lancez votre première mission IA pour voir Beriox en action.',
      isRequired: true,
      isSkippable: false,
      estimatedTime: 120,
      dependencies: ['preferences'],
      config: {
        component: 'FirstMissionStep',
        props: {
          templates: ['seo_audit', 'content_analysis', 'competitor_research'],
          showTutorial: true,
          guidedMode: true
        },
        actions: [
          {
            id: 'create-mission',
            label: 'Créer ma première mission',
            type: 'primary',
            action: 'create_mission'
          },
          {
            id: 'view-templates',
            label: 'Voir les templates',
            type: 'secondary',
            action: 'view_templates'
          }
        ],
        hints: [
          'Choisissez un template simple pour commencer',
          'Suivez le guide étape par étape',
          'Vous pourrez créer des missions personnalisées plus tard'
        ],
        successMessage: 'Félicitations ! Votre première mission est en cours.'
      }
    })
    // Étape 5: Tour des fonctionnalités
    this.addStep({
      id: 'features-tour',
      type: OnboardingStepType.FEATURES_TOUR,
      title: 'Découvrez les fonctionnalités',
      description: 'Explorez les principales fonctionnalités de Beriox AI.',
      isRequired: false,
      isSkippable: true,
      estimatedTime: 90,
      dependencies: ['first-mission'],
      config: {
        component: 'FeaturesTourStep',
        props: {
          features: ['dashboard', 'missions', 'analytics', 'integrations'],
          interactive: true,
          showProgress: true
        },
        actions: [
          {
            id: 'complete-tour',
            label: 'Terminer le tour',
            type: 'primary',
            action: 'complete_tour'
          },
          {
            id: 'skip-tour',
            label: 'Passer le tour',
            type: 'secondary',
            action: 'skip'
          }
        ],
        hints: [
          'Cliquez sur chaque fonctionnalité pour en savoir plus',
          'Prenez votre temps pour explorer chaque section'
        ],
        successMessage: 'Excellent ! Vous connaissez maintenant les principales fonctionnalités.'
      }
    })
    // Étape 6: Intégrations
    this.addStep({
      id: 'integrations',
      type: OnboardingStepType.INTEGRATIONS,
      title: 'Connectez vos outils',
      description: 'Intégrez vos outils existants pour une expérience optimale.',
      isRequired: false,
      isSkippable: true,
      estimatedTime: 60,
      dependencies: ['features-tour'],
      config: {
        component: 'IntegrationsStep',
        props: {
          integrations: ['google_analytics', 'google_search_console', 'semrush', 'slack'],
          showBenefits: true
        },
        actions: [
          {
            id: 'connect-integrations',
            label: 'Connecter mes outils',
            type: 'primary',
            action: 'connect_integrations'
          },
          {
            id: 'skip-integrations',
            label: 'Plus tard',
            type: 'secondary',
            action: 'skip'
          }
        ],
        hints: [
          'Connectez au moins Google Analytics pour commencer',
          'Vous pourrez ajouter d\'autres intégrations plus tard'
        ],
        successMessage: 'Intégrations configurées avec succès !'
      }
    })
    // Étape 7: Facturation
    this.addStep({
      id: 'billing',
      type: OnboardingStepType.BILLING,
      title: 'Configurez votre facturation',
      description: 'Choisissez le plan qui correspond à vos besoins.',
      isRequired: false,
      isSkippable: true,
      estimatedTime: 45,
      dependencies: ['integrations'],
      config: {
        component: 'BillingStep',
        props: {
          showPlans: true,
          showComparison: true,
          trialDays: 14
        },
        actions: [
          {
            id: 'select-plan',
            label: 'Choisir un plan',
            type: 'primary',
            action: 'select_plan'
          },
          {
            id: 'continue-trial',
            label: 'Continuer l\'essai gratuit',
            type: 'secondary',
            action: 'continue_trial'
          }
        ],
        hints: [
          'Vous avez 14 jours d\'essai gratuit',
          'Comparez les plans pour choisir le meilleur',
          'Vous pouvez changer de plan à tout moment'
        ],
        successMessage: 'Plan configuré ! Profitez de votre essai gratuit.'
      }
    })
    // Étape 8: Finalisation
    this.addStep({
      id: 'completion',
      type: OnboardingStepType.COMPLETION,
      title: 'Félicitations !',
      description: 'Vous êtes prêt à utiliser Beriox AI au maximum de son potentiel.',
      isRequired: true,
      isSkippable: false,
      estimatedTime: 30,
      dependencies: ['billing'],
      config: {
        component: 'CompletionStep',
        props: {
          showSummary: true,
          showNextSteps: true,
          showSupport: true
        },
        actions: [
          {
            id: 'go-to-dashboard',
            label: 'Aller au dashboard',
            type: 'primary',
            action: 'navigate',
            url: '/dashboard'
          },
          {
            id: 'view-resources',
            label: 'Voir les ressources',
            type: 'secondary',
            action: 'navigate',
            url: '/resources'
          }
        ],
        hints: [
          'Consultez les ressources pour en savoir plus',
          'N\'hésitez pas à contacter le support si vous avez des questions'
        ],
        successMessage: 'Onboarding terminé avec succès !'
      }
    })
  }

  // Ajouter une étape
  addStep(step: OnboardingStep): void {
    this.steps.set(step.id, step)
    logger.info(`Onboarding step added: ${step.title}`, {
      action: 'onboarding_step_added',
      metadata: {
        stepId: step.id,
        type: step.type,
        isRequired: step.isRequired
      }
    })
    metrics.increment('onboarding_step_added', 1, {
      type: step.type,
      required: step.isRequired.toString()
    })
  }

  // Démarrer l'onboarding pour un utilisateur
  startOnboarding(userId: string): OnboardingProgress {
    const firstStep = Array.from(this.steps.values()).find(step => !step.dependencies || step.dependencies.length === 0)
    if (!firstStep) {
      throw new Error('No initial step found')
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
    }
    this.progress.set(userId, progress)
    logger.info(`Onboarding started for user: ${userId}`, {
      action: 'onboarding_started',
      metadata: { userId, firstStep: firstStep.id }
    })
    metrics.increment('onboarding_started', 1)
    return progress
  }

  // Obtenir le progrès d'un utilisateur
  getProgress(userId: string): OnboardingProgress | null {
    return this.progress.get(userId) || null
  }

  // Obtenir l'étape actuelle
  getCurrentStep(userId: string): OnboardingStep | null {
    const progress = this.getProgress(userId)
    if (!progress) return null
    return this.steps.get(progress.currentStep) || null
  }

  // Passer à l'étape suivante
  async nextStep(userId: string, stepData?: Record<string, any>): Promise<OnboardingStep | null> {
    const progress = this.getProgress(userId)
    if (!progress) {
      throw new Error('No onboarding progress found')
    }

    const currentStep = this.steps.get(progress.currentStep)
    if (!currentStep) {
      throw new Error('Current step not found')
    }

    // Sauvegarder les données de l'étape
    if (stepData) {
      progress.data[progress.currentStep] = stepData
    }

    // Marquer l'étape comme complétée
    if (!progress.completedSteps.includes(progress.currentStep)) {
      progress.completedSteps.push(progress.currentStep)
    }

    // Calculer le taux de complétion
    progress.completionRate = (progress.completedSteps.length / this.steps.size) * 100
    // Trouver la prochaine étape
    const nextStep = this.findNextStep(progress.currentStep, progress.completedSteps)
    if (nextStep) {
      progress.currentStep = nextStep.id
      progress.lastActivity = new Date()
    } else {
      // Onboarding terminé
      progress.status = OnboardingStatus.COMPLETED
      progress.completionRate = 100
    }

    this.progress.set(userId, progress)
    logger.info(`Onboarding step completed: ${currentStep.title}`, {
      action: 'onboarding_step_completed',
      metadata: {
        userId,
        stepId: currentStep.id,
        completionRate: progress.completionRate
      }
    })
    metrics.increment('onboarding_step_completed', 1, {
      stepId: currentStep.id,
      type: currentStep.type
    })
    return nextStep
  }

  // Passer une étape
  skipStep(userId: string): OnboardingStep | null {
    const progress = this.getProgress(userId)
    if (!progress) {
      throw new Error('No onboarding progress found')
    }

    const currentStep = this.steps.get(progress.currentStep)
    if (!currentStep) {
      throw new Error('Current step not found')
    }

    if (!currentStep.isSkippable) {
      throw new Error('Step cannot be skipped')
    }

    // Marquer l'étape comme passée
    if (!progress.skippedSteps.includes(progress.currentStep)) {
      progress.skippedSteps.push(progress.currentStep)
    }

    // Trouver la prochaine étape
    const nextStep = this.findNextStep(progress.currentStep, [...progress.completedSteps, ...progress.skippedSteps])
    if (nextStep) {
      progress.currentStep = nextStep.id
      progress.lastActivity = new Date()
    } else {
      // Onboarding terminé
      progress.status = OnboardingStatus.COMPLETED
      progress.completionRate = 100
    }

    this.progress.set(userId, progress)
    logger.info(`Onboarding step skipped: ${currentStep.title}`, {
      action: 'onboarding_step_skipped',
      metadata: {
        userId,
        stepId: currentStep.id
      }
    })
    metrics.increment('onboarding_step_skipped', 1, {
      stepId: currentStep.id,
      type: currentStep.type
    })
    return nextStep
  }

  // Trouver la prochaine étape
  private findNextStep(currentStepId: string, completedSteps: string[]): OnboardingStep | null {
    const currentStep = this.steps.get(currentStepId)
    if (!currentStep) return null
    // Trouver toutes les étapes qui peuvent suivre
    const possibleNextSteps = Array.from(this.steps.values()).filter(step => {
      // Vérifier les dépendances
      if (!step.dependencies) return true
      return step.dependencies.every(dep => completedSteps.includes(dep))
    })
    // Trouver l'étape avec le moins de dépendances non satisfaites
    const nextStep = possibleNextSteps
      .filter(step => step.id !== currentStepId)
      .sort((a, b) => {
        const aDeps = a.dependencies?.length || 0
        const bDeps = b.dependencies?.length || 0
        return aDeps - bDeps
      })[0]
    return nextStep || null
  }

  // Valider une étape
  async validateStep(userId: string, stepData: any): Promise<boolean> {
    const progress = this.getProgress(userId)
    if (!progress) return false
    const currentStep = this.steps.get(progress.currentStep)
    if (!currentStep || !currentStep.validation) return true
    try {
      const isValid = await currentStep.validation(stepData)
      return isValid
    } catch (error) {
      logger.error('Step validation failed', error as Error, {
        action: 'onboarding_step_validation_error',
        metadata: { userId, stepId: progress.currentStep }
      })
      return false
    }
  }

  // Enregistrer une session d'étape
  startStepSession(userId: string, stepId: string): string {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const session: OnboardingSession = {
      id: sessionId,
      userId,
      stepId,
      startTime: new Date(),
      actions: [],
      data: {},
      errors: []
    }
    const userSessions = this.sessions.get(userId) || []
    userSessions.push(session)
    this.sessions.set(userId, userSessions)
    return sessionId
  }

  // Terminer une session d'étape
  endStepSession(userId: string, sessionId: string, data?: Record<string, any>): void {
    const userSessions = this.sessions.get(userId) || []
    const session = userSessions.find(s => s.id === sessionId)
    if (session) {
      session.endTime = new Date()
      session.duration = session.endTime.getTime() - session.startTime.getTime()
      if (data) {
        session.data = { ...session.data, ...data }
      }

      // Mettre à jour le temps total passé
      const progress = this.getProgress(userId)
      if (progress) {
        progress.timeSpent += session.duration || 0
        this.progress.set(userId, progress)
      }
    }
  }

  // Obtenir toutes les étapes
  getAllSteps(): OnboardingStep[] {
    return Array.from(this.steps.values())
  }

  // Obtenir les statistiques d'onboarding
  getOnboardingStats(): Record<string, any> {
    const allProgress = Array.from(this.progress.values())
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
    }
  }

  // Réinitialiser l'onboarding pour un utilisateur
  resetOnboarding(userId: string): void {
    this.progress.delete(userId)
    this.sessions.delete(userId)
    logger.info(`Onboarding reset for user: ${userId}`, {
      action: 'onboarding_reset',
      metadata: { userId }
    })
    metrics.increment('onboarding_reset', 1)
  }
}

// Instance globale
export const onboardingManager = new OnboardingManager()
// Fonctions utilitaires
export const startOnboarding = (userId: string) => {
  return onboardingManager.startOnboarding(userId)
}
export const getOnboardingProgress = (userId: string) => {
  return onboardingManager.getProgress(userId)
}
export const getCurrentOnboardingStep = (userId: string) => {
  return onboardingManager.getCurrentStep(userId)
}
export const nextOnboardingStep = (userId: string, stepData?: Record<string, any>) => {
  return onboardingManager.nextStep(userId, stepData)
}
export const skipOnboardingStep = (userId: string) => {
  return onboardingManager.skipStep(userId)
}
export const validateOnboardingStep = (userId: string, stepData: any) => {
  return onboardingManager.validateStep(userId, stepData)
}
export const getOnboardingStats = () => {
  return onboardingManager.getOnboardingStats()
}