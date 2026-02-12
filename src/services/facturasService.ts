/**
 * facturasService.ts - Servicio de Facturas
 * Upload, listado, detalle y resumen
 */

import { api } from '../utils/apiClient';

// Tipos
export interface Factura {
  id: string;
  cliente_id: string;
  empresa_id?: string;

  // Datos del comprobante
  ncf: string;
  tipo_ncf?: string;
  ncf_vencimiento?: string;           // NUEVO - Fecha limite NCF

  // Emisor/Proveedor
  emisor_rnc?: string;
  proveedor?: string;
  receptor_nombre?: string;
  receptor_rnc?: string;

  // Fechas
  fecha_documento?: string;

  // Montos base
  subtotal: number;
  descuento: number;                  // NUEVO - Afecta base imponible ITBIS
  monto: number;                      // Total final

  // ITBIS (18%)
  itbis: number;
  itbis_retenido: number;
  itbis_exento: number;               // NUEVO - IT-1 casilla 4
  itbis_proporcionalidad: number;     // Art. 349
  itbis_costo: number;                // ITBIS no deducible

  // ISR Retenciones
  isr: number;
  retencion_isr_tipo?: number;        // Codigo 1-8

  // ISC (Impuesto Selectivo al Consumo)
  isc: number;
  isc_categoria?: string;

  // Otros cargos DGII
  cdt_monto: number;                  // Contribucion Desarrollo Telecom (2%)
  cargo_911: number;                  // Contribucion al 911
  propina: number;                    // Propina legal 10%
  otros_impuestos: number;
  otros_impuestos_detalle?: string;
  monto_no_facturable: number;        // NUEVO - Propinas voluntarias, reembolsos

  // Clasificacion
  forma_pago?: string;
  tipo_bien_servicio?: string;

  // Estado
  estado: 'pendiente' | 'procesado' | 'procesada' | 'completado' | 'completada' | 'error' | 'validado' | 'rechazado';

  // Imagen
  archivo_url?: string;
  archivo_nombre?: string;
  archivo_size?: number;

  // Notas
  notas_cliente?: string;
  notas_contador?: string;

  // OCR/IA
  raw_ocr_json?: string;
  items_json?: string;
  confidence_score?: number;

  // Auditoria
  created_at: string;
  procesado_por?: string;
  procesado_at?: string;
}

export interface FacturaResumen {
  total_facturas: number;
  facturas_mes: number;
  itbis_mes: number;
  itbis_retenido_mes: number;
  isr_mes: number;
  isc_mes: number;
  total_mes: number;
  pendientes: number;
  procesadas: number;
  errores: number;
}

// Tipos para validación de impuestos DGII
export interface ValidationError {
  field: string;
  error: string;
  severity: 'error' | 'warning';
}

export interface ValidationComputed {
  base_gravada: number;
  itbis_esperado: number;
  total_esperado: number;
  monto_facturado: number;
}

export interface ValidationResult {
  valid: boolean;
  needs_review: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  computed: ValidationComputed;
}

export interface InvoiceProcessResponse {
  invoice_id: string;
  extraction_status: 'validated' | 'review' | 'error' | 'pending';
  data: Factura;
  validation: ValidationResult;
  image_url: string;
}

export interface ListaFacturasParams {
  page?: number;
  limit?: number;
  estado?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
  buscar?: string;
}

export interface ListaFacturasResponse {
  facturas: Factura[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

/**
 * Subir y procesar factura (OCR) - Versión básica
 */
export const subirFactura = async (imagenUri: string): Promise<Factura> => {
  const formData = new FormData();

  // Preparar imagen para upload
  const filename = imagenUri.split('/').pop() || 'factura.jpg';
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : 'image/jpeg';

  formData.append('image', {
    uri: imagenUri,
    name: filename,
    type,
  } as any);

  const response = await api.upload<{ success: boolean; invoice: Factura; error?: string }>('/api/facturas/upload/', formData);
  if (!response.success || !response.invoice) {
    throw new Error(response.error || 'Error al procesar la factura');
  }
  return response.invoice;
};

/**
 * Subir y procesar factura con validación completa
 * Retorna datos extraídos + resultado de validación DGII
 */
export const subirFacturaConValidacion = async (imagenUri: string): Promise<InvoiceProcessResponse> => {
  const formData = new FormData();

  // Preparar imagen para upload
  const filename = imagenUri.split('/').pop() || 'factura.jpg';
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : 'image/jpeg';

  formData.append('image', {
    uri: imagenUri,
    name: filename,
    type,
  } as any);

  const response = await api.upload<{
    success: boolean;
    invoice_id: string;
    extraction_status: 'validated' | 'review' | 'error' | 'pending';
    data: Factura;
    validation: ValidationResult;
    image_url: string;
    error?: string;
  }>('/api/facturas/upload/', formData);

  if (!response.success) {
    throw new Error(response.error || 'Error al procesar la factura');
  }

  return {
    invoice_id: response.invoice_id,
    extraction_status: response.extraction_status,
    data: response.data,
    validation: response.validation,
    image_url: response.image_url,
  };
};

/**
 * Validar campos de factura (sin guardar)
 */
export const validarFactura = async (campos: Record<string, any>): Promise<ValidationResult> => {
  const response = await api.post<{ success: boolean; data: ValidationResult; error?: string }>(
    '/api/v1/invoices/validate',
    campos
  );
  if (!response.success) {
    throw new Error(response.error || 'Error al validar');
  }
  return response.data;
};

/**
 * Aprobar factura (cambiar status a validated)
 */
export const aprobarFactura = async (id: string, campos: Record<string, any>): Promise<Factura> => {
  const response = await api.put<{ success: boolean; factura: Factura; error?: string }>(
    `/api/facturas/${id}/approve`,
    { ...campos, extraction_status: 'validated' }
  );
  if (!response.success) {
    throw new Error(response.error || 'Error al aprobar factura');
  }
  return response.factura;
};

/**
 * Actualizar factura con correcciones
 */
export const actualizarFactura = async (id: string, campos: Record<string, any>): Promise<Factura> => {
  const response = await api.put<{ success: boolean; factura: Factura; error?: string }>(
    `/api/facturas/${id}/update`,
    campos
  );
  if (!response.success) {
    throw new Error(response.error || 'Error al actualizar factura');
  }
  return response.factura;
};

/**
 * Listar facturas del cliente autenticado
 */
export const listarFacturas = async (params?: ListaFacturasParams): Promise<ListaFacturasResponse> => {
  const queryParams = new URLSearchParams();

  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.estado) queryParams.append('estado', params.estado);
  if (params?.fecha_desde) queryParams.append('fecha_desde', params.fecha_desde);
  if (params?.fecha_hasta) queryParams.append('fecha_hasta', params.fecha_hasta);
  if (params?.buscar) queryParams.append('buscar', params.buscar);

  const query = queryParams.toString();
  const endpoint = `/api/facturas/mis-facturas/${query ? `?${query}` : ''}`;

  return api.get<ListaFacturasResponse>(endpoint);
};

/**
 * Obtener detalle de una factura
 */
export const obtenerFactura = async (id: string): Promise<Factura> => {
  const response = await api.get<{ factura: Factura }>(`/api/facturas/${id}`);
  return response.factura;
};

/**
 * Obtener resumen de facturas del cliente
 */
export const obtenerResumen = async (): Promise<FacturaResumen> => {
  const response = await api.get<{ resumen: FacturaResumen }>('/api/facturas/resumen');
  return response.resumen;
};

/**
 * Eliminar una factura
 */
export const eliminarFactura = async (id: string): Promise<void> => {
  await api.delete(`/api/facturas/${id}`);
};

/**
 * Reprocesar OCR de una factura
 */
export const reprocesarFactura = async (id: string): Promise<Factura> => {
  const response = await api.post<{ factura: Factura }>(`/api/facturas/${id}/reprocesar`);
  return response.factura;
};

export default {
  subirFactura,
  subirFacturaConValidacion,
  validarFactura,
  aprobarFactura,
  actualizarFactura,
  listarFacturas,
  obtenerFactura,
  obtenerResumen,
  eliminarFactura,
  reprocesarFactura,
};
