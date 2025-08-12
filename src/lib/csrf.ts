import { NextRequest, NextResponse } from 'apos;next/server'apos;;
import { logger } from 'apos;./logger'apos;;
import crypto from 'apos;crypto'apos;;

// Configuration CSRF
const CSRF_CONFIG = {
  tokenLength: 32,
  cookieName: 'apos;csrf-token'apos;,
  headerName: 'apos;x-csrf-token'apos;,
  maxAge: 24 * 60 * 60 * 1000, // 24 heures
};

// Génération d'apos;un token CSRF sécurisé
export function generateCSRFToken(): string {
  return crypto.randomBytes(CSRF_CONFIG.tokenLength).toString('apos;hex'apos;);
}

// Validation d'apos;un token CSRF
export function validateCSRFToken(token: string, storedToken: string): boolean {
  if (!token || !storedToken) {
    return false;
  }
  
  // Comparaison sécurisée des tokens
  return crypto.timingSafeEqual(
    Buffer.from(token, 'apos;hex'apos;),
    Buffer.from(storedToken, 'apos;hex'apos;)
  );
}

// Middleware CSRF pour les routes API
export function withCSRFProtection(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async function(request: NextRequest) {
    // Vérifier si c'apos;est une méthode qui nécessite une protection CSRF
    const method = request.method.toUpperCase();
    const requiresCSRF = ['apos;POST'apos;, 'apos;PUT'apos;, 'apos;PATCH'apos;, 'apos;DELETE'apos;].includes(method);
    
    if (!requiresCSRF) {
      return handler(request);
    }
    
    try {
      // Récupérer le token depuis le header
      const csrfToken = request.headers.get(CSRF_CONFIG.headerName);
      
      // Récupérer le token stocké depuis les cookies
      const storedToken = request.cookies.get(CSRF_CONFIG.cookieName)?.value;
      
      if (!csrfToken || !storedToken) {
        logger.warn('apos;CSRF: Missing token'apos;, {
          action: 'apos;csrf_missing_token'apos;,
          method,
          url: request.url,
          hasHeaderToken: !!csrfToken,
          hasStoredToken: !!storedToken
        });
        
        return NextResponse.json(
          { error: 'apos;Token CSRF manquant'apos; },
          { status: 403 }
        );
      }
      
      // Valider le token
      if (!validateCSRFToken(csrfToken, storedToken)) {
        logger.warn('apos;CSRF: Invalid token'apos;, {
          action: 'apos;csrf_invalid_token'apos;,
          method,
          url: request.url
        });
        
        return NextResponse.json(
          { error: 'apos;Token CSRF invalide'apos; },
          { status: 403 }
        );
      }
      
      // Token valide, continuer avec le handler
      return handler(request);
      
    } catch (error) {
      logger.error('apos;CSRF: Validation error'apos;, error as Error, {
        action: 'apos;csrf_validation_error'apos;,
        method,
        url: request.url
      });
      
      return NextResponse.json(
        { error: 'apos;Erreur de validation CSRF'apos; },
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
    secure: process.env.NODE_ENV === 'apos;production'apos;,
    sameSite: 'apos;strict'apos;,
    maxAge: CSRF_CONFIG.maxAge,
    path: 'apos;/'apos;
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
    secure: process.env.NODE_ENV === 'apos;production'apos;,
    sameSite: 'apos;strict'apos;,
    maxAge: CSRF_CONFIG.maxAge,
    path: 'apos;/'apos;
  });
  
  return response;
}

// Hook React pour utiliser CSRF côté client
export function useCSRF() {
  const getCSRFToken = async (): Promise<string> => {
    try {
      const response = await fetch('apos;/api/csrf'apos;, {
        method: 'apos;GET'apos;,
        credentials: 'apos;include'apos;
      });
      
      if (!response.ok) {
        throw new Error('apos;Failed to get CSRF token'apos;);
      }
      
      const data = await response.json();
      return data.csrfToken;
    } catch (error) {
      console.error('apos;Error getting CSRF token:'apos;, error);
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
      'apos;Content-Type'apos;: 'apos;application/json'apos;
    };
    
    return fetch(url, {
      ...options,
      headers,
      credentials: 'apos;include'apos;
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
