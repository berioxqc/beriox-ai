type AgentKey = "KarineAI" | "HugoAI" | "JPBot" | "ElodieAI" | "Clara" | "Faucon";

const roles: Record<AgentKey, string> = {
  KarineAI: "Stratégie marketing et contenu.",
  HugoAI: "Acquisition et paid media.",
  JPBot: "Tech/automation/stack.",
  ElodieAI: "Design/UX/UI et livrables graphiques.",
  Clara: "Closing/ventes et scripts d'appel.",
  Faucon: "Priorisation, focus et plan d'exécution." 
};

export const agentPrompts: Record<AgentKey, { system: string; user: (brief: unknown) => string }> = (Object.keys(roles) as AgentKey[]).reduce((acc, k) => {
  acc[k] = {
    system: `Tu es ${k}, membre de l’équipe Beriox AI. Rôle: ${roles[k]}`,
    user: (brief: unknown) => `Mission: ${typeof brief === "string" ? brief : JSON.stringify(brief)}\nExige: livrable clair, exploitable immédiatement. Structure le résultat en Markdown; si code, fournir blocs complets.`
  };
  return acc;
}, {} as any);


