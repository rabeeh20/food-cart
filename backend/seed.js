import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from './models/Admin.js';
import MenuItem from './models/MenuItem.js';

dotenv.config();

const sampleMenuItems = [
  {
    name: 'Paneer Butter Masala',
    description: 'Creamy tomato-based curry with soft paneer cubes',
    price: 280,
    category: 'Main Course',
    isVeg: true,
    stock: 50,
    preparationTime: 25,
    tags: ['Popular', 'Spicy']
  },
  {
    name: 'Chicken Biryani',
    description: 'Aromatic basmati rice with tender chicken pieces and spices',
    price: 320,
    category: 'Main Course',
    isVeg: false,
    stock: 40,
    preparationTime: 35,
    tags: ['Popular', 'Bestseller']
  },
  {
    name: 'Veg Manchurian',
    description: 'Crispy vegetable balls in tangy Indo-Chinese sauce',
    price: 180,
    category: 'Starter',
    isVeg: true,
    stock: 60,
    preparationTime: 20,
    tags: ['Starter', 'Chinese']
  },
  {
    name: 'Dal Makhani',
    description: 'Rich black lentils cooked in butter and cream',
    price: 220,
    category: 'Main Course',
    isVeg: true,
    stock: 70,
    preparationTime: 30,
    tags: ['Popular']
  },
  {
    name: 'Chicken Tikka',
    description: 'Grilled marinated chicken pieces with aromatic spices',
    price: 260,
    category: 'Starter',
    isVeg: false,
    stock: 35,
    preparationTime: 25,
    tags: ['Grilled', 'Tandoor']
  },
  {
    name: 'Gulab Jamun',
    description: 'Soft milk-solid dumplings in sweet rose-flavored syrup',
    price: 80,
    category: 'Dessert',
    isVeg: true,
    stock: 100,
    preparationTime: 10,
    tags: ['Sweet', 'Popular']
  },
  {
    name: 'Masala Dosa',
    description: 'Crispy rice crepe filled with spiced potato filling',
    price: 120,
    category: 'Snacks',
    isVeg: true,
    stock: 45,
    preparationTime: 20,
    tags: ['South Indian', 'Breakfast']
  },
  {
    name: 'Fresh Lime Soda',
    description: 'Refreshing lime juice with soda and a hint of mint',
    price: 60,
    category: 'Beverage',
    isVeg: true,
    stock: 80,
    preparationTime: 5,
    tags: ['Refreshing', 'Cold']
  },
  {
    name: 'Veg Thali',
    description: 'Complete meal with dal, sabji, roti, rice, and dessert',
    price: 250,
    category: 'Combo',
    isVeg: true,
    stock: 30,
    preparationTime: 30,
    tags: ['Combo', 'Value']
  },
  {
    name: 'Butter Naan',
    description: 'Soft leavened bread brushed with butter',
    price: 40,
    category: 'Snacks',
    isVeg: true,
    stock: 150,
    preparationTime: 15,
    tags: ['Bread']
  },
  {
    name: 'Fish Fry',
    description: 'Crispy fried fish marinated with coastal spices',
    price: 300,
    category: 'Starter',
    isVeg: false,
    stock: 25,
    preparationTime: 25,
    tags: ['Seafood', 'Crispy']
  },
  {
    name: 'Mango Lassi',
    description: 'Sweet yogurt drink blended with ripe mangoes',
    price: 80,
    category: 'Beverage',
    isVeg: true,
    stock: 90,
    preparationTime: 5,
    tags: ['Cold', 'Sweet']
  }
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');

    // Clear existing data
    await Admin.deleteMany({});
    await MenuItem.deleteMany({});
    console.log('Cleared existing data');

    // Create Super Admin
    const superAdmin = new Admin({
      email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@fooddelivery.com',
      password: process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123',
      name: 'Super Admin',
      role: 'super_admin'
    });

    await superAdmin.save();
    console.log('Super Admin created:', superAdmin.email);

    // Create Normal Admin
    const normalAdmin = new Admin({
      email: process.env.ADMIN_EMAIL || 'admin@fooddelivery.com',
      password: process.env.ADMIN_PASSWORD || 'Admin@123',
      name: 'Admin User',
      role: 'admin'
    });

    await normalAdmin.save();
    console.log('Normal Admin created:', normalAdmin.email);

    // Create menu items
    const menuItems = await MenuItem.insertMany(sampleMenuItems);
    console.log(`${menuItems.length} menu items created`);

    console.log('\n=== Seed completed successfully ===');
    console.log('\n--- Super Admin Credentials ---');
    console.log('Email:', superAdmin.email);
    console.log('Password:', process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123');
    console.log('Access: Full access (Dashboard, Orders, Menu Management)');

    console.log('\n--- Normal Admin Credentials ---');
    console.log('Email:', normalAdmin.email);
    console.log('Password:', process.env.ADMIN_PASSWORD || 'Admin@123');
    console.log('Access: Orders management only');

    console.log('\nYou can now start the server with: npm run dev');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedDatabase();
