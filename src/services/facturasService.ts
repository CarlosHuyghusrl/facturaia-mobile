/**
 * facturasService.ts - Servicio de Facturas
 * Upload, listado, detalle y resumen
 */

import { api } from '../utils/apiClient';

// Tipos
export interface Factura {
  id: string;
  cliente_id: string;
  empresa_dominio: string;

  // Datos del comprobante
  ncf: string;
  tipo_comprobante: string;

  // Emisor
  emisor_rnc: string;
  emisor_nombre: string;

  // Fechas
  fecha_emision: string;
  fecha_vencimiento?: string;

  // Montos
  subtotal: number;
  itbis: number;
  total: number;

  // Estado
  estado: 'pendiente' | 'procesado' | 'error' | 'validado';
  estado_ocr: 'pendiente' | 'procesando' | 'completado' | 'error';

  // Imagen
  imagen_url?: string;
  imagen_path?: string;

  // Metadata
  raw_ocr_text?: string;
  confidence_score?: number;
  created_at: string;
  updated_at: string;
}

export interface FacturaResumen {
  total_facturas: number;
  facturas_mes: number;
  itbis_mes: number;
  total_mes: number;
  pendientes: number;
  procesadas: number;
  errores: number;
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
 * Subir y procesar factura (OCR)
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
  listarFacturas,
  obtenerFactura,
  obtenerResumen,
  eliminarFactura,
  reprocesarFactura,
};
