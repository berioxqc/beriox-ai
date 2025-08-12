import { callJson } from "./openai";

export interface NovaMission {
  id: string;
  title: string;
  constat: string;
  sources: string[];
  objectif: string;
  impactEstime: number; // 0-5
  effortEstime: number; // 0-5
  priorite: number; // impact - effort
  planAction: string[];
  risques: string[];
  planB: string;
  historique: string;
  tags: string[];
  createdAt: Date;
  status: 'apos;pending'apos; | 'apos;validated'apos; | 'apos;rejected'apos; | 'apos;implemented'apos;;
  jpbFeedback?: string;
}

export interface DataSource {
  type: 'apos;ga4'apos; | 'apos;gsc'apos; | 'apos;ads'apos; | 'apos;crm'apos;;
  data: any;
  lastUpdated: Date;
}

export interface MissionHistory {
  id: string;
  title: string;
  objectif: string;
  tags: string[];
  resultat: 'apos;success'apos; | 'apos;failure'apos; | 'apos;partial'apos;;
  notes: string;
  createdAt: Date;
}

export class NovaBotService {
  /**
   * Génère une nouvelle mission basée sur les données analytiques
   */
  static async generateMission(
    dataSources: DataSource[],
    missionHistory: MissionHistory[],
    userContext: {
      industry: string;
      goals: string[];
      currentPlan: string;
    }
  ): Promise<NovaMission> {
    
    // Analyser les données pour identifier les opportunités
    const opportunities = this.analyzeDataSources(dataSources);
    
    // Vérifier les doublons avec l'apos;historique
    const uniqueOpportunities = this.filterDuplicates(opportunities, missionHistory);
    
    if (uniqueOpportunities.length === 0) {
      throw new Error("Aucune nouvelle opportunité détectée dans les données actuelles");
    }
    
    // Sélectionner la meilleure opportunité
    const bestOpportunity = this.selectBestOpportunity(uniqueOpportunities);
    
    // Générer la mission avec GPT
    const mission = await this.generateMissionWithGPT(bestOpportunity, userContext);
    
    return mission;
  }

  /**
   * Analyse les sources de données pour identifier les opportunités
   */
  private static analyzeDataSources(sources: DataSource[]): any[] {
    const opportunities: any[] = [];
    
    sources.forEach(source => {
      switch (source.type) {
        case 'apos;ga4'apos;:
          opportunities.push(...this.analyzeGA4Data(source.data));
          break;
        case 'apos;gsc'apos;:
          opportunities.push(...this.analyzeGSCData(source.data));
          break;
        case 'apos;ads'apos;:
          opportunities.push(...this.analyzeAdsData(source.data));
          break;
        case 'apos;crm'apos;:
          opportunities.push(...this.analyzeCRMData(source.data));
          break;
      }
    });
    
    return opportunities;
  }

  /**
   * Analyse les données Google Analytics 4
   */
  private static analyzeGA4Data(data: any): any[] {
    const opportunities: any[] = [];
    
    // Analyser les pages avec faible engagement
    if (data.pages) {
      data.pages.forEach((page: any) => {
        if (page.bounceRate > 70 && page.pageViews > 100) {
          opportunities.push({
            type: 'apos;engagement'apos;,
            metric: 'apos;bounce_rate'apos;,
            value: page.bounceRate,
            page: page.path,
            impact: 4,
            effort: 2,
            description: `Taux de rebond élevé (${page.bounceRate}%) sur ${page.pageViews} vues`
          });
        }
      });
    }
    
    // Analyser les conversions
    if (data.conversions) {
      const avgConversionRate = data.conversions.total / data.sessions.total;
      if (avgConversionRate < 0.02) {
        opportunities.push({
          type: 'apos;conversion'apos;,
          metric: 'apos;conversion_rate'apos;,
          value: avgConversionRate,
          impact: 5,
          effort: 3,
          description: `Taux de conversion faible (${(avgConversionRate * 100).toFixed(2)}%)`
        });
      }
    }
    
    return opportunities;
  }

  /**
   * Analyse les données Google Search Console
   */
  private static analyzeGSCData(data: any): any[] {
    const opportunities: any[] = [];
    
    // Analyser les requêtes avec CTR faible
    if (data.queries) {
      data.queries.forEach((query: any) => {
        if (query.impressions > 1000 && query.ctr < 0.02) {
          opportunities.push({
            type: 'apos;seo'apos;,
            metric: 'apos;ctr'apos;,
            value: query.ctr,
            query: query.query,
            impact: 4,
            effort: 2,
            description: `CTR faible (${(query.ctr * 100).toFixed(2)}%) sur ${query.impressions} impressions pour "${query.query}"`
          });
        }
      });
    }
    
    // Analyser les pages avec position moyenne
    if (data.pages) {
      data.pages.forEach((page: any) => {
        if (page.position > 5 && page.position < 20 && page.impressions > 500) {
          opportunities.push({
            type: 'apos;seo'apos;,
            metric: 'apos;position'apos;,
            value: page.position,
            page: page.page,
            impact: 3,
            effort: 2,
            description: `Position ${page.position} sur ${page.impressions} impressions pour ${page.page}`
          });
        }
      });
    }
    
    return opportunities;
  }

  /**
   * Analyse les données Google Ads
   */
  private static analyzeAdsData(data: any): any[] {
    const opportunities: any[] = [];
    
    // Analyser les campagnes avec CPA élevé
    if (data.campaigns) {
      data.campaigns.forEach((campaign: any) => {
        if (campaign.cpa > campaign.targetCpa * 1.5) {
          opportunities.push({
            type: 'apos;ads'apos;,
            metric: 'apos;cpa'apos;,
            value: campaign.cpa,
            campaign: campaign.name,
            impact: 4,
            effort: 3,
            description: `CPA élevé (${campaign.cpa}$) vs cible (${campaign.targetCpa}$) pour ${campaign.name}`
          });
        }
      });
    }
    
    return opportunities;
  }

  /**
   * Analyse les données CRM
   */
  private static analyzeCRMData(data: any): any[] {
    const opportunities: any[] = [];
    
    // Analyser le taux de conversion des leads
    if (data.leads) {
      const conversionRate = data.leads.converted / data.leads.total;
      if (conversionRate < 0.1) {
        opportunities.push({
          type: 'apos;crm'apos;,
          metric: 'apos;lead_conversion'apos;,
          value: conversionRate,
          impact: 5,
          effort: 3,
          description: `Taux de conversion leads faible (${(conversionRate * 100).toFixed(2)}%)`
        });
      }
    }
    
    return opportunities;
  }

  /**
   * Filtre les doublons en comparant avec l'apos;historique
   */
  private static filterDuplicates(opportunities: any[], history: MissionHistory[]): any[] {
    return opportunities.filter(opp => {
      // Calculer la similarité avec chaque mission historique
      const maxSimilarity = Math.max(...history.map(mission => 
        this.calculateSimilarity(opp.description, mission.title + 'apos; 'apos; + mission.objectif)
      ));
      
      // Rejeter si similarité > 70%
      return maxSimilarity < 0.7;
    });
  }

  /**
   * Calcule la similarité entre deux textes
   */
  private static calculateSimilarity(text1: string, text2: string): number {
    const words1 = text1.toLowerCase().split(/\s+/);
    const words2 = text2.toLowerCase().split(/\s+/);
    
    const commonWords = words1.filter(word => words2.includes(word));
    const totalWords = new Set([...words1, ...words2]).size;
    
    return commonWords.length / totalWords;
  }

  /**
   * Sélectionne la meilleure opportunité basée sur le score impact/effort
   */
  private static selectBestOpportunity(opportunities: any[]): any {
    return opportunities.reduce((best, current) => {
      const bestScore = best.impact / best.effort;
      const currentScore = current.impact / current.effort;
      return currentScore > bestScore ? current : best;
    });
  }

  /**
   * Génère une mission complète avec GPT
   */
  private static async generateMissionWithGPT(opportunity: any, userContext: any): Promise<NovaMission> {
    const prompt = `Tu es NovaBot, l'apos;architecte d'apos;opportunités. Génère une mission basée sur cette opportunité détectée :

OPPORTUNITÉ:
${opportunity.description}
Type: ${opportunity.type}
Impact: ${opportunity.impact}/5
Effort: ${opportunity.effort}/5

CONTEXTE UTILISATEUR:
Industrie: ${userContext.industry}
Objectifs: ${userContext.goals.join('apos;, 'apos;)}
Plan actuel: ${userContext.currentPlan}

Génère une mission structurée selon ce format JSON strict:

{
  "title": "Titre clair et orienté action",
  "constat": "Résumé du problème/opportunité avec chiffres précis",
  "sources": ["liste", "des", "sources", "utilisées"],
  "objectif": "Ce qu'apos;on veut accomplir",
  "impactEstime": ${opportunity.impact},
  "effortEstime": ${opportunity.effort},
  "priorite": ${opportunity.impact - opportunity.effort},
  "planAction": [
    "Étape 1 - Action concrète",
    "Étape 2 - Action concrète", 
    "Étape 3 - Action concrète"
  ],
  "risques": [
    "Risque 1",
    "Risque 2"
  ],
  "planB": "Alternative si le résultat n'apos;est pas atteint",
  "historique": "Lien vers missions similaires ou preuve que c'apos;est nouveau",
  "tags": ["tag1", "tag2", "tag3"]
}

La mission doit être:
- Réalisable en ≤6h
- Basée uniquement sur des données chiffrées
- Originale (pas de doublon)
- Orientée action rapide
- Avec un plan B clair`;

    const response = await callJson(
      "Tu es NovaBot, expert en génération de missions basées sur des données. Tu génères uniquement des missions pertinentes, chiffrées et réalisables. Réponds UNIQUEMENT en JSON valide.",
      prompt,
      undefined,
      "gpt-4o-mini"
    );

    return {
      id: `nova_${Date.now()}`,
      ...response,
      createdAt: new Date(),
      status: 'apos;pending'apos;
    };
  }

  /**
   * Valide une mission avec JPBot
   */
  static async validateWithJPBot(mission: NovaMission): Promise<{
    validated: boolean;
    feedback: string;
    suggestions: string[];
  }> {
    const prompt = `Tu es JPBot, l'apos;analyste critique. Évalue cette mission générée par NovaBot :

MISSION:
Titre: ${mission.title}
Constat: ${mission.constat}
Objectif: ${mission.objectif}
Impact: ${mission.impactEstime}/5
Effort: ${mission.effortEstime}/5
Plan d'apos;action: ${mission.planAction.join('apos;, 'apos;)}

CRITÈRES D'apos;ÉVALUATION:
1. Pertinence par rapport aux objectifs
2. Clarté des chiffres et données
3. Originalité (pas de doublon)
4. Réalisme de l'apos;effort estimé
5. Qualité du plan d'apos;action

Réponds en JSON strict:
{
  "validated": true/false,
  "feedback": "Analyse détaillée",
  "suggestions": ["suggestion1", "suggestion2"]
}`;

    const response = await callJson(
      "Tu es JPBot, analyste critique et méthodique. Tu évalues les missions avec rigueur et ne laisses passer aucune zone floue. Réponds UNIQUEMENT en JSON valide.",
      prompt,
      undefined,
      "gpt-4o-mini"
    );

    return response;
  }

  /**
   * Met à jour le statut d'apos;une mission
   */
  static async updateMissionStatus(
    missionId: string, 
    status: 'apos;validated'apos; | 'apos;rejected'apos; | 'apos;implemented'apos;,
    feedback?: string
  ): Promise<void> {
    // Ici on mettrait à jour la base de données
    console.log(`Mission ${missionId} mise à jour: ${status}`, feedback);
  }
}
