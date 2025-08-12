import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
export async function GET(request: NextRequest) {
  const startTime = Date.now()
  try {
    const healthCheck = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      checks: {
        internet: { status: 'unknown', duration: 0 },
        openai: { status: 'unknown', duration: 0 },
        stripe: { status: 'unknown', duration: 0 },
        google: { status: 'unknown', duration: 0 }
      },
      metrics: {
        totalDuration: 0
      }
    }
    // Test de connectivité internet générale
    const internetStart = Date.now()
    try {
      const response = await fetch('https://httpbin.org/get', {
        method: 'GET',
        timeout: 5000
      })
      if (response.ok) {
        healthCheck.checks.internet = {
          status: 'healthy',
          duration: Date.now() - internetStart
        }
        logger.info('External health check: Internet connectivity successful', {
          action: 'health_check_external',
          duration: healthCheck.checks.internet.duration
        })
      } else {
        throw new Error(`HTTP ${response.status}`)
      }
    } catch (error) {
      healthCheck.checks.internet = {
        status: 'unhealthy',
        duration: Date.now() - internetStart
      }
      logger.error('External health check: Internet connectivity failed', error as Error, {
        action: 'health_check_external',
        duration: healthCheck.checks.internet.duration
      })
    }

    // Test de l'API OpenAI (si configurée)
    const openaiStart = Date.now()
    try {
      if (process.env.OPENAI_API_KEY) {
        const response = await fetch('https://api.openai.com/v1/models', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        })
        if (response.ok) {
          healthCheck.checks.openai = {
            status: 'healthy',
            duration: Date.now() - openaiStart
          }
          logger.info('External health check: OpenAI API successful', {
            action: 'health_check_external',
            duration: healthCheck.checks.openai.duration
          })
        } else {
          throw new Error(`OpenAI API returned ${response.status}`)
        }
      } else {
        healthCheck.checks.openai = {
          status: 'not_configured',
          duration: Date.now() - openaiStart
        }
        logger.info('External health check: OpenAI API not configured', {
          action: 'health_check_external'
        })
      }
    } catch (error) {
      healthCheck.checks.openai = {
        status: 'unhealthy',
        duration: Date.now() - openaiStart
      }
      logger.error('External health check: OpenAI API failed', error as Error, {
        action: 'health_check_external',
        duration: healthCheck.checks.openai.duration
      })
    }

    // Test de l'API Stripe (si configurée)
    const stripeStart = Date.now()
    try {
      if (process.env.STRIPE_SECRET_KEY) {
        const response = await fetch('https://api.stripe.com/v1/account', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          timeout: 10000
        })
        if (response.ok) {
          healthCheck.checks.stripe = {
            status: 'healthy',
            duration: Date.now() - stripeStart
          }
          logger.info('External health check: Stripe API successful', {
            action: 'health_check_external',
            duration: healthCheck.checks.stripe.duration
          })
        } else {
          throw new Error(`Stripe API returned ${response.status}`)
        }
      } else {
        healthCheck.checks.stripe = {
          status: 'not_configured',
          duration: Date.now() - stripeStart
        }
        logger.info('External health check: Stripe API not configured', {
          action: 'health_check_external'
        })
      }
    } catch (error) {
      healthCheck.checks.stripe = {
        status: 'unhealthy',
        duration: Date.now() - stripeStart
      }
      logger.error('External health check: Stripe API failed', error as Error, {
        action: 'health_check_external',
        duration: healthCheck.checks.stripe.duration
      })
    }

    // Test de l'API Google (si configurée)
    const googleStart = Date.now()
    try {
      if (process.env.GOOGLE_CLIENT_ID) {
        const response = await fetch('https://www.googleapis.com/oauth2/v1/userinfo', {
          method: 'GET',
          timeout: 5000
        })
        if (response.ok || response.status === 401) { // 401 est normal sans token
          healthCheck.checks.google = {
            status: 'healthy',
            duration: Date.now() - googleStart
          }
          logger.info('External health check: Google API successful', {
            action: 'health_check_external',
            duration: healthCheck.checks.google.duration
          })
        } else {
          throw new Error(`Google API returned ${response.status}`)
        }
      } else {
        healthCheck.checks.google = {
          status: 'not_configured',
          duration: Date.now() - googleStart
        }
        logger.info('External health check: Google API not configured', {
          action: 'health_check_external'
        })
      }
    } catch (error) {
      healthCheck.checks.google = {
        status: 'unhealthy',
        duration: Date.now() - googleStart
      }
      logger.error('External health check: Google API failed', error as Error, {
        action: 'health_check_external',
        duration: healthCheck.checks.google.duration
      })
    }

    // Déterminer le statut global
    const criticalServices = ['internet']
    const criticalHealthy = criticalServices.every(
      service => healthCheck.checks[service as keyof typeof healthCheck.checks].status === 'healthy'
    )
    const allHealthy = Object.values(healthCheck.checks).every(
      check => check.status === 'healthy' || check.status === 'not_configured'
    )
    if (!criticalHealthy) {
      healthCheck.status = 'unhealthy'
    } else if (!allHealthy) {
      healthCheck.status = 'degraded'
    }

    healthCheck.metrics.totalDuration = Date.now() - startTime
    logger.info('External health check completed', {
      action: 'health_check_external',
      duration: healthCheck.metrics.totalDuration,
      status: healthCheck.status,
      checks: healthCheck.checks
    })
    return NextResponse.json(healthCheck, {
      status: healthCheck.status === 'healthy' ? 200 : 
              healthCheck.status === 'degraded' ? 503 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    logger.error('External health check failed', error as Error, {
      action: 'health_check_external',
      duration: Date.now() - startTime
    })
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'External health check failed',
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
