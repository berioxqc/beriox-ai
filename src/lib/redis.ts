// Redis configuration - seulement côté serveur
let redis: any = null
let bullConnection: any = null

// Vérifier si nous sommes dans un environnement compatible avec ioredis
const isCompatibleEnvironment = () => {
  try {
    // Vérifications strictes pour éviter l'Edge Runtime
    if (typeof window !== 'undefined') return false
    if (process.env.NODE_ENV === 'test') return false
    if (typeof process === 'undefined') return false
    if (process.env.NEXT_RUNTIME === 'edge') return false
    if (process.env.NEXT_RUNTIME === 'edge-server') return false
    
    // Vérifier si on est dans un environnement Node.js complet
    return typeof require !== 'undefined' && typeof module !== 'undefined'
  } catch {
    return false
  }
}

// Initialiser Redis seulement dans un environnement compatible
if (isCompatibleEnvironment()) {
  try {
    // Import dynamique pour éviter les erreurs Edge Runtime
    const IORedis = require("ioredis")
    const redisUrl = process.env.REDIS_URL || "redis://localhost:6379"
    
    // Vérifier si l'URL Redis est valide
    if (redisUrl && redisUrl !== "redis://localhost:6379") {
      redis = new IORedis(redisUrl, {
        maxRetriesPerRequest: null,
        retryDelayOnFailover: 100,
        enableReadyCheck: false,
        lazyConnect: true,
        connectTimeout: 5000,
        commandTimeout: 5000
      })
      bullConnection = redis
    } else {
      if (process.env.NODE_ENV !== 'production') {
        console.log('Redis URL not configured, using in-memory fallback')
      }
    }
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('Redis not available, using in-memory fallback:', error.message)
    }
  }
}

// Fonctions utilitaires pour Redis avec gestion d'erreur
export const redisUtils = {
  async get(key: string): Promise<string | null> {
    if (!redis || !isCompatibleEnvironment()) return null
    try {
      return await redis.get(key)
    } catch (error) {
      console.warn('Redis get error:', error)
      return null
    }
  },

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (!redis || !isCompatibleEnvironment()) return
    try {
      if (ttl) {
        await redis.setex(key, ttl, value)
      } else {
        await redis.set(key, value)
      }
    } catch (error) {
      console.warn('Redis set error:', error)
    }
  },

  async del(key: string): Promise<void> {
    if (!redis || !isCompatibleEnvironment()) return
    try {
      await redis.del(key)
    } catch (error) {
      console.warn('Redis del error:', error)
    }
  },

  async exists(key: string): Promise<boolean> {
    if (!redis || !isCompatibleEnvironment()) return false
    try {
      const result = await redis.exists(key)
      return result === 1
    } catch (error) {
      console.warn('Redis exists error:', error)
      return false
    }
  },

  async expire(key: string, ttl: number): Promise<void> {
    if (!redis || !isCompatibleEnvironment()) return
    try {
      await redis.expire(key, ttl)
    } catch (error) {
      console.warn('Redis expire error:', error)
    }
  }
}

export { redis, bullConnection }