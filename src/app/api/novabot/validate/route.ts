import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { NovaBotService } from "@/lib/novabot";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { missionId } = await req.json();

    if (!missionId) {
      return NextResponse.json({ error: "ID de mission requis" }, { status: 400 });
    }

    // Récupérer la mission depuis la base de données
    const mission = await prisma.mission.findUnique({
      where: { id: missionId },
      include: { user: true }
    });

    if (!mission) {
      return NextResponse.json({ error: "Mission introuvable" }, { status: 404 });
    }

    // Vérifier que l'apos;utilisateur est propriétaire de la mission
    if (mission.user.email !== session.user.email) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
    }

    // Vérifier que c'apos;est une mission NovaBot
    if (!mission.metadata || mission.metadata.type !== 'apos;novabot'apos;) {
      return NextResponse.json({ error: "Cette mission n'apos;est pas une mission NovaBot" }, { status: 400 });
    }

    // Extraire les données NovaBot
    const novaData = mission.metadata.novaData;

    // Valider avec JPBot
    const validation = await NovaBotService.validateWithJPBot(novaData);

    // Mettre à jour le statut de la mission
    const newStatus = validation.validated ? 'apos;validated'apos; : 'apos;rejected'apos;;
    
    await prisma.mission.update({
      where: { id: missionId },
      data: {
        status: newStatus,
        metadata: {
          ...mission.metadata,
          jpbValidation: {
            validated: validation.validated,
            feedback: validation.feedback,
            suggestions: validation.suggestions,
            validatedAt: new Date()
          }
        }
      }
    });

    console.log(`✅ Mission NovaBot validée par JPBot: ${mission.objective} - ${validation.validated ? 'apos;APPROUVÉE'apos; : 'apos;REJETÉE'apos;}`);

    return NextResponse.json({
      success: true,
      validation: {
        ...validation,
        missionStatus: newStatus
      }
    });

  } catch (error: any) {
    console.error('apos;Erreur validation JPBot:'apos;, error);
    return NextResponse.json({ 
      error: "Erreur lors de la validation",
      details: error.message
    }, { status: 500 });
  }
}
