import { Body, Controller, Post, Delete, Get, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PushNotificationService } from './push-notification.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('push-notifications')
@ApiBearerAuth()
@Controller('notifications/push')
export class PushNotificationController {
  constructor(private pushNotificationService: PushNotificationService) {}

  @Post('subscribe')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Subscribe to push notifications' })
  @ApiResponse({ status: 200, description: 'Successfully subscribed' })
  async subscribe(@Request() req, @Body() subscription: any) {
    const userId = req.user.sub;
    await this.pushNotificationService.saveSubscription(userId, subscription);
    return { success: true, message: 'Push subscription saved successfully' };
  }

  @Delete('unsubscribe')
  @UseGuards(JwtAuthGuard)
  async unsubscribe(@Request() req, @Body() body: { endpoint: string }) {
    const userId = req.user.sub;
    await this.pushNotificationService.removeSubscription(userId, body.endpoint);
    return { success: true, message: 'Push subscription removed successfully' };
  }

  @Get('vapid-public-key')
  getVapidPublicKey() {
    return { publicKey: process.env.VAPID_PUBLIC_KEY };
  }
  
  @Get('test-endpoint')
  testEndpoint() {
    return { message: 'Push notification controller is working!', timestamp: new Date() };
  }
  
  @Get('subscriptions')
  @UseGuards(JwtAuthGuard)
  async getUserSubscriptions(@Request() req) {
    const userId = req.user.sub;
    const subscriptions = await this.pushNotificationService.getUserSubscriptions(userId);
    return { subscriptions };
  }

  @Post('test')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Send test push notification' })
  @ApiResponse({ status: 200, description: 'Test notification sent successfully' })
  async sendTestNotification(@Request() req) {
    const userId = req.user.sub;
    await this.pushNotificationService.sendNotificationToUser(userId, {
      title: 'Test Notification',
      body: 'This is a test push notification from your Twitter clone app!',
      icon: '/icons/icon-192x192.png',
      tag: 'test-notification',
      data: { url: '/notifications' }
    });
    return { success: true, message: 'Test notification sent', userId };
  }
}
