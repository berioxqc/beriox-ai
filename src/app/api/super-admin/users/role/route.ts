import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { withRateLimit } from '@/lib/rate-limit-advanced';

export const PUT = withRateLimit(async (request: NextRequest) => {
  const session = await getServerSession(authOptions);
  
  // Vérifier que l'utilisateur est super admin
  if (session?.user?.email !== 'info@beriox.ca') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { userId, role } = body;

    if (!userId || !role) {
      return NextResponse.json(
        { error: 'User ID and role are required' },
        { status: 400 }
      );
    }

    // Vérifier que le rôle est valide
    if (!['USER', 'ADMIN', 'SUPER_ADMIN'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be USER, ADMIN, or SUPER_ADMIN' },
        { status: 400 }
      );
    }

    // Vérifier que l'utilisateur existe
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Empêcher de modifier son propre rôle
    if (existingUser.email === 'info@beriox.ca' && role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Cannot modify your own role' },
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

    logger.info('User role updated by super admin', {
      action: 'user_role_updated',
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
        plan: updatedUser.userCredits?.plan || 'free'
      },
      message: `Rôle de ${updatedUser.name || updatedUser.email} mis à jour vers ${role}`
    });

  } catch (error) {
    logger.error('Failed to update user role', error as Error, {
      action: 'user_role_update_error',
      metadata: { adminEmail: session.user.email }
    });

    return NextResponse.json(
      { error: 'Failed to update user role' },
      { status: 500 }
    );
  }
}, 'super-admin-users-role');
