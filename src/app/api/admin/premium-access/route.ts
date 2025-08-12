import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
// POST - Accorder un accès premium à un utilisateur (admin seulement)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    // Vérifier si l'utilisateur est super admin
    if (session.user.email !== 'info@beriox.ca') {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 })
    }

    const admin = await prisma.user.findUnique({
      where: { email: session.user.email }
    })
    if (!admin) {
      return NextResponse.json({ error: "Admin introuvable" }, { status: 404 })
    }

    const { userEmail, planId, duration, notes } = await req.json()
    // Validations
    if (!userEmail || !planId || !duration) {
      return NextResponse.json({ 
        error: "Email utilisateur, plan et durée sont requis" 
      }, { status: 400 })
    }

    // Vérifier que l'utilisateur existe
    const targetUser = await prisma.user.findUnique({
      where: { email: userEmail },
      include: { premiumAccess: true }
    })
    if (!targetUser) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 })
    }

    // Calculer la date d'expiration
    const now = new Date()
    const endDate = new Date(now.getTime() + (duration * 24 * 60 * 60 * 1000))
    // Vérifier si l'utilisateur a déjà un accès premium actif
    if (targetUser.premiumAccess && 
        targetUser.premiumAccess.isActive && 
        targetUser.premiumAccess.endDate > now) {
      
      // Étendre l'accès existant
      await prisma.premiumAccess.update({
        where: { userId: targetUser.id },
        data: {
          planId,
          endDate,
          source: 'admin_grant',
          sourceId: null,
          createdBy: admin.id,
          notes: notes || `Accès accordé par ${admin.email}`,
          updatedAt: now
        }
      })
    } else {
      // Créer un nouvel accès premium
      await prisma.premiumAccess.upsert({
        where: { userId: targetUser.id },
        update: {
          planId,
          startDate: now,
          endDate,
          isActive: true,
          source: 'admin_grant',
          sourceId: null,
          createdBy: admin.id,
          notes: notes || `Accès accordé par ${admin.email}`,
          updatedAt: now
        },
        create: {
          userId: targetUser.id,
          planId,
          startDate: now,
          endDate,
          isActive: true,
          source: 'admin_grant',
          sourceId: null,
          createdBy: admin.id,
          notes: notes || `Accès accordé par ${admin.email}`
        }
      })
    }

    console.log(`✅ Accès premium accordé: ${userEmail} -> ${planId} pour ${duration} jours par ${admin.email}`)
    return NextResponse.json({
      success: true,
      message: `Accès premium accordé à ${userEmail}`,
      access: {
        userEmail,
        planId,
        endDate,
        daysRemaining: duration
      }
    })
  } catch (error) {
    console.error('Erreur accord accès premium:', error)
    return NextResponse.json({ 
      error: "Erreur lors de l'attribution de l'accès premium" 
    }, { status: 500 })
  }
}

// GET - Lister les accès premium actifs (admin seulement)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email || session.user.email !== 'info@beriox.ca') {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 })
    }

    const premiumAccesses = await prisma.premiumAccess.findMany({
      include: {
        user: {
          select: { id: true, email: true, name: true, image: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    // Calculer les statistiques
    const now = new Date()
    const stats = {
      total: premiumAccesses.length,
      active: premiumAccesses.filter(p => p.isActive && p.endDate > now).length,
      expired: premiumAccesses.filter(p => p.endDate <= now).length,
      byPlan: {
        starter: premiumAccesses.filter(p => p.planId === 'starter').length,
        pro: premiumAccesses.filter(p => p.planId === 'pro').length,
        enterprise: premiumAccesses.filter(p => p.planId === 'enterprise').length
      },
      bySource: {
        coupon: premiumAccesses.filter(p => p.source === 'coupon').length,
        admin_grant: premiumAccesses.filter(p => p.source === 'admin_grant').length,
        stripe: premiumAccesses.filter(p => p.source === 'stripe').length
      }
    }
    return NextResponse.json({ premiumAccesses, stats })
  } catch (error) {
    console.error('Erreur récupération accès premium:', error)
    return NextResponse.json({ 
      error: "Erreur lors de la récupération des accès premium" 
    }, { status: 500 })
  }
}

// DELETE - Révoquer un accès premium (admin seulement)
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email || session.user.email !== 'info@beriox.ca') {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    if (!userId) {
      return NextResponse.json({ error: "ID utilisateur requis" }, { status: 400 })
    }

    // Désactiver l'accès premium
    await prisma.premiumAccess.update({
      where: { userId },
      data: {
        isActive: false,
        updatedAt: new Date()
      }
    })
    console.log(`✅ Accès premium révoqué pour userId: ${userId} par ${session.user.email}`)
    return NextResponse.json({ success: true, message: "Accès premium révoqué" })
  } catch (error) {
    console.error('Erreur révocation accès premium:', error)
    return NextResponse.json({ 
      error: "Erreur lors de la révocation de l'accès premium" 
    }, { status: 500 })
  }
}
