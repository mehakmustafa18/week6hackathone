import {
    Controller,
    Get,
    Post,
    Patch,
    Param,
    Body,
    Query,
    DefaultValuePipe,
    ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './orders.dto';
import { OrderStatus } from './order.schema';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/user.schema';

@ApiTags('Orders')
@ApiBearerAuth()
@Controller('orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    @Post()
    @ApiOperation({ summary: 'Place a new order' })
    createOrder(
        @CurrentUser('_id') userId: string,
        @Body() dto: CreateOrderDto,
    ) {
        return this.ordersService.createOrder(userId, dto);
    }

    @Get('my-orders')
    @ApiOperation({ summary: 'Get my order history' })
    getUserOrders(
        @CurrentUser('_id') userId: string,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    ) {
        return this.ordersService.getUserOrders(userId, page, limit);
    }

    @Get('admin/all')
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: 'Get all orders (Admin)' })
    @ApiQuery({ name: 'status', required: false, enum: OrderStatus })
    getAllOrders(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
        @Query('status') status?: OrderStatus,
    ) {
        return this.ordersService.getAllOrders(page, limit, status);
    }

    @Get('admin/stats')
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: 'Get order stats (Admin)' })
    getStats() {
        return this.ordersService.getOrderStats();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get order by ID' })
    getOrder(
        @Param('id') id: string,
        @CurrentUser('_id') userId: string,
        @CurrentUser('role') role: string,
    ) {
        return this.ordersService.getOrderById(id, userId, role);
    }

    @Patch(':id/status')
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: 'Update order status (Admin)' })
    updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
        return this.ordersService.updateOrderStatus(id, dto);
    }
}