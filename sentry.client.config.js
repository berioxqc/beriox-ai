import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Performance Monitoring
  tracesSampleRate: 1.0,
  
  // Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  // Environment
  environment: process.env.NODE_ENV,
  
  // Debug mode (désactivé en production)
  debug: process.env.NODE_ENV === 'development',
  
  // Filtrage des erreurs
  beforeSend(event, hint) {
    // Ignorer les erreurs de réseau
    if (event.exception) {
      const exception = event.exception.values?.[0];
      if (exception?.type === 'NetworkError' || exception?.value?.includes('fetch')) {
        return null;
      }
    }
    
    // Ignorer les erreurs de console
    if (event.message && event.message.includes('console.error')) {
      return null;
    }
    
    return event;
  },
  
  // Configuration des intégrations
  integrations: [
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
});
