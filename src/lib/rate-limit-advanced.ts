/**
 * Système de Rate Limiting Avancé pour Beriox AI
 * Protection contre les abus et attaques par déni de service
 */

import { NextRequest, NextResponse } from 'next/server'
import { redisUtils } from './redis'
// Types
interface RateLimitConfig {
  windowMs: number; // Fenêtre de temps en millisecondes
  maxRequests: number; // Nombre maximum de requêtes
  keyGenerator?: (req: NextRequest) => string; // Générateur de clé personnalisé
  skipSuccessfulRequests?: boolean; // Ignorer les requêtes réussies
  skipFailedRequests?: boolean; // Ignorer les requêtes échouées
  message?: string; // Message d'erreur personnalisé
  statusCode?: number; // Code de statut HTTP
  headers?: boolean; // Inclure les headers de rate limit
}

interface RateLimitResult {
  success: boolean
  remaining: number
  resetTime: number
  retryAfter: number
  limit: number
  windowMs: number
}

// Configuration par défaut
const DEFAULT_CONFIG: RateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100,
  message: 'Trop de requêtes, veuillez réessayer plus tard.',
  statusCode: 429,
  headers: true
}
// Générateurs de clés par type de route
const keyGenerators = {
  // Clé basée sur l'IP
  ip: (req: NextRequest) => {
    const forwarded = req.headers.get('x-forwarded-for')
    const realIp = req.headers.get('x-real-ip')
    const ip = forwarded?.split(',')[0] || realIp || req.ip || 'unknown'
    return `rate_limit:ip:${ip}`
  },

  // Clé basée sur l'utilisateur (si authentifié)
  user: (req: NextRequest) => {
    const userId = req.headers.get('x-user-id') || 'anonymous'
    return `rate_limit:user:${userId}`
  },

  // Clé basée sur l'API key
  apiKey: (req: NextRequest) => {
    const apiKey = req.headers.get('x-api-key') || 'no-key'
    return `rate_limit:apikey:${apiKey}`
  },

  // Clé combinée (IP + User + Route)
  combined: (req: NextRequest) => {
    const ip = keyGenerators.ip(req)
    const user = keyGenerators.user(req)
    const route = req.nextUrl?.pathname || 'unknown'
    return `rate_limit:combined:${ip}:${user}:${route}`
  }
}
// Configuration par route
const routeConfigs: Record<string, RateLimitConfig> = {
  // Routes sensibles - plus restrictives
  '/api/auth': {
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 10,
    keyGenerator: keyGenerators.ip,
    message: 'Trop de tentatives de connexion, veuillez réessayer dans 5 minutes.'
  },

  '/api/missions': {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 50,
    keyGenerator: keyGenerators.user,
    message: 'Limite de création de missions atteinte.'
  },

  '/api/stripe': {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 5,
    keyGenerator: keyGenerators.user,
    message: 'Trop de tentatives de paiement, veuillez réessayer dans 1 minute.'
  },

  '/api/refunds': {
    windowMs: 60 * 60 * 1000, // 1 heure
    maxRequests: 3,
    keyGenerator: keyGenerators.user,
    message: 'Limite de demandes de remboursement atteinte.'
  },

  // Routes d'administration - très restrictives
  '/api/admin': {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 20,
    keyGenerator: keyGenerators.combined,
    message: 'Accès administrateur limité.'
  },

  // Routes publiques - plus permissives
  '/api/health': {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
    keyGenerator: keyGenerators.ip,
    skipSuccessfulRequests: true
  },

  '/api/integrations': {
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 30,
    keyGenerator: keyGenerators.user,
    message: 'Limite d\'intégrations atteinte.'
  }
}
/**
 * Vérifie et applique le rate limiting
 */
export async function checkRateLimit(
  req: NextRequest,
  customConfig?: Partial<RateLimitConfig>
): Promise<RateLimitResult> {
  const pathname = req.nextUrl?.pathname || ''
  // Trouver la configuration appropriée
  let config = { ...DEFAULT_CONFIG }
  // Chercher une configuration spécifique pour cette route
  for (const [route, routeConfig] of Object.entries(routeConfigs)) {
    if (pathname.startsWith(route)) {
      config = { ...config, ...routeConfig }
      break
    }
  }
  
  // Appliquer la configuration personnalisée
  if (customConfig) {
    config = { ...config, ...customConfig }
  }

  // Générer la clé de rate limiting
  const keyGenerator = config.keyGenerator || keyGenerators.ip
  const key = keyGenerator(req)
  try {
    // Vérifier le rate limit dans Redis
    const current = await redisUtils.get(key)
    const currentCount = current ? parseInt(current, 10) : 0
    if (currentCount >= config.maxRequests) {
      // Limite atteinte - utiliser une estimation du TTL
      const resetTime = Date.now() + config.windowMs
      const retryAfter = Math.ceil(config.windowMs / 1000)
      return {
        success: false,
        remaining: 0,
        resetTime,
        retryAfter,
        limit: config.maxRequests,
        windowMs: config.windowMs
      }
    }

    // Incrémenter le compteur
    const newCount = currentCount + 1
    await redisUtils.set(key, newCount.toString(), Math.ceil(config.windowMs / 1000))
    return {
      success: true,
      remaining: Math.max(0, config.maxRequests - newCount),
      resetTime: Date.now() + config.windowMs,
      retryAfter: Math.ceil(config.windowMs / 1000),
      limit: config.maxRequests,
      windowMs: config.windowMs
    }
  } catch (error) {
    console.error('Erreur Redis pour rate limiting:', error)
    // En cas d'erreur Redis, permettre la requête
    return {
      success: true,
      remaining: config.maxRequests - 1,
      resetTime: Date.now() + config.windowMs,
      retryAfter: Math.ceil(config.windowMs / 1000),
      limit: config.maxRequests,
      windowMs: config.windowMs
    }
  }
}

/**
 * Middleware de rate limiting pour Next.js
 */
export async function rateLimitMiddleware(
  req: NextRequest,
  customConfig?: Partial<RateLimitConfig>
): Promise<NextResponse | null> {
  const result = await checkRateLimit(req, customConfig)
  if (!result.success) {
    const response = NextResponse.json(
      { 
        error: 'Rate limit exceeded',
        message: customConfig?.message || 'Trop de requêtes, veuillez réessayer plus tard.',
        retryAfter: result.retryAfter
      },
      { status: customConfig?.statusCode || 429 }
    )
    // Ajouter les headers de rate limiting
    if (customConfig?.headers !== false) {
      response.headers.set('X-RateLimit-Limit', result.limit.toString())
      response.headers.set('X-RateLimit-Remaining', result.remaining.toString())
      response.headers.set('X-RateLimit-Reset', result.resetTime.toString())
      response.headers.set('Retry-After', result.retryAfter.toString())
    }

    return response
  }

  return null; // Continuer le traitement
}

/**
 * Fonction utilitaire pour créer un rate limiter spécifique
 */
export function createRateLimiter(config: RateLimitConfig) {
  return (req: NextRequest) => checkRateLimit(req, config)
}

/**
 * Fonction pour réinitialiser le rate limit d'une clé
 */
export async function resetRateLimit(key: string): Promise<void> {
  try {
    await redisUtils.del(key)
  } catch (error) {
    console.error('Erreur lors de la réinitialisation du rate limit:', error)
  }
}

/**
 * Fonction pour obtenir les statistiques de rate limiting
 */
export async function getRateLimitStats(): Promise<Record<string, any>> {
  // Désactivé car redis.keys n'est pas disponible dans le wrapper
  // try {
  //   const keys = await redis.keys('rate_limit:*')
  //   const stats: Record<string, any> = {}
  //   for (const key of keys) {
  //     const count = await redis.get(key)
  //     const ttl = await redis.ttl(key)
  //     stats[key] = {
  //       count: parseInt(count || '0', 10),
  //       ttl,
  //       expiresAt: Date.now() + (ttl * 1000)
  //     }
  //   }

  //   return stats
  // } catch (error) {
  //   console.error('Erreur lors de la récupération des stats:', error)
  //   return {}
  // }
  return {}
}

/**
 * Fonction pour nettoyer les anciens rate limits expirés
 */
export async function cleanupExpiredRateLimits(): Promise<number> {
  // Désactivé car redis.keys et redis.ttl ne sont pas disponibles dans le wrapper
  // try {
  //   const keys = await redis.keys('rate_limit:*')
  //   let cleaned = 0
  //   for (const key of keys) {
  //     const ttl = await redis.ttl(key)
  //     if (ttl <= 0) {
  //       await redis.del(key)
  //       cleaned++
  //     }
  //   }

  //   return cleaned
  // } catch (error) {
  //   console.error('Erreur lors du nettoyage:', error)
  //   return 0
  // }
  return 0
}

/**
 * Wrapper pour les API routes avec rate limiting
 */
export function withRateLimit(
  handler: (req: NextRequest) => Promise<NextResponse>,
  routeName?: string
) {
  return async (req: NextRequest) => {
    // Vérifier le rate limit
    const rateLimitResult = await checkRateLimit(req, routeName ? routeConfigs[routeName] : undefined)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          message: 'Trop de requêtes, veuillez réessayer plus tard.',
          retryAfter: rateLimitResult.retryAfter
        },
        { status: 429 }
      )
    }
    
    // Continuer avec le handler original
    return handler(req)
  }
}

// Export des configurations pour utilisation externe
export { routeConfigs, keyGenerators }
export type { RateLimitConfig, RateLimitResult }