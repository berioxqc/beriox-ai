// Redis configuration - seulement côté serveur
let redis: any = null;
let bullConnection: any = null;

// Vérifier si nous sommes côté serveur (pas dans Edge Runtime)
if (typeof window === 'apos;undefined'apos; && process.env.NODE_ENV !== 'apos;test'apos;) {
  try {
    const IORedis = require("ioredis");
    const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
    
    // Vérifier si l'apos;URL Redis est valide
    if (redisUrl && redisUrl !== "redis://localhost:6379") {
      redis = new IORedis(redisUrl, {
        maxRetriesPerRequest: null, // Required for BullMQ
        retryDelayOnFailover: 100,
        enableReadyCheck: false,
        lazyConnect: true,
        connectTimeout: 5000,
        commandTimeout: 5000
      });
      
      bullConnection = redis; // BullMQ accepts an ioredis instance
    } else {
      // Log silencieux en production
      if (process.env.NODE_ENV !== 'apos;production'apos;) {
        console.log('apos;Redis URL not configured, using in-memory fallback'apos;);
      }
    }
  } catch (error) {
    // Log silencieux en production
    if (process.env.NODE_ENV !== 'apos;production'apos;) {
      console.log('apos;Redis not available, using in-memory fallback:'apos;, error.message);
    }
  }
}

// Fonctions utilitaires pour Redis avec gestion d'apos;erreur
export const redisUtils = {
  async get(key: string): Promise<string | null> {
    if (!redis) return null;
    try {
      return await redis.get(key);
    } catch (error) {
      console.warn('apos;Redis get error:'apos;, error);
      return null;
    }
  },

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (!redis) return;
    try {
      if (ttl) {
        await redis.setex(key, ttl, value);
      } else {
        await redis.set(key, value);
      }
    } catch (error) {
      console.warn('apos;Redis set error:'apos;, error);
    }
  },

  async del(key: string): Promise<void> {
    if (!redis) return;
    try {
      await redis.del(key);
    } catch (error) {
      console.warn('apos;Redis del error:'apos;, error);
    }
  },

  async exists(key: string): Promise<boolean> {
    if (!redis) return false;
    try {
      const result = await redis.exists(key);
      return result === 1;
    } catch (error) {
      console.warn('apos;Redis exists error:'apos;, error);
      return false;
    }
  },

  async expire(key: string, ttl: number): Promise<void> {
    if (!redis) return;
    try {
      await redis.expire(key, ttl);
    } catch (error) {
      console.warn('apos;Redis expire error:'apos;, error);
    }
  }
};

export { redis, bullConnection };


