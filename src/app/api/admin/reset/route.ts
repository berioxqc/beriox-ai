import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Vérifier si l'apos;utilisateur est super admin
    if (session.user.email !== 'apos;info@beriox.ca'apos;) {
      return NextResponse.json({ error: "Accès refusé - Super Admin requis" }, { status: 403 });
    }

    console.log(`🗑️ RESET initié par ${session.user.email} à ${new Date().toISOString()}`);

    // Supprimer les données dans l'apos;ordre correct (en respectant les contraintes de clés étrangères)
    console.log('apos;Suppression des ExecutionLogs...'apos;);
    await prisma.executionLog.deleteMany();

    console.log('apos;Suppression des WebhookEvents...'apos;);
    await prisma.webhookEvent.deleteMany();

    console.log('apos;Suppression des Reports...'apos;);
    await prisma.report.deleteMany();

    console.log('apos;Suppression des Deliverables...'apos;);
    await prisma.deliverable.deleteMany();

    console.log('apos;Suppression des Briefs...'apos;);
    await prisma.brief.deleteMany();

    console.log('apos;Suppression des Missions...'apos;);
    await prisma.mission.deleteMany();

    console.log('apos;Suppression des AnalyticsConnections...'apos;);
    await prisma.analyticsConnection.deleteMany();

    // Optionnel: Reset des AgentPrompts (décommente si nécessaire)
    // console.log('apos;Suppression des AgentPrompts...'apos;);
    // await prisma.agentPrompt.deleteMany();

    console.log('apos;✅ RESET terminé avec succès'apos;);

    return NextResponse.json({ 
      success: true,
      message: "Base de données resetée avec succès",
      timestamp: new Date().toISOString(),
      deletedBy: session.user.email
    });

  } catch (error) {
    console.error('apos;❌ Erreur lors du reset de la base de données:'apos;, error);
    return NextResponse.json(
      { 
        error: "Erreur lors du reset de la base de données",
        details: error instanceof Error ? error.message : "Erreur inconnue"
      },
      { status: 500 }
    );
  }
}
