import { NextRequest, NextResponse } from 'apos;next/server'apos;;
import { logger } from 'apos;@/lib/logger'apos;;

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const healthCheck = {
      status: 'apos;healthy'apos;,
      timestamp: new Date().toISOString(),
      checks: {
        internet: { status: 'apos;unknown'apos;, duration: 0 },
        openai: { status: 'apos;unknown'apos;, duration: 0 },
        stripe: { status: 'apos;unknown'apos;, duration: 0 },
        google: { status: 'apos;unknown'apos;, duration: 0 }
      },
      metrics: {
        totalDuration: 0
      }
    };

    // Test de connectivité internet générale
    const internetStart = Date.now();
    try {
      const response = await fetch('apos;https://httpbin.org/get'apos;, {
        method: 'apos;GET'apos;,
        timeout: 5000
      });
      
      if (response.ok) {
        healthCheck.checks.internet = {
          status: 'apos;healthy'apos;,
          duration: Date.now() - internetStart
        };
        logger.info('apos;External health check: Internet connectivity successful'apos;, {
          action: 'apos;health_check_external'apos;,
          duration: healthCheck.checks.internet.duration
        });
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      healthCheck.checks.internet = {
        status: 'apos;unhealthy'apos;,
        duration: Date.now() - internetStart
      };
      logger.error('apos;External health check: Internet connectivity failed'apos;, error as Error, {
        action: 'apos;health_check_external'apos;,
        duration: healthCheck.checks.internet.duration
      });
    }

    // Test de l'apos;API OpenAI (si configurée)
    const openaiStart = Date.now();
    try {
      if (process.env.OPENAI_API_KEY) {
        const response = await fetch('apos;https://api.openai.com/v1/models'apos;, {
          method: 'apos;GET'apos;,
          headers: {
            'apos;Authorization'apos;: `Bearer ${process.env.OPENAI_API_KEY}`,
            'apos;Content-Type'apos;: 'apos;application/json'apos;
          },
          timeout: 10000
        });
        
        if (response.ok) {
          healthCheck.checks.openai = {
            status: 'apos;healthy'apos;,
            duration: Date.now() - openaiStart
          };
          logger.info('apos;External health check: OpenAI API successful'apos;, {
            action: 'apos;health_check_external'apos;,
            duration: healthCheck.checks.openai.duration
          });
        } else {
          throw new Error(`OpenAI API returned ${response.status}`);
        }
      } else {
        healthCheck.checks.openai = {
          status: 'apos;not_configured'apos;,
          duration: Date.now() - openaiStart
        };
        logger.info('apos;External health check: OpenAI API not configured'apos;, {
          action: 'apos;health_check_external'apos;
        });
      }
    } catch (error) {
      healthCheck.checks.openai = {
        status: 'apos;unhealthy'apos;,
        duration: Date.now() - openaiStart
      };
      logger.error('apos;External health check: OpenAI API failed'apos;, error as Error, {
        action: 'apos;health_check_external'apos;,
        duration: healthCheck.checks.openai.duration
      });
    }

    // Test de l'apos;API Stripe (si configurée)
    const stripeStart = Date.now();
    try {
      if (process.env.STRIPE_SECRET_KEY) {
        const response = await fetch('apos;https://api.stripe.com/v1/account'apos;, {
          method: 'apos;GET'apos;,
          headers: {
            'apos;Authorization'apos;: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
            'apos;Content-Type'apos;: 'apos;application/x-www-form-urlencoded'apos;
          },
          timeout: 10000
        });
        
        if (response.ok) {
          healthCheck.checks.stripe = {
            status: 'apos;healthy'apos;,
            duration: Date.now() - stripeStart
          };
          logger.info('apos;External health check: Stripe API successful'apos;, {
            action: 'apos;health_check_external'apos;,
            duration: healthCheck.checks.stripe.duration
          });
        } else {
          throw new Error(`Stripe API returned ${response.status}`);
        }
      } else {
        healthCheck.checks.stripe = {
          status: 'apos;not_configured'apos;,
          duration: Date.now() - stripeStart
        };
        logger.info('apos;External health check: Stripe API not configured'apos;, {
          action: 'apos;health_check_external'apos;
        });
      }
    } catch (error) {
      healthCheck.checks.stripe = {
        status: 'apos;unhealthy'apos;,
        duration: Date.now() - stripeStart
      };
      logger.error('apos;External health check: Stripe API failed'apos;, error as Error, {
        action: 'apos;health_check_external'apos;,
        duration: healthCheck.checks.stripe.duration
      });
    }

    // Test de l'apos;API Google (si configurée)
    const googleStart = Date.now();
    try {
      if (process.env.GOOGLE_CLIENT_ID) {
        const response = await fetch('apos;https://www.googleapis.com/oauth2/v1/userinfo'apos;, {
          method: 'apos;GET'apos;,
          timeout: 5000
        });
        
        if (response.ok || response.status === 401) { // 401 est normal sans token
          healthCheck.checks.google = {
            status: 'apos;healthy'apos;,
            duration: Date.now() - googleStart
          };
          logger.info('apos;External health check: Google API successful'apos;, {
            action: 'apos;health_check_external'apos;,
            duration: healthCheck.checks.google.duration
          });
        } else {
          throw new Error(`Google API returned ${response.status}`);
        }
      } else {
        healthCheck.checks.google = {
          status: 'apos;not_configured'apos;,
          duration: Date.now() - googleStart
        };
        logger.info('apos;External health check: Google API not configured'apos;, {
          action: 'apos;health_check_external'apos;
        });
      }
    } catch (error) {
      healthCheck.checks.google = {
        status: 'apos;unhealthy'apos;,
        duration: Date.now() - googleStart
      };
      logger.error('apos;External health check: Google API failed'apos;, error as Error, {
        action: 'apos;health_check_external'apos;,
        duration: healthCheck.checks.google.duration
      });
    }

    // Déterminer le statut global
    const criticalServices = ['apos;internet'apos;];
    const criticalHealthy = criticalServices.every(
      service => healthCheck.checks[service as keyof typeof healthCheck.checks].status === 'apos;healthy'apos;
    );

    const allHealthy = Object.values(healthCheck.checks).every(
      check => check.status === 'apos;healthy'apos; || check.status === 'apos;not_configured'apos;
    );

    if (!criticalHealthy) {
      healthCheck.status = 'apos;unhealthy'apos;;
    } else if (!allHealthy) {
      healthCheck.status = 'apos;degraded'apos;;
    }

    healthCheck.metrics.totalDuration = Date.now() - startTime;

    logger.info('apos;External health check completed'apos;, {
      action: 'apos;health_check_external'apos;,
      duration: healthCheck.metrics.totalDuration,
      status: healthCheck.status,
      checks: healthCheck.checks
    });

    return NextResponse.json(healthCheck, {
      status: healthCheck.status === 'apos;healthy'apos; ? 200 : 
              healthCheck.status === 'apos;degraded'apos; ? 503 : 503,
      headers: {
        'apos;Cache-Control'apos;: 'apos;no-cache, no-store, must-revalidate'apos;,
        'apos;Pragma'apos;: 'apos;no-cache'apos;,
        'apos;Expires'apos;: 'apos;0'apos;
      }
    });

  } catch (error) {
    logger.error('apos;External health check failed'apos;, error as Error, {
      action: 'apos;health_check_external'apos;,
      duration: Date.now() - startTime
    });

    return NextResponse.json({
      status: 'apos;unhealthy'apos;,
      timestamp: new Date().toISOString(),
      error: 'apos;External health check failed'apos;,
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
