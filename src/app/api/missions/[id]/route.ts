import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: missionId } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Récupérer l'apos;utilisateur pour vérifier son rôle
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true }
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    // Récupérer la mission
    const mission = await prisma.mission.findUnique({
      where: { id: missionId },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    if (!mission) {
      return NextResponse.json({ error: "Mission non trouvée" }, { status: 404 });
    }

    // Vérifier les permissions
    // Les super admins peuvent voir toutes les missions
    // Les utilisateurs normaux ne peuvent voir que leurs propres missions
    if (user.role !== 'apos;SUPER_ADMIN'apos; && mission.userId !== user.id) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
    }

    // Récupérer les briefs, livrables et rapport
    const [briefs, deliverables, report] = await Promise.all([
      prisma.brief.findMany({
        where: { missionId },
        orderBy: { createdAt: 'apos;asc'apos; }
      }),
      prisma.deliverable.findMany({
        where: { missionId },
        orderBy: { createdAt: 'apos;asc'apos; }
      }),
      prisma.report.findFirst({
        where: { missionId },
        orderBy: { createdAt: 'apos;desc'apos; }
      })
    ]);

    return NextResponse.json({
      mission,
      briefs,
      deliverables,
      report
    });

  } catch (error) {
    console.error("Erreur lors du chargement de la mission:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}