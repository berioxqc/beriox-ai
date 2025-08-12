import { logger } from 'apos;@/lib/logger'apos;;
import { redis } from 'apos;@/lib/redis'apos;;
import { prisma } from 'apos;@/lib/prisma'apos;;

export interface DeploymentMetrics {
  deploymentId: string;
  timestamp: Date;
  version: string;
  environment: 'apos;staging'apos; | 'apos;production'apos;;
  health: {
    database: boolean;
    redis: boolean;
    externalApis: boolean;
    responseTime: number;
  };
  errors: {
    count: number;
    rate: number;
    critical: number;
  };
  performance: {
    memoryUsage: number;
    cpuUsage: number;
    responseTime: number;
  };
}

export interface ErrorAlert {
  id: string;
  timestamp: Date;
  level: 'apos;low'apos; | 'apos;medium'apos; | 'apos;high'apos; | 'apos;critical'apos;;
  message: string;
  context: Record<string, any>;
  resolved: boolean;
}

export class DeploymentMonitor {
  private static instance: DeploymentMonitor;
  private alerts: ErrorAlert[] = [];
  private metrics: DeploymentMetrics[] = [];
  private checkInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.startMonitoring();
  }

  static getInstance(): DeploymentMonitor {
    if (!DeploymentMonitor.instance) {
      DeploymentMonitor.instance = new DeploymentMonitor();
    }
    return DeploymentMonitor.instance;
  }

  private async startMonitoring(): Promise<void> {
    // Vérification toutes les 30 secondes
    this.checkInterval = setInterval(async () => {
      await this.performHealthCheck();
    }, 30000);

    // Vérification complète toutes les 5 minutes
    setInterval(async () => {
      await this.performFullHealthCheck();
    }, 300000);

    logger.info('apos;🚀 Deployment monitoring started'apos;);
  }

  private async performHealthCheck(): Promise<void> {
    try {
      const startTime = Date.now();
      
      // Vérifications rapides
      const [dbHealth, redisHealth, apiHealth] = await Promise.allSettled([
        this.checkDatabaseHealth(),
        this.checkRedisHealth(),
        this.checkExternalApisHealth()
      ]);

      const responseTime = Date.now() - startTime;

      const metrics: DeploymentMetrics = {
        deploymentId: process.env.VERCEL_DEPLOYMENT_ID || 'apos;local'apos;,
        timestamp: new Date(),
        version: process.env.npm_package_version || 'apos;1.0.0'apos;,
        environment: (process.env.NODE_ENV as 'apos;staging'apos; | 'apos;production'apos;) || 'apos;production'apos;,
        health: {
          database: dbHealth.status === 'apos;fulfilled'apos; && dbHealth.value,
          redis: redisHealth.status === 'apos;fulfilled'apos; && redisHealth.value,
          externalApis: apiHealth.status === 'apos;fulfilled'apos; && apiHealth.value,
          responseTime
        },
        errors: await this.getErrorMetrics(),
        performance: await this.getPerformanceMetrics()
      };

      this.metrics.push(metrics);
      await this.storeMetrics(metrics);
      await this.checkForAlerts(metrics);

    } catch (error) {
      logger.error('apos;❌ Health check failed:'apos;, error);
      await this.createAlert('apos;critical'apos;, 'apos;Health check failed'apos;, { error: error.message });
    }
  }

  private async performFullHealthCheck(): Promise<void> {
    try {
      // Vérifications approfondies
      await this.checkDatabaseConnections();
      await this.checkRedisConnections();
      await this.checkApiEndpoints();
      await this.checkMemoryUsage();
      await this.checkErrorRates();
      
      logger.info('apos;✅ Full health check completed'apos;);
    } catch (error) {
      logger.error('apos;❌ Full health check failed:'apos;, error);
      await this.createAlert('apos;high'apos;, 'apos;Full health check failed'apos;, { error: error.message });
    }
  }

  private async checkDatabaseHealth(): Promise<boolean> {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      logger.error('apos;❌ Database health check failed:'apos;, error);
      return false;
    }
  }

  private async checkRedisHealth(): Promise<boolean> {
    try {
      await redis.ping();
      return true;
    } catch (error) {
      logger.error('apos;❌ Redis health check failed:'apos;, error);
      return false;
    }
  }

  private async checkExternalApisHealth(): Promise<boolean> {
    try {
      const apis = [
        'apos;https://api.openai.com/v1/models'apos;,
        'apos;https://api.stripe.com/v1/account'apos;
      ];

      const results = await Promise.allSettled(
        apis.map(url => fetch(url, { method: 'apos;HEAD'apos; }))
      );

      return results.every(result => result.status === 'apos;fulfilled'apos;);
    } catch (error) {
      logger.error('apos;❌ External APIs health check failed:'apos;, error);
      return false;
    }
  }

  private async checkDatabaseConnections(): Promise<void> {
    try {
      const connectionCount = await prisma.$queryRaw`
        SELECT count(*) as connections 
        FROM pg_stat_activity 
        WHERE datname = current_database()
      `;
      
      const connections = (connectionCount as any)[0]?.connections || 0;
      
      if (connections > 50) {
        await this.createAlert('apos;medium'apos;, 'apos;High database connections'apos;, { connections });
      }
    } catch (error) {
      logger.error('apos;❌ Database connections check failed:'apos;, error);
    }
  }

  private async checkRedisConnections(): Promise<void> {
    try {
      const info = await redis.info('apos;clients'apos;);
      const clientLines = info.split('apos;\n'apos;).find(line => line.startsWith('apos;connected_clients:'apos;));
      const connections = parseInt(clientLines?.split('apos;:'apos;)[1] || 'apos;0'apos;);
      
      if (connections > 100) {
        await this.createAlert('apos;medium'apos;, 'apos;High Redis connections'apos;, { connections });
      }
    } catch (error) {
      logger.error('apos;❌ Redis connections check failed:'apos;, error);
    }
  }

  private async checkApiEndpoints(): Promise<void> {
    try {
      const endpoints = [
        'apos;/api/health'apos;,
        'apos;/api/missions'apos;,
        'apos;/api/metrics'apos;
      ];

      const baseUrl = process.env.NEXTAUTH_URL || 'apos;http://localhost:3000'apos;;
      
      for (const endpoint of endpoints) {
        const startTime = Date.now();
        const response = await fetch(`${baseUrl}${endpoint}`);
        const responseTime = Date.now() - startTime;
        
        if (!response.ok || responseTime > 5000) {
          await this.createAlert('apos;medium'apos;, `API endpoint slow or failing`, {
            endpoint,
            status: response.status,
            responseTime
          });
        }
      }
    } catch (error) {
      logger.error('apos;❌ API endpoints check failed:'apos;, error);
    }
  }

  private async checkMemoryUsage(): Promise<void> {
    try {
      const usage = process.memoryUsage();
      const memoryUsageMB = usage.heapUsed / 1024 / 1024;
      
      if (memoryUsageMB > 500) {
        await this.createAlert('apos;medium'apos;, 'apos;High memory usage'apos;, { memoryUsageMB });
      }
    } catch (error) {
      logger.error('apos;❌ Memory usage check failed:'apos;, error);
    }
  }

  private async checkErrorRates(): Promise<void> {
    try {
      const recentMetrics = this.metrics.slice(-10);
      const errorRate = recentMetrics.reduce((sum, metric) => sum + metric.errors.rate, 0) / recentMetrics.length;
      
      if (errorRate > 0.05) { // 5% error rate
        await this.createAlert('apos;high'apos;, 'apos;High error rate detected'apos;, { errorRate });
      }
    } catch (error) {
      logger.error('apos;❌ Error rate check failed:'apos;, error);
    }
  }

  private async getErrorMetrics(): Promise<{ count: number; rate: number; critical: number }> {
    try {
      const recentAlerts = this.alerts.filter(
        alert => alert.timestamp > new Date(Date.now() - 300000) // 5 minutes
      );
      
      return {
        count: recentAlerts.length,
        rate: recentAlerts.length / 10, // 10 checks per 5 minutes
        critical: recentAlerts.filter(alert => alert.level === 'apos;critical'apos;).length
      };
    } catch (error) {
      logger.error('apos;❌ Error metrics calculation failed:'apos;, error);
      return { count: 0, rate: 0, critical: 0 };
    }
  }

  private async getPerformanceMetrics(): Promise<{ memoryUsage: number; cpuUsage: number; responseTime: number }> {
    try {
      const usage = process.memoryUsage();
      
      return {
        memoryUsage: usage.heapUsed / 1024 / 1024, // MB
        cpuUsage: process.cpuUsage().user / 1000000, // seconds
        responseTime: this.metrics.length > 0 ? this.metrics[this.metrics.length - 1].health.responseTime : 0
      };
    } catch (error) {
      logger.error('apos;❌ Performance metrics calculation failed:'apos;, error);
      return { memoryUsage: 0, cpuUsage: 0, responseTime: 0 };
    }
  }

  private async checkForAlerts(metrics: DeploymentMetrics): Promise<void> {
    // Vérifier la santé générale
    if (!metrics.health.database) {
      await this.createAlert('apos;critical'apos;, 'apos;Database connection lost'apos;);
    }
    
    if (!metrics.health.redis) {
      await this.createAlert('apos;high'apos;, 'apos;Redis connection lost'apos;);
    }
    
    if (!metrics.health.externalApis) {
      await this.createAlert('apos;medium'apos;, 'apos;External APIs unavailable'apos;);
    }
    
    // Vérifier les performances
    if (metrics.health.responseTime > 5000) {
      await this.createAlert('apos;medium'apos;, 'apos;High response time'apos;, { responseTime: metrics.health.responseTime });
    }
    
    if (metrics.errors.critical > 0) {
      await this.createAlert('apos;critical'apos;, 'apos;Critical errors detected'apos;, { count: metrics.errors.critical });
    }
    
    if (metrics.errors.rate > 0.1) { // 10% error rate
      await this.createAlert('apos;high'apos;, 'apos;High error rate'apos;, { rate: metrics.errors.rate });
    }
  }

  private async createAlert(
    level: ErrorAlert['apos;level'apos;],
    message: string,
    context: Record<string, any> = {}
  ): Promise<void> {
    const alert: ErrorAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      level,
      message,
      context,
      resolved: false
    };

    this.alerts.push(alert);
    await this.storeAlert(alert);
    
    // Notifications immédiates pour les alertes critiques
    if (level === 'apos;critical'apos;) {
      await this.sendCriticalAlert(alert);
    }
    
    logger.warn(`🚨 Alert created: ${level.toUpperCase()} - ${message}`, context);
  }

  private async storeMetrics(metrics: DeploymentMetrics): Promise<void> {
    try {
      await redis.setex(
        `metrics:${metrics.deploymentId}:${Date.now()}`,
        3600, // 1 heure
        JSON.stringify(metrics)
      );
    } catch (error) {
      logger.error('apos;❌ Failed to store metrics:'apos;, error);
    }
  }

  private async storeAlert(alert: ErrorAlert): Promise<void> {
    try {
      await redis.setex(
        `alert:${alert.id}`,
        86400, // 24 heures
        JSON.stringify(alert)
      );
    } catch (error) {
      logger.error('apos;❌ Failed to store alert:'apos;, error);
    }
  }

  private async sendCriticalAlert(alert: ErrorAlert): Promise<void> {
    try {
      // Envoyer une notification Slack/Email pour les alertes critiques
      const notification = {
        text: `🚨 CRITICAL ALERT: ${alert.message}`,
        context: alert.context,
        timestamp: alert.timestamp,
        deploymentId: process.env.VERCEL_DEPLOYMENT_ID
      };
      
      // Ici vous pouvez intégrer Slack, Email, etc.
      logger.error('apos;🚨 CRITICAL ALERT:'apos;, notification);
      
    } catch (error) {
      logger.error('apos;❌ Failed to send critical alert:'apos;, error);
    }
  }

  public getMetrics(): DeploymentMetrics[] {
    return this.metrics;
  }

  public getAlerts(): ErrorAlert[] {
    return this.alerts;
  }

  public async getHealthStatus(): Promise<{
    healthy: boolean;
    issues: string[];
    lastCheck: Date;
  }> {
    const lastMetric = this.metrics[this.metrics.length - 1];
    
    if (!lastMetric) {
      return {
        healthy: false,
        issues: ['apos;No health check data available'apos;],
        lastCheck: new Date()
      };
    }

    const issues: string[] = [];
    
    if (!lastMetric.health.database) issues.push('apos;Database connection failed'apos;);
    if (!lastMetric.health.redis) issues.push('apos;Redis connection failed'apos;);
    if (!lastMetric.health.externalApis) issues.push('apos;External APIs unavailable'apos;);
    if (lastMetric.health.responseTime > 5000) issues.push('apos;High response time'apos;);
    if (lastMetric.errors.critical > 0) issues.push('apos;Critical errors detected'apos;);

    return {
      healthy: issues.length === 0,
      issues,
      lastCheck: lastMetric.timestamp
    };
  }

  public stop(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    logger.info('apos;🛑 Deployment monitoring stopped'apos;);
  }
}

// Export singleton instance
export const deploymentMonitor = DeploymentMonitor.getInstance();
