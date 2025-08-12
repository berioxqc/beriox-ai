import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { abTesting, getVariant, recordImpression, recordConversion } from '@/lib/ab-testing'
import { logger } from '@/lib/logger'
import { withRateLimit } from '@/lib/rate-limit-advanced'
// GET - Obtenir une variante pour une expérience
async function getExperimentVariant(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const experimentId = searchParams.get('experimentId')
  const sessionId = searchParams.get('sessionId')
  if (!experimentId) {
    return NextResponse.json(
      { error: 'experimentId is required' },
      { status: 400 }
    )
  }

  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id
    const variant = getVariant(experimentId, userId, sessionId || undefined)
    if (!variant) {
      return NextResponse.json(
        { error: 'Experiment not found or not active' },
        { status: 404 }
      )
    }

    // Enregistrer l'impression
    recordImpression(experimentId, variant.id, userId, sessionId || undefined, {
      userAgent: request.headers.get('user-agent'),
      referer: request.headers.get('referer')
    })
    logger.info(`Variant requested: ${variant.name}`, {
      action: 'variant_requested',
      metadata: {
        experimentId,
        variantId: variant.id,
        userId,
        sessionId
      }
    })
    return NextResponse.json({
      experimentId,
      variant,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    logger.error('Failed to get experiment variant', error as Error, {
      action: 'variant_request_error',
      metadata: { experimentId, sessionId }
    })
    return NextResponse.json(
      { error: 'Failed to get experiment variant' },
      { status: 500 }
    )
  }
}

// POST - Enregistrer une conversion
async function recordExperimentConversion(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const {
      experimentId,
      variantId,
      goalId,
      value,
      metadata
    } = body
    if (!experimentId || !variantId || !goalId) {
      return NextResponse.json(
        { error: 'experimentId, variantId, and goalId are required' },
        { status: 400 }
      )
    }

    recordConversion(
      experimentId,
      variantId,
      goalId,
      session.user.id,
      undefined,
      value,
      metadata
    )
    logger.info(`Conversion recorded: ${goalId}`, {
      action: 'conversion_recorded',
      metadata: {
        experimentId,
        variantId,
        goalId,
        userId: session.user.id,
        value
      }
    })
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    logger.error('Failed to record conversion', error as Error, {
      action: 'conversion_record_error',
      metadata: { userId: session.user.id }
    })
    return NextResponse.json(
      { error: 'Failed to record conversion' },
      { status: 500 }
    )
  }
}

// GET - Obtenir les statistiques d'une expérience
async function getExperimentStats(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Vérifier si l'utilisateur est admin
  if (session.user.email !== 'info@beriox.ca') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const experimentId = searchParams.get('experimentId')
  if (!experimentId) {
    return NextResponse.json(
      { error: 'experimentId is required' },
      { status: 400 }
    )
  }

  try {
    const stats = abTesting.getExperimentStats(experimentId)
    const significance = abTesting.calculateSignificance(experimentId, 'default')
    logger.info(`Stats requested for experiment: ${experimentId}`, {
      action: 'experiment_stats_requested',
      metadata: {
        experimentId,
        userId: session.user.id,
        statsCount: stats.length
      }
    })
    return NextResponse.json({
      experimentId,
      stats,
      significance,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    logger.error('Failed to get experiment stats', error as Error, {
      action: 'experiment_stats_error',
      metadata: { experimentId, userId: session.user.id }
    })
    return NextResponse.json(
      { error: 'Failed to get experiment stats' },
      { status: 500 }
    )
  }
}

// GET - Obtenir toutes les expériences actives
async function getActiveExperiments(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Vérifier si l'utilisateur est admin
  if (session.user.email !== 'info@beriox.ca') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const experiments = abTesting.getActiveExperiments()
    logger.info(`Active experiments requested`, {
      action: 'active_experiments_requested',
      metadata: {
        userId: session.user.id,
        count: experiments.length
      }
    })
    return NextResponse.json({
      experiments,
      count: experiments.length,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    logger.error('Failed to get active experiments', error as Error, {
      action: 'active_experiments_error',
      metadata: { userId: session.user.id }
    })
    return NextResponse.json(
      { error: 'Failed to get active experiments' },
      { status: 500 }
    )
  }
}

// POST - Créer une nouvelle expérience
async function createExperiment(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Vérifier si l'utilisateur est admin
  if (session.user.email !== 'info@beriox.ca') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await request.json()
    abTesting.createExperiment(body)
    logger.info(`Experiment created: ${body.name}`, {
      action: 'experiment_created',
      metadata: {
        experimentId: body.id,
        userId: session.user.id,
        type: body.type
      }
    })
    return NextResponse.json({
      success: true,
      experimentId: body.id,
      timestamp: new Date().toISOString()
    }, { status: 201 })
  } catch (error) {
    logger.error('Failed to create experiment', error as Error, {
      action: 'experiment_create_error',
      metadata: { userId: session.user.id }
    })
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create experiment' },
      { status: 500 }
    )
  }
}

// PUT - Désactiver une expérience
async function deactivateExperiment(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Vérifier si l'utilisateur est admin
  if (session.user.email !== 'info@beriox.ca') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { experimentId } = body
    if (!experimentId) {
      return NextResponse.json(
        { error: 'experimentId is required' },
        { status: 400 }
      )
    }

    abTesting.deactivateExperiment(experimentId)
    logger.info(`Experiment deactivated: ${experimentId}`, {
      action: 'experiment_deactivated',
      metadata: {
        experimentId,
        userId: session.user.id
      }
    })
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    logger.error('Failed to deactivate experiment', error as Error, {
      action: 'experiment_deactivate_error',
      metadata: { userId: session.user.id }
    })
    return NextResponse.json(
      { error: 'Failed to deactivate experiment' },
      { status: 500 }
    )
  }
}

// GET - Exporter les données d'une expérience
async function exportExperimentData(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Vérifier si l'utilisateur est admin
  if (session.user.email !== 'info@beriox.ca') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const experimentId = searchParams.get('experimentId')
  if (!experimentId) {
    return NextResponse.json(
      { error: 'experimentId is required' },
      { status: 400 }
    )
  }

  try {
    const data = abTesting.exportExperimentData(experimentId)
    logger.info(`Experiment data exported: ${experimentId}`, {
      action: 'experiment_data_exported',
      metadata: {
        experimentId,
        userId: session.user.id,
        resultsCount: data.results.length
      }
    })
    return NextResponse.json(data)
  } catch (error) {
    logger.error('Failed to export experiment data', error as Error, {
      action: 'experiment_export_error',
      metadata: { experimentId, userId: session.user.id }
    })
    return NextResponse.json(
      { error: 'Failed to export experiment data' },
      { status: 500 }
    )
  }
}

// Handlers avec rate limiting
export const GET = withRateLimit(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')
  switch (action) {
    case 'variant':
      return getExperimentVariant(request)
    case 'stats':
      return getExperimentStats(request)
    case 'active':
      return getActiveExperiments(request)
    case 'export':
      return exportExperimentData(request)
    default:
      return NextResponse.json(
        { error: 'Invalid action. Use: variant, stats, active, or export' },
        { status: 400 }
      )
  }
}, 'ab-testing')
export const POST = withRateLimit(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')
  switch (action) {
    case 'conversion':
      return recordExperimentConversion(request)
    case 'create':
      return createExperiment(request)
    default:
      return NextResponse.json(
        { error: 'Invalid action. Use: conversion or create' },
        { status: 400 }
      )
  }
}, 'ab-testing')
export const PUT = withRateLimit(deactivateExperiment, 'ab-testing')