import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const processRefundSchema = z.object({
  refundId: z.string(),
  status: z.enum(["APPROVED", "REJECTED"]),
  adminNotes: z.string().optional()
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email || session.user.email !== "info@beriox.ca") {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Construire les filtres
    const where: any = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }

    const [refunds, total] = await Promise.all([
      prisma.refundRequest.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              planId: true
            }
          },
          userCredits: {
            select: {
              creditsUsed: true,
              creditsLimit: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit
      }),
      prisma.refundRequest.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      refunds,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error("Erreur lors de la récupération des remboursements:", error);
    return NextResponse.json({ 
      error: "Erreur interne du serveur" 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email || session.user.email !== "info@beriox.ca") {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = processRefundSchema.parse(body);

    // Récupérer la demande de remboursement
    const refundRequest = await prisma.refundRequest.findUnique({
      where: { id: validatedData.refundId },
      include: {
        user: true,
        userCredits: true
      }
    });

    if (!refundRequest) {
      return NextResponse.json({ error: "Demande de remboursement non trouvée" }, { status: 404 });
    }

    if (refundRequest.status !== "PENDING") {
      return NextResponse.json({ error: "Cette demande a déjà été traitée" }, { status: 400 });
    }

    // Traiter le remboursement
    const updateData: any = {
      status: validatedData.status,
      reviewedBy: session.user.email,
      reviewedAt: new Date(),
      adminNotes: validatedData.adminNotes
    };

    // Si approuvé, rembourser les crédits
    if (validatedData.status === "APPROVED") {
      await prisma.$transaction([
        // Mettre à jour la demande
        prisma.refundRequest.update({
          where: { id: validatedData.refundId },
          data: updateData
        }),
        // Rembourser les crédits
        prisma.userCredits.update({
          where: { id: refundRequest.userCreditsId },
          data: {
            creditsUsed: {
              decrement: refundRequest.amount
            }
          }
        })
      ]);
    } else {
      // Si rejeté, juste mettre à jour le statut
      await prisma.refundRequest.update({
        where: { id: validatedData.refundId },
        data: updateData
      });
    }

    return NextResponse.json({
      success: true,
      message: `Demande de remboursement ${validatedData.status === "APPROVED" ? "approuvée" : "rejetée"} avec succès`
    });

  } catch (error) {
    console.error("Erreur lors du traitement du remboursement:", error);
    
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
