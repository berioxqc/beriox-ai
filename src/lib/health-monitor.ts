import { prisma } from './prisma'
import { logger } from './logger'
import { redisUtils } from './redis'
// ============================================================================
// TYPES ET INTERFACES
// ============================================================================

export enum HealthStatus {
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  UNHEALTHY = 'unhealthy',
  CRITICAL = 'critical'
}

export interface HealthCheck {
  name: string
  status: HealthStatus
  responseTime: number
  lastCheck: Date
  error?: string
  details?: unknown
}

export interface HealthReport {
  status: HealthStatus
  timestamp: Date
  uptime: number
  version: string
  environment: string
  checks: HealthCheck[]
  summary: {
    total: number
    healthy: number
    degraded: number
    unhealthy: number
    critical: number
  }
  metrics: {
    responseTime: {
      avg: number
      min: number
      max: number
    }
    errorRate: number
    throughput: number
  }
}

export interface HealthCheckConfig {
  name: string
  check: () => Promise<HealthCheck>
  interval: number; // en millisecondes
  timeout: number; // en millisecondes
  critical: boolean; // si true, l'échec de ce check rend le système unhealthy
  retries: number
}

// ============================================================================
// CHECKS DE SANTÉ SPÉCIALISÉS
// ============================================================================

/**
 * Vérification de la base de données PostgreSQL
 */
async function checkDatabase(): Promise<HealthCheck> {
  const startTime = Date.now()
  try {
    // Test de connexion simple
    await prisma.$queryRaw`SELECT 1`
    // Test de performance
    const startPerf = Date.now()
    await prisma.user.count()
    const dbPerf = Date.now() - startPerf
    const responseTime = Date.now() - startTime
    return {
      name: 'database',
      status: dbPerf < 1000 ? HealthStatus.HEALTHY : HealthStatus.DEGRADED,
      responseTime,
      lastCheck: new Date(),
      details: {
        performance: dbPerf,
        connectionPool: 'active'
      }
    }
  } catch (error) {
    return {
      name: 'database',
      status: HealthStatus.CRITICAL,
      responseTime: Date.now() - startTime,
      lastCheck: new Date(),
      error: error instanceof Error ? error.message : 'Unknown database error',
      details: { error }
    }
  }
}

/**
 * Vérification du cache Redis
 */
async function checkRedis(): Promise<HealthCheck> {
  const startTime = Date.now()
  try {
    // Test de connexion
    await redisUtils.ping()
    // Test de performance
    const startPerf = Date.now()
    await redisUtils.set('health_check', 'test', 10)
    await redisUtils.get('health_check')
    await redisUtils.del('health_check')
    const redisPerf = Date.now() - startPerf
    const responseTime = Date.now() - startTime
    return {
      name: 'redis',
      status: redisPerf < 100 ? HealthStatus.HEALTHY : HealthStatus.DEGRADED,
      responseTime,
      lastCheck: new Date(),
      details: {
        performance: redisPerf,
        memory: 'available'
      }
    }
  } catch (error) {
    return {
      name: 'redis',
      status: HealthStatus.UNHEALTHY,
      responseTime: Date.now() - startTime,
      lastCheck: new Date(),
      error: error instanceof Error ? error.message : 'Redis connection failed',
      details: { error }
    }
  }
}

/**
 * Vérification des services externes
 */
async function checkExternalServices(): Promise<HealthCheck> {
  const startTime = Date.now()
  const services = [
    { name: 'stripe', url: 'https://api.stripe.com/v1/account' },
    { name: 'openai', url: 'https://api.openai.com/v1/models' },
    { name: 'google_oauth', url: 'https://www.googleapis.com/oauth2/v1/tokeninfo' }
  ]
  const results = await Promise.allSettled(
    services.map(async (service) => {
      const response = await fetch(service.url, {
        method: 'HEAD',
        headers: {
          'User-Agent': 'Beriox-Health-Check/1.0'
        }
      })
      return { name: service.name, status: response.status }
    })
  )
  const failedServices = results.filter(
    (result) => result.status === 'rejected' || 
    (result.status === 'fulfilled' && result.value.status >= 500)
  )
  const responseTime = Date.now() - startTime
  let status = HealthStatus.HEALTHY
  if (failedServices.length === services.length) {
    status = HealthStatus.CRITICAL
  } else if (failedServices.length > 0) {
    status = HealthStatus.DEGRADED
  }
  
  return {
    name: 'external_services',
    status,
    responseTime,
    lastCheck: new Date(),
    details: {
      total: services.length,
      failed: failedServices.length,
      services: results.map((result, index) => ({
        name: services[index].name,
        status: result.status === 'fulfilled' ? 'ok' : 'failed'
      }))
    }
  }
}

/**
 * Vérification de l'espace disque et mémoire
 */
async function checkSystemResources(): Promise<HealthCheck> {
  const startTime = Date.now()
  try {
    // Simulation des métriques système
    // En production, utilisez des bibliothèques comme 'systeminformation'
    const memoryUsage = process.memoryUsage()
    const cpuUsage = process.cpuUsage()
    const memoryPercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100
    const isMemoryHealthy = memoryPercent < 80
    const responseTime = Date.now() - startTime
    return {
      name: 'system_resources',
      status: isMemoryHealthy ? HealthStatus.HEALTHY : HealthStatus.DEGRADED,
      responseTime,
      lastCheck: new Date(),
      details: {
        memory: {
          used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
          total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
          percent: Math.round(memoryPercent)
        },
        cpu: {
          user: Math.round(cpuUsage.user / 1000),
          system: Math.round(cpuUsage.system / 1000)
        }
      }
    }
  } catch (error) {
    return {
      name: 'system_resources',
      status: HealthStatus.UNHEALTHY,
      responseTime: Date.now() - startTime,
      lastCheck: new Date(),
      error: error instanceof Error ? error.message : 'System check failed',
      details: { error }
    }
  }
}

/**
 * Vérification des APIs internes
 */
async function checkInternalAPIs(): Promise<HealthCheck> {
  const startTime = Date.now()
  const apis = [
    '/api/health',
    '/api/missions',
    '/api/user/stats'
  ]
  const results = await Promise.allSettled(
    apis.map(async (api) => {
      const response = await fetch(`http://localhost:3000${api}`, {
        method: 'GET',
        headers: { 'User-Agent': 'Beriox-Health-Check/1.0' }
      })
      return { name: api, status: response.status }
    })
  )
  const failedAPIs = results.filter(
    (result) => result.status === 'rejected' || 
    (result.status === 'fulfilled' && result.value.status >= 500)
  )
  const responseTime = Date.now() - startTime
  let status = HealthStatus.HEALTHY
  if (failedAPIs.length === apis.length) {
    status = HealthStatus.CRITICAL
  } else if (failedAPIs.length > 0) {
    status = HealthStatus.DEGRADED
  }
  
  return {
    name: 'internal_apis',
    status,
    responseTime,
    lastCheck: new Date(),
    details: {
      total: apis.length,
      failed: failedAPIs.length,
      apis: results.map((result, index) => ({
        name: apis[index],
        status: result.status === 'fulfilled' ? 'ok' : 'failed'
      }))
    }
  }
}

// ============================================================================
// MONITEUR DE SANTÉ PRINCIPAL
// ============================================================================

export class HealthMonitor {
  private static instance: HealthMonitor
  private checks: Map<string, HealthCheck> = new Map()
  private configs: HealthCheckConfig[] = []
  private isRunning = false
  private startTime = Date.now()
  private checkIntervals: NodeJS.Timeout[] = []
  private constructor() {
    this.initializeChecks()
  }

  static getInstance(): HealthMonitor {
    if (!HealthMonitor.instance) {
      HealthMonitor.instance = new HealthMonitor()
    }
    return HealthMonitor.instance
  }

  /**
   * Initialise les vérifications de santé
   */
  private initializeChecks(): void {
    this.configs = [
      {
        name: 'database',
        check: checkDatabase,
        interval: 30000, // 30 secondes
        timeout: 10000,  // 10 secondes
        critical: true,
        retries: 3
      },
      {
        name: 'redis',
        check: checkRedis,
        interval: 30000, // 30 secondes
        timeout: 5000,   // 5 secondes
        critical: false,
        retries: 2
      },
      {
        name: 'external_services',
        check: checkExternalServices,
        interval: 60000, // 1 minute
        timeout: 15000,  // 15 secondes
        critical: false,
        retries: 2
      },
      {
        name: 'system_resources',
        check: checkSystemResources,
        interval: 30000, // 30 secondes
        timeout: 5000,   // 5 secondes
        critical: false,
        retries: 1
      },
      {
        name: 'internal_apis',
        check: checkInternalAPIs,
        interval: 45000, // 45 secondes
        timeout: 10000,  // 10 secondes
        critical: false,
        retries: 2
      }
    ]
  }

  /**
   * Démarre le monitoring
   */
  start(): void {
    if (this.isRunning) {
      logger.warn('Health monitor is already running')
      return
    }

    logger.info('Starting health monitor')
    this.isRunning = true
    // Démarrer toutes les vérifications
    this.configs.forEach(config => {
      this.startCheck(config)
    })
    // Vérification initiale
    this.runAllChecks()
  }

  /**
   * Arrête le monitoring
   */
  stop(): void {
    if (!this.isRunning) {
      return
    }

    logger.info('Stopping health monitor')
    this.isRunning = false
    // Arrêter tous les intervalles
    this.checkIntervals.forEach(interval => clearInterval(interval))
    this.checkIntervals = []
  }

  /**
   * Démarre une vérification spécifique
   */
  private startCheck(config: HealthCheckConfig): void {
    const interval = setInterval(async () => {
      if (!this.isRunning) return
      await this.runCheck(config)
    }, config.interval)
    this.checkIntervals.push(interval)
  }

  /**
   * Exécute une vérification avec retry
   */
  private async runCheck(config: HealthCheckConfig): Promise<void> {
    let lastError: Error | null = null
    for (let attempt = 1; attempt <= config.retries; attempt++) {
      try {
        const check = await Promise.race([
          config.check(),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), config.timeout)
          )
        ])
        this.checks.set(config.name, check)
        // Log du résultat
        if (check.status === HealthStatus.HEALTHY) {
          logger.debug(`Health check ${config.name} passed`, {
            action: 'health_check_success',
            metadata: { check: config.name, responseTime: check.responseTime }
          })
        } else {
          logger.warn(`Health check ${config.name} failed`, {
            action: 'health_check_failed',
            metadata: { 
              check: config.name, 
              status: check.status, 
              error: check.error,
              responseTime: check.responseTime 
            }
          })
        }

        return
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error')
        if (attempt < config.retries) {
          logger.debug(`Health check ${config.name} attempt ${attempt} failed, retrying...`, {
            action: 'health_check_retry',
            metadata: { check: config.name, attempt, error: lastError.message }
          })
          // Attendre avant de réessayer
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
        }
      }
    }

    // Toutes les tentatives ont échoué
    const failedCheck: HealthCheck = {
      name: config.name,
      status: config.critical ? HealthStatus.CRITICAL : HealthStatus.UNHEALTHY,
      responseTime: config.timeout,
      lastCheck: new Date(),
      error: lastError?.message || 'All retry attempts failed',
      details: { attempts: config.retries, lastError }
    }
    this.checks.set(config.name, failedCheck)
    logger.error(`Health check ${config.name} failed after ${config.retries} attempts`, {
      action: 'health_check_critical_failure',
      metadata: { 
        check: config.name, 
        status: failedCheck.status,
        error: failedCheck.error,
        critical: config.critical 
      }
    })
  }

  /**
   * Exécute toutes les vérifications immédiatement
   */
  async runAllChecks(): Promise<void> {
    logger.info('Running all health checks')
    const promises = this.configs.map(config => this.runCheck(config))
    await Promise.allSettled(promises)
  }

  /**
   * Génère un rapport de santé complet
   */
  generateReport(): HealthReport {
    const checks = Array.from(this.checks.values())
    const now = new Date()
    // Calculer les statistiques
    const summary = {
      total: checks.length,
      healthy: checks.filter(c => c.status === HealthStatus.HEALTHY).length,
      degraded: checks.filter(c => c.status === HealthStatus.DEGRADED).length,
      unhealthy: checks.filter(c => c.status === HealthStatus.UNHEALTHY).length,
      critical: checks.filter(c => c.status === HealthStatus.CRITICAL).length
    }
    // Déterminer le statut global
    let overallStatus = HealthStatus.HEALTHY
    if (summary.critical > 0) {
      overallStatus = HealthStatus.CRITICAL
    } else if (summary.unhealthy > 0) {
      overallStatus = HealthStatus.UNHEALTHY
    } else if (summary.degraded > 0) {
      overallStatus = HealthStatus.DEGRADED
    }

    // Calculer les métriques de performance
    const responseTimes = checks.map(c => c.responseTime).filter(t => t > 0)
    const avgResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
      : 0
    const errorRate = summary.total > 0 
      ? ((summary.unhealthy + summary.critical) / summary.total) * 100 
      : 0
    return {
      status: overallStatus,
      timestamp: now,
      uptime: Date.now() - this.startTime.getTime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      checks,
      summary,
      metrics: {
        responseTime: {
          avg: Math.round(avgResponseTime),
          min: responseTimes.length > 0 ? Math.min(...responseTimes) : 0,
          max: responseTimes.length > 0 ? Math.max(...responseTimes) : 0
        },
        errorRate: Math.round(errorRate * 100) / 100,
        throughput: summary.total // nombre de checks par cycle
      }
    }
  }

  /**
   * Obtient le statut d'un check spécifique
   */
  getCheckStatus(name: string): HealthCheck | null {
    return this.checks.get(name) || null
  }

  /**
   * Vérifie si le système est en bonne santé
   */
  isHealthy(): boolean {
    const report = this.generateReport()
    return report.status === HealthStatus.HEALTHY || report.status === HealthStatus.DEGRADED
  }

  /**
   * Obtient les statistiques de monitoring
   */
  getStats(): Record<string, any> {
    const report = this.generateReport()
    return {
      status: report.status,
      uptime: report.uptime,
      checks: report.summary,
      metrics: report.metrics,
      lastUpdate: report.timestamp
    }
  }
}

// Instance globale
export const healthMonitor = HealthMonitor.getInstance()