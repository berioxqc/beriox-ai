import { NextRequest, NextResponse } from 'apos;next/server'apos;;
import { rateLimitMiddleware } from 'apos;./lib/rate-limit-advanced'apos;;

/**
 * Middleware Next.js pour Beriox AI
 * Applique le rate limiting, l'apos;authentification et d'apos;autres protections de sécurité
 */

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Pages publiques qui ne nécessitent pas d'apos;authentification
  const publicPages = [
    'apos;/'apos;,
    'apos;/auth/signin'apos;,
    'apos;/auth/signup'apos;,
    'apos;/auth/forgot-password'apos;,
    'apos;/auth/reset-password'apos;,
    'apos;/auth/verify'apos;,
    'apos;/auth/error'apos;,
    'apos;/consent'apos;,
    'apos;/privacy'apos;,
    'apos;/cookies'apos;,
    'apos;/pricing'apos;,
    'apos;/api/auth'apos;,
    'apos;/api/health'apos;,
    'apos;/api/monitoring/health'apos;,
    'apos;/api/csrf'apos;
  ];

  // Pages qui nécessitent une authentification stricte (redirection)
  const strictAuthPages = [
    'apos;/admin'apos;,
    'apos;/api/admin'apos;,
    'apos;/api/missions'apos;,
    'apos;/api/user'apos;,
    'apos;/api/stripe'apos;,
    'apos;/api/bots'apos;
  ];

  // Vérifier si la page actuelle est publique
  const isPublicPage = publicPages.some(page => pathname.startsWith(page));
  
  // Vérifier si la page nécessite une authentification stricte
  const isStrictAuthPage = strictAuthPages.some(page => pathname.startsWith(page));

  // Si c'apos;est une page d'apos;authentification stricte, vérifier l'apos;authentification
  if (isStrictAuthPage) {
    try {
      // Vérifier la session via l'apos;API NextAuth
      const sessionResponse = await fetch(`${request.nextUrl.origin}/api/auth/session`, {
        headers: {
          cookie: request.headers.get('apos;cookie'apos;) || 'apos;'apos;,
        },
      });

      if (!sessionResponse.ok) {
        console.log(`🔒 Session invalide pour ${pathname} - Redirection vers /auth/signin`);
        const signInUrl = new URL('apos;/auth/signin'apos;, request.url);
        signInUrl.searchParams.set('apos;callbackUrl'apos;, pathname);
        return NextResponse.redirect(signInUrl);
      }

      const session = await sessionResponse.json();
      
      // Si pas de session valide, rediriger vers la connexion
      if (!session || !session.user) {
        console.log(`🔒 Utilisateur non authentifié pour ${pathname} - Redirection vers /auth/signin`);
        const signInUrl = new URL('apos;/auth/signin'apos;, request.url);
        signInUrl.searchParams.set('apos;callbackUrl'apos;, pathname);
        return NextResponse.redirect(signInUrl);
      }
    } catch (error) {
      console.error('apos;Erreur lors de la vérification de la session:'apos;, error);
      // En cas d'apos;erreur, rediriger vers la connexion par sécurité
      const signInUrl = new URL('apos;/auth/signin'apos;, request.url);
      signInUrl.searchParams.set('apos;callbackUrl'apos;, pathname);
      return NextResponse.redirect(signInUrl);
    }
  } else if (!isPublicPage) {
    // Pour les pages non-publiques mais non-strictes, permettre l'apos;accès sans redirection
    // Les pages géreront elles-mêmes l'apos;affichage du contenu selon l'apos;état d'apos;authentification
    console.log(`📄 Accès public autorisé à ${pathname} - Contenu limité`);
  }

  // Appliquer le rate limiting uniquement sur les routes API
  if (pathname.startsWith('apos;/api/'apos;)) {
    // Ignorer les routes de santé, monitoring et auth
    if (pathname === 'apos;/api/health'apos; || 
        pathname.startsWith('apos;/api/monitoring/health'apos;) ||
        pathname.startsWith('apos;/api/admin/stats'apos;) ||
        pathname.startsWith('apos;/api/auth'apos;)) {
      return NextResponse.next();
    }

    try {
      // Vérifier le rate limiting
      const rateLimitResponse = await rateLimitMiddleware(request);
      
      if (rateLimitResponse) {
        return rateLimitResponse;
      }
    } catch (error) {
      console.error('apos;Erreur dans le middleware de rate limiting:'apos;, error);
      // En cas d'apos;erreur, continuer le traitement
    }
  }

  // Headers de sécurité
  const response = NextResponse.next();
  
  // Headers de sécurité de base
  response.headers.set('apos;X-Content-Type-Options'apos;, 'apos;nosniff'apos;);
  response.headers.set('apos;X-Frame-Options'apos;, 'apos;DENY'apos;);
  response.headers.set('apos;X-XSS-Protection'apos;, 'apos;1; mode=block'apos;);
  response.headers.set('apos;Referrer-Policy'apos;, 'apos;strict-origin-when-cross-origin'apos;);
  
  // Headers CSP (Content Security Policy)
  const csp = [
    "default-src 'apos;self'apos;",
    "script-src 'apos;self'apos; 'apos;unsafe-eval'apos; 'apos;unsafe-inline'apos; https://js.stripe.com https://www.googletagmanager.com",
    "style-src 'apos;self'apos; 'apos;unsafe-inline'apos; https://fonts.googleapis.com",
    "font-src 'apos;self'apos; https://fonts.gstatic.com",
    "img-src 'apos;self'apos; data: https: blob:",
    "connect-src 'apos;self'apos; https://api.stripe.com https://www.googleapis.com https://api.openai.com",
    "frame-src 'apos;self'apos; https://js.stripe.com https://hooks.stripe.com",
    "object-src 'apos;none'apos;",
    "base-uri 'apos;self'apos;",
    "form-action 'apos;self'apos;",
    "frame-ancestors 'apos;none'apos;"
  ].join('apos;; 'apos;);
  
  response.headers.set('apos;Content-Security-Policy'apos;, csp);

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
    'apos;/((?!_next/static|_next/image|favicon.ico|public/|api/auth).*)'apos;,
  ],
};
