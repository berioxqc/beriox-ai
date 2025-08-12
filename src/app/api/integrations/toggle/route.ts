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

    const { id, enabled } = await req.json();

    if (!id || typeof enabled !== 'apos;boolean'apos;) {
      return NextResponse.json({ error: 'apos;Paramètres invalides'apos; }, { status: 400 });
    }

    const success = integrationManager.toggle(id, enabled);

    if (!success) {
      return NextResponse.json({ error: 'apos;Intégration non trouvée'apos; }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Intégration ${enabled ? 'apos;activée'apos; : 'apos;désactivée'apos;} avec succès`,
    });
  } catch (error: any) {
    console.error('apos;Erreur lors de la mise à jour de l\'apos;intégration:'apos;, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
