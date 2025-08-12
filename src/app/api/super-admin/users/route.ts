import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { withRateLimit } from '@/lib/rate-limit-advanced';

export const GET = withRateLimit(async (request: NextRequest) => {
  const session = await getServerSession(authOptions);
  
  // Vérifier que l'utilisateur est super admin
  if (session?.user?.email !== 'info@beriox.ca') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Récupérer tous les utilisateurs avec leurs crédits
    const users = await prisma.user.findMany({
      include: {
        userCredits: true,
        accounts: {
          select: {
            provider: true,
            providerAccountId: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Calculer les statistiques
    const stats = {
      total: users.length,
      users: users.filter(u => u.role === 'USER').length,
      admins: users.filter(u => u.role === 'ADMIN').length,
      superAdmins: users.filter(u => u.role === 'SUPER_ADMIN').length,
      active: users.filter(u => u.emailVerified).length,
      premium: users.filter(u => u.userCredits && u.userCredits.plan !== 'free').length
    };

    // Formater les données utilisateur
    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      emailVerified: !!user.emailVerified,
      createdAt: user.createdAt.toISOString(),
      lastLogin: user.updatedAt.toISOString(),
      credits: user.userCredits?.credits || 0,
      plan: user.userCredits?.plan || 'free',
      providers: user.accounts.map(acc => acc.provider)
    }));

    logger.info('Users list requested by super admin', {
      action: 'users_list_requested',
      metadata: {
        adminEmail: session.user.email,
        totalUsers: users.length
      }
    });

    return NextResponse.json({
      users: formattedUsers,
      stats,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Failed to get users list', error as Error, {
      action: 'users_list_error',
      metadata: { adminEmail: session.user.email }
    });

    return NextResponse.json(
      { error: 'Failed to get users list' },
      { status: 500 }
    );
  }
}, 'super-admin-users');
