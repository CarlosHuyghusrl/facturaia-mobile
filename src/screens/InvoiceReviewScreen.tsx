/**
 * InvoiceReviewScreen - Pantalla de revisión post-OCR
 * Muestra campos extraídos editables con indicadores de validación
 * Permite aprobar o corregir facturas antes de guardar
 */

import React, { useState, useEffect } from 'react';
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

const API_BASE_URL = 'http://217.216.48.91:8081';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Tipos para validación
interface ValidationError {
  field: string;
  error: string;
  severity: 'error' | 'warning';
}

interface ValidationResult {
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

interface InvoiceData {
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

const InvoiceReviewScreen: React.FC = () => {
  const route = useRoute<RouteProp<RouteParams, 'InvoiceReview'>>();
  const navigation = useNavigation();
  const params = route.params;

  // Estado de campos editables
  const [formData, setFormData] = useState<InvoiceData>(params.extractedData);
  const [validation, setValidation] = useState<ValidationResult>(params.validation);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRevalidating, setIsRevalidating] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);

  // Mapa de errores por campo para acceso rápido
  const errorMap = new Map<string, ValidationError>();
  validation.errors.forEach(err => errorMap.set(err.field, err));
  validation.warnings.forEach(warn => {
    if (!errorMap.has(warn.field)) {
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
    return error?.error || null;
  };

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

  const handleFieldChange = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [key]: key === 'retencion_isr_tipo' ? value : parseFloat(value) || 0,
    }));
  };

  // Re-validar campos editados
  const handleRevalidate = async () => {
    setIsRevalidating(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/invoices/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (result.success) {
        setValidation(result.data);
      }
    } catch (error) {
      console.error('[InvoiceReview] Error revalidando:', error);
    } finally {
      setIsRevalidating(false);
    }
  };

  // Aprobar factura (guardar como validada)
  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/facturas/${params.invoiceId}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          extraction_status: 'validated',
        }),
      });
      const result = await response.json();
      if (result.success) {
        navigation.goBack();
      }
    } catch (error) {
      console.error('[InvoiceReview] Error aprobando:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Corregir y guardar (re-validar y guardar)
  const handleCorrectAndSave = async () => {
    setIsSubmitting(true);
    try {
      // Primero revalidar
      const validateResponse = await fetch(`${API_BASE_URL}/api/v1/invoices/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const validateResult = await validateResponse.json();

      if (!validateResult.success) {
        console.error('Error en validación');
        setIsSubmitting(false);
        return;
      }

      const newValidation = validateResult.data;
      setValidation(newValidation);

      // Determinar status basado en validación
      let newStatus = 'validated';
      if (!newValidation.valid) {
        newStatus = 'error';
      } else if (newValidation.needs_review) {
        newStatus = 'review';
      }

      // Guardar con el nuevo status
      const saveResponse = await fetch(`${API_BASE_URL}/api/facturas/${params.invoiceId}/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          extraction_status: newStatus,
          review_notes: JSON.stringify({
            errors: newValidation.errors,
            warnings: newValidation.warnings,
          }),
        }),
      });

      const saveResult = await saveResponse.json();
      if (saveResult.success) {
        navigation.goBack();
      }
    } catch (error) {
      console.error('[InvoiceReview] Error guardando:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

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
        {/* Header con estado */}
        <View style={styles.header}>
          <Text style={styles.title}>Revisión de Factura</Text>
          <Chip
            style={[styles.statusChip, { backgroundColor: getStatusColor(params.extractionStatus) }]}
            textStyle={styles.statusText}
          >
            {getStatusLabel(params.extractionStatus)}
          </Chip>
        </View>

        {/* Imagen de factura */}
        {params.imageUrl && (
          <TouchableOpacity onPress={() => setImageModalVisible(true)}>
            <Surface style={styles.imageContainer}>
              <Image
                source={{ uri: params.imageUrl }}
                style={styles.facturaImage}
                resizeMode="contain"
              />
              <View style={styles.imageOverlay}>
                <IconButton icon="magnify-plus" iconColor="#fff" size={20} />
                <Text style={styles.imageHint}>Ampliar</Text>
              </View>
            </Surface>
          </TouchableOpacity>
        )}

        {/* Datos del comprobante (no editables) */}
        <Surface style={styles.section}>
          <Text style={styles.sectionTitle}>Comprobante Fiscal</Text>
          <View style={styles.row}>
            <Text style={styles.label}>NCF:</Text>
            <Text style={[styles.value, styles.ncf]}>{formData.ncf}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Fecha:</Text>
            <Text style={styles.value}>{formData.fecha_emision}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Emisor:</Text>
            <Text style={styles.value}>{formData.emisor_nombre}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>RNC Emisor:</Text>
            <Text style={styles.value}>{formData.emisor_rnc}</Text>
          </View>
        </Surface>

        {/* Campos fiscales editables */}
        <Surface style={styles.section}>
          <Text style={styles.sectionTitle}>Campos Fiscales</Text>
          <Text style={styles.hint}>Campos editables - borde indica estado de validación</Text>

          {FISCAL_FIELDS.map(field => {
            const status = getFieldStatus(field.key);
            const message = getFieldMessage(field.key);
            const value = formData[field.key as keyof InvoiceData];

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
              </View>
            );
          })}
        </Surface>

        {/* Sección de valores calculados */}
        <Surface style={styles.section}>
          <Text style={styles.sectionTitle}>Valores Calculados</Text>
          <Text style={styles.hint}>Basados en reglas DGII</Text>

          <View style={styles.computedRow}>
            <Text style={styles.computedLabel}>Base Gravada (servicios + bienes - descuento):</Text>
            <Text style={styles.computedValue}>
              {formatCurrency(validation.computed.base_gravada)}
            </Text>
          </View>

          <View style={styles.computedRow}>
            <Text style={styles.computedLabel}>ITBIS Esperado (18% base gravada):</Text>
            <Text style={styles.computedValue}>
              {formatCurrency(validation.computed.itbis_esperado)}
            </Text>
          </View>

          <View style={styles.computedRow}>
            <Text style={styles.computedLabel}>Monto Facturado (servicios + bienes - descuento):</Text>
            <Text style={styles.computedValue}>
              {formatCurrency(validation.computed.monto_facturado)}
            </Text>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.computedRow}>
            <Text style={styles.computedLabelTotal}>Total Esperado:</Text>
            <Text style={styles.computedValueTotal}>
              {formatCurrency(validation.computed.total_esperado)}
            </Text>
          </View>
        </Surface>

        {/* Resumen de errores y warnings */}
        {(validation.errors.length > 0 || validation.warnings.length > 0) && (
          <Surface style={styles.section}>
            <Text style={styles.sectionTitle}>Problemas Detectados</Text>

            {validation.errors.map((err, idx) => (
              <View key={`err-${idx}`} style={styles.issueRow}>
                <IconButton icon="alert-circle" iconColor="#ef4444" size={18} />
                <Text style={styles.issueError}>{err.error}</Text>
              </View>
            ))}

            {validation.warnings.map((warn, idx) => (
              <View key={`warn-${idx}`} style={styles.issueRow}>
                <IconButton icon="alert" iconColor="#f59e0b" size={18} />
                <Text style={styles.issueWarning}>{warn.error}</Text>
              </View>
            ))}
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

          <View style={styles.mainActions}>
            {validation.valid && !validation.needs_review && (
              <Button
                mode="contained"
                onPress={handleApprove}
                loading={isSubmitting}
                style={styles.approveButton}
                buttonColor="#22c55e"
              >
                Aprobar
              </Button>
            )}

            <Button
              mode="contained"
              onPress={handleCorrectAndSave}
              loading={isSubmitting}
              style={styles.saveButton}
              buttonColor="#3b82f6"
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
            source={{ uri: params.imageUrl }}
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
});

export default InvoiceReviewScreen;
