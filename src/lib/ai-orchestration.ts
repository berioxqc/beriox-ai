import { prisma } from 'apos;./prisma'apos;;
import { logger } from 'apos;./logger'apos;;

// Types pour l'apos;orchestration IA
export interface AgentCapability {
  id: string;
  name: string;
  description: string;
  specialties: string[];
  complexity: 'apos;basic'apos; | 'apos;intermediate'apos; | 'apos;advanced'apos;;
  performance: number; // 0-100
  availability: boolean;
  estimatedTime: number; // en minutes
}

export interface MissionContext {
  objective: string;
  context?: string;
  deadline?: Date;
  priority: 'apos;low'apos; | 'apos;medium'apos; | 'apos;high'apos; | 'apos;critical'apos;;
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

/**
 * Système d'apos;Orchestration IA Avancé pour Beriox AI
 * 
 * Ce système coordonne intelligemment les agents IA pour optimiser
 * l'apos;exécution des missions en fonction du contexte, des priorités
 * et des capacités des agents.
 */
export class AIOrchestrator {
  private agents: Map<string, AgentCapability> = new Map();
  private missionHistory: Map<string, any[]> = new Map();

  constructor() {
    this.initializeAgents();
  }

  /**
   * Initialise les agents disponibles avec leurs capacités
   */
  private initializeAgents(): void {
    const agentDefinitions: AgentCapability[] = [
      {
        id: 'apos;KarineAI'apos;,
        name: 'apos;Karine - Stratège Marketing'apos;,
        description: 'apos;Spécialiste en stratégie marketing et planification'apos;,
        specialties: ['apos;stratégie'apos;, 'apos;marketing'apos;, 'apos;planification'apos;, 'apos;analyse'apos;, 'apos;optimisation'apos;, 'apos;croissance'apos;],
        complexity: 'apos;advanced'apos;,
        performance: 92,
        availability: true,
        estimatedTime: 45
      },
      {
        id: 'apos;HugoAI'apos;,
        name: 'apos;Hugo - Développeur Web'apos;,
        description: 'apos;Expert en développement web et architecture technique'apos;,
        specialties: ['apos;développement'apos;, 'apos;architecture'apos;, 'apos;technique'apos;, 'apos;web'apos;, 'apos;optimisation'apos;, 'apos;intégration'apos;],
        complexity: 'apos;advanced'apos;,
        performance: 88,
        availability: true,
        estimatedTime: 60
      },
      {
        id: 'apos;JPBot'apos;,
        name: 'apos;JP - Analyste Critique'apos;,
        description: 'apos;Analyste de données et critique qualité'apos;,
        specialties: ['apos;analyse'apos;, 'apos;data'apos;, 'apos;critique'apos;, 'apos;qualité'apos;, 'apos;optimisation'apos;, 'apos;validation'apos;],
        complexity: 'apos;intermediate'apos;,
        performance: 85,
        availability: true,
        estimatedTime: 30
      },
      {
        id: 'apos;ElodieAI'apos;,
        name: 'apos;Élodie - Rédactrice SEO'apos;,
        description: 'apos;Rédactrice SEO et experte en contenu'apos;,
        specialties: ['apos;rédaction'apos;, 'apos;seo'apos;, 'apos;contenu'apos;, 'apos;communication'apos;, 'apos;copywriting'apos;, 'apos;ux'apos;],
        complexity: 'apos;intermediate'apos;,
        performance: 90,
        availability: true,
        estimatedTime: 40
      },
      {
        id: 'apos;ClaraLaCloseuse'apos;,
        name: 'apos;Clara - Experte Conversion'apos;,
        description: 'apos;Spécialiste en conversion et optimisation des ventes'apos;,
        specialties: ['apos;conversion'apos;, 'apos;vente'apos;, 'apos;persuasion'apos;, 'apos;cta'apos;, 'apos;funnel'apos;, 'apos;optimisation'apos;],
        complexity: 'apos;advanced'apos;,
        performance: 87,
        availability: true,
        estimatedTime: 35
      },
      {
        id: 'apos;FauconLeMaitreFocus'apos;,
        name: 'apos;Faucon - Coach Productivité'apos;,
        description: 'apos;Coach en productivité et optimisation des processus'apos;,
        specialties: ['apos;productivité'apos;, 'apos;focus'apos;, 'apos;optimisation'apos;, 'apos;efficacité'apos;, 'apos;organisation'apos;, 'apos;workflow'apos;],
        complexity: 'apos;intermediate'apos;,
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
   * Analyse le contexte de la mission et génère un plan d'apos;orchestration optimal
   */
  async orchestrateMission(missionId: string, context: MissionContext): Promise<OrchestrationResult> {
    try {
      logger.info(`🎯 Début orchestration pour mission: ${missionId}`, { missionContext: context });

      // 1. Analyser le contexte et les besoins
      const requirements = this.analyzeRequirements(context);
      
      // 2. Sélectionner les agents optimaux
      const selectedAgents = this.selectOptimalAgents(requirements, context);
      
      // 3. Créer le workflow d'apos;exécution
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

      logger.info(`✅ Orchestration terminée pour mission: ${missionId}`, { orchestrationPlan: plan });

      return {
        success: true,
        plan,
        recommendations: this.generateRecommendations(plan, context)
      };

    } catch (error) {
      logger.error(`❌ Erreur orchestration mission ${missionId}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'apos;Erreur inconnue'apos;
      };
    }
  }

  /**
   * Analyse les besoins de la mission basés sur le contexte
   */
  private analyzeRequirements(context: MissionContext): any {
    const requirements = {
      marketing: 0,
      technical: 0,
      content: 0,
      analysis: 0,
      conversion: 0,
      productivity: 0
    };

    const text = `${context.objective} ${context.context || 'apos;'apos;}`.toLowerCase();

    // Analyse sémantique simple basée sur les mots-clés
    if (text.includes('apos;marketing'apos;) || text.includes('apos;stratégie'apos;) || text.includes('apos;campagne'apos;)) {
      requirements.marketing += 3;
    }
    if (text.includes('apos;développement'apos;) || text.includes('apos;technique'apos;) || text.includes('apos;web'apos;)) {
      requirements.technical += 3;
    }
    if (text.includes('apos;contenu'apos;) || text.includes('apos;rédaction'apos;) || text.includes('apos;seo'apos;)) {
      requirements.content += 3;
    }
    if (text.includes('apos;analyse'apos;) || text.includes('apos;data'apos;) || text.includes('apos;performance'apos;)) {
      requirements.analysis += 3;
    }
    if (text.includes('apos;conversion'apos;) || text.includes('apos;vente'apos;) || text.includes('apos;cta'apos;)) {
      requirements.conversion += 3;
    }
    if (text.includes('apos;productivité'apos;) || text.includes('apos;optimisation'apos;) || text.includes('apos;processus'apos;)) {
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
  private selectOptimalAgents(requirements: any, context: MissionContext): AgentCapability[] {
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
      if (context.priority === 'apos;critical'apos; && agent.complexity === 'apos;advanced'apos;) {
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
      'apos;stratégie'apos;: 'apos;marketing'apos;,
      'apos;marketing'apos;: 'apos;marketing'apos;,
      'apos;développement'apos;: 'apos;technical'apos;,
      'apos;technique'apos;: 'apos;technical'apos;,
      'apos;rédaction'apos;: 'apos;content'apos;,
      'apos;contenu'apos;: 'apos;content'apos;,
      'apos;seo'apos;: 'apos;content'apos;,
      'apos;analyse'apos;: 'apos;analysis'apos;,
      'apos;data'apos;: 'apos;analysis'apos;,
      'apos;conversion'apos;: 'apos;conversion'apos;,
      'apos;vente'apos;: 'apos;conversion'apos;,
      'apos;productivité'apos;: 'apos;productivity'apos;,
      'apos;optimisation'apos;: 'apos;productivity'apos;
    };

    return mapping[specialty] || 'apos;analysis'apos;;
  }

  /**
   * Crée un workflow d'apos;exécution optimal
   */
  private createWorkflow(agents: AgentCapability[], context: MissionContext): WorkflowStep[] {
    const workflow: WorkflowStep[] = [];
    let stepNumber = 1;

    // Étape 1: Analyse et planification (toujours en premier)
    const analyst = agents.find(a => a.specialties.includes('apos;analyse'apos;) || a.specialties.includes('apos;stratégie'apos;));
    if (analyst) {
      workflow.push({
        step: stepNumber++,
        agentId: analyst.id,
        action: 'apos;Analyse du contexte et planification stratégique'apos;,
        dependencies: [],
        estimatedTime: analyst.estimatedTime,
        critical: true
      });
    }

    // Étape 2: Développement technique (si nécessaire)
    const developer = agents.find(a => a.specialties.includes('apos;développement'apos;) || a.specialties.includes('apos;technique'apos;));
    if (developer && context.objective.toLowerCase().includes('apos;développement'apos;)) {
      workflow.push({
        step: stepNumber++,
        agentId: developer.id,
        action: 'apos;Développement et architecture technique'apos;,
        dependencies: [1],
        estimatedTime: developer.estimatedTime,
        critical: true
      });
    }

    // Étape 3: Création de contenu
    const contentCreator = agents.find(a => a.specialties.includes('apos;rédaction'apos;) || a.specialties.includes('apos;contenu'apos;));
    if (contentCreator) {
      workflow.push({
        step: stepNumber++,
        agentId: contentCreator.id,
        action: 'apos;Création de contenu optimisé'apos;,
        dependencies: [1],
        estimatedTime: contentCreator.estimatedTime,
        critical: false
      });
    }

    // Étape 4: Optimisation conversion
    const conversionExpert = agents.find(a => a.specialties.includes('apos;conversion'apos;) || a.specialties.includes('apos;vente'apos;));
    if (conversionExpert) {
      workflow.push({
        step: stepNumber++,
        agentId: conversionExpert.id,
        action: 'apos;Optimisation des conversions'apos;,
        dependencies: [1, 3],
        estimatedTime: conversionExpert.estimatedTime,
        critical: false
      });
    }

    // Étape 5: Validation et critique
    const validator = agents.find(a => a.specialties.includes('apos;analyse'apos;) && a.id !== analyst?.id);
    if (validator) {
      workflow.push({
        step: stepNumber++,
        agentId: validator.id,
        action: 'apos;Validation et critique qualité'apos;,
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
  private calculateMetrics(agents: AgentCapability[], workflow: WorkflowStep[]): any {
    const totalTime = workflow.reduce((sum, step) => sum + step.estimatedTime, 0);
    const avgPerformance = agents.reduce((sum, agent) => sum + agent.performance, 0) / agents.length;
    const confidence = Math.min(100, avgPerformance + (workflow.length * 5));

    return {
      totalTime,
      avgPerformance,
      confidence,
      efficiency: totalTime > 0 ? (agents.length * 100) / totalTime : 0
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
      risks.push('apos;Délai insuffisant pour compléter la mission'apos;);
    }

    // Risque de dépendance
    const criticalSteps = workflow.filter(step => step.critical);
    if (criticalSteps.length > 2) {
      risks.push('apos;Trop d\'apos;étapes critiques - risque de blocage'apos;);
    }

    // Risque de performance
    const lowPerformanceAgents = agents.filter(agent => agent.performance < 80);
    if (lowPerformanceAgents.length > 0) {
      risks.push('apos;Agents avec performance faible détectés'apos;);
    }

    // Risque de disponibilité
    const unavailableAgents = agents.filter(agent => !agent.availability);
    if (unavailableAgents.length > 0) {
      risks.push('apos;Agents non disponibles détectés'apos;);
    }

    return risks;
  }

  /**
   * Génère des alternatives au plan principal
   */
  private generateAlternatives(requirements: any, context: MissionContext): AgentCapability[][] {
    const alternatives: AgentCapability[][] = [];

    // Alternative 1: Approche minimaliste (2 agents)
    const minimalAgents = this.selectOptimalAgents(requirements, context).slice(0, 2);
    if (minimalAgents.length >= 2) {
      alternatives.push(minimalAgents);
    }

    // Alternative 2: Approche spécialisée (agents experts uniquement)
    const expertAgents = Array.from(this.agents.values())
      .filter(agent => agent.complexity === 'apos;advanced'apos; && agent.performance > 85)
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
      recommendations.push('apos;Considérer diviser la mission en sous-missions pour réduire le délai'apos;);
    }

    if (plan.confidence < 80) {
      recommendations.push('apos;Ajouter des agents de validation pour améliorer la confiance'apos;);
    }

    if (plan.risks.length > 2) {
      recommendations.push('apos;Réviser le plan pour réduire les risques identifiés'apos;);
    }

    if (context.priority === 'apos;critical'apos; && plan.agents.length < 3) {
      recommendations.push('apos;Ajouter des agents pour les missions critiques'apos;);
    }

    return recommendations;
  }

  /**
   * Calcule le temps jusqu'apos;à la deadline
   */
  private getTimeUntilDeadline(deadline: Date): number {
    const now = new Date();
    const diffMs = deadline.getTime() - now.getTime();
    return Math.max(0, diffMs / (1000 * 60)); // en minutes
  }

  /**
   * Sauvegarde le plan d'apos;orchestration dans la base de données
   */
  private async saveOrchestrationPlan(plan: OrchestrationPlan): Promise<void> {
    try {
      await prisma.orchestrationPlan.create({
        data: {
          missionId: plan.missionId,
          agents: plan.agents.map(a => a.id),
          workflow: JSON.parse(JSON.stringify(plan.workflow)),
          estimatedDuration: plan.estimatedDuration,
          confidence: plan.confidence,
          risks: plan.risks,
          alternatives: plan.alternatives.map(alt => alt.map(a => a.id)),
          createdAt: new Date()
        }
      });
    } catch (error) {
      logger.error('apos;Erreur sauvegarde plan orchestration:'apos;, error);
      // Ne pas faire échouer l'apos;orchestration si la sauvegarde échoue
    }
  }

  /**
   * Exécute le plan d'apos;orchestration
   */
  async executePlan(plan: OrchestrationPlan): Promise<boolean> {
    try {
      logger.info(`🚀 Exécution du plan d'apos;orchestration pour mission: ${plan.missionId}`);

      // Mettre à jour le statut de la mission
      await prisma.mission.update({
        where: { id: plan.missionId },
        data: { status: 'apos;orchestrated'apos; }
      });

      // Créer les briefs pour chaque agent
      for (const step of plan.workflow) {
        const agent = plan.agents.find(a => a.id === step.agentId);
        if (agent) {
          await this.createBrief(plan.missionId, agent, step);
        }
      }

      logger.info(`✅ Plan d'apos;orchestration exécuté avec succès pour mission: ${plan.missionId}`);
      return true;

    } catch (error) {
      logger.error(`❌ Erreur exécution plan orchestration ${plan.missionId}:`, error);
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
          status: 'apos;queued'apos;,
          step: step.step,
          dependencies: step.dependencies,
          estimatedTime: step.estimatedTime,
          critical: step.critical,
          createdAt: new Date().toISOString()
        },
        status: 'apos;queued'apos;
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
**Critique:** ${step.critical ? 'apos;Oui'apos; : 'apos;Non'apos;}

**Instructions spécifiques:**
- Exécute cette étape avec ta spécialité: ${agent.specialties.join('apos;, 'apos;)}
- Respecte les dépendances: ${step.dependencies.length > 0 ? `Étapes ${step.dependencies.join('apos;, 'apos;)}` : 'apos;Aucune'apos;}
- Livre un résultat de qualité professionnelle
- Structure ta réponse de manière claire et exploitable

**Objectif:** ${step.action}`;

    return baseBrief;
  }
}

// Instance singleton
export const aiOrchestrator = new AIOrchestrator();
