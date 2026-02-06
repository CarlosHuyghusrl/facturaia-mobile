/**
 * InvoiceDetailScreen - Detalle de factura
 * Imagen zoomable + datos OCR extraídos
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
} from 'react-native';
import {
  Text,
  Surface,
  Chip,
  ActivityIndicator,
  IconButton,
  Button,
  Divider,
} from 'react-native-paper';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';

import { Factura, obtenerFactura, reprocesarFactura } from '../services/facturasService';

const API_BASE_URL = 'http://217.216.48.91:8081';

type RouteParams = {
  InvoiceDetail: { facturaId: string };
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const getImageUrl = (imagenUrl: string | undefined): string | null => {
  if (!imagenUrl) return null;
  // If it's already a full URL, use it
  if (imagenUrl.startsWith('http')) return imagenUrl;
  // Otherwise, prepend the API base URL
  return `${API_BASE_URL}${imagenUrl}`;
};

const InvoiceDetailScreen: React.FC = () => {
  const route = useRoute<RouteProp<RouteParams, 'InvoiceDetail'>>();
  const navigation = useNavigation();
  const { facturaId } = route.params;

  const [factura, setFactura] = useState<Factura | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReprocesando, setIsReprocesando] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);

  useEffect(() => {
    loadFactura();
  }, [facturaId]);

  const loadFactura = async () => {
    try {
      setIsLoading(true);
      const data = await obtenerFactura(facturaId);
      setFactura(data);
    } catch (error) {
      console.error('[InvoiceDetail] Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReprocesar = async () => {
    try {
      setIsReprocesando(true);
      const updated = await reprocesarFactura(facturaId);
      setFactura(updated);
    } catch (error) {
      console.error('[InvoiceDetail] Error reprocesando:', error);
    } finally {
      setIsReprocesando(false);
    }
  };

  const formatMoney = (amount: number) => {
    return `RD$ ${amount.toLocaleString('es-DO', { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-DO', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'validado': return '#22c55e';
      case 'procesado': return '#3b82f6';
      case 'pendiente': return '#f59e0b';
      case 'error': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getOcrStatusIcon = (status: string) => {
    switch (status) {
      case 'completado': return 'check-circle';
      case 'procesando': return 'progress-clock';
      case 'error': return 'alert-circle';
      default: return 'clock-outline';
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#22D3EE" />
        <Text style={styles.loadingText}>Cargando factura...</Text>
      </View>
    );
  }

  if (!factura) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Factura no encontrada</Text>
        <Button mode="contained" onPress={() => navigation.goBack()}>
          Volver
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Imagen de factura */}
        {factura.imagen_url && (
          <TouchableOpacity onPress={() => setImageModalVisible(true)}>
            <Surface style={styles.imageContainer}>
              <Image
                source={{ uri: getImageUrl(factura.imagen_url) || '' }}
                style={styles.facturaImage}
                resizeMode="contain"
              />
              <View style={styles.imageOverlay}>
                <IconButton icon="magnify-plus" iconColor="#fff" size={24} />
                <Text style={styles.imageHint}>Toca para ampliar</Text>
              </View>
            </Surface>
          </TouchableOpacity>
        )}

        {/* Estado y OCR */}
        <View style={styles.statusRow}>
          <Chip
            style={[styles.estadoBadge, { backgroundColor: getEstadoColor(factura.estado) }]}
            textStyle={styles.estadoText}
          >
            {factura.estado.toUpperCase()}
          </Chip>
          <View style={styles.ocrStatus}>
            <IconButton
              icon={getOcrStatusIcon(factura.estado_ocr)}
              iconColor={factura.estado_ocr === 'completado' ? '#22c55e' : '#f59e0b'}
              size={20}
            />
            <Text style={styles.ocrText}>OCR: {factura.estado_ocr}</Text>
          </View>
        </View>

        {/* Comprobante */}
        <Surface style={styles.section}>
          <Text style={styles.sectionTitle}>Comprobante Fiscal</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Tipo:</Text>
            <Text style={styles.value}>{factura.tipo_comprobante || 'Factura'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>NCF:</Text>
            <Text style={[styles.value, styles.ncf]}>{factura.ncf}</Text>
          </View>
        </Surface>

        {/* Emisor */}
        <Surface style={styles.section}>
          <Text style={styles.sectionTitle}>Emisor</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Nombre:</Text>
            <Text style={styles.value}>{factura.emisor_nombre || 'No identificado'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>RNC:</Text>
            <Text style={styles.value}>{factura.emisor_rnc}</Text>
          </View>
        </Surface>

        {/* Fechas */}
        <Surface style={styles.section}>
          <Text style={styles.sectionTitle}>Fechas</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Emisión:</Text>
            <Text style={styles.value}>{formatDate(factura.fecha_emision)}</Text>
          </View>
          {factura.fecha_vencimiento && (
            <View style={styles.row}>
              <Text style={styles.label}>Vencimiento:</Text>
              <Text style={styles.value}>{formatDate(factura.fecha_vencimiento)}</Text>
            </View>
          )}
        </Surface>

        {/* Montos */}
        <Surface style={styles.section}>
          <Text style={styles.sectionTitle}>Montos</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Subtotal:</Text>
            <Text style={styles.value}>{formatMoney(factura.subtotal)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>ITBIS (18%):</Text>
            <Text style={[styles.value, styles.itbis]}>{formatMoney(factura.itbis)}</Text>
          </View>
          <Divider style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.labelTotal}>TOTAL:</Text>
            <Text style={styles.total}>{formatMoney(factura.total)}</Text>
          </View>
        </Surface>

        {/* Confianza OCR */}
        {factura.confidence_score !== undefined && (
          <Surface style={styles.section}>
            <Text style={styles.sectionTitle}>Confianza OCR</Text>
            <View style={styles.confidenceBar}>
              <View
                style={[
                  styles.confidenceFill,
                  { width: `${factura.confidence_score * 100}%` },
                ]}
              />
            </View>
            <Text style={styles.confidenceText}>
              {Math.round(factura.confidence_score * 100)}% de precisión
            </Text>
          </Surface>
        )}

        {/* Botón reprocesar si hay error */}
        {factura.estado_ocr === 'error' && (
          <Button
            mode="contained"
            onPress={handleReprocesar}
            loading={isReprocesando}
            style={styles.reprocesarButton}
            buttonColor="#f59e0b"
          >
            Reprocesar OCR
          </Button>
        )}
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
            source={{ uri: getImageUrl(factura.imagen_url) || '' }}
            style={styles.modalImage}
            resizeMode="contain"
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
  },
  loadingText: {
    marginTop: 12,
    color: '#94a3b8',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
    marginBottom: 16,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  imageContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1e293b',
    marginBottom: 16,
  },
  facturaImage: {
    width: '100%',
    height: 200,
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
    fontSize: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  estadoBadge: {
    height: 28,
  },
  estadoText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  ocrStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ocrText: {
    color: '#94a3b8',
    fontSize: 13,
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
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    color: '#94a3b8',
    fontSize: 14,
  },
  labelTotal: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  value: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  ncf: {
    fontFamily: 'monospace',
    color: '#22D3EE',
  },
  itbis: {
    color: '#22D3EE',
  },
  total: {
    color: '#22D3EE',
    fontSize: 20,
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: 12,
    backgroundColor: '#334155',
  },
  confidenceBar: {
    height: 8,
    backgroundColor: '#334155',
    borderRadius: 4,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    backgroundColor: '#22D3EE',
  },
  confidenceText: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  reprocesarButton: {
    marginTop: 16,
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

export default InvoiceDetailScreen;
