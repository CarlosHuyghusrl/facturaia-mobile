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
  Divider,
  TextInput,
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
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    ncf: '',
    emisor_nombre: '',
    emisor_rnc: '',
    subtotal: '',
    itbis: '',
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
        emisor_rnc: factura.emisor_rnc || '',
        subtotal: String(factura.subtotal || 0),
        itbis: String(factura.itbis || 0),
        total: String(factura.monto || 0),
      });
      setIsEditing(false);

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

  // Ir a pantalla de revisión
  const goToReview = () => {
    if (processResult) {
      navigation.navigate('InvoiceReview', {
        invoiceId: processResult.invoice_id,
        imageUrl: processResult.image_url,
        extractedData: processResult.data,
        validation: processResult.validation,
        extractionStatus: processResult.extraction_status,
      });
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

  // Render: Éxito - mostrar datos extraídos
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.successHeader}>
          <IconButton icon="check-circle" size={40} iconColor="#22c55e" />
          <Text style={styles.successTitle}>Factura procesada</Text>
        </View>

        {/* Thumbnail */}
        {imageUri && (
          <Surface style={styles.thumbnailContainer}>
            <Image
              source={{ uri: imageUri }}
              style={styles.thumbnail}
              resizeMode="cover"
            />
          </Surface>
        )}

        {/* Datos extraídos */}
        <Surface style={styles.dataCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Datos Extraídos</Text>
            <Button
              mode="text"
              onPress={() => setIsEditing(!isEditing)}
              textColor={isEditing ? '#22c55e' : '#f59e0b'}
              compact
              icon={isEditing ? 'check' : 'pencil'}
            >
              {isEditing ? 'Listo' : 'Editar'}
            </Button>
          </View>

          {isEditing ? (
            <View>
              <TextInput
                label="NCF"
                value={editData.ncf}
                onChangeText={(t) => setEditData({ ...editData, ncf: t })}
                style={styles.editInput}
                mode="outlined"
                outlineColor="#334155"
                activeOutlineColor="#22D3EE"
                textColor="#fff"
                theme={{ colors: { onSurfaceVariant: '#94a3b8' }}}
              />
              <TextInput
                label="Emisor (Vendedor)"
                value={editData.emisor_nombre}
                onChangeText={(t) => setEditData({ ...editData, emisor_nombre: t })}
                style={styles.editInput}
                mode="outlined"
                outlineColor="#334155"
                activeOutlineColor="#22D3EE"
                textColor="#fff"
                theme={{ colors: { onSurfaceVariant: '#94a3b8' }}}
              />
              <TextInput
                label="RNC Emisor"
                value={editData.emisor_rnc}
                onChangeText={(t) => setEditData({ ...editData, emisor_rnc: t })}
                style={styles.editInput}
                mode="outlined"
                outlineColor="#334155"
                activeOutlineColor="#22D3EE"
                textColor="#fff"
                keyboardType="numeric"
                theme={{ colors: { onSurfaceVariant: '#94a3b8' }}}
              />
              <TextInput
                label="Subtotal"
                value={editData.subtotal}
                onChangeText={(t) => setEditData({ ...editData, subtotal: t })}
                style={styles.editInput}
                mode="outlined"
                outlineColor="#334155"
                activeOutlineColor="#22D3EE"
                textColor="#fff"
                keyboardType="decimal-pad"
                theme={{ colors: { onSurfaceVariant: '#94a3b8' }}}
              />
              <TextInput
                label="ITBIS (18%)"
                value={editData.itbis}
                onChangeText={(t) => setEditData({ ...editData, itbis: t })}
                style={styles.editInput}
                mode="outlined"
                outlineColor="#334155"
                activeOutlineColor="#22D3EE"
                textColor="#fff"
                keyboardType="decimal-pad"
                theme={{ colors: { onSurfaceVariant: '#94a3b8' }}}
              />
              <TextInput
                label="Total"
                value={editData.total}
                onChangeText={(t) => setEditData({ ...editData, total: t })}
                style={styles.editInput}
                mode="outlined"
                outlineColor="#334155"
                activeOutlineColor="#22D3EE"
                textColor="#fff"
                keyboardType="decimal-pad"
                theme={{ colors: { onSurfaceVariant: '#94a3b8' }}}
              />
            </View>
          ) : (
            <View>
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>NCF:</Text>
                <Text style={styles.dataValueHighlight}>{editData.ncf || 'No detectado'}</Text>
              </View>

              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Emisor:</Text>
                <Text style={styles.dataValue}>{editData.emisor_nombre || 'No detectado'}</Text>
              </View>

              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>RNC Emisor:</Text>
                <Text style={styles.dataValue}>{editData.emisor_rnc || 'No detectado'}</Text>
              </View>

              <Divider style={styles.divider} />

              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Subtotal:</Text>
                <Text style={styles.dataValue}>{formatMoney(parseFloat(editData.subtotal) || 0)}</Text>
              </View>

              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>ITBIS (18%):</Text>
                <Text style={[styles.dataValue, styles.itbisValue]}>
                  {formatMoney(parseFloat(editData.itbis) || 0)}
                </Text>
              </View>

              <Divider style={styles.divider} />

              <View style={styles.dataRow}>
                <Text style={styles.totalLabel}>TOTAL:</Text>
                <Text style={styles.totalValue}>{formatMoney(parseFloat(editData.total) || 0)}</Text>
              </View>
            </View>
          )}
        </Surface>

        {/* Botones de acción */}
        <View style={styles.actionButtons}>
          <Button
            mode="contained"
            onPress={goToDetail}
            style={styles.actionButton}
            buttonColor="#22D3EE"
            textColor="#0f172a"
            icon="file-document"
          >
            Ver Detalle Completo
          </Button>

          <Button
            mode="contained"
            onPress={goToReview}
            style={styles.actionButton}
            buttonColor="#3b82f6"
            textColor="#fff"
            icon="file-check"
          >
            Revisar Campos Fiscales
          </Button>

          <Button
            mode="outlined"
            onPress={reset}
            style={styles.actionButton}
            textColor="#22D3EE"
            icon="camera"
          >
            Escanear Otra
          </Button>

          <Button
            mode="text"
            onPress={goHome}
            style={styles.actionButton}
            textColor="#94a3b8"
            icon="home"
          >
            Volver al Inicio
          </Button>
        </View>
      </ScrollView>
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
  successHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#22c55e',
  },
  thumbnailContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1e293b',
    marginBottom: 16,
  },
  thumbnail: {
    width: '100%',
    height: 120,
  },
  dataCard: {
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#1e293b',
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#22D3EE',
    textTransform: 'uppercase',
  },
  editInput: {
    backgroundColor: '#0f172a',
    marginBottom: 10,
    fontSize: 14,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dataLabel: {
    fontSize: 14,
    color: '#94a3b8',
  },
  dataValue: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  dataValueHighlight: {
    fontSize: 14,
    color: '#22D3EE',
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  itbisValue: {
    color: '#22D3EE',
  },
  divider: {
    backgroundColor: '#334155',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  totalValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#22D3EE',
  },
  actionButtons: {
    gap: 12,
  },
  actionButton: {
    borderRadius: 8,
  },
});

export default ScannerScreen;
