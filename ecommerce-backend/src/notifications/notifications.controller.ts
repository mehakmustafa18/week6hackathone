import { Controller, Get, Patch, Param, Query, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @Get()
    @ApiOperation({ summary: 'Get my notifications' })
    getNotifications(
        @CurrentUser('_id') userId: string,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    ) {
        return this.notificationsService.getUserNotifications(userId, page, limit);
    }

    @Patch(':id/read')
    @ApiOperation({ summary: 'Mark notification as read' })
    markAsRead(@Param('id') id: string, @CurrentUser('_id') userId: string) {
        return this.notificationsService.markAsRead(id, userId);
    }

    @Patch('read-all')
    @ApiOperation({ summary: 'Mark all notifications as read' })
    markAllAsRead(@CurrentUser('_id') userId: string) {
        return this.notificationsService.markAllAsRead(userId);
    }
}