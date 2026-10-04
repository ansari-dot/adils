export type UserRole = 'admin' | 'user';
export type AccountStatus = 'active' | 'suspended';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  phone?: string;
  theme?: 'light' | 'dark' | 'system';
  status: AccountStatus;
  createdAt?: string;
}

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  phone?: string;
  status: AccountStatus;
  createdAt: string;
  ordersCount: number;
}

export interface UserDetail {
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    avatar: string;
    phone?: string;
    theme: 'light' | 'dark' | 'system';
    status: AccountStatus;
    createdAt: string;
    updatedAt: string;
  };
  orders: Order[];
  enrollments: Enrollment[];
  customRequests: CustomCakeRequest[];
  wishlist: Product[];
}

export type ProductCategory = 'Cakes' | 'Pastries' | 'Keto' | 'Cookies' | 'Bread';

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: ProductCategory;
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

export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';

export interface StatusTimelineEntry {
  status: OrderStatus;
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
  status: OrderStatus;
  shippingAddress: ShippingAddress;
  paymentStatus: 'paid' | 'pending' | 'refunded';
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
  statusHistory: StatusTimelineEntry[];
}

export type CustomRequestStatus = 'pending' | 'approved' | 'rejected' | 'completed';

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
  status: CustomRequestStatus;
  estimatedCost?: number;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export type CourseCategory = 'Beginner' | 'Intermediate' | 'Advanced';

export interface Course {
  id: string;
  title: string;
  author: string;
  authorAvatar: string;
  authorBio?: string;
  duration: string;
  category: CourseCategory;
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

export type EnrollmentStatus = 'not_started' | 'in_progress' | 'completed';

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
  status: EnrollmentStatus;
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

export interface CalculatorStats {
  totalCalculations: number;
  calculationsToday: number;
  calculationsThisWeek: number;
  popularRecipes: Array<{
    recipe: string;
    count: number;
    avgEstimatedCost: number;
  }>;
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

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'custom_request' | 'stock' | 'user' | 'course' | 'system';
  read: boolean;
  link: string;
  createdAt: string;
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

export interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  pendingCustomRequests: number;
  totalCourses: number;
  totalEnrollments: number;
  totalRevenue: number;
  todayRevenue: number;
  weekRevenue: number;
  monthRevenue: number;
  ordersToday: number;
  ordersThisWeek: number;
  ordersThisMonth: number;
  lowStockCount: number;
}

export interface RevenueDataPoint {
  date: string;
  revenue: number;
  ordersCount: number;
}

export interface PopularProduct {
  id: string;
  title: string;
  category: ProductCategory;
  image: string;
  price: number;
  orders: number;
  revenue: number;
}

export interface GlobalSearchResults {
  users: UserSummary[];
  products: Product[];
  orders: Order[];
  courses: Course[];
  customRequests: CustomCakeRequest[];
}
