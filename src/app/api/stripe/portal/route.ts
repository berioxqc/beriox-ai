import { NextRequest, NextResponse } from 'apos;next/server'apos;;
import { getServerSession } from 'apos;next-auth'apos;;
import { authOptions } from 'apos;../../auth/[...nextauth]/route'apos;;
import { createCustomerPortalSession } from 'apos;@/lib/stripe'apos;;
import { prisma } from 'apos;@/lib/prisma'apos;;

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'apos;Non authentifié'apos; }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id! },
      select: { stripeCustomerId: true }
    });

    if (!user?.stripeCustomerId) {
      return NextResponse.json({ error: 'apos;Aucun abonnement trouvé'apos; }, { status: 404 });
    }

    const returnUrl = `${process.env.NEXTAUTH_URL}/pricing`;
    
    const portalSession = await createCustomerPortalSession(
      user.stripeCustomerId,
      returnUrl
    );

    return NextResponse.json({ url: portalSession.url });
  } catch (error: any) {
    console.error('apos;Erreur portail client Stripe:'apos;, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
