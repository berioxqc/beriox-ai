import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createCheckoutSession, STRIPE_PLANS } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { withRateLimit } from '@/lib/rate-limit-advanced';
import { withCSRFProtection } from '@/lib/csrf';

async function checkoutHandler(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      logger.warn('Checkout: Unauthorized access attempt', {
        action: 'checkout_unauthorized',
        ip: request.ip || request.headers.get('x-forwarded-for') || 'unknown'
      });
      
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Récupérer les données de la requête
    const { priceId, successUrl, cancelUrl } = await request.json();

    if (!priceId || !successUrl || !cancelUrl) {
      logger.warn('Checkout: Missing required parameters', {
        action: 'checkout_missing_params',
        userId: session.user.email,
        hasPriceId: !!priceId,
        hasSuccessUrl: !!successUrl,
        hasCancelUrl: !!cancelUrl
      });
      
      return NextResponse.json(
        { error: 'Paramètres manquants' },
        { status: 400 }
      );
    }

    // Vérifier que le priceId est valide
    const validPriceIds = Object.values(STRIPE_PLANS).map(plan => plan.id);
    if (!validPriceIds.includes(priceId)) {
      logger.warn('Checkout: Invalid price ID', {
        action: 'checkout_invalid_price',
        userId: session.user.email,
        priceId
      });
      
      return NextResponse.json(
        { error: 'Plan de facturation invalide' },
        { status: 400 }
      );
    }

    // Récupérer l'utilisateur depuis la base de données
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        name: true,
        stripeCustomerId: true,
        subscriptionStatus: true
      }
    });

    if (!user) {
      logger.error('Checkout: User not found', {
        action: 'checkout_user_not_found',
        email: session.user.email
      });
      
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier si l'utilisateur a déjà un abonnement actif
    if (user.subscriptionStatus === 'active') {
      logger.info('Checkout: User already has active subscription', {
        action: 'checkout_already_subscribed',
        userId: user.id,
        subscriptionStatus: user.subscriptionStatus
      });
      
      return NextResponse.json(
        { 
          error: 'Vous avez déjà un abonnement actif',
          redirectTo: '/profile'
        },
        { status: 400 }
      );
    }

    // Créer la session de checkout
    const checkoutSession = await createCheckoutSession({
      customerId: user.stripeCustomerId,
      priceId,
      successUrl,
      cancelUrl,
      metadata: {
        userId: user.id,
        email: user.email,
        plan: priceId.includes('yearly') ? 'competitor_intelligence_yearly' : 'competitor_intelligence'
      }
    });

    // Logger l'événement
    logger.businessEvent('checkout_session_created', {
      userId: user.id,
      email: user.email,
      priceId,
      sessionId: checkoutSession.id,
      plan: priceId.includes('yearly') ? 'competitor_intelligence_yearly' : 'competitor_intelligence'
    });

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url
    });

  } catch (error) {
    logger.error('Checkout: Error creating session', error as Error, {
      action: 'checkout_session_error',
      userId: session?.user?.email
    });

    return NextResponse.json(
      { error: 'Erreur lors de la création de la session de paiement' },
      { status: 500 }
    );
  }
}

// Appliquer le rate limiting et la protection CSRF
export const POST = withRateLimit(
  withCSRFProtection(checkoutHandler),
  'api'
);
