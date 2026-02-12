/**
 * TypeScript type definitions for Invoice/Receipt entities
 *
 * These types correspond to:
 * - Supabase database schema (supabase-schema-facturas.sql)
 * - Railway OCR service response (invoice-ocr-service)
 */

// ==========================================
// Receipt/Invoice Types
// ==========================================

export type ReceiptStatus = 'OPEN' | 'RESOLVED' | 'DISPUTED';

export interface Receipt {
  id: string;
  name: string;
  amount: number;
  date: string; // ISO date string
  resolved_date?: string | null;
  paid_by_user_id: string;
  group_id: string;
  status: ReceiptStatus;
  created_at: string;
  updated_at: string;
}

export interface ReceiptImage {
  id: string;
  receipt_id: string;
  image_url: string;
  created_at: string;
}

export interface ReceiptItem {
  id: string;
  receipt_id: string;
  name: string;
  amount: number;
  quantity: number;
  status: 'OPEN' | 'RESOLVED';
  created_at: string;
  updated_at: string;
}

// ==========================================
// OCR/AI Service Types (Railway)
// ==========================================

export interface OCRItem {
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface OCRResponse {
  vendor: string;
  date: string; // YYYY-MM-DD format
  total: number;
  subtotal?: number;
  tax?: number;
  items: OCRItem[];
  category?: string;
  tags?: string[];
}

export interface ProcessInvoiceResponse {
  success: boolean;
  invoice?: OCRResponse;
  error?: string;
  ocrDuration?: number;
  aiDuration?: number;
  totalDuration?: number;
}

// ==========================================
// User & Authentication Types
// ==========================================

export interface UserProfile {
  id: string;
  email: string;
  display_name?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
  profile?: UserProfile;
}

// ==========================================
// Group & Category Types
// ==========================================

export interface Group {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  user_role: 'ADMIN' | 'USER';
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string | null;
  group_id: string;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: string;
  name: string;
  description?: string | null;
  group_id: string;
  created_at: string;
  updated_at: string;
}

// ==========================================
// UI/Form Types
// ==========================================

export interface ReceiptFormData {
  name: string;
  amount: number;
  date: Date;
  category_id?: string;
  tag_ids?: string[];
  group_id: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignUpFormData {
  email: string;
  password: string;
  confirmPassword: string;
  displayName?: string;
}

// ==========================================
// Navigation Types
// ==========================================

export type RootStackParamList = {
  Login: undefined;
  Camera: {groupId: string};
  InvoiceList: {groupId: string};
  InvoiceDetail: {receiptId: string};
  Settings: undefined;
};

// ==========================================
// API Request/Response Types
// ==========================================

export interface CreateReceiptRequest {
  name: string;
  amount: number;
  date: string;
  group_id: string;
  paid_by_user_id: string;
  category_id?: string;
  status?: ReceiptStatus;
}

export interface UpdateReceiptRequest {
  name?: string;
  amount?: number;
  date?: string;
  status?: ReceiptStatus;
  resolved_date?: string;
}

export interface UploadImageRequest {
  receiptId: string;
  imageUri: string;
  fileName: string;
}

// ==========================================
// Error Types
// ==========================================

export interface AppError {
  code: string;
  message: string;
  details?: any;
}

export class OCRError extends Error {
  constructor(message: string, public details?: any) {
    super(message);
    this.name = 'OCRError';
  }
}

export class SupabaseError extends Error {
  constructor(message: string, public details?: any) {
    super(message);
    this.name = 'SupabaseError';
  }
}

// ==========================================
// Utility Types
// ==========================================

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: AppError;
}

// ==========================================
// Camera/Image Types
// ==========================================

export interface CameraPermissions {
  camera: boolean;
  photos: boolean;
}

export interface CapturedImage {
  uri: string;
  width: number;
  height: number;
  base64?: string;
}

// ==========================================
// Search & Filter Types
// ==========================================

export interface ReceiptFilter {
  groupId?: string;
  status?: ReceiptStatus[];
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  categoryId?: string;
  tagIds?: string[];
  searchQuery?: string;
}

export interface ReceiptSortOptions {
  field: 'date' | 'amount' | 'name' | 'created_at';
  direction: 'asc' | 'desc';
}

// ==========================================
// Statistics Types
// ==========================================

export interface ReceiptStatistics {
  totalReceipts: number;
  totalAmount: number;
  openReceipts: number;
  resolvedReceipts: number;
  averageAmount: number;
  byCategory: {
    category_name: string;
    count: number;
    total_amount: number;
  }[];
  byMonth: {
    month: string;
    count: number;
    total_amount: number;
  }[];
}

// ==========================================
// Type Guards
// ==========================================

export const isReceipt = (obj: any): obj is Receipt => {
  return (
    obj &&
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.amount === 'number' &&
    typeof obj.date === 'string'
  );
};

export const isOCRResponse = (obj: any): obj is OCRResponse => {
  return (
    obj &&
    typeof obj.vendor === 'string' &&
    typeof obj.date === 'string' &&
    typeof obj.total === 'number' &&
    Array.isArray(obj.items)
  );
};

export const isAppError = (obj: any): obj is AppError => {
  return (
    obj &&
    typeof obj.code === 'string' &&
    typeof obj.message === 'string'
  );
};
