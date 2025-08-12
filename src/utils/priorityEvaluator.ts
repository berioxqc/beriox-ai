// Utilitaire pour l'apos;évaluation automatique de priorité par PriorityBot

export interface PriorityEvaluation {
  priority: 'apos;high'apos; | 'apos;medium'apos; | 'apos;low'apos;;
  score: number;
  reasoning: string;
  factors: {
    urgency: number;
    impact: number;
    complexity: number;
    strategic: number;
  };
}

export function evaluatePriority(objective: string, context?: string): PriorityEvaluation {
  const text = `${objective} ${context || 'apos;'apos;}`.toLowerCase();
  
  // Mots-clés pour l'apos;urgence (0-10)
  const urgencyKeywords = {
    high: ['apos;urgent'apos;, 'apos;immédiat'apos;, 'apos;asap'apos;, 'apos;rapidement'apos;, 'apos;tout de suite'apos;, 'apos;deadline'apos;, 'apos;échéance'apos;, 'apos;critique'apos;, 'apos;bloquant'apos;],
    medium: ['apos;bientôt'apos;, 'apos;prochainement'apos;, 'apos;dans la semaine'apos;, 'apos;important'apos;, 'apos;nécessaire'apos;],
    low: ['apos;plus tard'apos;, 'apos;éventuellement'apos;, 'apos;à long terme'apos;, 'apos;quand possible'apos;, 'apos;optionnel'apos;]
  };

  // Mots-clés pour l'apos;impact business (0-10)
  const impactKeywords = {
    high: ['apos;chiffre d\'apos;affaires'apos;, 'apos;revenus'apos;, 'apos;clients'apos;, 'apos;croissance'apos;, 'apos;stratégique'apos;, 'apos;transformation'apos;, 'apos;innovation'apos;, 'apos;concurrence'apos;, 'apos;marché'apos;],
    medium: ['apos;amélioration'apos;, 'apos;optimisation'apos;, 'apos;efficacité'apos;, 'apos;qualité'apos;, 'apos;processus'apos;, 'apos;équipe'apos;],
    low: ['apos;documentation'apos;, 'apos;organisation'apos;, 'apos;maintenance'apos;, 'apos;nettoyage'apos;, 'apos;archivage'apos;]
  };

  // Mots-clés pour la complexité (0-10, inversé pour le score)
  const complexityKeywords = {
    high: ['apos;développement'apos;, 'apos;architecture'apos;, 'apos;système'apos;, 'apos;intégration'apos;, 'apos;migration'apos;, 'apos;refactoring'apos;, 'apos;technique'apos;],
    medium: ['apos;analyse'apos;, 'apos;étude'apos;, 'apos;recherche'apos;, 'apos;conception'apos;, 'apos;design'apos;],
    low: ['apos;simple'apos;, 'apos;basique'apos;, 'apos;rapide'apos;, 'apos;facile'apos;, 'apos;direct'apos;]
  };

  // Mots-clés stratégiques (0-10)
  const strategicKeywords = {
    high: ['apos;vision'apos;, 'apos;mission'apos;, 'apos;objectifs'apos;, 'apos;stratégie'apos;, 'apos;roadmap'apos;, 'apos;pivot'apos;, 'apos;expansion'apos;, 'apos;lancement'apos;],
    medium: ['apos;projet'apos;, 'apos;initiative'apos;, 'apos;campagne'apos;, 'apos;amélioration'apos;],
    low: ['apos;tâche'apos;, 'apos;correction'apos;, 'apos;ajustement'apos;, 'apos;modification'apos;]
  };

  // Calcul des scores
  const urgency = calculateKeywordScore(text, urgencyKeywords);
  const impact = calculateKeywordScore(text, impactKeywords);
  const complexity = 10 - calculateKeywordScore(text, complexityKeywords); // Inversé
  const strategic = calculateKeywordScore(text, strategicKeywords);

  // Score global pondéré
  const globalScore = (urgency * 0.3) + (impact * 0.4) + (complexity * 0.1) + (strategic * 0.2);

  // Détermination de la priorité
  let priority: 'apos;high'apos; | 'apos;medium'apos; | 'apos;low'apos;;
  if (globalScore >= 7) {
    priority = 'apos;high'apos;;
  } else if (globalScore >= 4) {
    priority = 'apos;medium'apos;;
  } else {
    priority = 'apos;low'apos;;
  }

  // Génération du raisonnement
  const reasoning = generateReasoning(priority, { urgency, impact, complexity, strategic }, text);

  return {
    priority,
    score: Math.round(globalScore * 10) / 10,
    reasoning,
    factors: {
      urgency: Math.round(urgency * 10) / 10,
      impact: Math.round(impact * 10) / 10,
      complexity: Math.round(complexity * 10) / 10,
      strategic: Math.round(strategic * 10) / 10
    }
  };
}

function calculateKeywordScore(text: string, keywords: { high: string[], medium: string[], low: string[] }): number {
  let score = 0;
  
  keywords.high.forEach(keyword => {
    if (text.includes(keyword)) score += 3;
  });
  
  keywords.medium.forEach(keyword => {
    if (text.includes(keyword)) score += 2;
  });
  
  keywords.low.forEach(keyword => {
    if (text.includes(keyword)) score += 1;
  });

  return Math.min(score, 10); // Cap à 10
}

function generateReasoning(
  priority: 'apos;high'apos; | 'apos;medium'apos; | 'apos;low'apos;,
  factors: { urgency: number, impact: number, complexity: number, strategic: number },
  text: string
): string {
  const reasons = [];

  // Analyse de l'apos;urgence
  if (factors.urgency >= 7) {
    reasons.push("🔥 Urgence élevée détectée");
  } else if (factors.urgency >= 4) {
    reasons.push("⏰ Urgence modérée");
  } else {
    reasons.push("📅 Pas d'apos;urgence particulière");
  }

  // Analyse de l'apos;impact
  if (factors.impact >= 7) {
    reasons.push("💎 Impact business majeur");
  } else if (factors.impact >= 4) {
    reasons.push("📈 Impact business modéré");
  } else {
    reasons.push("🔧 Impact opérationnel");
  }

  // Analyse stratégique
  if (factors.strategic >= 7) {
    reasons.push("🎯 Enjeu stratégique critique");
  } else if (factors.strategic >= 4) {
    reasons.push("📊 Importance tactique");
  }

  // Analyse de la complexité
  if (factors.complexity <= 3) {
    reasons.push("⚡ Complexité élevée identifiée");
  } else if (factors.complexity <= 6) {
    reasons.push("🔄 Complexité modérée");
  } else {
    reasons.push("✅ Implémentation simple");
  }

  const priorityLabels = {
    high: "HAUTE - Action immédiate requise",
    medium: "MOYENNE - Planification nécessaire",
    low: "BASSE - À traiter selon disponibilité"
  };

  return `PriorityBot recommande une priorité ${priorityLabels[priority]}.\n\n${reasons.join('apos; • 'apos;)}`;
}

// Fonction pour obtenir une évaluation avec prompt GPT (optionnel, pour cas complexes)
export async function getAIPriorityEvaluation(objective: string, context?: string): Promise<PriorityEvaluation> {
  const prompt = `En tant que PriorityBot, expert en priorisation de missions business, analyse cette mission et détermine sa priorité.

Mission: ${objective}
${context ? `Contexte: ${context}` : 'apos;'apos;}

Évalue selon ces critères:
1. Urgence (délais, contraintes temporelles)
2. Impact business (revenus, clients, croissance)
3. Complexité (ressources, temps, difficultés)
4. Valeur stratégique (alignement objectifs, innovation)

Réponds au format JSON:
{
  "priority": "high|medium|low",
  "score": number (0-10),
  "reasoning": "explication détaillée",
  "factors": {
    "urgency": number (0-10),
    "impact": number (0-10),
    "complexity": number (0-10),
    "strategic": number (0-10)
  }
}`;

  try {
    const response = await fetch('apos;/api/openai'apos;, {
      method: 'apos;POST'apos;,
      headers: {
        'apos;Content-Type'apos;: 'apos;application/json'apos;,
      },
      body: JSON.stringify({
        prompt,
        maxTokens: 500,
        temperature: 0.3
      })
    });

    const data = await response.json();
    return JSON.parse(data.response);
  } catch (error) {
    // Fallback vers l'apos;évaluation locale
    console.warn('apos;Fallback vers évaluation locale:'apos;, error);
    return evaluatePriority(objective, context);
  }
}
