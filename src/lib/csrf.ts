import { NextRequest, NextResponse } from 'next/server';
import { logger } from './logger';
import crypto from 'crypto';

// Configuration CSRF
const CSRF_CONFIG = {
  tokenLength: 32,
  cookieName: 'csrf-token',
  headerName: 'x-csrf-token',
  maxAge: 24 * 60 * 60 * 1000, // 24 heures
};

// Génération d'un token CSRF sécurisé
export function generateCSRFToken(): string {
  return crypto.randomBytes(CSRF_CONFIG.tokenLength).toString('hex');
}

// Validation d'un token CSRF
export function validateCSRFToken(token: string, storedToken: string): boolean {
  if (!token || !storedToken) {
    return false;
  }
  
  // Comparaison sécurisée des tokens
  return crypto.timingSafeEqual(
    Buffer.from(token, 'hex'),
    Buffer.from(storedToken, 'hex')
  );
}

// Middleware CSRF pour les routes API
export function withCSRFProtection(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async function(request: NextRequest) {
    // Vérifier si c'est une méthode qui nécessite une protection CSRF
    const method = request.method.toUpperCase();
    const requiresCSRF = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
    
    if (!requiresCSRF) {
      return handler(request);
    }
    
    try {
      // Récupérer le token depuis le header
      const csrfToken = request.headers.get(CSRF_CONFIG.headerName);
      
      // Récupérer le token stocké depuis les cookies
      const storedToken = request.cookies.get(CSRF_CONFIG.cookieName)?.value;
      
      if (!csrfToken || !storedToken) {
        logger.warn('CSRF: Missing token', {
          action: 'csrf_missing_token',
          method,
          url: request.url,
          hasHeaderToken: !!csrfToken,
          hasStoredToken: !!storedToken
        });
        
        return NextResponse.json(
          { error: 'Token CSRF manquant' },
          { status: 403 }
        );
      }
      
      // Valider le token
      if (!validateCSRFToken(csrfToken, storedToken)) {
        logger.warn('CSRF: Invalid token', {
          action: 'csrf_invalid_token',
          method,
          url: request.url
        });
        
        return NextResponse.json(
          { error: 'Token CSRF invalide' },
          { status: 403 }
        );
      }
      
      // Token valide, continuer avec le handler
      return handler(request);
      
    } catch (error) {
      logger.error('CSRF: Validation error', error as Error, {
        action: 'csrf_validation_error',
        method,
        url: request.url
      });
      
      return NextResponse.json(
        { error: 'Erreur de validation CSRF' },
        { status: 500 }
      );
    }
  };
}

// Fonction pour définir le cookie CSRF
export function setCSRFCookie(response: NextResponse): NextResponse {
  const token = generateCSRFToken();
  
  response.cookies.set(CSRF_CONFIG.cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: CSRF_CONFIG.maxAge,
    path: '/'
  });
  
  return response;
}

// Fonction pour récupérer le token CSRF depuis les cookies
export function getCSRFToken(request: NextRequest): string | null {
  return request.cookies.get(CSRF_CONFIG.cookieName)?.value || null;
}

// Fonction pour créer un token CSRF et le retourner dans la réponse
export function createCSRFResponse(data: any = {}): NextResponse {
  const token = generateCSRFToken();
  const response = NextResponse.json({
    ...data,
    csrfToken: token
  });
  
  // Définir le cookie
  response.cookies.set(CSRF_CONFIG.cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: CSRF_CONFIG.maxAge,
    path: '/'
  });
  
  return response;
}

// Hook React pour utiliser CSRF côté client
export function useCSRF() {
  const getCSRFToken = async (): Promise<string> => {
    try {
      const response = await fetch('/api/csrf', {
        method: 'GET',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to get CSRF token');
      }
      
      const data = await response.json();
      return data.csrfToken;
    } catch (error) {
      console.error('Error getting CSRF token:', error);
      throw error;
    }
  };
  
  const requestWithCSRF = async (
    url: string,
    options: RequestInit = {}
  ): Promise<Response> => {
    const token = await getCSRFToken();
    
    const headers = {
      ...options.headers,
      [CSRF_CONFIG.headerName]: token,
      'Content-Type': 'application/json'
    };
    
    return fetch(url, {
      ...options,
      headers,
      credentials: 'include'
    });
  };
  
  return {
    getCSRFToken,
    requestWithCSRF
  };
}

// Configuration pour les formulaires côté client
export const CSRF_CLIENT_CONFIG = {
  headerName: CSRF_CONFIG.headerName,
  cookieName: CSRF_CONFIG.cookieName
};
