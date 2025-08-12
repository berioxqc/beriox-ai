import { NextRequest, NextResponse } from 'apos;next/server'apos;;
import { getServerSession } from 'apos;next-auth'apos;;
import { authOptions } from 'apos;@/lib/auth'apos;;
import { createCheckoutSession, STRIPE_PLANS } from 'apos;@/lib/stripe'apos;;
import { prisma } from 'apos;@/lib/prisma'apos;;
import { logger } from 'apos;@/lib/logger'apos;;
import { withRateLimit } from 'apos;@/lib/rate-limit-advanced'apos;;
import { withCSRFProtection } from 'apos;@/lib/csrf'apos;;

async function checkoutHandler(request: NextRequest) {
  try {
    // Vérifier l'apos;authentification
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      logger.warn('apos;Checkout: Unauthorized access attempt'apos;, {
        action: 'apos;checkout_unauthorized'apos;,
        ip: request.ip || request.headers.get('apos;x-forwarded-for'apos;) || 'apos;unknown'apos;
      });
      
      return NextResponse.json(
        { error: 'apos;Non autorisé'apos; },
        { status: 401 }
      );
    }

    // Récupérer les données de la requête
    const { priceId, successUrl, cancelUrl } = await request.json();

    if (!priceId || !successUrl || !cancelUrl) {
      logger.warn('apos;Checkout: Missing required parameters'apos;, {
        action: 'apos;checkout_missing_params'apos;,
        userId: session.user.email,
        hasPriceId: !!priceId,
        hasSuccessUrl: !!successUrl,
        hasCancelUrl: !!cancelUrl
      });
      
      return NextResponse.json(
        { error: 'apos;Paramètres manquants'apos; },
        { status: 400 }
      );
    }

    // Vérifier que le priceId est valide
    const validPriceIds = Object.values(STRIPE_PLANS).map(plan => plan.id);
    if (!validPriceIds.includes(priceId)) {
      logger.warn('apos;Checkout: Invalid price ID'apos;, {
        action: 'apos;checkout_invalid_price'apos;,
        userId: session.user.email,
        priceId
      });
      
      return NextResponse.json(
        { error: 'apos;Plan de facturation invalide'apos; },
        { status: 400 }
      );
    }

    // Récupérer l'apos;utilisateur depuis la base de données
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
      logger.error('apos;Checkout: User not found'apos;, {
        action: 'apos;checkout_user_not_found'apos;,
        email: session.user.email
      });
      
      return NextResponse.json(
        { error: 'apos;Utilisateur non trouvé'apos; },
        { status: 404 }
      );
    }

    // Vérifier si l'apos;utilisateur a déjà un abonnement actif
    if (user.subscriptionStatus === 'apos;active'apos;) {
      logger.info('apos;Checkout: User already has active subscription'apos;, {
        action: 'apos;checkout_already_subscribed'apos;,
        userId: user.id,
        subscriptionStatus: user.subscriptionStatus
      });
      
      return NextResponse.json(
        { 
          error: 'apos;Vous avez déjà un abonnement actif'apos;,
          redirectTo: 'apos;/profile'apos;
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
        plan: priceId.includes('apos;yearly'apos;) ? 'apos;competitor_intelligence_yearly'apos; : 'apos;competitor_intelligence'apos;
      }
    });

    // Logger l'apos;événement
    logger.businessEvent('apos;checkout_session_created'apos;, {
      userId: user.id,
      email: user.email,
      priceId,
      sessionId: checkoutSession.id,
      plan: priceId.includes('apos;yearly'apos;) ? 'apos;competitor_intelligence_yearly'apos; : 'apos;competitor_intelligence'apos;
    });

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url
    });

  } catch (error) {
    logger.error('apos;Checkout: Error creating session'apos;, error as Error, {
      action: 'apos;checkout_session_error'apos;,
      userId: session?.user?.email
    });

    return NextResponse.json(
      { error: 'apos;Erreur lors de la création de la session de paiement'apos; },
      { status: 500 }
    );
  }
}

// Appliquer le rate limiting et la protection CSRF
export const POST = withRateLimit(
  withCSRFProtection(checkoutHandler),
  'apos;api'apos;
);
