import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { 
  onboardingManager, 
  startOnboarding, 
  getOnboardingProgress, 
  getCurrentOnboardingStep,
  nextOnboardingStep,
  skipOnboardingStep,
  validateOnboardingStep,
  getOnboardingStats
} from '@/lib/onboarding';
import { logger } from '@/lib/logger';
import { withRateLimit } from '@/lib/rate-limit-advanced';

// GET - Obtenir le progrès d'onboarding
async function getOnboardingProgressHandler(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const progress = getOnboardingProgress(session.user.id);
    const currentStep = getCurrentOnboardingStep(session.user.id);

    logger.info('Onboarding progress requested', {
      action: 'onboarding_progress_requested',
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
    logger.error('Failed to get onboarding progress', error as Error, {
      action: 'onboarding_progress_error',
      metadata: { userId: session.user.id }
    });

    return NextResponse.json(
      { error: 'Failed to get onboarding progress' },
      { status: 500 }
    );
  }
}

// POST - Démarrer l'onboarding
async function startOnboardingHandler(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const progress = startOnboarding(session.user.id);
    const currentStep = getCurrentOnboardingStep(session.user.id);

    logger.info('Onboarding started', {
      action: 'onboarding_started',
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
    logger.error('Failed to start onboarding', error as Error, {
      action: 'onboarding_start_error',
      metadata: { userId: session.user.id }
    });

    return NextResponse.json(
      { error: 'Failed to start onboarding' },
      { status: 500 }
    );
  }
}

// PUT - Passer à l'étape suivante
async function nextStepHandler(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { stepData } = body;

    const nextStep = await nextOnboardingStep(session.user.id, stepData);
    const progress = getOnboardingProgress(session.user.id);

    logger.info('Onboarding step completed', {
      action: 'onboarding_step_completed',
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
    logger.error('Failed to complete onboarding step', error as Error, {
      action: 'onboarding_step_error',
      metadata: { userId: session.user.id }
    });

    return NextResponse.json(
      { error: 'Failed to complete onboarding step' },
      { status: 500 }
    );
  }
}

// PUT - Passer une étape
async function skipStepHandler(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const nextStep = skipOnboardingStep(session.user.id);
    const progress = getOnboardingProgress(session.user.id);

    logger.info('Onboarding step skipped', {
      action: 'onboarding_step_skipped',
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
    logger.error('Failed to skip onboarding step', error as Error, {
      action: 'onboarding_skip_error',
      metadata: { userId: session.user.id }
    });

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to skip onboarding step' },
      { status: 500 }
    );
  }
}

// POST - Valider une étape
async function validateStepHandler(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { stepData } = body;

    const isValid = await validateOnboardingStep(session.user.id, stepData);

    logger.info('Onboarding step validated', {
      action: 'onboarding_step_validated',
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
    logger.error('Failed to validate onboarding step', error as Error, {
      action: 'onboarding_validation_error',
      metadata: { userId: session.user.id }
    });

    return NextResponse.json(
      { error: 'Failed to validate onboarding step' },
      { status: 500 }
    );
  }
}

// GET - Obtenir les statistiques d'onboarding (admin uniquement)
async function getOnboardingStatsHandler(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Vérifier si l'utilisateur est admin
  if (session.user.email !== 'info@beriox.ca') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const stats = getOnboardingStats();

    logger.info('Onboarding stats requested', {
      action: 'onboarding_stats_requested',
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
    logger.error('Failed to get onboarding stats', error as Error, {
      action: 'onboarding_stats_error',
      metadata: { userId: session.user.id }
    });

    return NextResponse.json(
      { error: 'Failed to get onboarding stats' },
      { status: 500 }
    );
  }
}

// GET - Obtenir toutes les étapes d'onboarding
async function getAllStepsHandler(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const steps = onboardingManager.getAllSteps();

    logger.info('Onboarding steps requested', {
      action: 'onboarding_steps_requested',
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
    logger.error('Failed to get onboarding steps', error as Error, {
      action: 'onboarding_steps_error',
      metadata: { userId: session.user.id }
    });

    return NextResponse.json(
      { error: 'Failed to get onboarding steps' },
      { status: 500 }
    );
  }
}

// DELETE - Réinitialiser l'onboarding
async function resetOnboardingHandler(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    onboardingManager.resetOnboarding(session.user.id);

    logger.info('Onboarding reset', {
      action: 'onboarding_reset',
      metadata: { userId: session.user.id }
    });

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Failed to reset onboarding', error as Error, {
      action: 'onboarding_reset_error',
      metadata: { userId: session.user.id }
    });

    return NextResponse.json(
      { error: 'Failed to reset onboarding' },
      { status: 500 }
    );
  }
}

// Handlers avec rate limiting
export const GET = withRateLimit(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  switch (action) {
    case 'progress':
      return getOnboardingProgressHandler(request);
    case 'stats':
      return getOnboardingStatsHandler(request);
    case 'steps':
      return getAllStepsHandler(request);
    default:
      return NextResponse.json(
        { error: 'Invalid action. Use: progress, stats, or steps' },
        { status: 400 }
      );
  }
}, 'onboarding');

export const POST = withRateLimit(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  switch (action) {
    case 'start':
      return startOnboardingHandler(request);
    case 'validate':
      return validateStepHandler(request);
    default:
      return NextResponse.json(
        { error: 'Invalid action. Use: start or validate' },
        { status: 400 }
      );
  }
}, 'onboarding');

export const PUT = withRateLimit(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  switch (action) {
    case 'next':
      return nextStepHandler(request);
    case 'skip':
      return skipStepHandler(request);
    default:
      return NextResponse.json(
        { error: 'Invalid action. Use: next or skip' },
        { status: 400 }
      );
  }
}, 'onboarding');

export const DELETE = withRateLimit(resetOnboardingHandler, 'onboarding');
