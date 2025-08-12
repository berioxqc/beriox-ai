"use client"
import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBell,
  faCheck,
  faTimes,
  faInfoCircle,
  faCheckCircle,
  faExclamationTriangle,
  faExclamationCircle,
  faRocket,
  faCreditCard,
  faCog
} from '@fortawesome/free-solid-svg-icons'
import {
  NotificationData,
  NotificationType,
  NotificationPriority,
  notificationManager
} from '@/lib/notifications'
interface NotificationSystemProps {
  className?: string
}

export default function NotificationSystem({ className = '' }: NotificationSystemProps) {
  const { data: session } = useSession()
  const [notifications, setNotifications] = useState<NotificationData[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  // Charger les notifications
  const loadNotifications = useCallback(async () => {
    if (!session?.user?.id) return
    setIsLoading(true)
    try {
      const response = await fetch('/api/notifications?limit=20')
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications)
        setUnreadCount(data.unreadCount)
      }
    } catch (error) {
      console.error('Failed to load notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }, [session?.user?.id])
  // Marquer comme lu
  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId })
      })
      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => 
            n.id === notificationId 
              ? { ...n, readAt: new Date() }
              : n
          )
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }
  // Supprimer une notification
  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId })
      })
      if (response.ok) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId))
        const notification = notifications.find(n => n.id === notificationId)
        if (notification && !notification.readAt) {
          setUnreadCount(prev => Math.max(0, prev - 1))
        }
      }
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  }
  // Marquer toutes comme lues
  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter(n => !n.readAt)
    try {
      await Promise.all(
        unreadNotifications.map(n => markAsRead(n.id))
      )
      setUnreadCount(0)
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }
  // Gérer les actions de notification
  const handleNotificationAction = (action: any, notification: NotificationData) => {
    switch (action.action) {
      case 'navigate':
        if (action.url) {
          window.location.href = action.url
        }
        break
      case 'download':
        if (action.url) {
          window.open(action.url, '_blank')
        }
        break
      case 'retry':
        // Logique de retry spécifique
        console.log('Retry action for notification:', notification.id)
        break
      default:
        console.log('Unknown action:', action.action)
    }

    // Marquer comme lu après action
    markAsRead(notification.id)
  }
  // Obtenir l'icône pour le type de notification
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.INFO:
        return faInfoCircle
      case NotificationType.SUCCESS:
        return faCheckCircle
      case NotificationType.WARNING:
        return faExclamationTriangle
      case NotificationType.ERROR:
        return faExclamationCircle
      case NotificationType.MISSION_COMPLETE:
        return faRocket
      case NotificationType.PAYMENT_SUCCESS:
      case NotificationType.PAYMENT_FAILED:
        return faCreditCard
      case NotificationType.SYSTEM_ALERT:
        return faCog
      default:
        return faInfoCircle
    }
  }
  // Obtenir la couleur pour le type de notification
  const getNotificationColor = (type: NotificationType) => {
    switch (type) {
      case NotificationType.INFO:
        return 'text-blue-600 bg-blue-50 border-blue-200'
      case NotificationType.SUCCESS:
        return 'text-green-600 bg-green-50 border-green-200'
      case NotificationType.WARNING:
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case NotificationType.ERROR:
        return 'text-red-600 bg-red-50 border-red-200'
      case NotificationType.MISSION_COMPLETE:
        return 'text-purple-600 bg-purple-50 border-purple-200'
      case NotificationType.PAYMENT_SUCCESS:
        return 'text-green-600 bg-green-50 border-green-200'
      case NotificationType.PAYMENT_FAILED:
        return 'text-red-600 bg-red-50 border-red-200'
      case NotificationType.SYSTEM_ALERT:
        return 'text-orange-600 bg-orange-50 border-orange-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }
  // Obtenir la couleur pour la priorité
  const getPriorityColor = (priority: NotificationPriority) => {
    switch (priority) {
      case NotificationPriority.LOW:
        return 'bg-gray-100'
      case NotificationPriority.MEDIUM:
        return 'bg-blue-100'
      case NotificationPriority.HIGH:
        return 'bg-yellow-100'
      case NotificationPriority.URGENT:
        return 'bg-red-100'
      default:
        return 'bg-gray-100'
    }
  }
  // Formater la date
  const formatDate = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - new Date(date).getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    if (minutes < 1) return 'À l\'instant'
    if (minutes < 60) return `Il y a ${minutes} min`
    if (hours < 24) return `Il y a ${hours}h`
    if (days < 7) return `Il y a ${days}j`
    return new Date(date).toLocaleDateString('fr-FR')
  }
  // Charger les notifications au montage et quand la session change
  useEffect(() => {
    loadNotifications()
  }, [loadNotifications])
  // S'abonner aux nouvelles notifications
  useEffect(() => {
    if (!session?.user?.id) return
    const unsubscribe = notificationManager.subscribe(session.user.id, (notification) => {
      setNotifications(prev => [notification, ...prev])
      setUnreadCount(prev => prev + 1)
    })
    return unsubscribe
  }, [session?.user?.id])
  if (!session?.user?.id) {
    return null
  }

  return (
    <div className={`relative ${className}`}>
      {/* Bouton de notification */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Notifications"
      >
        <FontAwesomeIcon icon={faBell} className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Panneau de notifications */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Tout marquer comme lu
              </button>
            )}
          </div>

          {/* Liste des notifications */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">
                Chargement...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                Aucune notification
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    !notification.readAt ? 'bg-blue-50' : ''
                  }`}
                >
                  {/* Header de la notification */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <FontAwesomeIcon
                        icon={getNotificationIcon(notification.type)}
                        className={`w-4 h-4 ${getNotificationColor(notification.type).split(' ')[0]}`}
                      />
                      <span className="text-sm font-medium text-gray-900">
                        {notification.title}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(notification.priority)}`}>
                        {notification.priority}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {!notification.readAt && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                          title="Marquer comme lu"
                        >
                          <FontAwesomeIcon icon={faCheck} className="w-3 h-3" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="Supprimer"
                      >
                        <FontAwesomeIcon icon={faTimes} className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Message */}
                  <p className="text-sm text-gray-600 mb-3">
                    {notification.message}
                  </p>

                  {/* Actions */}
                  {notification.actions && notification.actions.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {notification.actions.map((action) => (
                        <button
                          key={action.id}
                          onClick={() => handleNotificationAction(action, notification)}
                          className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Date */}
                  <div className="text-xs text-gray-400">
                    {formatDate(notification.createdAt)}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 text-center">
              <button
                onClick={() => window.location.href = '/notifications'}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Voir toutes les notifications
              </button>
            </div>
          )}
        </div>
      )}

      {/* Overlay pour fermer */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
