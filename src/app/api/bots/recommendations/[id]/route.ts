import { NextRequest, NextResponse } from 'apos;next/server'apos;;
import { getServerSession } from 'apos;next-auth'apos;;
import { authOptions } from 'apos;@/app/api/auth/[...nextauth]/route'apos;;
import { prisma } from 'apos;@/lib/prisma'apos;;

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'apos;Non autorisé'apos; }, { status: 401 });
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
      return NextResponse.json({ error: 'apos;Recommandation non trouvée'apos; }, { status: 404 });
    }

    return NextResponse.json(recommendation);

  } catch (error) {
    console.error('apos;Erreur lors de la récupération de la recommandation:'apos;, error);
    return NextResponse.json(
      { error: 'apos;Erreur interne du serveur'apos; },
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
      return NextResponse.json({ error: 'apos;Non autorisé'apos; }, { status: 401 });
    }

    const body = await request.json();
    const { status, implementationNotes } = body;

    // Vérifier que la recommandation appartient à l'apos;utilisateur
    const existingRecommendation = await prisma.botRecommendation.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      }
    });

    if (!existingRecommendation) {
      return NextResponse.json({ error: 'apos;Recommandation non trouvée'apos; }, { status: 404 });
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
    console.error('apos;Erreur lors de la mise à jour de la recommandation:'apos;, error);
    return NextResponse.json(
      { error: 'apos;Erreur interne du serveur'apos; },
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
      return NextResponse.json({ error: 'apos;Non autorisé'apos; }, { status: 401 });
    }

    // Vérifier que la recommandation appartient à l'apos;utilisateur
    const existingRecommendation = await prisma.botRecommendation.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      }
    });

    if (!existingRecommendation) {
      return NextResponse.json({ error: 'apos;Recommandation non trouvée'apos; }, { status: 404 });
    }

    // Supprimer la recommandation
    await prisma.botRecommendation.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'apos;Recommandation supprimée'apos; });

  } catch (error) {
    console.error('apos;Erreur lors de la suppression de la recommandation:'apos;, error);
    return NextResponse.json(
      { error: 'apos;Erreur interne du serveur'apos; },
      { status: 500 }
    );
  }
}
