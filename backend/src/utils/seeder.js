import mongoose from 'mongoose';
import { config } from '../config/env.js';
import { Product } from '../modules/products/product.model.js';
import { Course } from '../modules/courses/course.model.js';
import { User } from '../modules/users/user.model.js';
import { Order } from '../modules/orders/order.model.js';
import { Customization } from '../modules/customizations/customization.model.js';
import { Enrollment } from '../modules/courses/enrollment.model.js';
import { CalculatorConfig, CalculationLog } from '../modules/calculator/calculator.model.js';
import { Media } from '../modules/uploads/media.model.js';
import { Notification } from '../modules/notifications/notification.model.js';
import { AuditLog } from '../modules/admin/auditLog.model.js';
import { ROLES } from './constants.js';

const sampleProducts = [
  {
    name: 'Strawberry Dream Cake',
    title: 'Strawberry Dream Cake',
    description: 'Layers of light vanilla sponge, fresh strawberry compote, and whipped cream frosting. Made with organic, locally sourced ingredients.',
    price: 28,
    category: 'Cakes',
    image: 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?w=800',
    images: ['https://images.unsplash.com/photo-1535141192574-5d4897c13136?w=800'],
    bakerName: 'Sarah Kim',
    bakerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
    bakerTitle: 'Home Baker · 3 yrs experience',
    reviewsCount: 128,
    isPopular: true,
    stock: 25,
    isAvailable: true,
    ingredients: ['Flour', 'Strawberries', 'Heavy Cream', 'Eggs', 'Butter', 'Vanilla Extract'],
    allergens: ['Dairy', 'Eggs', 'Gluten'],
    rating: 4.9,
  },
  {
    name: 'Almond Croissants',
    title: 'Almond Croissants',
    description: 'Flaky, golden croissants baked with rich butter and sweet almond paste, topped with sliced almonds and powdered sugar.',
    price: 6,
    category: 'Pastries',
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800',
    images: ['https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800'],
    bakerName: 'Pierre M.',
    bakerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    bakerTitle: 'Artisan Pastry Chef · 8 yrs experience',
    reviewsCount: 94,
    isPopular: true,
    stock: 40,
    isAvailable: true,
    ingredients: ['Flour', 'Butter', 'Almonds', 'Sugar', 'Yeast', 'Eggs'],
    allergens: ['Nuts', 'Dairy', 'Gluten'],
    rating: 4.8,
  },
  {
    name: 'Chocolate Fudge Gateau',
    title: 'Chocolate Fudge Gateau',
    description: 'Rich Belgian chocolate sponge cake with dark chocolate ganache glaze and chocolate curls. Exceptionally moist and chocolatey.',
    price: 32,
    category: 'Cakes',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800',
    images: ['https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800'],
    bakerName: 'Sarah Kim',
    bakerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
    bakerTitle: 'Home Baker · 3 yrs experience',
    reviewsCount: 154,
    isPopular: true,
    stock: 15,
    isAvailable: true,
    ingredients: ['Flour', 'Cocoa Powder', 'Butter', 'Eggs', 'Dark Chocolate', 'Sugar', 'Cream'],
    allergens: ['Dairy', 'Eggs', 'Gluten'],
    rating: 4.9,
  },
  {
    name: 'Red Velvet Cupcakes',
    title: 'Red Velvet Cupcakes',
    description: 'Soft, moist red velvet cupcakes topped with a rich cream cheese frosting swirls. Sold in a box of 4.',
    price: 16,
    category: 'Pastries',
    image: 'https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?w=800',
    images: ['https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?w=800'],
    bakerName: 'Chef Remy',
    bakerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
    bakerTitle: 'Professional Pastry Chef · 5 yrs experience',
    reviewsCount: 82,
    isPopular: false,
    stock: 30,
    isAvailable: true,
    ingredients: ['Flour', 'Buttermilk', 'Cocoa', 'Vinegar', 'Butter', 'Cream Cheese', 'Sugar'],
    allergens: ['Dairy', 'Gluten'],
    rating: 4.7,
  },
];

const sampleCourses = [
  {
    title: 'French Patisserie Masterclass',
    description: 'Learn the secrets of classic French baking from croissants to delicate choux pastry.',
    instructor: 'Chef Remy',
    courseAuthor: 'Chef Remy · French Patissier',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
    price: 49.99,
    level: 'intermediate',
    category: 'Baking Basics',
    tag: 'Baking Basics',
    tagColorTheme: '#5c51f3',
    duration: '2 hrs 15 mins',
    rating: 4.9,
    thumbnail: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800',
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800',
    isPublished: true,
    lessons: [
      {
        title: 'Introduction to Lamination',
        description: 'Understanding butter temperature and dough elasticity for croissants.',
        videoUrl: 'https://example.com/videos/lamination-101.mp4',
        durationMinutes: 25,
      },
      {
        title: 'Crafting Choux Pastry & Eclairs',
        description: 'How to achieve the perfect rise and cream fill consistency.',
        videoUrl: 'https://example.com/videos/choux-mastery.mp4',
        durationMinutes: 35,
      },
    ],
  },
  {
    title: 'Sourdough Bread Art Masterclass',
    description: 'Master sourdough starter, fermentation, scoring patterns, and Dutch oven baking.',
    instructor: 'Chef Pierre',
    courseAuthor: 'Chef Pierre · Bread Artisan',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    price: 39.99,
    level: 'advanced',
    category: 'Bread Art',
    tag: 'Bread Art',
    tagColorTheme: '#f97316',
    duration: '3 hrs 30 mins',
    rating: 4.8,
    thumbnail: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800',
    isPublished: true,
    lessons: [
      {
        title: 'Creating and Maintaining a Starter',
        description: 'Feeding ratios, temperature control, and wild yeast activity.',
        videoUrl: 'https://example.com/videos/starter.mp4',
        durationMinutes: 40,
      },
    ],
  },
];

const seedData = async () => {
  try {
    await mongoose.connect(config.mongodbUri);
    console.log('Database connected for seeding...');

    await Promise.all([
      Product.deleteMany({}),
      Course.deleteMany({}),
      User.deleteMany({}),
      Order.deleteMany({}),
      Customization.deleteMany({}),
      Enrollment.deleteMany({}),
      CalculatorConfig.deleteMany({}),
      CalculationLog.deleteMany({}),
      Media.deleteMany({}),
      Notification.deleteMany({}),
      AuditLog.deleteMany({}),
    ]);

    console.log('Cleared existing MongoDB data.');

    const products = await Product.insertMany(sampleProducts);
    const courses = await Course.insertMany(sampleCourses);

    // Seed Admin and Demo Customers
    const adminUser = await User.create({
      name: 'Admin Baker',
      email: 'admin@bakery.com',
      password: 'AdminPassword123!',
      role: ROLES.ADMIN,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
    });

    const demoCustomer = await User.create({
      name: 'Demo Customer',
      email: 'customer@bakery.com',
      password: 'CustomerPassword123!',
      role: ROLES.USER,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
    });

    const customer2 = await User.create({
      name: 'Sophia Patel',
      email: 'sophia@bakery.com',
      password: 'CustomerPassword123!',
      role: ROLES.USER,
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400',
    });

    // Seed Calculator Config & Logs
    await CalculatorConfig.create({
      defaultLaborCost: 45,
      defaultPackagingCost: 18,
      defaultProfitMargin: 35,
      taxRate: 5,
      deliveryFee: 20,
      currency: 'AED',
    });

    await CalculationLog.insertMany([
      { recipe: 'Tiered Fondant Wedding Cake', servings: 50, estimatedCost: 450, suggestedPrice: 650, laborHours: 6, user: demoCustomer._id },
      { recipe: 'Viennoiserie Croissant Batch', servings: 24, estimatedCost: 120, suggestedPrice: 180, laborHours: 3, user: customer2._id },
      { recipe: 'Custom Macaron Tower (50 pcs)', servings: 50, estimatedCost: 190, suggestedPrice: 290, laborHours: 4, user: demoCustomer._id },
    ]);

    // Seed Orders
    await Order.create([
      {
        orderNumber: '#ORD-8821',
        user: demoCustomer._id,
        items: [
          {
            product: products[0]._id,
            productId: products[0]._id.toString(),
            title: products[0].title,
            quantity: 1,
            price: products[0].price,
            image: products[0].image,
            baker: products[0].bakerName,
          },
        ],
        subtotal: 28,
        deliveryFee: 5,
        tax: 2.24,
        grandTotal: 35.24,
        totalAmount: 35.24,
        status: 'pending',
        paymentStatus: 'paid',
        paymentMethod: 'Credit Card',
        shippingAddress: {
          fullName: 'Demo Customer',
          phone: '+971 50 123 4567',
          address: 'Downtown Boulevard Tower A, Apt 1402',
          city: 'Dubai',
          state: 'Dubai',
          postalCode: '00000',
          country: 'United Arab Emirates',
        },
      },
      {
        orderNumber: '#ORD-8822',
        user: customer2._id,
        items: [
          {
            product: products[1]._id,
            productId: products[1]._id.toString(),
            title: products[1].title,
            quantity: 3,
            price: products[1].price,
            image: products[1].image,
            baker: products[1].bakerName,
          },
        ],
        subtotal: 18,
        deliveryFee: 5,
        tax: 1.44,
        grandTotal: 24.44,
        totalAmount: 24.44,
        status: 'completed',
        paymentStatus: 'paid',
        paymentMethod: 'Apple Pay',
        shippingAddress: {
          fullName: 'Sophia Patel',
          phone: '+971 52 987 6543',
          address: 'Marina Gate 2, Apt 804',
          city: 'Dubai',
          state: 'Dubai',
          postalCode: '00000',
          country: 'United Arab Emirates',
        },
      },
    ]);

    // Seed Custom Requests
    await Customization.create([
      {
        user: demoCustomer._id,
        baseProduct: 'Strawberry Dream Cake',
        flavor: 'Vanilla & Fresh Strawberry Compote',
        size: '3 Tier (30 Servings)',
        toppings: ['Edible Gold Leaf', 'Fresh Berries', 'Macaron Accents'],
        specialInstructions: 'Need gold embossing with initials S & M for anniversary party.',
        status: 'pending',
        estimatedCost: 350,
      },
    ]);

    // Seed Enrollments
    await Enrollment.create([
      {
        user: demoCustomer._id,
        course: courses[0]._id,
        progressPercentage: 50,
        isCompleted: false,
      },
      {
        user: customer2._id,
        course: courses[1]._id,
        progressPercentage: 100,
        isCompleted: true,
      },
    ]);

    // Seed Media
    await Media.insertMany([
      {
        name: 'Strawberry Dream Cake Cover',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?w=800',
        sizeBytes: 480000,
        category: 'product',
        uploader: adminUser._id,
      },
      {
        name: 'French Patisserie Masterclass Banner',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800',
        sizeBytes: 620000,
        category: 'banner',
        uploader: adminUser._id,
      },
    ]);

    // Seed Notifications
    await Notification.insertMany([
      {
        title: 'New Order Received',
        message: 'Order #ORD-8821 placed for Strawberry Dream Cake.',
        type: 'order',
        isRead: false,
        link: '/admin/orders',
      },
      {
        title: 'Custom Cake Estimate Requested',
        message: 'Custom anniversary cake inquiry submitted by Demo Customer.',
        type: 'custom_request',
        isRead: false,
        link: '/admin/custom-requests',
      },
    ]);

    // Seed Audit Logs
    await AuditLog.insertMany([
      {
        adminName: 'Admin Baker',
        adminEmail: 'admin@bakery.com',
        action: 'Initial system setup and database seeding performed',
        resourceType: 'settings',
      },
      {
        adminName: 'Admin Baker',
        adminEmail: 'admin@bakery.com',
        action: 'Updated baseline labor rates and pricing multipliers',
        resourceType: 'calculator',
      },
    ]);

    console.log('Database seeded successfully with dynamic MongoDB data!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

export const seedAdminOnly = async () => {
  try {
    await mongoose.connect(config.mongodbUri);
    console.log('Database connected for admin seeding...');

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@bakery.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'AdminPassword123!';
    const adminName = process.env.ADMIN_NAME || 'Admin Baker';

    let admin = await User.findOne({ email: adminEmail });
    if (admin) {
      admin.role = ROLES.ADMIN;
      admin.password = adminPassword;
      await admin.save();
      console.log(`Admin account updated successfully: ${adminEmail} (Password: ${adminPassword})`);
    } else {
      admin = await User.create({
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        role: ROLES.ADMIN,
      });
      console.log(`Admin account created successfully: ${adminEmail} (Password: ${adminPassword})`);
    }
    process.exit(0);
  } catch (error) {
    console.error('Admin seeding error:', error);
    process.exit(1);
  }
};

const flag = process.argv[2];
if (flag === '--seed') {
  seedData();
} else if (flag === '--admin' || flag === '--seed-admin') {
  seedAdminOnly();
}
