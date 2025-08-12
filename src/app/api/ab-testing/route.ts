import { NextRequest, NextResponse } from 'apos;next/server'apos;;
import { getServerSession } from 'apos;next-auth'apos;;
import { authOptions } from 'apos;@/lib/auth'apos;;
import { abTesting, getVariant, recordImpression, recordConversion } from 'apos;@/lib/ab-testing'apos;;
import { logger } from 'apos;@/lib/logger'apos;;
import { withRateLimit } from 'apos;@/lib/rate-limit-advanced'apos;;

// GET - Obtenir une variante pour une expérience
async function getExperimentVariant(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const experimentId = searchParams.get('apos;experimentId'apos;);
  const sessionId = searchParams.get('apos;sessionId'apos;);

  if (!experimentId) {
    return NextResponse.json(
      { error: 'apos;experimentId is required'apos; },
      { status: 400 }
    );
  }

  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    const variant = getVariant(experimentId, userId, sessionId || undefined);

    if (!variant) {
      return NextResponse.json(
        { error: 'apos;Experiment not found or not active'apos; },
        { status: 404 }
      );
    }

    // Enregistrer l'apos;impression
    recordImpression(experimentId, variant.id, userId, sessionId || undefined, {
      userAgent: request.headers.get('apos;user-agent'apos;),
      referer: request.headers.get('apos;referer'apos;)
    });

    logger.info(`Variant requested: ${variant.name}`, {
      action: 'apos;variant_requested'apos;,
      metadata: {
        experimentId,
        variantId: variant.id,
        userId,
        sessionId
      }
    });

    return NextResponse.json({
      experimentId,
      variant,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('apos;Failed to get experiment variant'apos;, error as Error, {
      action: 'apos;variant_request_error'apos;,
      metadata: { experimentId, sessionId }
    });

    return NextResponse.json(
      { error: 'apos;Failed to get experiment variant'apos; },
      { status: 500 }
    );
  }
}

// POST - Enregistrer une conversion
async function recordExperimentConversion(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'apos;Unauthorized'apos; }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      experimentId,
      variantId,
      goalId,
      value,
      metadata
    } = body;

    if (!experimentId || !variantId || !goalId) {
      return NextResponse.json(
        { error: 'apos;experimentId, variantId, and goalId are required'apos; },
        { status: 400 }
      );
    }

    recordConversion(
      experimentId,
      variantId,
      goalId,
      session.user.id,
      undefined,
      value,
      metadata
    );

    logger.info(`Conversion recorded: ${goalId}`, {
      action: 'apos;conversion_recorded'apos;,
      metadata: {
        experimentId,
        variantId,
        goalId,
        userId: session.user.id,
        value
      }
    });

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('apos;Failed to record conversion'apos;, error as Error, {
      action: 'apos;conversion_record_error'apos;,
      metadata: { userId: session.user.id }
    });

    return NextResponse.json(
      { error: 'apos;Failed to record conversion'apos; },
      { status: 500 }
    );
  }
}

// GET - Obtenir les statistiques d'apos;une expérience
async function getExperimentStats(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'apos;Unauthorized'apos; }, { status: 401 });
  }

  // Vérifier si l'apos;utilisateur est admin
  if (session.user.email !== 'apos;info@beriox.ca'apos;) {
    return NextResponse.json({ error: 'apos;Forbidden'apos; }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const experimentId = searchParams.get('apos;experimentId'apos;);

  if (!experimentId) {
    return NextResponse.json(
      { error: 'apos;experimentId is required'apos; },
      { status: 400 }
    );
  }

  try {
    const stats = abTesting.getExperimentStats(experimentId);
    const significance = abTesting.calculateSignificance(experimentId, 'apos;default'apos;);

    logger.info(`Stats requested for experiment: ${experimentId}`, {
      action: 'apos;experiment_stats_requested'apos;,
      metadata: {
        experimentId,
        userId: session.user.id,
        statsCount: stats.length
      }
    });

    return NextResponse.json({
      experimentId,
      stats,
      significance,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('apos;Failed to get experiment stats'apos;, error as Error, {
      action: 'apos;experiment_stats_error'apos;,
      metadata: { experimentId, userId: session.user.id }
    });

    return NextResponse.json(
      { error: 'apos;Failed to get experiment stats'apos; },
      { status: 500 }
    );
  }
}

// GET - Obtenir toutes les expériences actives
async function getActiveExperiments(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'apos;Unauthorized'apos; }, { status: 401 });
  }

  // Vérifier si l'apos;utilisateur est admin
  if (session.user.email !== 'apos;info@beriox.ca'apos;) {
    return NextResponse.json({ error: 'apos;Forbidden'apos; }, { status: 403 });
  }

  try {
    const experiments = abTesting.getActiveExperiments();

    logger.info(`Active experiments requested`, {
      action: 'apos;active_experiments_requested'apos;,
      metadata: {
        userId: session.user.id,
        count: experiments.length
      }
    });

    return NextResponse.json({
      experiments,
      count: experiments.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('apos;Failed to get active experiments'apos;, error as Error, {
      action: 'apos;active_experiments_error'apos;,
      metadata: { userId: session.user.id }
    });

    return NextResponse.json(
      { error: 'apos;Failed to get active experiments'apos; },
      { status: 500 }
    );
  }
}

// POST - Créer une nouvelle expérience
async function createExperiment(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'apos;Unauthorized'apos; }, { status: 401 });
  }

  // Vérifier si l'apos;utilisateur est admin
  if (session.user.email !== 'apos;info@beriox.ca'apos;) {
    return NextResponse.json({ error: 'apos;Forbidden'apos; }, { status: 403 });
  }

  try {
    const body = await request.json();
    
    abTesting.createExperiment(body);

    logger.info(`Experiment created: ${body.name}`, {
      action: 'apos;experiment_created'apos;,
      metadata: {
        experimentId: body.id,
        userId: session.user.id,
        type: body.type
      }
    });

    return NextResponse.json({
      success: true,
      experimentId: body.id,
      timestamp: new Date().toISOString()
    }, { status: 201 });

  } catch (error) {
    logger.error('apos;Failed to create experiment'apos;, error as Error, {
      action: 'apos;experiment_create_error'apos;,
      metadata: { userId: session.user.id }
    });

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'apos;Failed to create experiment'apos; },
      { status: 500 }
    );
  }
}

// PUT - Désactiver une expérience
async function deactivateExperiment(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'apos;Unauthorized'apos; }, { status: 401 });
  }

  // Vérifier si l'apos;utilisateur est admin
  if (session.user.email !== 'apos;info@beriox.ca'apos;) {
    return NextResponse.json({ error: 'apos;Forbidden'apos; }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { experimentId } = body;

    if (!experimentId) {
      return NextResponse.json(
        { error: 'apos;experimentId is required'apos; },
        { status: 400 }
      );
    }

    abTesting.deactivateExperiment(experimentId);

    logger.info(`Experiment deactivated: ${experimentId}`, {
      action: 'apos;experiment_deactivated'apos;,
      metadata: {
        experimentId,
        userId: session.user.id
      }
    });

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('apos;Failed to deactivate experiment'apos;, error as Error, {
      action: 'apos;experiment_deactivate_error'apos;,
      metadata: { userId: session.user.id }
    });

    return NextResponse.json(
      { error: 'apos;Failed to deactivate experiment'apos; },
      { status: 500 }
    );
  }
}

// GET - Exporter les données d'apos;une expérience
async function exportExperimentData(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'apos;Unauthorized'apos; }, { status: 401 });
  }

  // Vérifier si l'apos;utilisateur est admin
  if (session.user.email !== 'apos;info@beriox.ca'apos;) {
    return NextResponse.json({ error: 'apos;Forbidden'apos; }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const experimentId = searchParams.get('apos;experimentId'apos;);

  if (!experimentId) {
    return NextResponse.json(
      { error: 'apos;experimentId is required'apos; },
      { status: 400 }
    );
  }

  try {
    const data = abTesting.exportExperimentData(experimentId);

    logger.info(`Experiment data exported: ${experimentId}`, {
      action: 'apos;experiment_data_exported'apos;,
      metadata: {
        experimentId,
        userId: session.user.id,
        resultsCount: data.results.length
      }
    });

    return NextResponse.json(data);

  } catch (error) {
    logger.error('apos;Failed to export experiment data'apos;, error as Error, {
      action: 'apos;experiment_export_error'apos;,
      metadata: { experimentId, userId: session.user.id }
    });

    return NextResponse.json(
      { error: 'apos;Failed to export experiment data'apos; },
      { status: 500 }
    );
  }
}

// Handlers avec rate limiting
export const GET = withRateLimit(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('apos;action'apos;);

  switch (action) {
    case 'apos;variant'apos;:
      return getExperimentVariant(request);
    case 'apos;stats'apos;:
      return getExperimentStats(request);
    case 'apos;active'apos;:
      return getActiveExperiments(request);
    case 'apos;export'apos;:
      return exportExperimentData(request);
    default:
      return NextResponse.json(
        { error: 'apos;Invalid action. Use: variant, stats, active, or export'apos; },
        { status: 400 }
      );
  }
}, 'apos;ab-testing'apos;);

export const POST = withRateLimit(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('apos;action'apos;);

  switch (action) {
    case 'apos;conversion'apos;:
      return recordExperimentConversion(request);
    case 'apos;create'apos;:
      return createExperiment(request);
    default:
      return NextResponse.json(
        { error: 'apos;Invalid action. Use: conversion or create'apos; },
        { status: 400 }
      );
  }
}, 'apos;ab-testing'apos;);

export const PUT = withRateLimit(deactivateExperiment, 'apos;ab-testing'apos;);
