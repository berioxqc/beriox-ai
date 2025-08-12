import { NextRequest, NextResponse } from 'apos;next/server'apos;;
import { getServerSession } from 'apos;next-auth'apos;;
import { authOptions } from 'apos;../../auth/[...nextauth]/route'apos;;
import { integrationManager } from 'apos;@/lib/integrations'apos;;

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'apos;Non authentifié'apos; }, { status: 401 });
    }

    const { id, config } = await req.json();

    if (!id || !config) {
      return NextResponse.json({ error: 'apos;Paramètres invalides'apos; }, { status: 400 });
    }

    const success = integrationManager.updateConfig(id, config);

    if (!success) {
      return NextResponse.json({ error: 'apos;Intégration non trouvée'apos; }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'apos;Configuration mise à jour avec succès'apos;,
    });
  } catch (error: any) {
    console.error('apos;Erreur lors de la mise à jour de la configuration:'apos;, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
