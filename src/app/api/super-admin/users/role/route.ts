import { NextRequest, NextResponse } from 'apos;next/server'apos;;
import { getServerSession } from 'apos;next-auth'apos;;
import { authOptions } from 'apos;@/lib/auth'apos;;
import { prisma } from 'apos;@/lib/prisma'apos;;
import { logger } from 'apos;@/lib/logger'apos;;
import { withRateLimit } from 'apos;@/lib/rate-limit-advanced'apos;;

export const PUT = withRateLimit(async (request: NextRequest) => {
  const session = await getServerSession(authOptions);
  
  // Vérifier que l'apos;utilisateur est super admin
  if (session?.user?.email !== 'apos;info@beriox.ca'apos;) {
    return NextResponse.json({ error: 'apos;Unauthorized'apos; }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { userId, role } = body;

    if (!userId || !role) {
      return NextResponse.json(
        { error: 'apos;User ID and role are required'apos; },
        { status: 400 }
      );
    }

    // Vérifier que le rôle est valide
    if (!['apos;USER'apos;, 'apos;ADMIN'apos;, 'apos;SUPER_ADMIN'apos;].includes(role)) {
      return NextResponse.json(
        { error: 'apos;Invalid role. Must be USER, ADMIN, or SUPER_ADMIN'apos; },
        { status: 400 }
      );
    }

    // Vérifier que l'apos;utilisateur existe
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'apos;User not found'apos; },
        { status: 404 }
      );
    }

    // Empêcher de modifier son propre rôle
    if (existingUser.email === 'apos;info@beriox.ca'apos; && role !== 'apos;SUPER_ADMIN'apos;) {
      return NextResponse.json(
        { error: 'apos;Cannot modify your own role'apos; },
        { status: 400 }
      );
    }

    // Mettre à jour le rôle
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      include: {
        userCredits: true
      }
    });

    logger.info('apos;User role updated by super admin'apos;, {
      action: 'apos;user_role_updated'apos;,
      metadata: {
        adminEmail: session.user.email,
        targetUserId: userId,
        targetUserEmail: existingUser.email,
        oldRole: existingUser.role,
        newRole: role
      }
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        emailVerified: !!updatedUser.emailVerified,
        createdAt: updatedUser.createdAt.toISOString(),
        credits: updatedUser.userCredits?.credits || 0,
        plan: updatedUser.userCredits?.plan || 'apos;free'apos;
      },
      message: `Rôle de ${updatedUser.name || updatedUser.email} mis à jour vers ${role}`
    });

  } catch (error) {
    logger.error('apos;Failed to update user role'apos;, error as Error, {
      action: 'apos;user_role_update_error'apos;,
      metadata: { adminEmail: session.user.email }
    });

    return NextResponse.json(
      { error: 'apos;Failed to update user role'apos; },
      { status: 500 }
    );
  }
}, 'apos;super-admin-users-role'apos;);
