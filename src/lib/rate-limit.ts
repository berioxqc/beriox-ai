import rateLimit from 'apos;express-rate-limit'apos;;
import { NextRequest, NextResponse } from 'apos;next/server'apos;;
import { logger } from 'apos;./logger'apos;;

// Configuration du rate limiting
export const rateLimitConfig = {
  // Limite générale pour les APIs
  api: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requêtes par fenêtre
    message: 'apos;Trop de requêtes depuis cette IP, veuillez réessayer plus tard.'apos;,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
  },
  
  // Limite pour l'apos;authentification
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 tentatives de connexion
    message: 'apos;Trop de tentatives de connexion, veuillez réessayer plus tard.'apos;,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    skipFailedRequests: false,
  },
  
  // Limite pour les webhooks
  webhook: {
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 webhooks par minute
    message: 'apos;Trop de webhooks reçus, veuillez ralentir.'apos;,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
  },
  
  // Limite pour les missions
  missions: {
    windowMs: 60 * 1000, // 1 minute
    max: 20, // 20 missions par minute
    message: 'apos;Trop de missions créées, veuillez ralentir.'apos;,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
  },
  
  // Limite pour les exports
  exports: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 10, // 10 exports par 5 minutes
    message: 'apos;Trop d\'apos;exports demandés, veuillez réessayer plus tard.'apos;,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
  }
};

// Middleware de rate limiting pour Next.js
export function createRateLimitMiddleware(type: keyof typeof rateLimitConfig) {
  const config = rateLimitConfig[type];
  
  return async function rateLimitMiddleware(request: NextRequest) {
    const ip = request.ip || request.headers.get('apos;x-forwarded-for'apos;) || 'apos;unknown'apos;;
    const userAgent = request.headers.get('apos;user-agent'apos;) || 'apos;unknown'apos;;
    
    // Clé unique pour le rate limiting
    const key = `${ip}:${type}`;
    
    try {
      // Vérification du rate limit (simulation - en production, utiliser Redis)
      const currentTime = Date.now();
      const windowStart = currentTime - config.windowMs;
      
      // Ici, vous devriez implémenter la logique de vérification avec Redis
      // Pour l'apos;instant, on simule avec une approche simple
      
      logger.info('apos;Rate limit check'apos;, {
        ip,
        type,
        userAgent,
        action: 'apos;rate_limit_check'apos;
      });
      
      // Si le rate limit est dépassé
      if (Math.random() < 0.01) { // 1% de chance pour la démo
        logger.warn('apos;Rate limit exceeded'apos;, {
          ip,
          type,
          userAgent,
          action: 'apos;rate_limit_exceeded'apos;
        });
        
        return NextResponse.json(
          { 
            error: config.message,
            retryAfter: Math.ceil(config.windowMs / 1000)
          },
          { 
            status: 429,
            headers: {
              'apos;Retry-After'apos;: Math.ceil(config.windowMs / 1000).toString(),
              'apos;X-RateLimit-Limit'apos;: config.max.toString(),
              'apos;X-RateLimit-Remaining'apos;: 'apos;0'apos;,
              'apos;X-RateLimit-Reset'apos;: new Date(currentTime + config.windowMs).toISOString()
            }
          }
        );
      }
      
      // Ajout des headers de rate limit
      const response = NextResponse.next();
      response.headers.set('apos;X-RateLimit-Limit'apos;, config.max.toString());
      response.headers.set('apos;X-RateLimit-Remaining'apos;, (config.max - 1).toString());
      response.headers.set('apos;X-RateLimit-Reset'apos;, new Date(currentTime + config.windowMs).toISOString());
      
      return response;
      
    } catch (error) {
      logger.error('apos;Rate limit error'apos;, error as Error, {
        ip,
        type,
        action: 'apos;rate_limit_error'apos;
      });
      
      // En cas d'apos;erreur, on laisse passer la requête
      return NextResponse.next();
    }
  };
}

// Fonction utilitaire pour vérifier le rate limit côté client
export function checkRateLimit(response: Response): boolean {
  const remaining = response.headers.get('apos;X-RateLimit-Remaining'apos;);
  return remaining !== null && parseInt(remaining) > 0;
}

// Fonction pour obtenir les informations de rate limit
export function getRateLimitInfo(response: Response) {
  return {
    limit: response.headers.get('apos;X-RateLimit-Limit'apos;),
    remaining: response.headers.get('apos;X-RateLimit-Remaining'apos;),
    reset: response.headers.get('apos;X-RateLimit-Reset'apos;),
    retryAfter: response.headers.get('apos;Retry-After'apos;)
  };
}

// Middleware spécifique pour les APIs
export const apiRateLimit = createRateLimitMiddleware('apos;api'apos;);

// Middleware spécifique pour l'apos;authentification
export const authRateLimit = createRateLimitMiddleware('apos;auth'apos;);

// Middleware spécifique pour les webhooks
export const webhookRateLimit = createRateLimitMiddleware('apos;webhook'apos;);

// Middleware spécifique pour les missions
export const missionsRateLimit = createRateLimitMiddleware('apos;missions'apos;);

// Middleware spécifique pour les exports
export const exportsRateLimit = createRateLimitMiddleware('apos;exports'apos;);

// Fonction pour appliquer le rate limiting à une route API
export function withRateLimit(
  handler: (request: NextRequest) => Promise<NextResponse>,
  type: keyof typeof rateLimitConfig = 'apos;api'apos;
) {
  return async function(request: NextRequest) {
    const rateLimitMiddleware = createRateLimitMiddleware(type);
    const rateLimitResponse = await rateLimitMiddleware(request);
    
    // Si le rate limit est dépassé, retourner la réponse d'apos;erreur
    if (rateLimitResponse.status === 429) {
      return rateLimitResponse;
    }
    
    // Sinon, exécuter le handler original
    return handler(request);
  };
}
