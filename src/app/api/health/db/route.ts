import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
export async function GET(request: NextRequest) {
  const startTime = Date.now()
  try {
    // Test de connectivité de base
    const pingStart = Date.now()
    await prisma.$queryRaw`SELECT 1`
    const pingDuration = Date.now() - pingStart
    // Test de performance avec une requête simple
    const queryStart = Date.now()
    const userCount = await prisma.user.count()
    const queryDuration = Date.now() - queryStart
    // Test de performance avec une requête plus complexe
    const complexStart = Date.now()
    const missionStats = await prisma.mission.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    })
    const complexDuration = Date.now() - complexStart
    const healthCheck = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      checks: {
        connectivity: {
          status: 'healthy',
          duration: pingDuration,
          threshold: 100 // 100ms max
        },
        simpleQuery: {
          status: 'healthy',
          duration: queryDuration,
          threshold: 200 // 200ms max
        },
        complexQuery: {
          status: 'healthy',
          duration: complexDuration,
          threshold: 500 // 500ms max
        }
      },
      metrics: {
        totalUsers: userCount,
        missionStats: missionStats,
        totalDuration: Date.now() - startTime
      }
    }
    // Vérifier les seuils de performance
    const allHealthy = Object.values(healthCheck.checks).every(
      check => check.duration <= check.threshold
    )
    if (!allHealthy) {
      healthCheck.status = 'degraded'
      Object.values(healthCheck.checks).forEach(check => {
        if (check.duration > check.threshold) {
          check.status = 'slow'
        }
      })
    }

    logger.info('Database health check completed', {
      action: 'health_check_db',
      duration: healthCheck.metrics.totalDuration,
      status: healthCheck.status,
      checks: healthCheck.checks
    })
    return NextResponse.json(healthCheck, {
      status: healthCheck.status === 'healthy' ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    logger.error('Database health check failed', error as Error, {
      action: 'health_check_db',
      duration: Date.now() - startTime
    })
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Database health check failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - startTime
    }, {
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  }
}
