import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument, UserRole } from './users/user.schema';
import { Product, ProductDocument, PurchaseType } from './products/product.schema';

@Injectable()
export class SeederService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async onApplicationBootstrap() {
    await this.seedUsers();
    await this.seedProducts();
  }

  private async seedUsers() {
    const existingSuperAdmin = await this.userModel.findOne({ role: UserRole.SUPER_ADMIN });
    if (existingSuperAdmin) return;

    const hashedPassword = await bcrypt.hash('Admin@123', 12);

    await this.userModel.insertMany([
      {
        name: 'Super Admin',
        email: 'superadmin@shop.com',
        password: hashedPassword,
        role: UserRole.SUPER_ADMIN,
        loyaltyPoints: 0,
        isActive: true,
      },
      {
        name: 'Admin User',
        email: 'admin@shop.com',
        password: hashedPassword,
        role: UserRole.ADMIN,
        loyaltyPoints: 0,
        isActive: true,
      },
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: hashedPassword,
        role: UserRole.USER,
        loyaltyPoints: 250,
        isActive: true,
      },
    ]);

    this.logger.log('Default users seeded: superadmin@shop.com / admin@shop.com / john@example.com (all password: Admin@123)');
  }

  private async seedProducts() {
    const count = await this.productModel.countDocuments();
    if (count > 0) return;

    const products = [
      {
        name: 'Nike Air Max 270',
        description: 'Premium running shoes with Max Air cushioning unit for all-day comfort.',
        price: 129.99,
        stock: 50,
        category: 'Footwear',
        images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500'],
        purchaseType: PurchaseType.MONEY,
        pointsEarned: 130,
        isOnSale: false,
        rating: 4.5,
        reviewCount: 128,
      },
      {
        name: 'Apple AirPods Pro',
        description: 'Active Noise Cancellation for immersive sound. Transparency mode for hearing the world.',
        price: 249.99,
        stock: 30,
        category: 'Electronics',
        images: ['https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=500'],
        purchaseType: PurchaseType.MONEY,
        pointsEarned: 250,
        isOnSale: true,
        salePrice: 199.99,
        rating: 4.8,
        reviewCount: 342,
      },
      {
        name: 'Samsung 4K Monitor 27"',
        description: 'Ultra-wide 4K display with HDR support, perfect for gaming and professional work.',
        price: 399.99,
        stock: 15,
        category: 'Electronics',
        images: ['https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500'],
        purchaseType: PurchaseType.MONEY,
        pointsEarned: 400,
        isOnSale: false,
        rating: 4.6,
        reviewCount: 89,
      },
      {
        name: "Levi's 501 Original Jeans",
        description: 'The original straight fit jean with button fly. Iconic American style since 1873.',
        price: 79.99,
        stock: 80,
        category: 'Clothing',
        images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=500'],
        purchaseType: PurchaseType.MONEY,
        pointsEarned: 80,
        isOnSale: true,
        salePrice: 59.99,
        rating: 4.3,
        reviewCount: 215,
      },
      {
        name: 'Mechanical Keyboard TKL',
        description: 'Tenkeyless mechanical keyboard with Cherry MX Blue switches and RGB backlight.',
        price: 89.99,
        stock: 25,
        category: 'Electronics',
        images: ['https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500'],
        purchaseType: PurchaseType.MONEY,
        pointsEarned: 90,
        isOnSale: false,
        rating: 4.7,
        reviewCount: 167,
      },
      {
        name: 'Organic Cotton T-Shirt',
        description: '100% organic cotton, ethically sourced and sustainably produced.',
        price: 29.99,
        stock: 120,
        category: 'Clothing',
        images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500'],
        purchaseType: PurchaseType.MONEY,
        pointsEarned: 30,
        isOnSale: false,
        rating: 4.2,
        reviewCount: 94,
      },
      {
        name: 'Premium Loyalty Mug',
        description: 'Exclusive loyalty reward mug. Only available to our most valued members.',
        price: 0,
        stock: 200,
        category: 'Rewards',
        images: ['https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500'],
        purchaseType: PurchaseType.POINTS,
        pointsPrice: 100,
        pointsEarned: 0,
        isOnSale: false,
        rating: 4.4,
        reviewCount: 56,
      },
      {
        name: 'Loyalty Tote Bag',
        description: 'Eco-friendly canvas tote bag, exclusive to loyalty members.',
        price: 0,
        stock: 100,
        category: 'Rewards',
        images: ['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500'],
        purchaseType: PurchaseType.POINTS,
        pointsPrice: 200,
        pointsEarned: 0,
        isOnSale: false,
        rating: 4.1,
        reviewCount: 43,
      },
      {
        name: 'VIP Gift Box',
        description: 'Curated premium gift box exclusively for top loyalty members.',
        price: 0,
        stock: 50,
        category: 'Rewards',
        images: ['https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500'],
        purchaseType: PurchaseType.POINTS,
        pointsPrice: 500,
        pointsEarned: 0,
        isOnSale: false,
        rating: 4.9,
        reviewCount: 28,
      },
      {
        name: 'Premium Water Bottle',
        description: 'Insulated stainless steel bottle. Keep drinks cold 24h or hot 12h. Pay with cash or points!',
        price: 34.99,
        stock: 75,
        category: 'Accessories',
        images: ['https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500'],
        purchaseType: PurchaseType.HYBRID,
        pointsPrice: 300,
        pointsEarned: 35,
        isOnSale: false,
        rating: 4.6,
        reviewCount: 112,
      },
      {
        name: 'Wireless Charging Pad',
        description: '15W fast wireless charger compatible with all Qi-enabled devices.',
        price: 44.99,
        stock: 40,
        category: 'Electronics',
        images: ['https://images.unsplash.com/photo-1615526675159-e248c3021d3f?w=500'],
        purchaseType: PurchaseType.HYBRID,
        pointsPrice: 400,
        pointsEarned: 45,
        isOnSale: true,
        salePrice: 34.99,
        rating: 4.4,
        reviewCount: 78,
      },
      {
        name: 'Sport Sunglasses',
        description: 'UV400 polarized lenses. Lightweight frame for active lifestyles.',
        price: 59.99,
        stock: 60,
        category: 'Accessories',
        images: ['https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500'],
        purchaseType: PurchaseType.HYBRID,
        pointsPrice: 500,
        pointsEarned: 60,
        isOnSale: false,
        rating: 4.3,
        reviewCount: 91,
      },
    ];

    await this.productModel.insertMany(products);
    this.logger.log(`${products.length} sample products seeded`);
  }
}