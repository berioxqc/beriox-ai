import { NextRequest, NextResponse } from 'apos;next/server'apos;;
import { prisma } from 'apos;@/lib/prisma'apos;;
import { logger } from 'apos;@/lib/logger'apos;;

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Test de connectivité de base
    const pingStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const pingDuration = Date.now() - pingStart;

    // Test de performance avec une requête simple
    const queryStart = Date.now();
    const userCount = await prisma.user.count();
    const queryDuration = Date.now() - queryStart;

    // Test de performance avec une requête plus complexe
    const complexStart = Date.now();
    const missionStats = await prisma.mission.groupBy({
      by: ['apos;status'apos;],
      _count: {
        status: true
      }
    });
    const complexDuration = Date.now() - complexStart;

    const healthCheck = {
      status: 'apos;healthy'apos;,
      timestamp: new Date().toISOString(),
      checks: {
        connectivity: {
          status: 'apos;healthy'apos;,
          duration: pingDuration,
          threshold: 100 // 100ms max
        },
        simpleQuery: {
          status: 'apos;healthy'apos;,
          duration: queryDuration,
          threshold: 200 // 200ms max
        },
        complexQuery: {
          status: 'apos;healthy'apos;,
          duration: complexDuration,
          threshold: 500 // 500ms max
        }
      },
      metrics: {
        totalUsers: userCount,
        missionStats: missionStats,
        totalDuration: Date.now() - startTime
      }
    };

    // Vérifier les seuils de performance
    const allHealthy = Object.values(healthCheck.checks).every(
      check => check.duration <= check.threshold
    );

    if (!allHealthy) {
      healthCheck.status = 'apos;degraded'apos;;
      Object.values(healthCheck.checks).forEach(check => {
        if (check.duration > check.threshold) {
          check.status = 'apos;slow'apos;;
        }
      });
    }

    logger.info('apos;Database health check completed'apos;, {
      action: 'apos;health_check_db'apos;,
      duration: healthCheck.metrics.totalDuration,
      status: healthCheck.status,
      checks: healthCheck.checks
    });

    return NextResponse.json(healthCheck, {
      status: healthCheck.status === 'apos;healthy'apos; ? 200 : 503,
      headers: {
        'apos;Cache-Control'apos;: 'apos;no-cache, no-store, must-revalidate'apos;,
        'apos;Pragma'apos;: 'apos;no-cache'apos;,
        'apos;Expires'apos;: 'apos;0'apos;
      }
    });

  } catch (error) {
    logger.error('apos;Database health check failed'apos;, error as Error, {
      action: 'apos;health_check_db'apos;,
      duration: Date.now() - startTime
    });

    return NextResponse.json({
      status: 'apos;unhealthy'apos;,
      timestamp: new Date().toISOString(),
      error: 'apos;Database health check failed'apos;,
      details: error instanceof Error ? error.message : 'apos;Unknown error'apos;,
      duration: Date.now() - startTime
    }, {
      status: 503,
      headers: {
        'apos;Cache-Control'apos;: 'apos;no-cache, no-store, must-revalidate'apos;,
        'apos;Pragma'apos;: 'apos;no-cache'apos;,
        'apos;Expires'apos;: 'apos;0'apos;
      }
    });
  }
}
