import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// Configuration par défaut des agents
const defaultAgents = [
  { id: "karine", name: "KarineAI", active: true },
  { id: "hugo", name: "HugoAI", active: true },
  { id: "jpbot", name: "JPBot", active: true },
  { id: "elodie", name: "ElodieAI", active: true },
  { id: "clara", name: "ClaraLaCloseuse", active: false },
  { id: "faucon", name: "FauconLeMaitreFocus", active: false },
  { id: "prioritybot", name: "PriorityBot", active: true }
];

export async function GET(req: NextRequest) {
  try {
    // Pour l'instant, on retourne la configuration par défaut
    // Dans le futur, on pourrait stocker cela en base de données par utilisateur
    const activeAgents = defaultAgents.filter(agent => agent.active && agent.id !== "prioritybot");
    
    return NextResponse.json({ 
      agents: defaultAgents,
      activeAgents: activeAgents.map(a => a.name)
    });
  } catch (error) {
    console.error("GET Agents Config Error:", error);
    return NextResponse.json({ 
      agents: defaultAgents,
      activeAgents: ["KarineAI", "HugoAI", "JPBot", "ElodieAI"]
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { agents } = await req.json();
    
    // Pour l'instant, on simule juste le succès
    // Dans le futur, on sauvegarderait en base de données par utilisateur
    console.log("Agents config updated:", agents);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST Agents Config Error:", error);
    return NextResponse.json({ error: "Erreur de sauvegarde" }, { status: 500 });
  }
}
