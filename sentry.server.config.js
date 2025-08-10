import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  
  // Performance Monitoring
  tracesSampleRate: 1.0,
  
  // Environment
  environment: process.env.NODE_ENV,
  
  // Debug mode (désactivé en production)
  debug: process.env.NODE_ENV === 'development',
  
  // Filtrage des erreurs
  beforeSend(event, hint) {
    // Ignorer les erreurs de base de données non critiques
    if (event.exception) {
      const exception = event.exception.values?.[0];
      if (exception?.type === 'PrismaClientKnownRequestError' && 
          exception?.value?.includes('Record to update not found')) {
        return null;
      }
    }
    
    // Ignorer les erreurs de validation non critiques
    if (event.message && event.message.includes('Validation failed')) {
      return null;
    }
    
    return event;
  },
  
  // Configuration des intégrations
  integrations: [
    Sentry.integrations.http({ tracing: true }),
    Sentry.integrations.express({ app: undefined }),
    Sentry.integrations.prisma(),
  ],
  
  // Configuration des contextes
  initialScope: {
    tags: {
      service: 'beriox-ai',
      version: process.env.npm_package_version || '1.0.0',
    },
  },
});
