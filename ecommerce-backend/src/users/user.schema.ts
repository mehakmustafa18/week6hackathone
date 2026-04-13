import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type UserDocument = User & Document;

export enum UserRole {
    USER = 'user',
    ADMIN = 'admin',
    SUPER_ADMIN = 'super_admin',
}

@Schema({ timestamps: true })
export class User {
    @ApiProperty()
    @Prop({ required: true, trim: true })
    name: string;

    @ApiProperty()
    @Prop({ required: true, unique: true, lowercase: true, trim: true })
    email: string;

    @ApiProperty({ required: false })
    @Prop({ unique: true, sparse: true })
    googleId?: string;

    @ApiProperty({ required: false })
    @Prop({ unique: true, sparse: true })
    githubId?: string;

    @ApiProperty({ required: false })
    @Prop({ unique: true, sparse: true })
    discordId?: string;

    @Prop({ select: false })
    password?: string;

    @ApiProperty({ enum: UserRole })
    @Prop({ type: String, enum: UserRole, default: UserRole.USER })
    role: UserRole;

    @ApiProperty()
    @Prop({ default: 0 })
    loyaltyPoints: number;

    @ApiProperty()
    @Prop({ default: true })
    isActive: boolean;

    @ApiProperty()
    @Prop()
    avatar?: string;

    @ApiProperty()
    @Prop()
    phone?: string;

    @ApiProperty()
    @Prop({ type: Object })
    address?: {
        street: string;
        city: string;
        state: string;
        country: string;
        zip: string;
    };

    @ApiProperty()
    @Prop([String])
    notificationTokens: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);