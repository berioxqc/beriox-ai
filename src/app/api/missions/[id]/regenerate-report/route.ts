import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
export const runtime = "nodejs"
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const missionId = params.id
    console.log(`🔄 Régénération du rapport pour la mission ${missionId}`)
    // Récupérer la mission et les livrables
    const mission = await prisma.mission.findUnique({ 
      where: { id: missionId },
      include: {
        deliverables: true
      }
    })
    if (!mission) {
      return NextResponse.json({ error: "Mission non trouvée" }, { status: 404 })
    }

    // Supprimer l'ancien rapport s'il existe
    await prisma.report.deleteMany({
      where: { missionId }
    })
    // Agents ayant produit des livrables
    const activeAgents = mission.deliverables
      .filter(d => d.agent !== "PriorityBot")
      .map(d => d.agent)
    const uniqueAgents = [...new Set(activeAgents)]
    // Créer un nouveau rapport basé sur les livrables existants
    const report = await prisma.report.create({
      data: {
        missionId,
        summary: `Rapport de mission : ${mission.objective}`,
        detailsMd: `# 📋 Rapport de Mission

**Objectif :** ${mission.objective}

**Statut :** Mission terminée avec ${uniqueAgents.length} agent${uniqueAgents.length > 1 ? 's' : ''} mobilisé${uniqueAgents.length > 1 ? 's' : ''}

---

## 🎯 Résultats par équipe

${uniqueAgents.map(agent => {
  const agentInfo = getAgentInfo(agent)
  return `### ${agentInfo.emoji} ${agent} - ${agentInfo.role}
**Spécialité :** ${agentInfo.specialty}
✅ Livrable produit et validé
`
}).join('\n')}

---

## 📊 Synthèse

Cette mission a été traitée par ${uniqueAgents.length} spécialiste${uniqueAgents.length > 1 ? 's' : ''} de notre équipe IA. Chaque agent a apporté son expertise unique pour répondre à l'objectif défini.

### 🔍 Points de vigilance
- Suivi recommandé des livrables
- Validation des résultats par l'équipe
- Mesure de l'impact des recommandations

### 🚀 Prochaines étapes recommandées
1. **Mise en œuvre** des recommandations prioritaires
2. **Suivi des KPIs** définis par chaque agent
3. **Ajustements** basés sur les premiers résultats
4. **Évaluation** de l'efficacité après 30 jours

---

*Rapport généré automatiquement par Beriox AI • ${new Date().toLocaleDateString('fr-FR', { 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
})}*`
      }
    })
    // Mettre à jour le statut de la mission si nécessaire
    if (mission.status !== "notified") {
      await prisma.mission.update({
        where: { id: missionId },
        data: { status: "notified" }
      })
    }

    console.log(`✅ Rapport régénéré avec succès pour la mission ${missionId}`)
    return NextResponse.json({ 
      success: true, 
      message: "Rapport régénéré avec succès",
      report 
    })
  } catch (error) {
    console.error("Regenerate Report Error:", error)
    return NextResponse.json({ 
      error: "Erreur lors de la régénération du rapport" 
    }, { status: 500 })
  }
}

// Fonction helper pour obtenir les infos des agents
function getAgentInfo(agentName: string) {
  const agents = {
    "KarineAI": {
      emoji: "🎯",
      role: "Stratège Marketing",
      specialty: "Analyse de marché & Positionnement"
    },
    "HugoAI": {
      emoji: "🎨", 
      role: "Créatif & Designer",
      specialty: "Concepts visuels & Storytelling"
    },
    "JPBot": {
      emoji: "📊",
      role: "Analyste Data",
      specialty: "Performance & Insights"
    },
    "ElodieAI": {
      emoji: "✍️",
      role: "Rédactrice & Content",
      specialty: "SEO & Communication"
    },
    "ClaraLaCloseuse": {
      emoji: "💰",
      role: "Experte Conversion",
      specialty: "Closing & Persuasion"
    },
    "FauconLeMaitreFocus": {
      emoji: "🦅",
      role: "Coach Productivité",
      specialty: "Focus & Optimisation"
    }
  }
  return agents[agentName as keyof typeof agents] || { 
    emoji: "❓", 
    role: "Inconnu", 
    specialty: "Inconnu" 
  }
}
