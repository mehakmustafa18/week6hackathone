import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    Body,
    Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import {
    CreateProductDto,
    UpdateProductDto,
    ApplySaleDto,
    AddReviewDto,
    ReplyReviewDto,
    ProductQueryDto,
} from './products.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../users/user.schema';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Public()
    @Get()
    @ApiOperation({ summary: 'Get all products with filters' })
    findAll(@Query() query: ProductQueryDto) {
        return this.productsService.findAll(query);
    }

    @Public()
    @Get('categories')
    @ApiOperation({ summary: 'Get all product categories' })
    getCategories() {
        return this.productsService.getCategories();
    }

    @Public()
    @Get(':id')
    @ApiOperation({ summary: 'Get product by ID' })
    findOne(@Param('id') id: string) {
        return this.productsService.findOne(id);
    }

    @ApiBearerAuth()
    @Post()
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: 'Create a product (Admin)' })
    create(@Body() dto: CreateProductDto) {
        return this.productsService.create(dto);
    }

    @ApiBearerAuth()
    @Patch(':id')
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: 'Update a product (Admin)' })
    update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
        return this.productsService.update(id, dto);
    }

    @ApiBearerAuth()
    @Delete(':id')
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: 'Delete a product (Admin)' })
    delete(@Param('id') id: string) {
        return this.productsService.delete(id);
    }

    @ApiBearerAuth()
    @Patch(':id/sale')
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: 'Apply sale to a product (Admin)' })
    applySale(@Param('id') id: string, @Body() dto: ApplySaleDto) {
        return this.productsService.applySale(id, dto);
    }

    @ApiBearerAuth()
    @Delete(':id/sale')
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: 'Remove sale from a product (Admin)' })
    removeSale(@Param('id') id: string) {
        return this.productsService.removeSale(id);
    }

    @ApiBearerAuth()
    @Post(':id/reviews')
    @ApiOperation({ summary: 'Add a review to a product' })
    addReview(
        @Param('id') id: string,
        @CurrentUser('_id') userId: string,
        @CurrentUser('name') userName: string,
        @Body() dto: AddReviewDto,
    ) {
        return this.productsService.addReview(id, userId, userName || 'Anonymous', dto);
    }

    @ApiBearerAuth()
    @Patch(':id/reviews/:reviewId/reply')
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: 'Reply to a product review (Admin)' })
    replyToReview(
        @Param('id') id: string,
        @Param('reviewId') reviewId: string,
        @Body() dto: ReplyReviewDto,
    ) {
        return this.productsService.replyToReview(id, reviewId, dto);
    }
}