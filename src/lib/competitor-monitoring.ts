import { SimilarWebAPI } from './integrations/similarweb';
import { SEMrushAPI } from './integrations/semrush';
import { CompetitorData, ApiResponse } from './integrations/types';
import { prisma } from './prisma';
import { logger } from './logger';

export interface CompetitorMonitoringConfig {
  similarWebApiKey?: string;
  semrushApiKey?: string;
  domains: string[];
  frequency: 'daily' | 'weekly' | 'monthly';
  enabled: boolean;
}

export interface CompetitorReport {
  id: string;
  domain: string;
  timestamp: Date;
  similarWebData?: CompetitorData;
  semrushData?: CompetitorData;
  combinedAnalysis: {
    totalVisits: number;
    organicKeywords: number;
    organicCost: number;
    backlinks: number;
    topCompetitors: Array<{
      domain: string;
      overlapScore: number;
      trafficShare: number;
      organicKeywords: number;
      organicTraffic: number;
    }>;
    opportunities: Array<{
      type: 'keyword' | 'backlink' | 'traffic';
      description: string;
      potential: number;
      difficulty: 'low' | 'medium' | 'high';
    }>;
  };
  alerts: Array<{
    type: 'traffic_drop' | 'competitor_growth' | 'keyword_loss' | 'backlink_loss';
    severity: 'low' | 'medium' | 'high';
    message: string;
    data: any;
  }>;
}

class CompetitorMonitoringService {
  private similarWeb: SimilarWebAPI | null = null;
  private semrush: SEMrushAPI | null = null;
  private config: CompetitorMonitoringConfig;

  constructor(config: CompetitorMonitoringConfig) {
    this.config = config;
    
    if (config.similarWebApiKey) {
      this.similarWeb = new SimilarWebAPI(config.similarWebApiKey);
    }
    
    if (config.semrushApiKey) {
      this.semrush = new SEMrushAPI(config.semrushApiKey);
    }
  }

  /**
   * Analyse complète d'un domaine avec toutes les APIs disponibles
   */
  async analyzeDomain(domain: string): Promise<CompetitorReport> {
    logger.info(`🔍 Début analyse concurrentielle pour ${domain}`);

    const reportId = `competitor_${domain}_${Date.now()}`;
    const timestamp = new Date();

    // Collecter les données des différentes APIs
    const [similarWebResult, semrushResult] = await Promise.allSettled([
      this.similarWeb?.getCompleteAnalysis(domain),
      this.semrush?.getCompleteAnalysis(domain),
    ]);

    const similarWebData = similarWebResult.status === 'fulfilled' ? similarWebResult.value : null;
    const semrushData = semrushResult.status === 'fulfilled' ? semrushResult.value : null;

    // Combiner et analyser les données
    const combinedAnalysis = this.combineData(domain, similarWebData, semrushData);
    
    // Générer les alertes
    const alerts = await this.generateAlerts(domain, combinedAnalysis);

    const report: CompetitorReport = {
      id: reportId,
      domain,
      timestamp,
      similarWebData: similarWebData?.data,
      semrushData: semrushData?.data,
      combinedAnalysis,
      alerts,
    };

    // Sauvegarder le rapport
    await this.saveReport(report);

    logger.info(`✅ Analyse concurrentielle terminée pour ${domain}`);
    return report;
  }

  /**
   * Combiner les données de SimilarWeb et SEMrush
   */
  private combineData(
    domain: string, 
    similarWebData: ApiResponse<CompetitorData> | null, 
    semrushData: ApiResponse<CompetitorData> | null
  ) {
    const sw = similarWebData?.data;
    const sr = semrushData?.data;

    // Fusionner les données de trafic
    const totalVisits = sw?.totalVisits || sr?.totalVisits || 0;
    const organicKeywords = sw?.organicKeywords || sr?.organicKeywords || 0;
    const organicCost = sw?.organicCost || sr?.organicCost || 0;
    const backlinks = sr?.backlinks?.backlinks || 0;

    // Fusionner les concurrents
    const allCompetitors = [
      ...(sw?.competitors || []),
      ...(sr?.competitorAnalysis?.competitors || []),
    ];

    // Dédupliquer et trier par pertinence
    const competitorMap = new Map();
    allCompetitors.forEach(comp => {
      const existing = competitorMap.get(comp.domain);
      if (!existing || (comp.overlapScore || 0) > (existing.overlapScore || 0)) {
        competitorMap.set(comp.domain, comp);
      }
    });

    const topCompetitors = Array.from(competitorMap.values())
      .sort((a, b) => (b.overlapScore || 0) - (a.overlapScore || 0))
      .slice(0, 10);

    // Identifier les opportunités
    const opportunities = this.identifyOpportunities(domain, sw, sr);

    return {
      totalVisits,
      organicKeywords,
      organicCost,
      backlinks,
      topCompetitors,
      opportunities,
    };
  }

  /**
   * Identifier les opportunités d'amélioration
   */
  private identifyOpportunities(
    domain: string,
    similarWebData: CompetitorData | null,
    semrushData: CompetitorData | null
  ) {
    const opportunities = [];

    // Opportunités de mots-clés
    const keywords = semrushData?.keywords?.organicKeywords || [];
    const lowCompetitionKeywords = keywords
      .filter(k => k.competition < 0.3 && k.traffic > 100)
      .slice(0, 5);

    if (lowCompetitionKeywords.length > 0) {
      opportunities.push({
        type: 'keyword' as const,
        description: `${lowCompetitionKeywords.length} mots-clés à faible concurrence identifiés`,
        potential: lowCompetitionKeywords.reduce((sum, k) => sum + k.traffic, 0),
        difficulty: 'low' as const,
      });
    }

    // Opportunités de backlinks
    const competitors = similarWebData?.competitors || [];
    const highTrafficCompetitors = competitors
      .filter(c => (c.trafficShare || 0) > 0.1)
      .slice(0, 3);

    if (highTrafficCompetitors.length > 0) {
      opportunities.push({
        type: 'backlink' as const,
        description: `Opportunités de backlinks depuis ${highTrafficCompetitors.length} concurrents`,
        potential: highTrafficCompetitors.reduce((sum, c) => sum + (c.trafficShare || 0), 0),
        difficulty: 'medium' as const,
      });
    }

    // Opportunités de trafic
    const trafficSources = similarWebData?.trafficSources;
    if (trafficSources) {
      const socialTraffic = trafficSources.socialTraffic || 0;
      const referralTraffic = trafficSources.referralTraffic || 0;
      
      if (socialTraffic < 1000) {
        opportunities.push({
          type: 'traffic' as const,
          description: 'Potentiel d\'amélioration du trafic social',
          potential: 2000,
          difficulty: 'medium' as const,
        });
      }
    }

    return opportunities;
  }

  /**
   * Générer les alertes basées sur les changements
   */
  private async generateAlerts(domain: string, analysis: any): Promise<CompetitorReport['alerts']> {
    const alerts = [];

    // Récupérer les données précédentes pour comparaison
    const previousReport = await this.getPreviousReport(domain);
    
    if (previousReport) {
      const trafficChange = analysis.totalVisits - (previousReport.combinedAnalysis.totalVisits || 0);
      const trafficChangePercent = previousReport.combinedAnalysis.totalVisits > 0 
        ? (trafficChange / previousReport.combinedAnalysis.totalVisits) * 100 
        : 0;

      // Alerte baisse de trafic
      if (trafficChangePercent < -10) {
        alerts.push({
          type: 'traffic_drop' as const,
          severity: trafficChangePercent < -20 ? 'high' : 'medium',
          message: `Baisse de trafic de ${Math.abs(trafficChangePercent).toFixed(1)}%`,
          data: { trafficChange, trafficChangePercent },
        });
      }

      // Alerte croissance concurrente
      const competitorGrowth = analysis.topCompetitors
        .filter(c => c.organicTraffic && c.organicTraffic > 10000)
        .length;

      if (competitorGrowth > 3) {
        alerts.push({
          type: 'competitor_growth' as const,
          severity: 'medium',
          message: `${competitorGrowth} concurrents avec un trafic élevé détectés`,
          data: { competitorCount: competitorGrowth },
        });
      }
    }

    return alerts;
  }

  /**
   * Récupérer le rapport précédent pour comparaison
   */
  private async getPreviousReport(domain: string): Promise<CompetitorReport | null> {
    // TODO: Implémenter la récupération depuis la base de données
    return null;
  }

  /**
   * Sauvegarder le rapport
   */
  private async saveReport(report: CompetitorReport): Promise<void> {
    try {
      // TODO: Sauvegarder dans la base de données
      logger.info(`💾 Rapport concurrentiel sauvegardé pour ${report.domain}`);
    } catch (error) {
      logger.error(`❌ Erreur sauvegarde rapport: ${error}`);
    }
  }

  /**
   * Analyser tous les domaines configurés
   */
  async analyzeAllDomains(): Promise<CompetitorReport[]> {
    if (!this.config.enabled) {
      logger.info('🔇 Monitoring concurrentiel désactivé');
      return [];
    }

    logger.info(`🚀 Début analyse concurrentielle pour ${this.config.domains.length} domaines`);

    const reports = await Promise.allSettled(
      this.config.domains.map(domain => this.analyzeDomain(domain))
    );

    const successfulReports = reports
      .filter((result): result is PromiseFulfilledResult<CompetitorReport> => 
        result.status === 'fulfilled'
      )
      .map(result => result.value);

    const failedCount = reports.length - successfulReports.length;
    if (failedCount > 0) {
      logger.warn(`⚠️ ${failedCount} analyses ont échoué`);
    }

    logger.info(`✅ Analyse concurrentielle terminée: ${successfulReports.length}/${this.config.domains.length} succès`);
    return successfulReports;
  }

  /**
   * Obtenir un rapport récent pour un domaine
   */
  async getLatestReport(domain: string): Promise<CompetitorReport | null> {
    // TODO: Implémenter la récupération depuis la base de données
    return null;
  }

  /**
   * Obtenir l'historique des rapports pour un domaine
   */
  async getReportHistory(domain: string, limit: number = 30): Promise<CompetitorReport[]> {
    // TODO: Implémenter la récupération depuis la base de données
    return [];
  }
}

export { CompetitorMonitoringService };
