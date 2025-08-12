import { AgentScoringEngine, MissionContext } from 'apos;./agent-scoring'apos;;

export interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  agentId: string;
  agentName: string;
  type: 'apos;analysis'apos; | 'apos;creation'apos; | 'apos;review'apos; | 'apos;optimization'apos; | 'apos;validation'apos;;
  dependencies: string[];
  estimatedDuration: number;
  priority: 'apos;low'apos; | 'apos;medium'apos; | 'apos;high'apos;;
  parameters: Record<string, any>;
}

export interface AdaptiveWorkflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  totalEstimatedDuration: number;
  complexity: 'apos;low'apos; | 'apos;medium'apos; | 'apos;high'apos;;
  parallelSteps: string[][];
  fallbackSteps: Record<string, string[]>;
}

export class AdaptiveWorkflowGenerator {
  private static readonly WORKFLOW_TEMPLATES = {
    content: {
      name: 'apos;Workflow de Création de Contenu'apos;,
      description: 'apos;Workflow optimisé pour la création de contenu de qualité'apos;,
      steps: [
        {
          type: 'apos;analysis'apos;,
          name: 'apos;Analyse des besoins'apos;,
          description: 'apos;Analyse approfondie des exigences et du contexte'apos;,
          priority: 'apos;high'apos; as const,
        },
        {
          type: 'apos;creation'apos;,
          name: 'apos;Création du contenu'apos;,
          description: 'apos;Création du contenu principal'apos;,
          priority: 'apos;high'apos; as const,
        },
        {
          type: 'apos;optimization'apos;,
          name: 'apos;Optimisation SEO'apos;,
          description: 'apos;Optimisation pour les moteurs de recherche'apos;,
          priority: 'apos;medium'apos; as const,
        },
        {
          type: 'apos;review'apos;,
          name: 'apos;Révision et amélioration'apos;,
          description: 'apos;Révision finale et améliorations'apos;,
          priority: 'apos;medium'apos; as const,
        },
      ],
    },
    automation: {
      name: 'apos;Workflow d\'apos;Automatisation'apos;,
      description: 'apos;Workflow pour l\'apos;automatisation de processus'apos;,
      steps: [
        {
          type: 'apos;analysis'apos;,
          name: 'apos;Analyse du processus'apos;,
          description: 'apos;Analyse du processus à automatiser'apos;,
          priority: 'apos;high'apos; as const,
        },
        {
          type: 'apos;creation'apos;,
          name: 'apos;Développement de l\'apos;automatisation'apos;,
          description: 'apos;Création du code et des intégrations'apos;,
          priority: 'apos;high'apos; as const,
        },
        {
          type: 'apos;validation'apos;,
          name: 'apos;Tests et validation'apos;,
          description: 'apos;Tests complets et validation'apos;,
          priority: 'apos;high'apos; as const,
        },
        {
          type: 'apos;optimization'apos;,
          name: 'apos;Optimisation des performances'apos;,
          description: 'apos;Optimisation et amélioration des performances'apos;,
          priority: 'apos;medium'apos; as const,
        },
      ],
    },
    research: {
      name: 'apos;Workflow de Recherche'apos;,
      description: 'apos;Workflow pour la recherche et l\'apos;analyse'apos;,
      steps: [
        {
          type: 'apos;analysis'apos;,
          name: 'apos;Définition de la recherche'apos;,
          description: 'apos;Définition des objectifs et de la méthodologie'apos;,
          priority: 'apos;high'apos; as const,
        },
        {
          type: 'apos;creation'apos;,
          name: 'apos;Collecte de données'apos;,
          description: 'apos;Collecte et organisation des données'apos;,
          priority: 'apos;high'apos; as const,
        },
        {
          type: 'apos;analysis'apos;,
          name: 'apos;Analyse approfondie'apos;,
          description: 'apos;Analyse détaillée des données collectées'apos;,
          priority: 'apos;high'apos; as const,
        },
        {
          type: 'apos;creation'apos;,
          name: 'apos;Rédaction du rapport'apos;,
          description: 'apos;Rédaction du rapport final'apos;,
          priority: 'apos;medium'apos; as const,
        },
      ],
    },
  };

  /**
   * Génère un workflow adaptatif basé sur le contexte de la mission
   */
  static async generateWorkflow(
    context: MissionContext,
    missionId: string
  ): Promise<AdaptiveWorkflow> {
    // Sélectionner le template de base
    const template = this.selectTemplate(context);
    
    // Calculer les scores des agents
    const agentScores = await AgentScoringEngine.calculateAgentScores(context, missionId);
    
    // Générer les étapes du workflow
    const steps = await this.generateSteps(template.steps, agentScores, context);
    
    // Calculer les étapes parallèles
    const parallelSteps = this.calculateParallelSteps(steps);
    
    // Générer les étapes de fallback
    const fallbackSteps = this.generateFallbackSteps(steps, agentScores);
    
    // Calculer la durée totale
    const totalDuration = steps.reduce((acc, step) => acc + step.estimatedDuration, 0);
    
    return {
      id: `workflow-${missionId}`,
      name: template.name,
      description: template.description,
      steps,
      totalEstimatedDuration: totalDuration,
      complexity: context.complexity,
      parallelSteps,
      fallbackSteps,
    };
  }

  /**
   * Sélectionne le template de workflow approprié
   */
  private static selectTemplate(context: MissionContext) {
    // Logique de sélection basée sur le type et les domaines
    if (context.type === 'apos;content'apos; || context.domain.includes('apos;content'apos;)) {
      return this.WORKFLOW_TEMPLATES.content;
    } else if (context.type === 'apos;automation'apos; || context.domain.includes('apos;automation'apos;)) {
      return this.WORKFLOW_TEMPLATES.automation;
    } else if (context.type === 'apos;research'apos; || context.domain.includes('apos;research'apos;)) {
      return this.WORKFLOW_TEMPLATES.research;
    }
    
    // Template par défaut
    return this.WORKFLOW_TEMPLATES.content;
  }

  /**
   * Génère les étapes du workflow avec les agents appropriés
   */
  private static async generateSteps(
    templateSteps: any[],
    agentScores: any[],
    context: MissionContext
  ): Promise<WorkflowStep[]> {
    const steps: WorkflowStep[] = [];
    
    for (let i = 0; i < templateSteps.length; i++) {
      const templateStep = templateSteps[i];
      
      // Sélectionner l'apos;agent optimal pour cette étape
      const optimalAgent = this.selectOptimalAgent(templateStep, agentScores, context);
      
      // Calculer la durée estimée
      const estimatedDuration = this.calculateStepDuration(templateStep, context);
      
      // Définir les dépendances
      const dependencies = this.calculateDependencies(i, templateSteps);
      
      // Générer les paramètres
      const parameters = this.generateStepParameters(templateStep, context);
      
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
      };
      
      steps.push(step);
    }
    
    return steps;
  }

  /**
   * Sélectionne l'apos;agent optimal pour une étape donnée
   */
  private static selectOptimalAgent(step: any, agentScores: any[], context: MissionContext) {
    // Filtrer les agents par type d'apos;étape
    const suitableAgents = agentScores.filter(agent => {
      const agentExpertise = this.getAgentExpertise(agent.agentId);
      
      switch (step.type) {
        case 'apos;analysis'apos;:
          return agentExpertise.domains.includes('apos;analysis'apos;) || 
                 agentExpertise.domains.includes('apos;research'apos;);
        case 'apos;creation'apos;:
          return agentExpertise.domains.includes('apos;content'apos;) || 
                 agentExpertise.domains.includes('apos;creative'apos;) ||
                 agentExpertise.domains.includes('apos;development'apos;);
        case 'apos;review'apos;:
          return agentExpertise.domains.includes('apos;content'apos;) || 
                 agentExpertise.domains.includes('apos;analysis'apos;);
        case 'apos;optimization'apos;:
          return agentExpertise.domains.includes('apos;optimization'apos;) || 
                 agentExpertise.domains.includes('apos;technical'apos;);
        case 'apos;validation'apos;:
          return agentExpertise.domains.includes('apos;analysis'apos;) || 
                 agentExpertise.domains.includes('apos;technical'apos;);
        default:
          return true;
      }
    });
    
    // Retourner l'apos;agent avec le meilleur score
    return suitableAgents.length > 0 ? suitableAgents[0] : agentScores[0];
  }

  /**
   * Calcule la durée estimée d'apos;une étape
   */
  private static calculateStepDuration(step: any, context: MissionContext): number {
    const baseDuration = this.getBaseDuration(step.type);
    const complexityMultiplier = this.getComplexityMultiplier(context.complexity);
    const urgencyMultiplier = this.getUrgencyMultiplier(context.urgency);
    
    return baseDuration * complexityMultiplier * urgencyMultiplier;
  }

  /**
   * Calcule les dépendances entre les étapes
   */
  private static calculateDependencies(stepIndex: number, steps: any[]): string[] {
    const dependencies: string[] = [];
    
    // Les étapes de création dépendent généralement de l'apos;analyse
    if (steps[stepIndex].type === 'apos;creation'apos;) {
      for (let i = 0; i < stepIndex; i++) {
        if (steps[i].type === 'apos;analysis'apos;) {
          dependencies.push(`step-${i + 1}`);
        }
      }
    }
    
    // Les étapes de review dépendent de la création
    if (steps[stepIndex].type === 'apos;review'apos;) {
      for (let i = 0; i < stepIndex; i++) {
        if (steps[i].type === 'apos;creation'apos;) {
          dependencies.push(`step-${i + 1}`);
        }
      }
    }
    
    // Les étapes d'apos;optimisation dépendent de la création
    if (steps[stepIndex].type === 'apos;optimization'apos;) {
      for (let i = 0; i < stepIndex; i++) {
        if (steps[i].type === 'apos;creation'apos;) {
          dependencies.push(`step-${i + 1}`);
        }
      }
    }
    
    return dependencies;
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
    };
    
    // Paramètres spécifiques par type d'apos;étape
    switch (step.type) {
      case 'apos;analysis'apos;:
        parameters.analysisDepth = context.complexity === 'apos;high'apos; ? 'apos;deep'apos; : 'apos;standard'apos;;
        parameters.includeMetrics = true;
        break;
      case 'apos;creation'apos;:
        parameters.creativeFreedom = context.complexity === 'apos;high'apos; ? 'apos;high'apos; : 'apos;medium'apos;;
        parameters.includeExamples = true;
        break;
      case 'apos;optimization'apos;:
        parameters.optimizationLevel = context.complexity === 'apos;high'apos; ? 'apos;comprehensive'apos; : 'apos;standard'apos;;
        break;
      case 'apos;validation'apos;:
        parameters.validationCriteria = context.requirements;
        break;
    }
    
    return parameters;
  }

  /**
   * Calcule les étapes qui peuvent être exécutées en parallèle
   */
  private static calculateParallelSteps(steps: WorkflowStep[]): string[][] {
    const parallelGroups: string[][] = [];
    const visited = new Set<string>();
    
    for (const step of steps) {
      if (visited.has(step.id)) continue;
      
      const parallelGroup = [step.id];
      visited.add(step.id);
      
      // Chercher les étapes qui peuvent être exécutées en parallèle
      for (const otherStep of steps) {
        if (visited.has(otherStep.id)) continue;
        
        // Vérifier s'apos;il n'apos;y a pas de dépendances entre les étapes
        const canRunInParallel = !step.dependencies.includes(otherStep.id) &&
                                !otherStep.dependencies.includes(step.id);
        
        if (canRunInParallel) {
          parallelGroup.push(otherStep.id);
          visited.add(otherStep.id);
        }
      }
      
      if (parallelGroup.length > 1) {
        parallelGroups.push(parallelGroup);
      }
    }
    
    return parallelGroups;
  }

  /**
   * Génère les étapes de fallback
   */
  private static generateFallbackSteps(steps: WorkflowStep[], agentScores: any[]): Record<string, string[]> {
    const fallbackSteps: Record<string, string[]> = {};
    
    for (const step of steps) {
      const fallbacks: string[] = [];
      
      // Trouver des agents alternatifs pour cette étape
      const alternativeAgents = agentScores
        .filter(agent => agent.agentId !== step.agentId)
        .slice(0, 2); // Prendre les 2 meilleurs agents alternatifs
      
      for (const agent of alternativeAgents) {
        fallbacks.push(agent.agentId);
      }
      
      fallbackSteps[step.id] = fallbacks;
    }
    
    return fallbackSteps;
  }

  // Méthodes utilitaires
  private static getAgentExpertise(agentId: string) {
    const expertiseMap: Record<string, any> = {
      'apos;karine-ai'apos;: { domains: ['apos;content'apos;, 'apos;writing'apos;, 'apos;seo'apos;, 'apos;marketing'apos;] },
      'apos;hugo-ai'apos;: { domains: ['apos;technical'apos;, 'apos;development'apos;, 'apos;automation'apos;] },
      'apos;jp-bot'apos;: { domains: ['apos;business'apos;, 'apos;strategy'apos;, 'apos;analysis'apos;] },
      'apos;elodie-ai'apos;: { domains: ['apos;design'apos;, 'apos;creative'apos;, 'apos;visual'apos;] },
      'apos;clara-la-closeuse'apos;: { domains: ['apos;research'apos;, 'apos;investigation'apos;, 'apos;analysis'apos;] },
      'apos;faucon-le-maitre-focus'apos;: { domains: ['apos;focus'apos;, 'apos;productivity'apos;, 'apos;optimization'apos;] },
    };
    
    return expertiseMap[agentId] || { domains: [] };
  }

  private static getBaseDuration(stepType: string): number {
    const durationMap: Record<string, number> = {
      analysis: 2 * 60 * 60 * 1000, // 2 heures
      creation: 4 * 60 * 60 * 1000, // 4 heures
      review: 1 * 60 * 60 * 1000,   // 1 heure
      optimization: 2 * 60 * 60 * 1000, // 2 heures
      validation: 1.5 * 60 * 60 * 1000, // 1.5 heures
    };
    
    return durationMap[stepType] || 2 * 60 * 60 * 1000;
  }

  private static getComplexityMultiplier(complexity: string): number {
    const multipliers: Record<string, number> = {
      low: 0.7,
      medium: 1.0,
      high: 1.5,
    };
    
    return multipliers[complexity] || 1.0;
  }

  private static getUrgencyMultiplier(urgency: string): number {
    const multipliers: Record<string, number> = {
      low: 1.2,
      medium: 1.0,
      high: 0.8,
    };
    
    return multipliers[urgency] || 1.0;
  }
}
