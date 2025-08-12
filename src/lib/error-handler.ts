import { NextRequest, NextResponse } from 'apos;next/server'apos;;
import { logger } from 'apos;./logger'apos;;
import { ZodError } from 'apos;zod'apos;;

// ============================================================================
// TYPES D'apos;ERREURS
// ============================================================================

export enum ErrorType {
  VALIDATION = 'apos;VALIDATION'apos;,
  AUTHENTICATION = 'apos;AUTHENTICATION'apos;,
  AUTHORIZATION = 'apos;AUTHORIZATION'apos;,
  NOT_FOUND = 'apos;NOT_FOUND'apos;,
  RATE_LIMIT = 'apos;RATE_LIMIT'apos;,
  DATABASE = 'apos;DATABASE'apos;,
  EXTERNAL_SERVICE = 'apos;EXTERNAL_SERVICE'apos;,
  INTERNAL = 'apos;INTERNAL'apos;,
  NETWORK = 'apos;NETWORK'apos;,
  TIMEOUT = 'apos;TIMEOUT'apos;,
}

export interface AppError extends Error {
  type: ErrorType;
  statusCode: number;
  code?: string;
  details?: unknown;
  isOperational?: boolean;
  retryable?: boolean;
}

// ============================================================================
// CLASSES D'apos;ERREURS SPÉCIALISÉES
// ============================================================================

export class ValidationError extends Error implements AppError {
  public readonly type = ErrorType.VALIDATION;
  public readonly statusCode = 400;
  public readonly isOperational = true;
  public readonly retryable = false;

  constructor(
    message: string,
    public readonly details?: unknown,
    public readonly code?: string
  ) {
    super(message);
    this.name = 'apos;ValidationError'apos;;
  }
}

export class AuthenticationError extends Error implements AppError {
  public readonly type = ErrorType.AUTHENTICATION;
  public readonly statusCode = 401;
  public readonly isOperational = true;
  public readonly retryable = false;

  constructor(
    message: string = 'apos;Authentification requise'apos;,
    public readonly code?: string
  ) {
    super(message);
    this.name = 'apos;AuthenticationError'apos;;
  }
}

export class AuthorizationError extends Error implements AppError {
  public readonly type = ErrorType.AUTHORIZATION;
  public readonly statusCode = 403;
  public readonly isOperational = true;
  public readonly retryable = false;

  constructor(
    message: string = 'apos;Accès non autorisé'apos;,
    public readonly code?: string
  ) {
    super(message);
    this.name = 'apos;AuthorizationError'apos;;
  }
}

export class NotFoundError extends Error implements AppError {
  public readonly type = ErrorType.NOT_FOUND;
  public readonly statusCode = 404;
  public readonly isOperational = true;
  public readonly retryable = false;

  constructor(
    message: string = 'apos;Ressource non trouvée'apos;,
    public readonly code?: string
  ) {
    super(message);
    this.name = 'apos;NotFoundError'apos;;
  }
}

export class RateLimitError extends Error implements AppError {
  public readonly type = ErrorType.RATE_LIMIT;
  public readonly statusCode = 429;
  public readonly isOperational = true;
  public readonly retryable = true;

  constructor(
    message: string = 'apos;Limite de taux dépassée'apos;,
    public readonly retryAfter?: number,
    public readonly code?: string
  ) {
    super(message);
    this.name = 'apos;RateLimitError'apos;;
  }
}

export class DatabaseError extends Error implements AppError {
  public readonly type = ErrorType.DATABASE;
  public readonly statusCode = 500;
  public readonly isOperational = true;
  public readonly retryable = true;

  constructor(
    message: string = 'apos;Erreur de base de données'apos;,
    public readonly details?: unknown,
    public readonly code?: string
  ) {
    super(message);
    this.name = 'apos;DatabaseError'apos;;
  }
}

export class ExternalServiceError extends Error implements AppError {
  public readonly type = ErrorType.EXTERNAL_SERVICE;
  public readonly statusCode = 502;
  public readonly isOperational = true;
  public readonly retryable = true;

  constructor(
    message: string = 'apos;Erreur de service externe'apos;,
    public readonly service?: string,
    public readonly details?: unknown,
    public readonly code?: string
  ) {
    super(message);
    this.name = 'apos;ExternalServiceError'apos;;
  }
}

export class InternalError extends Error implements AppError {
  public readonly type = ErrorType.INTERNAL;
  public readonly statusCode = 500;
  public readonly isOperational = false;
  public readonly retryable = false;

  constructor(
    message: string = 'apos;Erreur interne du serveur'apos;,
    public readonly details?: unknown,
    public readonly code?: string
  ) {
    super(message);
    this.name = 'apos;InternalError'apos;;
  }
}

export class NetworkError extends Error implements AppError {
  public readonly type = ErrorType.NETWORK;
  public readonly statusCode = 503;
  public readonly isOperational = true;
  public readonly retryable = true;

  constructor(
    message: string = 'apos;Erreur de réseau'apos;,
    public readonly details?: unknown,
    public readonly code?: string
  ) {
    super(message);
    this.name = 'apos;NetworkError'apos;;
  }
}

export class TimeoutError extends Error implements AppError {
  public readonly type = ErrorType.TIMEOUT;
  public readonly statusCode = 408;
  public readonly isOperational = true;
  public readonly retryable = true;

  constructor(
    message: string = 'apos;Délai d\'apos;attente dépassé'apos;,
    public readonly timeout?: number,
    public readonly code?: string
  ) {
    super(message);
    this.name = 'apos;TimeoutError'apos;;
  }
}

// ============================================================================
// FONCTIONS UTILITAIRES
// ============================================================================

/**
 * Convertit une erreur en AppError
 */
export function normalizeError(error: unknown): AppError {
  // Si c'apos;est déjà une AppError
  if (error && typeof error === 'apos;object'apos; && 'apos;type'apos; in error) {
    return error as AppError;
  }

  // Erreurs Zod
  if (error instanceof ZodError) {
    return new ValidationError(
      'apos;Données invalides'apos;,
      error.errors,
      'apos;ZOD_VALIDATION_ERROR'apos;
    );
  }

  // Erreurs Prisma
  if (error && error.code) {
    switch (error.code) {
      case 'apos;P2002'apos;:
        return new ValidationError(
          'apos;Conflit de données unique'apos;,
          { field: error.meta?.target },
          'apos;PRISMA_UNIQUE_CONSTRAINT'apos;
        );
      case 'apos;P2025'apos;:
        return new NotFoundError(
          'apos;Enregistrement non trouvé'apos;,
          'apos;PRISMA_RECORD_NOT_FOUND'apos;
        );
      case 'apos;P2003'apos;:
        return new ValidationError(
          'apos;Violation de contrainte de clé étrangère'apos;,
          { field: error.meta?.field_name },
          'apos;PRISMA_FOREIGN_KEY_CONSTRAINT'apos;
        );
      default:
        return new DatabaseError(
          'apos;Erreur de base de données'apos;,
          { code: error.code, meta: error.meta },
          'apos;PRISMA_ERROR'apos;
        );
    }
  }

  // Erreurs de réseau
  if (error && (error.code === 'apos;ECONNREFUSED'apos; || error.code === 'apos;ENOTFOUND'apos;)) {
    return new NetworkError(
      'apos;Impossible de se connecter au service'apos;,
      { code: error.code },
      'apos;NETWORK_CONNECTION_ERROR'apos;
    );
  }

  // Erreurs de timeout
  if (error && error.code === 'apos;ETIMEDOUT'apos;) {
    return new TimeoutError(
      'apos;Délai de connexion dépassé'apos;,
      undefined,
      'apos;NETWORK_TIMEOUT'apos;
    );
  }

  // Erreurs Stripe
  if (error && error.type && error.type.startsWith('apos;Stripe'apos;)) {
    return new ExternalServiceError(
      'apos;Erreur de paiement'apos;,
      'apos;stripe'apos;,
      { type: error.type, code: error.code },
      'apos;STRIPE_ERROR'apos;
    );
  }

  // Erreurs OpenAI
  if (error && error.status && error.status === 429) {
    return new RateLimitError(
      'apos;Limite de taux OpenAI dépassée'apos;,
      undefined,
      'apos;OPENAI_RATE_LIMIT'apos;
    );
  }

  if (error && error.status && error.status >= 500) {
    return new ExternalServiceError(
      'apos;Erreur de service IA'apos;,
      'apos;openai'apos;,
      { status: error.status, message: error.message },
      'apos;OPENAI_SERVICE_ERROR'apos;
    );
  }

  // Erreurs par défaut
  if (error instanceof Error) {
    return new InternalError(
      error.message,
      { stack: error.stack },
      'apos;UNKNOWN_ERROR'apos;
    );
  }

  return new InternalError(
    'apos;Erreur inconnue'apos;,
    { originalError: error },
    'apos;UNKNOWN_ERROR'apos;
  );
}

/**
 * Crée une réponse d'apos;erreur standardisée
 */
export function createErrorResponse(error: AppError, request?: NextRequest): NextResponse {
  const isDevelopment = process.env.NODE_ENV === 'apos;development'apos;;
  
  // Log de l'apos;erreur
  logger.error(`API Error: ${error.message}`, error, {
    action: 'apos;api_error'apos;,
    metadata: {
      type: error.type,
      statusCode: error.statusCode,
      code: error.code,
      url: request?.url,
      method: request?.method,
      userAgent: request?.headers.get('apos;user-agent'apos;),
      ip: request?.ip || request?.headers.get('apos;x-forwarded-for'apos;),
    }
  });

  // Préparer la réponse
  const responseBody: unknown = {
    success: false,
    error: error.message,
    type: error.type,
    timestamp: new Date().toISOString(),
  };

  // Ajouter le code d'apos;erreur si disponible
  if (error.code) {
    responseBody.code = error.code;
  }

  // Ajouter les détails en développement
  if (isDevelopment && error.details) {
    responseBody.details = error.details;
  }

  // Ajouter les headers spécifiques
  const headers: Record<string, string> = {
    'apos;Content-Type'apos;: 'apos;application/json'apos;,
  };

  // Headers pour les erreurs de rate limiting
  if (error.type === ErrorType.RATE_LIMIT) {
    const retryAfter = (error as RateLimitError).retryAfter || 60;
    headers['apos;Retry-After'apos;] = retryAfter.toString();
    headers['apos;X-RateLimit-Reset'apos;] = new Date(Date.now() + retryAfter * 1000).toISOString();
  }

  // Headers pour les erreurs de timeout
  if (error.type === ErrorType.TIMEOUT) {
    headers['apos;X-Timeout-Duration'apos;] = ((error as TimeoutError).timeout || 30).toString();
  }

  return NextResponse.json(responseBody, {
    status: error.statusCode,
    headers
  });
}

/**
 * Wrapper pour gérer les erreurs dans les handlers API
 */
export function withErrorHandler<T extends any[], R>(
  handler: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    try {
      return await handler(...args);
    } catch (error) {
      const normalizedError = normalizeError(error);
      throw normalizedError;
    }
  };
}

/**
 * Middleware de gestion d'apos;erreurs pour Next.js
 */
export function errorHandlerMiddleware(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      return await handler(request);
    } catch (error) {
      const normalizedError = normalizeError(error);
      return createErrorResponse(normalizedError, request);
    }
  };
}

// ============================================================================
// GESTIONNAIRE D'apos;ERREURS GLOBAL
// ============================================================================

export class GlobalErrorHandler {
  private static instance: GlobalErrorHandler;
  private errorCounts: Map<string, number> = new Map();
  private lastErrorTime: Map<string, number> = new Map();

  private constructor() {}

  static getInstance(): GlobalErrorHandler {
    if (!GlobalErrorHandler.instance) {
      GlobalErrorHandler.instance = new GlobalErrorHandler();
    }
    return GlobalErrorHandler.instance;
  }

  /**
   * Traite une erreur et détermine si elle doit être alertée
   */
  handleError(error: AppError, context?: unknown): void {
    const errorKey = `${error.type}:${error.code || 'apos;unknown'apos;}`;
    const now = Date.now();
    
    // Incrémenter le compteur d'apos;erreurs
    this.errorCounts.set(errorKey, (this.errorCounts.get(errorKey) || 0) + 1);
    this.lastErrorTime.set(errorKey, now);

    // Log de l'apos;erreur
    logger.error(`Global Error: ${error.message}`, error, {
      action: 'apos;global_error'apos;,
      metadata: {
        type: error.type,
        code: error.code,
        context,
        errorCount: this.errorCounts.get(errorKey),
      }
    });

    // Vérifier si on doit alerter (plus de 10 erreurs en 5 minutes)
    const errorCount = this.errorCounts.get(errorKey) || 0;
    const lastError = this.lastErrorTime.get(errorKey) || 0;
    const timeWindow = 5 * 60 * 1000; // 5 minutes

    if (errorCount >= 10 && (now - lastError) < timeWindow) {
      this.alertHighErrorRate(errorKey, errorCount, error);
    }

    // Réinitialiser le compteur si trop de temps s'apos;est écoulé
    if ((now - lastError) > timeWindow) {
      this.errorCounts.set(errorKey, 1);
    }
  }

  /**
   * Alerte en cas de taux d'apos;erreur élevé
   */
  private alertHighErrorRate(errorKey: string, count: number, error: AppError): void {
    logger.warn(`High error rate detected: ${errorKey}`, {
      action: 'apos;high_error_rate_alert'apos;,
      metadata: {
        errorKey,
        count,
        errorType: error.type,
        errorCode: error.code,
        message: error.message,
      }
    });

    // Ici, vous pourriez envoyer une alerte Slack, email, etc.
    // this.sendAlert(errorKey, count, error);
  }

  /**
   * Obtient les statistiques d'apos;erreurs
   */
  getErrorStats(): Record<string, any> {
    const stats: Record<string, any> = {};
    
    for (const [errorKey, count] of this.errorCounts.entries()) {
      const lastError = this.lastErrorTime.get(errorKey);
      stats[errorKey] = {
        count,
        lastError: lastError ? new Date(lastError).toISOString() : null,
        timeSinceLastError: lastError ? Date.now() - lastError : null,
      };
    }

    return stats;
  }

  /**
   * Réinitialise les compteurs d'apos;erreurs
   */
  resetErrorCounts(): void {
    this.errorCounts.clear();
    this.lastErrorTime.clear();
  }
}

// Instance globale
export const globalErrorHandler = GlobalErrorHandler.getInstance();
