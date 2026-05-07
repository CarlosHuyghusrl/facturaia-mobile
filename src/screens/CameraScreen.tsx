/**
 * ScannerScreen - Scanner mejorado con preview de datos OCR
 * 1. Escanea documento
 * 2. Preview imagen
 * 3. Procesa con OCR
 * 4. Muestra datos extraídos
 * 5. Opciones: Ver detalle / Escanear otra
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Image,
  ScrollView,
  Dimensions,
  Platform,
  PermissionsAndroid,
  Alert,
} from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import {
  Text,
  Button,
  Surface,
  ActivityIndicator,
  IconButton,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import DocumentScanner from 'react-native-document-scanner-plugin';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';

import {
  subirFacturaConValidacion,
  actualizarFactura,
  processInvoiceOptimistic,
  InvoiceProcessResponse,
  Factura,
} from '../services/facturasService';
import { getNetworkErrorMessage } from '../utils/errorMessages';
import { addToQueue, isOnline } from '../utils/offlineQueue';
import { optimisticStore } from '../utils/optimisticStore';
import { RootStackParamList } from '../../App';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type ScanState = 'idle' | 'preview' | 'processing' | 'success' | 'error';

const ScannerScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const [state, setState] = useState<ScanState>('idle');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [processResult, setProcessResult] = useState<InvoiceProcessResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tipoFactura, setTipoFactura] = useState<'compra' | 'venta' | null>(null);
  const [isSavingTipo, setIsSavingTipo] = useState(false);
  // Datos básicos para mostrar en éxito
  const [editData, setEditData] = useState({
    ncf: '',
    emisor_nombre: '',
    total: '',
  });
  // Countdown ms para auto-redirect tras OCR (UX-06)
  const [redirectIn, setRedirectIn] = useState<number | null>(null);

  // Helper: navegar a InvoiceReview con el mapping de campos OCR
  const navigateToReview = React.useCallback(() => {
    if (!processResult?.invoice_id) return;

    // W17.4 — t4: navigation transition start (InvoiceReview params dispatched)
    const w17_t4 = Date.now();
    const __W17_DIAG_NAV = __DEV__ || true;
    if (__W17_DIAG_NAV) {
      // Find the optimistic entry to get full timings
      const storeEntries = optimisticStore.getAll();
      const entry = storeEntries.find(f => f.invoice_id === processResult.invoice_id);
      const t = entry?.timings;
      if (t?.t0 !== undefined) {
        const summary = {
          t0: t.t0,
          t1: t.t1 ?? null,
          t2: t.t2 ?? null,
          t3: t.t3 ?? null,
          t4: w17_t4,
          capture_to_resize: t.t1 !== undefined ? t.t1 - t.t0 : null,
          upload: t.t2 !== undefined && t.t1 !== undefined ? t.t2 - t.t1 : null,
          gemini_processing: t.t3 !== undefined && t.t2 !== undefined ? t.t3 - t.t2 : null,
          ui_render: t.t3 !== undefined ? w17_t4 - t.t3 : null,
          total: w17_t4 - t.t0,
        };
        console.log(`[W17.4] FULL TIMINGS scan_id=${processResult.invoice_id}`, JSON.stringify(summary));
        console.log(`[W17.4] t4 (nav_start) = ${w17_t4} | delta_total=${summary.total}ms | delta_step=${summary.ui_render ?? '?'}ms`);
      } else {
        console.log(`[W17.4] t4 (nav_start) = ${w17_t4} (no t0 stored)`);
      }
      // Update store entry with t4
      if (entry) {
        optimisticStore.update(entry.id, { timings: { ...t, t4: w17_t4 } });
      }
    }

    navigation.navigate('InvoiceReview', {
      invoiceId: processResult.invoice_id,
      imageUrl: processResult.image_url,
      extractedData: {
        ncf: processResult.data.ncf || '',
        fecha_emision: processResult.data.fecha_documento || '',
        emisor_rnc: processResult.data.emisor_rnc || '',
        emisor_nombre: processResult.data.proveedor || '',
        monto_servicios: processResult.data.monto_servicios ?? 0,
        monto_bienes: processResult.data.monto_bienes ?? processResult.data.subtotal ?? 0,
        descuento: processResult.data.descuento || 0,
        itbis_facturado: processResult.data.itbis || 0,
        itbis_retenido: processResult.data.itbis_retenido || 0,
        isc_monto: processResult.data.isc || 0,
        propina_legal: processResult.data.propina || 0,
        otros_impuestos: processResult.data.otros_impuestos || 0,
        total_factura: processResult.data.monto || 0,
        retencion_isr_tipo: processResult.data.retencion_isr_tipo
          ? String(processResult.data.retencion_isr_tipo)
          : '',
        retencion_isr_monto: processResult.data.isr || 0,
      },
      validation: processResult.validation,
      extractionStatus: processResult.extraction_status,
    });
  }, [processResult, navigation]);

  // Auto-redirect tras OCR según extraction_status (con countdown visible y cancelable)
  useEffect(() => {
    if (!processResult?.invoice_id) return;
    const status = processResult.extraction_status;
    if (status === 'review' || status === 'error') {
      // Delay 1200ms con contador visible cada 100ms para que usuario sepa qué pasa
      const TOTAL_MS = 1200;
      setRedirectIn(TOTAL_MS);
      const tickInterval = setInterval(() => {
        setRedirectIn(prev => (prev !== null && prev > 100 ? prev - 100 : 0));
      }, 100);
      const timer = setTimeout(() => {
        setRedirectIn(null);
        navigateToReview();
      }, TOTAL_MS);
      return () => {
        clearTimeout(timer);
        clearInterval(tickInterval);
        setRedirectIn(null);
      };
    }
  }, [processResult?.invoice_id, processResult?.extraction_status, navigateToReview]);

  const formatMoney = (amount: number) => {
    return `RD$ ${amount.toLocaleString('es-DO', { minimumFractionDigits: 2 })}`;
  };

  const selectTipo = async (tipo: 'compra' | 'venta') => {
    if (!processResult?.invoice_id) return;
    setTipoFactura(tipo);
    setIsSavingTipo(true);
    try {
      await actualizarFactura(processResult.invoice_id, {
        aplica_607: tipo === 'venta',
        aplica_606: tipo === 'compra',
      });
    } catch (err) {
      console.error('[Scanner] Error guardando tipo:', err);
    } finally {
      setIsSavingTipo(false);
    }
  };

  /**
   * Resize image to max 1920px width at 80% quality before upload.
   * Reduces ~4MB image → ~200-400KB, cutting upload time ~1-2s
   * and helping the AI model process smaller payloads faster.
   */
  const resizeImage = async (uri: string): Promise<string> => {
    try {
      const result = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 1920 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );

      // Log size delta in dev builds
      if (__DEV__) {
        try {
          const info = await FileSystem.getInfoAsync(result.uri, { size: true });
          const sizeKB = info.exists && 'size' in info ? Math.round(info.size / 1024) : 0;
          console.log(`[OCR] image resized → ${result.width}px, ~${sizeKB}KB`);
        } catch (_) {}
      }

      return result.uri;
    } catch (err) {
      // Fail-safe: if resize fails, use original URI
      console.warn('[OCR] resize failed, using original:', err);
      return uri;
    }
  };

  // Abrir escáner de documentos
  const startScanner = async () => {
    try {
      const result = await DocumentScanner.scanDocument({
        croppedImageQuality: 70,
        maxNumDocuments: 1,
        responseType: 'imageFilePath',
      });

      if (result.scannedImages && result.scannedImages.length > 0) {
        setImageUri(result.scannedImages[0]);
        setState('preview');
        setError(null);
      }
    } catch (err: any) {
      console.error('[Scanner] Error:', err);
      setError('Error al abrir el escáner');
    }
  };

  // Pedir permiso de cámara en Android
  const requestCameraPermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return true;
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Permiso de Cámara',
          message: 'FacturaIA necesita acceso a la cámara para tomar fotos de facturas',
          buttonPositive: 'Permitir',
          buttonNegative: 'Cancelar',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.error('[Permission] Error:', err);
      return false;
    }
  };

  // Tomar foto directa con cámara
  const takePhoto = async () => {
    try {
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) {
        Alert.alert('Permiso denegado', 'Necesitas permitir el acceso a la cámara para tomar fotos.');
        return;
      }

      const result = await launchCamera({
        mediaType: 'photo',
        quality: 0.85,
        maxWidth: 2048,
        maxHeight: 2048,
        saveToPhotos: false,
      });

      if (result.assets && result.assets.length > 0 && result.assets[0].uri) {
        setImageUri(result.assets[0].uri);
        setState('preview');
        setError(null);
      }
    } catch (err: any) {
      console.error('[Camera] Error:', err);
      setError('Error al abrir la cámara');
    }
  };

  // Seleccionar imagen de galería
  const pickFromGallery = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.85,
        maxWidth: 2048,
        maxHeight: 2048,
        selectionLimit: 1,
      });

      if (result.assets && result.assets.length > 0 && result.assets[0].uri) {
        setImageUri(result.assets[0].uri);
        setState('preview');
        setError(null);
      }
    } catch (err: any) {
      console.error('[Gallery] Error:', err);
      setError('Error al abrir la galería');
    }
  };

  // W17.4 — always-on diagnostics flag
  const __W17_DIAG = __DEV__ || true;

  // Procesar imagen con OCR y validación
  const processImage = async () => {
    if (!imageUri) return;

    // W17.4 — t0: user pressed "Procesar OCR" button
    const w17_t0 = Date.now();
    if (__W17_DIAG) console.log(`[W17.4] t0 (procesar_pressed) = ${w17_t0}`);

    // Check internet before uploading
    const online = await isOnline();
    if (!online) {
      // Save to offline queue
      await addToQueue(imageUri);
      setError(null);
      Alert.alert(
        'Sin conexión',
        'No hay conexión a internet. La imagen se guardó localmente y se procesará cuando vuelva la conexión.',
        [{ text: 'OK' }],
      );
      return;
    }

    try {
      setState('processing');
      setError(null);

      // Step D: resize image before upload (4MB → ~200-400KB)
      const resizedUri = await resizeImage(imageUri);

      // W17.4 — t1: image resize complete
      const w17_t1 = Date.now();
      if (__W17_DIAG) console.log(`[W17.4] t1 (resize_done) = ${w17_t1} | delta_t0_t1=${w17_t1 - w17_t0}ms`);

      // Step C: use optimistic flow — HomeScreen shows "procesando" row instantly
      const result = await processInvoiceOptimistic(resizedUri, w17_t0, w17_t1);

      // W17.4 — t4 is measured when InvoiceReviewScreen mounts (see optimisticStore subscribe in navigateToReview)
      // Capture approximate t4 here as navigation transition start
      const w17_t4_nav = Date.now();
      if (__W17_DIAG) {
        const t2: number | undefined = (result as any).__w17_t2;
        const t3: number | undefined = (result as any).__w17_t3;
        // t4 from optimisticStore if available
        const storeEntry = optimisticStore.getAll().find(f => f.invoice_id === result.invoice_id);
        const t4 = storeEntry?.timings?.t4 ?? w17_t4_nav;
        const t3_fallback = t3 ?? w17_t4_nav;
        console.log(`[W17.4] FULL TIMINGS scan_id=${result.invoice_id}`, JSON.stringify({
          t0: w17_t0,
          t1: w17_t1,
          t2: t2 ?? null,
          t3: t3 ?? null,
          t4,
          capture_to_resize: w17_t1 - w17_t0,
          upload: t2 !== undefined ? t2 - w17_t1 : null,
          gemini_processing: t3 !== undefined && t2 !== undefined ? t3 - t2 : null,
          ui_render: t4 - t3_fallback,
          total: t4 - w17_t0,
        }));
      }

      setProcessResult(result);

      const factura = result.data;
      setEditData({
        ncf: factura.ncf || '',
        emisor_nombre: factura.emisor_nombre || '',
        total: String(factura.monto || 0),
      });

      setState('success');
    } catch (err: any) {
      console.error('[Scanner] Error procesando:', err);
      const friendlyMessage = err.userMessage || err.message || getNetworkErrorMessage(err instanceof Error ? err : new Error(String(err)));
      setError(friendlyMessage || 'Error al procesar la factura. Intenta de nuevo.');
      setState('error');
    }
  };

  // Cancelar y volver a escanear
  const reset = () => {
    setState('idle');
    setImageUri(null);
    setProcessResult(null);
    setError(null);
    setTipoFactura(null);
  };

  // Ver detalle de factura
  const goToDetail = () => {
    if (processResult) {
      navigation.navigate('InvoiceDetail', { facturaId: processResult.invoice_id });
    }
  };

  // Volver al home
  const goHome = () => {
    navigation.navigate('Home');
  };

  // Render: Estado inicial
  if (state === 'idle') {
    return (
      <View style={styles.container}>
        <View style={styles.centered}>
          <Surface style={styles.iconContainer}>
            <IconButton icon="camera-document" size={80} iconColor="#22D3EE" />
          </Surface>
          <Text style={styles.title}>Escanear Factura</Text>
          <Text style={styles.subtitle}>
            Escanea la factura con encuadre automático o selecciona una imagen
          </Text>
          <View style={styles.idleButtons}>
            <Button
              mode="contained"
              onPress={startScanner}
              style={styles.mainButton}
              contentStyle={styles.buttonContent}
              buttonColor="#22D3EE"
              textColor="#0f172a"
              icon="document-scanner"
              testID="camera-scan-doc"
              accessibilityLabel="Escáner de documentos"
            >
              Escanear Factura
            </Button>
            <Button
              mode="contained"
              onPress={pickFromGallery}
              style={styles.mainButton}
              contentStyle={styles.buttonContent}
              buttonColor="#3b82f6"
              textColor="#fff"
              icon="image-multiple"
              testID="camera-gallery"
              accessibilityLabel="Abrir galería"
            >
              Galería
            </Button>
            <Button
              mode="outlined"
              onPress={takePhoto}
              style={styles.mainButton}
              contentStyle={styles.buttonContent}
              textColor="#94a3b8"
              icon="camera"
              testID="camera-take-photo"
              accessibilityLabel="Tomar foto"
            >
              Foto Manual
            </Button>
          </View>
        </View>
      </View>
    );
  }

  // Render: Preview de imagen
  if (state === 'preview') {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.stepText}>Paso 1 de 2: Confirmar imagen</Text>

          <Surface style={styles.imagePreview}>
            <Image
              source={{ uri: imageUri! }}
              style={styles.previewImage}
              resizeMode="contain"
            />
          </Surface>

          <Text style={styles.previewHint}>
            Verifica que el texto sea legible antes de procesar
          </Text>

          <View style={styles.buttonRow}>
            <Button
              mode="outlined"
              onPress={reset}
              style={styles.halfButton}
              textColor="#94a3b8"
            >
              Volver a escanear
            </Button>
            <Button
              mode="contained"
              onPress={processImage}
              style={styles.halfButton}
              buttonColor="#22D3EE"
              textColor="#0f172a"
              icon="brain"
            >
              Procesar OCR
            </Button>
          </View>
        </ScrollView>
      </View>
    );
  }

  // Render: Procesando
  if (state === 'processing') {
    return (
      <View style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#22D3EE" />
          <Text style={styles.processingText}>Procesando con IA...</Text>
          <Text style={styles.processingSubtext}>
            Extrayendo NCF, RNC, montos e ITBIS
          </Text>
        </View>
      </View>
    );
  }

  // Render: Error
  if (state === 'error') {
    return (
      <View style={styles.container}>
        <View style={styles.centered}>
          <IconButton icon="alert-circle" size={60} iconColor="#ef4444" />
          <Text style={styles.errorTitle}>Error al procesar</Text>
          <Text style={styles.errorText}>{error}</Text>
          <Button
            mode="contained"
            onPress={reset}
            style={styles.mainButton}
            buttonColor="#f59e0b"
          >
            Intentar de nuevo
          </Button>
        </View>
      </View>
    );
  }

  // Render: Éxito - flujo rápido con confirmación breve
  const factura = processResult?.data;
  return (
    <View style={styles.container}>
      <View style={styles.centered}>
        {/* Checkmark animado */}
        <Surface style={styles.successCircle}>
          <IconButton icon="check" size={60} iconColor="#22c55e" />
        </Surface>

        <Text style={styles.successTitle}>¡Guardada!</Text>

        {/* Selector tipo compra/venta */}
        {!tipoFactura ? (
          <View style={{ width: '100%', paddingHorizontal: 24, marginBottom: 20 }}>
            <Text style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', marginBottom: 12 }}>
              ¿Tipo de factura?
            </Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Button
                mode="contained"
                onPress={() => selectTipo('compra')}
                style={{ flex: 1, borderRadius: 8 }}
                buttonColor="#1e293b"
                textColor="#fff"
                icon="cart-arrow-down"
              >
                Compra (606)
              </Button>
              <Button
                mode="contained"
                onPress={() => selectTipo('venta')}
                style={{ flex: 1, borderRadius: 8 }}
                buttonColor="#1e293b"
                textColor="#22D3EE"
                icon="cart-arrow-up"
              >
                Venta (607)
              </Button>
            </View>
          </View>
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 8 }}>
            <Text style={{ color: tipoFactura === 'venta' ? '#22D3EE' : '#22c55e', fontSize: 14, fontWeight: '600' }}>
              {isSavingTipo ? '⏳ Guardando...' : tipoFactura === 'venta' ? '📤 Venta (607)' : '📥 Compra (606)'}
            </Text>
            <Button mode="text" onPress={() => setTipoFactura(null)} textColor="#64748b" compact>
              Cambiar
            </Button>
          </View>
        )}

        {processResult?.extraction_status !== 'validated' && redirectIn !== null && (
          <View style={{ backgroundColor: '#78350f', padding: 12, borderRadius: 8, marginBottom: 12, width: '100%', paddingHorizontal: 16 }}>
            <Text style={{ color: '#fbbf24', fontSize: 13, textAlign: 'center', fontWeight: '600' }}>
              ⏱ Redirigiendo a edición en {Math.ceil(redirectIn / 1000)}s
            </Text>
            <Text style={{ color: '#fde68a', fontSize: 11, textAlign: 'center', marginTop: 4 }}>
              Algunos campos del OCR necesitan tu revisión
            </Text>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
              <Button
                mode="contained"
                compact
                buttonColor="#fbbf24"
                textColor="#0f172a"
                onPress={() => {
                  setRedirectIn(null);
                  navigateToReview();
                }}
                style={{ flex: 1, borderRadius: 8 }}
              >
                Editar ahora
              </Button>
              <Button
                mode="outlined"
                compact
                textColor="#fbbf24"
                onPress={() => setRedirectIn(null)}
                style={{ flex: 1, borderRadius: 8, borderColor: '#fbbf24' }}
              >
                Cancelar
              </Button>
            </View>
          </View>
        )}

        {processResult?.extraction_status !== 'validated' && redirectIn === null && (
          <View style={{ backgroundColor: '#78350f', padding: 10, borderRadius: 8, marginBottom: 12 }}>
            <Text style={{ color: '#fbbf24', fontSize: 12, textAlign: 'center' }}>
              ⚠️ Algunos campos necesitan revisión. Ve al detalle para verificar.
            </Text>
          </View>
        )}

        {processResult?.warning ? (
          <View style={{ backgroundColor: '#7c2d12', padding: 10, borderRadius: 8, marginBottom: 12 }}>
            <Text style={{ color: '#fb923c', fontSize: 12, textAlign: 'center' }}>
              ⚠️ {processResult.warning}
            </Text>
          </View>
        ) : null}

        {/* Info breve de la factura */}
        <Surface style={styles.quickInfo}>
          <Text style={styles.quickNCF}>{factura?.ncf || editData.ncf}</Text>
          <Text style={styles.quickProveedor}>{factura?.emisor_nombre || editData.emisor_nombre}</Text>
          <Text style={styles.quickTotal}>{formatMoney(factura?.monto || parseFloat(editData.total) || 0)}</Text>
        </Surface>

        {/* Dos botones principales */}
        <View style={styles.quickActions}>
          <Button
            mode="contained"
            onPress={reset}
            style={styles.primaryAction}
            contentStyle={styles.buttonContent}
            buttonColor="#22D3EE"
            textColor="#0f172a"
            icon="camera"
          >
            Escanear Otra
          </Button>

          <Button
            mode="contained"
            onPress={() => navigation.navigate('Home')}
            style={styles.secondaryAction}
            contentStyle={styles.buttonContent}
            buttonColor="#3b82f6"
            textColor="#fff"
            icon="format-list-bulleted"
          >
            Ver Lista
          </Button>
        </View>

        {/* Link pequeño para ver detalle si necesita editar */}
        <Button
          mode="text"
          onPress={goToDetail}
          textColor="#64748b"
          compact
        >
          Ver detalle / editar
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 24,
  },
  idleButtons: {
    gap: 14,
    width: '100%',
    paddingHorizontal: 20,
  },
  mainButton: {
    borderRadius: 12,
    minWidth: 200,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  stepText: {
    fontSize: 14,
    color: '#22D3EE',
    textAlign: 'center',
    marginBottom: 16,
  },
  imagePreview: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1e293b',
  },
  previewImage: {
    width: '100%',
    height: 300,
  },
  previewHint: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    marginVertical: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  halfButton: {
    flex: 1,
    borderRadius: 8,
  },
  processingText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginTop: 24,
  },
  processingSubtext: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 8,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ef4444',
    marginTop: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 8,
    marginBottom: 24,
    textAlign: 'center',
  },
  // Éxito - flujo rápido
  successCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 4,
    borderColor: '#22c55e',
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#22c55e',
    marginBottom: 24,
  },
  quickInfo: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    marginBottom: 32,
    minWidth: 280,
  },
  quickNCF: {
    fontSize: 16,
    fontFamily: 'monospace',
    color: '#22D3EE',
    fontWeight: '600',
    marginBottom: 8,
  },
  quickProveedor: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 8,
    textAlign: 'center',
  },
  quickTotal: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  quickActions: {
    gap: 12,
    width: '100%',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  primaryAction: {
    borderRadius: 12,
  },
  secondaryAction: {
    borderRadius: 12,
  },
});

export default ScannerScreen;
