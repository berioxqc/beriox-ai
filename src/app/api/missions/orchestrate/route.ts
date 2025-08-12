import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { aiOrchestrator, MissionContext } from "@/lib/ai-orchestration";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

/**
 * POST /api/missions/orchestrate
 * Orchestre une mission avec le système d'apos;IA avancé
 */
export async function POST(request: NextRequest) {
  try {
    // Vérifier l'apos;authentification
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Récupérer l'apos;utilisateur
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    // Parser le body de la requête
    const body = await request.json();
    const { missionId } = body;

    if (!missionId) {
      return NextResponse.json({ error: "missionId requis" }, { status: 400 });
    }

    // Récupérer la mission
    const mission = await prisma.mission.findUnique({
      where: { id: missionId, userId: user.id }
    });

    if (!mission) {
      return NextResponse.json({ error: "Mission non trouvée" }, { status: 404 });
    }

    // Créer le contexte de mission
    const missionContext: MissionContext = {
      objective: mission.objective,
      context: mission.context || undefined,
      deadline: mission.deadline,
      priority: mission.priority as 'apos;low'apos; | 'apos;medium'apos; | 'apos;high'apos; | 'apos;critical'apos;,
      expectedOutcome: "Livrables de qualité professionnelle"
    };

    // Orchestrer la mission
    const result = await aiOrchestrator.orchestrateMission(missionId, missionContext);

    if (!result.success) {
      return NextResponse.json({ 
        error: "Erreur lors de l'apos;orchestration", 
        details: result.error 
      }, { status: 500 });
    }

    // Exécuter le plan si l'apos;orchestration a réussi
    const executionSuccess = await aiOrchestrator.executePlan(result.plan!);

    return NextResponse.json({
      success: true,
      orchestration: result,
      executionSuccess,
      plan: result.plan,
      recommendations: result.recommendations
    });

  } catch (error) {
    logger.error("Erreur orchestration mission:", error);
    return NextResponse.json({ 
      error: "Erreur interne du serveur" 
    }, { status: 500 });
  }
}

/**
 * GET /api/missions/orchestrate/:missionId
 * Récupère le plan d'apos;orchestration d'apos;une mission
 */
export async function GET(request: NextRequest) {
  try {
    // Vérifier l'apos;authentification
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Récupérer l'apos;utilisateur
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    // Extraire missionId de l'apos;URL
    const url = new URL(request.url);
    const missionId = url.searchParams.get('apos;missionId'apos;);

    if (!missionId) {
      return NextResponse.json({ error: "missionId requis" }, { status: 400 });
    }

    // Récupérer la mission
    const mission = await prisma.mission.findUnique({
      where: { id: missionId, userId: user.id },
      include: {
        briefs: {
          orderBy: { createdAt: 'apos;asc'apos; }
        },
        deliverables: {
          orderBy: { createdAt: 'apos;asc'apos; }
        }
      }
    });

    if (!mission) {
      return NextResponse.json({ error: "Mission non trouvée" }, { status: 404 });
    }

    // Récupérer le plan d'apos;orchestration s'apos;il existe
    const orchestrationPlan = await prisma.orchestrationPlan.findFirst({
      where: { missionId }
    });

    return NextResponse.json({
      success: true,
      mission,
      orchestrationPlan,
      status: {
        totalBriefs: mission.briefs.length,
        completedBriefs: mission.briefs.filter(b => b.status === 'apos;done'apos;).length,
        totalDeliverables: mission.deliverables.length,
        progress: mission.briefs.length > 0 
          ? (mission.briefs.filter(b => b.status === 'apos;done'apos;).length / mission.briefs.length) * 100 
          : 0
      }
    });

  } catch (error) {
    logger.error("Erreur récupération orchestration:", error);
    return NextResponse.json({ 
      error: "Erreur interne du serveur" 
    }, { status: 500 });
  }
}
