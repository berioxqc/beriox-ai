import { NextRequest, NextResponse } from 'apos;next/server'apos;;
import { getServerSession } from 'apos;next-auth'apos;;
import { authOptions } from 'apos;../auth/[...nextauth]/route'apos;;
import { integrationManager, initializeIntegrations } from 'apos;@/lib/integrations'apos;;

// Initialiser les intégrations si ce n'apos;est pas déjà fait
initializeIntegrations();

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'apos;Non authentifié'apos; }, { status: 401 });
    }

    const integrations = integrationManager.getAll();

    return NextResponse.json({
      success: true,
      integrations,
    });
  } catch (error: any) {
    console.error('apos;Erreur lors du chargement des intégrations:'apos;, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
