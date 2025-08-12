import { prisma } from '@/lib/prisma';

export interface MissionMetrics {
  missionId: string;
  duration: number;
  quality: number;
  satisfaction: number;
  cost: number;
  roi: number;
  efficiency: number;
  agentPerformance: Record<string, number>;
  stepMetrics: Record<string, any>;
}

export interface AgentMetrics {
  agentId: string;
  agentName: string;
  totalMissions: number;
  completedMissions: number;
  averageQuality: number;
  averageDuration: number;
  averageSatisfaction: number;
  successRate: number;
  specializations: string[];
  performanceTrend: number;
}

export interface SystemMetrics {
  totalMissions: number;
  activeMissions: number;
  averageROI: number;
  averageEfficiency: number;
  topPerformingAgents: AgentMetrics[];
  systemHealth: number;
  costSavings: number;
  productivityGain: number;
}

export class MetricsCalculator {
  private static readonly COST_PER_HOUR = 50; // Coût estimé par heure de travail humain
  private static readonly AI_COST_PER_HOUR = 5; // Coût estimé par heure d'IA

  /**
   * Calcule les métriques complètes pour une mission
   */
  static async calculateMissionMetrics(missionId: string): Promise<MissionMetrics> {
    try {
      const mission = await prisma.mission.findUnique({
        where: { id: missionId },
        include: {
          deliverables: true,
          briefs: true,
        },
      });

      if (!mission) {
        throw new Error(`Mission ${missionId} not found`);
      }

      // Calculer la durée
      const duration = this.calculateDuration(mission);

      // Calculer la qualité
      const quality = this.calculateQuality(mission);

      // Calculer la satisfaction
      const satisfaction = mission.satisfaction || 0.7;

      // Calculer le coût
      const cost = this.calculateCost(duration);

      // Calculer le ROI
      const roi = this.calculateROI(cost, quality, satisfaction);

      // Calculer l'efficacité
      const efficiency = this.calculateEfficiency(duration, quality);

      // Calculer les performances des agents
      const agentPerformance = await this.calculateAgentPerformance(missionId);

      // Calculer les métriques des étapes
      const stepMetrics = await this.calculateStepMetrics(missionId);

      return {
        missionId,
        duration,
        quality,
        satisfaction,
        cost,
        roi,
        efficiency,
        agentPerformance,
        stepMetrics,
      };
    } catch (error) {
      console.error('Erreur lors du calcul des métriques de mission:', error);
      throw error;
    }
  }

  /**
   * Calcule les métriques pour un agent
   */
  static async calculateAgentMetrics(agentId: string): Promise<AgentMetrics> {
    try {
      const missions = await prisma.mission.findMany({
        where: { agentId },
        include: {
          deliverables: true,
        },
      });

      const totalMissions = missions.length;
      const completedMissions = missions.filter(m => m.status === 'COMPLETED').length;
      
      const averageQuality = missions.length > 0 
        ? missions.reduce((acc, m) => acc + this.calculateQuality(m), 0) / missions.length
        : 0;

      const averageDuration = missions.length > 0
        ? missions.reduce((acc, m) => acc + this.calculateDuration(m), 0) / missions.length
        : 0;

      const averageSatisfaction = missions.length > 0
        ? missions.reduce((acc, m) => acc + (m.satisfaction || 0.7), 0) / missions.length
        : 0;

      const successRate = totalMissions > 0 ? completedMissions / totalMissions : 0;

      const specializations = this.getAgentSpecializations(agentId);

      const performanceTrend = await this.calculatePerformanceTrend(agentId);

      return {
        agentId,
        agentName: this.getAgentName(agentId),
        totalMissions,
        completedMissions,
        averageQuality,
        averageDuration,
        averageSatisfaction,
        successRate,
        specializations,
        performanceTrend,
      };
    } catch (error) {
      console.error('Erreur lors du calcul des métriques d\'agent:', error);
      throw error;
    }
  }

  /**
   * Calcule les métriques système globales
   */
  static async calculateSystemMetrics(): Promise<SystemMetrics> {
    try {
      const missions = await prisma.mission.findMany({
        include: {
          deliverables: true,
        },
      });

      const totalMissions = missions.length;
      const activeMissions = missions.filter(m => 
        m.status === 'PENDING' || m.status === 'IN_PROGRESS'
      ).length;

      // Calculer le ROI moyen
      const missionMetrics = await Promise.all(
        missions.map(m => this.calculateMissionMetrics(m.id))
      );
      const averageROI = missionMetrics.length > 0
        ? missionMetrics.reduce((acc, m) => acc + m.roi, 0) / missionMetrics.length
        : 0;

      // Calculer l'efficacité moyenne
      const averageEfficiency = missionMetrics.length > 0
        ? missionMetrics.reduce((acc, m) => acc + m.efficiency, 0) / missionMetrics.length
        : 0;

      // Calculer les agents les plus performants
      const agentIds = [...new Set(missions.map(m => m.agentId))];
      const agentMetrics = await Promise.all(
        agentIds.map(id => this.calculateAgentMetrics(id))
      );
      const topPerformingAgents = agentMetrics
        .sort((a, b) => b.averageQuality - a.averageQuality)
        .slice(0, 5);

      // Calculer la santé du système
      const systemHealth = this.calculateSystemHealth(missions);

      // Calculer les économies de coûts
      const costSavings = this.calculateCostSavings(missions);

      // Calculer le gain de productivité
      const productivityGain = this.calculateProductivityGain(missions);

      return {
        totalMissions,
        activeMissions,
        averageROI,
        averageEfficiency,
        topPerformingAgents,
        systemHealth,
        costSavings,
        productivityGain,
      };
    } catch (error) {
      console.error('Erreur lors du calcul des métriques système:', error);
      throw error;
    }
  }

  /**
   * Calcule la durée d'une mission
   */
  private static calculateDuration(mission: any): number {
    if (!mission.completedAt || !mission.createdAt) {
      return 0;
    }

    const startTime = new Date(mission.createdAt).getTime();
    const endTime = new Date(mission.completedAt).getTime();
    return endTime - startTime;
  }

  /**
   * Calcule la qualité d'une mission
   */
  private static calculateQuality(mission: any): number {
    if (!mission.deliverables || mission.deliverables.length === 0) {
      return 0.7; // Qualité par défaut
    }

    const qualityScores = mission.deliverables.map((deliverable: any) => {
      // Score basé sur la qualité du livrable
      let score = deliverable.quality || 0.7;

      // Bonus pour les livrables complets
      if (deliverable.content && deliverable.content.length > 100) {
        score += 0.1;
      }

      // Bonus pour les livrables structurés
      if (deliverable.structure && deliverable.structure === 'good') {
        score += 0.1;
      }

      return Math.min(1, score);
    });

    return qualityScores.reduce((acc, score) => acc + score, 0) / qualityScores.length;
  }

  /**
   * Calcule le coût d'une mission
   */
  private static calculateCost(duration: number): number {
    const hours = duration / (1000 * 60 * 60);
    return hours * this.AI_COST_PER_HOUR;
  }

  /**
   * Calcule le ROI d'une mission
   */
  private static calculateROI(cost: number, quality: number, satisfaction: number): number {
    if (cost === 0) return 0;

    // ROI basé sur la qualité, la satisfaction et les économies de temps
    const valueMultiplier = (quality + satisfaction) / 2;
    const timeValue = this.COST_PER_HOUR * 8; // Valeur d'une journée de travail
    const totalValue = timeValue * valueMultiplier;

    return ((totalValue - cost) / cost) * 100;
  }

  /**
   * Calcule l'efficacité d'une mission
   */
  private static calculateEfficiency(duration: number, quality: number): number {
    // Efficacité basée sur la durée et la qualité
    const expectedDuration = 8 * 60 * 60 * 1000; // 8 heures par défaut
    const timeEfficiency = Math.min(1, expectedDuration / Math.max(duration, 1));
    
    return (timeEfficiency + quality) / 2;
  }

  /**
   * Calcule les performances des agents pour une mission
   */
  private static async calculateAgentPerformance(missionId: string): Promise<Record<string, number>> {
    try {
      const mission = await prisma.mission.findUnique({
        where: { id: missionId },
        include: {
          deliverables: true,
        },
      });

      if (!mission) return {};

      const performance = this.calculateQuality(mission);
      return { [mission.agentId]: performance };
    } catch (error) {
      console.error('Erreur lors du calcul des performances d\'agent:', error);
      return {};
    }
  }

  /**
   * Calcule les métriques des étapes
   */
  private static async calculateStepMetrics(missionId: string): Promise<Record<string, any>> {
    // TODO: Implémenter le calcul des métriques d'étapes
    // Pour l'instant, retourner des métriques de base
    return {
      'step-1': { duration: 0, quality: 0.8, status: 'completed' },
      'step-2': { duration: 0, quality: 0.8, status: 'completed' },
    };
  }

  /**
   * Calcule la tendance de performance d'un agent
   */
  private static async calculatePerformanceTrend(agentId: string): Promise<number> {
    try {
      const missions = await prisma.mission.findMany({
        where: { agentId },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });

      if (missions.length < 2) return 0;

      const recentMissions = missions.slice(0, Math.floor(missions.length / 2));
      const olderMissions = missions.slice(Math.floor(missions.length / 2));

      const recentQuality = recentMissions.reduce((acc, m) => acc + this.calculateQuality(m), 0) / recentMissions.length;
      const olderQuality = olderMissions.reduce((acc, m) => acc + this.calculateQuality(m), 0) / olderMissions.length;

      return recentQuality - olderQuality;
    } catch (error) {
      console.error('Erreur lors du calcul de la tendance de performance:', error);
      return 0;
    }
  }

  /**
   * Calcule la santé du système
   */
  private static calculateSystemHealth(missions: any[]): number {
    if (missions.length === 0) return 1;

    const completedMissions = missions.filter(m => m.status === 'COMPLETED');
    const completionRate = completedMissions.length / missions.length;

    const averageQuality = missions.reduce((acc, m) => acc + this.calculateQuality(m), 0) / missions.length;

    const averageSatisfaction = missions.reduce((acc, m) => acc + (m.satisfaction || 0.7), 0) / missions.length;

    return (completionRate + averageQuality + averageSatisfaction) / 3;
  }

  /**
   * Calcule les économies de coûts
   */
  private static calculateCostSavings(missions: any[]): number {
    let totalSavings = 0;

    for (const mission of missions) {
      const duration = this.calculateDuration(mission);
      const hours = duration / (1000 * 60 * 60);
      
      const humanCost = hours * this.COST_PER_HOUR;
      const aiCost = hours * this.AI_COST_PER_HOUR;
      
      totalSavings += humanCost - aiCost;
    }

    return totalSavings;
  }

  /**
   * Calcule le gain de productivité
   */
  private static calculateProductivityGain(missions: any[]): number {
    if (missions.length === 0) return 0;

    const totalDuration = missions.reduce((acc, m) => acc + this.calculateDuration(m), 0);
    const expectedDuration = missions.length * 8 * 60 * 60 * 1000; // 8h par mission

    return ((expectedDuration - totalDuration) / expectedDuration) * 100;
  }

  // Méthodes utilitaires
  private static getAgentSpecializations(agentId: string): string[] {
    const specializations: Record<string, string[]> = {
      'karine-ai': ['Content', 'SEO', 'Marketing'],
      'hugo-ai': ['Technical', 'Development', 'Automation'],
      'jp-bot': ['Business', 'Strategy', 'Analysis'],
      'elodie-ai': ['Design', 'Creative', 'Visual'],
      'clara-la-closeuse': ['Research', 'Investigation', 'Analysis'],
      'faucon-le-maitre-focus': ['Focus', 'Productivity', 'Optimization'],
    };

    return specializations[agentId] || [];
  }

  private static getAgentName(agentId: string): string {
    const names: Record<string, string> = {
      'karine-ai': 'KarineAI',
      'hugo-ai': 'HugoAI',
      'jp-bot': 'JPBot',
      'elodie-ai': 'ElodieAI',
      'clara-la-closeuse': 'ClaraLaCloseuse',
      'faucon-le-maitre-focus': 'FauconLeMaitreFocus',
    };

    return names[agentId] || agentId;
  }
}
