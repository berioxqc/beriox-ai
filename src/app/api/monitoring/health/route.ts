import { NextRequest, NextResponse } from 'next/server';
import { deploymentMonitor } from '@/lib/monitoring/deployment-monitor';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now();
    
    // Vérifications rapides en parallèle
    const [dbHealth, redisHealth, monitorHealth] = await Promise.allSettled([
      checkDatabaseHealth(),
      checkRedisHealth(),
      deploymentMonitor.getHealthStatus()
    ]);

    const responseTime = Date.now() - startTime;

    // Collecter les métriques de performance
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      responseTime,
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      deploymentId: process.env.VERCEL_DEPLOYMENT_ID || 'local',
      
      services: {
        database: {
          status: dbHealth.status === 'fulfilled' ? 'healthy' : 'unhealthy',
          responseTime: dbHealth.status === 'fulfilled' ? dbHealth.value.responseTime : null,
          error: dbHealth.status === 'rejected' ? dbHealth.reason?.message : null
        },
        redis: {
          status: redisHealth.status === 'fulfilled' ? 'healthy' : 'unhealthy',
          responseTime: redisHealth.status === 'fulfilled' ? redisHealth.value.responseTime : null,
          error: redisHealth.status === 'rejected' ? redisHealth.reason?.message : null
        },
        monitoring: {
          status: monitorHealth.status === 'fulfilled' ? 'healthy' : 'unhealthy',
          healthy: monitorHealth.status === 'fulfilled' ? monitorHealth.value.healthy : false,
          issues: monitorHealth.status === 'fulfilled' ? monitorHealth.value.issues : [],
          lastCheck: monitorHealth.status === 'fulfilled' ? monitorHealth.value.lastCheck : null
        }
      },
      
      performance: {
        memory: {
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
          external: Math.round(memoryUsage.external / 1024 / 1024), // MB
          rss: Math.round(memoryUsage.rss / 1024 / 1024) // MB
        },
        cpu: {
          user: Math.round(cpuUsage.user / 1000), // ms
          system: Math.round(cpuUsage.system / 1000) // ms
        },
        uptime: Math.round(process.uptime()) // seconds
      },
      
      alerts: deploymentMonitor.getAlerts().slice(-5), // 5 dernières alertes
      metrics: deploymentMonitor.getMetrics().slice(-10) // 10 dernières métriques
    };

    // Déterminer le statut global
    const hasUnhealthyServices = Object.values(healthStatus.services).some(
      service => service.status === 'unhealthy'
    );
    
    if (hasUnhealthyServices) {
      healthStatus.status = 'degraded';
    }

    // Vérifier les seuils critiques
    if (healthStatus.responseTime > 10000) { // 10 secondes
      healthStatus.status = 'critical';
    }

    if (healthStatus.performance.memory.heapUsed > 1000) { // 1GB
      healthStatus.status = 'warning';
    }

    // Log pour le monitoring
    logger.info('Health check completed', {
      status: healthStatus.status,
      responseTime,
      memoryUsage: healthStatus.performance.memory.heapUsed
    });

    return NextResponse.json(healthStatus, {
      status: healthStatus.status === 'healthy' ? 200 : 
              healthStatus.status === 'degraded' ? 200 : 
              healthStatus.status === 'warning' ? 200 : 503
    });

  } catch (error) {
    logger.error('Health check failed:', error);
    
    return NextResponse.json({
      status: 'critical',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      services: {
        database: { status: 'unknown' },
        redis: { status: 'unknown' },
        monitoring: { status: 'unknown' }
      }
    }, { status: 503 });
  }
}

async function checkDatabaseHealth(): Promise<{ responseTime: number }> {
  const startTime = Date.now();
  
  try {
    await prisma.$queryRaw`SELECT 1`;
    
    return {
      responseTime: Date.now() - startTime
    };
  } catch (error) {
    throw new Error(`Database health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function checkRedisHealth(): Promise<{ responseTime: number }> {
  const startTime = Date.now();
  
  try {
    await redis.ping();
    
    return {
      responseTime: Date.now() - startTime
    };
  } catch (error) {
    throw new Error(`Redis health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Endpoint pour les vérifications détaillées
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { checkType } = body;

    switch (checkType) {
      case 'database':
        return await performDetailedDatabaseCheck();
      
      case 'redis':
        return await performDetailedRedisCheck();
      
      case 'external-apis':
        return await performExternalApisCheck();
      
      case 'performance':
        return await performPerformanceCheck();
      
      default:
        return NextResponse.json({ error: 'Invalid check type' }, { status: 400 });
    }
  } catch (error) {
    logger.error('Detailed health check failed:', error);
    return NextResponse.json({ error: 'Health check failed' }, { status: 500 });
  }
}

async function performDetailedDatabaseCheck() {
  const startTime = Date.now();
  
  try {
    // Vérifications détaillées de la base de données
    const [connectionCount, tableCount, slowQueries] = await Promise.all([
      prisma.$queryRaw`SELECT count(*) as connections FROM pg_stat_activity WHERE datname = current_database()`,
      prisma.$queryRaw`SELECT count(*) as tables FROM information_schema.tables WHERE table_schema = 'public'`,
      prisma.$queryRaw`SELECT count(*) as slow_queries FROM pg_stat_activity WHERE state = 'active' AND now() - query_start > interval '5 seconds'`
    ]);

    return NextResponse.json({
      status: 'healthy',
      responseTime: Date.now() - startTime,
      details: {
        connections: (connectionCount as any)[0]?.connections || 0,
        tables: (tableCount as any)[0]?.tables || 0,
        slowQueries: (slowQueries as any)[0]?.slow_queries || 0
      }
    });
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 503 });
  }
}

async function performDetailedRedisCheck() {
  const startTime = Date.now();
  
  try {
    const info = await redis.info();
    const memoryInfo = await redis.info('memory');
    
    // Parser les informations Redis
    const clientLines = info.split('\n').find(line => line.startsWith('connected_clients:'));
    const memoryLines = memoryInfo.split('\n').find(line => line.startsWith('used_memory_human:'));
    
    const connections = parseInt(clientLines?.split(':')[1] || '0');
    const memoryUsed = memoryLines?.split(':')[1] || '0B';

    return NextResponse.json({
      status: 'healthy',
      responseTime: Date.now() - startTime,
      details: {
        connections,
        memoryUsed,
        info: info.split('\n').slice(0, 10) // Premières 10 lignes d'info
      }
    });
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 503 });
  }
}

async function performExternalApisCheck() {
  const startTime = Date.now();
  
  try {
    const apis = [
      { name: 'OpenAI', url: 'https://api.openai.com/v1/models' },
      { name: 'Stripe', url: 'https://api.stripe.com/v1/account' }
    ];

    const results = await Promise.allSettled(
      apis.map(async (api) => {
        const apiStartTime = Date.now();
        const response = await fetch(api.url, { 
          method: 'HEAD',
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY || 'test'}`
          }
        });
        
        return {
          name: api.name,
          status: response.ok ? 'healthy' : 'unhealthy',
          responseTime: Date.now() - apiStartTime,
          statusCode: response.status
        };
      })
    );

    const apiResults = results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          name: apis[index].name,
          status: 'unhealthy',
          responseTime: 0,
          error: result.reason?.message || 'Unknown error'
        };
      }
    });

    return NextResponse.json({
      status: 'healthy',
      responseTime: Date.now() - startTime,
      details: {
        apis: apiResults
      }
    });
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 503 });
  }
}

async function performPerformanceCheck() {
  const startTime = Date.now();
  
  try {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    // Calculer l'utilisation CPU en pourcentage
    const cpuPercent = (cpuUsage.user + cpuUsage.system) / 1000000; // secondes
    
    // Vérifier les seuils
    const memoryThreshold = 1000; // 1GB
    const cpuThreshold = 80; // 80%
    
    const memoryWarning = memoryUsage.heapUsed / 1024 / 1024 > memoryThreshold;
    const cpuWarning = cpuPercent > cpuThreshold;

    return NextResponse.json({
      status: memoryWarning || cpuWarning ? 'warning' : 'healthy',
      responseTime: Date.now() - startTime,
      details: {
        memory: {
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
          external: Math.round(memoryUsage.external / 1024 / 1024),
          rss: Math.round(memoryUsage.rss / 1024 / 1024),
          threshold: memoryThreshold,
          warning: memoryWarning
        },
        cpu: {
          user: Math.round(cpuUsage.user / 1000),
          system: Math.round(cpuUsage.system / 1000),
          percent: Math.round(cpuPercent * 100),
          threshold: cpuThreshold,
          warning: cpuWarning
        },
        uptime: Math.round(process.uptime())
      }
    });
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 503 });
  }
}
