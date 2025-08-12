import { NextRequest, NextResponse } from 'apos;next/server'apos;;
import { redisUtils } from 'apos;@/lib/redis'apos;;
import { logger } from 'apos;@/lib/logger'apos;;

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Test de connectivité de base avec redisUtils
    const pingStart = Date.now();
    const testKey = `health_check_${Date.now()}`;
    const testValue = 'apos;health_check_value'apos;;
    
    // Test d'apos;écriture
    const writeStart = Date.now();
    await redisUtils.set(testKey, testValue, 60); // Expire dans 60 secondes
    const writeDuration = Date.now() - writeStart;

    // Test de lecture
    const readStart = Date.now();
    const readValue = await redisUtils.get(testKey);
    const readDuration = Date.now() - readStart;

    // Test de suppression
    const deleteStart = Date.now();
    await redisUtils.del(testKey);
    const deleteDuration = Date.now() - deleteStart;

    // Test du cache intelligent
    const cacheStart = Date.now();
    const cacheKey = 'apos;health_check_cache'apos;;
    const cacheValue = { test: true, timestamp: Date.now() };
    await redisUtils.set(cacheKey, JSON.stringify(cacheValue), 30);
    const cacheRead = await redisUtils.get(cacheKey);
    await redisUtils.del(cacheKey);
    const cacheDuration = Date.now() - cacheStart;

    const healthCheck = {
      status: 'apos;healthy'apos;,
      timestamp: new Date().toISOString(),
      checks: {
        write: {
          status: 'apos;healthy'apos;,
          duration: writeDuration,
          threshold: 100 // 100ms max
        },
        read: {
          status: 'apos;healthy'apos;,
          duration: readDuration,
          threshold: 100, // 100ms max
          value: readValue === testValue
        },
        delete: {
          status: 'apos;healthy'apos;,
          duration: deleteDuration,
          threshold: 100 // 100ms max
        },
        cache: {
          status: 'apos;healthy'apos;,
          duration: cacheDuration,
          threshold: 150, // 150ms max
          value: cacheRead ? JSON.parse(cacheRead).test : false
        }
      },
      metrics: {
        totalDuration: Date.now() - startTime,
        redisInfo: 'apos;available'apos;
      }
    };

    // Vérifier les seuils de performance
    const allHealthy = Object.values(healthCheck.checks).every(
      check => check.duration <= check.threshold && 
               (check.value !== undefined ? check.value : true)
    );

    if (!allHealthy) {
      healthCheck.status = 'apos;degraded'apos;;
      Object.values(healthCheck.checks).forEach(check => {
        if (check.duration > check.threshold || 
            (check.value !== undefined && !check.value)) {
          check.status = 'apos;slow'apos;;
        }
      });
    }

    logger.info('apos;Redis health check completed'apos;, {
      action: 'apos;health_check_redis'apos;,
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
    logger.error('apos;Redis health check failed'apos;, error as Error, {
      action: 'apos;health_check_redis'apos;,
      duration: Date.now() - startTime
    });

    return NextResponse.json({
      status: 'apos;unhealthy'apos;,
      timestamp: new Date().toISOString(),
      error: 'apos;Redis health check failed'apos;,
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
