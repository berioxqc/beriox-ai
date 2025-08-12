import { NextRequest, NextResponse } from 'apos;next/server'apos;;
import { healthMonitor } from 'apos;@/lib/health-monitor'apos;;
import { globalErrorHandler } from 'apos;@/lib/error-handler'apos;;
import { logger } from 'apos;@/lib/logger'apos;;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const detailed = searchParams.get('apos;detailed'apos;) === 'apos;true'apos;;
    const runChecks = searchParams.get('apos;run'apos;) === 'apos;true'apos;;

    // Si on demande d'apos;exécuter les vérifications
    if (runChecks) {
      await healthMonitor.runAllChecks();
    }

    // Générer le rapport de santé
    const report = healthMonitor.generateReport();
    const errorStats = globalErrorHandler.getErrorStats();

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
    };

    // Log de la requête de santé
    logger.info('apos;Health check requested'apos;, {
      action: 'apos;health_check_request'apos;,
      metadata: {
        detailed,
        runChecks,
        overallStatus: report.status,
        healthyChecks: report.summary.healthy,
        totalChecks: report.summary.total
      }
    });

    return NextResponse.json(response);

  } catch (error) {
    logger.error('apos;Health check failed'apos;, error as Error, {
      action: 'apos;health_check_error'apos;
    });

    return NextResponse.json({
      status: 'apos;critical'apos;,
      error: 'apos;Health check system unavailable'apos;,
      timestamp: new Date().toISOString()
    }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('apos;action'apos;);

    switch (action) {
      case 'apos;start'apos;:
        healthMonitor.start();
        return NextResponse.json({
          success: true,
          message: 'apos;Health monitor started'apos;,
          timestamp: new Date().toISOString()
        });

      case 'apos;stop'apos;:
        healthMonitor.stop();
        return NextResponse.json({
          success: true,
          message: 'apos;Health monitor stopped'apos;,
          timestamp: new Date().toISOString()
        });

      case 'apos;reset'apos;:
        globalErrorHandler.resetErrorCounts();
        return NextResponse.json({
          success: true,
          message: 'apos;Error counts reset'apos;,
          timestamp: new Date().toISOString()
        });

      default:
        return NextResponse.json({
          error: 'apos;Invalid action. Use: start, stop, or reset'apos;
        }, { status: 400 });
    }

  } catch (error) {
    logger.error('apos;Health monitor action failed'apos;, error as Error, {
      action: 'apos;health_monitor_action_error'apos;
    });

    return NextResponse.json({
      error: 'apos;Health monitor action failed'apos;
    }, { status: 500 });
  }
}
