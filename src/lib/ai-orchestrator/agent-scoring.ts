import { prisma } from 'apos;@/lib/prisma'apos;;

export interface AgentScore {
  agentId: string;
  agentName: string;
  score: number;
  factors: {
    expertise: number;
    performance: number;
    availability: number;
    context: number;
    workload: number;
  };
  reasoning: string[];
}

export interface MissionContext {
  type: 'apos;content'apos; | 'apos;analysis'apos; | 'apos;automation'apos; | 'apos;research'apos; | 'apos;creative'apos;;
  complexity: 'apos;low'apos; | 'apos;medium'apos; | 'apos;high'apos;;
  urgency: 'apos;low'apos; | 'apos;medium'apos; | 'apos;high'apos;;
  domain: string[];
  keywords: string[];
  requirements: string[];
}

export class AgentScoringEngine {
  private static readonly WEIGHTS = {
    expertise: 0.3,
    performance: 0.25,
    availability: 0.2,
    context: 0.15,
    workload: 0.1,
  };

  private static readonly AGENT_EXPERTISE = {
    'apos;karine-ai'apos;: {
      domains: ['apos;content'apos;, 'apos;writing'apos;, 'apos;seo'apos;, 'apos;marketing'apos;],
      strengths: ['apos;creative'apos;, 'apos;structured'apos;, 'apos;user-friendly'apos;],
      keywords: ['apos;article'apos;, 'apos;blog'apos;, 'apos;content'apos;, 'apos;seo'apos;, 'apos;marketing'apos;, 'apos;wordpress'apos;],
    },
    'apos;hugo-ai'apos;: {
      domains: ['apos;technical'apos;, 'apos;development'apos;, 'apos;automation'apos;],
      strengths: ['apos;analytical'apos;, 'apos;precise'apos;, 'apos;systematic'apos;],
      keywords: ['apos;code'apos;, 'apos;development'apos;, 'apos;automation'apos;, 'apos;technical'apos;, 'apos;api'apos;, 'apos;integration'apos;],
    },
    'apos;jp-bot'apos;: {
      domains: ['apos;business'apos;, 'apos;strategy'apos;, 'apos;analysis'apos;],
      strengths: ['apos;strategic'apos;, 'apos;business-focused'apos;, 'apos;data-driven'apos;],
      keywords: ['apos;business'apos;, 'apos;strategy'apos;, 'apos;analysis'apos;, 'apos;roi'apos;, 'apos;metrics'apos;, 'apos;planning'apos;],
    },
    'apos;elodie-ai'apos;: {
      domains: ['apos;design'apos;, 'apos;creative'apos;, 'apos;visual'apos;],
      strengths: ['apos;creative'apos;, 'apos;aesthetic'apos;, 'apos;user-experience'apos;],
      keywords: ['apos;design'apos;, 'apos;ui'apos;, 'apos;ux'apos;, 'apos;creative'apos;, 'apos;visual'apos;, 'apos;branding'apos;],
    },
    'apos;clara-la-closeuse'apos;: {
      domains: ['apos;research'apos;, 'apos;investigation'apos;, 'apos;analysis'apos;],
      strengths: ['apos;detailed'apos;, 'apos;thorough'apos;, 'apos;investigative'apos;],
      keywords: ['apos;research'apos;, 'apos;investigation'apos;, 'apos;analysis'apos;, 'apos;data'apos;, 'apos;insights'apos;],
    },
    'apos;faucon-le-maitre-focus'apos;: {
      domains: ['apos;focus'apos;, 'apos;productivity'apos;, 'apos;optimization'apos;],
      strengths: ['apos;focused'apos;, 'apos;efficient'apos;, 'apos;optimization'apos;],
      keywords: ['apos;focus'apos;, 'apos;productivity'apos;, 'apos;optimization'apos;, 'apos;efficiency'apos;, 'apos;workflow'apos;],
    },
  };

  /**
   * Calcule le score optimal pour chaque agent basé sur le contexte de la mission
   */
  static async calculateAgentScores(
    context: MissionContext,
    missionId: string
  ): Promise<AgentScore[]> {
    const agents = await this.getAvailableAgents();
    const scores: AgentScore[] = [];

    for (const agent of agents) {
      const expertiseScore = this.calculateExpertiseScore(agent, context);
      const performanceScore = await this.calculatePerformanceScore(agent, context);
      const availabilityScore = await this.calculateAvailabilityScore(agent);
      const contextScore = this.calculateContextScore(agent, context);
      const workloadScore = await this.calculateWorkloadScore(agent);

      const weightedScore = 
        expertiseScore * this.WEIGHTS.expertise +
        performanceScore * this.WEIGHTS.performance +
        availabilityScore * this.WEIGHTS.availability +
        contextScore * this.WEIGHTS.context +
        workloadScore * this.WEIGHTS.workload;

      const reasoning = this.generateReasoning(agent, context, {
        expertise: expertiseScore,
        performance: performanceScore,
        availability: availabilityScore,
        context: contextScore,
        workload: workloadScore,
      });

      scores.push({
        agentId: agent.id,
        agentName: agent.name,
        score: weightedScore,
        factors: {
          expertise: expertiseScore,
          performance: performanceScore,
          availability: availabilityScore,
          context: contextScore,
          workload: workloadScore,
        },
        reasoning,
      });
    }

    // Trier par score décroissant
    return scores.sort((a, b) => b.score - a.score);
  }

  /**
   * Calcule le score d'apos;expertise basé sur la correspondance domaine/mots-clés
   */
  private static calculateExpertiseScore(agent: any, context: MissionContext): number {
    const agentExpertise = this.AGENT_EXPERTISE[agent.id as keyof typeof this.AGENT_EXPERTISE];
    if (!agentExpertise) return 0.5; // Score par défaut

    let score = 0;
    let totalFactors = 0;

    // Correspondance des domaines
    const domainMatch = context.domain.some(domain => 
      agentExpertise.domains.includes(domain)
    );
    score += domainMatch ? 1 : 0;
    totalFactors++;

    // Correspondance des mots-clés
    const keywordMatches = context.keywords.filter(keyword =>
      agentExpertise.keywords.some(agentKeyword =>
        keyword.toLowerCase().includes(agentKeyword.toLowerCase())
      )
    ).length;
    const keywordScore = keywordMatches / Math.max(context.keywords.length, 1);
    score += keywordScore;
    totalFactors++;

    // Correspondance du type de mission
    const typeMatch = this.getTypeMatchScore(context.type, agentExpertise.domains);
    score += typeMatch;
    totalFactors++;

    return score / totalFactors;
  }

  /**
   * Calcule le score de performance basé sur l'apos;historique
   */
  private static async calculatePerformanceScore(agent: any, context: MissionContext): Promise<number> {
    try {
      // Récupérer les missions récentes de l'apos;agent
      const recentMissions = await prisma.mission.findMany({
        where: {
          agentId: agent.id,
          status: 'apos;COMPLETED'apos;,
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 derniers jours
          },
        },
        include: {
          deliverables: true,
        },
      });

      if (recentMissions.length === 0) return 0.7; // Score par défaut

      let totalScore = 0;
      let totalMissions = 0;

      for (const mission of recentMissions) {
        // Score basé sur la qualité des livrables
        const deliverableScore = mission.deliverables.reduce((acc, deliverable) => {
          return acc + (deliverable.quality || 0.7);
        }, 0) / Math.max(mission.deliverables.length, 1);

        // Score basé sur le temps de completion
        const expectedDuration = this.getExpectedDuration(context.complexity);
        const actualDuration = mission.completedAt 
          ? new Date(mission.completedAt).getTime() - new Date(mission.createdAt).getTime()
          : 0;
        const timeScore = actualDuration > 0 
          ? Math.min(1, expectedDuration / actualDuration)
          : 0.7;

        // Score basé sur la satisfaction client
        const satisfactionScore = mission.satisfaction || 0.7;

        const missionScore = (deliverableScore + timeScore + satisfactionScore) / 3;
        totalScore += missionScore;
        totalMissions++;
      }

      return totalMissions > 0 ? totalScore / totalMissions : 0.7;
    } catch (error) {
      console.error('apos;Erreur lors du calcul du score de performance:'apos;, error);
      return 0.7;
    }
  }

  /**
   * Calcule le score de disponibilité de l'apos;agent
   */
  private static async calculateAvailabilityScore(agent: any): Promise<number> {
    try {
      // Vérifier les missions en cours
      const activeMissions = await prisma.mission.count({
        where: {
          agentId: agent.id,
          status: {
            in: ['apos;PENDING'apos;, 'apos;IN_PROGRESS'apos;],
          },
        },
      });

      // Plus l'apos;agent a de missions actives, moins il est disponible
      const availabilityScore = Math.max(0, 1 - (activeMissions * 0.2));
      return availabilityScore;
    } catch (error) {
      console.error('apos;Erreur lors du calcul du score de disponibilité:'apos;, error);
      return 0.8;
    }
  }

  /**
   * Calcule le score de contexte (correspondance avec les exigences)
   */
  private static calculateContextScore(agent: any, context: MissionContext): number {
    const agentExpertise = this.AGENT_EXPERTISE[agent.id as keyof typeof this.AGENT_EXPERTISE];
    if (!agentExpertise) return 0.5;

    let score = 0;
    let totalRequirements = context.requirements.length;

    for (const requirement of context.requirements) {
      const requirementLower = requirement.toLowerCase();
      
      // Vérifier si l'apos;exigence correspond aux forces de l'apos;agent
      const strengthMatch = agentExpertise.strengths.some(strength =>
        requirementLower.includes(strength.toLowerCase())
      );

      // Vérifier si l'apos;exigence correspond aux domaines de l'apos;agent
      const domainMatch = agentExpertise.domains.some(domain =>
        requirementLower.includes(domain.toLowerCase())
      );

      if (strengthMatch || domainMatch) {
        score += 1;
      }
    }

    return totalRequirements > 0 ? score / totalRequirements : 0.5;
  }

  /**
   * Calcule le score de charge de travail
   */
  private static async calculateWorkloadScore(agent: any): Promise<number> {
    try {
      // Compter les missions en cours et en attente
      const pendingMissions = await prisma.mission.count({
        where: {
          agentId: agent.id,
          status: {
            in: ['apos;PENDING'apos;, 'apos;IN_PROGRESS'apos;],
          },
        },
      });

      // Score inversé : moins de missions = meilleur score
      const workloadScore = Math.max(0.3, 1 - (pendingMissions * 0.15));
      return workloadScore;
    } catch (error) {
      console.error('apos;Erreur lors du calcul du score de charge de travail:'apos;, error);
      return 0.8;
    }
  }

  /**
   * Génère le raisonnement pour la sélection d'apos;un agent
   */
  private static generateReasoning(
    agent: any,
    context: MissionContext,
    factors: any
  ): string[] {
    const reasoning: string[] = [];
    const agentExpertise = this.AGENT_EXPERTISE[agent.id as keyof typeof this.AGENT_EXPERTISE];

    if (factors.expertise > 0.8) {
      reasoning.push(`Excellente correspondance d'apos;expertise (${Math.round(factors.expertise * 100)}%)`);
    } else if (factors.expertise > 0.6) {
      reasoning.push(`Bonne correspondance d'apos;expertise (${Math.round(factors.expertise * 100)}%)`);
    }

    if (factors.performance > 0.8) {
      reasoning.push(`Performance exceptionnelle récente (${Math.round(factors.performance * 100)}%)`);
    }

    if (factors.availability > 0.9) {
      reasoning.push('apos;Disponibilité élevée'apos;);
    }

    if (factors.context > 0.8) {
      reasoning.push(`Parfaitement adapté aux exigences (${Math.round(factors.context * 100)}%)`);
    }

    if (agentExpertise) {
      const domainMatches = context.domain.filter(domain =>
        agentExpertise.domains.includes(domain)
      );
      if (domainMatches.length > 0) {
        reasoning.push(`Expert en: ${domainMatches.join('apos;, 'apos;)}`);
      }
    }

    return reasoning;
  }

  /**
   * Récupère les agents disponibles
   */
  private static async getAvailableAgents() {
    // Pour l'apos;instant, retourner les agents hardcodés
    // TODO: Récupérer depuis la base de données
    return [
      { id: 'apos;karine-ai'apos;, name: 'apos;KarineAI'apos; },
      { id: 'apos;hugo-ai'apos;, name: 'apos;HugoAI'apos; },
      { id: 'apos;jp-bot'apos;, name: 'apos;JPBot'apos; },
      { id: 'apos;elodie-ai'apos;, name: 'apos;ElodieAI'apos; },
      { id: 'apos;clara-la-closeuse'apos;, name: 'apos;ClaraLaCloseuse'apos; },
      { id: 'apos;faucon-le-maitre-focus'apos;, name: 'apos;FauconLeMaitreFocus'apos; },
    ];
  }

  /**
   * Obtient la durée attendue basée sur la complexité
   */
  private static getExpectedDuration(complexity: string): number {
    switch (complexity) {
      case 'apos;low'apos;: return 2 * 60 * 60 * 1000; // 2 heures
      case 'apos;medium'apos;: return 8 * 60 * 60 * 1000; // 8 heures
      case 'apos;high'apos;: return 24 * 60 * 60 * 1000; // 24 heures
      default: return 8 * 60 * 60 * 1000;
    }
  }

  /**
   * Calcule le score de correspondance du type
   */
  private static getTypeMatchScore(type: string, domains: string[]): number {
    const typeMapping: Record<string, string[]> = {
      content: ['apos;content'apos;, 'apos;writing'apos;, 'apos;creative'apos;],
      analysis: ['apos;business'apos;, 'apos;research'apos;, 'apos;analysis'apos;],
      automation: ['apos;technical'apos;, 'apos;development'apos;],
      research: ['apos;research'apos;, 'apos;investigation'apos;],
      creative: ['apos;creative'apos;, 'apos;design'apos;],
    };

    const typeDomains = typeMapping[type] || [];
    const matches = typeDomains.filter(domain => domains.includes(domain));
    return matches.length / Math.max(typeDomains.length, 1);
  }
}
