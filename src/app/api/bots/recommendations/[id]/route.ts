import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const recommendation = await prisma.botRecommendation.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      },
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

    if (!recommendation) {
      return NextResponse.json({ error: 'Recommandation non trouvée' }, { status: 404 });
    }

    return NextResponse.json(recommendation);

  } catch (error) {
    console.error('Erreur lors de la récupération de la recommandation:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const { status, implementationNotes } = body;

    // Vérifier que la recommandation appartient à l'utilisateur
    const existingRecommendation = await prisma.botRecommendation.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      }
    });

    if (!existingRecommendation) {
      return NextResponse.json({ error: 'Recommandation non trouvée' }, { status: 404 });
    }

    // Mettre à jour la recommandation
    const updatedRecommendation = await prisma.botRecommendation.update({
      where: { id: params.id },
      data: {
        status: status || existingRecommendation.status,
        implementationNotes: implementationNotes || existingRecommendation.implementationNotes
      },
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

    return NextResponse.json(updatedRecommendation);

  } catch (error) {
    console.error('Erreur lors de la mise à jour de la recommandation:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Vérifier que la recommandation appartient à l'utilisateur
    const existingRecommendation = await prisma.botRecommendation.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      }
    });

    if (!existingRecommendation) {
      return NextResponse.json({ error: 'Recommandation non trouvée' }, { status: 404 });
    }

    // Supprimer la recommandation
    await prisma.botRecommendation.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Recommandation supprimée' });

  } catch (error) {
    console.error('Erreur lors de la suppression de la recommandation:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
