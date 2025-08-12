import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { integrationManager, initializeIntegrations } from '@/lib/integrations'
// Initialiser les intégrations si ce n'est pas déjà fait
initializeIntegrations()
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const integrations = integrationManager.getAll()
    return NextResponse.json({
      success: true,
      integrations,
    })
  } catch (error: any) {
    console.error('Erreur lors du chargement des intégrations:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
