/**
 * Index des agents IA - Beriox AI
 * Export centralisé de tous les agents spécialisés
 */

// RadarFoxAI - Le stratège de veille ultra-précis
export { 
  RadarFoxAI, 
  radarFoxAI,
  type RadarFoxAnalysis,
  type RadarFoxConfig 
} from './radar-fox-ai';

// InsightPulseBot - Le traducteur de données en actions
export { 
  InsightPulseBot, 
  insightPulseBot,
  type InsightPulseReport,
  type InsightPulseConfig,
  type DataInsight,
  type ActionableInsight 
} from './insight-pulse-bot';

// EchoBrandAI - Le gardien de la cohérence de marque
export { 
  EchoBrandAI, 
  echoBrandAI,
  type BrandAuditResult,
  type BrandGuidelines,
  type ContentRewrite,
  type EchoBrandConfig 
} from './echo-brand-ai';

// TrendSculptorBot - Le créateur de concepts
export { 
  TrendSculptorBot, 
  trendSculptorBot,
  type TrendSculptorReport,
  type TrendSculptorConfig,
  type Trend,
  type CreativeConcept 
} from './trend-sculptor-bot';

// ConversionHackerAI - L'optimisateur obsessionnel
export { 
  ConversionHackerAI, 
  conversionHackerAI,
  type ConversionHackerReport,
  type ConversionHackerConfig,
  type ConversionMetric,
  type ABTest,
  type HeatmapData,
  type OptimizationOpportunity 
} from './conversion-hacker-ai';

/**
 * Classe principale pour gérer tous les agents
 */
export class BerioxAIAgents {
  private agents: {
    radarFox: typeof radarFoxAI;
    insightPulse: typeof insightPulseBot;
    echoBrand: typeof echoBrandAI;
    trendSculptor: typeof trendSculptorBot;
    conversionHacker: typeof conversionHackerAI;
  };

  constructor() {
    this.agents = {
      radarFox: radarFoxAI,
      insightPulse: insightPulseBot,
      echoBrand: echoBrandAI,
      trendSculptor: trendSculptorBot,
      conversionHacker: conversionHackerAI
    };
  }

  /**
   * Lance une analyse complète avec tous les agents
   */
  async runFullAnalysis(data?: any) {
    console.log("🤖 Beriox AI: Lancement de l'analyse complète avec tous les agents...");

    try {
      const results = await Promise.all([
        this.agents.radarFox.analyzeMarket(),
        this.agents.insightPulse.analyzeData(data || {}),
        this.agents.trendSculptor.generateCreativeConcepts(),
        this.agents.conversionHacker.analyzeConversions()
      ]);

      return {
        radarFox: results[0],
        insightPulse: results[1],
        trendSculptor: results[2],
        conversionHacker: results[3],
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error("🤖 Beriox AI: Erreur lors de l'analyse complète:", error);
      throw new Error("Impossible de compléter l'analyse avec tous les agents");
    }
  }

  /**
   * Génère un rapport consolidé
   */
  generateConsolidatedReport(analysisResults: any): string {
    let report = "🤖 **RAPPORT CONSOLIDÉ BERIOX AI - ANALYSE COMPLÈTE**\n\n";
    
    report += "## 📊 RÉSUMÉ EXÉCUTIF\n";
    report += "Analyse complète réalisée par les 5 agents spécialisés de Beriox AI.\n\n";

    // RadarFox
    if (analysisResults.radarFox) {
      report += "## 🦊 RADARFOX - VEILLE CONCURRENTIELLE\n";
      report += `• ${analysisResults.radarFox.competitorInsights.length} concurrents analysés\n`;
      report += `• ${analysisResults.radarFox.immediateActions.length} actions immédiates identifiées\n`;
      report += `• ${analysisResults.radarFox.marketTrends.length} tendances détectées\n\n`;
    }

    // InsightPulse
    if (analysisResults.insightPulse) {
      report += "## 💡 INSIGHTPULSE - ANALYSE DE DONNÉES\n";
      report += `• ${analysisResults.insightPulse.summary.totalInsights} insights actionnables\n`;
      report += `• ${analysisResults.insightPulse.summary.criticalActions} actions critiques\n`;
      report += `• Qualité des données: ${analysisResults.insightPulse.dataQuality.completeness}%\n\n`;
    }

    // TrendSculptor
    if (analysisResults.trendSculptor) {
      report += "## 🎨 TRENDSCULPTOR - CONCEPTS CRÉATIFS\n";
      report += `• ${analysisResults.trendSculptor.trends.length} tendances analysées\n`;
      report += `• ${analysisResults.trendSculptor.concepts.length} concepts générés\n`;
      report += `• ${analysisResults.trendSculptor.opportunities.highPotential.length} opportunités à fort potentiel\n\n`;
    }

    // ConversionHacker
    if (analysisResults.conversionHacker) {
      report += "## 🎯 CONVERSIONHACKER - OPTIMISATION\n";
      report += `• ${analysisResults.conversionHacker.summary.activeTests} tests A/B actifs\n`;
      report += `• ${analysisResults.conversionHacker.opportunities.length} opportunités d'optimisation\n`;
      report += `• Impact revenus total: +${analysisResults.conversionHacker.summary.totalRevenueImpact}%\n\n`;
    }

    report += "## 🚀 RECOMMANDATIONS PRIORITAIRES\n";
    report += "1. **Actions immédiates** - Implémenter les optimisations critiques identifiées\n";
    report += "2. **Tests A/B** - Lancer les tests de conversion prioritaires\n";
    report += "3. **Contenu créatif** - Développer les concepts à fort potentiel\n";
    report += "4. **Veille continue** - Maintenir la surveillance concurrentielle\n";
    report += "5. **Optimisation continue** - Mettre en place un processus d'amélioration constante\n\n";

    report += "---\n";
    report += "*Rapport généré par Beriox AI - L'intelligence artificielle au service de votre succès.*";

    return report;
  }

  /**
   * Obtient un agent spécifique
   */
  getAgent(agentName: keyof typeof this.agents) {
    return this.agents[agentName];
  }

  /**
   * Met à jour la configuration d'un agent
   */
  updateAgentConfig(agentName: keyof typeof this.agents, config: any) {
    const agent = this.agents[agentName];
    if (agent && typeof agent.updateConfig === 'function') {
      agent.updateConfig(config);
    }
  }
}

// Instance par défaut
export const berioxAIAgents = new BerioxAIAgents();
