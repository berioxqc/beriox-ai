import { NextRequest, NextResponse } from 'apos;next/server'apos;;
import { getServerSession } from 'apos;next-auth'apos;;
import { authOptions } from 'apos;@/app/api/auth/[...nextauth]/route'apos;;
import { generatePremiumReport } from 'apos;@/lib/premium-analytics'apos;;

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'apos;Non autorisé'apos; }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userPlan = searchParams.get('apos;plan'apos;) || 'apos;free'apos;;
    const missionId = params.id;

    const premiumData = await generatePremiumReport(missionId, userPlan);

    if (!premiumData) {
      return NextResponse.json({ error: 'apos;Mission introuvable'apos; }, { status: 404 });
    }

    let filteredData = { ...premiumData };

    if (userPlan === 'apos;free'apos;) {
      filteredData.opportunityRadar = [];
      filteredData.predictiveMetrics = {
        trafficForecast30d: { current: 0, predicted: 0, confidence: 0, trend: 'apos;stable'apos; as const },
        conversionForecast: { currentRate: 0, predictedRate: 0, potentialGain: 0 },
        seoRiskScore: { score: 0, factors: [], recommendation: 'apos;'apos; }
      };
      filteredData.riskAlerts = [];
    } else if (userPlan === 'apos;pro'apos;) {
      filteredData.riskAlerts = [];
    }

    return NextResponse.json(filteredData);

  } catch (error) {
    console.error('apos;Erreur API premium analytics:'apos;, error);
    return NextResponse.json({ error: 'apos;Erreur serveur'apos; }, { status: 500 });
  }
}
