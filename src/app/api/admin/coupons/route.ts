import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// GET - Lister tous les coupons (admin seulement)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Vérifier si l'utilisateur est super admin
    if (session.user.email !== 'info@beriox.ca') {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');

    const whereClause: any = {};
    if (status) whereClause.status = status;
    if (type) whereClause.type = type;

    const coupons = await prisma.coupon.findMany({
      where: whereClause,
      include: {
        redemptions: {
          include: {
            user: {
              select: { id: true, email: true, name: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculer des statistiques
    const stats = {
      total: coupons.length,
      active: coupons.filter(c => c.status === 'ACTIVE').length,
      used: coupons.filter(c => c.status === 'USED').length,
      expired: coupons.filter(c => c.validUntil && c.validUntil < new Date()).length,
      totalRedemptions: coupons.reduce((acc, c) => acc + c.currentUses, 0)
    };

    return NextResponse.json({ coupons, stats });

  } catch (error) {
    console.error('Erreur récupération coupons:', error);
    return NextResponse.json({ 
      error: "Erreur lors de la récupération des coupons" 
    }, { status: 500 });
  }
}

// POST - Créer un nouveau coupon (admin seulement)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Vérifier si l'utilisateur est super admin
    if (session.user.email !== 'info@beriox.ca') {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
    }

    const admin = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!admin) {
      return NextResponse.json({ error: "Utilisateur admin introuvable" }, { status: 404 });
    }

    const {
      code,
      type,
      description,
      planId,
      duration,
      discount,
      maxUses,
      validUntil,
      notes
    } = await req.json();

    // Validations
    if (!code || !type) {
      return NextResponse.json({ error: "Code et type sont requis" }, { status: 400 });
    }

    if (type === 'PREMIUM_TRIAL' && (!planId || !duration)) {
      return NextResponse.json({ 
        error: "Plan et durée requis pour les essais premium" 
      }, { status: 400 });
    }

    // Vérifier que le code n'existe pas déjà
    const existingCoupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() }
    });

    if (existingCoupon) {
      return NextResponse.json({ error: "Ce code coupon existe déjà" }, { status: 400 });
    }

    // Créer le coupon
    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        type,
        description,
        planId,
        duration,
        discount,
        maxUses,
        validUntil: validUntil ? new Date(validUntil) : null,
        createdBy: admin.id,
        notes
      }
    });

    console.log(`✅ Coupon créé: ${coupon.code} par ${admin.email}`);

    return NextResponse.json({ 
      success: true, 
      coupon: {
        id: coupon.id,
        code: coupon.code,
        type: coupon.type,
        description: coupon.description,
        createdAt: coupon.createdAt
      }
    });

  } catch (error) {
    console.error('Erreur création coupon:', error);
    return NextResponse.json({ 
      error: "Erreur lors de la création du coupon" 
    }, { status: 500 });
  }
}

// PUT - Mettre à jour un coupon (admin seulement)
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email || session.user.email !== 'info@beriox.ca') {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
    }

    const { id, status, notes, validUntil } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "ID coupon requis" }, { status: 400 });
    }

    const updatedCoupon = await prisma.coupon.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
        ...(validUntil && { validUntil: new Date(validUntil) }),
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ success: true, coupon: updatedCoupon });

  } catch (error) {
    console.error('Erreur mise à jour coupon:', error);
    return NextResponse.json({ 
      error: "Erreur lors de la mise à jour du coupon" 
    }, { status: 500 });
  }
}
