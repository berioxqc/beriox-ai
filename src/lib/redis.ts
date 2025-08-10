// Redis configuration - seulement côté serveur
let redis: any = null;
let bullConnection: any = null;

// Vérifier si nous sommes côté serveur (pas dans Edge Runtime)
if (typeof window === 'undefined' && process.env.NODE_ENV !== 'test') {
  try {
    const IORedis = require("ioredis");
    const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
    
    redis = new IORedis(redisUrl, {
      maxRetriesPerRequest: null, // Required for BullMQ
      retryDelayOnFailover: 100,
      enableReadyCheck: false,
      lazyConnect: true
    });
    
    bullConnection = redis; // BullMQ accepts an ioredis instance
  } catch (error) {
    console.warn('Redis not available:', error.message);
  }
}

// Fonctions utilitaires pour Redis avec gestion d'erreur
export const redisUtils = {
  async get(key: string): Promise<string | null> {
    if (!redis) return null;
    try {
      return await redis.get(key);
    } catch (error) {
      console.warn('Redis get error:', error);
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
      console.warn('Redis set error:', error);
    }
  },

  async del(key: string): Promise<void> {
    if (!redis) return;
    try {
      await redis.del(key);
    } catch (error) {
      console.warn('Redis del error:', error);
    }
  },

  async exists(key: string): Promise<boolean> {
    if (!redis) return false;
    try {
      const result = await redis.exists(key);
      return result === 1;
    } catch (error) {
      console.warn('Redis exists error:', error);
      return false;
    }
  },

  async expire(key: string, ttl: number): Promise<void> {
    if (!redis) return;
    try {
      await redis.expire(key, ttl);
    } catch (error) {
      console.warn('Redis expire error:', error);
    }
  }
};

export { redis, bullConnection };


