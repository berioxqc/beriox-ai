import { logger } from './logger';
import { metrics } from './metrics';

export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  MISSION_COMPLETE = 'mission_complete',
  PAYMENT_SUCCESS = 'payment_success',
  PAYMENT_FAILED = 'payment_failed',
  SYSTEM_ALERT = 'system_alert',
  USER_ACTION = 'user_action'
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
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
    this.templates.set('mission_started', {
      id: 'mission_started',
      type: NotificationType.INFO,
      priority: NotificationPriority.MEDIUM,
      title: 'Mission démarrée',
      message: 'Votre mission "{missionName}" a été lancée avec succès.',
      actions: [
        {
          id: 'view_mission',
          label: 'Voir la mission',
          action: 'navigate',
          url: '/missions/{missionId}'
        }
      ],
      ttl: 24 * 60 * 60 // 24 heures
    });

    this.templates.set('mission_completed', {
      id: 'mission_completed',
      type: NotificationType.SUCCESS,
      priority: NotificationPriority.HIGH,
      title: 'Mission terminée',
      message: 'Votre mission "{missionName}" a été complétée avec succès !',
      actions: [
        {
          id: 'view_results',
          label: 'Voir les résultats',
          action: 'navigate',
          url: '/missions/{missionId}/results'
        },
        {
          id: 'download_report',
          label: 'Télécharger le rapport',
          action: 'download',
          url: '/api/missions/{missionId}/report'
        }
      ],
      ttl: 7 * 24 * 60 * 60 // 7 jours
    });

    this.templates.set('mission_failed', {
      id: 'mission_failed',
      type: NotificationType.ERROR,
      priority: NotificationPriority.HIGH,
      title: 'Mission échouée',
      message: 'Votre mission "{missionName}" a échoué. Veuillez réessayer.',
      actions: [
        {
          id: 'retry_mission',
          label: 'Réessayer',
          action: 'retry',
          url: '/missions/{missionId}/retry'
        },
        {
          id: 'contact_support',
          label: 'Contacter le support',
          action: 'navigate',
          url: '/support'
        }
      ],
      ttl: 24 * 60 * 60 // 24 heures
    });

    // Templates pour les paiements
    this.templates.set('payment_success', {
      id: 'payment_success',
      type: NotificationType.SUCCESS,
      priority: NotificationPriority.HIGH,
      title: 'Paiement réussi',
      message: 'Votre paiement de {amount} {currency} a été traité avec succès.',
      actions: [
        {
          id: 'view_invoice',
          label: 'Voir la facture',
          action: 'navigate',
          url: '/billing/invoices/{invoiceId}'
        }
      ],
      ttl: 30 * 24 * 60 * 60 // 30 jours
    });

    this.templates.set('payment_failed', {
      id: 'payment_failed',
      type: NotificationType.ERROR,
      priority: NotificationPriority.URGENT,
      title: 'Échec du paiement',
      message: 'Votre paiement de {amount} {currency} a échoué. Veuillez vérifier vos informations.',
      actions: [
        {
          id: 'update_payment',
          label: 'Mettre à jour le paiement',
          action: 'navigate',
          url: '/billing/payment-methods'
        },
        {
          id: 'contact_support',
          label: 'Contacter le support',
          action: 'navigate',
          url: '/support'
        }
      ],
      ttl: 7 * 24 * 60 * 60 // 7 jours
    });

    // Templates pour les crédits
    this.templates.set('credits_low', {
      id: 'credits_low',
      type: NotificationType.WARNING,
      priority: NotificationPriority.MEDIUM,
      title: 'Crédits faibles',
      message: 'Il vous reste {credits} crédits. Pensez à recharger votre compte.',
      actions: [
        {
          id: 'buy_credits',
          label: 'Acheter des crédits',
          action: 'navigate',
          url: '/pricing'
        }
      ],
      ttl: 7 * 24 * 60 * 60 // 7 jours
    });

    this.templates.set('credits_depleted', {
      id: 'credits_depleted',
      type: NotificationType.ERROR,
      priority: NotificationPriority.HIGH,
      title: 'Crédits épuisés',
      message: 'Vous n\'avez plus de crédits. Rechargez votre compte pour continuer.',
      actions: [
        {
          id: 'buy_credits',
          label: 'Acheter des crédits',
          action: 'navigate',
          url: '/pricing'
        }
      ],
      ttl: 30 * 24 * 60 * 60 // 30 jours
    });

    // Templates système
    this.templates.set('system_maintenance', {
      id: 'system_maintenance',
      type: NotificationType.WARNING,
      priority: NotificationPriority.HIGH,
      title: 'Maintenance système',
      message: 'Une maintenance est prévue le {date} à {time}. Le service sera temporairement indisponible.',
      ttl: 24 * 60 * 60 // 24 heures
    });

    this.templates.set('new_feature', {
      id: 'new_feature',
      type: NotificationType.INFO,
      priority: NotificationPriority.MEDIUM,
      title: 'Nouvelle fonctionnalité',
      message: 'Découvrez notre nouvelle fonctionnalité : {featureName}',
      actions: [
        {
          id: 'learn_more',
          label: 'En savoir plus',
          action: 'navigate',
          url: '/features/{featureId}'
        }
      ],
      ttl: 7 * 24 * 60 * 60 // 7 jours
    });
  }

  // Créer une notification à partir d'un template
  createFromTemplate(
    templateId: string,
    userId: string,
    sessionId?: string,
    variables: Record<string, string> = {}
  ): NotificationData | null {
    const template = this.templates.get(templateId);
    if (!template) {
      logger.error(`Notification template not found: ${templateId}`, null, {
        action: 'notification_template_missing',
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
      action: 'notification_created',
      metadata: {
        id: notification.id,
        type: notification.type,
        priority: notification.priority,
        userId: notification.userId
      }
    });

    // Enregistrer la métrique
    metrics.increment('notification_created', 1, {
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

    // Vérifier que l'utilisateur peut lire cette notification
    if (userId && notification.userId && notification.userId !== userId) {
      return false;
    }

    notification.readAt = new Date();
    this.notifications.set(notificationId, notification);

    logger.info(`Notification marked as read: ${notificationId}`, {
      action: 'notification_read',
      metadata: { notificationId, userId }
    });

    metrics.increment('notification_read', 1, {
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

    // Vérifier que l'utilisateur peut supprimer cette notification
    if (userId && notification.userId && notification.userId !== userId) {
      return false;
    }

    this.notifications.delete(notificationId);

    logger.info(`Notification deleted: ${notificationId}`, {
      action: 'notification_deleted',
      metadata: { notificationId, userId }
    });

    metrics.increment('notification_deleted', 1, {
      type: notification.type,
      priority: notification.priority
    });

    return true;
  }

  // Récupérer les notifications d'un utilisateur
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

  // Récupérer les notifications d'une session
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

  // S'abonner aux notifications
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
            logger.error('Error in notification callback', error as Error, {
              action: 'notification_callback_error',
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
        action: 'notification_cleanup',
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
    return notificationManager.createFromTemplate('mission_started', userId, undefined, {
      missionName,
      missionId
    });
  },

  missionCompleted: (userId: string, missionName: string, missionId: string) => {
    return notificationManager.createFromTemplate('mission_completed', userId, undefined, {
      missionName,
      missionId
    });
  },

  missionFailed: (userId: string, missionName: string, missionId: string) => {
    return notificationManager.createFromTemplate('mission_failed', userId, undefined, {
      missionName,
      missionId
    });
  },

  paymentSuccess: (userId: string, amount: string, currency: string, invoiceId: string) => {
    return notificationManager.createFromTemplate('payment_success', userId, undefined, {
      amount,
      currency,
      invoiceId
    });
  },

  paymentFailed: (userId: string, amount: string, currency: string) => {
    return notificationManager.createFromTemplate('payment_failed', userId, undefined, {
      amount,
      currency
    });
  },

  creditsLow: (userId: string, credits: string) => {
    return notificationManager.createFromTemplate('credits_low', userId, undefined, {
      credits
    });
  },

  creditsDepleted: (userId: string) => {
    return notificationManager.createFromTemplate('credits_depleted', userId);
  },

  systemMaintenance: (userId: string, date: string, time: string) => {
    return notificationManager.createFromTemplate('system_maintenance', userId, undefined, {
      date,
      time
    });
  },

  newFeature: (userId: string, featureName: string, featureId: string) => {
    return notificationManager.createFromTemplate('new_feature', userId, undefined, {
      featureName,
      featureId
    });
  }
};
