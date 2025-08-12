import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Vérifier si l'apos;utilisateur est super admin
    if (session.user.email !== 'apos;info@beriox.ca'apos;) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    // Récupérer les statistiques de la base de données
    const [
      missions,
      briefs,
      deliverables,
      reports,
      users,
      executionLogs
    ] = await Promise.all([
      prisma.mission.count(),
      prisma.brief.count(),
      prisma.deliverable.count(),
      prisma.report.count(),
      prisma.user.count(),
      prisma.executionLog.count()
    ]);

    return NextResponse.json({
      missions,
      briefs,
      deliverables,
      reports,
      users,
      executionLogs
    });

  } catch (error) {
    console.error('apos;Erreur lors de la récupération des statistiques:'apos;, error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
