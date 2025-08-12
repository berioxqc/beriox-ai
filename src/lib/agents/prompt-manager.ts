/**
 * Gestionnaire de prompts pour les agents IA
 * Permet au super admin de modifier les prompts de chaque agent
 */

export interface AgentPrompt {
  id: string;
  agentName: string;
  promptType: 'apos;analysis'apos; | 'apos;generation'apos; | 'apos;optimization'apos; | 'apos;audit'apos; | 'apos;creative'apos;;
  title: string;
  description: string;
  currentPrompt: string;
  defaultPrompt: string;
  variables: string[];
  lastModified: string;
  modifiedBy: string;
  isActive: boolean;
}

export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
  variables: string[];
  category: string;
  tags: string[];
}

export class PromptManager {
  private prompts: Map<string, AgentPrompt> = new Map();
  private templates: PromptTemplate[] = [];

  constructor() {
    this.initializeDefaultPrompts();
    this.initializeTemplates();
  }

  /**
   * Initialise les prompts par défaut pour tous les agents
   */
  private initializeDefaultPrompts() {
    // RadarFoxAI Prompts
    this.addPrompt({
      id: 'apos;radar-fox-analysis'apos;,
      agentName: 'apos;RadarFoxAI'apos;,
      promptType: 'apos;analysis'apos;,
      title: 'apos;Analyse de veille concurrentielle'apos;,
      description: 'apos;Prompt pour analyser les concurrents et le marché'apos;,
      currentPrompt: `Analysez les concurrents suivants: {competitors}. 
Identifiez leurs forces, faiblesses, opportunités et menaces.
Détectez les tendances émergentes du marché.
Générez des actions immédiates basées sur vos insights.
Fournissez des recommandations stratégiques à court, moyen et long terme.
Format de réponse: rapport structuré avec métriques et actions prioritaires.`,
      defaultPrompt: `Analysez les concurrents suivants: {competitors}. 
Identifiez leurs forces, faiblesses, opportunités et menaces.
Détectez les tendances émergentes du marché.
Générez des actions immédiates basées sur vos insights.
Fournissez des recommandations stratégiques à court, moyen et long terme.
Format de réponse: rapport structuré avec métriques et actions prioritaires.`,
      variables: ['apos;{competitors}'apos;, 'apos;{market_focus}'apos;, 'apos;{timeframe}'apos;],
      lastModified: new Date().toISOString(),
      modifiedBy: 'apos;system'apos;,
      isActive: true
    });

    // InsightPulseBot Prompts
    this.addPrompt({
      id: 'apos;insight-pulse-analysis'apos;,
      agentName: 'apos;InsightPulseBot'apos;,
      promptType: 'apos;analysis'apos;,
      title: 'apos;Analyse de données et génération d\'apos;insights'apos;,
      description: 'apos;Prompt pour transformer les données en insights actionnables'apos;,
      currentPrompt: `Analysez les données suivantes: {data}.
Extrayez 3 constats majeurs avec des chiffres clés.
Générez 3 actions concrètes à entreprendre.
Évaluez la qualité des données (complétude, précision, fraîcheur).
Fournissez des recommandations d'apos;amélioration.
Format: 3 constats + 3 actions + évaluation qualité.`,
      defaultPrompt: `Analysez les données suivantes: {data}.
Extrayez 3 constats majeurs avec des chiffres clés.
Générez 3 actions concrètes à entreprendre.
Évaluez la qualité des données (complétude, précision, fraîcheur).
Fournissez des recommandations d'apos;amélioration.
Format: 3 constats + 3 actions + évaluation qualité.`,
      variables: ['apos;{data}'apos;, 'apos;{metrics}'apos;, 'apos;{timeframe}'apos;],
      lastModified: new Date().toISOString(),
      modifiedBy: 'apos;system'apos;,
      isActive: true
    });

    // EchoBrandAI Prompts
    this.addPrompt({
      id: 'apos;echo-brand-audit'apos;,
      agentName: 'apos;EchoBrandAI'apos;,
      promptType: 'apos;audit'apos;,
      title: 'apos;Audit de cohérence de marque'apos;,
      description: 'apos;Prompt pour auditer la cohérence de marque'apos;,
      currentPrompt: `Auditez le contenu suivant: {content}.
Vérifiez la cohérence avec les guidelines de marque: {guidelines}.
Évaluez le ton, le vocabulaire et le messaging.
Identifiez les problèmes et suggérez des améliorations.
Calculez un score global de cohérence.
Format: audit détaillé avec scores et recommandations.`,
      defaultPrompt: `Auditez le contenu suivant: {content}.
Vérifiez la cohérence avec les guidelines de marque: {guidelines}.
Évaluez le ton, le vocabulaire et le messaging.
Identifiez les problèmes et suggérez des améliorations.
Calculez un score global de cohérence.
Format: audit détaillé avec scores et recommandations.`,
      variables: ['apos;{content}'apos;, 'apos;{guidelines}'apos;, 'apos;{brand_voice}'apos;],
      lastModified: new Date().toISOString(),
      modifiedBy: 'apos;system'apos;,
      isActive: true
    });

    // TrendSculptorBot Prompts
    this.addPrompt({
      id: 'apos;trend-sculptor-creative'apos;,
      agentName: 'apos;TrendSculptorBot'apos;,
      promptType: 'apos;creative'apos;,
      title: 'apos;Génération de concepts créatifs'apos;,
      description: 'apos;Prompt pour générer des concepts basés sur les tendances'apos;,
      currentPrompt: `Analysez les tendances suivantes: {trends}.
Générez 3 concepts créatifs originaux.
Chaque concept doit inclure: titre, description, inspiration, audience cible, canaux, angle unique.
Évaluez la faisabilité et les risques.
Créez un moodboard pour chaque concept.
Format: concepts détaillés avec moodboards et évaluations.`,
      defaultPrompt: `Analysez les tendances suivantes: {trends}.
Générez 3 concepts créatifs originaux.
Chaque concept doit inclure: titre, description, inspiration, audience cible, canaux, angle unique.
Évaluez la faisabilité et les risques.
Créez un moodboard pour chaque concept.
Format: concepts détaillés avec moodboards et évaluations.`,
      variables: ['apos;{trends}'apos;, 'apos;{brand_context}'apos;, 'apos;{target_audience}'apos;],
      lastModified: new Date().toISOString(),
      modifiedBy: 'apos;system'apos;,
      isActive: true
    });

    // ConversionHackerAI Prompts
    this.addPrompt({
      id: 'apos;conversion-hacker-optimization'apos;,
      agentName: 'apos;ConversionHackerAI'apos;,
      promptType: 'apos;optimization'apos;,
      title: 'apos;Optimisation des conversions'apos;,
      description: 'apos;Prompt pour analyser et optimiser les conversions'apos;,
      currentPrompt: `Analysez les métriques de conversion: {metrics}.
Identifiez les opportunités d'apos;optimisation prioritaires.
Proposez des tests A/B spécifiques avec hypothèses.
Analysez les heatmaps: {heatmaps}.
Générez des recommandations immédiates et à long terme.
Format: analyse détaillée avec tests et recommandations.`,
      defaultPrompt: `Analysez les métriques de conversion: {metrics}.
Identifiez les opportunités d'apos;optimisation prioritaires.
Proposez des tests A/B spécifiques avec hypothèses.
Analysez les heatmaps: {heatmaps}.
Générez des recommandations immédiates et à long terme.
Format: analyse détaillée avec tests et recommandations.`,
      variables: ['apos;{metrics}'apos;, 'apos;{heatmaps}'apos;, 'apos;{focus_areas}'apos;],
      lastModified: new Date().toISOString(),
      modifiedBy: 'apos;system'apos;,
      isActive: true
    });
  }

  /**
   * Initialise les templates de prompts
   */
  private initializeTemplates() {
    this.templates = [
      {
        id: 'apos;template-analysis'apos;,
        name: 'apos;Template d\'apos;analyse'apos;,
        description: 'apos;Template générique pour les analyses'apos;,
        template: `Analysez {subject} en vous concentrant sur {focus_areas}.
Identifiez les {number} points clés.
Générez des recommandations actionnables.
Format: rapport structuré avec métriques.`,
        variables: ['apos;{subject}'apos;, 'apos;{focus_areas}'apos;, 'apos;{number}'apos;],
        category: 'apos;analysis'apos;,
        tags: ['apos;générique'apos;, 'apos;analyse'apos;, 'apos;recommandations'apos;]
      },
      {
        id: 'apos;template-creative'apos;,
        name: 'apos;Template créatif'apos;,
        description: 'apos;Template pour la génération créative'apos;,
        template: `Créez {number} concepts basés sur {inspiration}.
Chaque concept doit être {style} et {tone}.
Incluez: titre, description, audience, canaux.
Format: concepts détaillés avec moodboards.`,
        variables: ['apos;{number}'apos;, 'apos;{inspiration}'apos;, 'apos;{style}'apos;, 'apos;{tone}'apos;],
        category: 'apos;creative'apos;,
        tags: ['apos;créatif'apos;, 'apos;concepts'apos;, 'apos;design'apos;]
      },
      {
        id: 'apos;template-optimization'apos;,
        name: 'apos;Template d\'apos;optimisation'apos;,
        description: 'apos;Template pour l\'apos;optimisation'apos;,
        template: `Optimisez {target} pour améliorer {metric}.
Identifiez {number} opportunités prioritaires.
Proposez des tests A/B avec hypothèses.
Format: plan d'apos;optimisation avec tests.`,
        variables: ['apos;{target}'apos;, 'apos;{metric}'apos;, 'apos;{number}'apos;],
        category: 'apos;optimization'apos;,
        tags: ['apos;optimisation'apos;, 'apos;tests'apos;, 'apos;métriques'apos;]
      }
    ];
  }

  /**
   * Ajoute un nouveau prompt
   */
  addPrompt(prompt: AgentPrompt): void {
    this.prompts.set(prompt.id, prompt);
  }

  /**
   * Met à jour un prompt existant
   */
  updatePrompt(promptId: string, updates: Partial<AgentPrompt>, modifiedBy: string): boolean {
    const prompt = this.prompts.get(promptId);
    if (!prompt) return false;

    const updatedPrompt: AgentPrompt = {
      ...prompt,
      ...updates,
      lastModified: new Date().toISOString(),
      modifiedBy
    };

    this.prompts.set(promptId, updatedPrompt);
    return true;
  }

  /**
   * Récupère un prompt par ID
   */
  getPrompt(promptId: string): AgentPrompt | null {
    return this.prompts.get(promptId) || null;
  }

  /**
   * Récupère tous les prompts d'apos;un agent
   */
  getAgentPrompts(agentName: string): AgentPrompt[] {
    return Array.from(this.prompts.values()).filter(p => p.agentName === agentName);
  }

  /**
   * Récupère tous les prompts
   */
  getAllPrompts(): AgentPrompt[] {
    return Array.from(this.prompts.values());
  }

  /**
   * Supprime un prompt
   */
  deletePrompt(promptId: string): boolean {
    return this.prompts.delete(promptId);
  }

  /**
   * Réinitialise un prompt à sa valeur par défaut
   */
  resetPrompt(promptId: string, modifiedBy: string): boolean {
    const prompt = this.prompts.get(promptId);
    if (!prompt) return false;

    return this.updatePrompt(promptId, {
      currentPrompt: prompt.defaultPrompt,
      isActive: true
    }, modifiedBy);
  }

  /**
   * Active/désactive un prompt
   */
  togglePrompt(promptId: string, modifiedBy: string): boolean {
    const prompt = this.prompts.get(promptId);
    if (!prompt) return false;

    return this.updatePrompt(promptId, {
      isActive: !prompt.isActive
    }, modifiedBy);
  }

  /**
   * Récupère les templates disponibles
   */
  getTemplates(category?: string): PromptTemplate[] {
    if (category) {
      return this.templates.filter(t => t.category === category);
    }
    return this.templates;
  }

  /**
   * Applique un template à un prompt
   */
  applyTemplate(promptId: string, templateId: string, variables: Record<string, string>, modifiedBy: string): boolean {
    const prompt = this.prompts.get(promptId);
    const template = this.templates.find(t => t.id === templateId);
    
    if (!prompt || !template) return false;

    let newPrompt = template.template;
    Object.entries(variables).forEach(([key, value]) => {
      newPrompt = newPrompt.replace(new RegExp(key, 'apos;g'apos;), value);
    });

    return this.updatePrompt(promptId, {
      currentPrompt: newPrompt
    }, modifiedBy);
  }

  /**
   * Valide un prompt
   */
  validatePrompt(prompt: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!prompt || prompt.trim().length === 0) {
      errors.push('apos;Le prompt ne peut pas être vide'apos;);
    }

    if (prompt.length < 50) {
      errors.push('apos;Le prompt doit contenir au moins 50 caractères'apos;);
    }

    if (prompt.length > 2000) {
      errors.push('apos;Le prompt ne peut pas dépasser 2000 caractères'apos;);
    }

    // Vérifier les variables non fermées
    const openVariables = prompt.match(/\{[^}]*$/g);
    if (openVariables) {
      errors.push('apos;Variables non fermées détectées'apos;);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Exporte les prompts
   */
  exportPrompts(): string {
    const data = {
      prompts: Array.from(this.prompts.values()),
      templates: this.templates,
      exportDate: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
  }

  /**
   * Importe des prompts
   */
  importPrompts(jsonData: string): { success: boolean; errors: string[] } {
    const errors: string[] = [];
    
    try {
      const data = JSON.parse(jsonData);
      
      if (data.prompts) {
        data.prompts.forEach((prompt: AgentPrompt) => {
          const validation = this.validatePrompt(prompt.currentPrompt);
          if (validation.isValid) {
            this.addPrompt(prompt);
          } else {
            errors.push(`Prompt ${prompt.id}: ${validation.errors.join('apos;, 'apos;)}`);
          }
        });
      }

      if (data.templates) {
        this.templates = data.templates;
      }

      return {
        success: errors.length === 0,
        errors
      };
    } catch (error) {
      return {
        success: false,
        errors: ['apos;Format JSON invalide'apos;]
      };
    }
  }

  /**
   * Génère un rapport des prompts
   */
  generatePromptReport(): string {
    const agents = ['apos;RadarFoxAI'apos;, 'apos;InsightPulseBot'apos;, 'apos;EchoBrandAI'apos;, 'apos;TrendSculptorBot'apos;, 'apos;ConversionHackerAI'apos;];
    
    let report = "📝 **RAPPORT DES PROMPTS - GESTIONNAIRE BERIOX AI**\n\n";
    
    report += "## 📊 RÉSUMÉ\n";
    report += `• Total des prompts: ${this.prompts.size}\n`;
    report += `• Templates disponibles: ${this.templates.length}\n`;
    report += `• Prompts actifs: ${Array.from(this.prompts.values()).filter(p => p.isActive).length}\n\n`;

    agents.forEach(agentName => {
      const agentPrompts = this.getAgentPrompts(agentName);
      if (agentPrompts.length > 0) {
        report += `## ${agentName}\n`;
        report += `• Prompts: ${agentPrompts.length}\n`;
        report += `• Actifs: ${agentPrompts.filter(p => p.isActive).length}\n`;
        report += `• Modifiés: ${agentPrompts.filter(p => p.modifiedBy !== 'apos;system'apos;).length}\n\n`;
      }
    });

    report += "## 🔧 TEMPLATES DISPONIBLES\n";
    this.templates.forEach(template => {
      report += `• **${template.name}** (${template.category})\n`;
      report += `  ${template.description}\n`;
      report += `  Variables: ${template.variables.join('apos;, 'apos;)}\n\n`;
    });

    return report;
  }
}

// Instance par défaut
export const promptManager = new PromptManager();
