/**
 * ScannerScreen - Scanner mejorado con preview de datos OCR
 * 1. Escanea documento
 * 2. Preview imagen
 * 3. Procesa con OCR
 * 4. Muestra datos extraídos
 * 5. Opciones: Ver detalle / Escanear otra
 */

import React, { useState } from 'react';
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
  InvoiceProcessResponse,
  Factura,
} from '../services/facturasService';
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
  // Datos básicos para mostrar en éxito
  const [editData, setEditData] = useState({
    ncf: '',
    emisor_nombre: '',
    total: '',
  });

  const formatMoney = (amount: number) => {
    return `RD$ ${amount.toLocaleString('es-DO', { minimumFractionDigits: 2 })}`;
  };

  // Abrir escáner de documentos
  const startScanner = async () => {
    try {
      const result = await DocumentScanner.scanDocument({
        croppedImageQuality: 100,
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
        quality: 1,
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
        quality: 1,
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

  // Procesar imagen con OCR y validación
  const processImage = async () => {
    if (!imageUri) return;

    try {
      setState('processing');
      setError(null);

      const result = await subirFacturaConValidacion(imageUri);
      setProcessResult(result);

      const factura = result.data;
      setEditData({
        ncf: factura.ncf || '',
        emisor_nombre: factura.emisor_nombre || '',
        total: String(factura.monto || 0),
      });

      // Si necesita revisión, ir directo a pantalla de revisión
      if (result.extraction_status === 'review' || result.extraction_status === 'error') {
        navigation.navigate('InvoiceReview', {
          invoiceId: result.invoice_id,
          imageUrl: result.image_url,
          extractedData: factura,
          validation: result.validation,
          extractionStatus: result.extraction_status,
        });
        // Reset para próximo scan
        setState('idle');
        setImageUri(null);
        return;
      }

      setState('success');
    } catch (err: any) {
      console.error('[Scanner] Error procesando:', err);
      setError(err.message || 'Error al procesar la factura');
      setState('error');
    }
  };

  // Cancelar y volver a escanear
  const reset = () => {
    setState('idle');
    setImageUri(null);
    setProcessResult(null);
    setError(null);
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
            Toma una foto de la factura o selecciona una imagen guardada
          </Text>
          <View style={styles.idleButtons}>
            <Button
              mode="contained"
              onPress={takePhoto}
              style={styles.mainButton}
              contentStyle={styles.buttonContent}
              buttonColor="#22D3EE"
              textColor="#0f172a"
              icon="camera"
            >
              Tomar Foto
            </Button>
            <Button
              mode="contained"
              onPress={pickFromGallery}
              style={styles.mainButton}
              contentStyle={styles.buttonContent}
              buttonColor="#3b82f6"
              textColor="#fff"
              icon="image-multiple"
            >
              Galería
            </Button>
            <Button
              mode="outlined"
              onPress={startScanner}
              style={styles.mainButton}
              contentStyle={styles.buttonContent}
              textColor="#94a3b8"
              icon="document-scanner"
            >
              Escáner Documentos
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
            onPress={() => navigation.navigate('InvoiceList')}
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
