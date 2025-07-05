const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/order-management', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Import models (you'll need to define these schemas in separate files or copy from server.js)
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' }
}, { timestamps: true });

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  }
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  pictures: [String],
  stock: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Customer = mongoose.model('Customer', customerSchema);
const Product = mongoose.model('Product', productSchema);

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Customer.deleteMany({});
    await Product.deleteMany({});

    console.log('Cleared existing data...');

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = new User({
      username: 'admin',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin'
    });
    await adminUser.save();

    console.log('Created admin user...');

    // Create sample customers
    const customers = [
      {
        name: 'John Doe',
        email: 'john.doe@email.com',
        phone: '+1-555-0101',
        address: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA'
        }
      },
      {
        name: 'Jane Smith',
        email: 'jane.smith@email.com',
        phone: '+1-555-0102',
        address: {
          street: '456 Oak Ave',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90210',
          country: 'USA'
        }
      },
      {
        name: 'Bob Johnson',
        email: 'bob.johnson@email.com',
        phone: '+1-555-0103',
        address: {
          street: '789 Pine Rd',
          city: 'Chicago',
          state: 'IL',
          zipCode: '60601',
          country: 'USA'
        }
      }
    ];

    await Customer.insertMany(customers);
    console.log('Created sample customers...');

    // Create sample products
    const products = [
      {
        name: 'Wireless Headphones',
        category: 'Electronics',
        description: 'High-quality wireless headphones with noise cancellation',
        price: 199.99,
        stock: 50,
        pictures: []
      },
      {
        name: 'Smartphone',
        category: 'Electronics',
        description: 'Latest model smartphone with advanced features',
        price: 799.99,
        stock: 30,
        pictures: []
      },
      {
        name: 'Coffee Mug',
        category: 'Home & Kitchen',
        description: 'Ceramic coffee mug with ergonomic handle',
        price: 12.99,
        stock: 100,
        pictures: []
      },
      {
        name: 'Laptop Bag',
        category: 'Accessories',
        description: 'Durable laptop bag with multiple compartments',
        price: 49.99,
        stock: 25,
        pictures: []
      },
      {
        name: 'Desk Chair',
        category: 'Furniture',
        description: 'Ergonomic office chair with lumbar support',
        price: 299.99,
        stock: 15,
        pictures: []
      },
      {
        name: 'Water Bottle',
        category: 'Sports & Outdoors',
        description: 'Stainless steel water bottle with insulation',
        price: 24.99,
        stock: 75,
        pictures: []
      },
      {
        name: 'Running Shoes',
        category: 'Sports & Outdoors',
        description: 'Comfortable running shoes with advanced cushioning',
        price: 129.99,
        stock: 40,
        pictures: []
      },
      {
        name: 'Book Light',
        category: 'Home & Kitchen',
        description: 'LED book light with adjustable brightness',
        price: 19.99,
        stock: 60,
        pictures: []
      }
    ];

    await Product.insertMany(products);
    console.log('Created sample products...');


    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding data:', error);
    mongoose.connection.close();
  }
};

seedData();