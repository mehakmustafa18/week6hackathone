const mongoose = require('mongoose');
const uri = "mongodb://mehak:mehak123@ac-6glqjoj-shard-00-00.ngpbtt3.mongodb.net:27017,ac-6glqjoj-shard-00-01.ngpbtt3.mongodb.net:27017,ac-6glqjoj-shard-00-02.ngpbtt3.mongodb.net:27017/ecommerce?ssl=true&replicaSet=atlas-bmfvqv-shard-0&authSource=admin&appName=Cluster0";

async function test() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(uri);
    console.log('Connected successfully!');
    const count = await mongoose.connection.db.collection('products').countDocuments();
    console.log('Product count:', count);
    process.exit(0);
  } catch (err) {
    console.error('Connection error:', err);
    process.exit(1);
  }
}

test();
