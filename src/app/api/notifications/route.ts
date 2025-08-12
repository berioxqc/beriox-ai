import { NextRequest, NextResponse } from 'apos;next/server'apos;;
import { getServerSession } from 'apos;next-auth'apos;;
import { authOptions } from 'apos;@/lib/auth'apos;;
import { notificationManager } from 'apos;@/lib/notifications'apos;;
import { logger } from 'apos;@/lib/logger'apos;;
import { withRateLimit } from 'apos;@/lib/rate-limit-advanced'apos;;

// GET - Récupérer les notifications de l'apos;utilisateur
async function getNotifications(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'apos;Unauthorized'apos; }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const unreadOnly = searchParams.get('apos;unreadOnly'apos;) === 'apos;true'apos;;
  const limit = parseInt(searchParams.get('apos;limit'apos;) || 'apos;50'apos;);
  const offset = parseInt(searchParams.get('apos;offset'apos;) || 'apos;0'apos;);
  const type = searchParams.get('apos;type'apos;) || undefined;
  const priority = searchParams.get('apos;priority'apos;) || undefined;

  try {
    const notifications = notificationManager.getUserNotifications(session.user.id, {
      unreadOnly,
      limit,
      offset,
      type: type as any,
      priority: priority as any
    });

    const unreadCount = notificationManager.getUnreadCount(session.user.id);

    logger.info('apos;Notifications retrieved'apos;, {
      action: 'apos;notifications_retrieved'apos;,
      metadata: {
        userId: session.user.id,
        count: notifications.length,
        unreadCount,
        filters: { unreadOnly, type, priority }
      }
    });

    return NextResponse.json({
      notifications,
      unreadCount,
      total: notifications.length
    });

  } catch (error) {
    logger.error('apos;Failed to retrieve notifications'apos;, error as Error, {
      action: 'apos;notifications_retrieve_error'apos;,
      metadata: { userId: session.user.id }
    });

    return NextResponse.json(
      { error: 'apos;Failed to retrieve notifications'apos; },
      { status: 500 }
    );
  }
}

// POST - Créer une notification personnalisée
async function createNotification(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'apos;Unauthorized'apos; }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      type,
      priority,
      title,
      message,
      metadata,
      actions
    } = body;

    if (!type || !priority || !title || !message) {
      return NextResponse.json(
        { error: 'apos;Missing required fields'apos; },
        { status: 400 }
      );
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
    );

    logger.info('apos;Custom notification created'apos;, {
      action: 'apos;notification_custom_created'apos;,
      metadata: {
        userId: session.user.id,
        notificationId: notification.id,
        type,
        priority
      }
    });

    return NextResponse.json({ notification }, { status: 201 });

  } catch (error) {
    logger.error('apos;Failed to create notification'apos;, error as Error, {
      action: 'apos;notification_create_error'apos;,
      metadata: { userId: session.user.id }
    });

    return NextResponse.json(
      { error: 'apos;Failed to create notification'apos; },
      { status: 500 }
    );
  }
}

// PUT - Marquer une notification comme lue
async function markAsRead(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'apos;Unauthorized'apos; }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { notificationId } = body;

    if (!notificationId) {
      return NextResponse.json(
        { error: 'apos;Notification ID is required'apos; },
        { status: 400 }
      );
    }

    const success = notificationManager.markAsRead(notificationId, session.user.id);

    if (!success) {
      return NextResponse.json(
        { error: 'apos;Notification not found or access denied'apos; },
        { status: 404 }
      );
    }

    logger.info('apos;Notification marked as read'apos;, {
      action: 'apos;notification_marked_read'apos;,
      metadata: {
        userId: session.user.id,
        notificationId
      }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    logger.error('apos;Failed to mark notification as read'apos;, error as Error, {
      action: 'apos;notification_mark_read_error'apos;,
      metadata: { userId: session.user.id }
    });

    return NextResponse.json(
      { error: 'apos;Failed to mark notification as read'apos; },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une notification
async function deleteNotification(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'apos;Unauthorized'apos; }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { notificationId } = body;

    if (!notificationId) {
      return NextResponse.json(
        { error: 'apos;Notification ID is required'apos; },
        { status: 400 }
      );
    }

    const success = notificationManager.deleteNotification(notificationId, session.user.id);

    if (!success) {
      return NextResponse.json(
        { error: 'apos;Notification not found or access denied'apos; },
        { status: 404 }
      );
    }

    logger.info('apos;Notification deleted'apos;, {
      action: 'apos;notification_deleted'apos;,
      metadata: {
        userId: session.user.id,
        notificationId
      }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    logger.error('apos;Failed to delete notification'apos;, error as Error, {
      action: 'apos;notification_delete_error'apos;,
      metadata: { userId: session.user.id }
    });

    return NextResponse.json(
      { error: 'apos;Failed to delete notification'apos; },
      { status: 500 }
    );
  }
}

// Handler principal avec rate limiting
export const GET = withRateLimit(getNotifications, 'apos;notifications'apos;);
export const POST = withRateLimit(createNotification, 'apos;notifications'apos;);
export const PUT = withRateLimit(markAsRead, 'apos;notifications'apos;);
export const DELETE = withRateLimit(deleteNotification, 'apos;notifications'apos;);
