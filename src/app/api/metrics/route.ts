import { NextRequest, NextResponse } from 'next/server';
import { metrics } from '@/lib/metrics';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Vérifier l'authentification pour les métriques sensibles
    const authHeader = request.headers.get('authorization');
    const isAuthenticated = authHeader === `Bearer ${process.env.METRICS_API_KEY}`;
    
    if (!isAuthenticated) {
      return NextResponse.json({
        error: 'Unauthorized',
        message: 'API key required for metrics access'
      }, {
        status: 401,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
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
        version: process.env.npm_package_version || '1.0.0'
      }
    };

    const response = {
      ...allMetrics,
      stats,
      timestamp: new Date().toISOString(),
      duration: Date.now() - startTime
    };

    logger.info('Metrics exported successfully', {
      action: 'metrics_export',
      duration: response.duration,
      metricsCount: allMetrics.metrics.length,
      performanceCount: allMetrics.performanceMetrics.length
    });

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    logger.error('Metrics export failed', error as Error, {
      action: 'metrics_export',
      duration: Date.now() - startTime
    });

    return NextResponse.json({
      error: 'Internal Server Error',
      message: 'Failed to export metrics',
      timestamp: new Date().toISOString(),
      duration: Date.now() - startTime
    }, {
      status: 500,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Vérifier l'authentification
    const authHeader = request.headers.get('authorization');
    const isAuthenticated = authHeader === `Bearer ${process.env.METRICS_API_KEY}`;
    
    if (!isAuthenticated) {
      return NextResponse.json({
        error: 'Unauthorized',
        message: 'API key required for metrics access'
      }, {
        status: 401
      });
    }

    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'cleanup':
        const maxAge = data?.maxAge || 24 * 60 * 60 * 1000; // 24 heures par défaut
        metrics.cleanup(maxAge);
        
        logger.info('Metrics cleanup triggered', {
          action: 'metrics_cleanup_triggered',
          maxAge,
          duration: Date.now() - startTime
        });
        
        return NextResponse.json({
          success: true,
          action: 'cleanup',
          maxAge,
          timestamp: new Date().toISOString(),
          duration: Date.now() - startTime
        });

      case 'reset':
        // Note: Cette action devrait être utilisée avec précaution
        // metrics.reset(); // Méthode à implémenter si nécessaire
        
        logger.warn('Metrics reset requested', {
          action: 'metrics_reset_requested',
          duration: Date.now() - startTime
        });
        
        return NextResponse.json({
          success: true,
          action: 'reset',
          message: 'Reset functionality not implemented',
          timestamp: new Date().toISOString(),
          duration: Date.now() - startTime
        });

      default:
        return NextResponse.json({
          error: 'Invalid action',
          message: `Unknown action: ${action}`,
          timestamp: new Date().toISOString(),
          duration: Date.now() - startTime
        }, {
          status: 400
        });
    }

  } catch (error) {
    logger.error('Metrics action failed', error as Error, {
      action: 'metrics_action',
      duration: Date.now() - startTime
    });

    return NextResponse.json({
      error: 'Internal Server Error',
      message: 'Failed to process metrics action',
      timestamp: new Date().toISOString(),
      duration: Date.now() - startTime
    }, {
      status: 500
    });
  }
}
