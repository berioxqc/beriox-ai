import { NextRequest, NextResponse } from 'apos;next/server'apos;;
import { createCSRFResponse } from 'apos;@/lib/csrf'apos;;
import { logger } from 'apos;@/lib/logger'apos;;

export async function GET(request: NextRequest) {
  try {
    logger.info('apos;CSRF: Token requested'apos;, {
      action: 'apos;csrf_token_requested'apos;,
      ip: request.ip || request.headers.get('apos;x-forwarded-for'apos;) || 'apos;unknown'apos;,
      userAgent: request.headers.get('apos;user-agent'apos;) || 'apos;unknown'apos;
    });

    // Créer et retourner un nouveau token CSRF
    return createCSRFResponse({
      message: 'apos;CSRF token generated successfully'apos;
    });

  } catch (error) {
    logger.error('apos;CSRF: Error generating token'apos;, error as Error, {
      action: 'apos;csrf_token_generation_error'apos;
    });

    return NextResponse.json(
      { error: 'apos;Erreur lors de la génération du token CSRF'apos; },
      { status: 500 }
    );
  }
}
