import { NextRequest, NextResponse } from 'apos;next/server'apos;;
import { getServerSession } from 'apos;next-auth'apos;;
import { authOptions } from 'apos;@/app/api/auth/[...nextauth]/route'apos;;
import { MessagingService } from 'apos;@/lib/messaging-service'apos;;
import { validateRequest, SendEmailSchema } from 'apos;@/lib/validation-schemas'apos;;
import { errorHandlerMiddleware, AuthenticationError } from 'apos;@/lib/error-handler'apos;;

// Configuration email (à déplacer dans les variables d'apos;environnement)
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

export const POST = errorHandlerMiddleware(async (request: NextRequest) => {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    throw new AuthenticationError('apos;Non autorisé'apos;);
  }

  // Validation des données avec Zod
  const validatedData = await validateRequest(request, SendEmailSchema);
  const {
    subject,
    body: messageBody,
    bodyHtml,
    toEmail,
    toName,
    ccEmails,
    bccEmails,
    templateId,
    variables,
    priority,
    botId,
    ticketId
  } = validatedData;

    // Envoyer l'apos;email
    const messagingService = getMessagingService();
    const result = await messagingService.sendEmail({
      subject,
      body: messageBody,
      bodyHtml,
      fromEmail: process.env.SMTP_USER || 'apos;support@beriox.ai'apos;,
      fromName: 'apos;Beriox AI'apos;,
      toEmail,
      toName,
      ccEmails,
      bccEmails,
      templateId,
      variables,
      priority,
      userId: session.user.id,
      botId,
      ticketId
    });

    return NextResponse.json(result);
});
