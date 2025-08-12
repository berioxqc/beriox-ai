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
  
  // Enable debug mode in development
  debug: process.env.NODE_ENV === 'development',
  
  // Ignore specific errors
  beforeSend(event) {
    // Ignore specific error types
    if (event.exception) {
      const exception = event.exception.values?.[0];
      if (exception?.type === 'NetworkError' || exception?.type === 'ChunkLoadError') {
        return null;
      }
    }
    return event;
  },
});
