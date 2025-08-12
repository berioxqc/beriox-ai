import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { generatePremiumReport } from '@/lib/premium-analytics'
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userPlan = searchParams.get('plan') || 'free'
    const missionId = params.id
    const premiumData = await generatePremiumReport(missionId, userPlan)
    if (!premiumData) {
      return NextResponse.json({ error: 'Mission introuvable' }, { status: 404 })
    }

    const filteredData = { ...premiumData }
    if (userPlan === 'free') {
      filteredData.opportunityRadar = []
      filteredData.predictiveMetrics = {
        trafficForecast30d: { current: 0, predicted: 0, confidence: 0, trend: 'stable' as const },
        conversionForecast: { currentRate: 0, predictedRate: 0, potentialGain: 0 },
        seoRiskScore: { score: 0, factors: [], recommendation: '' }
      }
      filteredData.riskAlerts = []
    } else if (userPlan === 'pro') {
      filteredData.riskAlerts = []
    }

    return NextResponse.json(filteredData)
  } catch (error) {
    console.error('Erreur API premium analytics:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
