// Import Sentry avec gestion d'erreur pour éviter les problèmes de compatibilité
let Sentry: any = null;
try {
  Sentry = require("@sentry/nextjs");
} catch (error) {
  console.warn('Sentry not available, logging will be console-only');
}

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal'
}

interface LogContext {
  userId?: string;
  sessionId?: string;
  requestId?: string;
  action?: string;
  duration?: number;
  metadata?: Record<string, any>;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isProduction = process.env.NODE_ENV === 'production';

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` [${JSON.stringify(context)}]` : '';
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${contextStr}`;
  }

  private shouldLog(level: LogLevel): boolean {
    if (this.isDevelopment) return true;
    
    // En production, on ne log que les niveaux importants
    const productionLevels = [LogLevel.WARN, LogLevel.ERROR, LogLevel.FATAL];
    return productionLevels.includes(level);
  }

  private sendToSentry(level: LogLevel, message: string, context?: LogContext, error?: Error) {
    if (!this.isProduction || !Sentry) return;

    try {
      const sentryLevel = this.mapToSentryLevel(level);
      
      if (error) {
        Sentry.captureException(error, {
          level: sentryLevel,
          tags: {
            logLevel: level,
            action: context?.action,
          },
          extra: {
            message,
            context,
            duration: context?.duration,
          },
        });
      } else {
        Sentry.captureMessage(message, {
          level: sentryLevel,
          tags: {
            logLevel: level,
            action: context?.action,
          },
          extra: {
            context,
            duration: context?.duration,
          },
        });
      }
    } catch (sentryError) {
      // Fallback si Sentry échoue
      console.warn('Sentry error:', sentryError);
    }
  }

  private mapToSentryLevel(level: LogLevel): string {
    switch (level) {
      case LogLevel.DEBUG: return 'debug';
      case LogLevel.INFO: return 'info';
      case LogLevel.WARN: return 'warning';
      case LogLevel.ERROR: return 'error';
      case LogLevel.FATAL: return 'fatal';
      default: return 'info';
    }
  }

  debug(message: string, context?: LogContext) {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.debug(this.formatMessage(LogLevel.DEBUG, message, context));
    }
  }

  info(message: string, context?: LogContext) {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(this.formatMessage(LogLevel.INFO, message, context));
    }
  }

  warn(message: string, context?: LogContext) {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage(LogLevel.WARN, message, context));
      this.sendToSentry(LogLevel.WARN, message, context);
    }
  }

  error(message: string, error?: Error, context?: LogContext) {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(this.formatMessage(LogLevel.ERROR, message, context));
      if (error) {
        console.error('Error details:', error);
      }
      this.sendToSentry(LogLevel.ERROR, message, context, error);
    }
  }

  fatal(message: string, error?: Error, context?: LogContext) {
    console.error(this.formatMessage(LogLevel.FATAL, message, context));
    if (error) {
      console.error('Fatal error details:', error);
    }
    this.sendToSentry(LogLevel.FATAL, message, context, error);
  }

  // Méthodes spécialisées pour les métriques
  performance(action: string, duration: number, context?: LogContext) {
    this.info(`Performance: ${action} took ${duration}ms`, {
      ...context,
      action,
      duration,
      type: 'performance'
    });

    // Envoi des métriques de performance à Sentry (désactivé temporairement)
    // if (this.isProduction && Sentry.metrics) {
    //   try {
    //     Sentry.metrics.increment('performance.duration', duration, {
    //       tags: {
    //         action,
    //         ...context?.metadata
    //       }
    //     });
    //   } catch (error) {
    //     console.warn('Sentry metrics not available:', error);
    //   }
    // }
  }

  // Méthodes spécialisées pour les événements business
  businessEvent(event: string, data: Record<string, any>, context?: LogContext) {
    this.info(`Business Event: ${event}`, {
      ...context,
      action: event,
      metadata: data,
      type: 'business'
    });

    // Envoi des événements business à Sentry (désactivé temporairement)
    // if (this.isProduction && Sentry.metrics) {
    //   try {
    //     Sentry.metrics.increment('business.event', 1, {
    //       tags: {
    //         event,
    //         ...context?.metadata
    //       }
    //     });
    //   } catch (error) {
    //     console.warn('Sentry metrics not available:', error);
    //   }
    // }
  }

  // Méthodes spécialisées pour la sécurité
  security(event: string, data: Record<string, any>, context?: LogContext) {
    this.warn(`Security Event: ${event}`, {
      ...context,
      action: event,
      metadata: data,
      type: 'security'
    });

    // Envoi des événements de sécurité à Sentry (désactivé temporairement)
    // if (this.isProduction && Sentry.metrics) {
    //   try {
    //     Sentry.metrics.increment('security.event', 1, {
    //       tags: {
    //         event,
    //         severity: data.severity || 'medium',
    //         ...context?.metadata
    //       }
    //     });
    //   } catch (error) {
    //     console.warn('Sentry metrics not available:', error);
    //   }
    // }
  }

  // Méthodes spécialisées pour les paiements
  payment(event: string, data: Record<string, any>, context?: LogContext) {
    this.info(`Payment Event: ${event}`, {
      ...context,
      action: event,
      metadata: data,
      type: 'payment'
    });

    // Envoi des événements de paiement à Sentry (désactivé temporairement)
    // if (this.isProduction && Sentry.metrics) {
    //   try {
    //     Sentry.metrics.increment('payment.event', 1, {
    //       tags: {
    //         event,
    //         status: data.status || 'unknown',
    //         amount: data.amount || 0,
    //         currency: data.currency || 'usd',
    //         ...context?.metadata
    //       }
    //     });
    //   } catch (error) {
    //     console.warn('Sentry metrics not available:', error);
    //   }
    // }
  }

  // Méthodes spécialisées pour les erreurs d'API
  apiError(endpoint: string, statusCode: number, error: Error, context?: LogContext) {
    this.error(`API Error: ${endpoint} returned ${statusCode}`, error, {
      ...context,
      action: 'api_error',
      metadata: {
        endpoint,
        statusCode,
        method: context?.metadata?.method || 'GET'
      }
    });

    // Envoi des métriques d'erreur API à Sentry (désactivé temporairement)
    // if (this.isProduction && Sentry.metrics) {
    //   try {
    //     Sentry.metrics.increment('api.error', 1, {
    //       tags: {
    //         endpoint,
    //         statusCode: statusCode.toString(),
    //         method: context?.metadata?.method || 'GET'
    //       }
    //     });
    //   } catch (error) {
    //     console.warn('Sentry metrics not available:', error);
    //   }
    // }
  }

  // Méthodes spécialisées pour les erreurs de base de données
  dbError(operation: string, table: string, error: Error, context?: LogContext) {
    this.error(`Database Error: ${operation} on ${table}`, error, {
      ...context,
      action: 'db_error',
      metadata: {
        operation,
        table
      }
    });

    // Envoi des métriques d'erreur DB à Sentry (désactivé temporairement)
    // if (this.isProduction && Sentry.metrics) {
    //   try {
    //     Sentry.metrics.increment('database.error', 1, {
    //       tags: {
    //         operation,
    //         table
    //       }
    //     });
    //   } catch (error) {
    //     console.warn('Sentry metrics not available:', error);
    //   }
    // }
  }

  // Méthodes spécialisées pour les erreurs d'authentification
  authError(action: string, error: Error, context?: LogContext) {
    this.warn(`Auth Error: ${action}`, {
      ...context,
      action: 'auth_error',
      metadata: {
        authAction: action
      }
    }, error);

    // Envoi des métriques d'erreur d'auth à Sentry (désactivé temporairement)
    // if (this.isProduction && Sentry.metrics) {
    //   try {
    //     Sentry.metrics.increment('auth.error', 1, {
    //       tags: {
    //         action
    //       }
    //     });
    //   } catch (error) {
    //     console.warn('Sentry metrics not available:', error);
    //   }
    // }
  }
}

export const logger = new Logger();

// Fonction utilitaire pour mesurer les performances
export const withPerformanceLogging = <T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  action: string
) => {
  return async (...args: T): Promise<R> => {
    const start = Date.now();
    try {
      const result = await fn(...args);
      const duration = Date.now() - start;
      logger.performance(action, duration);
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      logger.error(`Error in ${action}`, error as Error, { action, duration });
      throw error;
    }
  };
};

// Fonction utilitaire pour les transactions Sentry (désactivée temporairement)
// export const withSentryTransaction = <T extends any[], R>(
//   fn: (...args: T) => Promise<R>,
//   operation: string,
//   description?: string
// ) => {
//   return async (...args: T): Promise<R> => {
//     const transaction = Sentry.startTransaction({
//       op: operation,
//       description: description || operation,
//     });

//     // Utiliser la nouvelle API Sentry
//     Sentry.getCurrentScope().setSpan(transaction);

//     try {
//       const result = await fn(...args);
//       transaction.setStatus('ok');
//       return result;
//     } catch (error) {
//       transaction.setStatus('internal_error');
//       throw error;
//     } finally {
//       transaction.finish();
//     }
//   };
// };


