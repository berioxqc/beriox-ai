import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { logger } from "@/lib/logger";

// Agents disponibles avec leurs spécialités
const AGENTS_SPECIALTIES = {
  "KarineAI": {
    name: "Karine",
    role: "Stratège Marketing",
    specialties: ["stratégie", "marketing", "planification", "analyse", "optimisation", "croissance"],
    description: "Spécialiste en stratégie marketing et planification"
  },
  "HugoAI": {
    name: "Hugo",
    role: "Créatif & Designer",
    specialties: ["design", "créativité", "ui/ux", "visuel", "concept", "storytelling", "branding"],
    description: "Expert en design créatif et expérience utilisateur"
  },
  "JPBot": {
    name: "JP",
    role: "Analyste Data",
    specialties: ["analyse", "data", "performance", "métriques", "optimisation", "reporting", "insights"],
    description: "Analyste de données et performance"
  },
  "ElodieAI": {
    name: "Élodie",
    role: "Rédactrice",
    specialties: ["rédaction", "contenu", "seo", "communication", "copywriting", "blog", "article"],
    description: "Rédactrice SEO et experte en contenu"
  },
  "ClaraLaCloseuse": {
    name: "Clara",
    role: "Experte Conversion",
    specialties: ["conversion", "vente", "persuasion", "cta", "funnel", "closing", "optimisation"],
    description: "Spécialiste en conversion et optimisation des ventes"
  },
  "FauconLeMaitreFocus": {
    name: "Faucon",
    role: "Coach Productivité",
    specialties: ["productivité", "focus", "optimisation", "efficacité", "organisation", "workflow"],
    description: "Coach en productivité et optimisation des processus"
  }
};

// Fonction pour analyser le texte et calculer un score de pertinence
function calculateRelevanceScore(text: string, specialties: string[]): number {
  const lowerText = text.toLowerCase();
  let score = 0;
  
  for (const specialty of specialties) {
    if (lowerText.includes(specialty.toLowerCase())) {
      score += 1;
    }
  }
  
  // Bonus pour les mots-clés forts
  const strongKeywords = {
    "stratégie": 2,
    "marketing": 2,
    "design": 2,
    "analyse": 2,
    "rédaction": 2,
    "conversion": 2,
    "productivité": 2,
    "seo": 3,
    "ui/ux": 3,
    "data": 3,
    "performance": 3,
    "optimisation": 3
  };
  
  for (const [keyword, bonus] of Object.entries(strongKeywords)) {
    if (lowerText.includes(keyword.toLowerCase())) {
      score += bonus;
    }
  }
  
  return score;
}

// Fonction pour recommander des agents basée sur l'objectif et le contexte
function recommendAgents(objective: string, context: string = ""): {
  recommendedAgents: string[];
  reasoning: string;
} {
  const fullText = `${objective} ${context}`.toLowerCase();
  
  // Calculer les scores pour chaque agent
  const agentScores: { [key: string]: number } = {};
  
  for (const [agentName, agentInfo] of Object.entries(AGENTS_SPECIALTIES)) {
    const score = calculateRelevanceScore(fullText, agentInfo.specialties);
    agentScores[agentName] = score;
  }
  
  // Trier les agents par score décroissant
  const sortedAgents = Object.entries(agentScores)
    .sort(([,a], [,b]) => b - a)
    .filter(([,score]) => score > 0);
  
  // Sélectionner les 3-4 agents les plus pertinents
  const recommendedAgents = sortedAgents
    .slice(0, 4)
    .map(([agentName]) => agentName);
  
  // Générer le raisonnement
  const reasoning = generateReasoning(objective, context, recommendedAgents);
  
  return {
    recommendedAgents: recommendedAgents.length > 0 ? recommendedAgents : ["KarineAI", "HugoAI", "JPBot", "ElodieAI"],
    reasoning
  };
}

// Fonction pour générer un raisonnement explicatif
function generateReasoning(objective: string, context: string, agents: string[]): string {
  const agentDescriptions = agents.map(agent => {
    const info = AGENTS_SPECIALTIES[agent as keyof typeof AGENTS_SPECIALTIES];
    return `${info.name} (${info.role})`;
  });
  
  if (agents.length === 0) {
    return "Analyse non disponible, utilisation de l'équipe par défaut";
  }
  
  const objectiveLower = objective.toLowerCase();
  
  // Logique de raisonnement basée sur le contenu
  if (objectiveLower.includes("seo") || objectiveLower.includes("contenu") || objectiveLower.includes("article")) {
    return `Équipe optimisée pour le contenu : ${agentDescriptions.join(", ")} - Focus sur la création de contenu SEO et l'optimisation`;
  }
  
  if (objectiveLower.includes("design") || objectiveLower.includes("ui") || objectiveLower.includes("visuel")) {
    return `Équipe créative : ${agentDescriptions.join(", ")} - Spécialisation en design et expérience utilisateur`;
  }
  
  if (objectiveLower.includes("marketing") || objectiveLower.includes("stratégie")) {
    return `Équipe stratégique : ${agentDescriptions.join(", ")} - Expertise en stratégie marketing et planification`;
  }
  
  if (objectiveLower.includes("analyse") || objectiveLower.includes("data") || objectiveLower.includes("performance")) {
    return `Équipe analytique : ${agentDescriptions.join(", ")} - Focus sur l'analyse de données et l'optimisation`;
  }
  
  if (objectiveLower.includes("conversion") || objectiveLower.includes("vente")) {
    return `Équipe conversion : ${agentDescriptions.join(", ")} - Spécialisation en optimisation des conversions`;
  }
  
  if (objectiveLower.includes("productivité") || objectiveLower.includes("efficacité")) {
    return `Équipe optimisation : ${agentDescriptions.join(", ")} - Focus sur l'amélioration de la productivité`;
  }
  
  return `Équipe équilibrée : ${agentDescriptions.join(", ")} - Combinaison optimale pour cette mission`;
}

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { objective, context } = await request.json();

    if (!objective || typeof objective !== 'string') {
      return NextResponse.json({ error: "Objectif requis" }, { status: 400 });
    }

    // Analyser et recommander des agents
    const analysis = recommendAgents(objective, context || "");

    // Logger l'analyse
    logger.info('Mission analysis completed', {
      user: session.user.email,
      objective: objective.substring(0, 100),
      recommendedAgents: analysis.recommendedAgents,
      reasoning: analysis.reasoning
    });

    return NextResponse.json({
      success: true,
      recommendedAgents: analysis.recommendedAgents,
      reasoning: analysis.reasoning,
      analysis: {
        objective: objective.substring(0, 200),
        context: context ? context.substring(0, 200) : null,
        agentCount: analysis.recommendedAgents.length
      }
    });

  } catch (error) {
    logger.error('Mission analysis error', error as Error, {
      endpoint: '/api/missions/analyze'
    });

    return NextResponse.json(
      { error: "Erreur lors de l'analyse" },
      { status: 500 }
    );
  }
}
