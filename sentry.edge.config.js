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
    // Ignorer les erreurs de timeout
    if (event.exception) {
      const exception = event.exception.values?.[0];
      if (exception?.type === 'TimeoutError') {
        return null;
      }
    }
    
    return event;
  },
});
