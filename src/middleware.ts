import { NextRequest, NextResponse } from 'next/server';
import { rateLimitMiddleware } from './lib/rate-limit-advanced';

/**
 * Middleware Next.js pour Beriox AI
 * Applique le rate limiting, l'authentification et d'autres protections de sécurité
 */

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Pages publiques qui ne nécessitent pas d'authentification
  const publicPages = [
    '/',
    '/auth/signin',
    '/auth/signup',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/verify',
    '/auth/error',
    '/consent',
    '/privacy',
    '/cookies',
    '/pricing',
    '/api/auth',
    '/api/health',
    '/api/csrf'
  ];

  // Pages qui nécessitent une authentification stricte (redirection)
  const strictAuthPages = [
    '/admin',
    '/api/admin',
    '/api/missions',
    '/api/user',
    '/api/stripe',
    '/api/bots'
  ];

  // Vérifier si la page actuelle est publique
  const isPublicPage = publicPages.some(page => pathname.startsWith(page));
  
  // Vérifier si la page nécessite une authentification stricte
  const isStrictAuthPage = strictAuthPages.some(page => pathname.startsWith(page));

  // Si c'est une page d'authentification stricte, vérifier l'authentification
  if (isStrictAuthPage) {
    try {
      // Vérifier la session via l'API NextAuth
      const sessionResponse = await fetch(`${request.nextUrl.origin}/api/auth/session`, {
        headers: {
          cookie: request.headers.get('cookie') || '',
        },
      });

      if (!sessionResponse.ok) {
        console.log(`🔒 Session invalide pour ${pathname} - Redirection vers /auth/signin`);
        const signInUrl = new URL('/auth/signin', request.url);
        signInUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(signInUrl);
      }

      const session = await sessionResponse.json();
      
      // Si pas de session valide, rediriger vers la connexion
      if (!session || !session.user) {
        console.log(`🔒 Utilisateur non authentifié pour ${pathname} - Redirection vers /auth/signin`);
        const signInUrl = new URL('/auth/signin', request.url);
        signInUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(signInUrl);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de la session:', error);
      // En cas d'erreur, rediriger vers la connexion par sécurité
      const signInUrl = new URL('/auth/signin', request.url);
      signInUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(signInUrl);
    }
  } else if (!isPublicPage) {
    // Pour les pages non-publiques mais non-strictes, permettre l'accès sans redirection
    // Les pages géreront elles-mêmes l'affichage du contenu selon l'état d'authentification
    console.log(`📄 Accès public autorisé à ${pathname} - Contenu limité`);
  }

  // Appliquer le rate limiting uniquement sur les routes API
  if (pathname.startsWith('/api/')) {
    // Ignorer les routes de santé, monitoring et auth
    if (pathname === '/api/health' || 
        pathname.startsWith('/api/admin/stats') ||
        pathname.startsWith('/api/auth')) {
      return NextResponse.next();
    }

    try {
      // Vérifier le rate limiting
      const rateLimitResponse = await rateLimitMiddleware(request);
      
      if (rateLimitResponse) {
        return rateLimitResponse;
      }
    } catch (error) {
      console.error('Erreur dans le middleware de rate limiting:', error);
      // En cas d'erreur, continuer le traitement
    }
  }

  // Headers de sécurité
  const response = NextResponse.next();
  
  // Headers de sécurité de base
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Headers CSP (Content Security Policy)
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://www.googletagmanager.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://api.stripe.com https://www.googleapis.com https://api.openai.com",
    "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'"
  ].join('; ');
  
  response.headers.set('Content-Security-Policy', csp);

  return response;
}

// Configuration du middleware - Appliquer à toutes les routes sauf les fichiers statiques
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     * - api/auth (auth endpoints)
     */
    '/((?!_next/static|_next/image|favicon.ico|public/|api/auth).*)',
  ],
};
