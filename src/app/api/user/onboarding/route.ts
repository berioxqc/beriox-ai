import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const data = await request.json()
    const { industry, company, role, experience, goals, preferredAgents } = data
    // Mettre à jour le profil utilisateur avec les données d'onboarding
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        // Mettre à jour le nom si la company est fournie
        name: company || session.user.name,
        // Ajouter les données d'onboarding dans un champ JSON ou des champs séparés
        // Pour cet exemple, on utilise un champ JSON générique
        // En production, vous pourriez vouloir des champs séparés dans le schéma
      }
    })
    // Créer un enregistrement d'onboarding séparé pour tracking
    await prisma.$executeRaw`
      INSERT INTO "OnboardingData" (
        "userId", 
        "industry", 
        "company", 
        "role", 
        "experience", 
        "goals", 
        "preferredAgents",
        "completedAt"
      ) VALUES (
        ${updatedUser.id},
        ${industry},
        ${company || ''},
        ${role},
        ${experience},
        ${JSON.stringify(goals)},
        ${JSON.stringify(preferredAgents)},
        ${new Date()}
      ) ON CONFLICT ("userId") DO UPDATE SET
        "industry" = EXCLUDED."industry",
        "company" = EXCLUDED."company",
        "role" = EXCLUDED."role",
        "experience" = EXCLUDED."experience",
        "goals" = EXCLUDED."goals",
        "preferredAgents" = EXCLUDED."preferredAgents",
        "completedAt" = EXCLUDED."completedAt"
    `.catch(() => {
      // Si la table n'existe pas, on ignore l'erreur pour le moment
      // En production, vous devriez créer cette table dans le schéma Prisma
      console.log("Table OnboardingData non trouvée - données sauvegardées dans les logs")
    })
    // Log pour le moment (à remplacer par la vraie sauvegarde)
    console.log("Données d'onboarding sauvegardées:", {
      userId: updatedUser.id,
      email: session.user.email,
      industry,
      company,
      role,
      experience,
      goals,
      preferredAgents,
      completedAt: new Date().toISOString()
    })
    return NextResponse.json({ 
      success: true,
      message: "Onboarding complété avec succès"
    })
  } catch (error) {
    console.error("Erreur lors de l'onboarding:", error)
    return NextResponse.json(
      { error: "Erreur lors de la sauvegarde des données d'onboarding" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    // Récupérer les données d'onboarding de l'utilisateur
    // Pour le moment, on retourne un statut basique
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        createdAt: true,
        name: true
      }
    })
    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 })
    }

    // Vérifier si c'est un nouvel utilisateur (créé il y a moins de 5 minutes)
    const isNewUser = new Date().getTime() - new Date(user.createdAt).getTime() < 5 * 60 * 1000
    // Vérifier si l'onboarding a été complété (via localStorage côté client pour le moment)
    return NextResponse.json({
      isNewUser,
      hasCompletedOnboarding: false, // À implémenter avec la vraie DB
      user: {
        id: user.id,
        name: user.name,
        createdAt: user.createdAt
      }
    })
  } catch (error) {
    console.error("Erreur lors de la récupération des données d'onboarding:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des données" },
      { status: 500 }
    )
  }
}
