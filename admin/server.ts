import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==========================================
// Types & Interfaces
// ==========================================

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'user';
  avatar: string;
  phone?: string;
  theme: 'light' | 'dark' | 'system';
  status: 'active' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: 'Cakes' | 'Pastries' | 'Keto' | 'Cookies' | 'Bread';
  bakerName: string;
  bakerTitle: string;
  bakerAvatar: string;
  ingredients: string[];
  rating: number;
  reviewsCount: number;
  isPopular: boolean;
  inStock: boolean;
  image: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  title: string;
  baker: string;
  price: number;
  quantity: number;
  subtotal: number;
  image: string;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface StatusTimelineEntry {
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  timestamp: string;
  note?: string;
  adminName?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  grandTotal: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  shippingAddress: ShippingAddress;
  paymentStatus: 'paid' | 'pending' | 'refunded';
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
  statusHistory: StatusTimelineEntry[];
}

export interface CustomCakeRequest {
  id: string;
  requestNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  baseProduct: string;
  flavor: string;
  size: string;
  toppings: string[];
  specialInstructions: string;
  referenceImage?: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  estimatedCost?: number;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  id: string;
  title: string;
  author: string;
  authorAvatar: string;
  authorBio?: string;
  duration: string;
  category: 'Beginner' | 'Intermediate' | 'Advanced';
  tag: string;
  tagColorTheme: 'amber' | 'emerald' | 'purple' | 'rose' | 'blue';
  rating: number;
  enrollmentsCount: number;
  videoUrls: string[];
  thumbnail: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface Enrollment {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  courseId: string;
  courseTitle: string;
  courseThumbnail: string;
  enrollmentDate: string;
  progress: number;
  status: 'not_started' | 'in_progress' | 'completed';
  lastAccessedAt: string;
}

export interface CalculatorConfig {
  defaultLaborCost: number;
  defaultPackagingCost: number;
  defaultProfitMargin: number;
  taxRate: number;
  deliveryFee: number;
  currency: string;
}

export interface AuditLog {
  id: string;
  adminName: string;
  adminEmail: string;
  action: string;
  resourceType: 'product' | 'order' | 'custom_request' | 'course' | 'user' | 'calculator' | 'media' | 'settings';
  resourceId?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'custom_request' | 'stock' | 'user' | 'course' | 'system';
  read: boolean;
  link: string;
  createdAt: string;
}

export interface MediaItem {
  id: string;
  name: string;
  type: 'image' | 'video';
  url: string;
  sizeBytes: number;
  category: 'product' | 'course' | 'avatar' | 'banner';
  uploadedAt: string;
}

// ==========================================
// In-Memory Database & Seed Data
// ==========================================

const JWT_SECRET = process.env.JWT_SECRET || 'bakery-secret-signing-key-2026';

function hashPassword(password: string): string {
  return crypto.createHmac('sha256', JWT_SECRET).update(password).digest('hex');
}

function generateJWT(payload: Record<string, any>): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const exp = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60; // 7 days
  const fullPayload = Buffer.from(JSON.stringify({ ...payload, exp })).toString('base64url');
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${fullPayload}`)
    .digest('base64url');
  return `${header}.${fullPayload}.${signature}`;
}

function verifyJWT(token: string): Record<string, any> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, payload, signature] = parts;
    const expectedSig = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${header}.${payload}`)
      .digest('base64url');
    if (signature !== expectedSig) return null;
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));
    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
      return null; // expired
    }
    return decoded;
  } catch {
    return null;
  }
}

// Data Store
let users: User[] = [
  {
    id: 'usr_admin_1',
    name: 'Chef Isabella Vance',
    email: 'admin@bakery.com',
    passwordHash: hashPassword('admin123'),
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=400&q=80',
    phone: '+971 50 123 4567',
    theme: 'system',
    status: 'active',
    createdAt: '2026-01-10T08:00:00.000Z',
    updatedAt: '2026-10-04T08:00:00.000Z',
  },
  {
    id: 'usr_2',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@example.com',
    passwordHash: hashPassword('password123'),
    role: 'user',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    phone: '+971 52 987 6543',
    theme: 'light',
    status: 'active',
    createdAt: '2026-08-14T11:20:00.000Z',
    updatedAt: '2026-10-01T14:10:00.000Z',
  },
  {
    id: 'usr_3',
    name: 'Marcus Chen',
    email: 'marcus.chen@example.com',
    passwordHash: hashPassword('password123'),
    role: 'user',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    phone: '+971 55 456 7890',
    theme: 'dark',
    status: 'active',
    createdAt: '2026-08-28T09:15:00.000Z',
    updatedAt: '2026-09-30T10:00:00.000Z',
  },
  {
    id: 'usr_4',
    name: 'Elena Rostova',
    email: 'elena.rostova@example.com',
    passwordHash: hashPassword('password123'),
    role: 'user',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    phone: '+971 54 223 3445',
    theme: 'system',
    status: 'active',
    createdAt: '2026-09-05T14:30:00.000Z',
    updatedAt: '2026-10-03T16:45:00.000Z',
  },
  {
    id: 'usr_5',
    name: 'Tariq Al-Mansoor',
    email: 'tariq.almansoor@example.com',
    passwordHash: hashPassword('password123'),
    role: 'user',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    phone: '+971 50 889 9112',
    theme: 'light',
    status: 'active',
    createdAt: '2026-09-12T17:00:00.000Z',
    updatedAt: '2026-10-04T01:10:00.000Z',
  },
  {
    id: 'usr_6',
    name: 'Chloe Dupont',
    email: 'chloe.dupont@example.com',
    passwordHash: hashPassword('password123'),
    role: 'user',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    phone: '+971 58 777 6655',
    theme: 'system',
    status: 'suspended',
    createdAt: '2026-09-19T10:45:00.000Z',
    updatedAt: '2026-09-25T12:00:00.000Z',
  },
];

let products: Product[] = [
  {
    id: 'prod_1',
    title: 'Strawberry Chiffon Dream Cake',
    description: 'Triple-layer cloud-soft vanilla sponge layered with organic alpine strawberries and French Chantilly cream, finished with delicate white chocolate shavings.',
    price: 185,
    category: 'Cakes',
    bakerName: 'Chef Isabella Vance',
    bakerTitle: 'Master Pastry Chef',
    bakerAvatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=400&q=80',
    ingredients: ['Madagascar Vanilla', 'Organic Strawberries', 'Pasture-raised Eggs', 'Unbleached Wheat Flour', 'French Butter', 'Cane Sugar'],
    rating: 4.9,
    reviewsCount: 128,
    isPopular: true,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=800&q=80',
    createdAt: '2026-02-01T10:00:00.000Z',
    updatedAt: '2026-10-01T12:00:00.000Z',
  },
  {
    id: 'prod_2',
    title: 'Traditional Butter Croissant Box (6 pcs)',
    description: 'Classic Parisian 27-layer laminated Viennoiserie crafted with 84% butterfat Normandy butter, featuring a golden honeycombed interior and crisp shattered crust.',
    price: 64,
    category: 'Pastries',
    bakerName: 'Henri Rousseau',
    bakerTitle: 'Artisan Viennoisier',
    bakerAvatar: 'https://images.unsplash.com/photo-1583394293214-28ded15ee548?auto=format&fit=crop&w=400&q=80',
    ingredients: ['Normandy AOP Butter', 'T55 French Flour', 'Mineral Water', 'Grey Sea Salt', 'Wild Yeast Culture'],
    rating: 4.8,
    reviewsCount: 94,
    isPopular: true,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80',
    createdAt: '2026-02-15T09:00:00.000Z',
    updatedAt: '2026-09-28T09:00:00.000Z',
  },
  {
    id: 'prod_3',
    title: 'San Francisco Country Sourdough Loaf',
    description: 'Naturally leavened 36-hour slow-fermentation hearth bread with a blistered mahogany crust, rich open crumb, and nuanced lactic tang.',
    price: 38,
    category: 'Bread',
    bakerName: 'Klaus Meyer',
    bakerTitle: 'Head Hearth Baker',
    bakerAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
    ingredients: ['Stoneground Whole Wheat', 'Heritage Rye', 'Living Levain', 'Pure Sea Salt'],
    rating: 5.0,
    reviewsCount: 215,
    isPopular: true,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=800&q=80',
    createdAt: '2026-03-01T07:00:00.000Z',
    updatedAt: '2026-10-02T11:00:00.000Z',
  },
  {
    id: 'prod_4',
    title: 'Keto Valrhona Dark Truffle Cake',
    description: 'Grain-free, sugar-free indulgence made with 85% Valrhona cocoa, almond flour, and organic monk fruit nectar, topped with roasted hazelnuts.',
    price: 195,
    category: 'Keto',
    bakerName: 'Chef Isabella Vance',
    bakerTitle: 'Master Pastry Chef',
    bakerAvatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=400&q=80',
    ingredients: ['Valrhona 85% Dark Chocolate', 'Extra-fine Almond Flour', 'Monk Fruit Extract', 'Grass-fed Butter', 'Piedmont Hazelnuts'],
    rating: 4.7,
    reviewsCount: 62,
    isPopular: false,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
    createdAt: '2026-04-10T12:00:00.000Z',
    updatedAt: '2026-09-15T15:00:00.000Z',
  },
  {
    id: 'prod_5',
    title: 'Salted Caramel Hazelnut Cookies (Tin of 8)',
    description: 'Thick, chewy brown butter cookies embedded with roasted hazelnut chunks and house-spun molten fleur de sel caramel pockets.',
    price: 52,
    category: 'Cookies',
    bakerName: 'Amelie Laurent',
    bakerTitle: 'Chocolatier & Confectioner',
    bakerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    ingredients: ['French Brown Butter', 'Guérande Sea Salt', 'Caramelized White Chocolate', 'Unrefined Muscovado Sugar'],
    rating: 4.9,
    reviewsCount: 180,
    isPopular: true,
    inStock: false,
    image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=800&q=80',
    createdAt: '2026-05-18T14:00:00.000Z',
    updatedAt: '2026-10-03T18:00:00.000Z',
  },
  {
    id: 'prod_6',
    title: 'Pistachio Rose Brioche Feuilletée',
    description: 'Flaky caramelized laminated brioche infused with Persian rosewater, Sicilian green pistachio paste, and crushed candied rose petals.',
    price: 72,
    category: 'Pastries',
    bakerName: 'Henri Rousseau',
    bakerTitle: 'Artisan Viennoisier',
    bakerAvatar: 'https://images.unsplash.com/photo-1583394293214-28ded15ee548?auto=format&fit=crop&w=400&q=80',
    ingredients: ['Bronte Pistachio PGI', 'Organic Damask Rose Water', 'Brioche Dough', 'Beurre de Tourage'],
    rating: 4.8,
    reviewsCount: 79,
    isPopular: false,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
    createdAt: '2026-06-01T11:00:00.000Z',
    updatedAt: '2026-09-20T10:00:00.000Z',
  }
];

let orders: Order[] = [
  {
    id: 'ord_1024',
    orderNumber: '#ORD-1024',
    customerId: 'usr_2',
    customerName: 'Sarah Jenkins',
    customerEmail: 'sarah.jenkins@example.com',
    customerPhone: '+971 52 987 6543',
    items: [
      {
        productId: 'prod_1',
        title: 'Strawberry Chiffon Dream Cake',
        baker: 'Chef Isabella Vance',
        price: 185,
        quantity: 1,
        subtotal: 185,
        image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=800&q=80',
      },
      {
        productId: 'prod_2',
        title: 'Traditional Butter Croissant Box (6 pcs)',
        baker: 'Henri Rousseau',
        price: 64,
        quantity: 1,
        subtotal: 64,
        image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80',
      }
    ],
    subtotal: 249,
    deliveryFee: 20,
    tax: 13.45,
    grandTotal: 282.45,
    status: 'processing',
    shippingAddress: {
      fullName: 'Sarah Jenkins',
      phone: '+971 52 987 6543',
      address: 'Villa 14, Al Safa 2, Street 18B',
      city: 'Dubai',
      state: 'Dubai',
      postalCode: '00000',
      country: 'United Arab Emirates'
    },
    paymentStatus: 'paid',
    paymentMethod: 'Credit Card (Apple Pay)',
    createdAt: '2026-10-04T05:30:00.000Z',
    updatedAt: '2026-10-04T06:15:00.000Z',
    statusHistory: [
      { status: 'pending', timestamp: '2026-10-04T05:30:00.000Z', note: 'Order placed by customer' },
      { status: 'processing', timestamp: '2026-10-04T06:15:00.000Z', note: 'Kitchen started preparation', adminName: 'Chef Isabella Vance' }
    ]
  },
  {
    id: 'ord_1023',
    orderNumber: '#ORD-1023',
    customerId: 'usr_3',
    customerName: 'Marcus Chen',
    customerEmail: 'marcus.chen@example.com',
    customerPhone: '+971 55 456 7890',
    items: [
      {
        productId: 'prod_3',
        title: 'San Francisco Country Sourdough Loaf',
        baker: 'Klaus Meyer',
        price: 38,
        quantity: 2,
        subtotal: 76,
        image: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=800&q=80',
      }
    ],
    subtotal: 76,
    deliveryFee: 20,
    tax: 4.80,
    grandTotal: 100.80,
    status: 'pending',
    shippingAddress: {
      fullName: 'Marcus Chen',
      phone: '+971 55 456 7890',
      address: 'Apt 2104, Marina Crown Tower, Dubai Marina',
      city: 'Dubai',
      state: 'Dubai',
      postalCode: '00000',
      country: 'United Arab Emirates'
    },
    paymentStatus: 'paid',
    paymentMethod: 'Credit Card (Visa)',
    createdAt: '2026-10-04T04:10:00.000Z',
    updatedAt: '2026-10-04T04:10:00.000Z',
    statusHistory: [
      { status: 'pending', timestamp: '2026-10-04T04:10:00.000Z', note: 'Payment confirmed. Awaiting kitchen review.' }
    ]
  },
  {
    id: 'ord_1022',
    orderNumber: '#ORD-1022',
    customerId: 'usr_4',
    customerName: 'Elena Rostova',
    customerEmail: 'elena.rostova@example.com',
    customerPhone: '+971 54 223 3445',
    items: [
      {
        productId: 'prod_4',
        title: 'Keto Valrhona Dark Truffle Cake',
        baker: 'Chef Isabella Vance',
        price: 195,
        quantity: 1,
        subtotal: 195,
        image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
      }
    ],
    subtotal: 195,
    deliveryFee: 20,
    tax: 10.75,
    grandTotal: 225.75,
    status: 'completed',
    shippingAddress: {
      fullName: 'Elena Rostova',
      phone: '+971 54 223 3445',
      address: 'Townhouse 88, Arabian Ranches II',
      city: 'Dubai',
      state: 'Dubai',
      postalCode: '00000',
      country: 'United Arab Emirates'
    },
    paymentStatus: 'paid',
    paymentMethod: 'Credit Card (MasterCard)',
    createdAt: '2026-10-03T14:22:00.000Z',
    updatedAt: '2026-10-03T18:40:00.000Z',
    statusHistory: [
      { status: 'pending', timestamp: '2026-10-03T14:22:00.000Z', note: 'Order submitted' },
      { status: 'processing', timestamp: '2026-10-03T15:00:00.000Z', note: 'Baked & iced with custom greetings', adminName: 'Chef Isabella Vance' },
      { status: 'completed', timestamp: '2026-10-03T18:40:00.000Z', note: 'Dispatched and delivered safely', adminName: 'Chef Isabella Vance' }
    ]
  },
  {
    id: 'ord_1021',
    orderNumber: '#ORD-1021',
    customerId: 'usr_5',
    customerName: 'Tariq Al-Mansoor',
    customerEmail: 'tariq.almansoor@example.com',
    customerPhone: '+971 50 889 9112',
    items: [
      {
        productId: 'prod_1',
        title: 'Strawberry Chiffon Dream Cake',
        baker: 'Chef Isabella Vance',
        price: 185,
        quantity: 2,
        subtotal: 370,
        image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=800&q=80',
      },
      {
        productId: 'prod_6',
        title: 'Pistachio Rose Brioche Feuilletée',
        baker: 'Henri Rousseau',
        price: 72,
        quantity: 2,
        subtotal: 144,
        image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
      }
    ],
    subtotal: 514,
    deliveryFee: 20,
    tax: 26.70,
    grandTotal: 560.70,
    status: 'completed',
    shippingAddress: {
      fullName: 'Tariq Al-Mansoor',
      phone: '+971 50 889 9112',
      address: 'Tower B, Boulevard Heights, Downtown Dubai',
      city: 'Dubai',
      state: 'Dubai',
      postalCode: '00000',
      country: 'United Arab Emirates'
    },
    paymentStatus: 'paid',
    paymentMethod: 'Credit Card (Visa)',
    createdAt: '2026-10-02T18:10:00.000Z',
    updatedAt: '2026-10-03T11:00:00.000Z',
    statusHistory: [
      { status: 'pending', timestamp: '2026-10-02T18:10:00.000Z', note: 'Order placed' },
      { status: 'processing', timestamp: '2026-10-02T19:00:00.000Z', note: 'Kitchen in production' },
      { status: 'completed', timestamp: '2026-10-03T11:00:00.000Z', note: 'Completed and delivered' }
    ]
  },
  {
    id: 'ord_1020',
    orderNumber: '#ORD-1020',
    customerId: 'usr_2',
    customerName: 'Sarah Jenkins',
    customerEmail: 'sarah.jenkins@example.com',
    customerPhone: '+971 52 987 6543',
    items: [
      {
        productId: 'prod_5',
        title: 'Salted Caramel Hazelnut Cookies (Tin of 8)',
        baker: 'Amelie Laurent',
        price: 52,
        quantity: 1,
        subtotal: 52,
        image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=800&q=80',
      }
    ],
    subtotal: 52,
    deliveryFee: 20,
    tax: 3.60,
    grandTotal: 75.60,
    status: 'cancelled',
    shippingAddress: {
      fullName: 'Sarah Jenkins',
      phone: '+971 52 987 6543',
      address: 'Villa 14, Al Safa 2, Street 18B',
      city: 'Dubai',
      state: 'Dubai',
      postalCode: '00000',
      country: 'United Arab Emirates'
    },
    paymentStatus: 'refunded',
    paymentMethod: 'Credit Card',
    createdAt: '2026-10-01T09:15:00.000Z',
    updatedAt: '2026-10-01T10:05:00.000Z',
    statusHistory: [
      { status: 'pending', timestamp: '2026-10-01T09:15:00.000Z', note: 'Order initiated' },
      { status: 'cancelled', timestamp: '2026-10-01T10:05:00.000Z', note: 'Cancelled upon customer request (out of stock confirmation)', adminName: 'Chef Isabella Vance' }
    ]
  }
];

let customRequests: CustomCakeRequest[] = [
  {
    id: 'req_401',
    requestNumber: '#REQ-401',
    customerId: 'usr_2',
    customerName: 'Sarah Jenkins',
    customerEmail: 'sarah.jenkins@example.com',
    customerPhone: '+971 52 987 6543',
    baseProduct: 'Triple Tier Celebration Chiffon',
    flavor: 'Madagascar Bourbon Vanilla & Wild Raspberry Gelee',
    size: '10-inch / 22-26 Servings',
    toppings: ['24k Edible Gold Leaf', 'Fresh White Ranunculus Garland', 'Vanilla Macarons'],
    specialInstructions: 'Inscription on bottom tier: "Happy 30th Birthday Sophia!" in delicate gold lettering. Strictly nut-free kitchen preparation required.',
    referenceImage: 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=800&q=80',
    status: 'pending',
    estimatedCost: 420,
    createdAt: '2026-10-03T16:20:00.000Z',
    updatedAt: '2026-10-03T16:20:00.000Z',
  },
  {
    id: 'req_402',
    requestNumber: '#REQ-402',
    customerId: 'usr_4',
    customerName: 'Elena Rostova',
    customerEmail: 'elena.rostova@example.com',
    customerPhone: '+971 54 223 3445',
    baseProduct: 'Artisan Dark Chocolate Truffle Heart',
    flavor: '80% Guanaja Dark Truffle with Salted Hazelnut Praline',
    size: '8-inch / 12-14 Servings',
    toppings: ['Dark Chocolate Mirror Glaze', 'Dehydrated Raspberry Dust'],
    specialInstructions: 'For wedding anniversary celebration. Matte velvet black finish if possible.',
    referenceImage: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
    status: 'approved',
    estimatedCost: 310,
    adminNotes: 'Customer approved preliminary sketch. Production scheduled for Oct 8.',
    createdAt: '2026-10-02T11:00:00.000Z',
    updatedAt: '2026-10-02T14:30:00.000Z',
  },
  {
    id: 'req_403',
    requestNumber: '#REQ-403',
    customerId: 'usr_5',
    customerName: 'Tariq Al-Mansoor',
    customerEmail: 'tariq.almansoor@example.com',
    customerPhone: '+971 50 889 9112',
    baseProduct: 'Botanical Pistachio Olive Oil Sponge',
    flavor: 'Sicilian Pistachio Cream with Cardamom Infusion',
    size: '2-Tier (6" + 9")',
    toppings: ['Candied Pistachios', 'Fresh Fig Halves', 'Organic Rosemary Sprigs'],
    specialInstructions: 'Corporate executive gala reception centerpiece. Needs cold transport box.',
    status: 'completed',
    estimatedCost: 550,
    adminNotes: 'Successfully delivered to Four Seasons DIFC.',
    createdAt: '2026-09-29T10:15:00.000Z',
    updatedAt: '2026-10-01T17:00:00.000Z',
  }
];

let courses: Course[] = [
  {
    id: 'crs_1',
    title: 'The Art of French Lamination & Viennoiserie',
    author: 'Chef Isabella Vance',
    authorAvatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=400&q=80',
    authorBio: 'Former Le Cordon Bleu Master Instructor with 15 years specializing in heritage Viennoiserie.',
    duration: '4.5 Hours · 12 Lessons',
    category: 'Intermediate',
    tag: 'Lamination Masterclass',
    tagColorTheme: 'amber',
    rating: 4.9,
    enrollmentsCount: 342,
    videoUrls: [
      'https://www.youtube.com/watch?v=croissant-dough-prep',
      'https://www.youtube.com/watch?v=butter-block-tourage',
      'https://www.youtube.com/watch?v=proofing-and-baking-secrets'
    ],
    thumbnail: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80',
    description: 'Master the architectural chemistry of butter encasement, 3 single folds, proofing temperatures, and achieving honeycomb alveoli in traditional croissants.',
    createdAt: '2026-03-10T10:00:00.000Z',
    updatedAt: '2026-09-18T14:00:00.000Z',
  },
  {
    id: 'crs_2',
    title: 'Wild Sourdough: Starter Chemistry & 36h Fermentation',
    author: 'Klaus Meyer',
    authorAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
    authorBio: 'Bavarian master baker preserving three-century-old levain strains.',
    duration: '6.0 Hours · 16 Lessons',
    category: 'Advanced',
    tag: 'Artisan Hearth Bread',
    tagColorTheme: 'emerald',
    rating: 5.0,
    enrollmentsCount: 518,
    videoUrls: [
      'https://www.youtube.com/watch?v=starter-feeding-ecology',
      'https://www.youtube.com/watch?v=autolyse-and-hydration',
      'https://www.youtube.com/watch?v=hearth-oven-steam-dynamics'
    ],
    thumbnail: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=800&q=80',
    description: 'In-depth microbial mastery of lactic vs acetic balance, coil folding techniques, high hydration dough handling, and razor scoring patterns.',
    createdAt: '2026-04-05T09:00:00.000Z',
    updatedAt: '2026-09-22T11:00:00.000Z',
  },
  {
    id: 'crs_3',
    title: 'Modern Mirror Glazes & Entremet Architecture',
    author: 'Amelie Laurent',
    authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    authorBio: 'Award-winning pastry artist specializing in geometric gelée inserts and glossy mirror finishes.',
    duration: '3.0 Hours · 8 Lessons',
    category: 'Intermediate',
    tag: 'Pastry Aesthetics',
    tagColorTheme: 'purple',
    rating: 4.8,
    enrollmentsCount: 220,
    videoUrls: [
      'https://www.youtube.com/watch?v=gelatin-bloom-temperatures',
      'https://www.youtube.com/watch?v=mirror-pour-and-marble'
    ],
    thumbnail: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
    description: 'Create multi-layer contemporary entremets with crunchy feuilletine bases, fruit crémeux cores, and mirror glazes poured at 32°C.',
    createdAt: '2026-05-12T13:00:00.000Z',
    updatedAt: '2026-09-25T16:00:00.000Z',
  }
];

let enrollments: Enrollment[] = [
  {
    id: 'enr_1',
    studentId: 'usr_2',
    studentName: 'Sarah Jenkins',
    studentEmail: 'sarah.jenkins@example.com',
    courseId: 'crs_1',
    courseTitle: 'The Art of French Lamination & Viennoiserie',
    courseThumbnail: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80',
    enrollmentDate: '2026-08-20T10:00:00.000Z',
    progress: 75,
    status: 'in_progress',
    lastAccessedAt: '2026-10-02T19:30:00.000Z',
  },
  {
    id: 'enr_2',
    studentId: 'usr_3',
    studentName: 'Marcus Chen',
    studentEmail: 'marcus.chen@example.com',
    courseId: 'crs_2',
    courseTitle: 'Wild Sourdough: Starter Chemistry & 36h Fermentation',
    courseThumbnail: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=800&q=80',
    enrollmentDate: '2026-09-01T14:00:00.000Z',
    progress: 100,
    status: 'completed',
    lastAccessedAt: '2026-09-28T16:45:00.000Z',
  },
  {
    id: 'enr_3',
    studentId: 'usr_4',
    studentName: 'Elena Rostova',
    studentEmail: 'elena.rostova@example.com',
    courseId: 'crs_3',
    courseTitle: 'Modern Mirror Glazes & Entremet Architecture',
    courseThumbnail: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
    enrollmentDate: '2026-09-15T08:30:00.000Z',
    progress: 25,
    status: 'in_progress',
    lastAccessedAt: '2026-10-01T11:20:00.000Z',
  },
  {
    id: 'enr_4',
    studentId: 'usr_5',
    studentName: 'Tariq Al-Mansoor',
    studentEmail: 'tariq.almansoor@example.com',
    courseId: 'crs_1',
    courseTitle: 'The Art of French Lamination & Viennoiserie',
    courseThumbnail: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80',
    enrollmentDate: '2026-09-20T16:00:00.000Z',
    progress: 0,
    status: 'not_started',
    lastAccessedAt: '2026-09-20T16:00:00.000Z',
  }
];

let calculatorConfig: CalculatorConfig = {
  defaultLaborCost: 45, // AED/hour
  defaultPackagingCost: 18, // AED
  defaultProfitMargin: 35, // percent
  taxRate: 5, // percent VAT
  deliveryFee: 20, // AED standard delivery
  currency: 'AED',
};

let calculatorStats = {
  totalCalculations: 1842,
  calculationsToday: 64,
  calculationsThisWeek: 428,
  popularRecipes: [
    { recipe: 'Custom Wedding Cake (3 Tier)', count: 620, avgEstimatedCost: 485 },
    { recipe: 'Artisan Laminated Viennoiserie Batch (40 pcs)', count: 480, avgEstimatedCost: 240 },
    { recipe: 'Gluten-Free Gourmet Loaf Batch', count: 390, avgEstimatedCost: 165 },
    { recipe: 'French Macaron Tower (80 pcs)', count: 352, avgEstimatedCost: 320 }
  ]
};

let mediaItems: MediaItem[] = [
  {
    id: 'med_1',
    name: 'strawberry_chiffon_cake.jpg',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=800&q=80',
    sizeBytes: 845200,
    category: 'product',
    uploadedAt: '2026-09-10T12:00:00.000Z'
  },
  {
    id: 'med_2',
    name: 'croissant_lamination.jpg',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80',
    sizeBytes: 912400,
    category: 'course',
    uploadedAt: '2026-09-12T14:30:00.000Z'
  },
  {
    id: 'med_3',
    name: 'sourdough_scoring.jpg',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=800&q=80',
    sizeBytes: 1205300,
    category: 'product',
    uploadedAt: '2026-09-15T09:15:00.000Z'
  },
  {
    id: 'med_4',
    name: 'chef_isabella_vance.jpg',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=400&q=80',
    sizeBytes: 420100,
    category: 'avatar',
    uploadedAt: '2026-09-01T08:00:00.000Z'
  }
];

let notifications: AdminNotification[] = [
  {
    id: 'notif_1',
    title: 'New Order Received',
    message: 'Order #ORD-1024 from Sarah Jenkins for AED 282.45 requires kitchen review.',
    type: 'order',
    read: false,
    link: '/admin/orders/ord_1024',
    createdAt: '2026-10-04T05:30:00.000Z',
  },
  {
    id: 'notif_2',
    title: 'New Custom Cake Request',
    message: 'Sarah Jenkins submitted #REQ-401 for a Triple Tier Celebration Chiffon.',
    type: 'custom_request',
    read: false,
    link: '/admin/custom-requests/req_401',
    createdAt: '2026-10-03T16:20:00.000Z',
  },
  {
    id: 'notif_3',
    title: 'Low Stock Alert',
    message: 'Salted Caramel Hazelnut Cookies (Tin of 8) is now Out of Stock.',
    type: 'stock',
    read: true,
    link: '/admin/products/prod_5/edit',
    createdAt: '2026-10-03T18:00:00.000Z',
  },
  {
    id: 'notif_4',
    title: 'New Student Enrollment',
    message: 'Elena Rostova enrolled in Modern Mirror Glazes & Entremet Architecture.',
    type: 'course',
    read: true,
    link: '/admin/enrollments',
    createdAt: '2026-09-15T08:30:00.000Z',
  }
];

let auditLogs: AuditLog[] = [
  {
    id: 'log_1',
    adminName: 'Chef Isabella Vance',
    adminEmail: 'admin@bakery.com',
    action: 'Order Status Changed to Processing',
    resourceType: 'order',
    resourceId: 'ord_1024',
    metadata: { orderNumber: '#ORD-1024', previousStatus: 'pending', newStatus: 'processing' },
    createdAt: '2026-10-04T06:15:00.000Z',
  },
  {
    id: 'log_2',
    adminName: 'Chef Isabella Vance',
    adminEmail: 'admin@bakery.com',
    action: 'Custom Cake Request Approved',
    resourceType: 'custom_request',
    resourceId: 'req_402',
    metadata: { requestNumber: '#REQ-402', estimatedCost: 310 },
    createdAt: '2026-10-02T14:30:00.000Z',
  },
  {
    id: 'log_3',
    adminName: 'Chef Isabella Vance',
    adminEmail: 'admin@bakery.com',
    action: 'Product Stock Toggled to Out of Stock',
    resourceType: 'product',
    resourceId: 'prod_5',
    metadata: { productTitle: 'Salted Caramel Hazelnut Cookies (Tin of 8)' },
    createdAt: '2026-10-03T18:00:00.000Z',
  },
  {
    id: 'log_4',
    adminName: 'Chef Isabella Vance',
    adminEmail: 'admin@bakery.com',
    action: 'Course Updated',
    resourceType: 'course',
    resourceId: 'crs_1',
    metadata: { courseTitle: 'The Art of French Lamination & Viennoiserie' },
    createdAt: '2026-09-18T14:00:00.000Z',
  }
];

function logAudit(
  adminName: string,
  adminEmail: string,
  action: string,
  resourceType: AuditLog['resourceType'],
  resourceId?: string,
  metadata?: Record<string, any>
) {
  const newLog: AuditLog = {
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    adminName,
    adminEmail,
    action,
    resourceType,
    resourceId,
    metadata,
    createdAt: new Date().toISOString()
  };
  auditLogs.unshift(newLog);
}

// User helper mock wishlists
const userWishlists: Record<string, string[]> = {
  usr_2: ['prod_1', 'prod_3'],
  usr_3: ['prod_2', 'prod_4'],
  usr_4: ['prod_5', 'prod_6'],
  usr_5: ['prod_1', 'prod_2', 'prod_3']
};

// ==========================================
// Authentication Middleware
// ==========================================

export function requireAdminAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
    return;
  }
  const token = authHeader.split(' ')[1];
  const decoded = verifyJWT(token);
  if (!decoded) {
    res.status(401).json({ success: false, message: 'Invalid or expired session. Please log in again.' });
    return;
  }
  if (decoded.role !== 'admin') {
    res.status(403).json({ success: false, message: 'Access denied. Administrator privileges required.' });
    return;
  }
  (req as any).adminUser = decoded;
  next();
}

// ==========================================
// Express API Route Setup
// ==========================================

export function setupApiRoutes(app: express.Express): void {
  // CORS & Options
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
      return;
    }
    next();
  });

  // ------------------------------------------
  // Auth Routes
  // ------------------------------------------

  // Admin login: POST /api/v1/auth/login
  app.post('/api/v1/auth/login', (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required.' });
      return;
    }

    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user || user.passwordHash !== hashPassword(password)) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    // Role check: Admin only
    if (user.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Access denied. Account is not an authorized administrator.' });
      return;
    }

    if (user.status === 'suspended') {
      res.status(403).json({ success: false, message: 'Account is suspended. Please contact bakery director.' });
      return;
    }

    const token = generateJWT({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        theme: user.theme,
        status: user.status,
      },
    });
  });

  // Current Admin Profile: GET /api/v1/auth/me
  app.get('/api/v1/auth/me', requireAdminAuth, (req: Request, res: Response) => {
    const adminSession = (req as any).adminUser;
    const user = users.find((u) => u.id === adminSession.id);
    if (!user) {
      res.status(404).json({ success: false, message: 'Admin account not found.' });
      return;
    }
    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        theme: user.theme,
        status: user.status,
        createdAt: user.createdAt,
      },
    });
  });

  // Update Admin Profile: PUT /api/v1/admin/profile
  app.put('/api/v1/admin/profile', requireAdminAuth, (req: Request, res: Response) => {
    const adminSession = (req as any).adminUser;
    const user = users.find((u) => u.id === adminSession.id);
    if (!user) {
      res.status(404).json({ success: false, message: 'Admin account not found.' });
      return;
    }

    const { name, avatar, phone, theme } = req.body;
    if (name) user.name = name;
    if (avatar) user.avatar = avatar;
    if (phone !== undefined) user.phone = phone;
    if (theme) user.theme = theme;
    user.updatedAt = new Date().toISOString();

    logAudit(user.name, user.email, 'Updated Admin Profile', 'settings', user.id);

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        theme: user.theme,
        status: user.status,
      },
    });
  });

  // Change Admin Password: PUT /api/v1/admin/profile/password
  app.put('/api/v1/admin/profile/password', requireAdminAuth, (req: Request, res: Response) => {
    const adminSession = (req as any).adminUser;
    const user = users.find((u) => u.id === adminSession.id);
    if (!user) {
      res.status(404).json({ success: false, message: 'Admin account not found.' });
      return;
    }

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      res.status(400).json({ success: false, message: 'Current password and new password are required.' });
      return;
    }

    if (user.passwordHash !== hashPassword(currentPassword)) {
      res.status(400).json({ success: false, message: 'Incorrect current password.' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ success: false, message: 'New password must be at least 6 characters long.' });
      return;
    }

    user.passwordHash = hashPassword(newPassword);
    user.updatedAt = new Date().toISOString();
    logAudit(user.name, user.email, 'Changed Password', 'settings', user.id);

    res.json({ success: true, message: 'Password changed successfully.' });
  });

  // ------------------------------------------
  // Dashboard Aggregation Endpoints
  // ------------------------------------------

  // GET /api/v1/admin/dashboard/stats
  app.get('/api/v1/admin/dashboard/stats', requireAdminAuth, (req: Request, res: Response) => {
    const totalUsers = users.length;
    const totalProducts = products.length;
    const totalOrders = orders.length;
    const pendingOrders = orders.filter((o) => o.status === 'pending').length;
    const processingOrders = orders.filter((o) => o.status === 'processing').length;
    const completedOrders = orders.filter((o) => o.status === 'completed').length;
    const cancelledOrders = orders.filter((o) => o.status === 'cancelled').length;
    const pendingCustomRequests = customRequests.filter((r) => r.status === 'pending').length;
    const totalCourses = courses.length;
    const totalEnrollments = enrollments.length;

    // Financial calculations
    const validOrders = orders.filter((o) => o.status !== 'cancelled');
    const totalRevenue = validOrders.reduce((sum, o) => sum + o.grandTotal, 0);

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay()).getTime();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    const todayOrders = validOrders.filter((o) => new Date(o.createdAt).getTime() >= startOfToday);
    const todayRevenue = todayOrders.reduce((sum, o) => sum + o.grandTotal, 0);

    const weekOrders = validOrders.filter((o) => new Date(o.createdAt).getTime() >= startOfWeek);
    const weekRevenue = weekOrders.reduce((sum, o) => sum + o.grandTotal, 0);

    const monthOrders = validOrders.filter((o) => new Date(o.createdAt).getTime() >= startOfMonth);
    const monthRevenue = monthOrders.reduce((sum, o) => sum + o.grandTotal, 0);

    const lowStockCount = products.filter((p) => !p.inStock).length;

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalProducts,
        totalOrders,
        pendingOrders,
        processingOrders,
        completedOrders,
        cancelledOrders,
        pendingCustomRequests,
        totalCourses,
        totalEnrollments,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        todayRevenue: Math.round(todayRevenue * 100) / 100,
        weekRevenue: Math.round(weekRevenue * 100) / 100,
        monthRevenue: Math.round(monthRevenue * 100) / 100,
        ordersToday: todayOrders.length,
        ordersThisWeek: weekOrders.length,
        ordersThisMonth: monthOrders.length,
        lowStockCount,
      },
    });
  });

  // GET /api/v1/admin/dashboard/revenue
  app.get('/api/v1/admin/dashboard/revenue', requireAdminAuth, (req: Request, res: Response) => {
    const period = (req.query.period as string) || '7d';

    // Generate realistic time points based on period
    let days = 7;
    if (period === '30d') days = 30;
    if (period === '90d') days = 90;
    if (period === '1y') days = 365;

    const data: { date: string; revenue: number; ordersCount: number }[] = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().split('T')[0];

      // Sum matching orders on that date
      const matchingOrders = orders.filter((o) => {
        return o.createdAt.startsWith(dateStr) && o.status !== 'cancelled';
      });

      const dayRevenue = matchingOrders.reduce((acc, curr) => acc + curr.grandTotal, 0);
      // If no orders on past days, provide simulated baseline curve based on average
      const baseSimulation = days <= 30 ? (i % 3 === 0 ? 320 : i % 2 === 0 ? 460 : 210) : 380;
      data.push({
        date: dateStr,
        revenue: dayRevenue > 0 ? Math.round(dayRevenue * 100) / 100 : baseSimulation,
        ordersCount: matchingOrders.length > 0 ? matchingOrders.length : Math.max(1, Math.round(baseSimulation / 120)),
      });
    }

    res.json({ success: true, period, data });
  });

  // GET /api/v1/admin/dashboard/orders
  app.get('/api/v1/admin/dashboard/orders', requireAdminAuth, (req: Request, res: Response) => {
    const statusBreakdown = {
      pending: orders.filter((o) => o.status === 'pending').length,
      processing: orders.filter((o) => o.status === 'processing').length,
      completed: orders.filter((o) => o.status === 'completed').length,
      cancelled: orders.filter((o) => o.status === 'cancelled').length,
    };

    res.json({ success: true, statusBreakdown });
  });

  // GET /api/v1/admin/dashboard/popular-products
  app.get('/api/v1/admin/dashboard/popular-products', requireAdminAuth, (req: Request, res: Response) => {
    // Aggregate product sales from orders
    const productStatsMap: Record<string, { product: Product; orderCount: number; revenue: number }> = {};

    products.forEach((p) => {
      productStatsMap[p.id] = { product: p, orderCount: 0, revenue: 0 };
    });

    orders.forEach((o) => {
      if (o.status !== 'cancelled') {
        o.items.forEach((item) => {
          if (productStatsMap[item.productId]) {
            productStatsMap[item.productId].orderCount += item.quantity;
            productStatsMap[item.productId].revenue += item.subtotal;
          }
        });
      }
    });

    const popular = Object.values(productStatsMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
      .map((item) => ({
        id: item.product.id,
        title: item.product.title,
        category: item.product.category,
        image: item.product.image,
        price: item.product.price,
        orders: item.orderCount,
        revenue: item.revenue,
      }));

    res.json({ success: true, popular });
  });

  // Global Search: GET /api/v1/admin/search?q=...
  app.get('/api/v1/admin/search', requireAdminAuth, (req: Request, res: Response) => {
    const query = ((req.query.q as string) || '').trim().toLowerCase();
    if (!query) {
      res.json({
        success: true,
        results: { users: [], products: [], orders: [], courses: [], customRequests: [] },
      });
      return;
    }

    const matchedUsers = users
      .filter((u) => u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query))
      .slice(0, 5);

    const matchedProducts = products
      .filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          p.bakerName.toLowerCase().includes(query)
      )
      .slice(0, 5);

    const matchedOrders = orders
      .filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(query) ||
          o.customerName.toLowerCase().includes(query) ||
          o.customerEmail.toLowerCase().includes(query)
      )
      .slice(0, 5);

    const matchedCourses = courses
      .filter((c) => c.title.toLowerCase().includes(query) || c.author.toLowerCase().includes(query))
      .slice(0, 5);

    const matchedCustomRequests = customRequests
      .filter(
        (r) =>
          r.requestNumber.toLowerCase().includes(query) ||
          r.customerName.toLowerCase().includes(query) ||
          r.baseProduct.toLowerCase().includes(query)
      )
      .slice(0, 5);

    res.json({
      success: true,
      results: {
        users: matchedUsers,
        products: matchedProducts,
        orders: matchedOrders,
        courses: matchedCourses,
        customRequests: matchedCustomRequests,
      },
    });
  });

  // ------------------------------------------
  // Users Management Endpoints
  // ------------------------------------------

  // GET /api/v1/users/all
  app.get('/api/v1/users/all', requireAdminAuth, (req: Request, res: Response) => {
    const search = ((req.query.search as string) || '').trim().toLowerCase();
    const role = (req.query.role as string) || 'all';
    const status = (req.query.status as string) || 'all';
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;

    let filtered = [...users];

    if (search) {
      filtered = filtered.filter(
        (u) => u.name.toLowerCase().includes(search) || u.email.toLowerCase().includes(search)
      );
    }

    if (role !== 'all') {
      filtered = filtered.filter((u) => u.role === role);
    }

    if (status !== 'all') {
      filtered = filtered.filter((u) => u.status === status);
    }

    const total = filtered.length;
    const startIndex = (page - 1) * limit;
    const paginated = filtered.slice(startIndex, startIndex + limit);

    // Enhance users with order count
    const usersWithStats = paginated.map((u) => {
      const userOrders = orders.filter((o) => o.customerId === u.id);
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        avatar: u.avatar,
        phone: u.phone,
        status: u.status,
        createdAt: u.createdAt,
        ordersCount: userOrders.length,
      };
    });

    res.json({
      success: true,
      users: usersWithStats,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  });

  // GET /api/v1/users/:id
  app.get('/api/v1/users/:id', requireAdminAuth, (req: Request, res: Response) => {
    const user = users.find((u) => u.id === req.params.id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    const userOrders = orders.filter((o) => o.customerId === user.id);
    const userEnrollments = enrollments.filter((e) => e.studentId === user.id);
    const userCustomRequests = customRequests.filter((r) => r.customerId === user.id);
    const wishlistIds = userWishlists[user.id] || [];
    const wishlistProducts = products.filter((p) => wishlistIds.includes(p.id));

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        theme: user.theme,
        status: user.status,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      orders: userOrders,
      enrollments: userEnrollments,
      customRequests: userCustomRequests,
      wishlist: wishlistProducts,
    });
  });

  // PUT /api/v1/users/:id/status
  app.put('/api/v1/users/:id/status', requireAdminAuth, (req: Request, res: Response) => {
    const user = users.find((u) => u.id === req.params.id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    const { status } = req.body;
    if (status !== 'active' && status !== 'suspended') {
      res.status(400).json({ success: false, message: 'Status must be active or suspended.' });
      return;
    }

    user.status = status;
    user.updatedAt = new Date().toISOString();

    const admin = (req as any).adminUser;
    logAudit(admin.name, admin.email, `User status updated to ${status}`, 'user', user.id, {
      userName: user.name,
      status,
    });

    res.json({ success: true, message: `User status changed to ${status}`, user });
  });

  // ------------------------------------------
  // Products Management Endpoints
  // ------------------------------------------

  // GET /api/v1/products
  app.get('/api/v1/products', (req: Request, res: Response) => {
    const search = ((req.query.search as string) || '').trim().toLowerCase();
    const category = (req.query.category as string) || 'all';
    const stock = (req.query.stock as string) || 'all';
    const popular = (req.query.popular as string) || 'all';
    const sort = (req.query.sort as string) || 'newest';

    let filtered = [...products];

    if (search) {
      filtered = filtered.filter(
        (p) => p.title.toLowerCase().includes(search) || p.bakerName.toLowerCase().includes(search)
      );
    }

    if (category !== 'all') {
      filtered = filtered.filter((p) => p.category.toLowerCase() === category.toLowerCase());
    }

    if (stock !== 'all') {
      filtered = filtered.filter((p) => (stock === 'in_stock' ? p.inStock : !p.inStock));
    }

    if (popular !== 'all') {
      filtered = filtered.filter((p) => (popular === 'popular' ? p.isPopular : !p.isPopular));
    }

    // Sort
    if (sort === 'newest') {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sort === 'oldest') {
      filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sort === 'price_asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sort === 'price_desc') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sort === 'highest_rated') {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (sort === 'most_popular') {
      filtered.sort((a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0));
    }

    res.json({ success: true, count: filtered.length, products: filtered });
  });

  // GET /api/v1/products/:id
  app.get('/api/v1/products/:id', (req: Request, res: Response) => {
    const product = products.find((p) => p.id === req.params.id);
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found.' });
      return;
    }
    res.json({ success: true, product });
  });

  // POST /api/v1/products
  app.post('/api/v1/products', requireAdminAuth, (req: Request, res: Response) => {
    const {
      title,
      description,
      price,
      category,
      bakerName,
      bakerTitle,
      bakerAvatar,
      ingredients,
      rating,
      reviewsCount,
      isPopular,
      inStock,
      image,
    } = req.body;

    if (!title || price === undefined || !category) {
      res.status(422).json({
        success: false,
        message: 'Validation failed. Title, Price, and Category are required.',
      });
      return;
    }

    const newProduct: Product = {
      id: `prod_${Date.now()}`,
      title,
      description: description || '',
      price: Number(price),
      category,
      bakerName: bakerName || 'Bakery Culinary Team',
      bakerTitle: bakerTitle || 'Pastry Specialist',
      bakerAvatar:
        bakerAvatar ||
        'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=400&q=80',
      ingredients: Array.isArray(ingredients) ? ingredients : [],
      rating: rating !== undefined ? Number(rating) : 5.0,
      reviewsCount: reviewsCount !== undefined ? Number(reviewsCount) : 0,
      isPopular: Boolean(isPopular),
      inStock: inStock !== undefined ? Boolean(inStock) : true,
      image: image || 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=800&q=80',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    products.unshift(newProduct);

    const admin = (req as any).adminUser;
    logAudit(admin.name, admin.email, 'Created Product', 'product', newProduct.id, { title: newProduct.title });

    res.status(201).json({ success: true, message: 'Product created successfully.', product: newProduct });
  });

  // PUT /api/v1/products/:id
  app.put('/api/v1/products/:id', requireAdminAuth, (req: Request, res: Response) => {
    const index = products.findIndex((p) => p.id === req.params.id);
    if (index === -1) {
      res.status(404).json({ success: false, message: 'Product not found.' });
      return;
    }

    const current = products[index];
    const updated: Product = {
      ...current,
      ...req.body,
      id: current.id,
      updatedAt: new Date().toISOString(),
    };

    products[index] = updated;

    const admin = (req as any).adminUser;
    logAudit(admin.name, admin.email, 'Updated Product', 'product', updated.id, { title: updated.title });

    res.json({ success: true, message: 'Product updated successfully.', product: updated });
  });

  // DELETE /api/v1/products/:id
  app.delete('/api/v1/products/:id', requireAdminAuth, (req: Request, res: Response) => {
    const index = products.findIndex((p) => p.id === req.params.id);
    if (index === -1) {
      res.status(404).json({ success: false, message: 'Product not found.' });
      return;
    }

    const removed = products.splice(index, 1)[0];
    const admin = (req as any).adminUser;
    logAudit(admin.name, admin.email, 'Deleted Product', 'product', removed.id, { title: removed.title });

    res.json({ success: true, message: `Product "${removed.title}" removed successfully.` });
  });

  // ------------------------------------------
  // Orders Management Endpoints
  // ------------------------------------------

  // GET /api/v1/orders/all
  app.get('/api/v1/orders/all', requireAdminAuth, (req: Request, res: Response) => {
    const search = ((req.query.search as string) || '').trim().toLowerCase();
    const status = (req.query.status as string) || 'all';
    const dateRange = (req.query.dateRange as string) || 'all';
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;

    let filtered = [...orders];

    if (search) {
      filtered = filtered.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(search) ||
          o.customerName.toLowerCase().includes(search) ||
          o.customerEmail.toLowerCase().includes(search)
      );
    }

    if (status !== 'all') {
      filtered = filtered.filter((o) => o.status === status);
    }

    if (dateRange !== 'all') {
      const now = new Date().getTime();
      let threshold = 0;
      if (dateRange === 'today') {
        const d = new Date();
        threshold = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      } else if (dateRange === '7d') {
        threshold = now - 7 * 24 * 60 * 60 * 1000;
      } else if (dateRange === '30d') {
        threshold = now - 30 * 24 * 60 * 60 * 1000;
      }
      if (threshold > 0) {
        filtered = filtered.filter((o) => new Date(o.createdAt).getTime() >= threshold);
      }
    }

    // Sort newest first
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = filtered.length;
    const startIndex = (page - 1) * limit;
    const paginated = filtered.slice(startIndex, startIndex + limit);

    res.json({
      success: true,
      orders: paginated,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  });

  // GET /api/v1/orders/:id
  app.get('/api/v1/orders/:id', requireAdminAuth, (req: Request, res: Response) => {
    const order = orders.find((o) => o.id === req.params.id || o.orderNumber === req.params.id);
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found.' });
      return;
    }
    res.json({ success: true, order });
  });

  // PUT /api/v1/orders/:id/status
  app.put('/api/v1/orders/:id/status', requireAdminAuth, (req: Request, res: Response) => {
    const order = orders.find((o) => o.id === req.params.id || o.orderNumber === req.params.id);
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found.' });
      return;
    }

    const { status, note } = req.body;
    const allowed = ['pending', 'processing', 'completed', 'cancelled'];
    if (!allowed.includes(status)) {
      res.status(400).json({ success: false, message: `Status must be one of: ${allowed.join(', ')}` });
      return;
    }

    const previousStatus = order.status;
    order.status = status;
    order.updatedAt = new Date().toISOString();

    const admin = (req as any).adminUser;
    order.statusHistory.push({
      status,
      timestamp: new Date().toISOString(),
      note: note || `Status transitioned to ${status}`,
      adminName: admin.name,
    });

    logAudit(admin.name, admin.email, `Updated Order Status to ${status}`, 'order', order.id, {
      orderNumber: order.orderNumber,
      previousStatus,
      newStatus: status,
      note,
    });

    res.json({ success: true, message: `Order status updated to ${status}`, order });
  });

  // ------------------------------------------
  // Custom Cake Requests Endpoints
  // ------------------------------------------

  // GET /api/v1/customizations/all-requests
  app.get('/api/v1/customizations/all-requests', requireAdminAuth, (req: Request, res: Response) => {
    const search = ((req.query.search as string) || '').trim().toLowerCase();
    const status = (req.query.status as string) || 'all';

    let filtered = [...customRequests];

    if (search) {
      filtered = filtered.filter(
        (r) =>
          r.requestNumber.toLowerCase().includes(search) ||
          r.customerName.toLowerCase().includes(search) ||
          r.flavor.toLowerCase().includes(search) ||
          r.baseProduct.toLowerCase().includes(search)
      );
    }

    if (status !== 'all') {
      filtered = filtered.filter((r) => r.status === status);
    }

    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json({ success: true, count: filtered.length, requests: filtered });
  });

  // GET /api/v1/customizations/request/:id
  app.get('/api/v1/customizations/request/:id', requireAdminAuth, (req: Request, res: Response) => {
    const request = customRequests.find((r) => r.id === req.params.id || r.requestNumber === req.params.id);
    if (!request) {
      res.status(404).json({ success: false, message: 'Custom cake request not found.' });
      return;
    }
    res.json({ success: true, request });
  });

  // PUT /api/v1/customizations/request/:id/status
  app.put('/api/v1/customizations/request/:id/status', requireAdminAuth, (req: Request, res: Response) => {
    const request = customRequests.find((r) => r.id === req.params.id || r.requestNumber === req.params.id);
    if (!request) {
      res.status(404).json({ success: false, message: 'Custom cake request not found.' });
      return;
    }

    const { status, adminNotes, estimatedCost } = req.body;
    const allowed = ['pending', 'approved', 'rejected', 'completed'];
    if (!allowed.includes(status)) {
      res.status(400).json({ success: false, message: `Status must be one of: ${allowed.join(', ')}` });
      return;
    }

    const previousStatus = request.status;
    request.status = status;
    if (adminNotes !== undefined) request.adminNotes = adminNotes;
    if (estimatedCost !== undefined) request.estimatedCost = Number(estimatedCost);
    request.updatedAt = new Date().toISOString();

    const admin = (req as any).adminUser;
    logAudit(admin.name, admin.email, `Custom Request Status: ${status}`, 'custom_request', request.id, {
      requestNumber: request.requestNumber,
      previousStatus,
      newStatus: status,
      adminNotes,
    });

    res.json({ success: true, message: `Request status updated to ${status}`, request });
  });

  // ------------------------------------------
  // Courses Management Endpoints
  // ------------------------------------------

  // GET /api/v1/courses
  app.get('/api/v1/courses', (req: Request, res: Response) => {
    const search = ((req.query.search as string) || '').trim().toLowerCase();
    const category = (req.query.category as string) || 'all';

    let filtered = [...courses];

    if (search) {
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(search) ||
          c.author.toLowerCase().includes(search) ||
          c.tag.toLowerCase().includes(search)
      );
    }

    if (category !== 'all') {
      filtered = filtered.filter((c) => c.category.toLowerCase() === category.toLowerCase());
    }

    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json({ success: true, count: filtered.length, courses: filtered });
  });

  // GET /api/v1/courses/:id
  app.get('/api/v1/courses/:id', (req: Request, res: Response) => {
    const course = courses.find((c) => c.id === req.params.id);
    if (!course) {
      res.status(404).json({ success: false, message: 'Course not found.' });
      return;
    }
    const courseEnrollments = enrollments.filter((e) => e.courseId === course.id);
    res.json({ success: true, course, enrollments: courseEnrollments });
  });

  // POST /api/v1/courses
  app.post('/api/v1/courses', requireAdminAuth, (req: Request, res: Response) => {
    const {
      title,
      author,
      authorAvatar,
      authorBio,
      duration,
      category,
      tag,
      tagColorTheme,
      rating,
      videoUrls,
      thumbnail,
      description,
    } = req.body;

    if (!title || !author || !category) {
      res.status(422).json({ success: false, message: 'Title, Author, and Category are required.' });
      return;
    }

    const newCourse: Course = {
      id: `crs_${Date.now()}`,
      title,
      author,
      authorAvatar:
        authorAvatar ||
        'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=400&q=80',
      authorBio: authorBio || '',
      duration: duration || '2.0 Hours · 6 Lessons',
      category: category || 'Beginner',
      tag: tag || 'Masterclass',
      tagColorTheme: tagColorTheme || 'amber',
      rating: rating !== undefined ? Number(rating) : 5.0,
      enrollmentsCount: 0,
      videoUrls: Array.isArray(videoUrls) ? videoUrls : [],
      thumbnail:
        thumbnail ||
        'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80',
      description: description || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    courses.unshift(newCourse);

    const admin = (req as any).adminUser;
    logAudit(admin.name, admin.email, 'Created Course', 'course', newCourse.id, { title: newCourse.title });

    res.status(201).json({ success: true, message: 'Course created successfully.', course: newCourse });
  });

  // PUT /api/v1/courses/:id
  app.put('/api/v1/courses/:id', requireAdminAuth, (req: Request, res: Response) => {
    const index = courses.findIndex((c) => c.id === req.params.id);
    if (index === -1) {
      res.status(404).json({ success: false, message: 'Course not found.' });
      return;
    }

    const current = courses[index];
    const updated: Course = {
      ...current,
      ...req.body,
      id: current.id,
      updatedAt: new Date().toISOString(),
    };

    courses[index] = updated;

    const admin = (req as any).adminUser;
    logAudit(admin.name, admin.email, 'Updated Course', 'course', updated.id, { title: updated.title });

    res.json({ success: true, message: 'Course updated successfully.', course: updated });
  });

  // DELETE /api/v1/courses/:id
  app.delete('/api/v1/courses/:id', requireAdminAuth, (req: Request, res: Response) => {
    const index = courses.findIndex((c) => c.id === req.params.id);
    if (index === -1) {
      res.status(404).json({ success: false, message: 'Course not found.' });
      return;
    }

    const removed = courses.splice(index, 1)[0];
    const admin = (req as any).adminUser;
    logAudit(admin.name, admin.email, 'Deleted Course', 'course', removed.id, { title: removed.title });

    res.json({ success: true, message: `Course "${removed.title}" removed successfully.` });
  });

  // ------------------------------------------
  // Enrollments Endpoints
  // ------------------------------------------

  // GET /api/v1/enrollments
  app.get('/api/v1/enrollments', requireAdminAuth, (req: Request, res: Response) => {
    const courseId = (req.query.courseId as string) || 'all';
    const status = (req.query.status as string) || 'all';
    const search = ((req.query.search as string) || '').trim().toLowerCase();

    let filtered = [...enrollments];

    if (courseId !== 'all') {
      filtered = filtered.filter((e) => e.courseId === courseId);
    }

    if (status !== 'all') {
      filtered = filtered.filter((e) => e.status === status);
    }

    if (search) {
      filtered = filtered.filter(
        (e) =>
          e.studentName.toLowerCase().includes(search) ||
          e.studentEmail.toLowerCase().includes(search) ||
          e.courseTitle.toLowerCase().includes(search)
      );
    }

    res.json({ success: true, count: filtered.length, enrollments: filtered });
  });

  // ------------------------------------------
  // Calculator Configuration & Stats Endpoints
  // ------------------------------------------

  // GET /api/v1/calculator/config
  app.get('/api/v1/calculator/config', (req: Request, res: Response) => {
    res.json({ success: true, config: calculatorConfig });
  });

  // PUT /api/v1/calculator/config
  app.put('/api/v1/calculator/config', requireAdminAuth, (req: Request, res: Response) => {
    const { defaultLaborCost, defaultPackagingCost, defaultProfitMargin, taxRate, deliveryFee, currency } = req.body;

    if (defaultLaborCost !== undefined) calculatorConfig.defaultLaborCost = Number(defaultLaborCost);
    if (defaultPackagingCost !== undefined) calculatorConfig.defaultPackagingCost = Number(defaultPackagingCost);
    if (defaultProfitMargin !== undefined) calculatorConfig.defaultProfitMargin = Number(defaultProfitMargin);
    if (taxRate !== undefined) calculatorConfig.taxRate = Number(taxRate);
    if (deliveryFee !== undefined) calculatorConfig.deliveryFee = Number(deliveryFee);
    if (currency) calculatorConfig.currency = currency;

    const admin = (req as any).adminUser;
    logAudit(admin.name, admin.email, 'Updated Bakery Calculator Config', 'calculator', undefined, calculatorConfig);

    res.json({ success: true, message: 'Calculator parameters updated successfully.', config: calculatorConfig });
  });

  // GET /api/v1/calculator/stats
  app.get('/api/v1/calculator/stats', requireAdminAuth, (req: Request, res: Response) => {
    res.json({ success: true, stats: calculatorStats });
  });

  // ------------------------------------------
  // Media Management Endpoints
  // ------------------------------------------

  // GET /api/v1/media
  app.get('/api/v1/media', requireAdminAuth, (req: Request, res: Response) => {
    const category = (req.query.category as string) || 'all';
    let filtered = [...mediaItems];
    if (category !== 'all') {
      filtered = filtered.filter((m) => m.category === category);
    }
    filtered.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
    res.json({ success: true, count: filtered.length, media: filtered });
  });

  // POST /api/v1/media
  app.post('/api/v1/media', requireAdminAuth, (req: Request, res: Response) => {
    const { name, url, category, type, sizeBytes } = req.body;
    if (!name || !url) {
      res.status(400).json({ success: false, message: 'Name and URL are required.' });
      return;
    }

    const newItem: MediaItem = {
      id: `med_${Date.now()}`,
      name,
      type: type || 'image',
      url,
      sizeBytes: sizeBytes || 524000,
      category: category || 'product',
      uploadedAt: new Date().toISOString(),
    };

    mediaItems.unshift(newItem);

    const admin = (req as any).adminUser;
    logAudit(admin.name, admin.email, 'Uploaded Media Asset', 'media', newItem.id, { name: newItem.name });

    res.status(201).json({ success: true, message: 'Media added successfully.', media: newItem });
  });

  // DELETE /api/v1/media/:id
  app.delete('/api/v1/media/:id', requireAdminAuth, (req: Request, res: Response) => {
    const index = mediaItems.findIndex((m) => m.id === req.params.id);
    if (index === -1) {
      res.status(404).json({ success: false, message: 'Media item not found.' });
      return;
    }

    const removed = mediaItems.splice(index, 1)[0];
    const admin = (req as any).adminUser;
    logAudit(admin.name, admin.email, 'Deleted Media Asset', 'media', removed.id, { name: removed.name });

    res.json({ success: true, message: 'Media deleted successfully.' });
  });

  // ------------------------------------------
  // Notifications Endpoints
  // ------------------------------------------

  // GET /api/v1/notifications
  app.get('/api/v1/notifications', requireAdminAuth, (req: Request, res: Response) => {
    res.json({ success: true, count: notifications.length, notifications });
  });

  // PUT /api/v1/notifications/:id/read
  app.put('/api/v1/notifications/:id/read', requireAdminAuth, (req: Request, res: Response) => {
    const notif = notifications.find((n) => n.id === req.params.id);
    if (notif) {
      notif.read = true;
    }
    res.json({ success: true, message: 'Notification marked as read.' });
  });

  // PUT /api/v1/notifications/read-all
  app.put('/api/v1/notifications/read-all', requireAdminAuth, (req: Request, res: Response) => {
    notifications.forEach((n) => {
      n.read = true;
    });
    res.json({ success: true, message: 'All notifications marked as read.' });
  });

  // ------------------------------------------
  // Audit Logs Endpoints
  // ------------------------------------------

  // GET /api/v1/admin/audit-logs
  app.get('/api/v1/admin/audit-logs', requireAdminAuth, (req: Request, res: Response) => {
    const resourceType = (req.query.resourceType as string) || 'all';
    let filtered = [...auditLogs];
    if (resourceType !== 'all') {
      filtered = filtered.filter((l) => l.resourceType === resourceType);
    }
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json({ success: true, count: filtered.length, logs: filtered });
  });
}

// ==========================================
// Server Initialization
// ==========================================

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));

  // Register API routes
  setupApiRoutes(app);

  // Serve Frontend
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    // Mount Vite dev server in middleware mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`[Bakery Admin] Server listening on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start Bakery Admin server:', err);
  process.exit(1);
});
