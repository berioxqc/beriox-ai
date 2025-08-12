import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { BotRecommendationEngine } from '@/lib/bot-recommendations';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const priority = searchParams.get('priority');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

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
        { priority: 'desc' },
        { createdAt: 'desc' }
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
    console.error('Erreur lors de la récupération des recommandations:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
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
    console.error('Erreur lors de la génération des recommandations:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
