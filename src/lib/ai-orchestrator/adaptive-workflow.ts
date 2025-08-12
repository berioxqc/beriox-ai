import { AgentScoringEngine, MissionContext } from './agent-scoring'
export interface WorkflowStep {
  id: string
  name: string
  description: string
  agentId: string
  agentName: string
  type: 'analysis' | 'creation' | 'review' | 'optimization' | 'validation'
  dependencies: string[]
  estimatedDuration: number
  priority: 'low' | 'medium' | 'high'
  parameters: Record<string, any>
}

export interface AdaptiveWorkflow {
  id: string
  name: string
  description: string
  steps: WorkflowStep[]
  totalEstimatedDuration: number
  complexity: 'low' | 'medium' | 'high'
  parallelSteps: string[][]
  fallbackSteps: Record<string, string[]>
}

export class AdaptiveWorkflowGenerator {
  private static readonly WORKFLOW_TEMPLATES = {
    content: {
      name: 'Workflow de Création de Contenu',
      description: 'Workflow optimisé pour la création de contenu de qualité',
      steps: [
        {
          type: 'analysis',
          name: 'Analyse des besoins',
          description: 'Analyse approfondie des exigences et du contexte',
          priority: 'high' as const,
        },
        {
          type: 'creation',
          name: 'Création du contenu',
          description: 'Création du contenu principal',
          priority: 'high' as const,
        },
        {
          type: 'optimization',
          name: 'Optimisation SEO',
          description: 'Optimisation pour les moteurs de recherche',
          priority: 'medium' as const,
        },
        {
          type: 'review',
          name: 'Révision et amélioration',
          description: 'Révision finale et améliorations',
          priority: 'medium' as const,
        },
      ],
    },
    automation: {
      name: 'Workflow d\'Automatisation',
      description: 'Workflow pour l\'automatisation de processus',
      steps: [
        {
          type: 'analysis',
          name: 'Analyse du processus',
          description: 'Analyse du processus à automatiser',
          priority: 'high' as const,
        },
        {
          type: 'creation',
          name: 'Développement de l\'automatisation',
          description: 'Création du code et des intégrations',
          priority: 'high' as const,
        },
        {
          type: 'validation',
          name: 'Tests et validation',
          description: 'Tests complets et validation',
          priority: 'high' as const,
        },
        {
          type: 'optimization',
          name: 'Optimisation des performances',
          description: 'Optimisation et amélioration des performances',
          priority: 'medium' as const,
        },
      ],
    },
    research: {
      name: 'Workflow de Recherche',
      description: 'Workflow pour la recherche et l\'analyse',
      steps: [
        {
          type: 'analysis',
          name: 'Définition de la recherche',
          description: 'Définition des objectifs et de la méthodologie',
          priority: 'high' as const,
        },
        {
          type: 'creation',
          name: 'Collecte de données',
          description: 'Collecte et organisation des données',
          priority: 'high' as const,
        },
        {
          type: 'analysis',
          name: 'Analyse approfondie',
          description: 'Analyse détaillée des données collectées',
          priority: 'high' as const,
        },
        {
          type: 'creation',
          name: 'Rédaction du rapport',
          description: 'Rédaction du rapport final',
          priority: 'medium' as const,
        },
      ],
    },
  }
  /**
   * Génère un workflow adaptatif basé sur le contexte de la mission
   */
  static async generateWorkflow(
    context: MissionContext,
    missionId: string
  ): Promise<AdaptiveWorkflow> {
    // Sélectionner le template de base
    const template = this.selectTemplate(context)
    // Calculer les scores des agents
    const agentScores = await AgentScoringEngine.calculateAgentScores(context, missionId)
    // Générer les étapes du workflow
    const steps = await this.generateSteps(template.steps, agentScores, context)
    // Calculer les étapes parallèles
    const parallelSteps = this.calculateParallelSteps(steps)
    // Générer les étapes de fallback
    const fallbackSteps = this.generateFallbackSteps(steps, agentScores)
    // Calculer la durée totale
    const totalDuration = steps.reduce((acc, step) => acc + step.estimatedDuration, 0)
    return {
      id: `workflow-${missionId}`,
      name: template.name,
      description: template.description,
      steps,
      totalEstimatedDuration: totalDuration,
      complexity: context.complexity,
      parallelSteps,
      fallbackSteps,
    }
  }

  /**
   * Sélectionne le template de workflow approprié
   */
  private static selectTemplate(context: MissionContext) {
    // Logique de sélection basée sur le type et les domaines
    if (context.type === 'content' || context.domain.includes('content')) {
      return this.WORKFLOW_TEMPLATES.content
    } else if (context.type === 'automation' || context.domain.includes('automation')) {
      return this.WORKFLOW_TEMPLATES.automation
    } else if (context.type === 'research' || context.domain.includes('research')) {
      return this.WORKFLOW_TEMPLATES.research
    }
    
    // Template par défaut
    return this.WORKFLOW_TEMPLATES.content
  }

  /**
   * Génère les étapes du workflow avec les agents appropriés
   */
  private static async generateSteps(
    templateSteps: any[],
    agentScores: any[],
    context: MissionContext
  ): Promise<WorkflowStep[]> {
    const steps: WorkflowStep[] = []
    for (let i = 0; i < templateSteps.length; i++) {
      const templateStep = templateSteps[i]
      // Sélectionner l'agent optimal pour cette étape
      const optimalAgent = this.selectOptimalAgent(templateStep, agentScores, context)
      // Calculer la durée estimée
      const estimatedDuration = this.calculateStepDuration(templateStep, context)
      // Définir les dépendances
      const dependencies = this.calculateDependencies(i, templateSteps)
      // Générer les paramètres
      const parameters = this.generateStepParameters(templateStep, context)
      const step: WorkflowStep = {
        id: `step-${i + 1}`,
        name: templateStep.name,
        description: templateStep.description,
        agentId: optimalAgent.agentId,
        agentName: optimalAgent.agentName,
        type: templateStep.type,
        dependencies,
        estimatedDuration,
        priority: templateStep.priority,
        parameters,
      }
      steps.push(step)
    }
    
    return steps
  }

  /**
   * Sélectionne l'agent optimal pour une étape donnée
   */
  private static selectOptimalAgent(step: any, agentScores: any[], context: MissionContext) {
    // Filtrer les agents par type d'étape
    const suitableAgents = agentScores.filter(agent => {
      const agentExpertise = this.getAgentExpertise(agent.agentId)
      switch (step.type) {
        case 'analysis':
          return agentExpertise.domains.includes('analysis') || 
                 agentExpertise.domains.includes('research')
        case 'creation':
          return agentExpertise.domains.includes('content') || 
                 agentExpertise.domains.includes('creative') ||
                 agentExpertise.domains.includes('development')
        case 'review':
          return agentExpertise.domains.includes('content') || 
                 agentExpertise.domains.includes('analysis')
        case 'optimization':
          return agentExpertise.domains.includes('optimization') || 
                 agentExpertise.domains.includes('technical')
        case 'validation':
          return agentExpertise.domains.includes('analysis') || 
                 agentExpertise.domains.includes('technical')
        default:
          return true
      }
    })
    // Retourner l'agent avec le meilleur score
    return suitableAgents.length > 0 ? suitableAgents[0] : agentScores[0]
  }

  /**
   * Calcule la durée estimée d'une étape
   */
  private static calculateStepDuration(step: any, context: MissionContext): number {
    const baseDuration = this.getBaseDuration(step.type)
    const complexityMultiplier = this.getComplexityMultiplier(context.complexity)
    const urgencyMultiplier = this.getUrgencyMultiplier(context.urgency)
    return baseDuration * complexityMultiplier * urgencyMultiplier
  }

  /**
   * Calcule les dépendances entre les étapes
   */
  private static calculateDependencies(stepIndex: number, steps: any[]): string[] {
    const dependencies: string[] = []
    // Les étapes de création dépendent généralement de l'analyse
    if (steps[stepIndex].type === 'creation') {
      for (let i = 0; i < stepIndex; i++) {
        if (steps[i].type === 'analysis') {
          dependencies.push(`step-${i + 1}`)
        }
      }
    }
    
    // Les étapes de review dépendent de la création
    if (steps[stepIndex].type === 'review') {
      for (let i = 0; i < stepIndex; i++) {
        if (steps[i].type === 'creation') {
          dependencies.push(`step-${i + 1}`)
        }
      }
    }
    
    // Les étapes d'optimisation dépendent de la création
    if (steps[stepIndex].type === 'optimization') {
      for (let i = 0; i < stepIndex; i++) {
        if (steps[i].type === 'creation') {
          dependencies.push(`step-${i + 1}`)
        }
      }
    }
    
    return dependencies
  }

  /**
   * Génère les paramètres pour une étape
   */
  private static generateStepParameters(step: any, context: MissionContext): Record<string, any> {
    const parameters: Record<string, any> = {
      missionType: context.type,
      complexity: context.complexity,
      urgency: context.urgency,
      domains: context.domain,
      keywords: context.keywords,
      requirements: context.requirements,
    }
    // Paramètres spécifiques par type d'étape
    switch (step.type) {
      case 'analysis':
        parameters.analysisDepth = context.complexity === 'high' ? 'deep' : 'standard'
        parameters.includeMetrics = true
        break
      case 'creation':
        parameters.creativeFreedom = context.complexity === 'high' ? 'high' : 'medium'
        parameters.includeExamples = true
        break
      case 'optimization':
        parameters.optimizationLevel = context.complexity === 'high' ? 'comprehensive' : 'standard'
        break
      case 'validation':
        parameters.validationCriteria = context.requirements
        break
    }
    
    return parameters
  }

  /**
   * Calcule les étapes qui peuvent être exécutées en parallèle
   */
  private static calculateParallelSteps(steps: WorkflowStep[]): string[][] {
    const parallelGroups: string[][] = []
    const visited = new Set<string>()
    for (const step of steps) {
      if (visited.has(step.id)) continue
      const parallelGroup = [step.id]
      visited.add(step.id)
      // Chercher les étapes qui peuvent être exécutées en parallèle
      for (const otherStep of steps) {
        if (visited.has(otherStep.id)) continue
        // Vérifier s'il n'y a pas de dépendances entre les étapes
        const canRunInParallel = !step.dependencies.includes(otherStep.id) &&
                                !otherStep.dependencies.includes(step.id)
        if (canRunInParallel) {
          parallelGroup.push(otherStep.id)
          visited.add(otherStep.id)
        }
      }
      
      if (parallelGroup.length > 1) {
        parallelGroups.push(parallelGroup)
      }
    }
    
    return parallelGroups
  }

  /**
   * Génère les étapes de fallback
   */
  private static generateFallbackSteps(steps: WorkflowStep[], agentScores: any[]): Record<string, string[]> {
    const fallbackSteps: Record<string, string[]> = {}
    for (const step of steps) {
      const fallbacks: string[] = []
      // Trouver des agents alternatifs pour cette étape
      const alternativeAgents = agentScores
        .filter(agent => agent.agentId !== step.agentId)
        .slice(0, 2); // Prendre les 2 meilleurs agents alternatifs
      
      for (const agent of alternativeAgents) {
        fallbacks.push(agent.agentId)
      }
      
      fallbackSteps[step.id] = fallbacks
    }
    
    return fallbackSteps
  }

  // Méthodes utilitaires
  private static getAgentExpertise(agentId: string) {
    const expertiseMap: Record<string, any> = {
      'karine-ai': { domains: ['content', 'writing', 'seo', 'marketing'] },
      'hugo-ai': { domains: ['technical', 'development', 'automation'] },
      'jp-bot': { domains: ['business', 'strategy', 'analysis'] },
      'elodie-ai': { domains: ['design', 'creative', 'visual'] },
      'clara-la-closeuse': { domains: ['research', 'investigation', 'analysis'] },
      'faucon-le-maitre-focus': { domains: ['focus', 'productivity', 'optimization'] },
    }
    return expertiseMap[agentId] || { domains: [] }
  }

  private static getBaseDuration(stepType: string): number {
    const durationMap: Record<string, number> = {
      analysis: 2 * 60 * 60 * 1000, // 2 heures
      creation: 4 * 60 * 60 * 1000, // 4 heures
      review: 1 * 60 * 60 * 1000,   // 1 heure
      optimization: 2 * 60 * 60 * 1000, // 2 heures
      validation: 1.5 * 60 * 60 * 1000, // 1.5 heures
    }
    return durationMap[stepType] || 2 * 60 * 60 * 1000
  }

  private static getComplexityMultiplier(complexity: string): number {
    const multipliers: Record<string, number> = {
      low: 0.7,
      medium: 1.0,
      high: 1.5,
    }
    return multipliers[complexity] || 1.0
  }

  private static getUrgencyMultiplier(urgency: string): number {
    const multipliers: Record<string, number> = {
      low: 1.2,
      medium: 1.0,
      high: 0.8,
    }
    return multipliers[urgency] || 1.0
  }
}
