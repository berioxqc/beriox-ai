import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { notificationManager } from '@/lib/notifications'
import { logger } from '@/lib/logger'
import { withRateLimit } from '@/lib/rate-limit-advanced'
// GET - Récupérer les notifications de l'utilisateur
async function getNotifications(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const unreadOnly = searchParams.get('unreadOnly') === 'true'
  const limit = parseInt(searchParams.get('limit') || '50')
  const offset = parseInt(searchParams.get('offset') || '0')
  const type = searchParams.get('type') || undefined
  const priority = searchParams.get('priority') || undefined
  try {
    const notifications = notificationManager.getUserNotifications(session.user.id, {
      unreadOnly,
      limit,
      offset,
      type: type as any,
      priority: priority as any
    })
    const unreadCount = notificationManager.getUnreadCount(session.user.id)
    logger.info('Notifications retrieved', {
      action: 'notifications_retrieved',
      metadata: {
        userId: session.user.id,
        count: notifications.length,
        unreadCount,
        filters: { unreadOnly, type, priority }
      }
    })
    return NextResponse.json({
      notifications,
      unreadCount,
      total: notifications.length
    })
  } catch (error) {
    logger.error('Failed to retrieve notifications', error as Error, {
      action: 'notifications_retrieve_error',
      metadata: { userId: session.user.id }
    })
    return NextResponse.json(
      { error: 'Failed to retrieve notifications' },
      { status: 500 }
    )
  }
}

// POST - Créer une notification personnalisée
async function createNotification(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const {
      type,
      priority,
      title,
      message,
      metadata,
      actions
    } = body
    if (!type || !priority || !title || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const notification = notificationManager.createCustom(
      type,
      priority,
      title,
      message,
      session.user.id,
      undefined,
      metadata,
      actions
    )
    logger.info('Custom notification created', {
      action: 'notification_custom_created',
      metadata: {
        userId: session.user.id,
        notificationId: notification.id,
        type,
        priority
      }
    })
    return NextResponse.json({ notification }, { status: 201 })
  } catch (error) {
    logger.error('Failed to create notification', error as Error, {
      action: 'notification_create_error',
      metadata: { userId: session.user.id }
    })
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    )
  }
}

// PUT - Marquer une notification comme lue
async function markAsRead(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { notificationId } = body
    if (!notificationId) {
      return NextResponse.json(
        { error: 'Notification ID is required' },
        { status: 400 }
      )
    }

    const success = notificationManager.markAsRead(notificationId, session.user.id)
    if (!success) {
      return NextResponse.json(
        { error: 'Notification not found or access denied' },
        { status: 404 }
      )
    }

    logger.info('Notification marked as read', {
      action: 'notification_marked_read',
      metadata: {
        userId: session.user.id,
        notificationId
      }
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Failed to mark notification as read', error as Error, {
      action: 'notification_mark_read_error',
      metadata: { userId: session.user.id }
    })
    return NextResponse.json(
      { error: 'Failed to mark notification as read' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer une notification
async function deleteNotification(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { notificationId } = body
    if (!notificationId) {
      return NextResponse.json(
        { error: 'Notification ID is required' },
        { status: 400 }
      )
    }

    const success = notificationManager.deleteNotification(notificationId, session.user.id)
    if (!success) {
      return NextResponse.json(
        { error: 'Notification not found or access denied' },
        { status: 404 }
      )
    }

    logger.info('Notification deleted', {
      action: 'notification_deleted',
      metadata: {
        userId: session.user.id,
        notificationId
      }
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Failed to delete notification', error as Error, {
      action: 'notification_delete_error',
      metadata: { userId: session.user.id }
    })
    return NextResponse.json(
      { error: 'Failed to delete notification' },
      { status: 500 }
    )
  }
}

// Handler principal avec rate limiting
export const GET = withRateLimit(getNotifications, 'notifications')
export const POST = withRateLimit(createNotification, 'notifications')
export const PUT = withRateLimit(markAsRead, 'notifications')
export const DELETE = withRateLimit(deleteNotification, 'notifications')