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
    alignment: 'apos;perfect'apos; | 'apos;good'apos; | 'apos;needs_work'apos; | 'apos;poor'apos;;
  };
  visual: {
    elements: string[];
    score: number;
    issues: string[];
    suggestions: string[];
    alignment: 'apos;perfect'apos; | 'apos;good'apos; | 'apos;needs_work'apos; | 'apos;poor'apos;;
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
    grade: 'apos;A'apos; | 'apos;B'apos; | 'apos;C'apos; | 'apos;D'apos; | 'apos;F'apos;;
    summary: string;
    priorityActions: string[];
  };
}

export interface ContentRewrite {
  original: string;
  rewritten: string;
  changes: {
    type: 'apos;tone'apos; | 'apos;vocabulary'apos; | 'apos;structure'apos; | 'apos;clarity'apos;;
    description: string;
    impact: 'apos;high'apos; | 'apos;medium'apos; | 'apos;low'apos;;
  }[];
  score: {
    before: number;
    after: number;
    improvement: number;
  };
}

export interface EchoBrandConfig {
  brandGuidelines: BrandGuidelines;
  strictness: 'apos;strict'apos; | 'apos;moderate'apos; | 'apos;flexible'apos;;
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
      console.error("🛡️ EchoBrandAI: Erreur lors de l'apos;audit:", error);
      throw new Error("Impossible de compléter l'apos;audit de cohérence de marque");
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

    // Suggestions d'apos;amélioration
    if (score < 80) {
      suggestions.push("Réviser le ton pour mieux correspondre à la voix de la marque");
    }
    if (score < 70) {
      suggestions.push("Remplacer certains termes par le vocabulaire préféré de la marque");
    }

    const alignment = score >= 90 ? 'apos;perfect'apos; : score >= 75 ? 'apos;good'apos; : score >= 60 ? 'apos;needs_work'apos; : 'apos;poor'apos;;

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
    const hasProfessionalTone = text.includes('apos;professionnel'apos;) || text.includes('apos;expert'apos;) || text.includes('apos;qualité'apos;);
    const hasFriendlyTone = text.includes('apos;nous'apos;) || text.includes('apos;ensemble'apos;) || text.includes('apos;accompagner'apos;);

    if (!hasProfessionalTone && tone.includes('apos;professionnel'apos;)) {
      issues.push("Le ton professionnel n'apos;est pas assez présent");
    }

    if (!hasFriendlyTone && personality.includes('apos;amical'apos;)) {
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
      issues.push("Aucun mot préféré de la marque n'apos;est utilisé");
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
    const wordCount = text.split('apos; 'apos;).length;
    
    if (wordCount < length.short) {
      issues.push("Le contenu est trop court pour ce type de format");
    } else if (wordCount > length.long) {
      issues.push("Le contenu est trop long, risque de perdre l'apos;attention");
    }

    // Vérification de la lisibilité
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const longSentences = sentences.filter(s => s.split('apos; 'apos;).length > 25);
    
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
        issues.push(`Élément "${element}" n'apos;utilise pas les couleurs de la marque`);
        score -= 15;
      }
    });

    // Vérification du style
    const hasConsistentStyle = style.some(styleElement => 
      elements.some(element => element.toLowerCase().includes(styleElement.toLowerCase()))
    );

    if (!hasConsistentStyle) {
      issues.push("Le style visuel n'apos;est pas cohérent avec la charte");
      score -= 20;
    }

    if (score < 80) {
      suggestions.push("Utiliser davantage les couleurs et styles de la charte graphique");
    }

    const alignment = score >= 90 ? 'apos;perfect'apos; : score >= 75 ? 'apos;good'apos; : score >= 60 ? 'apos;needs_work'apos; : 'apos;poor'apos;;

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
      alignment: 'apos;perfect'apos; as const
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
      issues.push("Aucune proposition de valeur claire n'apos;est exprimée");
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

    // Vérification de l'apos;impact
    const hasPositioning = text.toLowerCase().includes(positioning.toLowerCase());
    if (!hasPositioning) {
      issues.push("Le positionnement de la marque n'apos;est pas clairement exprimé");
      impact -= 20;
    }

    if (clarity < 80) {
      suggestions.push("Renforcer l'apos;expression des propositions de valeur");
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

    const grade = overallScore >= 90 ? 'apos;A'apos; : overallScore >= 80 ? 'apos;B'apos; : overallScore >= 70 ? 'apos;C'apos; : overallScore >= 60 ? 'apos;D'apos; : 'apos;F'apos;;

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
    if (grade === 'apos;A'apos;) {
      return "Excellente cohérence avec la marque. Le contenu respecte parfaitement les guidelines.";
    } else if (grade === 'apos;B'apos;) {
      return "Bonne cohérence avec quelques ajustements mineurs nécessaires.";
    } else if (grade === 'apos;C'apos;) {
      return "Cohérence acceptable mais des améliorations sont recommandées.";
    } else if (grade === 'apos;D'apos;) {
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

    if (content.alignment === 'apos;poor'apos;) {
      actions.push("Réviser complètement le contenu pour respecter la voix de la marque");
    }

    if (visual.alignment === 'apos;poor'apos;) {
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

    // Ajout d'apos;éléments de ton professionnel
    if (!improved.includes('apos;professionnel'apos;) && !improved.includes('apos;expert'apos;)) {
      improved = improved.replace(/nous offrons/gi, 'apos;nous offrons une expertise professionnelle'apos;);
    }

    // Ajout d'apos;éléments de ton amical
    if (!improved.includes('apos;nous'apos;) && !improved.includes('apos;ensemble'apos;)) {
      improved = improved.replace(/vous pouvez/gi, 'apos;nous vous accompagnons pour'apos;);
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
      const regex = new RegExp(word, 'apos;gi'apos;);
      improved = improved.replace(regex, preferredWords[0] || 'apos;solution'apos;);
    });

    // Ajout de mots préférés
    if (!preferredWords.some(word => improved.toLowerCase().includes(word.toLowerCase()))) {
      improved = `${preferredWords[0] || 'apos;Innovation'apos;}: ${improved}`;
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
      const words = sentence.trim().split('apos; 'apos;);
      if (words.length > 25) {
        const midPoint = Math.floor(words.length / 2);
        return words.slice(0, midPoint).join('apos; 'apos;) + 'apos;. 'apos; + words.slice(midPoint).join('apos; 'apos;);
      }
      return sentence;
    });

    return improvedSentences.join('apos;. 'apos;);
  }

  /**
   * Identification des changements
   */
  private identifyChanges(original: string, rewritten: string): any[] {
    const changes = [];

    if (original !== rewritten) {
      changes.push({
        type: 'apos;tone'apos; as const,
        description: "Amélioration du ton pour correspondre à la voix de la marque",
        impact: 'apos;medium'apos; as const
      });
    }

    const originalWords = original.toLowerCase().split('apos; 'apos;);
    const rewrittenWords = rewritten.toLowerCase().split('apos; 'apos;);

    if (rewrittenWords.length !== originalWords.length) {
      changes.push({
        type: 'apos;structure'apos; as const,
        description: "Optimisation de la structure pour améliorer la lisibilité",
        impact: 'apos;high'apos; as const
      });
    }

    return changes;
  }

  /**
   * Génère un rapport d'apos;audit formaté
   */
  generateAuditReport(): string {
    if (!this.lastAudit) {
      return "Aucun audit disponible. Lancez d'apos;abord un audit de cohérence de marque.";
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
      report += "**Suggestions d'apos;amélioration:**\n";
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
    report += "*Rapport généré par EchoBrandAI - C'apos;est bon, mais ce n'apos;est pas nous.*";

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

// Instance par défaut avec guidelines d'apos;exemple
export const echoBrandAI = new EchoBrandAI({
  brandGuidelines: {
    voice: {
      tone: ['apos;professionnel'apos;, 'apos;amical'apos;, 'apos;innovant'apos;],
      personality: ['apos;expert'apos;, 'apos;accompagnant'apos;, 'apos;créatif'apos;],
      forbiddenWords: ['apos;cheap'apos;, 'apos;basique'apos;, 'apos;simple'apos;],
      preferredWords: ['apos;innovation'apos;, 'apos;expertise'apos;, 'apos;accompagnement'apos;, 'apos;solution'apos;]
    },
    visual: {
      colors: ['apos;#635bff'apos;, 'apos;#10b981'apos;, 'apos;#f59e0b'apos;],
      fonts: ['apos;Inter'apos;, 'apos;Roboto'apos;, 'apos;Open Sans'apos;],
      style: ['apos;moderne'apos;, 'apos;épuré'apos;, 'apos;professionnel'apos;],
      logoUsage: ['apos;toujours avec espacement'apos;, 'apos;couleurs officielles uniquement'apos;]
    },
    messaging: {
      valuePropositions: ['apos;Innovation technologique'apos;, 'apos;Accompagnement personnalisé'apos;, 'apos;Expertise reconnue'apos;],
      keyMessages: ['apos;Transformer votre business'apos;, 'apos;Solutions sur mesure'apos;, 'apos;Résultats garantis'apos;],
      targetAudience: ['apos;Dirigeants'apos;, 'apos;Professionnels'apos;, 'apos;Innovateurs'apos;],
      positioning: 'apos;Leader en solutions technologiques innovantes'apos;
    },
    content: {
      topics: ['apos;innovation'apos;, 'apos;technologie'apos;, 'apos;business'apos;, 'apos;transformation'apos;],
      formats: ['apos;articles'apos;, 'apos;études de cas'apos;, 'apos;guides'apos;, 'apos;webinaires'apos;],
      length: {
        short: 100,
        medium: 500,
        long: 1500
      }
    }
  },
  strictness: 'apos;moderate'apos;,
  autoRewrite: true,
  focusAreas: ['apos;tone'apos;, 'apos;vocabulary'apos;, 'apos;messaging'apos;]
});
