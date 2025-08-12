import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { NovaBotService, DataSource, MissionHistory } from "@/lib/novabot";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        premiumAccess: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    // Vérifier si l'apos;utilisateur peut utiliser NovaBot (fonctionnalité premium)
    const basePlan = user.planId || 'apos;free'apos;;
    const hasPremiumAccess = user.premiumAccess && 
      user.premiumAccess.isActive && 
      user.premiumAccess.endDate > new Date();

    if (basePlan === 'apos;free'apos; && !hasPremiumAccess) {
      return NextResponse.json({ 
        error: "NovaBot est réservé aux plans premium",
        upgradeRequired: true,
        upgradeUrl: "/pricing"
      }, { status: 403 });
    }

    const { dataSources, userContext } = await req.json();

    // Récupérer l'apos;historique des missions de l'apos;utilisateur
    const userMissions = await prisma.mission.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        objective: true,
        createdAt: true,
        status: true
      },
      orderBy: { createdAt: 'apos;desc'apos; },
      take: 50 // Dernières 50 missions
    });

    // Convertir en format MissionHistory
    const missionHistory: MissionHistory[] = userMissions.map(mission => ({
      id: mission.id,
      title: mission.objective.substring(0, 100),
      objectif: mission.objective,
      tags: [], // À implémenter plus tard
      resultat: mission.status === 'apos;completed'apos; ? 'apos;success'apos; : 
                mission.status === 'apos;failed'apos; ? 'apos;failure'apos; : 'apos;partial'apos;,
      notes: 'apos;'apos;,
      createdAt: mission.createdAt
    }));

    // Générer la mission avec NovaBot
    const novaMission = await NovaBotService.generateMission(
      dataSources || [],
      missionHistory,
      userContext || {
        industry: 'apos;general'apos;,
        goals: ['apos;growth'apos;, 'apos;optimization'apos;],
        currentPlan: basePlan
      }
    );

    // Sauvegarder la mission NovaBot dans la base de données
    const savedMission = await prisma.mission.create({
      data: {
        objective: novaMission.title,
        status: 'apos;pending'apos;,
        userId: user.id,
        metadata: {
          type: 'apos;novabot'apos;,
          novaData: novaMission,
          sources: novaMission.sources,
          impact: novaMission.impactEstime,
          effort: novaMission.effortEstime,
          priority: novaMission.priorite,
          tags: novaMission.tags
        }
      }
    });

    console.log(`✅ Mission NovaBot générée pour ${user.email}: ${novaMission.title}`);

    return NextResponse.json({
      success: true,
      mission: {
        ...novaMission,
        dbId: savedMission.id
      }
    });

  } catch (error: any) {
    console.error('apos;Erreur génération mission NovaBot:'apos;, error);
    
    if (error.message.includes("Aucune nouvelle opportunité")) {
      return NextResponse.json({
        success: false,
        message: "Aucune nouvelle opportunité détectée dans vos données actuelles",
        suggestion: "Vérifiez vos sources de données ou attendez de nouvelles données"
      }, { status: 200 });
    }

    return NextResponse.json({ 
      error: "Erreur lors de la génération de la mission",
      details: error.message
    }, { status: 500 });
  }
}
