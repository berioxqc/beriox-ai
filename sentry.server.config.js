import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  
  // Performance Monitoring
  tracesSampleRate: 1.0,
  
  // Environment
  environment: process.env.NODE_ENV,
  
  // Enable debug mode in development
  debug: process.env.NODE_ENV === 'development',
  
  // Ignore specific errors
  beforeSend(event) {
    // Ignore specific error types
    if (event.exception) {
      const exception = event.exception.values?.[0];
      if (exception?.type === 'PrismaClientKnownRequestError') {
        return null;
      }
    }
    return event;
  },
  
  // Configure integrations
  integrations: [
    Sentry.integrations.http({ tracing: true }),
    Sentry.integrations.express({ app: undefined }),
  ],
});
