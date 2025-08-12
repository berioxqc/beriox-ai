// Utilitaire pour l'évaluation automatique de priorité par PriorityBot

export interface PriorityEvaluation {
  priority: 'high' | 'medium' | 'low'
  score: number
  reasoning: string
  factors: {
    urgency: number
    impact: number
    complexity: number
    strategic: number
  }
}

export function evaluatePriority(objective: string, context?: string): PriorityEvaluation {
  const text = `${objective} ${context || ''}`.toLowerCase()
  // Mots-clés pour l'urgence (0-10)
  const urgencyKeywords = {
    high: ['urgent', 'immédiat', 'asap', 'rapidement', 'tout de suite', 'deadline', 'échéance', 'critique', 'bloquant'],
    medium: ['bientôt', 'prochainement', 'dans la semaine', 'important', 'nécessaire'],
    low: ['plus tard', 'éventuellement', 'à long terme', 'quand possible', 'optionnel']
  }
  // Mots-clés pour l'impact business (0-10)
  const impactKeywords = {
    high: ['chiffre d\'affaires', 'revenus', 'clients', 'croissance', 'stratégique', 'transformation', 'innovation', 'concurrence', 'marché'],
    medium: ['amélioration', 'optimisation', 'efficacité', 'qualité', 'processus', 'équipe'],
    low: ['documentation', 'organisation', 'maintenance', 'nettoyage', 'archivage']
  }
  // Mots-clés pour la complexité (0-10, inversé pour le score)
  const complexityKeywords = {
    high: ['développement', 'architecture', 'système', 'intégration', 'migration', 'refactoring', 'technique'],
    medium: ['analyse', 'étude', 'recherche', 'conception', 'design'],
    low: ['simple', 'basique', 'rapide', 'facile', 'direct']
  }
  // Mots-clés stratégiques (0-10)
  const strategicKeywords = {
    high: ['vision', 'mission', 'objectifs', 'stratégie', 'roadmap', 'pivot', 'expansion', 'lancement'],
    medium: ['projet', 'initiative', 'campagne', 'amélioration'],
    low: ['tâche', 'correction', 'ajustement', 'modification']
  }
  // Calcul des scores
  const urgency = calculateKeywordScore(text, urgencyKeywords)
  const impact = calculateKeywordScore(text, impactKeywords)
  const complexity = 10 - calculateKeywordScore(text, complexityKeywords); // Inversé
  const strategic = calculateKeywordScore(text, strategicKeywords)
  // Score global pondéré
  const globalScore = (urgency * 0.3) + (impact * 0.4) + (complexity * 0.1) + (strategic * 0.2)
  // Détermination de la priorité
  let priority: 'high' | 'medium' | 'low'
  if (globalScore >= 7) {
    priority = 'high'
  } else if (globalScore >= 4) {
    priority = 'medium'
  } else {
    priority = 'low'
  }

  // Génération du raisonnement
  const reasoning = generateReasoning(priority, { urgency, impact, complexity, strategic }, text)
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
  }
}

function calculateKeywordScore(text: string, keywords: { high: string[], medium: string[], low: string[] }): number {
  let score = 0
  keywords.high.forEach(keyword => {
    if (text.includes(keyword)) score += 3
  })
  keywords.medium.forEach(keyword => {
    if (text.includes(keyword)) score += 2
  })
  keywords.low.forEach(keyword => {
    if (text.includes(keyword)) score += 1
  })
  return Math.min(score, 10); // Cap à 10
}

function generateReasoning(
  priority: 'high' | 'medium' | 'low',
  factors: { urgency: number, impact: number, complexity: number, strategic: number },
  text: string
): string {
  const reasons = []
  // Analyse de l'urgence
  if (factors.urgency >= 7) {
    reasons.push("🔥 Urgence élevée détectée")
  } else if (factors.urgency >= 4) {
    reasons.push("⏰ Urgence modérée")
  } else {
    reasons.push("📅 Pas d'urgence particulière")
  }

  // Analyse de l'impact
  if (factors.impact >= 7) {
    reasons.push("💎 Impact business majeur")
  } else if (factors.impact >= 4) {
    reasons.push("📈 Impact business modéré")
  } else {
    reasons.push("🔧 Impact opérationnel")
  }

  // Analyse stratégique
  if (factors.strategic >= 7) {
    reasons.push("🎯 Enjeu stratégique critique")
  } else if (factors.strategic >= 4) {
    reasons.push("📊 Importance tactique")
  }

  // Analyse de la complexité
  if (factors.complexity <= 3) {
    reasons.push("⚡ Complexité élevée identifiée")
  } else if (factors.complexity <= 6) {
    reasons.push("🔄 Complexité modérée")
  } else {
    reasons.push("✅ Implémentation simple")
  }

  const priorityLabels = {
    high: "HAUTE - Action immédiate requise",
    medium: "MOYENNE - Planification nécessaire",
    low: "BASSE - À traiter selon disponibilité"
  }
  return `PriorityBot recommande une priorité ${priorityLabels[priority]}.\n\n${reasons.join(' • ')}`
}

// Fonction pour obtenir une évaluation avec prompt GPT (optionnel, pour cas complexes)
export async function getAIPriorityEvaluation(objective: string, context?: string): Promise<PriorityEvaluation> {
  const prompt = `En tant que PriorityBot, expert en priorisation de missions business, analyse cette mission et détermine sa priorité.

Mission: ${objective}
${context ? `Contexte: ${context}` : ''}

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
}`
  try {
    const response = await fetch('/api/openai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        maxTokens: 500,
        temperature: 0.3
      })
    })
    const data = await response.json()
    return JSON.parse(data.response)
  } catch (error) {
    // Fallback vers l'évaluation locale
    console.warn('Fallback vers évaluation locale:', error)
    return evaluatePriority(objective, context)
  }
}
