export interface CartProduct {
  id: string;
  slug: string;
  name: string;
  image: string;
  priceType: 'weight' | 'variant';
  pricePerKg?: number;
}

export interface CartItem {
  cartItemId: string;
  product: CartProduct;
  qty: number;
  weightInGrams?: number;
  variantName?: string;
  variantPrice?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  createdAt?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  active: boolean;
  productCount?: number;
  product_count?: number;
}

export interface WeightOption {
  value: number;
  unit: string;
}

export interface Variant {
  name: string;
  price: number;
}

export interface Product {
  id: string;
  _id?: string;
  slug: string;
  name: string;
  description?: string;
  image: string;
  images?: string[];
  category: string;
  priceType: 'weight' | 'variant';
  pricePerKg?: number;
  weightOptions?: WeightOption[];
  allowCustomWeight?: boolean;
  variants?: Variant[];
  available: boolean;
  isAvailable?: boolean;
  featured: boolean;
  isFeatured?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderItem {
  productId?: string;
  productName: string;
  qty: number;
  priceType: 'weight' | 'variant';
  selectedWeightInGrams?: number;
  pricePerKgAtTimeOfOrder?: number;
  selectedVariantName?: string;
  unitPriceAtTimeOfOrder?: number;
  calculatedPrice: number;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  email?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string;
  customerInfo: CustomerInfo;
  items: OrderItem[];
  totalAmount: number;
  deliveryCharge: number;
  orderType: 'pickup' | 'delivery';
  paymentMethod: 'cod' | 'qr';
  paymentStatus: 'pending' | 'paid';
  address?: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt?: string;
}

export interface NotificationItem {
  id: string;
  recipientType: 'USER' | 'ADMIN';
  recipientId: string;
  type: string;
  title: string;
  message: string;
  orderId?: string;
  read: boolean;
  createdAt: string;
  order?: {
    id: string;
    orderNumber: string;
    customerName: string;
    total: number;
    status: string;
    paymentStatus: string;
  };
}

export interface AdminStats {
  totalProducts: number;
  availableProducts: number;
  totalOrders: number;
  pendingOrders: number;
}
