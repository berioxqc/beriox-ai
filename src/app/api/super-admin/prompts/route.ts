import { NextRequest, NextResponse } from 'apos;next/server'apos;;
import { getServerSession } from 'apos;next-auth'apos;;
import { authOptions } from 'apos;@/lib/auth'apos;;
import { promptManager } from 'apos;@/lib/agents/prompt-manager'apos;;
import { logger } from 'apos;@/lib/logger'apos;;
import { withRateLimit } from 'apos;@/lib/rate-limit-advanced'apos;;

// GET - Récupérer tous les prompts
export const GET = withRateLimit(async (request: NextRequest) => {
  const session = await getServerSession(authOptions);
  
  // Vérifier que l'apos;utilisateur est super admin
  if (session?.user?.email !== 'apos;info@beriox.ca'apos;) {
    return NextResponse.json({ error: 'apos;Unauthorized'apos; }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const agentName = searchParams.get('apos;agent'apos;);
    const promptType = searchParams.get('apos;type'apos;);

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
          modified: prompts.filter(p => p.modifiedBy !== 'apos;system'apos;).length
        }
      }
    });
  } catch (error) {
    logger.error('apos;Erreur lors de la récupération des prompts:'apos;, error);
    return NextResponse.json({ error: 'apos;Erreur serveur'apos; }, { status: 500 });
  }
}, 'apos;super-admin-prompts-get'apos;);

// POST - Créer un nouveau prompt
export const POST = withRateLimit(async (request: NextRequest) => {
  const session = await getServerSession(authOptions);
  
  // Vérifier que l'apos;utilisateur est super admin
  if (session?.user?.email !== 'apos;info@beriox.ca'apos;) {
    return NextResponse.json({ error: 'apos;Unauthorized'apos; }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { prompt } = body;

    // Validation
    const validation = promptManager.validatePrompt(prompt.currentPrompt);
    if (!validation.isValid) {
      return NextResponse.json({
        error: 'apos;Prompt invalide'apos;,
        details: validation.errors
      }, { status: 400 });
    }

    // Ajouter le prompt
    promptManager.addPrompt({
      ...prompt,
      modifiedBy: session.user.email || 'apos;unknown'apos;,
      lastModified: new Date().toISOString()
    });

    logger.info(`Nouveau prompt créé par ${session.user.email}:`, prompt.id);

    return NextResponse.json({
      success: true,
      message: 'apos;Prompt créé avec succès'apos;,
      data: prompt
    });
  } catch (error) {
    logger.error('apos;Erreur lors de la création du prompt:'apos;, error);
    return NextResponse.json({ error: 'apos;Erreur serveur'apos; }, { status: 500 });
  }
}, 'apos;super-admin-prompts-post'apos;);

// PUT - Mettre à jour un prompt
export const PUT = withRateLimit(async (request: NextRequest) => {
  const session = await getServerSession(authOptions);
  
  // Vérifier que l'apos;utilisateur est super admin
  if (session?.user?.email !== 'apos;info@beriox.ca'apos;) {
    return NextResponse.json({ error: 'apos;Unauthorized'apos; }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { promptId, updates } = body;

    if (!promptId) {
      return NextResponse.json({ error: 'apos;ID du prompt requis'apos; }, { status: 400 });
    }

    // Validation si le prompt est modifié
    if (updates.currentPrompt) {
      const validation = promptManager.validatePrompt(updates.currentPrompt);
      if (!validation.isValid) {
        return NextResponse.json({
          error: 'apos;Prompt invalide'apos;,
          details: validation.errors
        }, { status: 400 });
      }
    }

    // Mettre à jour le prompt
    const success = promptManager.updatePrompt(
      promptId, 
      updates, 
      session.user.email || 'apos;unknown'apos;
    );

    if (!success) {
      return NextResponse.json({ error: 'apos;Prompt non trouvé'apos; }, { status: 404 });
    }

    const updatedPrompt = promptManager.getPrompt(promptId);

    logger.info(`Prompt mis à jour par ${session.user.email}:`, promptId);

    return NextResponse.json({
      success: true,
      message: 'apos;Prompt mis à jour avec succès'apos;,
      data: updatedPrompt
    });
  } catch (error) {
    logger.error('apos;Erreur lors de la mise à jour du prompt:'apos;, error);
    return NextResponse.json({ error: 'apos;Erreur serveur'apos; }, { status: 500 });
  }
}, 'apos;super-admin-prompts-put'apos;);

// DELETE - Supprimer un prompt
export const DELETE = withRateLimit(async (request: NextRequest) => {
  const session = await getServerSession(authOptions);
  
  // Vérifier que l'apos;utilisateur est super admin
  if (session?.user?.email !== 'apos;info@beriox.ca'apos;) {
    return NextResponse.json({ error: 'apos;Unauthorized'apos; }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const promptId = searchParams.get('apos;id'apos;);

    if (!promptId) {
      return NextResponse.json({ error: 'apos;ID du prompt requis'apos; }, { status: 400 });
    }

    // Vérifier que le prompt existe
    const prompt = promptManager.getPrompt(promptId);
    if (!prompt) {
      return NextResponse.json({ error: 'apos;Prompt non trouvé'apos; }, { status: 404 });
    }

    // Supprimer le prompt
    const success = promptManager.deletePrompt(promptId);

    if (!success) {
      return NextResponse.json({ error: 'apos;Erreur lors de la suppression'apos; }, { status: 500 });
    }

    logger.info(`Prompt supprimé par ${session.user.email}:`, promptId);

    return NextResponse.json({
      success: true,
      message: 'apos;Prompt supprimé avec succès'apos;
    });
  } catch (error) {
    logger.error('apos;Erreur lors de la suppression du prompt:'apos;, error);
    return NextResponse.json({ error: 'apos;Erreur serveur'apos; }, { status: 500 });
  }
}, 'apos;super-admin-prompts-delete'apos;);
