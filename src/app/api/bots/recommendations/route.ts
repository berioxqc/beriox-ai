import { NextRequest, NextResponse } from 'apos;next/server'apos;;
import { getServerSession } from 'apos;next-auth'apos;;
import { authOptions } from 'apos;@/app/api/auth/[...nextauth]/route'apos;;
import { prisma } from 'apos;@/lib/prisma'apos;;
import { BotRecommendationEngine } from 'apos;@/lib/bot-recommendations'apos;;

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'apos;Non autorisé'apos; }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('apos;type'apos;);
    const priority = searchParams.get('apos;priority'apos;);
    const status = searchParams.get('apos;status'apos;);
    const limit = parseInt(searchParams.get('apos;limit'apos;) || 'apos;50'apos;);
    const offset = parseInt(searchParams.get('apos;offset'apos;) || 'apos;0'apos;);

    // Construire les filtres
    const where: unknown = {
      userId: session.user.id
    };

    if (type) where.type = type;
    if (priority) where.priority = priority;
    if (status) where.status = status;

    const recommendations = await prisma.botRecommendation.findMany({
      where,
      orderBy: [
        { priority: 'apos;desc'apos; },
        { createdAt: 'apos;desc'apos; }
      ],
      take: limit,
      skip: offset,
      include: {
        bot: {
          select: {
            id: true,
            name: true,
            type: true
          }
        },
        mission: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    const total = await prisma.botRecommendation.count({ where });

    return NextResponse.json({
      recommendations,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    });

  } catch (error) {
    console.error('apos;Erreur lors de la récupération des recommandations:'apos;, error);
    return NextResponse.json(
      { error: 'apos;Erreur interne du serveur'apos; },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'apos;Non autorisé'apos; }, { status: 401 });
    }

    const body = await request.json();
    const { botId, missionId, forceRegenerate = false } = body;

    // Si forceRegenerate est true, supprimer les anciennes recommandations
    if (forceRegenerate) {
      await prisma.botRecommendation.deleteMany({
        where: {
          userId: session.user.id,
          botId: botId || undefined,
          missionId: missionId || undefined
        }
      });
    }

    // Générer de nouvelles recommandations
    const engine = new BotRecommendationEngine(session.user.id);
    const recommendations = await engine.generateRecommendations();

    // Ajouter les IDs du bot et de la mission si fournis
    if (botId || missionId) {
      recommendations.forEach(rec => {
        if (botId) rec.botId = botId;
        if (missionId) rec.missionId = missionId;
      });
    }

    // Sauvegarder les recommandations
    await engine.saveRecommendations(recommendations);

    return NextResponse.json({
      message: `${recommendations.length} recommandations générées`,
      recommendations: recommendations.length
    });

  } catch (error) {
    console.error('apos;Erreur lors de la génération des recommandations:'apos;, error);
    return NextResponse.json(
      { error: 'apos;Erreur interne du serveur'apos; },
      { status: 500 }
    );
  }
}
