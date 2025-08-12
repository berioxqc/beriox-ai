import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    // Vérifier si l'utilisateur est super admin
    if (session.user.email !== 'info@beriox.ca') {
      return NextResponse.json({ error: "Accès refusé - Super Admin requis" }, { status: 403 })
    }

    console.log(`🗑️ RESET initié par ${session.user.email} à ${new Date().toISOString()}`)
    // Supprimer les données dans l'ordre correct (en respectant les contraintes de clés étrangères)
    console.log('Suppression des ExecutionLogs...')
    await prisma.executionLog.deleteMany()
    console.log('Suppression des WebhookEvents...')
    await prisma.webhookEvent.deleteMany()
    console.log('Suppression des Reports...')
    await prisma.report.deleteMany()
    console.log('Suppression des Deliverables...')
    await prisma.deliverable.deleteMany()
    console.log('Suppression des Briefs...')
    await prisma.brief.deleteMany()
    console.log('Suppression des Missions...')
    await prisma.mission.deleteMany()
    console.log('Suppression des AnalyticsConnections...')
    await prisma.analyticsConnection.deleteMany()
    // Optionnel: Reset des AgentPrompts (décommente si nécessaire)
    // console.log('Suppression des AgentPrompts...')
    // await prisma.agentPrompt.deleteMany()
    console.log('✅ RESET terminé avec succès')
    return NextResponse.json({ 
      success: true,
      message: "Base de données resetée avec succès",
      timestamp: new Date().toISOString(),
      deletedBy: session.user.email
    })
  } catch (error) {
    console.error('❌ Erreur lors du reset de la base de données:', error)
    return NextResponse.json(
      { 
        error: "Erreur lors du reset de la base de données",
        details: error instanceof Error ? error.message : "Erreur inconnue"
      },
      { status: 500 }
    )
  }
}
