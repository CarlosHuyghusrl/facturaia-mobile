/**
 * CameraScreen - Invoice scanning with camera
 *
 * Features:
 * - Camera capture with react-native-vision-camera
 * - Image preview and confirmation
 * - OCR processing with Railway service
 * - Auto-save to Supabase
 * - Loading states and error handling
 */

import React, {useState, useRef, useEffect, useCallback} from 'react';
import {
  View,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
  Text,
} from 'react-native';
import {Button, IconButton, Surface, Title, Paragraph} from 'react-native-paper';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  PhotoFile,
} from 'react-native-vision-camera';
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

  // Camera setup
  const cameraRef = useRef<Camera>(null);
  const device = useCameraDevice('back');
  const {hasPermission, requestPermission} = useCameraPermission();

  // State
  const [capturedPhoto, setCapturedPhoto] = useState<PhotoFile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [ocrResult, setOcrResult] = useState<ProcessInvoiceResponse | null>(
    null,
  );

  // ==========================================
  // Effects
  // ==========================================

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  // ==========================================
  // Camera Functions
  // ==========================================

  const handleTakePhoto = useCallback(async () => {
    if (!cameraRef.current) {
      Alert.alert('Error', 'Camera not ready');
      return;
    }

    try {
      const photo = await cameraRef.current.takePhoto({
        qualityPrioritization: 'quality',
        flash: 'auto',
      });

      console.log('Photo captured:', photo.path);
      setCapturedPhoto(photo);
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to capture photo');
    }
  }, []);

  const handleRetake = () => {
    setCapturedPhoto(null);
    setOcrResult(null);
  };

  // ==========================================
  // OCR Processing
  // ==========================================

  const handleProcessInvoice = async () => {
    if (!capturedPhoto) {
      return;
    }

    setIsProcessing(true);
    setProcessingStatus('Processing image with OCR...');

    try {
      // Step 1: Process with Railway OCR service
      const imageUri = `file://${capturedPhoto.path}`;
      const result = await processInvoice(imageUri, {
        aiProvider: 'gemini',
        useVisionModel: false,
        language: 'spa+eng',
      });

      if (!result.success || !result.invoice) {
        throw new Error(result.error || 'OCR processing failed');
      }

      console.log('OCR Result:', result.invoice);
      setOcrResult(result);
      setProcessingStatus('Uploading to database...');

      // Step 2: Get current user
      const user = await getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Step 3: Upload image to Supabase Storage
      const fileName = `invoice_${Date.now()}.jpg`;
      const imageUrl = await uploadReceiptImage(imageUri, fileName);

      // Step 4: Create receipt record in Supabase
      const {data: receipt, error: receiptError} = await supabase
        .from('receipts')
        .insert({
          name: result.invoice.vendor || 'Unknown Vendor',
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

      setProcessingStatus('Success!');

      // Show success message and navigate
      Alert.alert(
        'Invoice Saved',
        `Successfully processed: ${result.invoice.vendor}\nTotal: $${result.invoice.total.toFixed(2)}`,
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
        'Processing Failed',
        error.message || 'Failed to process invoice. Please try again.',
        [{text: 'Retry', onPress: handleRetake}],
      );
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };

  // ==========================================
  // Render
  // ==========================================

  // Loading state
  if (!hasPermission) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
        <Paragraph style={styles.loadingText}>
          Requesting camera permission...
        </Paragraph>
      </View>
    );
  }

  // Permission denied
  if (hasPermission === false) {
    return (
      <View style={styles.centerContainer}>
        <Title>Camera Permission Required</Title>
        <Paragraph style={styles.errorText}>
          Please grant camera permission to scan invoices
        </Paragraph>
        <Button mode="contained" onPress={requestPermission}>
          Grant Permission
        </Button>
      </View>
    );
  }

  // No camera device
  if (!device) {
    return (
      <View style={styles.centerContainer}>
        <Title>No Camera Available</Title>
        <Paragraph style={styles.errorText}>
          Cannot access camera device
        </Paragraph>
      </View>
    );
  }

  // Preview captured photo
  if (capturedPhoto) {
    return (
      <View style={styles.container}>
        <Image
          source={{uri: `file://${capturedPhoto.path}`}}
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
              icon="camera-retake">
              Retake
            </Button>
            <Button
              mode="contained"
              onPress={handleProcessInvoice}
              style={styles.actionButton}
              icon="check">
              Process
            </Button>
          </View>
        )}
      </View>
    );
  }

  // Camera view
  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={styles.camera}
        device={device}
        isActive={true}
        photo={true}
      />

      {/* Camera Controls */}
      <View style={styles.controls}>
        <IconButton
          icon="close"
          size={30}
          iconColor="#fff"
          onPress={() => navigation.goBack()}
        />

        <IconButton
          icon="camera"
          size={60}
          iconColor="#fff"
          style={styles.captureButton}
          onPress={handleTakePhoto}
        />

        <View style={{width: 48}} />
      </View>

      {/* Instructions */}
      <Surface style={styles.instructions}>
        <Paragraph style={styles.instructionsText}>
          Position the invoice within the frame and tap the camera button
        </Paragraph>
      </Surface>
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
  },
  camera: {
    flex: 1,
  },
  preview: {
    flex: 1,
    backgroundColor: '#000',
  },
  controls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  captureButton: {
    backgroundColor: '#1976d2',
  },
  instructions: {
    position: 'absolute',
    top: 40,
    left: 24,
    right: 24,
    padding: 16,
    borderRadius: 8,
    elevation: 4,
  },
  instructionsText: {
    textAlign: 'center',
    fontSize: 14,
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
