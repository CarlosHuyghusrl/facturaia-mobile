/**
 * CameraScreen - Invoice scanning with auto-detection
 *
 * Features:
 * - Document auto-detection with react-native-document-scanner-plugin
 * - Automatic edge detection and perspective correction
 * - Auto-capture when document is properly aligned
 * - OCR processing with backend service
 * - Auto-save to Supabase
 */

import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
  Text,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import {Button, Surface, Title, Paragraph} from 'react-native-paper';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import DocumentScanner from 'react-native-document-scanner-plugin';
import {RootStackParamList, ProcessInvoiceResponse} from '../types/invoice';
import {processInvoice} from '../services/api';
import {supabase, getCurrentUser, uploadReceiptImage} from '../config/supabase';

type CameraScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Camera'
>;
type CameraScreenRouteProp = RouteProp<RootStackParamList, 'Camera'>;

interface Props {
  navigation: CameraScreenNavigationProp;
  route: CameraScreenRouteProp;
}

const CameraScreen: React.FC<Props> = ({navigation, route}) => {
  const {groupId} = route.params;

  // State
  const [scannedImage, setScannedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  // ==========================================
  // Permission Handling
  // ==========================================

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Permiso de Camara',
            message: 'FacturIA necesita acceso a la camara para escanear facturas',
            buttonNeutral: 'Preguntar luego',
            buttonNegative: 'Cancelar',
            buttonPositive: 'Aceptar',
          },
        );
        setHasPermission(granted === PermissionsAndroid.RESULTS.GRANTED);
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.error('Error requesting permission:', err);
        setHasPermission(false);
        return false;
      }
    }
    setHasPermission(true);
    return true;
  };

  // ==========================================
  // Document Scanner
  // ==========================================

  const scanDocument = async () => {
    try {
      // Request permission first
      const permitted = await requestCameraPermission();
      if (!permitted) {
        Alert.alert(
          'Permiso Requerido',
          'Por favor, permite el acceso a la camara para escanear facturas',
        );
        return;
      }

      // Launch document scanner with auto-detection
      const result = await DocumentScanner.scanDocument({
        croppedImageQuality: 100,
        maxNumDocuments: 1,
        responseType: 'imageFilePath',
      });

      if (result.scannedImages && result.scannedImages.length > 0) {
        const imagePath = result.scannedImages[0];
        console.log('Document scanned:', imagePath);
        setScannedImage(imagePath);
      } else {
        // User cancelled or no image
        navigation.goBack();
      }
    } catch (error: any) {
      console.error('Error scanning document:', error);
      Alert.alert('Error', 'No se pudo escanear el documento. Intenta de nuevo.');
    }
  };

  // Start scanner on mount
  useEffect(() => {
    scanDocument();
  }, []);

  // ==========================================
  // OCR Processing
  // ==========================================

  const handleProcessInvoice = async () => {
    if (!scannedImage) {
      return;
    }

    setIsProcessing(true);
    setProcessingStatus('Procesando imagen con OCR...');

    try {
      // Step 1: Process with OCR service
      const imageUri = scannedImage.startsWith('file://')
        ? scannedImage
        : `file://${scannedImage}`;

      const result = await processInvoice(imageUri, {
        aiProvider: 'gemini',
        useVisionModel: false,
        language: 'spa+eng',
      });

      if (!result.success || !result.invoice) {
        throw new Error(result.error || 'OCR processing failed');
      }

      console.log('OCR Result:', result.invoice);
      setProcessingStatus('Guardando en base de datos...');

      // Step 2: Get current user
      const user = await getCurrentUser();
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      // Step 3: Upload image to Supabase Storage
      const fileName = `invoice_${Date.now()}.jpg`;
      const imageUrl = await uploadReceiptImage(imageUri, fileName);

      // Step 4: Create receipt record in Supabase
      const {data: receipt, error: receiptError} = await supabase
        .from('receipts')
        .insert({
          name: result.invoice.vendor || 'Proveedor Desconocido',
          amount: result.invoice.total,
          date: result.invoice.date,
          paid_by_user_id: user.id,
          group_id: groupId,
          status: 'OPEN',
        })
        .select()
        .single();

      if (receiptError) {
        throw receiptError;
      }

      // Step 5: Create receipt image record
      const {error: imageError} = await supabase
        .from('receipt_images')
        .insert({
          receipt_id: receipt.id,
          image_url: imageUrl,
        });

      if (imageError) {
        throw imageError;
      }

      // Step 6: Create receipt items
      if (result.invoice.items && result.invoice.items.length > 0) {
        const items = result.invoice.items.map(item => ({
          receipt_id: receipt.id,
          name: item.name,
          amount: item.total,
          quantity: item.quantity,
          status: 'OPEN',
        }));

        const {error: itemsError} = await supabase
          .from('receipt_items')
          .insert(items);

        if (itemsError) {
          console.error('Error creating items:', itemsError);
        }
      }

      setProcessingStatus('Completado!');

      // Show success message and navigate
      Alert.alert(
        'Factura Guardada',
        `Procesado correctamente:\n${result.invoice.vendor}\nTotal: $${result.invoice.total.toFixed(2)}`,
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.replace('InvoiceList', {groupId});
            },
          },
        ],
      );
    } catch (error: any) {
      console.error('Error processing invoice:', error);
      Alert.alert(
        'Error al Procesar',
        error.message || 'No se pudo procesar la factura. Intenta de nuevo.',
        [{text: 'Reintentar', onPress: () => setScannedImage(null)}],
      );
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };

  const handleRetake = () => {
    setScannedImage(null);
    scanDocument();
  };

  // ==========================================
  // Render
  // ==========================================

  // Permission denied
  if (hasPermission === false) {
    return (
      <View style={styles.centerContainer}>
        <Title>Permiso de Camara Requerido</Title>
        <Paragraph style={styles.errorText}>
          Por favor, permite el acceso a la camara para escanear facturas
        </Paragraph>
        <Button mode="contained" onPress={requestCameraPermission}>
          Dar Permiso
        </Button>
        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          style={{marginTop: 16}}>
          Volver
        </Button>
      </View>
    );
  }

  // Scanning in progress (no image yet)
  if (!scannedImage) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1976d2" />
        <Paragraph style={styles.loadingText}>
          Abriendo escaner de documentos...
        </Paragraph>
      </View>
    );
  }

  // Preview scanned image
  return (
    <View style={styles.container}>
      <Image
        source={{uri: scannedImage}}
        style={styles.preview}
        resizeMode="contain"
      />

      {isProcessing && (
        <Surface style={styles.processingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.processingText}>{processingStatus}</Text>
        </Surface>
      )}

      {!isProcessing && (
        <View style={styles.previewActions}>
          <Button
            mode="outlined"
            onPress={handleRetake}
            style={styles.actionButton}
            icon="camera-retake"
            textColor="#fff">
            Repetir
          </Button>
          <Button
            mode="contained"
            onPress={handleProcessInvoice}
            style={styles.actionButton}
            icon="check">
            Procesar
          </Button>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f5f5f5',
  },
  preview: {
    flex: 1,
    backgroundColor: '#000',
  },
  previewActions: {
    position: 'absolute',
    bottom: 40,
    left: 24,
    right: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 16,
  },
  loadingText: {
    marginTop: 16,
    textAlign: 'center',
  },
  errorText: {
    marginVertical: 16,
    textAlign: 'center',
  },
});

export default CameraScreen;
