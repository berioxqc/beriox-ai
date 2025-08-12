import { NextRequest, NextResponse } from 'apos;next/server'apos;;
import { getServerSession } from 'apos;next-auth'apos;;
import { authOptions } from 'apos;@/lib/auth'apos;;
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
} from 'apos;@/lib/form-optimization'apos;;
import { logger } from 'apos;@/lib/logger'apos;;
import { withRateLimit } from 'apos;@/lib/rate-limit-advanced'apos;;

// GET - Obtenir les formulaires
async function getFormsHandler(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'apos;Unauthorized'apos; }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const formId = searchParams.get('apos;formId'apos;);

    if (formId) {
      const form = getForm(formId);
      if (!form) {
        return NextResponse.json({ error: 'apos;Form not found'apos; }, { status: 404 });
      }
      return NextResponse.json({ form });
    } else {
      const forms = getAllForms();
      return NextResponse.json({ forms, count: forms.length });
    }

  } catch (error) {
    logger.error('apos;Failed to get forms'apos;, error as Error, {
      action: 'apos;forms_error'apos;,
      metadata: { userId: session.user.id }
    });

    return NextResponse.json(
      { error: 'apos;Failed to get forms'apos; },
      { status: 500 }
    );
  }
}

// POST - Créer un formulaire
async function createFormHandler(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'apos;Unauthorized'apos; }, { status: 401 });
  }

  try {
    const body = await request.json();
    addForm(body);

    logger.info('apos;Form created'apos;, {
      action: 'apos;form_created'apos;,
      metadata: { userId: session.user.id, formId: body.id }
    });

    return NextResponse.json({ success: true, formId: body.id }, { status: 201 });

  } catch (error) {
    logger.error('apos;Failed to create form'apos;, error as Error, {
      action: 'apos;form_creation_error'apos;,
      metadata: { userId: session.user.id }
    });

    return NextResponse.json(
      { error: 'apos;Failed to create form'apos; },
      { status: 500 }
    );
  }
}

// POST - Démarrer un formulaire
async function startFormHandler(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'apos;Unauthorized'apos; }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { formId } = body;

    if (!formId) {
      return NextResponse.json(
        { error: 'apos;Form ID is required'apos; },
        { status: 400 }
      );
    }

    const formData = startForm(formId, session.user.id);

    logger.info('apos;Form started'apos;, {
      action: 'apos;form_started'apos;,
      metadata: { userId: session.user.id, formId, sessionId: formData.sessionId }
    });

    return NextResponse.json({ formData }, { status: 201 });

  } catch (error) {
    logger.error('apos;Failed to start form'apos;, error as Error, {
      action: 'apos;form_start_error'apos;,
      metadata: { userId: session.user.id }
    });

    return NextResponse.json(
      { error: 'apos;Failed to start form'apos; },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour les données du formulaire
async function updateFormDataHandler(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'apos;Unauthorized'apos; }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { sessionId, fieldId, value } = body;

    if (!sessionId || !fieldId) {
      return NextResponse.json(
        { error: 'apos;Session ID and field ID are required'apos; },
        { status: 400 }
      );
    }

    const formData = updateFormData(sessionId, fieldId, value);

    if (!formData) {
      return NextResponse.json(
        { error: 'apos;Form session not found'apos; },
        { status: 404 }
      );
    }

    logger.info('apos;Form data updated'apos;, {
      action: 'apos;form_data_updated'apos;,
      metadata: { userId: session.user.id, sessionId, fieldId, progress: formData.progress }
    });

    return NextResponse.json({ formData });

  } catch (error) {
    logger.error('apos;Failed to update form data'apos;, error as Error, {
      action: 'apos;form_data_update_error'apos;,
      metadata: { userId: session.user.id }
    });

    return NextResponse.json(
      { error: 'apos;Failed to update form data'apos; },
      { status: 500 }
    );
  }
}

// POST - Valider un formulaire
async function validateFormHandler(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'apos;Unauthorized'apos; }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'apos;Session ID is required'apos; },
        { status: 400 }
      );
    }

    const validation = validateForm(sessionId);

    logger.info('apos;Form validated'apos;, {
      action: 'apos;form_validated'apos;,
      metadata: { userId: session.user.id, sessionId, isValid: validation.isValid }
    });

    return NextResponse.json(validation);

  } catch (error) {
    logger.error('apos;Failed to validate form'apos;, error as Error, {
      action: 'apos;form_validation_error'apos;,
      metadata: { userId: session.user.id }
    });

    return NextResponse.json(
      { error: 'apos;Failed to validate form'apos; },
      { status: 500 }
    );
  }
}

// POST - Soumettre un formulaire
async function submitFormHandler(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'apos;Unauthorized'apos; }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'apos;Session ID is required'apos; },
        { status: 400 }
      );
    }

    const result = submitForm(sessionId);

    logger.info('apos;Form submitted'apos;, {
      action: 'apos;form_submitted'apos;,
      metadata: { userId: session.user.id, sessionId, success: result.success }
    });

    return NextResponse.json(result);

  } catch (error) {
    logger.error('apos;Failed to submit form'apos;, error as Error, {
      action: 'apos;form_submission_error'apos;,
      metadata: { userId: session.user.id }
    });

    return NextResponse.json(
      { error: 'apos;Failed to submit form'apos; },
      { status: 500 }
    );
  }
}

// POST - Sauvegarder un brouillon
async function saveDraftHandler(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'apos;Unauthorized'apos; }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'apos;Session ID is required'apos; },
        { status: 400 }
      );
    }

    const success = saveDraft(sessionId);

    if (!success) {
      return NextResponse.json(
        { error: 'apos;Form session not found'apos; },
        { status: 404 }
      );
    }

    logger.info('apos;Form draft saved'apos;, {
      action: 'apos;form_draft_saved'apos;,
      metadata: { userId: session.user.id, sessionId }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    logger.error('apos;Failed to save draft'apos;, error as Error, {
      action: 'apos;form_draft_save_error'apos;,
      metadata: { userId: session.user.id }
    });

    return NextResponse.json(
      { error: 'apos;Failed to save draft'apos; },
      { status: 500 }
    );
  }
}

// POST - Abandonner un formulaire
async function abandonFormHandler(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'apos;Unauthorized'apos; }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { sessionId, reason } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'apos;Session ID is required'apos; },
        { status: 400 }
      );
    }

    const success = abandonForm(sessionId, reason);

    if (!success) {
      return NextResponse.json(
        { error: 'apos;Form session not found or already submitted'apos; },
        { status: 404 }
      );
    }

    logger.info('apos;Form abandoned'apos;, {
      action: 'apos;form_abandoned'apos;,
      metadata: { userId: session.user.id, sessionId, reason }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    logger.error('apos;Failed to abandon form'apos;, error as Error, {
      action: 'apos;form_abandon_error'apos;,
      metadata: { userId: session.user.id }
    });

    return NextResponse.json(
      { error: 'apos;Failed to abandon form'apos; },
      { status: 500 }
    );
  }
}

// GET - Obtenir les analytics d'apos;un formulaire
async function getAnalyticsHandler(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'apos;Unauthorized'apos; }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const formId = searchParams.get('apos;formId'apos;);

    if (!formId) {
      return NextResponse.json(
        { error: 'apos;Form ID is required'apos; },
        { status: 400 }
      );
    }

    const analytics = getFormAnalytics(formId);

    if (!analytics) {
      return NextResponse.json(
        { error: 'apos;Analytics not found'apos; },
        { status: 404 }
      );
    }

    return NextResponse.json({ analytics });

  } catch (error) {
    logger.error('apos;Failed to get analytics'apos;, error as Error, {
      action: 'apos;analytics_error'apos;,
      metadata: { userId: session.user.id }
    });

    return NextResponse.json(
      { error: 'apos;Failed to get analytics'apos; },
      { status: 500 }
    );
  }
}

// POST - Générer les optimisations
async function generateOptimizationsHandler(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'apos;Unauthorized'apos; }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { formId } = body;

    if (!formId) {
      return NextResponse.json(
        { error: 'apos;Form ID is required'apos; },
        { status: 400 }
      );
    }

    const optimization = generateOptimizations(formId);

    logger.info('apos;Form optimizations generated'apos;, {
      action: 'apos;form_optimizations_generated'apos;,
      metadata: { userId: session.user.id, formId, suggestionsCount: optimization.suggestions.length }
    });

    return NextResponse.json({ optimization });

  } catch (error) {
    logger.error('apos;Failed to generate optimizations'apos;, error as Error, {
      action: 'apos;optimizations_error'apos;,
      metadata: { userId: session.user.id }
    });

    return NextResponse.json(
      { error: 'apos;Failed to generate optimizations'apos; },
      { status: 500 }
    );
  }
}

// Handlers avec rate limiting
export const GET = withRateLimit(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('apos;action'apos;);

  switch (action) {
    case 'apos;forms'apos;:
      return getFormsHandler(request);
    case 'apos;analytics'apos;:
      return getAnalyticsHandler(request);
    default:
      return NextResponse.json(
        { error: 'apos;Invalid action. Use: forms or analytics'apos; },
        { status: 400 }
      );
  }
}, 'apos;form-optimization'apos;);

export const POST = withRateLimit(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('apos;action'apos;);

  switch (action) {
    case 'apos;create'apos;:
      return createFormHandler(request);
    case 'apos;start'apos;:
      return startFormHandler(request);
    case 'apos;validate'apos;:
      return validateFormHandler(request);
    case 'apos;submit'apos;:
      return submitFormHandler(request);
    case 'apos;save-draft'apos;:
      return saveDraftHandler(request);
    case 'apos;abandon'apos;:
      return abandonFormHandler(request);
    case 'apos;optimizations'apos;:
      return generateOptimizationsHandler(request);
    default:
      return NextResponse.json(
        { error: 'apos;Invalid action. Use: create, start, validate, submit, save-draft, abandon, or optimizations'apos; },
        { status: 400 }
      );
  }
}, 'apos;form-optimization'apos;);

export const PUT = withRateLimit(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('apos;action'apos;);

  switch (action) {
    case 'apos;update'apos;:
      return updateFormDataHandler(request);
    default:
      return NextResponse.json(
        { error: 'apos;Invalid action. Use: update'apos; },
        { status: 400 }
      );
  }
}, 'apos;form-optimization'apos;);
