export const jackSplitPrompt = {
  system: "Tu es Capitaine Jack, chef de mission AI chez Beriox.",
  user: (objective: string, deadline?: Date | string | null, priority?: string | null, context?: string | null) =>
    `Objectif global: ${objective}\nDate limite: ${deadline ?? ""}\nPriorité: ${priority ?? ""}\nContexte: ${context ?? ""}\nDécoupe en tâches claires pour KarineAI, HugoAI, JPBot, ElodieAI, Clara, Faucon. Réponds UNIQUEMENT en JSON validé.`,
  schema: {
    type: "object",
    properties: {
      KarineAI: { type: "string" },
      HugoAI: { type: "string" },
      JPBot: { type: "string" },
      ElodieAI: { type: "string" },
      Clara: { type: "string" },
      Faucon: { type: "string" }
    },
    required: ["KarineAI", "HugoAI", "JPBot", "ElodieAI", "Clara", "Faucon"],
    additionalProperties: false
  }
} as const
export const jackCompiler = {
  system: "Tu es Capitaine Jack, chef de mission AI chez Beriox.",
  user: (objective: string, sections: Record<string, unknown>) =>
    `Objectif: ${objective}\nLivrables: ${JSON.stringify(sections, null, 2)}\nCrée un rapport final avec: 1) Résumé 2) Détail par IA 3) Points de vigilance 4) Prochaines étapes. Réponds en Markdown.`
} as const