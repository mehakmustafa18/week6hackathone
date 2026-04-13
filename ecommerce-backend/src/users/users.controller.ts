import {
    Controller,
    Get,
    Patch,
    Param,
    Body,
    Query,
    ParseIntPipe,
    DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateProfileDto, AdminUpdateUserDto } from './users.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from './user.schema';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get('profile')
    @ApiOperation({ summary: 'Get my profile' })
    getProfile(@CurrentUser() user: any) {
        return user;
    }

    @Patch('profile')
    @ApiOperation({ summary: 'Update my profile' })
    updateProfile(
        @CurrentUser('_id') userId: any,
        @Body() dto: UpdateProfileDto,
    ) {
        return this.usersService.updateProfile(String(userId), dto);
    }

    @Get('loyalty-points')
    @ApiOperation({ summary: 'Get my loyalty points' })
    getLoyaltyPoints(@CurrentUser('_id') userId: any) {
        return this.usersService.getLoyaltyPoints(String(userId));
    }

    @Get()
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: 'List all users (Admin)' })
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'role', required: false, enum: UserRole })
    findAll(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
        @Query('role') role?: UserRole,
    ) {
        return this.usersService.findAll(page, limit, role);
    }

    @Get('stats')
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: 'Get user stats (Admin)' })
    getStats() {
        return this.usersService.getUserStats();
    }

    @Get(':id')
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: 'Get user by ID (Admin)' })
    findOne(@Param('id') id: string) {
        return this.usersService.findById(id);
    }

    @Patch(':id')
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: 'Admin update user role/status' })
    adminUpdate(
        @CurrentUser('_id') adminId: any,
        @CurrentUser('role') adminRole: any,
        @Param('id') targetId: string,
        @Body() dto: AdminUpdateUserDto,
    ) {
        return this.usersService.adminUpdateUser(String(adminId), targetId, dto, adminRole as UserRole);
    }
}