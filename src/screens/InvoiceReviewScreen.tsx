/**
 * InvoiceReviewScreen - Pantalla de revisión post-OCR
 * Muestra campos extraídos editables con indicadores de validación
 * Permite aprobar o corregir facturas antes de guardar
 */

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {
  Text,
  Surface,
  TextInput,
  Button,
  IconButton,
  ActivityIndicator,
  Chip,
  Divider,
} from 'react-native-paper';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { api } from '../utils/apiClient';
import { checkDuplicateNCF } from '../services/facturasService';
import { SM_DASHBOARD_URL, SM_DASHBOARD_API_KEY } from '../config/api';

/**
 * W21prep — Hook validate-ncf (preparado para Wave 7 gestoriard)
 *
 * Cuando gestoriard exponga endpoint POST /api/v2/dgii/validate-ncf,
 * activar este hook descomentándolo + integrar el estado en el render
 * del campo NCF (badge color según validity).
 *
 * Estados esperados del backend:
 *   - vigente:           NCF activo en DGII OFV (verde ✓)
 *   - vencido:           NCF expirado (rojo)
 *   - not_found:         DGII no reconoce NCF (amarillo)
 *   - unknown_retry_later: query DGII falló transient (gris)
 *
 * Endpoint Wave 7 (cuando exista):
 *   POST https://gestoriard.com/api/v2/dgii/validate-ncf
 *   body: { ncf: string, rnc_emisor: string }
 *   response: { status: 'vigente'|'vencido'|'not_found'|'unknown_retry_later',
 *               fecha_vencimiento?: string }
 *
 * QR e-CF: cuando seguridad cierre con librería QR local, validar offline E31-E47.
 */
// import { useEffect, useState } from 'react';
// type NcfValidationStatus = 'vigente' | 'vencido' | 'not_found' | 'unknown_retry_later' | 'idle';
// type NcfValidationResult = {
//   status: NcfValidationStatus;
//   fecha_vencimiento?: string;
//   error?: string;
// };
// function useNcfValidation(ncf: string, rncEmisor: string): NcfValidationResult {
//   const [result, setResult] = useState<NcfValidationResult>({ status: 'idle' });
//   useEffect(() => {
//     if (!ncf || !rncEmisor) {
//       setResult({ status: 'idle' });
//       return;
//     }
//     // TODO Wave 7: llamar gestoriard /api/v2/dgii/validate-ncf
//     // const controller = new AbortController();
//     // fetch(`${GESTORIARD_BASE}/api/v2/dgii/validate-ncf`, {
//     //   method: 'POST',
//     //   headers: { 'Content-Type': 'application/json' },
//     //   body: JSON.stringify({ ncf, rnc_emisor: rncEmisor }),
//     //   signal: controller.signal,
//     // })
//     //   .then(r => r.json())
//     //   .then((data: NcfValidationResult) => setResult(data))
//     //   .catch(() => setResult({ status: 'unknown_retry_later', error: 'network' }));
//     // return () => controller.abort();
//   }, [ncf, rncEmisor]);
//   return result;
// }

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Tipos para validación
export interface ValidationError {
  field: string;
  error: string;
  severity: 'error' | 'warning';
  code?: string;
}

// Mapping de códigos de error backend → mensajes legibles en español
const ERROR_CODE_MESSAGES: Record<string, { title: string; description: string; severity: 'error' | 'warning' | 'info' }> = {
  missing_emisor_rnc: { title: 'Falta RNC del emisor', description: 'Edita el campo "RNC Emisor" y guarda para que aplique al 606.', severity: 'error' },
  invalid_ncf: { title: 'NCF inválido', description: 'El NCF debe tener al menos 11 caracteres (ej: B0100099999).', severity: 'error' },
  missing_date: { title: 'Falta fecha del documento', description: 'Edita el campo "Fecha" para incluir la factura en el período correcto.', severity: 'error' },
  invalid_amount: { title: 'Monto inválido', description: 'El monto debe ser mayor a 0.', severity: 'error' },
  consumer_final_b02: { title: 'Consumidor Final', description: 'NCF B02/E32 = consumidor final. Es gasto válido pero NO se incluye en el 606.', severity: 'info' },
  ncf_expired: { title: 'NCF vencido', description: 'Verifica la fecha del documento — el NCF parece vencido.', severity: 'warning' },
  itbis_mismatch: { title: 'ITBIS no coincide', description: 'ITBIS no es 18% de la base. Verifica si hay productos exentos o ISC.', severity: 'warning' },
  total_mismatch: { title: 'Total no coincide', description: 'El total no es la suma de subtotal + ITBIS + propina + ISC. Verifica.', severity: 'warning' },
  nota_credito_sin_referencia: { title: 'Nota de crédito sin referencia', description: 'Las notas de crédito requieren NCF de la factura original (campo ncfModifica).', severity: 'error' },
};

function getReadableMessage(code: string): { title: string; description: string; severity: 'error' | 'warning' | 'info' } {
  return ERROR_CODE_MESSAGES[code] ?? { title: code || 'Problema detectado', description: 'Verifica este campo.', severity: 'warning' };
}

// W18.9 — Mapa códigos error Backend → mensaje UX rico con valor recibido
const ENHANCED_ERROR_MESSAGES: Record<string, (received: string) => string> = {
  ncf_invalid_format: (received) =>
    `Formato NCF no reconocido. Esperado: B01XXXXXXXXX o E31XXXXXXXXX (11-13 chars). Recibido: "${received}"`,
  ncf_expired: (received) =>
    `NCF vencido. Verifica fecha vencimiento del comprobante. Recibido: "${received}"`,
  rnc_8_digitos_posible_corte: (received) =>
    `RNC con 8 dígitos detectado — posible corte OCR. Esperado: 9 u 11 dígitos. Recibido: "${received}"`,
  itbis_mismatch: (received) =>
    `ITBIS no coincide con 18% de base gravada. Verifica si es factura mixta o exenta. Calculado: "${received}"`,
  total_mismatch: (received) =>
    `Total no coincide con suma componentes. Verifica subtotal + ITBIS + otros. Calculado: "${received}"`,
  no_amounts: (_received) =>
    `No se detectó monto de servicios o bienes. Verifica que la factura tenga importe.`,
  missing_payment_date: (_received) =>
    `Fecha de pago requerida cuando hay retenciones (ITBIS/ISR).`,
  exento_sector_servicio_basico: (_received) =>
    `Servicio básico exento (electricidad/combustible/agua) — ITBIS=0 por ley.`,
  verificar_si_exento: (received) =>
    `ITBIS=0 detectado. Verifica si proveedor es exento por ley. Recibido: "${received}"`,
};

function getEnhancedMessage(errorCode: string, fieldValue: string | number | null | undefined): string | null {
  const fmt = ENHANCED_ERROR_MESSAGES[errorCode];
  if (!fmt) return null;
  return fmt(String(fieldValue ?? ''));
}

export interface ValidationResult {
  valid: boolean;
  needs_review: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  computed: {
    base_gravada: number;
    itbis_esperado: number;
    total_esperado: number;
    monto_facturado: number;
  };
}

export interface InvoiceData {
  ncf: string;
  fecha_emision: string;
  emisor_rnc: string;
  emisor_nombre: string;
  monto_servicios: number;
  monto_bienes: number;
  descuento: number;
  itbis_facturado: number;
  itbis_retenido: number;
  isc_monto: number;
  propina_legal: number;
  otros_impuestos: number;
  total_factura: number;
  retencion_isr_tipo: string;
  retencion_isr_monto: number;
}

interface ReviewParams {
  invoiceId: string;
  imageUrl: string;
  extractedData: InvoiceData;
  validation: ValidationResult;
  extractionStatus: string;
}

type RouteParams = {
  InvoiceReview: ReviewParams;
};

// Configuración de campos fiscales
const FISCAL_FIELDS = [
  { key: 'monto_servicios', label: 'Monto Servicios', type: 'currency' },
  { key: 'monto_bienes', label: 'Monto Bienes', type: 'currency' },
  { key: 'descuento', label: 'Descuento', type: 'currency' },
  { key: 'itbis_facturado', label: 'ITBIS Facturado', type: 'currency' },
  { key: 'itbis_retenido', label: 'ITBIS Retenido', type: 'currency' },
  { key: 'isc_monto', label: 'ISC', type: 'currency' },
  { key: 'propina_legal', label: 'Propina Legal (10%)', type: 'currency' },
  { key: 'otros_impuestos', label: 'Otros Impuestos', type: 'currency' },
  { key: 'retencion_isr_tipo', label: 'Tipo Retención ISR', type: 'text' },
  { key: 'retencion_isr_monto', label: 'Monto Retención ISR', type: 'currency' },
  { key: 'total_factura', label: 'Total Factura', type: 'currency' },
] as const;

// W18.3 — Sanitize OCR noise antes de poblar formData
// NCF: strip espacios/guiones/underscores + uppercase
// fecha_emision: strip ISO 8601 T/Z suffix → solo YYYY-MM-DD
// emisor_rnc: strip espacios/guiones/underscores
function sanitizeFormData(data: InvoiceData): InvoiceData {
  return {
    ...data,
    ncf: data.ncf ? data.ncf.toUpperCase().replace(/[\s\-_]/g, '') : data.ncf,
    fecha_emision: data.fecha_emision
      ? (data.fecha_emision.match(/^(\d{4}-\d{2}-\d{2})/) || [data.fecha_emision])[0]
      : data.fecha_emision,
    emisor_rnc: data.emisor_rnc ? data.emisor_rnc.replace(/[\s\-_]/g, '') : data.emisor_rnc,
  };
}

// Configuración de campos de identificación (editable post-OCR)
// Permite al usuario corregir NCF, RNC, proveedor y fecha si el OCR falló.
// Validaciones inline: NCF formato B0X/E3X + 8-11 dígitos, RNC 9/11 dígitos,
// fecha YYYY-MM-DD. Al guardar, el trigger BD auto_tag_factura_606
// recalcula aplica_606 automáticamente.
const IDENTIFICATION_FIELDS: Array<{
  key: keyof InvoiceData;
  label: string;
  hint?: string;
  validate?: (val: string) => string | null;
  placeholder?: string;
}> = [
  {
    key: 'ncf',
    label: 'NCF',
    hint: 'Comprobante Fiscal (B01XXXXXXXXX, E31XXXXXXXXX, E32XXXXXXXXX, etc.)',
    placeholder: 'Ej: B0100012345',
    validate: (val: string) => {
      if (!val || val === '') return 'NCF requerido para aplicar al 606';
      // W18.1: normalizar antes de validar — strip espacios/guiones/underscores que OCR introduce
      const cleaned = val.toUpperCase().replace(/[\s\-_]/g, '');
      if (!/^[BE]\d{2}\d{8,11}$/i.test(cleaned)) {
        return 'Formato inválido (esperado: B0X o E3X + 8-11 dígitos)';
      }
      return null;
    },
  },
  {
    key: 'emisor_rnc',
    label: 'RNC del Emisor',
    placeholder: '101000001',
    validate: (val: string) => {
      if (!val) return null; // RNC opcional para B02 consumidor final
      if (!/^\d{9,11}$/.test(val.replace(/-/g, ''))) {
        return 'RNC debe tener 9 u 11 dígitos';
      }
      return null;
    },
  },
  {
    key: 'emisor_nombre',
    label: 'Proveedor',
    placeholder: 'Nombre del proveedor',
  },
  {
    key: 'fecha_emision',
    label: 'Fecha de la Factura',
    placeholder: 'YYYY-MM-DD',
    validate: (val: string) => {
      if (!val) return 'Fecha requerida';
      // W18.2: strip ISO 8601 T/Z suffix — OCR puede retornar '2026-05-07T00:00:00Z'
      const cleaned = (val.match(/^(\d{4}-\d{2}-\d{2})/) || [val])[0];
      if (!/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) return 'Formato esperado: YYYY-MM-DD';
      return null;
    },
  },
];

const InvoiceReviewScreen: React.FC = () => {
  const route = useRoute<RouteProp<RouteParams, 'InvoiceReview'>>();
  const navigation = useNavigation();
  const params = route.params;

  // Estado de campos editables
  // W18.3: sanitizeFormData en initial load — strip OCR noise (espacios en NCF, ISO suffix en fecha)
  const [formData, setFormData] = useState<InvoiceData>(sanitizeFormData(params.extractedData));
  const [validation, setValidation] = useState<ValidationResult>(params.validation);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRevalidating, setIsRevalidating] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  // W18.3: track campos editados por usuario → limpiar errores backend de esos campos
  // (re-aparecerán al hacer Revalidar si siguen fallando)
  const [clearedBackendErrors, setClearedBackendErrors] = useState<Set<string>>(new Set());

  // W17.2: estado controlado del descuento (editable, separado de formData para recálculo inmediato)
  const [descuento, setDescuento] = useState<number>(params.extractedData.descuento ?? 0);

  // W17.2: sincronizar descuento → formData cuando cambia
  useEffect(() => {
    setFormData(prev => ({ ...prev, descuento }));
  }, [descuento]);

  // W17.2 + W19fix: Subtotal bruto recalculado en tiempo real
  // (anterior tenía ternary muerto `itbis_facturado ? 0 : 0` — siempre 0)
  const baseGravadaDinamica = useMemo(() => {
    const subtotal = (formData.monto_servicios || 0) + (formData.monto_bienes || 0);
    return Math.max(0, subtotal - descuento);
  }, [formData.monto_servicios, formData.monto_bienes, descuento]);

  // BUG-09: AbortController para cancelar requests in-flight si el componente se desmonta
  // o si se dispara una nueva request mientras hay otra en curso.
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup: abortar cualquier request pendiente al desmontar
      abortControllerRef.current?.abort();
    };
  }, []);

  // Mapa de errores por campo para acceso rápido
  // W18.3: excluir campos que el usuario editó (clearedBackendErrors) hasta próxima revalidación
  const errorMap = new Map<string, ValidationError>();
  validation.errors.forEach(err => {
    if (!clearedBackendErrors.has(err.field)) {
      errorMap.set(err.field, err);
    }
  });
  validation.warnings.forEach(warn => {
    if (!clearedBackendErrors.has(warn.field) && !errorMap.has(warn.field)) {
      errorMap.set(warn.field, warn);
    }
  });

  const getFieldStatus = (fieldKey: string): 'valid' | 'warning' | 'error' => {
    const error = errorMap.get(fieldKey);
    if (!error) return 'valid';
    return error.severity;
  };

  const getFieldMessage = (fieldKey: string): string | null => {
    const error = errorMap.get(fieldKey);
    if (!error) return null;
    // W18.9: si hay código y plantilla rica, usar mensaje UX mejorado
    if (error.code) {
      const fieldValue = (formData as any)[fieldKey];
      const enhanced = getEnhancedMessage(error.code, fieldValue);
      if (enhanced) return enhanced;
    }
    return error.error || null;
  };

  // W18.10 — Enviar reporte de bug al SM dashboard
  const handleReportBug = useCallback((fieldKey: string) => {
    const error = errorMap.get(fieldKey);
    const reportData = {
      timestamp: new Date().toISOString(),
      invoice_id: params.invoiceId,
      field: fieldKey,
      error_code: error?.code,
      error_message: error?.error || (error as any)?.message,
      received_value: (formData as any)[fieldKey],
      ocr_data_partial: {
        ncf: formData.ncf,
        emisor_rnc: formData.emisor_rnc,
        fecha_emision: formData.fecha_emision,
        total_factura: formData.total_factura,
      },
      app_version: '2.6.3',
      user_agent: 'FacturaIA-Android',
    };

    Alert.alert(
      'Reportar bug',
      `Vamos a enviar los datos al equipo de soporte:\n\n` +
      `Campo: ${fieldKey}\n` +
      `Error: ${error?.code || 'desconocido'}\n` +
      `Recibido: "${reportData.received_value}"\n\n` +
      `¿Confirmas el envío?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Enviar',
          onPress: async () => {
            try {
              const res = await fetch(`${SM_DASHBOARD_URL}/api/sm/notifications`, {
                method: 'POST',
                headers: {
                  'X-Api-Key': SM_DASHBOARD_API_KEY,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  type: 'bug_report',
                  result: `FacturaIA bug: ${fieldKey} ${error?.code}`,
                  detail: JSON.stringify(reportData),
                }),
              });
              if (res.ok) {
                Alert.alert('Reporte enviado', 'Gracias. El equipo recibirá los datos.');
              } else {
                Alert.alert('Error', 'No se pudo enviar (HTTP ' + res.status + '). Intenta más tarde.');
              }
            } catch (e: any) {
              console.error('[BugReport]', e);
              Alert.alert('Error', 'No se pudo enviar el reporte: ' + (e?.message || 'red'));
            }
          },
        },
      ]
    );
  }, [errorMap, formData, params.invoiceId]);

  const getBorderColor = (status: 'valid' | 'warning' | 'error'): string => {
    switch (status) {
      case 'error': return '#ef4444';
      case 'warning': return '#f59e0b';
      case 'valid': return '#22c55e';
    }
  };

  const formatCurrency = (value: number): string => {
    return `RD$ ${value.toLocaleString('es-DO', { minimumFractionDigits: 2 })}`;
  };

  // Campos que mantienen valor como string (no parsear a float)
  const STRING_FIELDS = new Set<string>([
    'retencion_isr_tipo',
    'ncf',
    'emisor_rnc',
    'emisor_nombre',
    'fecha_emision',
  ]);

  const handleFieldChange = (key: string, value: string) => {
    let processedValue: string | number = STRING_FIELDS.has(key) ? value : (parseFloat(value) || 0);
    // W18.3: uppercase NCF en tiempo real mientras escribe
    if (key === 'ncf' && typeof processedValue === 'string') {
      processedValue = processedValue.toUpperCase();
    }
    setFormData(prev => ({
      ...prev,
      [key]: processedValue,
    }));
    // W18.3: limpiar error backend del campo editado (reaparecerá al Revalidar si sigue fallando)
    setClearedBackendErrors(prev => {
      const next = new Set(prev);
      next.add(key);
      return next;
    });
  };

  // Re-validar campos editados
  // V19fix: retries 2x exponencial + detalle error (HTTP + snippet + acción sugerida)
  const handleRevalidate = useCallback(async () => {
    setIsRevalidating(true);
    const sanitized = sanitizeFormData(formData);
    const delays = [0, 1000, 3000]; // intento inmediato + 2 retries
    let lastError: any = null;
    let lastResponseText = '';

    for (let i = 0; i < delays.length; i++) {
      if (delays[i] > 0) {
        await new Promise(r => setTimeout(r, delays[i]));
      }
      try {
        const result = await api.post('/api/v1/invoices/validate', sanitized);
        if (result.success) {
          setValidation(result.data);
          setClearedBackendErrors(new Set());
          setIsRevalidating(false);
          return;
        }
        lastError = result.error || 'Respuesta sin success';
        lastResponseText = JSON.stringify(result).slice(0, 200);
      } catch (error: any) {
        lastError = error;
        lastResponseText = (error?.message || String(error)).slice(0, 200);
        console.warn(`[InvoiceReview] Revalidación intento ${i + 1}/${delays.length} falló:`, error);
      }
    }

    setIsRevalidating(false);
    const httpCode = lastError?.status || lastError?.response?.status || 'sin código';
    const accion = httpCode === 401 || httpCode === 403
      ? 'Cierra sesión y vuelve a entrar.'
      : httpCode >= 500
      ? 'Servidor caído. Intenta en 1 minuto o reporta a soporte.'
      : 'Verifica tu conexión a internet o reporta a soporte.';
    Alert.alert(
      'No se pudo revalidar',
      `Endpoint: POST /api/v1/invoices/validate\nHTTP: ${httpCode}\nDetalle: ${lastResponseText || lastError?.message || 'sin detalle'}\n\nAcción sugerida: ${accion}`,
      [{ text: 'OK' }]
    );
  }, [formData]);

  // Aprobar factura (guardar como validada)
  const handleApprove = useCallback(async () => {
    setIsSubmitting(true);
    try {
      const result = await api.put(`/api/facturas/${params.invoiceId}/approve`, {
        ...formData,
        extraction_status: 'validated',
      });
      if (result.success) {
        navigation.goBack();
      } else {
        Alert.alert('No se pudo aprobar', result.error || 'Backend rechazó la aprobación sin detalle. Verifica que la factura no esté ya en 606 o aprobada por otro usuario.');
      }
    } catch (error) {
      console.error('[InvoiceReview] Error aprobando:', error);
      Alert.alert('Error', 'No se pudo aprobar la factura.');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, params.invoiceId, navigation]);

  // Lógica real del save (extraída para que UX-03 pueda envolverla con Alert.confirm)
  // FIX-W19: revalidación no bloquea el save — si falla, se guarda con status actual
  // FIX-W19: errores backend se muestran en Alert con razón legible
  const doSaveAndUpdate = useCallback(async () => {
    // BUG-09: cancelar request previa si existiera y crear nuevo controller
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setIsSubmitting(true);
    try {
      // W18.3: sanitize antes de enviar al backend (strip OCR noise en NCF/fecha/RNC)
      const sanitized = sanitizeFormData(formData);

      // FIX-W19: revalidar pero no bloquear save si revalidación falla
      let newStatus = params.extractionStatus || 'review';
      let newValidation = validation;
      try {
        const validateResult = await api.post('/api/v1/invoices/validate', sanitized);
        if (!signal.aborted && validateResult.success && validateResult.data) {
          newValidation = validateResult.data;
          setValidation(newValidation);
          // Determinar status basado en validación
          if (!newValidation.valid) {
            newStatus = 'error';
          } else if (newValidation.needs_review) {
            newStatus = 'review';
          } else {
            newStatus = 'validated';
          }
        }
      } catch (validateError) {
        // FIX-W19: revalidación falló → guardar con status actual (no bloquear)
        console.warn('[InvoiceReview] Revalidación falló, guardando con status actual:', validateError);
      }

      if (signal.aborted) return;

      // Guardar con el status determinado (o status actual si revalidación falló)
      const saveResult = await api.put(`/api/facturas/${params.invoiceId}/update`, {
        ...sanitized,
        extraction_status: newStatus,
        review_notes: JSON.stringify({
          errors: newValidation.errors,
          warnings: newValidation.warnings,
        }),
      });
      if (signal.aborted) return;

      if (saveResult.success) {
        // UX-04: feedback explícito si la factura ahora aplica al 606 (antes no aplicaba)
        const previouslyApplied = (params.extractedData as any)?.aplica_606 === true;
        const nowApplied =
          saveResult.factura?.aplica_606 === true ||
          (saveResult.data && saveResult.data.aplica_606 === true) ||
          saveResult.aplica_606 === true;

        if (!previouslyApplied && nowApplied) {
          Alert.alert(
            'Factura aplica al 606',
            'Esta factura ahora aparecerá en el formulario 606 del cliente.',
            [
              {
                text: 'OK',
                onPress: () => {
                  // BUG-10: navigation.goBack() activa useFocusEffect en HomeScreen
                  // que re-fetcha la lista de facturas. No requiere fetch explícito aquí.
                  navigation.goBack();
                },
              },
            ]
          );
          return;
        }

        // BUG-10: navigation.goBack() activa useFocusEffect en HomeScreen
        // que re-fetcha la lista de facturas. No requiere fetch explícito aquí.
        navigation.goBack();
      } else {
        // FIX-W19: mostrar razón de error del backend
        const errorMsg = saveResult.error || saveResult.message || 'No se pudieron guardar los cambios.';
        Alert.alert('Error al guardar', errorMsg);
      }
    } catch (error: any) {
      if (error?.name === 'AbortError' || signal.aborted) {
        return;
      }
      console.error('[InvoiceReview] Error guardando:', error);
      // FIX-W19: mostrar razón específica si disponible (ej: "NCF duplicado")
      const errorMsg = error?.message || 'No se pudieron guardar los cambios.';
      Alert.alert('Error', errorMsg);
    } finally {
      if (!signal.aborted) {
        setIsSubmitting(false);
      }
    }
  }, [formData, params.invoiceId, params.extractedData, params.extractionStatus, validation, navigation]);

  // Corregir y guardar (re-validar y guardar)
  // UX-03: si NCF está vacío, advertir que NO aparecerá en el 606 (bloqueante)
  const handleCorrectAndSave = useCallback(async () => {
    // BUG-09: early return si ya hay un submit en curso
    if (isSubmitting) return;

    // UX-03: NCF vacío → confirmar antes de guardar
    if (!formData.ncf || formData.ncf.trim() === '') {
      Alert.alert(
        'NCF vacío',
        'Esta factura no tiene NCF. Si la guardas así, NO aparecerá en el formato 606. ¿Deseas continuar?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Guardar igual',
            onPress: () => {
              void doSaveAndUpdate();
            },
          },
        ]
      );
      return;
    }

    // P1 Anti-Duplicadas NCF: check pre-save (cross-stack)
    // Determinar tipo según clasificación de la factura
    const tipo = (params.extractedData as any)?.aplica_607 === true ? '607' : '606';
    let dupResult: Awaited<ReturnType<typeof checkDuplicateNCF>> = { exists: false };
    try {
      dupResult = await checkDuplicateNCF(formData.ncf, tipo);
    } catch {
      // fail-open: error → allow save
    }

    if (dupResult.exists && dupResult.existing) {
      const { existing } = dupResult;
      const montoStr = existing.monto
        ? `RD$ ${existing.monto.toLocaleString('es-DO', { minimumFractionDigits: 2 })}`
        : 'N/A';
      Alert.alert(
        'Esta factura ya está registrada',
        `NCF ${existing.ncf} del ${existing.fecha_documento || 'fecha desconocida'}\nMonto: ${montoStr}\n\n¿Qué quieres hacer?`,
        [
          {
            text: 'Ver factura existente',
            onPress: () => (navigation as any).navigate('InvoiceDetail', { id: existing.id }),
          },
          {
            text: 'Continuar de todos modos',
            style: 'destructive',
            onPress: () => { void doSaveAndUpdate(); },
          },
          { text: 'Cancelar', style: 'cancel' },
        ]
      );
      return;
    }

    // FIX-W19: confirmación antes de guardar cuando hay datos editados
    Alert.alert(
      'Guardar cambios',
      'Vas a guardar los cambios de esta factura. ¿Confirmas?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Guardar', onPress: () => { void doSaveAndUpdate(); } },
      ]
    );
  }, [isSubmitting, formData.ncf, params.extractedData, doSaveAndUpdate, navigation]);

  // W19.Q3 — Re-procesar OCR: estado controlado independiente de isSubmitting
  const [isReprocessing, setIsReprocessing] = useState(false);

  // UX-05: Reintentar OCR — vuelve a procesar la imagen con IA
  // FIX-W19: disponible siempre (no solo cuando extractionStatus===error)
  // FIX-W19: usa isReprocessing propio para no bloquear botón Guardar
  // FIX-W19: actualiza formData con datos re-extraídos sin navegar de vuelta
  const handleReprocessOCR = useCallback(async () => {
    if (isReprocessing) return;
    Alert.alert(
      'Re-procesar OCR',
      'Esto volverá a leer la factura con la IA usando la imagen original guardada. Los datos actuales se reemplazarán. ¿Continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Re-procesar',
          onPress: async () => {
            setIsReprocessing(true);
            try {
              const res = await api.post(`/api/facturas/${params.invoiceId}/reprocesar`, {});
              if (res.success && res.data) {
                setFormData(sanitizeFormData(res.data));
                setClearedBackendErrors(new Set());
                // V20fix: resetear descuento y validation tras reprocess
                // (antes baseGravadaDinamica quedaba stale con descuento viejo)
                setDescuento((res.data as any)?.descuento ?? 0);
                if ((res.data as any)?.validation) {
                  setValidation((res.data as any).validation);
                }
                Alert.alert('OK', 'Factura re-procesada. Revisa los campos extraídos.');
              } else if (res.success && res.factura) {
                setFormData(sanitizeFormData(res.factura));
                setClearedBackendErrors(new Set());
                Alert.alert('OK', 'Factura re-procesada. Revisa los campos extraídos.');
              } else {
                Alert.alert('Error', res.error || 'No se pudo re-procesar la factura.');
              }
            } catch (e: any) {
              console.error('[InvoiceReview] Error reprocesando OCR:', e);
              Alert.alert('Error inesperado', e?.message || 'Re-procesar falló');
            } finally {
              setIsReprocessing(false);
            }
          },
        },
      ]
    );
  }, [params.invoiceId, isReprocessing]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'validated': return '#22c55e';
      case 'review': return '#f59e0b';
      case 'error': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'validated': return 'VALIDADO';
      case 'review': return 'REVISAR';
      case 'error': return 'ERROR';
      default: return 'PENDIENTE';
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header con estado — V19fix: live derived de validation actual */}
        {(() => {
          let liveStatus: 'validated' | 'review' | 'error' = 'validated';
          if (validation.errors.length > 0) liveStatus = 'error';
          else if (validation.warnings.length > 0) liveStatus = 'review';
          return (
            <View style={styles.header}>
              <Text style={styles.title}>Revisión de Factura</Text>
              <Chip
                style={[styles.statusChip, { backgroundColor: getStatusColor(liveStatus) }]}
                textStyle={styles.statusText}
              >
                {getStatusLabel(liveStatus)}
              </Chip>
            </View>
          );
        })()}

        {/* BANNER TOP CON RAZÓN PRINCIPAL */}
        {validation.errors.length > 0 && (
          <Surface style={[styles.section, { backgroundColor: '#7f1d1d', borderLeftWidth: 4, borderLeftColor: '#ef4444' }]}>
            <Text style={[styles.sectionTitle, { color: '#fecaca' }]}>
              ⚠️ Esta factura necesita corrección antes de aplicar al 606
            </Text>
            {validation.errors.slice(0, 3).map((err, idx) => {
              const readable = getReadableMessage(err.code || '');
              return (
                <View key={`banner-${idx}`} style={{ marginTop: 8 }}>
                  <Text style={{ color: '#fecaca', fontWeight: '700', fontSize: 14 }}>{readable.title}</Text>
                  <Text style={{ color: '#fca5a5', fontSize: 12, marginTop: 2 }}>{readable.description}</Text>
                </View>
              );
            })}
            {validation.errors.length > 3 && (
              <Text style={{ color: '#fca5a5', fontSize: 11, marginTop: 6, fontStyle: 'italic' }}>
                ... y {validation.errors.length - 3} problema(s) más abajo
              </Text>
            )}
          </Surface>
        )}

        {/* BANNER INFO consumidor final (solo si presente) */}
        {validation.errors.some(e => e.code === 'consumer_final_b02') && (
          <Surface style={[styles.section, { backgroundColor: '#1e3a8a', borderLeftWidth: 4, borderLeftColor: '#3b82f6' }]}>
            <Text style={{ color: '#bfdbfe', fontSize: 13 }}>
              ℹ️ Esta factura es consumidor final (B02/E32). Se guarda como gasto pero NO entra en el 606.
            </Text>
          </Surface>
        )}

        {/* BANNER INFO descuento detectado por OCR (solo pre-fill, no dinámico) */}
        {(params.extractedData.descuento ?? 0) > 0 && (
          <Surface style={[styles.section, { backgroundColor: '#1c3d2a', borderLeftWidth: 4, borderLeftColor: '#22c55e' }]}>
            <Text style={{ color: '#86efac', fontSize: 13 }}>
              ℹ️ Descuento RD$ {(params.extractedData.descuento ?? 0).toLocaleString('es-DO', { minimumFractionDigits: 2 })} detectado por OCR. Puedes editar el campo "Descuento" en Campos Fiscales si el monto no es correcto.
            </Text>
          </Surface>
        )}

        {/* Imagen de factura — FIX-W19: mostrar siempre con fallback a backend URL */}
        {/* Prioridad: 1) imageUrl del param (backend URL), 2) URL construida con invoiceId */}
        <TouchableOpacity onPress={() => setImageModalVisible(true)}>
          <Surface style={styles.imageContainer}>
            <Image
              source={{ uri: params.imageUrl || `http://217.216.48.91:8081/api/facturas/${params.invoiceId}/imagen` }}
              style={styles.facturaImage}
              resizeMode="contain"
              onError={() => {
                console.warn('[InvoiceReview] Imagen no disponible, usando fallback URL');
              }}
            />
            <View style={styles.imageOverlay}>
              <IconButton icon="magnify-plus" iconColor="#fff" size={20} />
              <Text style={styles.imageHint}>Ampliar</Text>
            </View>
          </Surface>
        </TouchableOpacity>

        {/* Datos del comprobante (editables post-OCR) */}
        <Surface style={styles.section}>
          <Text style={styles.sectionTitle}>Datos del Comprobante</Text>
          <Text style={styles.hint}>
            Edita estos campos si el OCR no detectó correctamente
          </Text>

          {IDENTIFICATION_FIELDS.map((field) => {
            const value = String(formData[field.key] ?? '');
            const validationMsg = field.validate ? field.validate(value) : null;
            const isUppercaseField =
              field.key === 'ncf' || field.key === 'emisor_rnc';
            return (
              <View key={field.key} style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>
                  {field.label}
                  {field.validate && <Text style={styles.fieldRequired}> *</Text>}
                </Text>
                {field.hint && (
                  <Text style={styles.fieldHint}>{field.hint}</Text>
                )}
                <TextInput
                  value={value}
                  onChangeText={(text) =>
                    handleFieldChange(field.key, text)
                  }
                  placeholder={field.placeholder}
                  placeholderTextColor="#64748b"
                  style={[
                    styles.input,
                    validationMsg
                      ? { borderColor: '#ef4444', borderWidth: 2 }
                      : null,
                  ]}
                  mode="outlined"
                  outlineColor={validationMsg ? '#ef4444' : '#334155'}
                  activeOutlineColor={validationMsg ? '#ef4444' : '#22D3EE'}
                  textColor="#fff"
                  autoCapitalize={isUppercaseField ? 'characters' : 'sentences'}
                  autoCorrect={false}
                  accessibilityLabel={field.label}
                  testID={`identification-input-${field.key}`}
                />
                {validationMsg && (
                  <Text style={styles.fieldErrorText}>⚠️ {validationMsg}</Text>
                )}
                {/* W18.10: botón Reportar bug cuando hay error del backend en este campo */}
                {getFieldStatus(field.key) === 'error' && (
                  <View style={{ marginTop: 4, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                    <Text style={{ color: '#ef4444', fontSize: 12, flex: 1 }}>{getFieldMessage(field.key)}</Text>
                    <TouchableOpacity onPress={() => handleReportBug(field.key)} accessibilityLabel="Reportar bug">
                      <Text style={{ color: '#3b82f6', fontSize: 11, textDecorationLine: 'underline' }}>
                        Reportar bug
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })}
        </Surface>

        {/* Campos fiscales editables */}
        <Surface style={styles.section}>
          <Text style={styles.sectionTitle}>Campos Fiscales</Text>
          <Text style={styles.hint}>Campos editables - borde indica estado de validación</Text>

          {FISCAL_FIELDS.map(field => {
            const status = getFieldStatus(field.key);
            const message = getFieldMessage(field.key);
            const value = formData[field.key as keyof InvoiceData];

            // W17.2: campo descuento usa estado controlado con validación y banner dinámico
            if (field.key === 'descuento') {
              const subtotal = (formData.monto_servicios || 0) + (formData.monto_bienes || 0);
              return (
                <View key={field.key} style={styles.fieldContainer}>
                  <Text style={styles.fieldLabel}>Descuento proveedor (RD$)</Text>
                  <TextInput
                    value={String(descuento)}
                    onChangeText={(text) => {
                      const parsed = parseFloat(text);
                      if (isNaN(parsed) || parsed < 0) {
                        setDescuento(0);
                      } else if (parsed > subtotal) {
                        setDescuento(Math.max(0, subtotal - 0.01));
                      } else {
                        setDescuento(parsed);
                      }
                    }}
                    keyboardType="decimal-pad"
                    style={[
                      styles.input,
                      { borderColor: getBorderColor(status), borderWidth: 2 }
                    ]}
                    mode="outlined"
                    outlineColor={getBorderColor(status)}
                    activeOutlineColor={getBorderColor(status)}
                    textColor="#fff"
                    accessibilityLabel="Descuento proveedor"
                    testID="fiscal-input-descuento"
                  />
                  {/* Banner dinámico Base Gravada — solo si descuento > 0 */}
                  {descuento > 0 && (
                    <View style={styles.descuentoBanner}>
                      <Text style={styles.descuentoBannerText}>
                        ✓ Descuento aplicado: -RD$ {descuento.toFixed(2)} | Base Gravada: RD$ {baseGravadaDinamica.toFixed(2)}
                      </Text>
                    </View>
                  )}
                  {message && (
                    <Text style={[
                      styles.fieldMessage,
                      { color: status === 'error' ? '#ef4444' : '#f59e0b' }
                    ]}>
                      {message}
                    </Text>
                  )}
                </View>
              );
            }

            return (
              <View key={field.key} style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>{field.label}</Text>
                <TextInput
                  value={field.type === 'currency' ? String(value || 0) : String(value || '')}
                  onChangeText={(text) => handleFieldChange(field.key, text)}
                  keyboardType={field.type === 'currency' ? 'decimal-pad' : 'default'}
                  style={[
                    styles.input,
                    { borderColor: getBorderColor(status), borderWidth: 2 }
                  ]}
                  mode="outlined"
                  outlineColor={getBorderColor(status)}
                  activeOutlineColor={getBorderColor(status)}
                  textColor="#fff"
                />
                {message && (
                  <Text style={[
                    styles.fieldMessage,
                    { color: status === 'error' ? '#ef4444' : '#f59e0b' }
                  ]}>
                    {message}
                  </Text>
                )}
                {/* W18.10: botón Reportar bug cuando hay error del backend en campo fiscal */}
                {status === 'error' && (
                  <TouchableOpacity onPress={() => handleReportBug(field.key)} accessibilityLabel="Reportar bug" style={{ marginTop: 4 }}>
                    <Text style={{ color: '#3b82f6', fontSize: 11, textDecorationLine: 'underline' }}>
                      Reportar bug
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </Surface>

        {/* Sección de valores calculados — V19fix: labels descriptivos sin engaño UX */}
        <Surface style={styles.section}>
          <Text style={styles.sectionTitle}>Cálculos de Referencia</Text>
          <Text style={styles.hint}>Comparación con regla 18% estándar — facturas mixtas (supermercado) tienen items exentos/16% y el ITBIS real puede ser menor</Text>

          <View style={styles.computedRow}>
            <Text style={styles.computedLabel}>Subtotal bruto (servicios + bienes - descuento):</Text>
            <Text style={[
              styles.computedValue,
              descuento > 0 ? { color: '#22c55e' } : null
            ]}>
              {formatCurrency(descuento > 0 ? baseGravadaDinamica : validation.computed.base_gravada)}
            </Text>
          </View>

          <View style={styles.computedRow}>
            <Text style={styles.computedLabel}>ITBIS facturado (real factura):</Text>
            <Text style={styles.computedValue}>
              {formatCurrency(formData.itbis_facturado || 0)}
            </Text>
          </View>

          <View style={styles.computedRow}>
            <Text style={styles.computedLabel}>ITBIS si todo fuera 18% (referencia teórica):</Text>
            <Text style={[styles.computedValue, { color: '#94a3b8', fontStyle: 'italic' }]}>
              {formatCurrency(validation.computed.itbis_esperado)}
            </Text>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.computedRow}>
            <Text style={styles.computedLabelTotal}>Total real factura:</Text>
            <Text style={styles.computedValueTotal}>
              {formatCurrency(formData.total_factura || validation.computed.total_esperado)}
            </Text>
          </View>
        </Surface>

        {/* Resumen de errores y warnings */}
        {(validation.errors.length > 0 || validation.warnings.length > 0) && (
          <Surface style={styles.section}>
            <Text style={styles.sectionTitle}>Problemas Detectados</Text>

            {validation.errors.map((err, idx) => {
              const readable = getReadableMessage(err.code || '');
              const fallback = err.error || readable.title;
              const display = err.code
                ? `${readable.title} — ${readable.description}`
                : fallback;
              return (
                <View key={`err-${idx}`} style={styles.issueRow}>
                  <IconButton icon="alert-circle" iconColor="#ef4444" size={18} />
                  <Text style={styles.issueError}>{display}</Text>
                </View>
              );
            })}

            {validation.warnings.map((warn, idx) => {
              const readable = getReadableMessage(warn.code || '');
              const fallback = warn.error || readable.title;
              const display = warn.code
                ? `${readable.title} — ${readable.description}`
                : fallback;
              return (
                <View key={`warn-${idx}`} style={styles.issueRow}>
                  <IconButton icon="alert" iconColor="#f59e0b" size={18} />
                  <Text style={styles.issueWarning}>{display}</Text>
                </View>
              );
            })}
          </Surface>
        )}

        {/* Botones de acción */}
        <View style={styles.actions}>
          <Button
            mode="outlined"
            onPress={handleRevalidate}
            loading={isRevalidating}
            style={styles.revalidateButton}
            textColor="#22D3EE"
          >
            Revalidar
          </Button>

          {/* FIX-W19: Reprocesar OCR — siempre visible (no solo cuando extractionStatus===error) */}
          <Button
            mode="outlined"
            onPress={handleReprocessOCR}
            loading={isReprocessing}
            disabled={isReprocessing}
            style={styles.reprocessButton}
            textColor="#fbbf24"
            accessibilityLabel="Re-procesar OCR"
            testID="review-reprocess-ocr"
          >
            🔄 {isReprocessing ? 'Re-procesando...' : 'Re-procesar OCR'}
          </Button>

          <View style={styles.mainActions}>
            <Button
              mode="contained"
              onPress={handleApprove}
              loading={isSubmitting}
              disabled={!validation.valid || validation.needs_review}
              style={styles.approveButton}
              buttonColor="#22c55e"
              textColor="#0f172a"
              icon="check-circle"
              testID="review-approve"
              accessibilityLabel="Aprobar factura"
            >
              Aprobar
            </Button>
            {(!validation.valid || validation.needs_review) && (
              <Text style={{ color: '#94a3b8', fontSize: 12, marginTop: 4, textAlign: 'center' }}>
                {validation.errors.length > 0
                  ? 'Corrige los errores marcados para habilitar Aprobar'
                  : 'Revisa las advertencias antes de aprobar'}
              </Text>
            )}

            <Button
              mode="contained"
              onPress={handleCorrectAndSave}
              loading={isSubmitting}
              style={styles.saveButton}
              buttonColor="#3b82f6"
              testID="review-save"
              accessibilityLabel="Guardar cambios"
            >
              Corregir y Guardar
            </Button>
          </View>
        </View>
      </ScrollView>

      {/* Modal imagen ampliada */}
      <Modal
        visible={imageModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setImageModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalClose}
            onPress={() => setImageModalVisible(false)}
          >
            <IconButton icon="close" iconColor="#fff" size={28} />
          </TouchableOpacity>
          <Image
            source={{ uri: params.imageUrl || `http://217.216.48.91:8081/api/facturas/${params.invoiceId}/imagen` }}
            style={styles.modalImage}
            resizeMode="contain"
          />
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  statusChip: {
    height: 28,
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  imageContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1e293b',
    marginBottom: 16,
  },
  facturaImage: {
    width: '100%',
    height: 180,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 8,
    paddingRight: 8,
  },
  imageHint: {
    color: '#fff',
    fontSize: 11,
  },
  section: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#1e293b',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#22D3EE',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  hint: {
    fontSize: 11,
    color: '#64748b',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: {
    color: '#94a3b8',
    fontSize: 13,
  },
  value: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
  },
  ncf: {
    fontFamily: 'monospace',
    color: '#22D3EE',
  },
  fieldContainer: {
    marginBottom: 12,
  },
  fieldLabel: {
    color: '#94a3b8',
    fontSize: 12,
    marginBottom: 4,
  },
  fieldRequired: {
    color: '#ef4444',
    fontWeight: 'bold',
  },
  fieldHint: {
    color: '#64748b',
    fontSize: 11,
    marginBottom: 6,
    fontStyle: 'italic',
  },
  fieldErrorText: {
    color: '#ef4444',
    fontSize: 11,
    marginTop: 4,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#0f172a',
    height: 44,
  },
  fieldMessage: {
    fontSize: 11,
    marginTop: 4,
  },
  computedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  computedLabel: {
    color: '#94a3b8',
    fontSize: 12,
    flex: 1,
  },
  computedValue: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
  },
  computedLabelTotal: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  computedValueTotal: {
    color: '#22D3EE',
    fontSize: 18,
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: 12,
    backgroundColor: '#334155',
  },
  issueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  issueError: {
    color: '#ef4444',
    fontSize: 12,
    flex: 1,
  },
  issueWarning: {
    color: '#f59e0b',
    fontSize: 12,
    flex: 1,
  },
  actions: {
    marginTop: 16,
  },
  revalidateButton: {
    marginBottom: 12,
    borderColor: '#22D3EE',
  },
  reprocessButton: {
    marginBottom: 12,
    borderColor: '#fbbf24',
  },
  mainActions: {
    flexDirection: 'row',
    gap: 12,
  },
  approveButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalClose: {
    position: 'absolute',
    top: 40,
    right: 16,
    zIndex: 1,
  },
  modalImage: {
    width: SCREEN_WIDTH,
    height: '80%',
  },
  // W17.2: banner dinámico Base Gravada bajo campo descuento
  descuentoBanner: {
    marginTop: 6,
    backgroundColor: '#14532d',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#22c55e',
  },
  descuentoBannerText: {
    color: '#86efac',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default InvoiceReviewScreen;
