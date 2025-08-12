import { NextRequest, NextResponse } from 'next/server'
import { healthMonitor } from '@/lib/health-monitor'
import { globalErrorHandler } from '@/lib/error-handler'
import { logger } from '@/lib/logger'
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const detailed = searchParams.get('detailed') === 'true'
    const runChecks = searchParams.get('run') === 'true'
    // Si on demande d'exécuter les vérifications
    if (runChecks) {
      await healthMonitor.runAllChecks()
    }

    // Générer le rapport de santé
    const report = healthMonitor.generateReport()
    const errorStats = globalErrorHandler.getErrorStats()
    const response = {
      status: report.status,
      timestamp: report.timestamp,
      uptime: report.uptime,
      version: report.version,
      environment: report.environment,
      summary: report.summary,
      metrics: report.metrics,
      errorStats,
      checks: detailed ? report.checks : report.checks.map(check => ({
        name: check.name,
        status: check.status,
        responseTime: check.responseTime,
        lastCheck: check.lastCheck
      }))
    }
    // Log de la requête de santé
    logger.info('Health check requested', {
      action: 'health_check_request',
      metadata: {
        detailed,
        runChecks,
        overallStatus: report.status,
        healthyChecks: report.summary.healthy,
        totalChecks: report.summary.total
      }
    })
    return NextResponse.json(response)
  } catch (error) {
    logger.error('Health check failed', error as Error, {
      action: 'health_check_error'
    })
    return NextResponse.json({
      status: 'critical',
      error: 'Health check system unavailable',
      timestamp: new Date().toISOString()
    }, { status: 503 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    switch (action) {
      case 'start':
        healthMonitor.start()
        return NextResponse.json({
          success: true,
          message: 'Health monitor started',
          timestamp: new Date().toISOString()
        })
      case 'stop':
        healthMonitor.stop()
        return NextResponse.json({
          success: true,
          message: 'Health monitor stopped',
          timestamp: new Date().toISOString()
        })
      case 'reset':
        globalErrorHandler.resetErrorCounts()
        return NextResponse.json({
          success: true,
          message: 'Error counts reset',
          timestamp: new Date().toISOString()
        })
      default:
        return NextResponse.json({
          error: 'Invalid action. Use: start, stop, or reset'
        }, { status: 400 })
    }

  } catch (error) {
    logger.error('Health monitor action failed', error as Error, {
      action: 'health_monitor_action_error'
    })
    return NextResponse.json({
      error: 'Health monitor action failed'
    }, { status: 500 })
  }
}
