const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const uri = "mongodb://mehak:mehak123@ac-6glqjoj-shard-00-00.ngpbtt3.mongodb.net:27017,ac-6glqjoj-shard-00-01.ngpbtt3.mongodb.net:27017,ac-6glqjoj-shard-00-02.ngpbtt3.mongodb.net:27017/ecommerce?ssl=true&replicaSet=atlas-bmfvqv-shard-0&authSource=admin&appName=Cluster0";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin', 'super_admin'], default: 'user' },
    isActive: { type: Boolean, default: true },
    loyaltyPoints: { type: Number, default: 0 },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function seed() {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB.");
    
    // Seed Super Admin
    const existing = await User.findOne({ email: 'superadmin@shop.com' });
    if(existing) {
        console.log("Superadmin already exists. Updating password and role...");
        existing.password = await bcrypt.hash('Admin@123', 12);
        existing.role = 'super_admin';
        await existing.save();
    } else {
        const hashedPassword = await bcrypt.hash('Admin@123', 12);
        await User.create({
            name: 'Super Admin',
            email: 'superadmin@shop.com',
            password: hashedPassword,
            role: 'super_admin',
            isActive: true,
            loyaltyPoints: 0
        });
        console.log("Superadmin created.");
    }

    // Seed Normal Admin
    const existingAdmin = await User.findOne({ email: 'admin@shop.com' });
    if(existingAdmin) {
        console.log("Admin already exists. Updating password and role...");
        existingAdmin.password = await bcrypt.hash('Admin@123', 12);
        existingAdmin.role = 'admin';
        await existingAdmin.save();
    } else {
        const hashedPassword = await bcrypt.hash('Admin@123', 12);
        await User.create({
            name: 'Admin User',
            email: 'admin@shop.com',
            password: hashedPassword,
            role: 'admin',
            isActive: true,
            loyaltyPoints: 0
        });
        console.log("Admin created.");
    }

    await mongoose.disconnect();
    console.log("Done seeding.");
}

seed().catch(console.error);
