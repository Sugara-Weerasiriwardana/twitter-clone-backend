import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('notifications-simple')
@Controller('notifications-simple')
export class NotificationsSimpleController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async getAllNotifications(@Query('userId') userId?: string) {
    try {
      console.log('[NotificationsSimpleController] getAllNotifications called');
      // Use provided userId or default to test user
      const targetUserId = userId || 'dcd5147a-f92e-40c0-9cee-751300a28518';
      console.log('[NotificationsSimpleController] Getting notifications for userId:', targetUserId);
      
      const notifications = await this.notificationsService.findForUser(targetUserId, 20, 1);
      const total = await this.notificationsService.countForUser(targetUserId);
      const unreadCount = await this.notificationsService.countUnreadForUser(targetUserId);

      console.log('[NotificationsSimpleController] Found notifications:', notifications.length);
      console.log('[NotificationsSimpleController] Total:', total, 'Unread:', unreadCount);

      return {
        data: notifications,
        pagination: {
          page: 1,
          limit: 20,
          total,
          pages: Math.ceil(total / 20)
        },
        unreadCount,
        message: `Notifications for user: ${targetUserId}`
      };
    } catch (error) {
      console.error('Error in getAllNotifications:', error);
      return { error: error.message, data: [], pagination: { page: 1, limit: 20, total: 0, pages: 0 }, unreadCount: 0 };
    }
  }

  @Post('/test')
  async createTestNotification(@Body() body: { message?: string; userId?: string }) {
    try {
      const userId = body.userId || 'dcd5147a-f92e-40c0-9cee-751300a28518';
      const message = body.message || 'Test notification created at ' + new Date().toISOString();
      
      const notification = await this.notificationsService.create(
        userId,
        'test',
        message,
        { source: 'simple-api' }
      );

      return { success: true, notification };
    } catch (error) {
      console.error('Error creating test notification:', error);
      return { success: false, error: error.message };
    }
  }
}
