import { prisma } from './prisma';
import { logger } from './logger';

// Types pour l'orchestration IA
export interface AgentCapability {
  id: string;
  name: string;
  description: string;
  specialties: string[];
  complexity: 'basic' | 'intermediate' | 'advanced';
  performance: number; // 0-100
  availability: boolean;
  estimatedTime: number; // en minutes
}

export interface MissionContext {
  objective: string;
  context?: string;
  deadline?: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
  budget?: number;
  constraints?: string[];
  expectedOutcome?: string;
}

export interface OrchestrationPlan {
  missionId: string;
  agents: AgentCapability[];
  workflow: WorkflowStep[];
  estimatedDuration: number;
  confidence: number; // 0-100
  risks: string[];
  alternatives: AgentCapability[][];
}

export interface WorkflowStep {
  step: number;
  agentId: string;
  action: string;
  dependencies: number[];
  estimatedTime: number;
  critical: boolean;
}

export interface OrchestrationResult {
  success: boolean;
  plan?: OrchestrationPlan;
  error?: string;
  recommendations?: string[];
}

// Types pour les besoins et métriques
export interface MissionRequirements {
  marketing: number;
  technical: number;
  content: number;
  analysis: number;
  conversion: number;
  productivity: number;
  [key: string]: number; // Index signature pour permettre l'accès dynamique
}

export interface PerformanceMetrics {
  totalTime: number;
  confidence: number;
  efficiency: number;
  cost: number;
}

/**
 * Système d'Orchestration IA Avancé pour Beriox AI
 * 
 * Ce système coordonne intelligemment les agents IA pour optimiser
 * l'exécution des missions en fonction du contexte, des priorités
 * et des capacités des agents.
 */
export class AIOrchestrator {
  private agents: Map<string, AgentCapability> = new Map();
  private missionHistory: Map<string, unknown[]> = new Map();

  constructor() {
    this.initializeAgents();
  }

  /**
   * Initialise les agents disponibles avec leurs capacités
   */
  private initializeAgents(): void {
    const agentDefinitions: AgentCapability[] = [
      {
        id: 'KarineAI',
        name: 'Karine - Stratège Marketing',
        description: 'Spécialiste en stratégie marketing et planification',
        specialties: ['stratégie', 'marketing', 'planification', 'analyse', 'optimisation', 'croissance'],
        complexity: 'advanced',
        performance: 92,
        availability: true,
        estimatedTime: 45
      },
      {
        id: 'HugoAI',
        name: 'Hugo - Développeur Web',
        description: 'Expert en développement web et architecture technique',
        specialties: ['développement', 'architecture', 'technique', 'web', 'optimisation', 'intégration'],
        complexity: 'advanced',
        performance: 88,
        availability: true,
        estimatedTime: 60
      },
      {
        id: 'JPBot',
        name: 'JP - Analyste Critique',
        description: 'Analyste de données et critique qualité',
        specialties: ['analyse', 'data', 'critique', 'qualité', 'optimisation', 'validation'],
        complexity: 'intermediate',
        performance: 85,
        availability: true,
        estimatedTime: 30
      },
      {
        id: 'ElodieAI',
        name: 'Élodie - Rédactrice SEO',
        description: 'Rédactrice SEO et experte en contenu',
        specialties: ['rédaction', 'seo', 'contenu', 'communication', 'copywriting', 'ux'],
        complexity: 'intermediate',
        performance: 90,
        availability: true,
        estimatedTime: 40
      },
      {
        id: 'ClaraLaCloseuse',
        name: 'Clara - Experte Conversion',
        description: 'Spécialiste en conversion et optimisation des ventes',
        specialties: ['conversion', 'vente', 'persuasion', 'cta', 'funnel', 'optimisation'],
        complexity: 'advanced',
        performance: 87,
        availability: true,
        estimatedTime: 35
      },
      {
        id: 'FauconLeMaitreFocus',
        name: 'Faucon - Coach Productivité',
        description: 'Coach en productivité et optimisation des processus',
        specialties: ['productivité', 'focus', 'optimisation', 'efficacité', 'organisation', 'workflow'],
        complexity: 'intermediate',
        performance: 83,
        availability: true,
        estimatedTime: 25
      }
    ];

    agentDefinitions.forEach(agent => {
      this.agents.set(agent.id, agent);
    });
  }

  /**
   * Analyse le contexte de la mission et génère un plan d'orchestration optimal
   */
  async orchestrateMission(missionId: string, context: MissionContext): Promise<OrchestrationResult> {
    try {
      logger.info(`🎯 Début orchestration pour mission: ${missionId}`);

      // 1. Analyser le contexte et les besoins
      const requirements = this.analyzeRequirements(context);
      
      // 2. Sélectionner les agents optimaux
      const selectedAgents = this.selectOptimalAgents(requirements, context);
      
      // 3. Créer le workflow d'exécution
      const workflow = this.createWorkflow(selectedAgents, context);
      
      // 4. Calculer les métriques de performance
      const metrics = this.calculateMetrics(selectedAgents, workflow);
      
      // 5. Identifier les risques et alternatives
      const risks = this.identifyRisks(selectedAgents, workflow, context);
      const alternatives = this.generateAlternatives(requirements, context);

      const plan: OrchestrationPlan = {
        missionId,
        agents: selectedAgents,
        workflow,
        estimatedDuration: metrics.totalTime,
        confidence: metrics.confidence,
        risks,
        alternatives
      };

      // 6. Sauvegarder le plan dans la base de données
      await this.saveOrchestrationPlan(plan);

      logger.info(`✅ Orchestration terminée pour mission: ${missionId}`);

      return {
        success: true,
        plan,
        recommendations: this.generateRecommendations(plan, context)
      };

    } catch (error) {
      logger.error(`❌ Erreur orchestration mission ${missionId}:`, error as Error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  }

  /**
   * Analyse les besoins de la mission basés sur le contexte
   */
  private analyzeRequirements(context: MissionContext): MissionRequirements {
    const requirements: MissionRequirements = {
      marketing: 0,
      technical: 0,
      content: 0,
      analysis: 0,
      conversion: 0,
      productivity: 0
    };

    const text = `${context.objective} ${context.context || ''}`.toLowerCase();

    // Analyse sémantique simple basée sur les mots-clés
    if (text.includes('marketing') || text.includes('stratégie') || text.includes('campagne')) {
      requirements.marketing += 3;
    }
    if (text.includes('développement') || text.includes('technique') || text.includes('web')) {
      requirements.technical += 3;
    }
    if (text.includes('contenu') || text.includes('rédaction') || text.includes('seo')) {
      requirements.content += 3;
    }
    if (text.includes('analyse') || text.includes('data') || text.includes('performance')) {
      requirements.analysis += 3;
    }
    if (text.includes('conversion') || text.includes('vente') || text.includes('cta')) {
      requirements.conversion += 3;
    }
    if (text.includes('productivité') || text.includes('optimisation') || text.includes('processus')) {
      requirements.productivity += 3;
    }

    // Ajuster selon la priorité
    const priorityMultiplier = {
      low: 0.7,
      medium: 1.0,
      high: 1.3,
      critical: 1.5
    }[context.priority] || 1.0;

    Object.keys(requirements).forEach(key => {
      requirements[key] *= priorityMultiplier;
    });

    return requirements;
  }

  /**
   * Sélectionne les agents optimaux basés sur les besoins
   */
  private selectOptimalAgents(requirements: MissionRequirements, context: MissionContext): AgentCapability[] {
    const agentScores = new Map<string, number>();

    // Calculer les scores pour chaque agent
    this.agents.forEach((agent, agentId) => {
      let score = 0;

      // Score basé sur les spécialités
      agent.specialties.forEach(specialty => {
        const specialtyKey = this.mapSpecialtyToRequirement(specialty);
        if (requirements[specialtyKey]) {
          score += requirements[specialtyKey] * agent.performance / 100;
        }
      });

      // Bonus pour la performance
      score += agent.performance / 10;

      // Bonus pour la disponibilité
      if (agent.availability) {
        score += 10;
      }

      // Ajuster selon la complexité de la mission
      if (context.priority === 'critical' && agent.complexity === 'advanced') {
        score += 20;
      }

      agentScores.set(agentId, score);
    });

    // Sélectionner les 3-4 meilleurs agents
    const sortedAgents = Array.from(agentScores.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 4)
      .map(([agentId]) => this.agents.get(agentId)!)
      .filter(Boolean);

    return sortedAgents;
  }

  /**
   * Mappe les spécialités aux besoins
   */
  private mapSpecialtyToRequirement(specialty: string): string {
    const mapping: Record<string, string> = {
      'stratégie': 'marketing',
      'marketing': 'marketing',
      'développement': 'technical',
      'technique': 'technical',
      'rédaction': 'content',
      'contenu': 'content',
      'seo': 'content',
      'analyse': 'analysis',
      'data': 'analysis',
      'conversion': 'conversion',
      'vente': 'conversion',
      'productivité': 'productivity',
      'optimisation': 'productivity'
    };

    return mapping[specialty] || 'analysis';
  }

  /**
   * Crée un workflow d'exécution optimal
   */
  private createWorkflow(agents: AgentCapability[], context: MissionContext): WorkflowStep[] {
    const workflow: WorkflowStep[] = [];
    let stepNumber = 1;

    // Étape 1: Analyse et planification (toujours en premier)
    const analyst = agents.find(a => a.specialties.includes('analyse') || a.specialties.includes('stratégie'));
    if (analyst) {
      workflow.push({
        step: stepNumber++,
        agentId: analyst.id,
        action: 'Analyse du contexte et planification stratégique',
        dependencies: [],
        estimatedTime: analyst.estimatedTime,
        critical: true
      });
    }

    // Étape 2: Développement technique (si nécessaire)
    const developer = agents.find(a => a.specialties.includes('développement') || a.specialties.includes('technique'));
    if (developer && context.objective.toLowerCase().includes('développement')) {
      workflow.push({
        step: stepNumber++,
        agentId: developer.id,
        action: 'Développement et architecture technique',
        dependencies: [1],
        estimatedTime: developer.estimatedTime,
        critical: true
      });
    }

    // Étape 3: Création de contenu
    const contentCreator = agents.find(a => a.specialties.includes('rédaction') || a.specialties.includes('contenu'));
    if (contentCreator) {
      workflow.push({
        step: stepNumber++,
        agentId: contentCreator.id,
        action: 'Création de contenu optimisé',
        dependencies: [1],
        estimatedTime: contentCreator.estimatedTime,
        critical: false
      });
    }

    // Étape 4: Optimisation conversion
    const conversionExpert = agents.find(a => a.specialties.includes('conversion') || a.specialties.includes('vente'));
    if (conversionExpert) {
      workflow.push({
        step: stepNumber++,
        agentId: conversionExpert.id,
        action: 'Optimisation des conversions',
        dependencies: [1, 3],
        estimatedTime: conversionExpert.estimatedTime,
        critical: false
      });
    }

    // Étape 5: Validation et critique
    const validator = agents.find(a => a.specialties.includes('analyse') && a.id !== analyst?.id);
    if (validator) {
      workflow.push({
        step: stepNumber++,
        agentId: validator.id,
        action: 'Validation et critique qualité',
        dependencies: workflow.map(w => w.step),
        estimatedTime: validator.estimatedTime,
        critical: true
      });
    }

    return workflow;
  }

  /**
   * Calcule les métriques de performance du plan
   */
  private calculateMetrics(agents: AgentCapability[], workflow: WorkflowStep[]): PerformanceMetrics {
    const totalTime = workflow.reduce((sum, step) => sum + step.estimatedTime, 0);
    const avgPerformance = agents.reduce((sum, agent) => sum + agent.performance, 0) / agents.length;
    const confidence = Math.min(100, avgPerformance + (workflow.length * 5));

    return {
      totalTime,
      confidence,
      efficiency: totalTime > 0 ? (agents.length * 100) / totalTime : 0,
      cost: 0 // Placeholder for cost calculation
    };
  }

  /**
   * Identifie les risques potentiels
   */
  private identifyRisks(agents: AgentCapability[], workflow: WorkflowStep[], context: MissionContext): string[] {
    const risks: string[] = [];

    // Risque de délai
    const totalTime = workflow.reduce((sum, step) => sum + step.estimatedTime, 0);
    if (context.deadline && totalTime > this.getTimeUntilDeadline(context.deadline)) {
      risks.push('Délai insuffisant pour compléter la mission');
    }

    // Risque de dépendance
    const criticalSteps = workflow.filter(step => step.critical);
    if (criticalSteps.length > 2) {
      risks.push('Trop d\'étapes critiques - risque de blocage');
    }

    // Risque de performance
    const lowPerformanceAgents = agents.filter(agent => agent.performance < 80);
    if (lowPerformanceAgents.length > 0) {
      risks.push('Agents avec performance faible détectés');
    }

    // Risque de disponibilité
    const unavailableAgents = agents.filter(agent => !agent.availability);
    if (unavailableAgents.length > 0) {
      risks.push('Agents non disponibles détectés');
    }

    return risks;
  }

  /**
   * Génère des alternatives au plan principal
   */
  private generateAlternatives(requirements: MissionRequirements, context: MissionContext): AgentCapability[][] {
    const alternatives: AgentCapability[][] = [];

    // Alternative 1: Approche minimaliste (2 agents)
    const minimalAgents = this.selectOptimalAgents(requirements, context).slice(0, 2);
    if (minimalAgents.length >= 2) {
      alternatives.push(minimalAgents);
    }

    // Alternative 2: Approche spécialisée (agents experts uniquement)
    const expertAgents = Array.from(this.agents.values())
      .filter(agent => agent.complexity === 'advanced' && agent.performance > 85)
      .slice(0, 3);
    if (expertAgents.length >= 2) {
      alternatives.push(expertAgents);
    }

    return alternatives;
  }

  /**
   * Génère des recommandations pour optimiser le plan
   */
  private generateRecommendations(plan: OrchestrationPlan, context: MissionContext): string[] {
    const recommendations: string[] = [];

    if (plan.estimatedDuration > 120) {
      recommendations.push('Considérer diviser la mission en sous-missions pour réduire le délai');
    }

    if (plan.confidence < 80) {
      recommendations.push('Ajouter des agents de validation pour améliorer la confiance');
    }

    if (plan.risks.length > 2) {
      recommendations.push('Réviser le plan pour réduire les risques identifiés');
    }

    if (context.priority === 'critical' && plan.agents.length < 3) {
      recommendations.push('Ajouter des agents pour les missions critiques');
    }

    return recommendations;
  }

  /**
   * Calcule le temps jusqu'à la deadline
   */
  private getTimeUntilDeadline(deadline: Date): number {
    const now = new Date();
    const diffMs = deadline.getTime() - now.getTime();
    return Math.max(0, diffMs / (1000 * 60)); // en minutes
  }

  /**
   * Sauvegarde le plan d'orchestration dans la base de données
   */
  private async saveOrchestrationPlan(plan: OrchestrationPlan): Promise<void> {
    try {
      // TODO: Réactiver après correction du client Prisma
      // await prisma.orchestrationPlan.create({
      //   data: {
      //     missionId: plan.missionId,
      //     agents: plan.agents.map(a => a.id),
      //     workflow: JSON.parse(JSON.stringify(plan.workflow)),
      //     estimatedDuration: plan.estimatedDuration,
      //     confidence: plan.confidence,
      //     risks: plan.risks,
      //     alternatives: plan.alternatives.map(alt => alt.map(a => a.id)),
      //     createdAt: new Date()
      //   }
      // });
    } catch (error) {
      logger.error('Erreur sauvegarde plan orchestration:', error as Error);
      // Ne pas faire échouer l'orchestration si la sauvegarde échoue
    }
  }

  /**
   * Exécute le plan d'orchestration
   */
  async executePlan(plan: OrchestrationPlan): Promise<boolean> {
    try {
      logger.info(`🚀 Exécution du plan d'orchestration pour mission: ${plan.missionId}`);

      // Mettre à jour le statut de la mission
      await prisma.mission.update({
        where: { id: plan.missionId },
        data: { status: 'orchestrated' }
      });

      // Créer les briefs pour chaque agent
      for (const step of plan.workflow) {
        const agent = plan.agents.find(a => a.id === step.agentId);
        if (agent) {
          await this.createBrief(plan.missionId, agent, step);
        }
      }

      logger.info(`✅ Plan d'orchestration exécuté avec succès pour mission: ${plan.missionId}`);
      return true;

    } catch (error) {
      logger.error(`❌ Erreur exécution plan orchestration ${plan.missionId}:`, error as Error);
      return false;
    }
  }

  /**
   * Crée un brief pour un agent
   */
  private async createBrief(missionId: string, agent: AgentCapability, step: WorkflowStep): Promise<void> {
    const brief = this.generateBrief(agent, step);
    
    await prisma.brief.create({
      data: {
        missionId,
        agent: agent.id,
        contentJson: {
          brief,
          status: 'queued',
          step: step.step,
          dependencies: step.dependencies,
          estimatedTime: step.estimatedTime,
          critical: step.critical,
          createdAt: new Date().toISOString()
        },
        status: 'queued'
      }
    });
  }

  /**
   * Génère un brief personnalisé pour un agent
   */
  private generateBrief(agent: AgentCapability, step: WorkflowStep): string {
    const baseBrief = `**Mission:** ${step.action}

**Agent:** ${agent.name}
**Étape:** ${step.step}
**Temps estimé:** ${step.estimatedTime} minutes
**Critique:** ${step.critical ? 'Oui' : 'Non'}

**Instructions spécifiques:**
- Exécute cette étape avec ta spécialité: ${agent.specialties.join(', ')}
- Respecte les dépendances: ${step.dependencies.length > 0 ? `Étapes ${step.dependencies.join(', ')}` : 'Aucune'}
- Livre un résultat de qualité professionnelle
- Structure ta réponse de manière claire et exploitable

**Objectif:** ${step.action}`;

    return baseBrief;
  }
}

// Instance singleton
export const aiOrchestrator = new AIOrchestrator();
