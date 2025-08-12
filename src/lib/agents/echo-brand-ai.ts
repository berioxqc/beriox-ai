/**
 * EchoBrandAI – Le gardien de la cohérence de marque
 * Rôle : Vérifie que toutes les actions et contenus respectent la voix et le style de la marque
 */

export interface BrandGuidelines {
  voice: {
    tone: string[];
    personality: string[];
    forbiddenWords: string[];
    preferredWords: string[];
  };
  visual: {
    colors: string[];
    fonts: string[];
    style: string[];
    logoUsage: string[];
  };
  messaging: {
    valuePropositions: string[];
    keyMessages: string[];
    targetAudience: string[];
    positioning: string;
  };
  content: {
    topics: string[];
    formats: string[];
    length: {
      short: number;
      medium: number;
      long: number;
    };
  };
}

export interface BrandAuditResult {
  content: {
    text: string;
    score: number; // 0-100
    issues: string[];
    suggestions: string[];
    alignment: 'perfect' | 'good' | 'needs_work' | 'poor';
  };
  visual: {
    elements: string[];
    score: number;
    issues: string[];
    suggestions: string[];
    alignment: 'perfect' | 'good' | 'needs_work' | 'poor';
  };
  messaging: {
    clarity: number;
    consistency: number;
    impact: number;
    issues: string[];
    suggestions: string[];
  };
  overall: {
    score: number;
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    summary: string;
    priorityActions: string[];
  };
}

export interface ContentRewrite {
  original: string;
  rewritten: string;
  changes: {
    type: 'tone' | 'vocabulary' | 'structure' | 'clarity';
    description: string;
    impact: 'high' | 'medium' | 'low';
  }[];
  score: {
    before: number;
    after: number;
    improvement: number;
  };
}

export interface EchoBrandConfig {
  brandGuidelines: BrandGuidelines;
  strictness: 'strict' | 'moderate' | 'flexible';
  autoRewrite: boolean;
  focusAreas: string[];
}

export class EchoBrandAI {
  private config: EchoBrandConfig;
  private lastAudit: BrandAuditResult | null = null;

  constructor(config: EchoBrandConfig) {
    this.config = config;
  }

  /**
   * Audit complet de la cohérence de marque
   */
  async auditBrandConsistency(content: string, visualElements?: string[]): Promise<BrandAuditResult> {
    console.log("🛡️ EchoBrandAI: Audit de cohérence de marque en cours...");

    try {
      const contentAudit = this.auditContent(content);
      const visualAudit = visualElements ? this.auditVisual(visualElements) : this.getDefaultVisualAudit();
      const messagingAudit = this.auditMessaging(content);
      
      const overall = this.calculateOverallScore(contentAudit, visualAudit, messagingAudit);

      const audit: BrandAuditResult = {
        content: contentAudit,
        visual: visualAudit,
        messaging: messagingAudit,
        overall
      };

      this.lastAudit = audit;
      
      console.log("🛡️ EchoBrandAI: Audit terminé. Score global:", overall.score);
      
      return audit;
    } catch (error) {
      console.error("🛡️ EchoBrandAI: Erreur lors de l'audit:", error);
      throw new Error("Impossible de compléter l'audit de cohérence de marque");
    }
  }

  /**
   * Audit du contenu textuel
   */
  private auditContent(text: string) {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let score = 100;

    // Vérification du ton
    const toneIssues = this.checkTone(text);
    issues.push(...toneIssues);
    score -= toneIssues.length * 10;

    // Vérification du vocabulaire
    const vocabIssues = this.checkVocabulary(text);
    issues.push(...vocabIssues);
    score -= vocabIssues.length * 8;

    // Vérification de la structure
    const structureIssues = this.checkStructure(text);
    issues.push(...structureIssues);
    score -= structureIssues.length * 5;

    // Suggestions d'amélioration
    if (score < 80) {
      suggestions.push("Réviser le ton pour mieux correspondre à la voix de la marque");
    }
    if (score < 70) {
      suggestions.push("Remplacer certains termes par le vocabulaire préféré de la marque");
    }

    const alignment = score >= 90 ? 'perfect' : score >= 75 ? 'good' : score >= 60 ? 'needs_work' : 'poor';

    return {
      text,
      score: Math.max(0, score),
      issues,
      suggestions,
      alignment
    };
  }

  /**
   * Vérification du ton
   */
  private checkTone(text: string): string[] {
    const issues: string[] = [];
    const { tone, personality } = this.config.brandGuidelines.voice;

    // Vérification de la présence des éléments de ton souhaités
    const hasProfessionalTone = text.includes('professionnel') || text.includes('expert') || text.includes('qualité');
    const hasFriendlyTone = text.includes('nous') || text.includes('ensemble') || text.includes('accompagner');

    if (!hasProfessionalTone && tone.includes('professionnel')) {
      issues.push("Le ton professionnel n'est pas assez présent");
    }

    if (!hasFriendlyTone && personality.includes('amical')) {
      issues.push("Le ton amical et inclusif manque");
    }

    return issues;
  }

  /**
   * Vérification du vocabulaire
   */
  private checkVocabulary(text: string): string[] {
    const issues: string[] = [];
    const { forbiddenWords, preferredWords } = this.config.brandGuidelines.voice;

    // Vérification des mots interdits
    forbiddenWords.forEach(word => {
      if (text.toLowerCase().includes(word.toLowerCase())) {
        issues.push(`Mot à éviter détecté: "${word}"`);
      }
    });

    // Vérification des mots préférés
    const hasPreferredWords = preferredWords.some(word => 
      text.toLowerCase().includes(word.toLowerCase())
    );

    if (!hasPreferredWords && preferredWords.length > 0) {
      issues.push("Aucun mot préféré de la marque n'est utilisé");
    }

    return issues;
  }

  /**
   * Vérification de la structure
   */
  private checkStructure(text: string): string[] {
    const issues: string[] = [];
    const { length } = this.config.brandGuidelines.content;

    // Vérification de la longueur
    const wordCount = text.split(' ').length;
    
    if (wordCount < length.short) {
      issues.push("Le contenu est trop court pour ce type de format");
    } else if (wordCount > length.long) {
      issues.push("Le contenu est trop long, risque de perdre l'attention");
    }

    // Vérification de la lisibilité
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const longSentences = sentences.filter(s => s.split(' ').length > 25);
    
    if (longSentences.length > sentences.length * 0.3) {
      issues.push("Trop de phrases longues, difficulté de lecture");
    }

    return issues;
  }

  /**
   * Audit des éléments visuels
   */
  private auditVisual(elements: string[]) {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let score = 100;

    const { colors, fonts, style } = this.config.brandGuidelines.visual;

    // Vérification des couleurs
    elements.forEach(element => {
      const hasBrandColors = colors.some(color => 
        element.toLowerCase().includes(color.toLowerCase())
      );
      
      if (!hasBrandColors) {
        issues.push(`Élément "${element}" n'utilise pas les couleurs de la marque`);
        score -= 15;
      }
    });

    // Vérification du style
    const hasConsistentStyle = style.some(styleElement => 
      elements.some(element => element.toLowerCase().includes(styleElement.toLowerCase()))
    );

    if (!hasConsistentStyle) {
      issues.push("Le style visuel n'est pas cohérent avec la charte");
      score -= 20;
    }

    if (score < 80) {
      suggestions.push("Utiliser davantage les couleurs et styles de la charte graphique");
    }

    const alignment = score >= 90 ? 'perfect' : score >= 75 ? 'good' : score >= 60 ? 'needs_work' : 'poor';

    return {
      elements,
      score: Math.max(0, score),
      issues,
      suggestions,
      alignment
    };
  }

  /**
   * Audit par défaut pour les éléments visuels
   */
  private getDefaultVisualAudit() {
    return {
      elements: [],
      score: 100,
      issues: [],
      suggestions: [],
      alignment: 'perfect' as const
    };
  }

  /**
   * Audit du messaging
   */
  private auditMessaging(text: string) {
    const { valuePropositions, keyMessages, targetAudience, positioning } = this.config.brandGuidelines.messaging;

    let clarity = 100;
    let consistency = 100;
    let impact = 100;
    const issues: string[] = [];
    const suggestions: string[] = [];

    // Vérification de la clarté
    const hasValueProps = valuePropositions.some(prop => 
      text.toLowerCase().includes(prop.toLowerCase())
    );

    if (!hasValueProps) {
      issues.push("Aucune proposition de valeur claire n'est exprimée");
      clarity -= 30;
    }

    // Vérification de la cohérence
    const hasKeyMessages = keyMessages.some(message => 
      text.toLowerCase().includes(message.toLowerCase())
    );

    if (!hasKeyMessages) {
      issues.push("Les messages clés de la marque ne sont pas présents");
      consistency -= 25;
    }

    // Vérification de l'impact
    const hasPositioning = text.toLowerCase().includes(positioning.toLowerCase());
    if (!hasPositioning) {
      issues.push("Le positionnement de la marque n'est pas clairement exprimé");
      impact -= 20;
    }

    if (clarity < 80) {
      suggestions.push("Renforcer l'expression des propositions de valeur");
    }

    if (consistency < 80) {
      suggestions.push("Intégrer davantage les messages clés de la marque");
    }

    return {
      clarity: Math.max(0, clarity),
      consistency: Math.max(0, consistency),
      impact: Math.max(0, impact),
      issues,
      suggestions
    };
  }

  /**
   * Calcul du score global
   */
  private calculateOverallScore(content: any, visual: any, messaging: any) {
    const contentWeight = 0.4;
    const visualWeight = 0.3;
    const messagingWeight = 0.3;

    const overallScore = Math.round(
      content.score * contentWeight +
      visual.score * visualWeight +
      (messaging.clarity + messaging.consistency + messaging.impact) / 3 * messagingWeight
    );

    const grade = overallScore >= 90 ? 'A' : overallScore >= 80 ? 'B' : overallScore >= 70 ? 'C' : overallScore >= 60 ? 'D' : 'F';

    const summary = this.generateSummary(overallScore, grade);
    const priorityActions = this.generatePriorityActions(content, visual, messaging);

    return {
      score: overallScore,
      grade,
      summary,
      priorityActions
    };
  }

  /**
   * Génération du résumé
   */
  private generateSummary(score: number, grade: string): string {
    if (grade === 'A') {
      return "Excellente cohérence avec la marque. Le contenu respecte parfaitement les guidelines.";
    } else if (grade === 'B') {
      return "Bonne cohérence avec quelques ajustements mineurs nécessaires.";
    } else if (grade === 'C') {
      return "Cohérence acceptable mais des améliorations sont recommandées.";
    } else if (grade === 'D') {
      return "Cohérence faible, révision importante nécessaire.";
    } else {
      return "Cohérence très faible, refonte complète recommandée.";
    }
  }

  /**
   * Génération des actions prioritaires
   */
  private generatePriorityActions(content: any, visual: any, messaging: any): string[] {
    const actions: string[] = [];

    if (content.alignment === 'poor') {
      actions.push("Réviser complètement le contenu pour respecter la voix de la marque");
    }

    if (visual.alignment === 'poor') {
      actions.push("Refaire les éléments visuels selon la charte graphique");
    }

    if (messaging.clarity < 70) {
      actions.push("Clarifier les propositions de valeur");
    }

    if (messaging.consistency < 70) {
      actions.push("Intégrer les messages clés de la marque");
    }

    return actions;
  }

  /**
   * Réécriture automatique du contenu
   */
  async rewriteContent(originalText: string): Promise<ContentRewrite> {
    console.log("🛡️ EchoBrandAI: Réécriture du contenu en cours...");

    const beforeScore = this.auditContent(originalText).score;
    let rewrittenText = originalText;

    // Amélioration du ton
    rewrittenText = this.improveTone(rewrittenText);
    
    // Amélioration du vocabulaire
    rewrittenText = this.improveVocabulary(rewrittenText);
    
    // Amélioration de la structure
    rewrittenText = this.improveStructure(rewrittenText);

    const afterScore = this.auditContent(rewrittenText).score;
    const improvement = afterScore - beforeScore;

    const changes = this.identifyChanges(originalText, rewrittenText);

    return {
      original: originalText,
      rewritten: rewrittenText,
      changes,
      score: {
        before: beforeScore,
        after: afterScore,
        improvement
      }
    };
  }

  /**
   * Amélioration du ton
   */
  private improveTone(text: string): string {
    let improved = text;

    // Ajout d'éléments de ton professionnel
    if (!improved.includes('professionnel') && !improved.includes('expert')) {
      improved = improved.replace(/nous offrons/gi, 'nous offrons une expertise professionnelle');
    }

    // Ajout d'éléments de ton amical
    if (!improved.includes('nous') && !improved.includes('ensemble')) {
      improved = improved.replace(/vous pouvez/gi, 'nous vous accompagnons pour');
    }

    return improved;
  }

  /**
   * Amélioration du vocabulaire
   */
  private improveVocabulary(text: string): string {
    let improved = text;
    const { preferredWords, forbiddenWords } = this.config.brandGuidelines.voice;

    // Remplacement des mots interdits
    forbiddenWords.forEach(word => {
      const regex = new RegExp(word, 'gi');
      improved = improved.replace(regex, preferredWords[0] || 'solution');
    });

    // Ajout de mots préférés
    if (!preferredWords.some(word => improved.toLowerCase().includes(word.toLowerCase()))) {
      improved = `${preferredWords[0] || 'Innovation'}: ${improved}`;
    }

    return improved;
  }

  /**
   * Amélioration de la structure
   */
  private improveStructure(text: string): string {
    let improved = text;

    // Division des phrases trop longues
    const sentences = improved.split(/[.!?]+/);
    const improvedSentences = sentences.map(sentence => {
      const words = sentence.trim().split(' ');
      if (words.length > 25) {
        const midPoint = Math.floor(words.length / 2);
        return words.slice(0, midPoint).join(' ') + '. ' + words.slice(midPoint).join(' ');
      }
      return sentence;
    });

    return improvedSentences.join('. ');
  }

  /**
   * Identification des changements
   */
  private identifyChanges(original: string, rewritten: string): any[] {
    const changes = [];

    if (original !== rewritten) {
      changes.push({
        type: 'tone' as const,
        description: "Amélioration du ton pour correspondre à la voix de la marque",
        impact: 'medium' as const
      });
    }

    const originalWords = original.toLowerCase().split(' ');
    const rewrittenWords = rewritten.toLowerCase().split(' ');

    if (rewrittenWords.length !== originalWords.length) {
      changes.push({
        type: 'structure' as const,
        description: "Optimisation de la structure pour améliorer la lisibilité",
        impact: 'high' as const
      });
    }

    return changes;
  }

  /**
   * Génère un rapport d'audit formaté
   */
  generateAuditReport(): string {
    if (!this.lastAudit) {
      return "Aucun audit disponible. Lancez d'abord un audit de cohérence de marque.";
    }

    const { content, visual, messaging, overall } = this.lastAudit;

    let report = "🛡️ **RAPPORT ECHOBRAND - AUDIT DE COHÉRENCE DE MARQUE**\n\n";
    
    // Score global
    report += "## 📊 SCORE GLOBAL\n";
    report += `**Note:** ${overall.grade} (${overall.score}/100)\n`;
    report += `**Résumé:** ${overall.summary}\n\n`;

    // Audit du contenu
    report += "## 📝 AUDIT DU CONTENU\n";
    report += `**Score:** ${content.score}/100\n`;
    report += `**Alignement:** ${content.alignment}\n\n`;

    if (content.issues.length > 0) {
      report += "**Problèmes identifiés:**\n";
      content.issues.forEach(issue => {
        report += `• ${issue}\n`;
      });
      report += "\n";
    }

    if (content.suggestions.length > 0) {
      report += "**Suggestions d'amélioration:**\n";
      content.suggestions.forEach(suggestion => {
        report += `• ${suggestion}\n`;
      });
      report += "\n";
    }

    // Audit visuel
    report += "## 🎨 AUDIT VISUEL\n";
    report += `**Score:** ${visual.score}/100\n`;
    report += `**Alignement:** ${visual.alignment}\n\n`;

    if (visual.issues.length > 0) {
      report += "**Problèmes identifiés:**\n";
      visual.issues.forEach(issue => {
        report += `• ${issue}\n`;
      });
      report += "\n";
    }

    // Audit du messaging
    report += "## 💬 AUDIT DU MESSAGING\n";
    report += `**Clarté:** ${messaging.clarity}/100\n`;
    report += `**Cohérence:** ${messaging.consistency}/100\n`;
    report += `**Impact:** ${messaging.impact}/100\n\n`;

    if (messaging.issues.length > 0) {
      report += "**Problèmes identifiés:**\n";
      messaging.issues.forEach(issue => {
        report += `• ${issue}\n`;
      });
      report += "\n";
    }

    // Actions prioritaires
    if (overall.priorityActions.length > 0) {
      report += "## 🚨 ACTIONS PRIORITAIRES\n";
      overall.priorityActions.forEach(action => {
        report += `• ${action}\n`;
      });
    }

    report += "\n---\n";
    report += "*Rapport généré par EchoBrandAI - C'est bon, mais ce n'est pas nous.*";

    return report;
  }

  /**
   * Met à jour les guidelines de la marque
   */
  updateBrandGuidelines(newGuidelines: Partial<BrandGuidelines>) {
    this.config.brandGuidelines = { ...this.config.brandGuidelines, ...newGuidelines };
    console.log("🛡️ EchoBrandAI: Guidelines de marque mises à jour");
  }
}

// Instance par défaut avec guidelines d'exemple
export const echoBrandAI = new EchoBrandAI({
  brandGuidelines: {
    voice: {
      tone: ['professionnel', 'amical', 'innovant'],
      personality: ['expert', 'accompagnant', 'créatif'],
      forbiddenWords: ['cheap', 'basique', 'simple'],
      preferredWords: ['innovation', 'expertise', 'accompagnement', 'solution']
    },
    visual: {
      colors: ['#635bff', '#10b981', '#f59e0b'],
      fonts: ['Inter', 'Roboto', 'Open Sans'],
      style: ['moderne', 'épuré', 'professionnel'],
      logoUsage: ['toujours avec espacement', 'couleurs officielles uniquement']
    },
    messaging: {
      valuePropositions: ['Innovation technologique', 'Accompagnement personnalisé', 'Expertise reconnue'],
      keyMessages: ['Transformer votre business', 'Solutions sur mesure', 'Résultats garantis'],
      targetAudience: ['Dirigeants', 'Professionnels', 'Innovateurs'],
      positioning: 'Leader en solutions technologiques innovantes'
    },
    content: {
      topics: ['innovation', 'technologie', 'business', 'transformation'],
      formats: ['articles', 'études de cas', 'guides', 'webinaires'],
      length: {
        short: 100,
        medium: 500,
        long: 1500
      }
    }
  },
  strictness: 'moderate',
  autoRewrite: true,
  focusAreas: ['tone', 'vocabulary', 'messaging']
});
