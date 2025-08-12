import { NextRequest, NextResponse } from 'apos;next/server'apos;;
import { getServerSession } from 'apos;next-auth'apos;;
import { authOptions } from 'apos;@/lib/auth'apos;;
import { promptManager } from 'apos;@/lib/agents/prompt-manager'apos;;
import { logger } from 'apos;@/lib/logger'apos;;
import { withRateLimit } from 'apos;@/lib/rate-limit-advanced'apos;;

// POST - Actions sur les prompts (reset, toggle, export, import)
export const POST = withRateLimit(async (request: NextRequest) => {
  const session = await getServerSession(authOptions);
  
  // Vérifier que l'apos;utilisateur est super admin
  if (session?.user?.email !== 'apos;info@beriox.ca'apos;) {
    return NextResponse.json({ error: 'apos;Unauthorized'apos; }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action, promptId, data } = body;

    switch (action) {
      case 'apos;reset'apos;:
        // Réinitialiser un prompt à sa valeur par défaut
        if (!promptId) {
          return NextResponse.json({ error: 'apos;ID du prompt requis'apos; }, { status: 400 });
        }
        
        const resetSuccess = promptManager.resetPrompt(promptId, session.user.email || 'apos;unknown'apos;);
        if (!resetSuccess) {
          return NextResponse.json({ error: 'apos;Prompt non trouvé'apos; }, { status: 404 });
        }

        const resetPrompt = promptManager.getPrompt(promptId);
        logger.info(`Prompt réinitialisé par ${session.user.email}:`, promptId);

        return NextResponse.json({
          success: true,
          message: 'apos;Prompt réinitialisé avec succès'apos;,
          data: resetPrompt
        });

      case 'apos;toggle'apos;:
        // Activer/désactiver un prompt
        if (!promptId) {
          return NextResponse.json({ error: 'apos;ID du prompt requis'apos; }, { status: 400 });
        }
        
        const toggleSuccess = promptManager.togglePrompt(promptId, session.user.email || 'apos;unknown'apos;);
        if (!toggleSuccess) {
          return NextResponse.json({ error: 'apos;Prompt non trouvé'apos; }, { status: 404 });
        }

        const toggledPrompt = promptManager.getPrompt(promptId);
        logger.info(`Prompt ${toggledPrompt?.isActive ? 'apos;activé'apos; : 'apos;désactivé'apos;} par ${session.user.email}:`, promptId);

        return NextResponse.json({
          success: true,
          message: `Prompt ${toggledPrompt?.isActive ? 'apos;activé'apos; : 'apos;désactivé'apos;} avec succès`,
          data: toggledPrompt
        });

      case 'apos;export'apos;:
        // Exporter tous les prompts
        const exportData = promptManager.exportPrompts();
        
        logger.info(`Prompts exportés par ${session.user.email}`);

        return NextResponse.json({
          success: true,
          message: 'apos;Prompts exportés avec succès'apos;,
          data: {
            export: exportData,
            filename: `beriox-prompts-${new Date().toISOString().split('apos;T'apos;)[0]}.json`
          }
        });

      case 'apos;import'apos;:
        // Importer des prompts
        if (!data) {
          return NextResponse.json({ error: 'apos;Données d\'apos;import requises'apos; }, { status: 400 });
        }
        
        const importResult = promptManager.importPrompts(data);
        
        if (!importResult.success) {
          return NextResponse.json({
            error: 'apos;Erreur lors de l\'apos;import'apos;,
            details: importResult.errors
          }, { status: 400 });
        }

        logger.info(`Prompts importés par ${session.user.email}`);

        return NextResponse.json({
          success: true,
          message: 'apos;Prompts importés avec succès'apos;,
          data: {
            imported: true,
            errors: importResult.errors
          }
        });

      case 'apos;apply-template'apos;:
        // Appliquer un template à un prompt
        const { templateId, variables } = body;
        
        if (!promptId || !templateId) {
          return NextResponse.json({ error: 'apos;ID du prompt et du template requis'apos; }, { status: 400 });
        }
        
        const templateSuccess = promptManager.applyTemplate(
          promptId, 
          templateId, 
          variables || {}, 
          session.user.email || 'apos;unknown'apos;
        );
        
        if (!templateSuccess) {
          return NextResponse.json({ error: 'apos;Erreur lors de l\'apos;application du template'apos; }, { status: 400 });
        }

        const templatedPrompt = promptManager.getPrompt(promptId);
        logger.info(`Template appliqué par ${session.user.email}:`, { promptId, templateId });

        return NextResponse.json({
          success: true,
          message: 'apos;Template appliqué avec succès'apos;,
          data: templatedPrompt
        });

      case 'apos;validate'apos;:
        // Valider un prompt
        const { prompt } = body;
        
        if (!prompt) {
          return NextResponse.json({ error: 'apos;Prompt requis'apos; }, { status: 400 });
        }
        
        const validation = promptManager.validatePrompt(prompt);
        
        return NextResponse.json({
          success: true,
          data: validation
        });

      default:
        return NextResponse.json({ error: 'apos;Action non reconnue'apos; }, { status: 400 });
    }
  } catch (error) {
    logger.error('apos;Erreur lors de l\'apos;action sur les prompts:'apos;, error);
    return NextResponse.json({ error: 'apos;Erreur serveur'apos; }, { status: 500 });
  }
}, 'apos;super-admin-prompts-actions'apos;);
