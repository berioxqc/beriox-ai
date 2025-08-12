import { prisma } from './prisma';
import nodemailer from 'nodemailer';

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export interface MessageData {
  subject: string;
  body: string;
  bodyHtml?: string;
  fromEmail: string;
  fromName?: string;
  toEmail: string;
  toName?: string;
  ccEmails?: string[];
  bccEmails?: string[];
  templateId?: string;
  variables?: Record<string, any>;
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  userId?: string;
  botId?: string;
  ticketId?: string;
}

export interface TemplateData {
  name: string;
  description?: string;
  subject: string;
  body: string;
  bodyHtml?: string;
  variables: string[];
  category: string;
}

export class MessagingService {
  private transporter: nodemailer.Transporter;

  constructor(config: EmailConfig) {
    this.transporter = nodemailer.createTransporter(config);
  }

  /**
   * Envoyer un email
   */
  async sendEmail(messageData: MessageData): Promise<any> {
    try {
      // Remplacer les variables dans le template si fourni
      let { subject, body, bodyHtml } = messageData;
      
      if (messageData.templateId && messageData.variables) {
        const template = await this.getTemplate(messageData.templateId);
        if (template) {
          subject = this.replaceVariables(template.subject, messageData.variables);
          body = this.replaceVariables(template.body, messageData.variables);
          if (template.bodyHtml) {
            bodyHtml = this.replaceVariables(template.bodyHtml, messageData.variables);
          }
        }
      }

      // Préparer les options d'envoi
      const mailOptions = {
        from: `"${messageData.fromName || 'Beriox AI'}" <${messageData.fromEmail}>`,
        to: messageData.toEmail,
        cc: messageData.ccEmails?.join(', '),
        bcc: messageData.bccEmails?.join(', '),
        subject,
        text: body,
        html: bodyHtml,
        priority: messageData.priority?.toLowerCase(),
        headers: {
          'X-Beriox-Message-Type': 'outbound',
          'X-Beriox-User-ID': messageData.userId || '',
          'X-Beriox-Bot-ID': messageData.botId || '',
        }
      };

      // Envoyer l'email
      const result = await this.transporter.sendMail(mailOptions);

      // Sauvegarder le message en base
      const message = await prisma.message.create({
        data: {
          type: 'OUTBOUND',
          status: 'SENT',
          priority: messageData.priority || 'NORMAL',
          subject,
          body,
          bodyHtml,
          fromEmail: messageData.fromEmail,
          fromName: messageData.fromName,
          toEmail: messageData.toEmail,
          toName: messageData.toName,
          ccEmails: messageData.ccEmails || [],
          bccEmails: messageData.bccEmails || [],
          messageId: result.messageId,
          templateId: messageData.templateId,
          userId: messageData.userId,
          botId: messageData.botId,
          ticketId: messageData.ticketId,
          sentAt: new Date(),
          deliveredAt: new Date(),
          metadata: {
            messageId: result.messageId,
            response: result.response,
            accepted: result.accepted,
            rejected: result.rejected,
            pending: result.pending,
          }
        }
      });

      console.log(`✅ Email envoyé: ${message.id} -> ${messageData.toEmail}`);
      return { success: true, messageId: message.id, emailId: result.messageId };

    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi d\'email:', error);
      
      // Sauvegarder l'erreur en base
      if (messageData.userId) {
        await prisma.message.create({
          data: {
            type: 'OUTBOUND',
            status: 'FAILED',
            priority: messageData.priority || 'NORMAL',
            subject: messageData.subject,
            body: messageData.body,
            bodyHtml: messageData.bodyHtml,
            fromEmail: messageData.fromEmail,
            fromName: messageData.fromName,
            toEmail: messageData.toEmail,
            toName: messageData.toName,
            ccEmails: messageData.ccEmails || [],
            bccEmails: messageData.bccEmails || [],
            userId: messageData.userId,
            botId: messageData.botId,
            ticketId: messageData.ticketId,
            metadata: { error: error.message }
          }
        });
      }

      throw error;
    }
  }

  /**
   * Créer un template d'email
   */
  async createTemplate(templateData: TemplateData, createdBy?: string): Promise<any> {
    try {
      const template = await prisma.emailTemplate.create({
        data: {
          name: templateData.name,
          description: templateData.description,
          subject: templateData.subject,
          body: templateData.body,
          bodyHtml: templateData.bodyHtml,
          variables: templateData.variables,
          category: templateData.category,
          createdBy
        }
      });

      console.log(`✅ Template créé: ${template.id} - ${template.name}`);
      return template;
    } catch (error) {
      console.error('❌ Erreur lors de la création du template:', error);
      throw error;
    }
  }

  /**
   * Obtenir un template par ID
   */
  async getTemplate(templateId: string): Promise<any> {
    return await prisma.emailTemplate.findUnique({
      where: { id: templateId }
    });
  }

  /**
   * Obtenir tous les templates
   */
  async getTemplates(category?: string): Promise<any[]> {
    const where = category ? { category, isActive: true } : { isActive: true };
    
    return await prisma.emailTemplate.findMany({
      where,
      orderBy: { name: 'asc' }
    });
  }

  /**
   * Créer un ticket de support
   */
  async createSupportTicket(data: {
    userId: string;
    subject: string;
    description: string;
    category: 'TECHNICAL' | 'BILLING' | 'FEATURE_REQUEST' | 'BUG_REPORT' | 'GENERAL' | 'FEEDBACK';
    priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  }): Promise<any> {
    try {
      // Générer un numéro de ticket unique
      const ticketNumber = await this.generateTicketNumber();

      const ticket = await prisma.supportTicket.create({
        data: {
          ticketNumber,
          subject: data.subject,
          description: data.description,
          category: data.category,
          priority: data.priority || 'NORMAL',
          userId: data.userId
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      console.log(`✅ Ticket créé: ${ticket.ticketNumber} - ${ticket.subject}`);
      return ticket;
    } catch (error) {
      console.error('❌ Erreur lors de la création du ticket:', error);
      throw error;
    }
  }

  /**
   * Obtenir les messages d'un utilisateur
   */
  async getUserMessages(userId: string, filters?: {
    type?: 'INBOUND' | 'OUTBOUND' | 'INTERNAL' | 'SUPPORT';
    status?: 'DRAFT' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED' | 'PENDING';
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    const where: unknown = { userId };
    
    if (filters?.type) where.type = filters.type;
    if (filters?.status) where.status = filters.status;

    return await prisma.message.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: filters?.limit || 50,
      skip: filters?.offset || 0,
      include: {
        ticket: {
          select: {
            id: true,
            ticketNumber: true,
            subject: true,
            status: true
          }
        },
        bot: {
          select: {
            id: true,
            name: true,
            type: true
          }
        }
      }
    });
  }

  /**
   * Obtenir les tickets de support
   */
  async getSupportTickets(filters?: {
    status?: 'OPEN' | 'IN_PROGRESS' | 'WAITING_FOR_USER' | 'RESOLVED' | 'CLOSED';
    priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
    category?: 'TECHNICAL' | 'BILLING' | 'FEATURE_REQUEST' | 'BUG_REPORT' | 'GENERAL' | 'FEEDBACK';
    assignedTo?: string;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    const where: unknown = {};
    
    if (filters?.status) where.status = filters.status;
    if (filters?.priority) where.priority = filters.priority;
    if (filters?.category) where.category = filters.category;
    if (filters?.assignedTo) where.assignedTo = filters.assignedTo;

    return await prisma.supportTicket.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: filters?.limit || 50,
      skip: filters?.offset || 0,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 1 // Dernier message
        }
      }
    });
  }

  /**
   * Répondre à un ticket
   */
  async replyToTicket(ticketId: string, data: {
    userId: string;
    body: string;
    bodyHtml?: string;
    isInternal?: boolean;
  }): Promise<any> {
    try {
      const ticket = await prisma.supportTicket.findUnique({
        where: { id: ticketId },
        include: { user: true }
      });

      if (!ticket) {
        throw new Error('Ticket non trouvé');
      }

      // Créer le message de réponse
      const message = await prisma.message.create({
        data: {
          type: data.isInternal ? 'INTERNAL' : 'SUPPORT',
          status: 'SENT',
          priority: ticket.priority,
          subject: `Re: ${ticket.subject}`,
          body: data.body,
          bodyHtml: data.bodyHtml,
          fromEmail: data.isInternal ? 'support@beriox.ai' : ticket.user.email,
          fromName: data.isInternal ? 'Support Beriox' : ticket.user.name,
          toEmail: data.isInternal ? ticket.user.email : 'support@beriox.ai',
          toName: data.isInternal ? ticket.user.name : 'Support Beriox',
          userId: data.userId,
          ticketId: ticketId,
          sentAt: new Date(),
          deliveredAt: new Date()
        }
      });

      // Mettre à jour le statut du ticket
      const newStatus = data.isInternal ? 'IN_PROGRESS' : 'WAITING_FOR_USER';
      await prisma.supportTicket.update({
        where: { id: ticketId },
        data: { 
          status: newStatus,
          updatedAt: new Date()
        }
      });

      console.log(`✅ Réponse au ticket ${ticket.ticketNumber}: ${message.id}`);
      return message;
    } catch (error) {
      console.error('❌ Erreur lors de la réponse au ticket:', error);
      throw error;
    }
  }

  /**
   * Générer un numéro de ticket unique
   */
  private async generateTicketNumber(): Promise<string> {
    const prefix = 'BER';
    const date = new Date().toISOString().slice(2, 8).replace(/-/g, ''); // YYMMDD
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}${date}${random}`;
  }

  /**
   * Remplacer les variables dans un template
   */
  private replaceVariables(text: string, variables: Record<string, any>): string {
    let result = text;
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      result = result.replace(regex, String(value));
    });
    return result;
  }

  /**
   * Obtenir les statistiques de messagerie
   */
  async getMessagingStats(): Promise<any> {
    const [
      totalMessages,
      sentMessages,
      failedMessages,
      totalTickets,
      openTickets,
      resolvedTickets
    ] = await Promise.all([
      prisma.message.count(),
      prisma.message.count({ where: { status: 'SENT' } }),
      prisma.message.count({ where: { status: 'FAILED' } }),
      prisma.supportTicket.count(),
      prisma.supportTicket.count({ where: { status: 'OPEN' } }),
      prisma.supportTicket.count({ where: { status: 'RESOLVED' } })
    ]);

    return {
      messages: {
        total: totalMessages,
        sent: sentMessages,
        failed: failedMessages,
        successRate: totalMessages > 0 ? ((sentMessages / totalMessages) * 100).toFixed(2) : 0
      },
      tickets: {
        total: totalTickets,
        open: openTickets,
        resolved: resolvedTickets,
        resolutionRate: totalTickets > 0 ? ((resolvedTickets / totalTickets) * 100).toFixed(2) : 0
      }
    };
  }
}
