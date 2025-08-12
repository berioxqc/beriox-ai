import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// POST - Accorder un accès premium à un utilisateur (admin seulement)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Vérifier si l'apos;utilisateur est super admin
    if (session.user.email !== 'apos;info@beriox.ca'apos;) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
    }

    const admin = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!admin) {
      return NextResponse.json({ error: "Admin introuvable" }, { status: 404 });
    }

    const { userEmail, planId, duration, notes } = await req.json();

    // Validations
    if (!userEmail || !planId || !duration) {
      return NextResponse.json({ 
        error: "Email utilisateur, plan et durée sont requis" 
      }, { status: 400 });
    }

    // Vérifier que l'apos;utilisateur existe
    const targetUser = await prisma.user.findUnique({
      where: { email: userEmail },
      include: { premiumAccess: true }
    });

    if (!targetUser) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    // Calculer la date d'apos;expiration
    const now = new Date();
    const endDate = new Date(now.getTime() + (duration * 24 * 60 * 60 * 1000));

    // Vérifier si l'apos;utilisateur a déjà un accès premium actif
    if (targetUser.premiumAccess && 
        targetUser.premiumAccess.isActive && 
        targetUser.premiumAccess.endDate > now) {
      
      // Étendre l'apos;accès existant
      await prisma.premiumAccess.update({
        where: { userId: targetUser.id },
        data: {
          planId,
          endDate,
          source: 'apos;admin_grant'apos;,
          sourceId: null,
          createdBy: admin.id,
          notes: notes || `Accès accordé par ${admin.email}`,
          updatedAt: now
        }
      });
    } else {
      // Créer un nouvel accès premium
      await prisma.premiumAccess.upsert({
        where: { userId: targetUser.id },
        update: {
          planId,
          startDate: now,
          endDate,
          isActive: true,
          source: 'apos;admin_grant'apos;,
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
          source: 'apos;admin_grant'apos;,
          sourceId: null,
          createdBy: admin.id,
          notes: notes || `Accès accordé par ${admin.email}`
        }
      });
    }

    console.log(`✅ Accès premium accordé: ${userEmail} -> ${planId} pour ${duration} jours par ${admin.email}`);

    return NextResponse.json({
      success: true,
      message: `Accès premium accordé à ${userEmail}`,
      access: {
        userEmail,
        planId,
        endDate,
        daysRemaining: duration
      }
    });

  } catch (error) {
    console.error('apos;Erreur accord accès premium:'apos;, error);
    return NextResponse.json({ 
      error: "Erreur lors de l'apos;attribution de l'apos;accès premium" 
    }, { status: 500 });
  }
}

// GET - Lister les accès premium actifs (admin seulement)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email || session.user.email !== 'apos;info@beriox.ca'apos;) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
    }

    const premiumAccesses = await prisma.premiumAccess.findMany({
      include: {
        user: {
          select: { id: true, email: true, name: true, image: true }
        }
      },
      orderBy: { createdAt: 'apos;desc'apos; }
    });

    // Calculer les statistiques
    const now = new Date();
    const stats = {
      total: premiumAccesses.length,
      active: premiumAccesses.filter(p => p.isActive && p.endDate > now).length,
      expired: premiumAccesses.filter(p => p.endDate <= now).length,
      byPlan: {
        starter: premiumAccesses.filter(p => p.planId === 'apos;starter'apos;).length,
        pro: premiumAccesses.filter(p => p.planId === 'apos;pro'apos;).length,
        enterprise: premiumAccesses.filter(p => p.planId === 'apos;enterprise'apos;).length
      },
      bySource: {
        coupon: premiumAccesses.filter(p => p.source === 'apos;coupon'apos;).length,
        admin_grant: premiumAccesses.filter(p => p.source === 'apos;admin_grant'apos;).length,
        stripe: premiumAccesses.filter(p => p.source === 'apos;stripe'apos;).length
      }
    };

    return NextResponse.json({ premiumAccesses, stats });

  } catch (error) {
    console.error('apos;Erreur récupération accès premium:'apos;, error);
    return NextResponse.json({ 
      error: "Erreur lors de la récupération des accès premium" 
    }, { status: 500 });
  }
}

// DELETE - Révoquer un accès premium (admin seulement)
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email || session.user.email !== 'apos;info@beriox.ca'apos;) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('apos;userId'apos;);

    if (!userId) {
      return NextResponse.json({ error: "ID utilisateur requis" }, { status: 400 });
    }

    // Désactiver l'apos;accès premium
    await prisma.premiumAccess.update({
      where: { userId },
      data: {
        isActive: false,
        updatedAt: new Date()
      }
    });

    console.log(`✅ Accès premium révoqué pour userId: ${userId} par ${session.user.email}`);

    return NextResponse.json({ success: true, message: "Accès premium révoqué" });

  } catch (error) {
    console.error('apos;Erreur révocation accès premium:'apos;, error);
    return NextResponse.json({ 
      error: "Erreur lors de la révocation de l'apos;accès premium" 
    }, { status: 500 });
  }
}
