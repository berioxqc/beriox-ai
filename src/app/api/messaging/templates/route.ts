import { NextRequest, NextResponse } from 'apos;next/server'apos;;
import { getServerSession } from 'apos;next-auth'apos;;
import { authOptions } from 'apos;@/app/api/auth/[...nextauth]/route'apos;;
import { MessagingService } from 'apos;@/lib/messaging-service'apos;;

const getEmailConfig = () => ({
  host: process.env.SMTP_HOST || 'apos;smtp.gmail.com'apos;,
  port: parseInt(process.env.SMTP_PORT || 'apos;587'apos;),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || 'apos;support@beriox.ai'apos;,
    pass: process.env.SMTP_PASS || 'apos;'apos;
  }
});

const getMessagingService = () => new MessagingService(getEmailConfig());

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'apos;Non autorisé'apos; }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('apos;category'apos;);

    const messagingService = getMessagingService();
    const templates = await messagingService.getTemplates(category || undefined);
    return NextResponse.json({ templates });

  } catch (error) {
    console.error('apos;Erreur lors de la récupération des templates:'apos;, error);
    return NextResponse.json(
      { error: 'apos;Erreur lors de la récupération des templates'apos; },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'apos;Non autorisé'apos; }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      description,
      subject,
      body: templateBody,
      bodyHtml,
      variables,
      category
    } = body;

    // Validation des données
    if (!name || !subject || !templateBody || !category) {
      return NextResponse.json(
        { error: 'apos;Name, subject, body et category sont requis'apos; },
        { status: 400 }
      );
    }

    const messagingService = getMessagingService();
    const template = await messagingService.createTemplate({
      name,
      description,
      subject,
      body: templateBody,
      bodyHtml,
      variables: variables || [],
      category
    }, session.user.id);

    return NextResponse.json({ template });

  } catch (error) {
    console.error('apos;Erreur lors de la création du template:'apos;, error);
    return NextResponse.json(
      { error: 'apos;Erreur lors de la création du template'apos; },
      { status: 500 }
    );
  }
}
