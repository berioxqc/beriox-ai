import { NextRequest, NextResponse } from 'apos;next/server'apos;;
import { getServerSession } from 'apos;next-auth'apos;;
import { authOptions } from 'apos;@/lib/auth'apos;;
import { 
  onboardingManager, 
  startOnboarding, 
  getOnboardingProgress, 
  getCurrentOnboardingStep,
  nextOnboardingStep,
  skipOnboardingStep,
  validateOnboardingStep,
  getOnboardingStats
} from 'apos;@/lib/onboarding'apos;;
import { logger } from 'apos;@/lib/logger'apos;;
import { withRateLimit } from 'apos;@/lib/rate-limit-advanced'apos;;

// GET - Obtenir le progrès d'apos;onboarding
async function getOnboardingProgressHandler(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'apos;Unauthorized'apos; }, { status: 401 });
  }

  try {
    const progress = getOnboardingProgress(session.user.id);
    const currentStep = getCurrentOnboardingStep(session.user.id);

    logger.info('apos;Onboarding progress requested'apos;, {
      action: 'apos;onboarding_progress_requested'apos;,
      metadata: {
        userId: session.user.id,
        hasProgress: !!progress,
        currentStep: currentStep?.id
      }
    });

    return NextResponse.json({
      progress,
      currentStep,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('apos;Failed to get onboarding progress'apos;, error as Error, {
      action: 'apos;onboarding_progress_error'apos;,
      metadata: { userId: session.user.id }
    });

    return NextResponse.json(
      { error: 'apos;Failed to get onboarding progress'apos; },
      { status: 500 }
    );
  }
}

// POST - Démarrer l'apos;onboarding
async function startOnboardingHandler(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'apos;Unauthorized'apos; }, { status: 401 });
  }

  try {
    const progress = startOnboarding(session.user.id);
    const currentStep = getCurrentOnboardingStep(session.user.id);

    logger.info('apos;Onboarding started'apos;, {
      action: 'apos;onboarding_started'apos;,
      metadata: {
        userId: session.user.id,
        firstStep: currentStep?.id
      }
    });

    return NextResponse.json({
      progress,
      currentStep,
      timestamp: new Date().toISOString()
    }, { status: 201 });

  } catch (error) {
    logger.error('apos;Failed to start onboarding'apos;, error as Error, {
      action: 'apos;onboarding_start_error'apos;,
      metadata: { userId: session.user.id }
    });

    return NextResponse.json(
      { error: 'apos;Failed to start onboarding'apos; },
      { status: 500 }
    );
  }
}

// PUT - Passer à l'apos;étape suivante
async function nextStepHandler(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'apos;Unauthorized'apos; }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { stepData } = body;

    const nextStep = await nextOnboardingStep(session.user.id, stepData);
    const progress = getOnboardingProgress(session.user.id);

    logger.info('apos;Onboarding step completed'apos;, {
      action: 'apos;onboarding_step_completed'apos;,
      metadata: {
        userId: session.user.id,
        nextStep: nextStep?.id,
        completionRate: progress?.completionRate
      }
    });

    return NextResponse.json({
      nextStep,
      progress,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('apos;Failed to complete onboarding step'apos;, error as Error, {
      action: 'apos;onboarding_step_error'apos;,
      metadata: { userId: session.user.id }
    });

    return NextResponse.json(
      { error: 'apos;Failed to complete onboarding step'apos; },
      { status: 500 }
    );
  }
}

// PUT - Passer une étape
async function skipStepHandler(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'apos;Unauthorized'apos; }, { status: 401 });
  }

  try {
    const nextStep = skipOnboardingStep(session.user.id);
    const progress = getOnboardingProgress(session.user.id);

    logger.info('apos;Onboarding step skipped'apos;, {
      action: 'apos;onboarding_step_skipped'apos;,
      metadata: {
        userId: session.user.id,
        nextStep: nextStep?.id
      }
    });

    return NextResponse.json({
      nextStep,
      progress,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('apos;Failed to skip onboarding step'apos;, error as Error, {
      action: 'apos;onboarding_skip_error'apos;,
      metadata: { userId: session.user.id }
    });

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'apos;Failed to skip onboarding step'apos; },
      { status: 500 }
    );
  }
}

// POST - Valider une étape
async function validateStepHandler(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'apos;Unauthorized'apos; }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { stepData } = body;

    const isValid = await validateOnboardingStep(session.user.id, stepData);

    logger.info('apos;Onboarding step validated'apos;, {
      action: 'apos;onboarding_step_validated'apos;,
      metadata: {
        userId: session.user.id,
        isValid
      }
    });

    return NextResponse.json({
      isValid,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('apos;Failed to validate onboarding step'apos;, error as Error, {
      action: 'apos;onboarding_validation_error'apos;,
      metadata: { userId: session.user.id }
    });

    return NextResponse.json(
      { error: 'apos;Failed to validate onboarding step'apos; },
      { status: 500 }
    );
  }
}

// GET - Obtenir les statistiques d'apos;onboarding (admin uniquement)
async function getOnboardingStatsHandler(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'apos;Unauthorized'apos; }, { status: 401 });
  }

  // Vérifier si l'apos;utilisateur est admin
  if (session.user.email !== 'apos;info@beriox.ca'apos;) {
    return NextResponse.json({ error: 'apos;Forbidden'apos; }, { status: 403 });
  }

  try {
    const stats = getOnboardingStats();

    logger.info('apos;Onboarding stats requested'apos;, {
      action: 'apos;onboarding_stats_requested'apos;,
      metadata: {
        userId: session.user.id,
        totalUsers: stats.totalUsers
      }
    });

    return NextResponse.json({
      stats,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('apos;Failed to get onboarding stats'apos;, error as Error, {
      action: 'apos;onboarding_stats_error'apos;,
      metadata: { userId: session.user.id }
    });

    return NextResponse.json(
      { error: 'apos;Failed to get onboarding stats'apos; },
      { status: 500 }
    );
  }
}

// GET - Obtenir toutes les étapes d'apos;onboarding
async function getAllStepsHandler(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'apos;Unauthorized'apos; }, { status: 401 });
  }

  try {
    const steps = onboardingManager.getAllSteps();

    logger.info('apos;Onboarding steps requested'apos;, {
      action: 'apos;onboarding_steps_requested'apos;,
      metadata: {
        userId: session.user.id,
        stepsCount: steps.length
      }
    });

    return NextResponse.json({
      steps,
      count: steps.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('apos;Failed to get onboarding steps'apos;, error as Error, {
      action: 'apos;onboarding_steps_error'apos;,
      metadata: { userId: session.user.id }
    });

    return NextResponse.json(
      { error: 'apos;Failed to get onboarding steps'apos; },
      { status: 500 }
    );
  }
}

// DELETE - Réinitialiser l'apos;onboarding
async function resetOnboardingHandler(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'apos;Unauthorized'apos; }, { status: 401 });
  }

  try {
    onboardingManager.resetOnboarding(session.user.id);

    logger.info('apos;Onboarding reset'apos;, {
      action: 'apos;onboarding_reset'apos;,
      metadata: { userId: session.user.id }
    });

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('apos;Failed to reset onboarding'apos;, error as Error, {
      action: 'apos;onboarding_reset_error'apos;,
      metadata: { userId: session.user.id }
    });

    return NextResponse.json(
      { error: 'apos;Failed to reset onboarding'apos; },
      { status: 500 }
    );
  }
}

// Handlers avec rate limiting
export const GET = withRateLimit(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('apos;action'apos;);

  switch (action) {
    case 'apos;progress'apos;:
      return getOnboardingProgressHandler(request);
    case 'apos;stats'apos;:
      return getOnboardingStatsHandler(request);
    case 'apos;steps'apos;:
      return getAllStepsHandler(request);
    default:
      return NextResponse.json(
        { error: 'apos;Invalid action. Use: progress, stats, or steps'apos; },
        { status: 400 }
      );
  }
}, 'apos;onboarding'apos;);

export const POST = withRateLimit(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('apos;action'apos;);

  switch (action) {
    case 'apos;start'apos;:
      return startOnboardingHandler(request);
    case 'apos;validate'apos;:
      return validateStepHandler(request);
    default:
      return NextResponse.json(
        { error: 'apos;Invalid action. Use: start or validate'apos; },
        { status: 400 }
      );
  }
}, 'apos;onboarding'apos;);

export const PUT = withRateLimit(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('apos;action'apos;);

  switch (action) {
    case 'apos;next'apos;:
      return nextStepHandler(request);
    case 'apos;skip'apos;:
      return skipStepHandler(request);
    default:
      return NextResponse.json(
        { error: 'apos;Invalid action. Use: next or skip'apos; },
        { status: 400 }
      );
  }
}, 'apos;onboarding'apos;);

export const DELETE = withRateLimit(resetOnboardingHandler, 'apos;onboarding'apos;);
