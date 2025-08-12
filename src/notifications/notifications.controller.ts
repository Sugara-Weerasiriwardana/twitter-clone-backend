import { Controller, Get, UseGuards, Request, Patch, Param } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  // GET /notifications
  @Get()
  async getMyNotifications(@Request() req) {
    const userId = req.user.sub;
    return this.notificationsService.findForUser(userId);
  }

  // PATCH /notifications/:id/read
  @Patch(':id/read')
  async markRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  // PATCH /notifications/read-all
  @Patch('read-all')
  async markAllRead(@Request() req) {
    const userId = req.user.sub;
    return this.notificationsService.markAllRead(userId);
  }
}
