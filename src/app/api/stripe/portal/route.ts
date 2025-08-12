import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { createCustomerPortalSession } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id! },
      select: { stripeCustomerId: true }
    })
    if (!user?.stripeCustomerId) {
      return NextResponse.json({ error: 'Aucun abonnement trouvé' }, { status: 404 })
    }

    const returnUrl = `${process.env.NEXTAUTH_URL}/pricing`
    const portalSession = await createCustomerPortalSession(
      user.stripeCustomerId,
      returnUrl
    )
    return NextResponse.json({ url: portalSession.url })
  } catch (error: any) {
    console.error('Erreur portail client Stripe:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
