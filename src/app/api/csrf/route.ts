import { NextRequest, NextResponse } from 'next/server';
import { createCSRFResponse } from '@/lib/csrf';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    logger.info('CSRF: Token requested', {
      action: 'csrf_token_requested',
      ip: request.ip || request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    });

    // Créer et retourner un nouveau token CSRF
    return createCSRFResponse({
      message: 'CSRF token generated successfully'
    });

  } catch (error) {
    logger.error('CSRF: Error generating token', error as Error, {
      action: 'csrf_token_generation_error'
    });

    return NextResponse.json(
      { error: 'Erreur lors de la génération du token CSRF' },
      { status: 500 }
    );
  }
}
