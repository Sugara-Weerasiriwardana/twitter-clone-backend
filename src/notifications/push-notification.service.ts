import { Injectable, Logger } from '@nestjs/common';
import * as webpush from 'web-push';
import { PrismaService } from '../prisma/prisma.service';

interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

@Injectable()
export class PushNotificationService {
  private readonly logger = new Logger(PushNotificationService.name);

  constructor(private prisma: PrismaService) {
    // Configure web-push with VAPID keys
    webpush.setVapidDetails(
      'mailto:your-email@example.com', // Change this to your email
      process.env.VAPID_PUBLIC_KEY || 'your-vapid-public-key',
      process.env.VAPID_PRIVATE_KEY || 'your-vapid-private-key'
    );
  }

  async saveSubscription(userId: string, subscription: PushSubscription) {
    try {
      const existingSubscription = await this.prisma.pushSubscription.findFirst({
        where: {
          userId,
          endpoint: subscription.endpoint,
        },
      });

      if (!existingSubscription) {
        await this.prisma.pushSubscription.create({
          data: {
            userId,
            endpoint: subscription.endpoint,
            p256dh: subscription.keys.p256dh,
            auth: subscription.keys.auth,
          },
        });
        this.logger.log(`Push subscription saved for user: ${userId}`);
      }
    } catch (error) {
      this.logger.error(`Failed to save push subscription: ${error.message}`);
      throw error;
    }
  }

  async removeSubscription(userId: string, endpoint: string) {
    try {
      await this.prisma.pushSubscription.deleteMany({
        where: {
          userId,
          endpoint,
        },
      });
      this.logger.log(`Push subscription removed for user: ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to remove push subscription: ${error.message}`);
      throw error;
    }
  }

  async sendNotificationToUser(userId: string, payload: any) {
    try {
      const subscriptions = await this.prisma.pushSubscription.findMany({
        where: { userId },
      });

      if (subscriptions.length === 0) {
        this.logger.warn(`No push subscriptions found for user: ${userId}`);
        return;
      }

      const pushPromises = subscriptions.map(async (subscription) => {
        const pushSubscription = {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh,
            auth: subscription.auth,
          },
        };

        try {
          await webpush.sendNotification(
            pushSubscription,
            JSON.stringify(payload)
          );
          this.logger.log(`Push notification sent to user: ${userId}`);
        } catch (error) {
          this.logger.error(`Failed to send push notification: ${error.message}`);
          
          // If subscription is invalid, remove it
          if (error.statusCode === 410 || error.statusCode === 404) {
            await this.removeSubscription(userId, subscription.endpoint);
          }
        }
      });

      await Promise.all(pushPromises);
    } catch (error) {
      this.logger.error(`Error sending push notifications to user ${userId}: ${error.message}`);
    }
  }

  async sendNotificationToMultipleUsers(userIds: string[], payload: any) {
    const promises = userIds.map(userId => this.sendNotificationToUser(userId, payload));
    await Promise.all(promises);
  }

  async getUserSubscriptions(userId: string) {
    return this.prisma.pushSubscription.findMany({
      where: { userId },
    });
  }
}
