import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

/**
 * Wrapper d'authentification pour les endpoints API
 * Vérifie que l'utilisateur est authentifié avant d'exécuter le handler
 */

export function withAuth(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async function(request: NextRequest) {
    try {
      // Vérifier l'authentification
      const session = await getServerSession(authOptions);
      
      if (!session?.user?.email) {
        return NextResponse.json(
          { error: 'Non authentifié' },
          { status: 401 }
        );
      }
      
      // Utilisateur authentifié, continuer avec le handler
      return handler(request);
      
    } catch (error) {
      console.error('Erreur d\'authentification:', error);
      return NextResponse.json(
        { error: 'Erreur d\'authentification' },
        { status: 500 }
      );
    }
  };
}

/**
 * Wrapper d'authentification avec vérification de rôle
 */
export function withRoleAuth(
  handler: (request: NextRequest) => Promise<NextResponse>,
  requiredRoles: string[] = ['USER']
) {
  return async function(request: NextRequest) {
    try {
      // Vérifier l'authentification
      const session = await getServerSession(authOptions);
      
      if (!session?.user?.email) {
        return NextResponse.json(
          { error: 'Non authentifié' },
          { status: 401 }
        );
      }
      
      // Vérifier le rôle si nécessaire
      if (requiredRoles.length > 0) {
        // Récupérer les informations utilisateur depuis la base de données
        const { prisma } = await import('@/lib/prisma');
        const user = await prisma.user.findUnique({
          where: { email: session.user.email },
          select: { role: true }
        });
        
        if (!user || !requiredRoles.includes(user.role)) {
          return NextResponse.json(
            { error: 'Permissions insuffisantes' },
            { status: 403 }
          );
        }
      }
      
      // Utilisateur authentifié et autorisé, continuer avec le handler
      return handler(request);
      
    } catch (error) {
      console.error('Erreur d\'authentification avec rôle:', error);
      return NextResponse.json(
        { error: 'Erreur d\'authentification' },
        { status: 500 }
      );
    }
  };
}

/**
 * Wrapper d'authentification pour les endpoints publics (avec session optionnelle)
 */
export function withOptionalAuth(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async function(request: NextRequest) {
    try {
      // Vérifier l'authentification (optionnelle)
      const session = await getServerSession(authOptions);
      
      // Ajouter la session à la requête pour que le handler puisse l'utiliser
      (request as any).session = session;
      
      // Continuer avec le handler (avec ou sans session)
      return handler(request);
      
    } catch (error) {
      console.error('Erreur d\'authentification optionnelle:', error);
      // En cas d'erreur, continuer sans session
      (request as any).session = null;
      return handler(request);
    }
  };
}
