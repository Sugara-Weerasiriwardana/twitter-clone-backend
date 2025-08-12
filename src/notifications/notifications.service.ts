import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Notification, NotificationDocument } from './schemas/notification.schema';
import { Model } from 'mongoose';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
    private gateway: NotificationsGateway,
  ) {}

  async create(userId: string, type: string, message: string, meta?: Record<string, any>) {
  console.log(`[NotificationsService] creating notification for user ${userId}`);
  const created = await this.notificationModel.create({
    userId,
    type,
    message,
    meta: meta ?? null,
  });

  try {
    console.log(`[NotificationsService] emitting to user ${userId}`);
    this.gateway.sendNotificationToUser(userId, {
      id: created._id,
      type: created.type,
      message: created.message,
      meta: created.meta,
      isRead: created.isRead,
      createdAt: created.createdAt,
    });
  } catch (err) {
    console.warn('Failed to push websocket notification', err);
  }

  return created.toObject();
}

  async findForUser(userId: string, limit = 50) {
    return this.notificationModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }

  async markAsRead(id: string) {
    return this.notificationModel.findByIdAndUpdate(id, { isRead: true }, { new: true }).lean();
  }

  async markAllRead(userId: string) {
    return this.notificationModel.updateMany({ userId, isRead: false }, { isRead: true });
  }
}
