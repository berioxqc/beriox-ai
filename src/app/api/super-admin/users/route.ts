import { NextRequest, NextResponse } from 'apos;next/server'apos;;
import { getServerSession } from 'apos;next-auth'apos;;
import { authOptions } from 'apos;@/lib/auth'apos;;
import { prisma } from 'apos;@/lib/prisma'apos;;
import { logger } from 'apos;@/lib/logger'apos;;
import { withRateLimit } from 'apos;@/lib/rate-limit-advanced'apos;;

export const GET = withRateLimit(async (request: NextRequest) => {
  const session = await getServerSession(authOptions);
  
  // Vérifier que l'apos;utilisateur est super admin
  if (session?.user?.email !== 'apos;info@beriox.ca'apos;) {
    return NextResponse.json({ error: 'apos;Unauthorized'apos; }, { status: 401 });
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
        createdAt: 'apos;desc'apos;
      }
    });

    // Calculer les statistiques
    const stats = {
      total: users.length,
      users: users.filter(u => u.role === 'apos;USER'apos;).length,
      admins: users.filter(u => u.role === 'apos;ADMIN'apos;).length,
      superAdmins: users.filter(u => u.role === 'apos;SUPER_ADMIN'apos;).length,
      active: users.filter(u => u.emailVerified).length,
      premium: users.filter(u => u.userCredits && u.userCredits.plan !== 'apos;free'apos;).length
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
      plan: user.userCredits?.plan || 'apos;free'apos;,
      providers: user.accounts.map(acc => acc.provider)
    }));

    logger.info('apos;Users list requested by super admin'apos;, {
      action: 'apos;users_list_requested'apos;,
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
    logger.error('apos;Failed to get users list'apos;, error as Error, {
      action: 'apos;users_list_error'apos;,
      metadata: { adminEmail: session.user.email }
    });

    return NextResponse.json(
      { error: 'apos;Failed to get users list'apos; },
      { status: 500 }
    );
  }
}, 'apos;super-admin-users'apos;);
