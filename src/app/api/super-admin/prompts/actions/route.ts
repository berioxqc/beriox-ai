import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { promptManager } from '@/lib/agents/prompt-manager';
import { logger } from '@/lib/logger';
import { withRateLimit } from '@/lib/rate-limit-advanced';

// POST - Actions sur les prompts (reset, toggle, export, import)
export const POST = withRateLimit(async (request: NextRequest) => {
  const session = await getServerSession(authOptions);
  
  // Vérifier que l'utilisateur est super admin
  if (session?.user?.email !== 'info@beriox.ca') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action, promptId, data } = body;

    switch (action) {
      case 'reset':
        // Réinitialiser un prompt à sa valeur par défaut
        if (!promptId) {
          return NextResponse.json({ error: 'ID du prompt requis' }, { status: 400 });
        }
        
        const resetSuccess = promptManager.resetPrompt(promptId, session.user.email || 'unknown');
        if (!resetSuccess) {
          return NextResponse.json({ error: 'Prompt non trouvé' }, { status: 404 });
        }

        const resetPrompt = promptManager.getPrompt(promptId);
        logger.info(`Prompt réinitialisé par ${session.user.email}:`, promptId);

        return NextResponse.json({
          success: true,
          message: 'Prompt réinitialisé avec succès',
          data: resetPrompt
        });

      case 'toggle':
        // Activer/désactiver un prompt
        if (!promptId) {
          return NextResponse.json({ error: 'ID du prompt requis' }, { status: 400 });
        }
        
        const toggleSuccess = promptManager.togglePrompt(promptId, session.user.email || 'unknown');
        if (!toggleSuccess) {
          return NextResponse.json({ error: 'Prompt non trouvé' }, { status: 404 });
        }

        const toggledPrompt = promptManager.getPrompt(promptId);
        logger.info(`Prompt ${toggledPrompt?.isActive ? 'activé' : 'désactivé'} par ${session.user.email}:`, promptId);

        return NextResponse.json({
          success: true,
          message: `Prompt ${toggledPrompt?.isActive ? 'activé' : 'désactivé'} avec succès`,
          data: toggledPrompt
        });

      case 'export':
        // Exporter tous les prompts
        const exportData = promptManager.exportPrompts();
        
        logger.info(`Prompts exportés par ${session.user.email}`);

        return NextResponse.json({
          success: true,
          message: 'Prompts exportés avec succès',
          data: {
            export: exportData,
            filename: `beriox-prompts-${new Date().toISOString().split('T')[0]}.json`
          }
        });

      case 'import':
        // Importer des prompts
        if (!data) {
          return NextResponse.json({ error: 'Données d\'import requises' }, { status: 400 });
        }
        
        const importResult = promptManager.importPrompts(data);
        
        if (!importResult.success) {
          return NextResponse.json({
            error: 'Erreur lors de l\'import',
            details: importResult.errors
          }, { status: 400 });
        }

        logger.info(`Prompts importés par ${session.user.email}`);

        return NextResponse.json({
          success: true,
          message: 'Prompts importés avec succès',
          data: {
            imported: true,
            errors: importResult.errors
          }
        });

      case 'apply-template':
        // Appliquer un template à un prompt
        const { templateId, variables } = body;
        
        if (!promptId || !templateId) {
          return NextResponse.json({ error: 'ID du prompt et du template requis' }, { status: 400 });
        }
        
        const templateSuccess = promptManager.applyTemplate(
          promptId, 
          templateId, 
          variables || {}, 
          session.user.email || 'unknown'
        );
        
        if (!templateSuccess) {
          return NextResponse.json({ error: 'Erreur lors de l\'application du template' }, { status: 400 });
        }

        const templatedPrompt = promptManager.getPrompt(promptId);
        logger.info(`Template appliqué par ${session.user.email}:`, { promptId, templateId });

        return NextResponse.json({
          success: true,
          message: 'Template appliqué avec succès',
          data: templatedPrompt
        });

      case 'validate':
        // Valider un prompt
        const { prompt } = body;
        
        if (!prompt) {
          return NextResponse.json({ error: 'Prompt requis' }, { status: 400 });
        }
        
        const validation = promptManager.validatePrompt(prompt);
        
        return NextResponse.json({
          success: true,
          data: validation
        });

      default:
        return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 });
    }
  } catch (error) {
    logger.error('Erreur lors de l\'action sur les prompts:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}, 'super-admin-prompts-actions');
