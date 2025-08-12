import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    return NextResponse.json({
      success: true,
      authenticated: !!session,
      user: session?.user ? {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name
      } : null,
      timestamp: new Date().toISOString(),
      environment: {
        nodeEnv: process.env.NODE_ENV,
        nextRuntime: process.env.NEXT_RUNTIME,
        hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
        hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
        baseUrl: process.env.NEXTAUTH_URL || process.env.VERCEL_URL
      }
    })
  } catch (error) {
    console.error('Erreur test auth:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
