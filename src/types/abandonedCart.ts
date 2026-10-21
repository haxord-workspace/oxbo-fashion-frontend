export type AbandonedCartStatus = 
  | 'abandoned'
  | 'notification_pending'
  | 'notified'
  | 'recovered'
  | 'expired'
  | 'unsubscribed';

export type NotificationChannel = 'email' | 'push' | 'in_app' | 'sms';

export interface AbandonedCartItem {
  productId?: string;
  name?: string;
  productName?: string;
  slug?: string;
  variantId?: string;
  sku?: string;
  size?: string;
  color?: string;
  thumbnail?: string;
  price?: number;
  unitPrice?: number;
  quantity: number;
  subtotal: number;
}

export interface NotificationHistoryEntry {
  _id?: string;
  stage: number;
  channel: NotificationChannel;
  timestamp?: string;
  sentAt?: string;
  status: 'sent' | 'delivered' | 'failed' | 'clicked' | 'opened';
  couponCode?: string;
  subject?: string;
  errorMessage?: string;
  messageId?: string;
}

export interface AbandonedCartUser {
  _id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
}

export interface AbandonedCart {
  _id: string;
  userId: AbandonedCartUser | string;
  cartId: string;
  items: AbandonedCartItem[];
  cartTotal?: number;
  discount?: number;
  grandTotal?: number;
  subtotal?: number;
  status: AbandonedCartStatus;
  recoveryToken: string;
  recoveryTokenExpiresAt?: string;
  recoveryUrl?: string;
  currentStage: number;
  nextNotificationScheduledAt?: string;
  notificationHistory: NotificationHistoryEntry[];
  isRecovered: boolean;
  recoveredOrderId?: {
    _id?: string;
    orderNumber?: string;
    grandTotal?: number;
    createdAt?: string;
  } | string;
  recoveredAmount?: number;
  clickCount: number;
  unsubscribed?: boolean;
  lastNotifiedAt?: string;
  lastActivityAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AbandonedCartStageConfig {
  stageNumber: number;
  delayMinutes: number;
  channels: NotificationChannel[];
  emailSubject: string;
  discountCouponCode?: string;
  discountPercentage?: number;
  isEnabled: boolean;
}

export interface AbandonedCartSettings {
  _id?: string;
  isEnabled: boolean;
  abandonmentThresholdMinutes: number;
  recoveryTokenExpiryDays: number;
  maxReminders: number;
  stages: AbandonedCartStageConfig[];
  createdAt?: string;
  updatedAt?: string;
}

export interface AbandonedCartStats {
  totalAbandoned: number;
  totalRecovered: number;
  totalRecoveredRevenue: number;
  conversionRate: number;
  activeCount: number;
}

export interface AbandonedCartQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AbandonedCartsResponse {
  carts: AbandonedCart[];
  total: number;
  page: number;
  pages: number;
  limit: number;
}

export interface SendRecoveryPayload {
  channel?: NotificationChannel | 'both';
  couponCode?: string;
  customMessage?: string;
}
