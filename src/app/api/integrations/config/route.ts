import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { integrationManager } from '@/lib/integrations';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { id, config } = await req.json();

    if (!id || !config) {
      return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 });
    }

    const success = integrationManager.updateConfig(id, config);

    if (!success) {
      return NextResponse.json({ error: 'Intégration non trouvée' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Configuration mise à jour avec succès',
    });
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour de la configuration:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
