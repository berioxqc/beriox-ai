import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { MessagingService } from '@/lib/messaging-service'
const getEmailConfig = () => ({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || 'support@beriox.ai',
    pass: process.env.SMTP_PASS || ''
  }
})
const getMessagingService = () => new MessagingService(getEmailConfig())
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const messagingService = getMessagingService()
    const templates = await messagingService.getTemplates(category || undefined)
    return NextResponse.json({ templates })
  } catch (error) {
    console.error('Erreur lors de la récupération des templates:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des templates' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      description,
      subject,
      body: templateBody,
      bodyHtml,
      variables,
      category
    } = body
    // Validation des données
    if (!name || !subject || !templateBody || !category) {
      return NextResponse.json(
        { error: 'Name, subject, body et category sont requis' },
        { status: 400 }
      )
    }

    const messagingService = getMessagingService()
    const template = await messagingService.createTemplate({
      name,
      description,
      subject,
      body: templateBody,
      bodyHtml,
      variables: variables || [],
      category
    }, session.user.id)
    return NextResponse.json({ template })
  } catch (error) {
    console.error('Erreur lors de la création du template:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du template' },
      { status: 500 }
    )
  }
}
