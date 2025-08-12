import { logger } from 'apos;./logger'apos;;
import { metrics } from 'apos;./metrics'apos;;

export enum NotificationType {
  INFO = 'apos;info'apos;,
  SUCCESS = 'apos;success'apos;,
  WARNING = 'apos;warning'apos;,
  ERROR = 'apos;error'apos;,
  MISSION_COMPLETE = 'apos;mission_complete'apos;,
  PAYMENT_SUCCESS = 'apos;payment_success'apos;,
  PAYMENT_FAILED = 'apos;payment_failed'apos;,
  SYSTEM_ALERT = 'apos;system_alert'apos;,
  USER_ACTION = 'apos;user_action'apos;
}

export enum NotificationPriority {
  LOW = 'apos;low'apos;,
  MEDIUM = 'apos;medium'apos;,
  HIGH = 'apos;high'apos;,
  URGENT = 'apos;urgent'apos;
}

export interface NotificationData {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  readAt?: Date;
  expiresAt?: Date;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  id: string;
  label: string;
  action: string;
  url?: string;
  data?: Record<string, any>;
}

export interface NotificationTemplate {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  actions?: NotificationAction[];
  ttl?: number; // Time to live en secondes
}

class NotificationManager {
  private notifications: Map<string, NotificationData> = new Map();
  private templates: Map<string, NotificationTemplate> = new Map();
  private subscribers: Map<string, Set<(notification: NotificationData) => void>> = new Map();

  constructor() {
    this.initializeTemplates();
  }

  private initializeTemplates() {
    // Templates pour les missions
    this.templates.set('apos;mission_started'apos;, {
      id: 'apos;mission_started'apos;,
      type: NotificationType.INFO,
      priority: NotificationPriority.MEDIUM,
      title: 'apos;Mission démarrée'apos;,
      message: 'apos;Votre mission "{missionName}" a été lancée avec succès.'apos;,
      actions: [
        {
          id: 'apos;view_mission'apos;,
          label: 'apos;Voir la mission'apos;,
          action: 'apos;navigate'apos;,
          url: 'apos;/missions/{missionId}'apos;
        }
      ],
      ttl: 24 * 60 * 60 // 24 heures
    });

    this.templates.set('apos;mission_completed'apos;, {
      id: 'apos;mission_completed'apos;,
      type: NotificationType.SUCCESS,
      priority: NotificationPriority.HIGH,
      title: 'apos;Mission terminée'apos;,
      message: 'apos;Votre mission "{missionName}" a été complétée avec succès !'apos;,
      actions: [
        {
          id: 'apos;view_results'apos;,
          label: 'apos;Voir les résultats'apos;,
          action: 'apos;navigate'apos;,
          url: 'apos;/missions/{missionId}/results'apos;
        },
        {
          id: 'apos;download_report'apos;,
          label: 'apos;Télécharger le rapport'apos;,
          action: 'apos;download'apos;,
          url: 'apos;/api/missions/{missionId}/report'apos;
        }
      ],
      ttl: 7 * 24 * 60 * 60 // 7 jours
    });

    this.templates.set('apos;mission_failed'apos;, {
      id: 'apos;mission_failed'apos;,
      type: NotificationType.ERROR,
      priority: NotificationPriority.HIGH,
      title: 'apos;Mission échouée'apos;,
      message: 'apos;Votre mission "{missionName}" a échoué. Veuillez réessayer.'apos;,
      actions: [
        {
          id: 'apos;retry_mission'apos;,
          label: 'apos;Réessayer'apos;,
          action: 'apos;retry'apos;,
          url: 'apos;/missions/{missionId}/retry'apos;
        },
        {
          id: 'apos;contact_support'apos;,
          label: 'apos;Contacter le support'apos;,
          action: 'apos;navigate'apos;,
          url: 'apos;/support'apos;
        }
      ],
      ttl: 24 * 60 * 60 // 24 heures
    });

    // Templates pour les paiements
    this.templates.set('apos;payment_success'apos;, {
      id: 'apos;payment_success'apos;,
      type: NotificationType.SUCCESS,
      priority: NotificationPriority.HIGH,
      title: 'apos;Paiement réussi'apos;,
      message: 'apos;Votre paiement de {amount} {currency} a été traité avec succès.'apos;,
      actions: [
        {
          id: 'apos;view_invoice'apos;,
          label: 'apos;Voir la facture'apos;,
          action: 'apos;navigate'apos;,
          url: 'apos;/billing/invoices/{invoiceId}'apos;
        }
      ],
      ttl: 30 * 24 * 60 * 60 // 30 jours
    });

    this.templates.set('apos;payment_failed'apos;, {
      id: 'apos;payment_failed'apos;,
      type: NotificationType.ERROR,
      priority: NotificationPriority.URGENT,
      title: 'apos;Échec du paiement'apos;,
      message: 'apos;Votre paiement de {amount} {currency} a échoué. Veuillez vérifier vos informations.'apos;,
      actions: [
        {
          id: 'apos;update_payment'apos;,
          label: 'apos;Mettre à jour le paiement'apos;,
          action: 'apos;navigate'apos;,
          url: 'apos;/billing/payment-methods'apos;
        },
        {
          id: 'apos;contact_support'apos;,
          label: 'apos;Contacter le support'apos;,
          action: 'apos;navigate'apos;,
          url: 'apos;/support'apos;
        }
      ],
      ttl: 7 * 24 * 60 * 60 // 7 jours
    });

    // Templates pour les crédits
    this.templates.set('apos;credits_low'apos;, {
      id: 'apos;credits_low'apos;,
      type: NotificationType.WARNING,
      priority: NotificationPriority.MEDIUM,
      title: 'apos;Crédits faibles'apos;,
      message: 'apos;Il vous reste {credits} crédits. Pensez à recharger votre compte.'apos;,
      actions: [
        {
          id: 'apos;buy_credits'apos;,
          label: 'apos;Acheter des crédits'apos;,
          action: 'apos;navigate'apos;,
          url: 'apos;/pricing'apos;
        }
      ],
      ttl: 7 * 24 * 60 * 60 // 7 jours
    });

    this.templates.set('apos;credits_depleted'apos;, {
      id: 'apos;credits_depleted'apos;,
      type: NotificationType.ERROR,
      priority: NotificationPriority.HIGH,
      title: 'apos;Crédits épuisés'apos;,
      message: 'apos;Vous n\'apos;avez plus de crédits. Rechargez votre compte pour continuer.'apos;,
      actions: [
        {
          id: 'apos;buy_credits'apos;,
          label: 'apos;Acheter des crédits'apos;,
          action: 'apos;navigate'apos;,
          url: 'apos;/pricing'apos;
        }
      ],
      ttl: 30 * 24 * 60 * 60 // 30 jours
    });

    // Templates système
    this.templates.set('apos;system_maintenance'apos;, {
      id: 'apos;system_maintenance'apos;,
      type: NotificationType.WARNING,
      priority: NotificationPriority.HIGH,
      title: 'apos;Maintenance système'apos;,
      message: 'apos;Une maintenance est prévue le {date} à {time}. Le service sera temporairement indisponible.'apos;,
      ttl: 24 * 60 * 60 // 24 heures
    });

    this.templates.set('apos;new_feature'apos;, {
      id: 'apos;new_feature'apos;,
      type: NotificationType.INFO,
      priority: NotificationPriority.MEDIUM,
      title: 'apos;Nouvelle fonctionnalité'apos;,
      message: 'apos;Découvrez notre nouvelle fonctionnalité : {featureName}'apos;,
      actions: [
        {
          id: 'apos;learn_more'apos;,
          label: 'apos;En savoir plus'apos;,
          action: 'apos;navigate'apos;,
          url: 'apos;/features/{featureId}'apos;
        }
      ],
      ttl: 7 * 24 * 60 * 60 // 7 jours
    });
  }

  // Créer une notification à partir d'apos;un template
  createFromTemplate(
    templateId: string,
    userId: string,
    sessionId?: string,
    variables: Record<string, string> = {}
  ): NotificationData | null {
    const template = this.templates.get(templateId);
    if (!template) {
      logger.error(`Notification template not found: ${templateId}`, null, {
        action: 'apos;notification_template_missing'apos;,
        metadata: { templateId, userId }
      });
      return null;
    }

    const notification: NotificationData = {
      id: this.generateId(),
      type: template.type,
      priority: template.priority,
      title: this.replaceVariables(template.title, variables),
      message: this.replaceVariables(template.message, variables),
      userId,
      sessionId,
      metadata: { templateId, variables },
      createdAt: new Date(),
      actions: template.actions?.map(action => ({
        ...action,
        url: action.url ? this.replaceVariables(action.url, variables) : undefined
      })),
      expiresAt: template.ttl ? new Date(Date.now() + template.ttl * 1000) : undefined
    };

    this.addNotification(notification);
    return notification;
  }

  // Créer une notification personnalisée
  createCustom(
    type: NotificationType,
    priority: NotificationPriority,
    title: string,
    message: string,
    userId?: string,
    sessionId?: string,
    metadata?: Record<string, any>,
    actions?: NotificationAction[]
  ): NotificationData {
    const notification: NotificationData = {
      id: this.generateId(),
      type,
      priority,
      title,
      message,
      userId,
      sessionId,
      metadata,
      createdAt: new Date(),
      actions
    };

    this.addNotification(notification);
    return notification;
  }

  // Ajouter une notification
  private addNotification(notification: NotificationData) {
    this.notifications.set(notification.id, notification);

    // Notifier les abonnés
    this.notifySubscribers(notification);

    // Logger la notification
    logger.info(`Notification created: ${notification.title}`, {
      action: 'apos;notification_created'apos;,
      metadata: {
        id: notification.id,
        type: notification.type,
        priority: notification.priority,
        userId: notification.userId
      }
    });

    // Enregistrer la métrique
    metrics.increment('apos;notification_created'apos;, 1, {
      type: notification.type,
      priority: notification.priority
    });

    // Nettoyer les notifications expirées
    this.cleanupExpired();
  }

  // Marquer une notification comme lue
  markAsRead(notificationId: string, userId?: string): boolean {
    const notification = this.notifications.get(notificationId);
    if (!notification) {
      return false;
    }

    // Vérifier que l'apos;utilisateur peut lire cette notification
    if (userId && notification.userId && notification.userId !== userId) {
      return false;
    }

    notification.readAt = new Date();
    this.notifications.set(notificationId, notification);

    logger.info(`Notification marked as read: ${notificationId}`, {
      action: 'apos;notification_read'apos;,
      metadata: { notificationId, userId }
    });

    metrics.increment('apos;notification_read'apos;, 1, {
      type: notification.type,
      priority: notification.priority
    });

    return true;
  }

  // Supprimer une notification
  deleteNotification(notificationId: string, userId?: string): boolean {
    const notification = this.notifications.get(notificationId);
    if (!notification) {
      return false;
    }

    // Vérifier que l'apos;utilisateur peut supprimer cette notification
    if (userId && notification.userId && notification.userId !== userId) {
      return false;
    }

    this.notifications.delete(notificationId);

    logger.info(`Notification deleted: ${notificationId}`, {
      action: 'apos;notification_deleted'apos;,
      metadata: { notificationId, userId }
    });

    metrics.increment('apos;notification_deleted'apos;, 1, {
      type: notification.type,
      priority: notification.priority
    });

    return true;
  }

  // Récupérer les notifications d'apos;un utilisateur
  getUserNotifications(
    userId: string,
    options: {
      unreadOnly?: boolean;
      limit?: number;
      offset?: number;
      type?: NotificationType;
      priority?: NotificationPriority;
    } = {}
  ): NotificationData[] {
    const {
      unreadOnly = false,
      limit = 50,
      offset = 0,
      type,
      priority
    } = options;

    let notifications = Array.from(this.notifications.values())
      .filter(n => n.userId === userId)
      .filter(n => !unreadOnly || !n.readAt)
      .filter(n => !type || n.type === type)
      .filter(n => !priority || n.priority === priority)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return notifications.slice(offset, offset + limit);
  }

  // Récupérer les notifications d'apos;une session
  getSessionNotifications(sessionId: string): NotificationData[] {
    return Array.from(this.notifications.values())
      .filter(n => n.sessionId === sessionId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Compter les notifications non lues
  getUnreadCount(userId: string): number {
    return Array.from(this.notifications.values())
      .filter(n => n.userId === userId && !n.readAt)
      .length;
  }

  // S'apos;abonner aux notifications
  subscribe(userId: string, callback: (notification: NotificationData) => void): () => void {
    if (!this.subscribers.has(userId)) {
      this.subscribers.set(userId, new Set());
    }

    this.subscribers.get(userId)!.add(callback);

    // Retourner une fonction pour se désabonner
    return () => {
      const userSubscribers = this.subscribers.get(userId);
      if (userSubscribers) {
        userSubscribers.delete(callback);
        if (userSubscribers.size === 0) {
          this.subscribers.delete(userId);
        }
      }
    };
  }

  // Notifier les abonnés
  private notifySubscribers(notification: NotificationData) {
    if (notification.userId) {
      const userSubscribers = this.subscribers.get(notification.userId);
      if (userSubscribers) {
        userSubscribers.forEach(callback => {
          try {
            callback(notification);
          } catch (error) {
            logger.error('apos;Error in notification callback'apos;, error as Error, {
              action: 'apos;notification_callback_error'apos;,
              metadata: { notificationId: notification.id, userId: notification.userId }
            });
          }
        });
      }
    }
  }

  // Nettoyer les notifications expirées
  private cleanupExpired() {
    const now = new Date();
    const expiredIds: string[] = [];

    for (const [id, notification] of this.notifications.entries()) {
      if (notification.expiresAt && notification.expiresAt < now) {
        expiredIds.push(id);
      }
    }

    expiredIds.forEach(id => {
      this.notifications.delete(id);
    });

    if (expiredIds.length > 0) {
      logger.info(`Cleaned up ${expiredIds.length} expired notifications`, {
        action: 'apos;notification_cleanup'apos;,
        metadata: { expiredCount: expiredIds.length }
      });
    }
  }

  // Remplacer les variables dans un template
  private replaceVariables(text: string, variables: Record<string, string>): string {
    return text.replace(/\{(\w+)\}/g, (match, key) => {
      return variables[key] || match;
    });
  }

  // Générer un ID unique
  private generateId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Obtenir les statistiques
  getStats() {
    const notifications = Array.from(this.notifications.values());
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    return {
      total: notifications.length,
      unread: notifications.filter(n => !n.readAt).length,
      today: notifications.filter(n => n.createdAt >= oneDayAgo).length,
      thisWeek: notifications.filter(n => n.createdAt >= oneWeekAgo).length,
      byType: Object.values(NotificationType).reduce((acc, type) => {
        acc[type] = notifications.filter(n => n.type === type).length;
        return acc;
      }, {} as Record<string, number>),
      byPriority: Object.values(NotificationPriority).reduce((acc, priority) => {
        acc[priority] = notifications.filter(n => n.priority === priority).length;
        return acc;
      }, {} as Record<string, number>)
    };
  }
}

// Instance globale
export const notificationManager = new NotificationManager();

// Fonctions utilitaires
export const createNotification = {
  missionStarted: (userId: string, missionName: string, missionId: string) => {
    return notificationManager.createFromTemplate('apos;mission_started'apos;, userId, undefined, {
      missionName,
      missionId
    });
  },

  missionCompleted: (userId: string, missionName: string, missionId: string) => {
    return notificationManager.createFromTemplate('apos;mission_completed'apos;, userId, undefined, {
      missionName,
      missionId
    });
  },

  missionFailed: (userId: string, missionName: string, missionId: string) => {
    return notificationManager.createFromTemplate('apos;mission_failed'apos;, userId, undefined, {
      missionName,
      missionId
    });
  },

  paymentSuccess: (userId: string, amount: string, currency: string, invoiceId: string) => {
    return notificationManager.createFromTemplate('apos;payment_success'apos;, userId, undefined, {
      amount,
      currency,
      invoiceId
    });
  },

  paymentFailed: (userId: string, amount: string, currency: string) => {
    return notificationManager.createFromTemplate('apos;payment_failed'apos;, userId, undefined, {
      amount,
      currency
    });
  },

  creditsLow: (userId: string, credits: string) => {
    return notificationManager.createFromTemplate('apos;credits_low'apos;, userId, undefined, {
      credits
    });
  },

  creditsDepleted: (userId: string) => {
    return notificationManager.createFromTemplate('apos;credits_depleted'apos;, userId);
  },

  systemMaintenance: (userId: string, date: string, time: string) => {
    return notificationManager.createFromTemplate('apos;system_maintenance'apos;, userId, undefined, {
      date,
      time
    });
  },

  newFeature: (userId: string, featureName: string, featureId: string) => {
    return notificationManager.createFromTemplate('apos;new_feature'apos;, userId, undefined, {
      featureName,
      featureId
    });
  }
};
