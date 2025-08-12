import { NextRequest, NextResponse } from 'apos;next/server'apos;;
import { getServerSession } from 'apos;next-auth/next'apos;;
import { authOptions } from 'apos;@/app/api/auth/[...nextauth]/route'apos;;

/**
 * Wrapper d'apos;authentification pour les endpoints API
 * Vérifie que l'apos;utilisateur est authentifié avant d'apos;exécuter le handler
 */

export function withAuth(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async function(request: NextRequest) {
    try {
      // Vérifier l'apos;authentification
      const session = await getServerSession(authOptions);
      
      if (!session?.user?.email) {
        return NextResponse.json(
          { error: 'apos;Non authentifié'apos; },
          { status: 401 }
        );
      }
      
      // Utilisateur authentifié, continuer avec le handler
      return handler(request);
      
    } catch (error) {
      console.error('apos;Erreur d\'apos;authentification:'apos;, error);
      return NextResponse.json(
        { error: 'apos;Erreur d\'apos;authentification'apos; },
        { status: 500 }
      );
    }
  };
}

/**
 * Wrapper d'apos;authentification avec vérification de rôle
 */
export function withRoleAuth(
  handler: (request: NextRequest) => Promise<NextResponse>,
  requiredRoles: string[] = ['apos;USER'apos;]
) {
  return async function(request: NextRequest) {
    try {
      // Vérifier l'apos;authentification
      const session = await getServerSession(authOptions);
      
      if (!session?.user?.email) {
        return NextResponse.json(
          { error: 'apos;Non authentifié'apos; },
          { status: 401 }
        );
      }
      
      // Vérifier le rôle si nécessaire
      if (requiredRoles.length > 0) {
        // Récupérer les informations utilisateur depuis la base de données
        const { prisma } = await import('apos;@/lib/prisma'apos;);
        const user = await prisma.user.findUnique({
          where: { email: session.user.email },
          select: { role: true }
        });
        
        if (!user || !requiredRoles.includes(user.role)) {
          return NextResponse.json(
            { error: 'apos;Permissions insuffisantes'apos; },
            { status: 403 }
          );
        }
      }
      
      // Utilisateur authentifié et autorisé, continuer avec le handler
      return handler(request);
      
    } catch (error) {
      console.error('apos;Erreur d\'apos;authentification avec rôle:'apos;, error);
      return NextResponse.json(
        { error: 'apos;Erreur d\'apos;authentification'apos; },
        { status: 500 }
      );
    }
  };
}

/**
 * Wrapper d'apos;authentification pour les endpoints publics (avec session optionnelle)
 */
export function withOptionalAuth(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async function(request: NextRequest) {
    try {
      // Vérifier l'apos;authentification (optionnelle)
      const session = await getServerSession(authOptions);
      
      // Ajouter la session à la requête pour que le handler puisse l'apos;utiliser
      (request as any).session = session;
      
      // Continuer avec le handler (avec ou sans session)
      return handler(request);
      
    } catch (error) {
      console.error('apos;Erreur d\'apos;authentification optionnelle:'apos;, error);
      // En cas d'apos;erreur, continuer sans session
      (request as any).session = null;
      return handler(request);
    }
  };
}
