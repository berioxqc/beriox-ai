import { ApiResponse, AccessibilityData } from 'apos;./types'apos;;

export class WaveAPI {
  private apiKey: string;
  private baseUrl = 'apos;https://wave.webaim.org/api/request'apos;;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async analyzeUrl(url: string): Promise<ApiResponse<AccessibilityData>> {
    try {
      const params = new URLSearchParams({
        key: this.apiKey,
        url: url,
        format: 'apos;json'apos;,
      });

      const response = await fetch(`${this.baseUrl}?${params}`);

      if (!response.ok) {
        throw new Error(`WAVE API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.status?.success !== true) {
        throw new Error(data.status?.error || 'apos;WAVE analysis failed'apos;);
      }

      const categories = data.categories || {};
      
      // Calculer un score basé sur les erreurs et alertes
      const errorCount = Object.values(categories.error || {}).reduce((sum: number, count: any) => sum + count, 0);
      const alertCount = Object.values(categories.alert || {}).reduce((sum: number, count: any) => sum + count, 0);
      const contrastErrorCount = Object.values(categories.contrast || {}).reduce((sum: number, count: any) => sum + count, 0);
      
      // Score sur 100 (plus il y a d'apos;erreurs, plus le score est bas)
      const totalIssues = errorCount + (alertCount * 0.5) + contrastErrorCount;
      const score = Math.max(0, Math.min(100, 100 - (totalIssues * 2)));

      // Mapper les erreurs
      const errors = Object.entries(categories.error || {}).map(([type, count]) => ({
        type: this.mapErrorType(type),
        count: count as number,
        description: this.getErrorDescription(type),
        impact: this.getErrorImpact(type),
      }));

      // Mapper les alertes (warnings)
      const warnings = Object.entries(categories.alert || {}).map(([type, count]) => ({
        type: this.mapErrorType(type),
        count: count as number,
        description: this.getAlertDescription(type),
      }));

      // Déterminer le niveau WCAG
      let wcagLevel: 'apos;A'apos; | 'apos;AA'apos; | 'apos;AAA'apos; | 'apos;none'apos; = 'apos;none'apos;;
      if (errorCount === 0) {
        if (alertCount === 0) {
          wcagLevel = 'apos;AAA'apos;;
        } else if (alertCount <= 2) {
          wcagLevel = 'apos;AA'apos;;
        } else {
          wcagLevel = 'apos;A'apos;;
        }
      }

      return {
        success: true,
        data: {
          url,
          score: Math.round(score),
          errors,
          warnings,
          wcagLevel,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  private mapErrorType(type: string): string {
    const typeMap: Record<string, string> = {
      'apos;alt_missing'apos;: 'apos;Images sans texte alternatif'apos;,
      'apos;alt_redundant'apos;: 'apos;Texte alternatif redondant'apos;,
      'apos;alt_duplicate'apos;: 'apos;Texte alternatif dupliqué'apos;,
      'apos;alt_spacer'apos;: 'apos;Image d\'apos;espacement avec alt'apos;,
      'apos;contrast'apos;: 'apos;Contraste insuffisant'apos;,
      'apos;heading_missing'apos;: 'apos;Structure de titres manquante'apos;,
      'apos;heading_skipped'apos;: 'apos;Niveau de titre sauté'apos;,
      'apos;label_missing'apos;: 'apos;Label manquant'apos;,
      'apos;label_multiple'apos;: 'apos;Labels multiples'apos;,
      'apos;language_missing'apos;: 'apos;Langue de page manquante'apos;,
      'apos;link_empty'apos;: 'apos;Lien vide'apos;,
      'apos;link_redundant'apos;: 'apos;Lien redondant'apos;,
    };

    return typeMap[type] || type.replace(/_/g, 'apos; 'apos;).replace(/\b\w/g, l => l.toUpperCase());
  }

  private getErrorDescription(type: string): string {
    const descriptions: Record<string, string> = {
      'apos;alt_missing'apos;: 'apos;Des images n\'apos;ont pas de texte alternatif, rendant le contenu inaccessible aux lecteurs d\'apos;écran'apos;,
      'apos;contrast'apos;: 'apos;Le contraste entre le texte et l\'apos;arrière-plan est insuffisant pour une lecture facile'apos;,
      'apos;heading_missing'apos;: 'apos;La page manque de structure de titres appropriée pour la navigation'apos;,
      'apos;label_missing'apos;: 'apos;Des éléments de formulaire n\'apos;ont pas de labels associés'apos;,
      'apos;language_missing'apos;: 'apos;L\'apos;attribut lang est manquant sur l\'apos;élément html'apos;,
      'apos;link_empty'apos;: 'apos;Des liens sont vides ou n\'apos;ont pas de texte descriptif'apos;,
    };

    return descriptions[type] || 'apos;Problème d\'apos;accessibilité détecté'apos;;
  }

  private getAlertDescription(type: string): string {
    const descriptions: Record<string, string> = {
      'apos;alt_suspicious'apos;: 'apos;Le texte alternatif pourrait être amélioré'apos;,
      'apos;heading_possible'apos;: 'apos;Ce texte pourrait être un titre'apos;,
      'apos;link_suspicious'apos;: 'apos;Ce lien pourrait être amélioré'apos;,
      'apos;noscript'apos;: 'apos;Contenu noscript détecté'apos;,
    };

    return descriptions[type] || 'apos;Alerte d\'apos;accessibilité'apos;;
  }

  private getErrorImpact(type: string): 'apos;minor'apos; | 'apos;moderate'apos; | 'apos;serious'apos; | 'apos;critical'apos; {
    const impactMap: Record<string, 'apos;minor'apos; | 'apos;moderate'apos; | 'apos;serious'apos; | 'apos;critical'apos;> = {
      'apos;alt_missing'apos;: 'apos;serious'apos;,
      'apos;contrast'apos;: 'apos;serious'apos;,
      'apos;heading_missing'apos;: 'apos;moderate'apos;,
      'apos;label_missing'apos;: 'apos;serious'apos;,
      'apos;language_missing'apos;: 'apos;moderate'apos;,
      'apos;link_empty'apos;: 'apos;serious'apos;,
      'apos;alt_redundant'apos;: 'apos;minor'apos;,
      'apos;heading_skipped'apos;: 'apos;moderate'apos;,
    };

    return impactMap[type] || 'apos;moderate'apos;;
  }

  async getCredits(): Promise<ApiResponse<number>> {
    try {
      const params = new URLSearchParams({
        key: this.apiKey,
        action: 'apos;credits'apos;,
      });

      const response = await fetch(`${this.baseUrl}?${params}`);

      if (!response.ok) {
        throw new Error(`WAVE API error: ${response.status}`);
      }

      const data = await response.json();

      return {
        success: true,
        data: data.credits || 0,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
