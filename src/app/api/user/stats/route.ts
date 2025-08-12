import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    // Récupérer l'utilisateur depuis la base de données
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        accounts: {
          select: {
            provider: true
          }
        }
      }
    })
    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 })
    }

    // Compter les missions de l'utilisateur
    const totalMissions = await prisma.mission.count({
      where: {
        // Note: Ajuster selon votre schéma de base de données
        // Si vous avez un champ userId dans Mission, utilisez-le
        source: "manual" // Temporaire - adapter selon votre logique
      }
    })
    const completedMissions = await prisma.mission.count({
      where: {
        status: "notified",
        source: "manual"
      }
    })
    // Statistiques utilisateur
    const userStats = {
      totalMissions,
      completedMissions,
      subscriptionStatus: "trial", // À adapter selon votre système d'abonnement
      planId: "free",
      joinDate: user.createdAt.toISOString(),
      provider: user.accounts[0]?.provider || "google"
    }
    return NextResponse.json(userStats)
  } catch (error) {
    console.error("Erreur lors de la récupération des stats utilisateur:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
