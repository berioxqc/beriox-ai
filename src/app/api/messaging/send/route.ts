import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { MessagingService } from '@/lib/messaging-service';
import { validateRequest, SendEmailSchema } from '@/lib/validation-schemas';
import { errorHandlerMiddleware, AuthenticationError } from '@/lib/error-handler';

// Configuration email (à déplacer dans les variables d'environnement)
const getEmailConfig = () => ({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || 'support@beriox.ai',
    pass: process.env.SMTP_PASS || ''
  }
});

const getMessagingService = () => new MessagingService(getEmailConfig());

export const POST = errorHandlerMiddleware(async (request: NextRequest) => {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    throw new AuthenticationError('Non autorisé');
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

    // Envoyer l'email
    const messagingService = getMessagingService();
    const result = await messagingService.sendEmail({
      subject,
      body: messageBody,
      bodyHtml,
      fromEmail: process.env.SMTP_USER || 'support@beriox.ai',
      fromName: 'Beriox AI',
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
