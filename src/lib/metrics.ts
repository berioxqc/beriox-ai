import * as Sentry from "@sentry/nextjs";
import { logger } from "./logger";

export interface MetricData {
  name: string;
  value: number;
  tags?: Record<string, string>;
  timestamp?: Date;
}

export interface PerformanceMetric {
  operation: string;
  duration: number;
  success: boolean;
  metadata?: Record<string, any>;
}

class MetricsCollector {
  private metrics: MetricData[] = [];
  private performanceMetrics: PerformanceMetric[] = [];
  private isProduction = process.env.NODE_ENV === 'apos;production'apos;;

  // Métriques de base
  increment(name: string, value: number = 1, tags?: Record<string, string>) {
    const metric: MetricData = {
      name,
      value,
      tags,
      timestamp: new Date()
    };

    this.metrics.push(metric);

    // Envoi des métriques à Sentry (désactivé temporairement)
    // if (this.isProduction && Sentry.metrics) {
    //   try {
    //     Sentry.metrics.increment(name, value, { tags });
    //   } catch (error) {
    //     console.warn('apos;Sentry metrics not available:'apos;, error);
    //   }
    // }

    logger.info(`Metric incremented: ${name}`, {
      action: 'apos;metric_increment'apos;,
      metadata: { name, value, tags }
    });
  }

  gauge(name: string, value: number, tags?: Record<string, string>) {
    const metric: MetricData = {
      name,
      value,
      tags,
      timestamp: new Date()
    };

    this.metrics.push(metric);

    // Envoi des métriques à Sentry (désactivé temporairement)
    // if (this.isProduction && Sentry.metrics) {
    //   try {
    //     Sentry.metrics.gauge(name, value, { tags });
    //   } catch (error) {
    //     console.warn('apos;Sentry metrics not available:'apos;, error);
    //   }
    // }

    logger.info(`Metric gauge: ${name} = ${value}`, {
      action: 'apos;metric_gauge'apos;,
      metadata: { name, value, tags }
    });
  }

  timing(name: string, duration: number, tags?: Record<string, string>) {
    const metric: MetricData = {
      name,
      value: duration,
      tags,
      timestamp: new Date()
    };

    this.metrics.push(metric);

    // Envoi des métriques à Sentry (désactivé temporairement)
    // if (this.isProduction && Sentry.metrics) {
    //   try {
    //     Sentry.metrics.timing(name, duration, { tags });
    //   } catch (error) {
    //     console.warn('apos;Sentry metrics not available:'apos;, error);
    //   }
    // }

    logger.info(`Metric timing: ${name} = ${duration}ms`, {
      action: 'apos;metric_timing'apos;,
      metadata: { name, duration, tags }
    });
  }

  // Métriques de performance
  recordPerformance(metric: PerformanceMetric) {
    this.performanceMetrics.push(metric);

    const tags = {
      operation: metric.operation,
      success: metric.success.toString(),
      ...metric.metadata
    };

    this.timing(`${metric.operation}_duration`, metric.duration, tags);
    this.increment(`${metric.operation}_count`, 1, tags);

    if (!metric.success) {
      this.increment(`${metric.operation}_errors`, 1, tags);
    }

    // Alertes si performance dégradée
    if (metric.duration > 5000) { // 5 secondes
      logger.warn(`Performance alert: ${metric.operation} took ${metric.duration}ms`, {
        action: 'apos;performance_alert'apos;,
        metadata: { operation: metric.operation, duration: metric.duration }
      });
    }
  }

  // Métriques business
  recordUserAction(action: string, userId?: string, metadata?: Record<string, any>) {
    const tags = {
      action,
      userId: userId || 'apos;anonymous'apos;,
      ...metadata
    };

    this.increment('apos;user_action'apos;, 1, tags);
    this.increment(`user_action_${action}`, 1, tags);
  }

  recordMissionCompletion(missionId: string, duration: number, success: boolean) {
    const tags = {
      missionId,
      success: success.toString()
    };

    this.increment('apos;mission_completion'apos;, 1, tags);
    this.timing('apos;mission_duration'apos;, duration, tags);

    if (success) {
      this.increment('apos;mission_success'apos;, 1, tags);
    } else {
      this.increment('apos;mission_failure'apos;, 1, tags);
    }
  }

  recordAgentUsage(agentName: string, duration: number, success: boolean) {
    const tags = {
      agent: agentName,
      success: success.toString()
    };

    this.increment('apos;agent_usage'apos;, 1, tags);
    this.timing('apos;agent_duration'apos;, duration, tags);

    if (success) {
      this.increment('apos;agent_success'apos;, 1, tags);
    } else {
      this.increment('apos;agent_failure'apos;, 1, tags);
    }
  }

  recordAPICall(endpoint: string, method: string, statusCode: number, duration: number) {
    const tags = {
      endpoint,
      method,
      statusCode: statusCode.toString(),
      status: statusCode < 400 ? 'apos;success'apos; : 'apos;error'apos;
    };

    this.increment('apos;api_call'apos;, 1, tags);
    this.timing('apos;api_duration'apos;, duration, tags);

    if (statusCode >= 400) {
      this.increment('apos;api_error'apos;, 1, tags);
    }
  }

  recordDatabaseQuery(operation: string, table: string, duration: number, success: boolean) {
    const tags = {
      operation,
      table,
      success: success.toString()
    };

    this.increment('apos;database_query'apos;, 1, tags);
    this.timing('apos;database_duration'apos;, duration, tags);

    if (!success) {
      this.increment('apos;database_error'apos;, 1, tags);
    }
  }

  recordCacheHit(cacheName: string, hit: boolean) {
    const tags = {
      cache: cacheName,
      hit: hit.toString()
    };

    this.increment('apos;cache_access'apos;, 1, tags);

    if (hit) {
      this.increment('apos;cache_hit'apos;, 1, tags);
    } else {
      this.increment('apos;cache_miss'apos;, 1, tags);
    }
  }

  recordPaymentEvent(event: string, amount: number, currency: string, success: boolean) {
    const tags = {
      event,
      currency,
      success: success.toString()
    };

    this.increment('apos;payment_event'apos;, 1, tags);
    this.gauge('apos;payment_amount'apos;, amount, tags);

    if (success) {
      this.increment('apos;payment_success'apos;, 1, tags);
    } else {
      this.increment('apos;payment_failure'apos;, 1, tags);
    }
  }

  recordError(error: Error, context?: Record<string, any>) {
    const tags = {
      errorType: error.constructor.name,
      ...context
    };

    this.increment('apos;error_count'apos;, 1, tags);
    this.increment(`error_${error.constructor.name}`, 1, tags);
  }

  // Métriques système
  recordSystemMetrics() {
    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();

    this.gauge('apos;system_memory_rss'apos;, memoryUsage.rss);
    this.gauge('apos;system_memory_heap_used'apos;, memoryUsage.heapUsed);
    this.gauge('apos;system_memory_heap_total'apos;, memoryUsage.heapTotal);
    this.gauge('apos;system_uptime'apos;, uptime);

    // Métriques CPU (approximatif)
    const cpuUsage = process.cpuUsage();
    this.gauge('apos;system_cpu_user'apos;, cpuUsage.user);
    this.gauge('apos;system_cpu_system'apos;, cpuUsage.system);
  }

  // Récupération des métriques
  getMetrics(): MetricData[] {
    return [...this.metrics];
  }

  getPerformanceMetrics(): PerformanceMetric[] {
    return [...this.performanceMetrics];
  }

  // Statistiques
  getStats() {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const recentMetrics = this.metrics.filter(m => m.timestamp && m.timestamp > oneHourAgo);
    const dailyMetrics = this.metrics.filter(m => m.timestamp && m.timestamp > oneDayAgo);

    const stats = {
      total: this.metrics.length,
      lastHour: recentMetrics.length,
      lastDay: dailyMetrics.length,
      performance: {
        total: this.performanceMetrics.length,
        average: this.performanceMetrics.length > 0 
          ? this.performanceMetrics.reduce((sum, m) => sum + m.duration, 0) / this.performanceMetrics.length 
          : 0,
        successRate: this.performanceMetrics.length > 0
          ? this.performanceMetrics.filter(m => m.success).length / this.performanceMetrics.length
          : 0
      }
    };

    return stats;
  }

  // Nettoyage des anciennes métriques
  cleanup(maxAge: number = 24 * 60 * 60 * 1000) { // 24 heures par défaut
    const cutoff = new Date(Date.now() - maxAge);
    
    this.metrics = this.metrics.filter(m => m.timestamp && m.timestamp > cutoff);
    this.performanceMetrics = this.performanceMetrics.filter(m => 
      m.timestamp && m.timestamp > cutoff
    );

    logger.info('apos;Metrics cleanup completed'apos;, {
      action: 'apos;metrics_cleanup'apos;,
      metadata: { maxAge, remainingMetrics: this.metrics.length }
    });
  }

  // Export des métriques
  exportMetrics() {
    return {
      metrics: this.metrics,
      performance: this.performanceMetrics,
      stats: this.getStats(),
      timestamp: new Date().toISOString()
    };
  }
}

// Instance globale
export const metrics = new MetricsCollector();

// Fonction utilitaire pour mesurer les performances
export const withPerformanceTracking = <T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  operation: string,
  metadata?: Record<string, any>
) => {
  return async (...args: T): Promise<R> => {
    const startTime = Date.now();
    let success = false;

    try {
      const result = await fn(...args);
      success = true;
      return result;
    } catch (error) {
      success = false;
      throw error;
    } finally {
      const duration = Date.now() - startTime;
      metrics.recordPerformance({
        operation,
        duration,
        success,
        metadata
      });
    }
  };
};

// Fonction utilitaire pour les métriques de base
export const trackMetric = {
  increment: (name: string, value?: number, tags?: Record<string, string>) => {
    metrics.increment(name, value, tags);
  },
  gauge: (name: string, value: number, tags?: Record<string, string>) => {
    metrics.gauge(name, value, tags);
  },
  timing: (name: string, duration: number, tags?: Record<string, string>) => {
    metrics.timing(name, duration, tags);
  }
};

// Fonction utilitaire pour les métriques business
export const trackBusiness = {
  userAction: (action: string, userId?: string, metadata?: Record<string, any>) => {
    metrics.recordUserAction(action, userId, metadata);
  },
  missionCompletion: (missionId: string, duration: number, success: boolean) => {
    metrics.recordMissionCompletion(missionId, duration, success);
  },
  agentUsage: (agentName: string, duration: number, success: boolean) => {
    metrics.recordAgentUsage(agentName, duration, success);
  },
  apiCall: (endpoint: string, method: string, statusCode: number, duration: number) => {
    metrics.recordAPICall(endpoint, method, statusCode, duration);
  },
  databaseQuery: (operation: string, table: string, duration: number, success: boolean) => {
    metrics.recordDatabaseQuery(operation, table, duration, success);
  },
  cacheHit: (cacheName: string, hit: boolean) => {
    metrics.recordCacheHit(cacheName, hit);
  },
  paymentEvent: (event: string, amount: number, currency: string, success: boolean) => {
    metrics.recordPaymentEvent(event, amount, currency, success);
  }
};
