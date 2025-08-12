/**
 * Système de Cache Intelligent pour Beriox AI
 * Optimisation des performances avec cache Redis
 */

// Import Redis sécurisé
import { redisUtils } from './redis'
// Types
interface CacheConfig {
  ttl: number; // Time to live en secondes
  prefix: string; // Préfixe pour les clés
  maxSize?: number; // Taille maximale du cache (en nombre d'éléments)
  compression?: boolean; // Activer la compression
}

interface CacheStats {
  hits: number
  misses: number
  keys: number
  memory: number
  hitRate: number
}

// Configuration par défaut
const DEFAULT_CONFIG: CacheConfig = {
  ttl: 300, // 5 minutes
  prefix: 'cache:',
  compression: false
}
// Configurations spécifiques par type de données
const CACHE_CONFIGS: Record<string, CacheConfig> = {
  // Cache des missions - court terme
  missions: {
    ttl: 60, // 1 minute
    prefix: 'cache:missions:',
    maxSize: 1000
  },

  // Cache des utilisateurs - moyen terme
  users: {
    ttl: 300, // 5 minutes
    prefix: 'cache:users:',
    maxSize: 500
  },

  // Cache des intégrations - long terme
  integrations: {
    ttl: 1800, // 30 minutes
    prefix: 'cache:integrations:',
    maxSize: 200
  },

  // Cache des analytics - très long terme
  analytics: {
    ttl: 3600, // 1 heure
    prefix: 'cache:analytics:',
    maxSize: 100
  },

  // Cache des recommandations IA - court terme
  recommendations: {
    ttl: 120, // 2 minutes
    prefix: 'cache:recommendations:',
    maxSize: 500
  }
}
/**
 * Classe de cache intelligent
 */
class IntelligentCache {
  private config: CacheConfig
  private stats: { hits: number; misses: number } = { hits: 0, misses: 0 }
  constructor(type: string = 'default') {
    this.config = { ...DEFAULT_CONFIG, ...CACHE_CONFIGS[type] }
  }

  /**
   * Génère une clé de cache
   */
  private generateKey(key: string): string {
    return `${this.config.prefix}${key}`
  }

  /**
   * Compresse les données si activé
   */
  private compress(data: any): string {
    if (this.config.compression) {
      // Compression simple avec JSON.stringify
      return JSON.stringify(data)
    }
    return JSON.stringify(data)
  }

  /**
   * Décompresse les données si activé
   */
  private decompress(data: string): any {
    if (this.config.compression) {
      return JSON.parse(data)
    }
    return JSON.parse(data)
  }

  /**
   * Récupère une valeur du cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const cacheKey = this.generateKey(key)
      const cached = await redisUtils.get(cacheKey)
      if (cached) {
        this.stats.hits++
        return this.decompress(cached)
      } else {
        this.stats.misses++
        return null
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du cache:', error)
      this.stats.misses++
      return null
    }
  }

  /**
   * Stocke une valeur dans le cache
   */
  async set(key: string, value: any, customTtl?: number): Promise<void> {
    try {
      const cacheKey = this.generateKey(key)
      const ttl = customTtl || this.config.ttl
      const compressed = this.compress(value)
      await redisUtils.set(cacheKey, compressed, ttl)
      // Vérifier la taille maximale si configurée
      if (this.config.maxSize) {
        await this.enforceMaxSize()
      }
    } catch (error) {
      console.error('Erreur lors du stockage en cache:', error)
    }
  }

  /**
   * Supprime une valeur du cache
   */
  async delete(key: string): Promise<void> {
    try {
      const cacheKey = this.generateKey(key)
      await redisUtils.del(cacheKey)
    } catch (error) {
      console.error('Erreur lors de la suppression du cache:', error)
    }
  }

  /**
   * Vérifie si une clé existe dans le cache
   */
  async exists(key: string): Promise<boolean> {
    try {
      const cacheKey = this.generateKey(key)
      const exists = await redisUtils.exists(cacheKey)
      return exists === 1
    } catch (error) {
      console.error('Erreur lors de la vérification du cache:', error)
      return false
    }
  }

  /**
   * Récupère ou met en cache une valeur avec une fonction de génération
   */
  async getOrSet<T>(
    key: string,
    generator: () => Promise<T>,
    customTtl?: number
  ): Promise<T> {
    // Essayer de récupérer du cache
    const cached = await this.get<T>(key)
    if (cached !== null) {
      return cached
    }

    // Générer la valeur
    const value = await generator()
    // Mettre en cache
    await this.set(key, value, customTtl)
    return value
  }

  /**
   * Met à jour le TTL d'une clé
   */
  async touch(key: string, customTtl?: number): Promise<void> {
    try {
      const cacheKey = this.generateKey(key)
      const ttl = customTtl || this.config.ttl
      // Récupérer la valeur actuelle
      const value = await redisUtils.get(cacheKey)
      if (value) {
        // Remettre avec le nouveau TTL
                  await redisUtils.set(cacheKey, value, ttl)
      }
    } catch (error) {
      console.error('Erreur lors du touch du cache:', error)
    }
  }

  /**
   * Applique la limite de taille maximale (désactivée temporairement)
   */
  private async enforceMaxSize(): Promise<void> {
    // Désactivé car redis.keys n'est pas disponible dans le wrapper
    // try {
    //   const pattern = `${this.config.prefix}*`
    //   const keys = await redis.keys(pattern)
    //   if (keys.length > this.config.maxSize!) {
    //     // Supprimer les clés les plus anciennes
    //     const keysToDelete = keys
    //       .slice(0, keys.length - this.config.maxSize!)
    //       .map(key => key.replace(this.config.prefix, ''))
    //     for (const key of keysToDelete) {
    //       await this.delete(key)
    //     }
    //   }
    // } catch (error) {
    //   console.error('Erreur lors de l\'application de la taille maximale:', error)
    // }
  }

  /**
   * Nettoie le cache expiré (désactivé temporairement)
   */
  async cleanup(): Promise<number> {
    // Désactivé car redis.keys et redis.ttl ne sont pas disponibles dans le wrapper
    // try {
    //   const pattern = `${this.config.prefix}*`
    //   const keys = await redis.keys(pattern)
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
    //   console.error('Erreur lors du nettoyage du cache:', error)
    //   return 0
    // }
    return 0
  }

  /**
   * Récupère les statistiques du cache
   */
  async getStats(): Promise<CacheStats> {
    try {
      // Désactivé car redis.keys n'est pas disponible dans le wrapper
      // const pattern = `${this.config.prefix}*`
      // const keys = await redis.keys(pattern)
      const total = this.stats.hits + this.stats.misses
      const hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0
      return {
        hits: this.stats.hits,
        misses: this.stats.misses,
        keys: 0, // Désactivé temporairement
        memory: 0, // Redis gère la mémoire automatiquement
        hitRate
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des stats:', error)
      return {
        hits: this.stats.hits,
        misses: this.stats.misses,
        keys: 0,
        memory: 0,
        hitRate: 0
      }
    }
  }

  /**
   * Vide tout le cache (désactivé temporairement)
   */
  async clear(): Promise<void> {
    // Désactivé car redis.keys n'est pas disponible dans le wrapper
    // try {
    //   const pattern = `${this.config.prefix}*`
    //   const keys = await redis.keys(pattern)
    //   if (keys.length > 0) {
    //     await redis.del(...keys)
    //   }
    // } catch (error) {
    //   console.error('Erreur lors du vidage du cache:', error)
    // }
  }
}

// Instances de cache préconfigurées
export const cacheInstances = {
  missions: new IntelligentCache('missions'),
  users: new IntelligentCache('users'),
  integrations: new IntelligentCache('integrations'),
  analytics: new IntelligentCache('analytics'),
  recommendations: new IntelligentCache('recommendations'),
  default: new IntelligentCache('default')
}
// Fonctions utilitaires pour le cache
export const cache = {
  /**
   * Cache intelligent pour les missions
   */
  missions: {
    async get<T>(key: string): Promise<T | null> {
      return cacheInstances.missions.get<T>(key)
    },
    async set(key: string, value: any, ttl?: number): Promise<void> {
      return cacheInstances.missions.set(key, value, ttl)
    },
    async getOrSet<T>(key: string, generator: () => Promise<T>, ttl?: number): Promise<T> {
      return cacheInstances.missions.getOrSet(key, generator, ttl)
    },
    async delete(key: string): Promise<void> {
      return cacheInstances.missions.delete(key)
    }
  },

  /**
   * Cache intelligent pour les utilisateurs
   */
  users: {
    async get<T>(key: string): Promise<T | null> {
      return cacheInstances.users.get<T>(key)
    },
    async set(key: string, value: any, ttl?: number): Promise<void> {
      return cacheInstances.users.set(key, value, ttl)
    },
    async getOrSet<T>(key: string, generator: () => Promise<T>, ttl?: number): Promise<T> {
      return cacheInstances.users.getOrSet(key, generator, ttl)
    },
    async delete(key: string): Promise<void> {
      return cacheInstances.users.delete(key)
    }
  },

  /**
   * Cache intelligent pour les intégrations
   */
  integrations: {
    async get<T>(key: string): Promise<T | null> {
      return cacheInstances.integrations.get<T>(key)
    },
    async set(key: string, value: any, ttl?: number): Promise<void> {
      return cacheInstances.integrations.set(key, value, ttl)
    },
    async getOrSet<T>(key: string, generator: () => Promise<T>, ttl?: number): Promise<T> {
      return cacheInstances.integrations.getOrSet(key, generator, ttl)
    },
    async delete(key: string): Promise<void> {
      return cacheInstances.integrations.delete(key)
    }
  },

  /**
   * Cache intelligent pour les recommandations IA
   */
  recommendations: {
    async get<T>(key: string): Promise<T | null> {
      return cacheInstances.recommendations.get<T>(key)
    },
    async set(key: string, value: any, ttl?: number): Promise<void> {
      return cacheInstances.recommendations.set(key, value, ttl)
    },
    async getOrSet<T>(key: string, generator: () => Promise<T>, ttl?: number): Promise<T> {
      return cacheInstances.recommendations.getOrSet(key, generator, ttl)
    },
    async delete(key: string): Promise<void> {
      return cacheInstances.recommendations.delete(key)
    }
  }
}
/**
 * Fonction pour obtenir les statistiques globales du cache
 */
export async function getGlobalCacheStats(): Promise<Record<string, CacheStats>> {
  const stats: Record<string, CacheStats> = {}
  for (const [name, instance] of Object.entries(cacheInstances)) {
    stats[name] = await instance.getStats()
  }

  return stats
}

/**
 * Fonction pour nettoyer tous les caches
 */
export async function cleanupAllCaches(): Promise<Record<string, number>> {
  const results: Record<string, number> = {}
  for (const [name, instance] of Object.entries(cacheInstances)) {
    results[name] = await instance.cleanup()
  }

  return results
}

// Export des types
export type { CacheConfig, CacheStats }
export { IntelligentCache }