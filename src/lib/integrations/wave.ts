import { ApiResponse, AccessibilityData } from './types';

export class WaveAPI {
  private apiKey: string;
  private baseUrl = 'https://wave.webaim.org/api/request';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async analyzeUrl(url: string): Promise<ApiResponse<AccessibilityData>> {
    try {
      const params = new URLSearchParams({
        key: this.apiKey,
        url: url,
        format: 'json',
      });

      const response = await fetch(`${this.baseUrl}?${params}`);

      if (!response.ok) {
        throw new Error(`WAVE API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.status?.success !== true) {
        throw new Error(data.status?.error || 'WAVE analysis failed');
      }

      const categories = data.categories || {};
      
      // Calculer un score basé sur les erreurs et alertes
      const errorCount = Object.values(categories.error || {}).reduce((sum: number, count: any) => sum + count, 0);
      const alertCount = Object.values(categories.alert || {}).reduce((sum: number, count: any) => sum + count, 0);
      const contrastErrorCount = Object.values(categories.contrast || {}).reduce((sum: number, count: any) => sum + count, 0);
      
      // Score sur 100 (plus il y a d'erreurs, plus le score est bas)
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
      let wcagLevel: 'A' | 'AA' | 'AAA' | 'none' = 'none';
      if (errorCount === 0) {
        if (alertCount === 0) {
          wcagLevel = 'AAA';
        } else if (alertCount <= 2) {
          wcagLevel = 'AA';
        } else {
          wcagLevel = 'A';
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
      'alt_missing': 'Images sans texte alternatif',
      'alt_redundant': 'Texte alternatif redondant',
      'alt_duplicate': 'Texte alternatif dupliqué',
      'alt_spacer': 'Image d\'espacement avec alt',
      'contrast': 'Contraste insuffisant',
      'heading_missing': 'Structure de titres manquante',
      'heading_skipped': 'Niveau de titre sauté',
      'label_missing': 'Label manquant',
      'label_multiple': 'Labels multiples',
      'language_missing': 'Langue de page manquante',
      'link_empty': 'Lien vide',
      'link_redundant': 'Lien redondant',
    };

    return typeMap[type] || type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  private getErrorDescription(type: string): string {
    const descriptions: Record<string, string> = {
      'alt_missing': 'Des images n\'ont pas de texte alternatif, rendant le contenu inaccessible aux lecteurs d\'écran',
      'contrast': 'Le contraste entre le texte et l\'arrière-plan est insuffisant pour une lecture facile',
      'heading_missing': 'La page manque de structure de titres appropriée pour la navigation',
      'label_missing': 'Des éléments de formulaire n\'ont pas de labels associés',
      'language_missing': 'L\'attribut lang est manquant sur l\'élément html',
      'link_empty': 'Des liens sont vides ou n\'ont pas de texte descriptif',
    };

    return descriptions[type] || 'Problème d\'accessibilité détecté';
  }

  private getAlertDescription(type: string): string {
    const descriptions: Record<string, string> = {
      'alt_suspicious': 'Le texte alternatif pourrait être amélioré',
      'heading_possible': 'Ce texte pourrait être un titre',
      'link_suspicious': 'Ce lien pourrait être amélioré',
      'noscript': 'Contenu noscript détecté',
    };

    return descriptions[type] || 'Alerte d\'accessibilité';
  }

  private getErrorImpact(type: string): 'minor' | 'moderate' | 'serious' | 'critical' {
    const impactMap: Record<string, 'minor' | 'moderate' | 'serious' | 'critical'> = {
      'alt_missing': 'serious',
      'contrast': 'serious',
      'heading_missing': 'moderate',
      'label_missing': 'serious',
      'language_missing': 'moderate',
      'link_empty': 'serious',
      'alt_redundant': 'minor',
      'heading_skipped': 'moderate',
    };

    return impactMap[type] || 'moderate';
  }

  async getCredits(): Promise<ApiResponse<number>> {
    try {
      const params = new URLSearchParams({
        key: this.apiKey,
        action: 'credits',
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
