import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function checkAdmins() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db();
    const admins = await db.collection('users').find({ role: { $in: ['admin', 'super_admin'] } }).toArray();
    
    console.log('Admins found:', admins.length);
    admins.forEach(admin => {
      console.log(`- ${admin.name} (${admin.email}), Role: ${admin.role}, ID: ${admin._id}`);
    });
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.close();
  }
}

checkAdmins();
