import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Test d\'authentification...')
    
    // Récupérer la session
    const session = await getServerSession(authOptions)
    
    // Récupérer les cookies
    const cookies = request.headers.get('cookie') || ''
    const sessionToken = cookies.match(/next-auth\.session-token=([^;]+)/)?.[1] ||
                        cookies.match(/__Secure-next-auth\.session-token=([^;]+)/)?.[1]
    
    // Vérifier les variables d'environnement
    const envCheck = {
      GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      NODE_ENV: process.env.NODE_ENV,
    }
    
    const result = {
      success: true,
      timestamp: new Date().toISOString(),
      session: session ? {
        user: {
          id: session.user?.id,
          email: session.user?.email,
          name: session.user?.name,
        },
        expires: session.expires
      } : null,
      cookies: {
        hasSessionToken: !!sessionToken,
        sessionTokenLength: sessionToken?.length || 0,
        allCookies: cookies.split(';').map(c => c.trim()).filter(c => c.includes('auth'))
      },
      environment: envCheck,
      headers: {
        host: request.headers.get('host'),
        origin: request.headers.get('origin'),
        referer: request.headers.get('referer'),
        userAgent: request.headers.get('user-agent')?.substring(0, 100)
      }
    }
    
    console.log('✅ Test d\'authentification réussi:', result)
    
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('❌ Erreur lors du test d\'authentification:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
