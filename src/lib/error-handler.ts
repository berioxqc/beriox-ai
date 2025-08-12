import { NextRequest, NextResponse } from 'next/server';
import { logger } from './logger';
import { ZodError } from 'zod';

// ============================================================================
// TYPES D'ERREURS
// ============================================================================

export enum ErrorType {
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  RATE_LIMIT = 'RATE_LIMIT',
  DATABASE = 'DATABASE',
  EXTERNAL_SERVICE = 'EXTERNAL_SERVICE',
  INTERNAL = 'INTERNAL',
  NETWORK = 'NETWORK',
  TIMEOUT = 'TIMEOUT',
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
// CLASSES D'ERREURS SPÉCIALISÉES
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
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends Error implements AppError {
  public readonly type = ErrorType.AUTHENTICATION;
  public readonly statusCode = 401;
  public readonly isOperational = true;
  public readonly retryable = false;

  constructor(
    message: string = 'Authentification requise',
    public readonly code?: string
  ) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error implements AppError {
  public readonly type = ErrorType.AUTHORIZATION;
  public readonly statusCode = 403;
  public readonly isOperational = true;
  public readonly retryable = false;

  constructor(
    message: string = 'Accès non autorisé',
    public readonly code?: string
  ) {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends Error implements AppError {
  public readonly type = ErrorType.NOT_FOUND;
  public readonly statusCode = 404;
  public readonly isOperational = true;
  public readonly retryable = false;

  constructor(
    message: string = 'Ressource non trouvée',
    public readonly code?: string
  ) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class RateLimitError extends Error implements AppError {
  public readonly type = ErrorType.RATE_LIMIT;
  public readonly statusCode = 429;
  public readonly isOperational = true;
  public readonly retryable = true;

  constructor(
    message: string = 'Limite de taux dépassée',
    public readonly retryAfter?: number,
    public readonly code?: string
  ) {
    super(message);
    this.name = 'RateLimitError';
  }
}

export class DatabaseError extends Error implements AppError {
  public readonly type = ErrorType.DATABASE;
  public readonly statusCode = 500;
  public readonly isOperational = true;
  public readonly retryable = true;

  constructor(
    message: string = 'Erreur de base de données',
    public readonly details?: unknown,
    public readonly code?: string
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export class ExternalServiceError extends Error implements AppError {
  public readonly type = ErrorType.EXTERNAL_SERVICE;
  public readonly statusCode = 502;
  public readonly isOperational = true;
  public readonly retryable = true;

  constructor(
    message: string = 'Erreur de service externe',
    public readonly service?: string,
    public readonly details?: unknown,
    public readonly code?: string
  ) {
    super(message);
    this.name = 'ExternalServiceError';
  }
}

export class InternalError extends Error implements AppError {
  public readonly type = ErrorType.INTERNAL;
  public readonly statusCode = 500;
  public readonly isOperational = false;
  public readonly retryable = false;

  constructor(
    message: string = 'Erreur interne du serveur',
    public readonly details?: unknown,
    public readonly code?: string
  ) {
    super(message);
    this.name = 'InternalError';
  }
}

export class NetworkError extends Error implements AppError {
  public readonly type = ErrorType.NETWORK;
  public readonly statusCode = 503;
  public readonly isOperational = true;
  public readonly retryable = true;

  constructor(
    message: string = 'Erreur de réseau',
    public readonly details?: unknown,
    public readonly code?: string
  ) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class TimeoutError extends Error implements AppError {
  public readonly type = ErrorType.TIMEOUT;
  public readonly statusCode = 408;
  public readonly isOperational = true;
  public readonly retryable = true;

  constructor(
    message: string = 'Délai d\'attente dépassé',
    public readonly timeout?: number,
    public readonly code?: string
  ) {
    super(message);
    this.name = 'TimeoutError';
  }
}

// ============================================================================
// FONCTIONS UTILITAIRES
// ============================================================================

/**
 * Convertit une erreur en AppError
 */
export function normalizeError(error: unknown): AppError {
  // Si c'est déjà une AppError
  if (error && typeof error === 'object' && 'type' in error) {
    return error as AppError;
  }

  // Erreurs Zod
  if (error instanceof ZodError) {
    return new ValidationError(
      'Données invalides',
      error.errors,
      'ZOD_VALIDATION_ERROR'
    );
  }

  // Erreurs Prisma
  if (error && error.code) {
    switch (error.code) {
      case 'P2002':
        return new ValidationError(
          'Conflit de données unique',
          { field: error.meta?.target },
          'PRISMA_UNIQUE_CONSTRAINT'
        );
      case 'P2025':
        return new NotFoundError(
          'Enregistrement non trouvé',
          'PRISMA_RECORD_NOT_FOUND'
        );
      case 'P2003':
        return new ValidationError(
          'Violation de contrainte de clé étrangère',
          { field: error.meta?.field_name },
          'PRISMA_FOREIGN_KEY_CONSTRAINT'
        );
      default:
        return new DatabaseError(
          'Erreur de base de données',
          { code: error.code, meta: error.meta },
          'PRISMA_ERROR'
        );
    }
  }

  // Erreurs de réseau
  if (error && (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND')) {
    return new NetworkError(
      'Impossible de se connecter au service',
      { code: error.code },
      'NETWORK_CONNECTION_ERROR'
    );
  }

  // Erreurs de timeout
  if (error && error.code === 'ETIMEDOUT') {
    return new TimeoutError(
      'Délai de connexion dépassé',
      undefined,
      'NETWORK_TIMEOUT'
    );
  }

  // Erreurs Stripe
  if (error && error.type && error.type.startsWith('Stripe')) {
    return new ExternalServiceError(
      'Erreur de paiement',
      'stripe',
      { type: error.type, code: error.code },
      'STRIPE_ERROR'
    );
  }

  // Erreurs OpenAI
  if (error && error.status && error.status === 429) {
    return new RateLimitError(
      'Limite de taux OpenAI dépassée',
      undefined,
      'OPENAI_RATE_LIMIT'
    );
  }

  if (error && error.status && error.status >= 500) {
    return new ExternalServiceError(
      'Erreur de service IA',
      'openai',
      { status: error.status, message: error.message },
      'OPENAI_SERVICE_ERROR'
    );
  }

  // Erreurs par défaut
  if (error instanceof Error) {
    return new InternalError(
      error.message,
      { stack: error.stack },
      'UNKNOWN_ERROR'
    );
  }

  return new InternalError(
    'Erreur inconnue',
    { originalError: error },
    'UNKNOWN_ERROR'
  );
}

/**
 * Crée une réponse d'erreur standardisée
 */
export function createErrorResponse(error: AppError, request?: NextRequest): NextResponse {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Log de l'erreur
  logger.error(`API Error: ${error.message}`, error, {
    action: 'api_error',
    metadata: {
      type: error.type,
      statusCode: error.statusCode,
      code: error.code,
      url: request?.url,
      method: request?.method,
      userAgent: request?.headers.get('user-agent'),
      ip: request?.ip || request?.headers.get('x-forwarded-for'),
    }
  });

  // Préparer la réponse
  const responseBody: unknown = {
    success: false,
    error: error.message,
    type: error.type,
    timestamp: new Date().toISOString(),
  };

  // Ajouter le code d'erreur si disponible
  if (error.code) {
    responseBody.code = error.code;
  }

  // Ajouter les détails en développement
  if (isDevelopment && error.details) {
    responseBody.details = error.details;
  }

  // Ajouter les headers spécifiques
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Headers pour les erreurs de rate limiting
  if (error.type === ErrorType.RATE_LIMIT) {
    const retryAfter = (error as RateLimitError).retryAfter || 60;
    headers['Retry-After'] = retryAfter.toString();
    headers['X-RateLimit-Reset'] = new Date(Date.now() + retryAfter * 1000).toISOString();
  }

  // Headers pour les erreurs de timeout
  if (error.type === ErrorType.TIMEOUT) {
    headers['X-Timeout-Duration'] = ((error as TimeoutError).timeout || 30).toString();
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
 * Middleware de gestion d'erreurs pour Next.js
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
// GESTIONNAIRE D'ERREURS GLOBAL
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
    const errorKey = `${error.type}:${error.code || 'unknown'}`;
    const now = Date.now();
    
    // Incrémenter le compteur d'erreurs
    this.errorCounts.set(errorKey, (this.errorCounts.get(errorKey) || 0) + 1);
    this.lastErrorTime.set(errorKey, now);

    // Log de l'erreur
    logger.error(`Global Error: ${error.message}`, error, {
      action: 'global_error',
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

    // Réinitialiser le compteur si trop de temps s'est écoulé
    if ((now - lastError) > timeWindow) {
      this.errorCounts.set(errorKey, 1);
    }
  }

  /**
   * Alerte en cas de taux d'erreur élevé
   */
  private alertHighErrorRate(errorKey: string, count: number, error: AppError): void {
    logger.warn(`High error rate detected: ${errorKey}`, {
      action: 'high_error_rate_alert',
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
   * Obtient les statistiques d'erreurs
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
   * Réinitialise les compteurs d'erreurs
   */
  resetErrorCounts(): void {
    this.errorCounts.clear();
    this.lastErrorTime.clear();
  }
}

// Instance globale
export const globalErrorHandler = GlobalErrorHandler.getInstance();
