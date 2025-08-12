import { logger } from '@/lib/logger';
import { redis } from '@/lib/redis';
import { prisma } from '@/lib/prisma';

export interface DeploymentMetrics {
  deploymentId: string;
  timestamp: Date;
  version: string;
  environment: 'staging' | 'production';
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
  level: 'low' | 'medium' | 'high' | 'critical';
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

    logger.info('🚀 Deployment monitoring started');
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
        deploymentId: process.env.VERCEL_DEPLOYMENT_ID || 'local',
        timestamp: new Date(),
        version: process.env.npm_package_version || '1.0.0',
        environment: (process.env.NODE_ENV as 'staging' | 'production') || 'production',
        health: {
          database: dbHealth.status === 'fulfilled' && dbHealth.value,
          redis: redisHealth.status === 'fulfilled' && redisHealth.value,
          externalApis: apiHealth.status === 'fulfilled' && apiHealth.value,
          responseTime
        },
        errors: await this.getErrorMetrics(),
        performance: await this.getPerformanceMetrics()
      };

      this.metrics.push(metrics);
      await this.storeMetrics(metrics);
      await this.checkForAlerts(metrics);

    } catch (error) {
      logger.error('❌ Health check failed:', error);
      await this.createAlert('critical', 'Health check failed', { error: error.message });
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
      
      logger.info('✅ Full health check completed');
    } catch (error) {
      logger.error('❌ Full health check failed:', error);
      await this.createAlert('high', 'Full health check failed', { error: error.message });
    }
  }

  private async checkDatabaseHealth(): Promise<boolean> {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      logger.error('❌ Database health check failed:', error);
      return false;
    }
  }

  private async checkRedisHealth(): Promise<boolean> {
    try {
      await redis.ping();
      return true;
    } catch (error) {
      logger.error('❌ Redis health check failed:', error);
      return false;
    }
  }

  private async checkExternalApisHealth(): Promise<boolean> {
    try {
      const apis = [
        'https://api.openai.com/v1/models',
        'https://api.stripe.com/v1/account'
      ];

      const results = await Promise.allSettled(
        apis.map(url => fetch(url, { method: 'HEAD' }))
      );

      return results.every(result => result.status === 'fulfilled');
    } catch (error) {
      logger.error('❌ External APIs health check failed:', error);
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
        await this.createAlert('medium', 'High database connections', { connections });
      }
    } catch (error) {
      logger.error('❌ Database connections check failed:', error);
    }
  }

  private async checkRedisConnections(): Promise<void> {
    try {
      const info = await redis.info('clients');
      const clientLines = info.split('\n').find(line => line.startsWith('connected_clients:'));
      const connections = parseInt(clientLines?.split(':')[1] || '0');
      
      if (connections > 100) {
        await this.createAlert('medium', 'High Redis connections', { connections });
      }
    } catch (error) {
      logger.error('❌ Redis connections check failed:', error);
    }
  }

  private async checkApiEndpoints(): Promise<void> {
    try {
      const endpoints = [
        '/api/health',
        '/api/missions',
        '/api/metrics'
      ];

      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
      
      for (const endpoint of endpoints) {
        const startTime = Date.now();
        const response = await fetch(`${baseUrl}${endpoint}`);
        const responseTime = Date.now() - startTime;
        
        if (!response.ok || responseTime > 5000) {
          await this.createAlert('medium', `API endpoint slow or failing`, {
            endpoint,
            status: response.status,
            responseTime
          });
        }
      }
    } catch (error) {
      logger.error('❌ API endpoints check failed:', error);
    }
  }

  private async checkMemoryUsage(): Promise<void> {
    try {
      const usage = process.memoryUsage();
      const memoryUsageMB = usage.heapUsed / 1024 / 1024;
      
      if (memoryUsageMB > 500) {
        await this.createAlert('medium', 'High memory usage', { memoryUsageMB });
      }
    } catch (error) {
      logger.error('❌ Memory usage check failed:', error);
    }
  }

  private async checkErrorRates(): Promise<void> {
    try {
      const recentMetrics = this.metrics.slice(-10);
      const errorRate = recentMetrics.reduce((sum, metric) => sum + metric.errors.rate, 0) / recentMetrics.length;
      
      if (errorRate > 0.05) { // 5% error rate
        await this.createAlert('high', 'High error rate detected', { errorRate });
      }
    } catch (error) {
      logger.error('❌ Error rate check failed:', error);
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
        critical: recentAlerts.filter(alert => alert.level === 'critical').length
      };
    } catch (error) {
      logger.error('❌ Error metrics calculation failed:', error);
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
      logger.error('❌ Performance metrics calculation failed:', error);
      return { memoryUsage: 0, cpuUsage: 0, responseTime: 0 };
    }
  }

  private async checkForAlerts(metrics: DeploymentMetrics): Promise<void> {
    // Vérifier la santé générale
    if (!metrics.health.database) {
      await this.createAlert('critical', 'Database connection lost');
    }
    
    if (!metrics.health.redis) {
      await this.createAlert('high', 'Redis connection lost');
    }
    
    if (!metrics.health.externalApis) {
      await this.createAlert('medium', 'External APIs unavailable');
    }
    
    // Vérifier les performances
    if (metrics.health.responseTime > 5000) {
      await this.createAlert('medium', 'High response time', { responseTime: metrics.health.responseTime });
    }
    
    if (metrics.errors.critical > 0) {
      await this.createAlert('critical', 'Critical errors detected', { count: metrics.errors.critical });
    }
    
    if (metrics.errors.rate > 0.1) { // 10% error rate
      await this.createAlert('high', 'High error rate', { rate: metrics.errors.rate });
    }
  }

  private async createAlert(
    level: ErrorAlert['level'],
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
    if (level === 'critical') {
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
      logger.error('❌ Failed to store metrics:', error);
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
      logger.error('❌ Failed to store alert:', error);
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
      logger.error('🚨 CRITICAL ALERT:', notification);
      
    } catch (error) {
      logger.error('❌ Failed to send critical alert:', error);
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
        issues: ['No health check data available'],
        lastCheck: new Date()
      };
    }

    const issues: string[] = [];
    
    if (!lastMetric.health.database) issues.push('Database connection failed');
    if (!lastMetric.health.redis) issues.push('Redis connection failed');
    if (!lastMetric.health.externalApis) issues.push('External APIs unavailable');
    if (lastMetric.health.responseTime > 5000) issues.push('High response time');
    if (lastMetric.errors.critical > 0) issues.push('Critical errors detected');

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
    logger.info('🛑 Deployment monitoring stopped');
  }
}

// Export singleton instance
export const deploymentMonitor = DeploymentMonitor.getInstance();
