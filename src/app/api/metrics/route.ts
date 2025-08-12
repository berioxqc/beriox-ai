import { NextRequest, NextResponse } from 'apos;next/server'apos;;
import { metrics } from 'apos;@/lib/metrics'apos;;
import { logger } from 'apos;@/lib/logger'apos;;

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Vérifier l'apos;authentification pour les métriques sensibles
    const authHeader = request.headers.get('apos;authorization'apos;);
    const isAuthenticated = authHeader === `Bearer ${process.env.METRICS_API_KEY}`;
    
    if (!isAuthenticated) {
      return NextResponse.json({
        error: 'apos;Unauthorized'apos;,
        message: 'apos;API key required for metrics access'apos;
      }, {
        status: 401,
        headers: {
          'apos;Cache-Control'apos;: 'apos;no-cache, no-store, must-revalidate'apos;,
          'apos;Pragma'apos;: 'apos;no-cache'apos;,
          'apos;Expires'apos;: 'apos;0'apos;
        }
      });
    }

    // Récupérer les métriques
    const allMetrics = metrics.exportMetrics();
    
    // Ajouter les métriques système en temps réel
    metrics.recordSystemMetrics();
    
    // Calculer les statistiques supplémentaires
    const stats = {
      ...allMetrics.stats,
      system: {
        memory: process.memoryUsage(),
        uptime: process.uptime(),
        cpu: process.cpuUsage(),
        platform: process.platform,
        arch: process.arch,
        nodeVersion: process.version
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        version: process.env.npm_package_version || 'apos;1.0.0'apos;
      }
    };

    const response = {
      ...allMetrics,
      stats,
      timestamp: new Date().toISOString(),
      duration: Date.now() - startTime
    };

    logger.info('apos;Metrics exported successfully'apos;, {
      action: 'apos;metrics_export'apos;,
      duration: response.duration,
      metricsCount: allMetrics.metrics.length,
      performanceCount: allMetrics.performanceMetrics.length
    });

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'apos;Cache-Control'apos;: 'apos;no-cache, no-store, must-revalidate'apos;,
        'apos;Pragma'apos;: 'apos;no-cache'apos;,
        'apos;Expires'apos;: 'apos;0'apos;,
        'apos;Content-Type'apos;: 'apos;application/json'apos;
      }
    });

  } catch (error) {
    logger.error('apos;Metrics export failed'apos;, error as Error, {
      action: 'apos;metrics_export'apos;,
      duration: Date.now() - startTime
    });

    return NextResponse.json({
      error: 'apos;Internal Server Error'apos;,
      message: 'apos;Failed to export metrics'apos;,
      timestamp: new Date().toISOString(),
      duration: Date.now() - startTime
    }, {
      status: 500,
      headers: {
        'apos;Cache-Control'apos;: 'apos;no-cache, no-store, must-revalidate'apos;,
        'apos;Pragma'apos;: 'apos;no-cache'apos;,
        'apos;Expires'apos;: 'apos;0'apos;
      }
    });
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Vérifier l'apos;authentification
    const authHeader = request.headers.get('apos;authorization'apos;);
    const isAuthenticated = authHeader === `Bearer ${process.env.METRICS_API_KEY}`;
    
    if (!isAuthenticated) {
      return NextResponse.json({
        error: 'apos;Unauthorized'apos;,
        message: 'apos;API key required for metrics access'apos;
      }, {
        status: 401
      });
    }

    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'apos;cleanup'apos;:
        const maxAge = data?.maxAge || 24 * 60 * 60 * 1000; // 24 heures par défaut
        metrics.cleanup(maxAge);
        
        logger.info('apos;Metrics cleanup triggered'apos;, {
          action: 'apos;metrics_cleanup_triggered'apos;,
          maxAge,
          duration: Date.now() - startTime
        });
        
        return NextResponse.json({
          success: true,
          action: 'apos;cleanup'apos;,
          maxAge,
          timestamp: new Date().toISOString(),
          duration: Date.now() - startTime
        });

      case 'apos;reset'apos;:
        // Note: Cette action devrait être utilisée avec précaution
        // metrics.reset(); // Méthode à implémenter si nécessaire
        
        logger.warn('apos;Metrics reset requested'apos;, {
          action: 'apos;metrics_reset_requested'apos;,
          duration: Date.now() - startTime
        });
        
        return NextResponse.json({
          success: true,
          action: 'apos;reset'apos;,
          message: 'apos;Reset functionality not implemented'apos;,
          timestamp: new Date().toISOString(),
          duration: Date.now() - startTime
        });

      default:
        return NextResponse.json({
          error: 'apos;Invalid action'apos;,
          message: `Unknown action: ${action}`,
          timestamp: new Date().toISOString(),
          duration: Date.now() - startTime
        }, {
          status: 400
        });
    }

  } catch (error) {
    logger.error('apos;Metrics action failed'apos;, error as Error, {
      action: 'apos;metrics_action'apos;,
      duration: Date.now() - startTime
    });

    return NextResponse.json({
      error: 'apos;Internal Server Error'apos;,
      message: 'apos;Failed to process metrics action'apos;,
      timestamp: new Date().toISOString(),
      duration: Date.now() - startTime
    }, {
      status: 500
    });
  }
}
