import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  formOptimizer,
  addForm,
  getForm,
  getAllForms,
  startForm,
  updateFormData,
  validateForm,
  submitForm,
  saveDraft,
  abandonForm,
  getFormAnalytics,
  generateOptimizations
} from '@/lib/form-optimization'
import { logger } from '@/lib/logger'
import { withRateLimit } from '@/lib/rate-limit-advanced'
// GET - Obtenir les formulaires
async function getFormsHandler(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const formId = searchParams.get('formId')
    if (formId) {
      const form = getForm(formId)
      if (!form) {
        return NextResponse.json({ error: 'Form not found' }, { status: 404 })
      }
      return NextResponse.json({ form })
    } else {
      const forms = getAllForms()
      return NextResponse.json({ forms, count: forms.length })
    }

  } catch (error) {
    logger.error('Failed to get forms', error as Error, {
      action: 'forms_error',
      metadata: { userId: session.user.id }
    })
    return NextResponse.json(
      { error: 'Failed to get forms' },
      { status: 500 }
    )
  }
}

// POST - Créer un formulaire
async function createFormHandler(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    addForm(body)
    logger.info('Form created', {
      action: 'form_created',
      metadata: { userId: session.user.id, formId: body.id }
    })
    return NextResponse.json({ success: true, formId: body.id }, { status: 201 })
  } catch (error) {
    logger.error('Failed to create form', error as Error, {
      action: 'form_creation_error',
      metadata: { userId: session.user.id }
    })
    return NextResponse.json(
      { error: 'Failed to create form' },
      { status: 500 }
    )
  }
}

// POST - Démarrer un formulaire
async function startFormHandler(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { formId } = body
    if (!formId) {
      return NextResponse.json(
        { error: 'Form ID is required' },
        { status: 400 }
      )
    }

    const formData = startForm(formId, session.user.id)
    logger.info('Form started', {
      action: 'form_started',
      metadata: { userId: session.user.id, formId, sessionId: formData.sessionId }
    })
    return NextResponse.json({ formData }, { status: 201 })
  } catch (error) {
    logger.error('Failed to start form', error as Error, {
      action: 'form_start_error',
      metadata: { userId: session.user.id }
    })
    return NextResponse.json(
      { error: 'Failed to start form' },
      { status: 500 }
    )
  }
}

// PUT - Mettre à jour les données du formulaire
async function updateFormDataHandler(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { sessionId, fieldId, value } = body
    if (!sessionId || !fieldId) {
      return NextResponse.json(
        { error: 'Session ID and field ID are required' },
        { status: 400 }
      )
    }

    const formData = updateFormData(sessionId, fieldId, value)
    if (!formData) {
      return NextResponse.json(
        { error: 'Form session not found' },
        { status: 404 }
      )
    }

    logger.info('Form data updated', {
      action: 'form_data_updated',
      metadata: { userId: session.user.id, sessionId, fieldId, progress: formData.progress }
    })
    return NextResponse.json({ formData })
  } catch (error) {
    logger.error('Failed to update form data', error as Error, {
      action: 'form_data_update_error',
      metadata: { userId: session.user.id }
    })
    return NextResponse.json(
      { error: 'Failed to update form data' },
      { status: 500 }
    )
  }
}

// POST - Valider un formulaire
async function validateFormHandler(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { sessionId } = body
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    const validation = validateForm(sessionId)
    logger.info('Form validated', {
      action: 'form_validated',
      metadata: { userId: session.user.id, sessionId, isValid: validation.isValid }
    })
    return NextResponse.json(validation)
  } catch (error) {
    logger.error('Failed to validate form', error as Error, {
      action: 'form_validation_error',
      metadata: { userId: session.user.id }
    })
    return NextResponse.json(
      { error: 'Failed to validate form' },
      { status: 500 }
    )
  }
}

// POST - Soumettre un formulaire
async function submitFormHandler(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { sessionId } = body
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    const result = submitForm(sessionId)
    logger.info('Form submitted', {
      action: 'form_submitted',
      metadata: { userId: session.user.id, sessionId, success: result.success }
    })
    return NextResponse.json(result)
  } catch (error) {
    logger.error('Failed to submit form', error as Error, {
      action: 'form_submission_error',
      metadata: { userId: session.user.id }
    })
    return NextResponse.json(
      { error: 'Failed to submit form' },
      { status: 500 }
    )
  }
}

// POST - Sauvegarder un brouillon
async function saveDraftHandler(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { sessionId } = body
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    const success = saveDraft(sessionId)
    if (!success) {
      return NextResponse.json(
        { error: 'Form session not found' },
        { status: 404 }
      )
    }

    logger.info('Form draft saved', {
      action: 'form_draft_saved',
      metadata: { userId: session.user.id, sessionId }
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Failed to save draft', error as Error, {
      action: 'form_draft_save_error',
      metadata: { userId: session.user.id }
    })
    return NextResponse.json(
      { error: 'Failed to save draft' },
      { status: 500 }
    )
  }
}

// POST - Abandonner un formulaire
async function abandonFormHandler(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { sessionId, reason } = body
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    const success = abandonForm(sessionId, reason)
    if (!success) {
      return NextResponse.json(
        { error: 'Form session not found or already submitted' },
        { status: 404 }
      )
    }

    logger.info('Form abandoned', {
      action: 'form_abandoned',
      metadata: { userId: session.user.id, sessionId, reason }
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Failed to abandon form', error as Error, {
      action: 'form_abandon_error',
      metadata: { userId: session.user.id }
    })
    return NextResponse.json(
      { error: 'Failed to abandon form' },
      { status: 500 }
    )
  }
}

// GET - Obtenir les analytics d'un formulaire
async function getAnalyticsHandler(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const formId = searchParams.get('formId')
    if (!formId) {
      return NextResponse.json(
        { error: 'Form ID is required' },
        { status: 400 }
      )
    }

    const analytics = getFormAnalytics(formId)
    if (!analytics) {
      return NextResponse.json(
        { error: 'Analytics not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ analytics })
  } catch (error) {
    logger.error('Failed to get analytics', error as Error, {
      action: 'analytics_error',
      metadata: { userId: session.user.id }
    })
    return NextResponse.json(
      { error: 'Failed to get analytics' },
      { status: 500 }
    )
  }
}

// POST - Générer les optimisations
async function generateOptimizationsHandler(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { formId } = body
    if (!formId) {
      return NextResponse.json(
        { error: 'Form ID is required' },
        { status: 400 }
      )
    }

    const optimization = generateOptimizations(formId)
    logger.info('Form optimizations generated', {
      action: 'form_optimizations_generated',
      metadata: { userId: session.user.id, formId, suggestionsCount: optimization.suggestions.length }
    })
    return NextResponse.json({ optimization })
  } catch (error) {
    logger.error('Failed to generate optimizations', error as Error, {
      action: 'optimizations_error',
      metadata: { userId: session.user.id }
    })
    return NextResponse.json(
      { error: 'Failed to generate optimizations' },
      { status: 500 }
    )
  }
}

// Handlers avec rate limiting
export const GET = withRateLimit(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')
  switch (action) {
    case 'forms':
      return getFormsHandler(request)
    case 'analytics':
      return getAnalyticsHandler(request)
    default:
      return NextResponse.json(
        { error: 'Invalid action. Use: forms or analytics' },
        { status: 400 }
      )
  }
}, 'form-optimization')
export const POST = withRateLimit(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')
  switch (action) {
    case 'create':
      return createFormHandler(request)
    case 'start':
      return startFormHandler(request)
    case 'validate':
      return validateFormHandler(request)
    case 'submit':
      return submitFormHandler(request)
    case 'save-draft':
      return saveDraftHandler(request)
    case 'abandon':
      return abandonFormHandler(request)
    case 'optimizations':
      return generateOptimizationsHandler(request)
    default:
      return NextResponse.json(
        { error: 'Invalid action. Use: create, start, validate, submit, save-draft, abandon, or optimizations' },
        { status: 400 }
      )
  }
}, 'form-optimization')
export const PUT = withRateLimit(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')
  switch (action) {
    case 'update':
      return updateFormDataHandler(request)
    default:
      return NextResponse.json(
        { error: 'Invalid action. Use: update' },
        { status: 400 }
      )
  }
}, 'form-optimization')