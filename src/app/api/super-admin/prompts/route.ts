import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { promptManager } from '@/lib/agents/prompt-manager';
import { logger } from '@/lib/logger';
import { withRateLimit } from '@/lib/rate-limit-advanced';

// GET - Récupérer tous les prompts
export const GET = withRateLimit(async (request: NextRequest) => {
  const session = await getServerSession(authOptions);
  
  // Vérifier que l'utilisateur est super admin
  if (session?.user?.email !== 'info@beriox.ca') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const agentName = searchParams.get('agent');
    const promptType = searchParams.get('type');

    let prompts;
    if (agentName) {
      prompts = promptManager.getAgentPrompts(agentName);
    } else {
      prompts = promptManager.getAllPrompts();
    }

    // Filtrer par type si spécifié
    if (promptType) {
      prompts = prompts.filter(p => p.promptType === promptType);
    }

    const templates = promptManager.getTemplates();
    const report = promptManager.generatePromptReport();

    return NextResponse.json({
      success: true,
      data: {
        prompts,
        templates,
        report,
        stats: {
          total: prompts.length,
          active: prompts.filter(p => p.isActive).length,
          modified: prompts.filter(p => p.modifiedBy !== 'system').length
        }
      }
    });
  } catch (error) {
    logger.error('Erreur lors de la récupération des prompts:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}, 'super-admin-prompts-get');

// POST - Créer un nouveau prompt
export const POST = withRateLimit(async (request: NextRequest) => {
  const session = await getServerSession(authOptions);
  
  // Vérifier que l'utilisateur est super admin
  if (session?.user?.email !== 'info@beriox.ca') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { prompt } = body;

    // Validation
    const validation = promptManager.validatePrompt(prompt.currentPrompt);
    if (!validation.isValid) {
      return NextResponse.json({
        error: 'Prompt invalide',
        details: validation.errors
      }, { status: 400 });
    }

    // Ajouter le prompt
    promptManager.addPrompt({
      ...prompt,
      modifiedBy: session.user.email || 'unknown',
      lastModified: new Date().toISOString()
    });

    logger.info(`Nouveau prompt créé par ${session.user.email}:`, prompt.id);

    return NextResponse.json({
      success: true,
      message: 'Prompt créé avec succès',
      data: prompt
    });
  } catch (error) {
    logger.error('Erreur lors de la création du prompt:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}, 'super-admin-prompts-post');

// PUT - Mettre à jour un prompt
export const PUT = withRateLimit(async (request: NextRequest) => {
  const session = await getServerSession(authOptions);
  
  // Vérifier que l'utilisateur est super admin
  if (session?.user?.email !== 'info@beriox.ca') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { promptId, updates } = body;

    if (!promptId) {
      return NextResponse.json({ error: 'ID du prompt requis' }, { status: 400 });
    }

    // Validation si le prompt est modifié
    if (updates.currentPrompt) {
      const validation = promptManager.validatePrompt(updates.currentPrompt);
      if (!validation.isValid) {
        return NextResponse.json({
          error: 'Prompt invalide',
          details: validation.errors
        }, { status: 400 });
      }
    }

    // Mettre à jour le prompt
    const success = promptManager.updatePrompt(
      promptId, 
      updates, 
      session.user.email || 'unknown'
    );

    if (!success) {
      return NextResponse.json({ error: 'Prompt non trouvé' }, { status: 404 });
    }

    const updatedPrompt = promptManager.getPrompt(promptId);

    logger.info(`Prompt mis à jour par ${session.user.email}:`, promptId);

    return NextResponse.json({
      success: true,
      message: 'Prompt mis à jour avec succès',
      data: updatedPrompt
    });
  } catch (error) {
    logger.error('Erreur lors de la mise à jour du prompt:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}, 'super-admin-prompts-put');

// DELETE - Supprimer un prompt
export const DELETE = withRateLimit(async (request: NextRequest) => {
  const session = await getServerSession(authOptions);
  
  // Vérifier que l'utilisateur est super admin
  if (session?.user?.email !== 'info@beriox.ca') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const promptId = searchParams.get('id');

    if (!promptId) {
      return NextResponse.json({ error: 'ID du prompt requis' }, { status: 400 });
    }

    // Vérifier que le prompt existe
    const prompt = promptManager.getPrompt(promptId);
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt non trouvé' }, { status: 404 });
    }

    // Supprimer le prompt
    const success = promptManager.deletePrompt(promptId);

    if (!success) {
      return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 });
    }

    logger.info(`Prompt supprimé par ${session.user.email}:`, promptId);

    return NextResponse.json({
      success: true,
      message: 'Prompt supprimé avec succès'
    });
  } catch (error) {
    logger.error('Erreur lors de la suppression du prompt:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}, 'super-admin-prompts-delete');
