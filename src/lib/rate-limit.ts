import rateLimit from 'express-rate-limit'
import { NextRequest, NextResponse } from 'next/server'
import { logger } from './logger'
// Configuration du rate limiting
export const rateLimitConfig = {
  // Limite générale pour les APIs
  api: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requêtes par fenêtre
    message: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.',
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
  },
  
  // Limite pour l'authentification
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 tentatives de connexion
    message: 'Trop de tentatives de connexion, veuillez réessayer plus tard.',
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    skipFailedRequests: false,
  },
  
  // Limite pour les webhooks
  webhook: {
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 webhooks par minute
    message: 'Trop de webhooks reçus, veuillez ralentir.',
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
  },
  
  // Limite pour les missions
  missions: {
    windowMs: 60 * 1000, // 1 minute
    max: 20, // 20 missions par minute
    message: 'Trop de missions créées, veuillez ralentir.',
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
  },
  
  // Limite pour les exports
  exports: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 10, // 10 exports par 5 minutes
    message: 'Trop d\'exports demandés, veuillez réessayer plus tard.',
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
  }
}
// Middleware de rate limiting pour Next.js
export function createRateLimitMiddleware(type: keyof typeof rateLimitConfig) {
  const config = rateLimitConfig[type]
  return async function rateLimitMiddleware(request: NextRequest) {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'
    // Clé unique pour le rate limiting
    const key = `${ip}:${type}`
    try {
      // Vérification du rate limit (simulation - en production, utiliser Redis)
      const currentTime = Date.now()
      const windowStart = currentTime - config.windowMs
      // Ici, vous devriez implémenter la logique de vérification avec Redis
      // Pour l'instant, on simule avec une approche simple
      
      logger.info('Rate limit check', {
        ip,
        type,
        userAgent,
        action: 'rate_limit_check'
      })
      // Si le rate limit est dépassé
      if (Math.random() < 0.01) { // 1% de chance pour la démo
        logger.warn('Rate limit exceeded', {
          ip,
          type,
          userAgent,
          action: 'rate_limit_exceeded'
        })
        return NextResponse.json(
          { 
            error: config.message,
            retryAfter: Math.ceil(config.windowMs / 1000)
          },
          { 
            status: 429,
            headers: {
              'Retry-After': Math.ceil(config.windowMs / 1000).toString(),
              'X-RateLimit-Limit': config.max.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': new Date(currentTime + config.windowMs).toISOString()
            }
          }
        )
      }
      
      // Ajout des headers de rate limit
      const response = NextResponse.next()
      response.headers.set('X-RateLimit-Limit', config.max.toString())
      response.headers.set('X-RateLimit-Remaining', (config.max - 1).toString())
      response.headers.set('X-RateLimit-Reset', new Date(currentTime + config.windowMs).toISOString())
      return response
    } catch (error) {
      logger.error('Rate limit error', error as Error, {
        ip,
        type,
        action: 'rate_limit_error'
      })
      // En cas d'erreur, on laisse passer la requête
      return NextResponse.next()
    }
  }
}

// Fonction utilitaire pour vérifier le rate limit côté client
export function checkRateLimit(response: Response): boolean {
  const remaining = response.headers.get('X-RateLimit-Remaining')
  return remaining !== null && parseInt(remaining) > 0
}

// Fonction pour obtenir les informations de rate limit
export function getRateLimitInfo(response: Response) {
  return {
    limit: response.headers.get('X-RateLimit-Limit'),
    remaining: response.headers.get('X-RateLimit-Remaining'),
    reset: response.headers.get('X-RateLimit-Reset'),
    retryAfter: response.headers.get('Retry-After')
  }
}

// Middleware spécifique pour les APIs
export const apiRateLimit = createRateLimitMiddleware('api')
// Middleware spécifique pour l'authentification
export const authRateLimit = createRateLimitMiddleware('auth')
// Middleware spécifique pour les webhooks
export const webhookRateLimit = createRateLimitMiddleware('webhook')
// Middleware spécifique pour les missions
export const missionsRateLimit = createRateLimitMiddleware('missions')
// Middleware spécifique pour les exports
export const exportsRateLimit = createRateLimitMiddleware('exports')
// Fonction pour appliquer le rate limiting à une route API
export function withRateLimit(
  handler: (request: NextRequest) => Promise<NextResponse>,
  type: keyof typeof rateLimitConfig = 'api'
) {
  return async function(request: NextRequest) {
    const rateLimitMiddleware = createRateLimitMiddleware(type)
    const rateLimitResponse = await rateLimitMiddleware(request)
    // Si le rate limit est dépassé, retourner la réponse d'erreur
    if (rateLimitResponse.status === 429) {
      return rateLimitResponse
    }
    
    // Sinon, exécuter le handler original
    return handler(request)
  }
}
