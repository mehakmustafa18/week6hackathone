import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartItemDto } from './cart.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Cart')
@ApiBearerAuth()
@Controller('cart')
export class CartController {
    constructor(private readonly cartService: CartService) { }

    @Get()
    @ApiOperation({ summary: 'Get my cart' })
    getCart(@CurrentUser('_id') userId: string) {
        return this.cartService.getCart(userId);
    }

    @Post('items')
    @ApiOperation({ summary: 'Add item to cart' })
    addItem(@CurrentUser('_id') userId: string, @Body() dto: AddToCartDto) {
        return this.cartService.addItem(userId, dto);
    }

    @Patch('items/:productId')
    @ApiOperation({ summary: 'Update cart item quantity' })
    updateItem(
        @CurrentUser('_id') userId: string,
        @Param('productId') productId: string,
        @Body() dto: UpdateCartItemDto,
    ) {
        return this.cartService.updateItem(userId, productId, dto);
    }

    @Delete('items/:productId')
    @ApiOperation({ summary: 'Remove item from cart' })
    removeItem(
        @CurrentUser('_id') userId: string,
        @Param('productId') productId: string,
    ) {
        return this.cartService.removeItem(userId, productId);
    }

    @Delete()
    @ApiOperation({ summary: 'Clear entire cart' })
    clearCart(@CurrentUser('_id') userId: string) {
        return this.cartService.clearCart(userId);
    }
}