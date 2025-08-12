import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        premiumAccess: true,
        couponRedemptions: {
          include: { coupon: true }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    const { code } = await req.json();
    
    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: "Code coupon requis" }, { status: 400 });
    }

    // Rechercher le coupon
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        redemptions: true
      }
    });

    if (!coupon) {
      return NextResponse.json({ error: "Code coupon invalide" }, { status: 400 });
    }

    // Vérifications de validité
    const now = new Date();

    // Coupon actif ?
    if (coupon.status !== 'ACTIVE') {
      return NextResponse.json({ error: "Ce coupon n'est plus actif" }, { status: 400 });
    }

    // Coupon expiré ?
    if (coupon.validUntil && coupon.validUntil < now) {
      return NextResponse.json({ error: "Ce coupon a expiré" }, { status: 400 });
    }

    // Coupon pas encore valide ?
    if (coupon.validFrom > now) {
      return NextResponse.json({ error: "Ce coupon n'est pas encore valide" }, { status: 400 });
    }

    // Limite d'utilisation atteinte ?
    if (coupon.maxUses && coupon.currentUses >= coupon.maxUses) {
      return NextResponse.json({ error: "Ce coupon a atteint sa limite d'utilisation" }, { status: 400 });
    }

    // L'utilisateur a-t-il déjà utilisé ce coupon ?
    const existingRedemption = coupon.redemptions.find(r => r.userId === user.id);
    if (existingRedemption) {
      return NextResponse.json({ error: "Vous avez déjà utilisé ce coupon" }, { status: 400 });
    }

    // L'utilisateur a-t-il déjà un accès premium actif ?
    if (user.premiumAccess && user.premiumAccess.isActive && user.premiumAccess.endDate > now) {
      return NextResponse.json({ 
        error: "Vous avez déjà un accès premium actif",
        currentAccess: {
          planId: user.premiumAccess.planId,
          endDate: user.premiumAccess.endDate
        }
      }, { status: 400 });
    }

    // Traiter le coupon selon son type
    let planActivated: string | null = null;
    let expiresAt: Date | null = null;

    if (coupon.type === 'PREMIUM_TRIAL' && coupon.planId && coupon.duration) {
      planActivated = coupon.planId;
      expiresAt = new Date(now.getTime() + (coupon.duration * 24 * 60 * 60 * 1000));

      // Créer ou mettre à jour l'accès premium
      await prisma.premiumAccess.upsert({
        where: { userId: user.id },
        update: {
          planId: coupon.planId,
          startDate: now,
          endDate: expiresAt,
          isActive: true,
          source: 'coupon',
          sourceId: coupon.id,
          updatedAt: now
        },
        create: {
          userId: user.id,
          planId: coupon.planId,
          startDate: now,
          endDate: expiresAt,
          isActive: true,
          source: 'coupon',
          sourceId: coupon.id
        }
      });
    }

    // Enregistrer l'utilisation du coupon
    await prisma.couponRedemption.create({
      data: {
        couponId: coupon.id,
        userId: user.id,
        planActivated,
        expiresAt
      }
    });

    // Mettre à jour le compteur d'utilisation du coupon
    await prisma.coupon.update({
      where: { id: coupon.id },
      data: {
        currentUses: coupon.currentUses + 1,
        // Marquer comme utilisé si c'était à usage unique
        status: (coupon.maxUses === 1) ? 'USED' : coupon.status
      }
    });

    console.log(`✅ Coupon ${code} utilisé par ${user.email} - Plan: ${planActivated}, Expire: ${expiresAt}`);

    return NextResponse.json({
      success: true,
      message: "Coupon appliqué avec succès !",
      coupon: {
        code: coupon.code,
        description: coupon.description,
        type: coupon.type
      },
      access: planActivated ? {
        planId: planActivated,
        expiresAt: expiresAt,
        daysRemaining: coupon.duration
      } : null
    });

  } catch (error) {
    console.error('Erreur utilisation coupon:', error);
    return NextResponse.json({ 
      error: "Erreur lors de l'utilisation du coupon" 
    }, { status: 500 });
  }
}
