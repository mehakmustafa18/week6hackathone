import { OnApplicationBootstrap } from '@nestjs/common';
import { Model } from 'mongoose';
import { UserDocument } from './users/user.schema';
import { ProductDocument } from './products/product.schema';
export declare class SeederService implements OnApplicationBootstrap {
    private userModel;
    private productModel;
    private readonly logger;
    constructor(userModel: Model<UserDocument>, productModel: Model<ProductDocument>);
    onApplicationBootstrap(): Promise<void>;
    private seedUsers;
    private seedProducts;
}
