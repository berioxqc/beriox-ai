import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const refundRequestSchema = z.object({
  missionId: z.string().optional(),
  amount: z.number().min(1).max(10), // Max 10 crédits par demande
  reason: z.enum(["QUALITY_ISSUE", "TECHNICAL_PROBLEM", "NOT_SATISFIED", "DUPLICATE_CHARGE", "OTHER"]),
  description: z.string().min(10).max(1000)
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = refundRequestSchema.parse(body);

    // Récupérer l'apos;utilisateur et ses crédits
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { userCredits: true }
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    // Créer les crédits utilisateur s'apos;ils n'apos;existent pas
    let userCredits = user.userCredits;
    if (!userCredits) {
      const planId = user.planId || "free";
      const creditsLimit = planId === "free" ? 5 : planId === "pro" ? 50 : 200;
      
      userCredits = await prisma.userCredits.create({
        data: {
          userId: user.id,
          planId,
          creditsLimit,
          resetDate: new Date(), // Reset le jour de l'apos;abonnement
          creditsUsed: 0
        }
      });
    }

    // Vérifier que l'apos;utilisateur a assez de crédits utilisés pour demander un remboursement
    if (userCredits.creditsUsed < validatedData.amount) {
      return NextResponse.json({ 
        error: "Vous ne pouvez pas demander un remboursement pour plus de crédits que vous n'apos;en avez utilisés" 
      }, { status: 400 });
    }

    // Créer la demande de remboursement
    const refundRequest = await prisma.refundRequest.create({
      data: {
        userId: user.id,
        missionId: validatedData.missionId,
        amount: validatedData.amount,
        reason: validatedData.reason,
        description: validatedData.description,
        userCreditsId: userCredits.id
      }
    });

    return NextResponse.json({
      success: true,
      refundRequest: {
        id: refundRequest.id,
        status: refundRequest.status,
        amount: refundRequest.amount,
        reason: refundRequest.reason,
        createdAt: refundRequest.createdAt
      },
      message: "Demande de remboursement soumise avec succès. Elle sera traitée dans les 24-48h."
    });

  } catch (error) {
    console.error("Erreur lors de la demande de remboursement:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: "Données invalides", 
        details: error.errors 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      error: "Erreur interne du serveur" 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        refundRequests: {
          orderBy: { createdAt: 'apos;desc'apos; },
          take: 10
        },
        userCredits: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      refundRequests: user.refundRequests,
      userCredits: user.userCredits
    });

  } catch (error) {
    console.error("Erreur lors de la récupération des remboursements:", error);
    return NextResponse.json({ 
      error: "Erreur interne du serveur" 
    }, { status: 500 });
  }
}
