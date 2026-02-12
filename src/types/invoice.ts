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

// ==========================================
// FacturaIA - Client Invoice Types (DGII)
// Corresponde a tabla: facturas_clientes
// ==========================================

export type InvoiceStatus = 'pendiente' | 'procesado' | 'procesada' | 'completado' | 'completada' | 'rechazado';

export type NCFType = 'B01' | 'B02' | 'B04' | 'B14' | 'B15' | 'B16' | 'B17' |
                      'E31' | 'E32' | 'E34' | 'E41' | 'E43' | 'E44' | 'E45' | 'E46' | 'E47';

export type ISCCategory = 'telecom' | 'seguros' | 'alcohol' | 'tabaco' | 'vehiculos' | 'hidrocarburos' | 'otros';

export type RetencionISRTipo = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
// 1=Alquileres, 2=Honorarios, 3=Otras rentas, 4=Presuntas,
// 5=Intereses PJ, 6=Intereses PF, 7=Estado, 8=Telefonicos

/**
 * ClientInvoice - Factura escaneada por cliente
 * Corresponde a la tabla facturas_clientes en PostgreSQL
 */
export interface ClientInvoice {
  id: string;
  cliente_id: string;
  empresa_id?: string | null;

  // Archivo
  archivo_url: string;
  archivo_nombre?: string;
  archivo_size?: number;

  // Documento
  tipo_documento?: string;
  fecha_documento?: string | null; // ISO date
  ncf?: string;
  tipo_ncf?: NCFType | string;
  ncf_vencimiento?: string | null; // ISO date - NUEVO

  // Proveedor
  proveedor?: string;
  emisor_rnc?: string;
  receptor_nombre?: string;
  receptor_rnc?: string;

  // Montos base
  monto: number;
  subtotal: number;
  descuento: number;                  // NUEVO - Afecta base imponible ITBIS

  // ITBIS (18%)
  itbis: number;
  itbis_retenido: number;
  itbis_exento: number;               // NUEVO - IT-1 casilla 4
  itbis_proporcionalidad: number;     // Art. 349
  itbis_costo: number;                // ITBIS no deducible

  // ISR Retenciones
  isr: number;                        // Monto retencion
  retencion_isr_tipo?: RetencionISRTipo | null;

  // ISC (Impuesto Selectivo al Consumo)
  isc: number;
  isc_categoria?: ISCCategory | string;

  // Otros cargos
  cdt_monto: number;                  // Contribucion Desarrollo Telecom (2%)
  cargo_911: number;                  // Contribucion al 911
  propina: number;                    // Propina legal 10%
  otros_impuestos: number;
  otros_impuestos_detalle?: string;
  monto_no_facturable: number;        // NUEVO - Propinas voluntarias, reembolsos

  // Forma de pago
  forma_pago?: string;
  tipo_bien_servicio?: string;

  // Estado y notas
  estado: InvoiceStatus;
  notas_cliente?: string;
  notas_contador?: string;

  // OCR/IA
  confidence_score: number;
  raw_ocr_json?: string;
  items_json?: string;

  // Auditoria
  created_at: string;
  procesado_por?: string | null;
  procesado_at?: string | null;
}

/**
 * ClientInvoiceCreate - Datos para crear nueva factura
 */
export interface ClientInvoiceCreate {
  cliente_id: string;
  archivo_url: string;
  archivo_nombre?: string;
  archivo_size?: number;

  tipo_documento?: string;
  fecha_documento?: string;
  ncf?: string;
  tipo_ncf?: string;
  ncf_vencimiento?: string;

  proveedor?: string;
  emisor_rnc?: string;
  receptor_nombre?: string;
  receptor_rnc?: string;

  monto?: number;
  subtotal?: number;
  descuento?: number;

  itbis?: number;
  itbis_retenido?: number;
  itbis_exento?: number;
  itbis_proporcionalidad?: number;
  itbis_costo?: number;

  isr?: number;
  retencion_isr_tipo?: RetencionISRTipo;

  isc?: number;
  isc_categoria?: string;

  cdt_monto?: number;
  cargo_911?: number;
  propina?: number;
  otros_impuestos?: number;
  otros_impuestos_detalle?: string;
  monto_no_facturable?: number;

  forma_pago?: string;
  tipo_bien_servicio?: string;

  estado?: InvoiceStatus;
  notas_cliente?: string;

  confidence_score?: number;
  raw_ocr_json?: string;
  items_json?: string;
}

/**
 * ClientStats - Estadisticas del cliente
 */
export interface ClientStats {
  total_facturas: number;
  pendientes: number;
  procesadas: number;
  monto_total: number;
  itbis_total: number;
}

/**
 * OCR Response from Backend (facturaia-ocr)
 */
export interface FacturaIAOCRResponse {
  success: boolean;
  data?: {
    ncf?: string;
    tipo_ncf?: string;
    ncf_vencimiento?: string;
    emisor_rnc?: string;
    proveedor?: string;
    fecha_documento?: string;

    monto_servicios?: number;
    monto_bienes?: number;
    subtotal?: number;
    descuento?: number;

    itbis?: number;
    itbis_exento?: number;
    isc?: number;
    isc_categoria?: string;
    cdt_monto?: number;
    cargo_911?: number;
    propina?: number;
    otros_impuestos?: number;
    monto_no_facturable?: number;

    itbis_retenido?: number;
    isr?: number;
    retencion_isr_tipo?: number;

    monto?: number;
    forma_pago?: string;

    confidence_score?: number;
    items?: Array<{
      descripcion: string;
      cantidad: number;
      precio_unitario: number;
      total: number;
    }>;
  };
  error?: string;
}

/**
 * Type guard for ClientInvoice
 */
export const isClientInvoice = (obj: any): obj is ClientInvoice => {
  return (
    obj &&
    typeof obj.id === 'string' &&
    typeof obj.cliente_id === 'string' &&
    typeof obj.monto === 'number' &&
    typeof obj.estado === 'string'
  );
};
