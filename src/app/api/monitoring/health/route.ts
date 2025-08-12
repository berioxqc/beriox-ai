import { NextRequest, NextResponse } from 'apos;next/server'apos;;
import { deploymentMonitor } from 'apos;@/lib/monitoring/deployment-monitor'apos;;
import { logger } from 'apos;@/lib/logger'apos;;
import { prisma } from 'apos;@/lib/prisma'apos;;
import { redis } from 'apos;@/lib/redis'apos;;

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
      status: 'apos;healthy'apos;,
      timestamp: new Date().toISOString(),
      responseTime,
      version: process.env.npm_package_version || 'apos;1.0.0'apos;,
      environment: process.env.NODE_ENV || 'apos;development'apos;,
      deploymentId: process.env.VERCEL_DEPLOYMENT_ID || 'apos;local'apos;,
      
      services: {
        database: {
          status: dbHealth.status === 'apos;fulfilled'apos; ? 'apos;healthy'apos; : 'apos;unhealthy'apos;,
          responseTime: dbHealth.status === 'apos;fulfilled'apos; ? dbHealth.value.responseTime : null,
          error: dbHealth.status === 'apos;rejected'apos; ? dbHealth.reason?.message : null
        },
        redis: {
          status: redisHealth.status === 'apos;fulfilled'apos; ? 'apos;healthy'apos; : 'apos;unhealthy'apos;,
          responseTime: redisHealth.status === 'apos;fulfilled'apos; ? redisHealth.value.responseTime : null,
          error: redisHealth.status === 'apos;rejected'apos; ? redisHealth.reason?.message : null
        },
        monitoring: {
          status: monitorHealth.status === 'apos;fulfilled'apos; ? 'apos;healthy'apos; : 'apos;unhealthy'apos;,
          healthy: monitorHealth.status === 'apos;fulfilled'apos; ? monitorHealth.value.healthy : false,
          issues: monitorHealth.status === 'apos;fulfilled'apos; ? monitorHealth.value.issues : [],
          lastCheck: monitorHealth.status === 'apos;fulfilled'apos; ? monitorHealth.value.lastCheck : null
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
      service => service.status === 'apos;unhealthy'apos;
    );
    
    if (hasUnhealthyServices) {
      healthStatus.status = 'apos;degraded'apos;;
    }

    // Vérifier les seuils critiques
    if (healthStatus.responseTime > 10000) { // 10 secondes
      healthStatus.status = 'apos;critical'apos;;
    }

    if (healthStatus.performance.memory.heapUsed > 1000) { // 1GB
      healthStatus.status = 'apos;warning'apos;;
    }

    // Log pour le monitoring
    logger.info('apos;Health check completed'apos;, {
      status: healthStatus.status,
      responseTime,
      memoryUsage: healthStatus.performance.memory.heapUsed
    });

    return NextResponse.json(healthStatus, {
      status: healthStatus.status === 'apos;healthy'apos; ? 200 : 
              healthStatus.status === 'apos;degraded'apos; ? 200 : 
              healthStatus.status === 'apos;warning'apos; ? 200 : 503
    });

  } catch (error) {
    logger.error('apos;Health check failed:'apos;, error);
    
    return NextResponse.json({
      status: 'apos;critical'apos;,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'apos;Unknown error'apos;,
      services: {
        database: { status: 'apos;unknown'apos; },
        redis: { status: 'apos;unknown'apos; },
        monitoring: { status: 'apos;unknown'apos; }
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
    throw new Error(`Database health check failed: ${error instanceof Error ? error.message : 'apos;Unknown error'apos;}`);
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
    throw new Error(`Redis health check failed: ${error instanceof Error ? error.message : 'apos;Unknown error'apos;}`);
  }
}

// Endpoint pour les vérifications détaillées
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { checkType } = body;

    switch (checkType) {
      case 'apos;database'apos;:
        return await performDetailedDatabaseCheck();
      
      case 'apos;redis'apos;:
        return await performDetailedRedisCheck();
      
      case 'apos;external-apis'apos;:
        return await performExternalApisCheck();
      
      case 'apos;performance'apos;:
        return await performPerformanceCheck();
      
      default:
        return NextResponse.json({ error: 'apos;Invalid check type'apos; }, { status: 400 });
    }
  } catch (error) {
    logger.error('apos;Detailed health check failed:'apos;, error);
    return NextResponse.json({ error: 'apos;Health check failed'apos; }, { status: 500 });
  }
}

async function performDetailedDatabaseCheck() {
  const startTime = Date.now();
  
  try {
    // Vérifications détaillées de la base de données
    const [connectionCount, tableCount, slowQueries] = await Promise.all([
      prisma.$queryRaw`SELECT count(*) as connections FROM pg_stat_activity WHERE datname = current_database()`,
      prisma.$queryRaw`SELECT count(*) as tables FROM information_schema.tables WHERE table_schema = 'apos;public'apos;`,
      prisma.$queryRaw`SELECT count(*) as slow_queries FROM pg_stat_activity WHERE state = 'apos;active'apos; AND now() - query_start > interval 'apos;5 seconds'apos;`
    ]);

    return NextResponse.json({
      status: 'apos;healthy'apos;,
      responseTime: Date.now() - startTime,
      details: {
        connections: (connectionCount as any)[0]?.connections || 0,
        tables: (tableCount as any)[0]?.tables || 0,
        slowQueries: (slowQueries as any)[0]?.slow_queries || 0
      }
    });
  } catch (error) {
    return NextResponse.json({
      status: 'apos;unhealthy'apos;,
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'apos;Unknown error'apos;
    }, { status: 503 });
  }
}

async function performDetailedRedisCheck() {
  const startTime = Date.now();
  
  try {
    const info = await redis.info();
    const memoryInfo = await redis.info('apos;memory'apos;);
    
    // Parser les informations Redis
    const clientLines = info.split('apos;\n'apos;).find(line => line.startsWith('apos;connected_clients:'apos;));
    const memoryLines = memoryInfo.split('apos;\n'apos;).find(line => line.startsWith('apos;used_memory_human:'apos;));
    
    const connections = parseInt(clientLines?.split('apos;:'apos;)[1] || 'apos;0'apos;);
    const memoryUsed = memoryLines?.split('apos;:'apos;)[1] || 'apos;0B'apos;;

    return NextResponse.json({
      status: 'apos;healthy'apos;,
      responseTime: Date.now() - startTime,
      details: {
        connections,
        memoryUsed,
        info: info.split('apos;\n'apos;).slice(0, 10) // Premières 10 lignes d'apos;info
      }
    });
  } catch (error) {
    return NextResponse.json({
      status: 'apos;unhealthy'apos;,
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'apos;Unknown error'apos;
    }, { status: 503 });
  }
}

async function performExternalApisCheck() {
  const startTime = Date.now();
  
  try {
    const apis = [
      { name: 'apos;OpenAI'apos;, url: 'apos;https://api.openai.com/v1/models'apos; },
      { name: 'apos;Stripe'apos;, url: 'apos;https://api.stripe.com/v1/account'apos; }
    ];

    const results = await Promise.allSettled(
      apis.map(async (api) => {
        const apiStartTime = Date.now();
        const response = await fetch(api.url, { 
          method: 'apos;HEAD'apos;,
          headers: {
            'apos;Authorization'apos;: `Bearer ${process.env.OPENAI_API_KEY || 'apos;test'apos;}`
          }
        });
        
        return {
          name: api.name,
          status: response.ok ? 'apos;healthy'apos; : 'apos;unhealthy'apos;,
          responseTime: Date.now() - apiStartTime,
          statusCode: response.status
        };
      })
    );

    const apiResults = results.map((result, index) => {
      if (result.status === 'apos;fulfilled'apos;) {
        return result.value;
      } else {
        return {
          name: apis[index].name,
          status: 'apos;unhealthy'apos;,
          responseTime: 0,
          error: result.reason?.message || 'apos;Unknown error'apos;
        };
      }
    });

    return NextResponse.json({
      status: 'apos;healthy'apos;,
      responseTime: Date.now() - startTime,
      details: {
        apis: apiResults
      }
    });
  } catch (error) {
    return NextResponse.json({
      status: 'apos;unhealthy'apos;,
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'apos;Unknown error'apos;
    }, { status: 503 });
  }
}

async function performPerformanceCheck() {
  const startTime = Date.now();
  
  try {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    // Calculer l'apos;utilisation CPU en pourcentage
    const cpuPercent = (cpuUsage.user + cpuUsage.system) / 1000000; // secondes
    
    // Vérifier les seuils
    const memoryThreshold = 1000; // 1GB
    const cpuThreshold = 80; // 80%
    
    const memoryWarning = memoryUsage.heapUsed / 1024 / 1024 > memoryThreshold;
    const cpuWarning = cpuPercent > cpuThreshold;

    return NextResponse.json({
      status: memoryWarning || cpuWarning ? 'apos;warning'apos; : 'apos;healthy'apos;,
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
      status: 'apos;unhealthy'apos;,
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'apos;Unknown error'apos;
    }, { status: 503 });
  }
}
