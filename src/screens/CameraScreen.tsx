/**
 * CameraScreen - Vision Camera (OCR en Backend)
 *
 * Captura fotos y las envía al backend Gemini Vision para OCR.
 * Sin procesamiento OCR local para evitar problemas de compatibilidad.
 */

import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  View,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
  Text,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import {Button, Surface, IconButton} from 'react-native-paper';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  PhotoFile,
} from 'react-native-vision-camera';
import ImagePicker from 'react-native-image-crop-picker';
import {RootStackParamList} from '../types/invoice';
import {processInvoice} from '../services/api';
import {supabase, getCurrentUser, uploadReceiptImage} from '../config/supabase';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

type CameraScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Camera'>;
type CameraScreenRouteProp = RouteProp<RootStackParamList, 'Camera'>;

interface Props {
  navigation: CameraScreenNavigationProp;
  route: CameraScreenRouteProp;
}

type CaptureMode = 'normal' | 'long' | 'gallery';

const CameraScreen: React.FC<Props> = ({navigation, route}) => {
  const {groupId} = route.params;

  // Camera refs and state
  const cameraRef = useRef<Camera>(null);
  const device = useCameraDevice('back');
  const {hasPermission, requestPermission} = useCameraPermission();

  // UI State
  const [captureMode, setCaptureMode] = useState<CaptureMode>('normal');
  const [flash, setFlash] = useState<'off' | 'on'>('off');
  const [zoom, setZoom] = useState(1);

  // Capture state
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [longModeImages, setLongModeImages] = useState<{top?: string; bottom?: string}>({});
  const [longModeStep, setLongModeStep] = useState<'top' | 'bottom'>('top');

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');

  // Request permission on mount
  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  // ==========================================
  // Capture Photo
  // ==========================================

  const capturePhoto = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePhoto({
        flash: flash,
        qualityPrioritization: 'quality',
      });

      const photoPath = 'file://' + photo.path;

      if (captureMode === 'long') {
        if (longModeStep === 'top') {
          setLongModeImages({...longModeImages, top: photoPath});
          setLongModeStep('bottom');
          Alert.alert('Parte superior capturada', 'Ahora capture la parte inferior de la factura');
        } else {
          setLongModeImages({...longModeImages, bottom: photoPath});
          setCapturedImage(photoPath);
        }
      } else {
        setCapturedImage(photoPath);
      }
    } catch (error) {
      console.error('Error capturing photo:', error);
      Alert.alert('Error', 'No se pudo capturar la foto');
    }
  };

  // ==========================================
  // Gallery Selection
  // ==========================================

  const openGallery = async () => {
    try {
      const image = await ImagePicker.openPicker({
        width: 2000,
        height: 3000,
        cropping: true,
        freeStyleCropEnabled: true,
        compressImageQuality: 0.9,
      });

      setCapturedImage(image.path);
    } catch (error: any) {
      if (error.code !== 'E_PICKER_CANCELLED') {
        console.error('Gallery error:', error);
        Alert.alert('Error', 'No se pudo seleccionar la imagen');
      }
    }
  };

  // ==========================================
  // Process Invoice (Backend OCR)
  // ==========================================

  const handleProcessInvoice = async () => {
    if (!capturedImage) {
      Alert.alert('Error', 'No hay imagen capturada');
      return;
    }

    setIsProcessing(true);
    setProcessingStatus('Enviando imagen al servidor...');

    try {
      // Get current user
      const user = await getCurrentUser();
      if (!user) {
        Alert.alert('Error', 'Debe iniciar sesión');
        return;
      }

      setProcessingStatus('Procesando con IA...');

      // Send to backend for OCR (Gemini Vision)
      const result = await processInvoice(capturedImage);

      if (result.success) {
        setProcessingStatus('Guardando factura...');

        // Upload image to storage
        const imageUrl = await uploadReceiptImage(capturedImage, user.id);

        // Save to database
        const {data, error} = await supabase.from('facturas').insert({
          user_id: user.id,
          group_id: groupId,
          vendor: result.data.vendor || 'Desconocido',
          date: result.data.date || new Date().toISOString().split('T')[0],
          total: result.data.total || 0,
          subtotal: result.data.subtotal || 0,
          tax: result.data.tax || 0,
          ncf: result.data.ncf || null,
          rnc: result.data.rnc || null,
          image_url: imageUrl,
          items: result.data.items || [],
          raw_text: result.data.raw_text || '',
        });

        if (error) throw error;

        Alert.alert('Exito', 'Factura procesada correctamente', [
          {text: 'OK', onPress: () => navigation.goBack()},
        ]);
      } else {
        Alert.alert('Error', result.error || 'Error procesando factura');
      }
    } catch (error: any) {
      console.error('Process error:', error);
      Alert.alert('Error', error.message || 'Error al procesar');
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };

  // ==========================================
  // Reset / Retake
  // ==========================================

  const resetCapture = () => {
    setCapturedImage(null);
    setLongModeImages({});
    setLongModeStep('top');
  };

  // ==========================================
  // Render Loading / No Permission
  // ==========================================

  if (!hasPermission) {
    return (
      <View style={styles.centered}>
        <Text style={styles.message}>Se requiere permiso de camara</Text>
        <Button mode="contained" onPress={requestPermission}>
          Solicitar Permiso
        </Button>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.message}>Cargando camara...</Text>
      </View>
    );
  }

  // ==========================================
  // Render Preview (After Capture)
  // ==========================================

  if (capturedImage) {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.previewContainer}>
          <Image source={{uri: capturedImage}} style={styles.previewImage} resizeMode="contain" />

          {isProcessing ? (
            <View style={styles.processingContainer}>
              <ActivityIndicator size="large" color="#2196F3" />
              <Text style={styles.processingText}>{processingStatus}</Text>
            </View>
          ) : (
            <View style={styles.previewButtons}>
              <Button
                mode="outlined"
                onPress={resetCapture}
                style={styles.previewButton}
                icon="camera-retake">
                Retomar
              </Button>
              <Button
                mode="contained"
                onPress={handleProcessInvoice}
                style={styles.previewButton}
                icon="check">
                Procesar
              </Button>
            </View>
          )}
        </ScrollView>
      </View>
    );
  }

  // ==========================================
  // Render Camera
  // ==========================================

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        photo={true}
        zoom={zoom}
      />

      {/* Mode Selector */}
      <View style={styles.modeSelector}>
        <TouchableOpacity
          style={[styles.modeButton, captureMode === 'normal' && styles.modeButtonActive]}
          onPress={() => setCaptureMode('normal')}>
          <Text style={[styles.modeText, captureMode === 'normal' && styles.modeTextActive]}>
            Normal
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeButton, captureMode === 'long' && styles.modeButtonActive]}
          onPress={() => setCaptureMode('long')}>
          <Text style={[styles.modeText, captureMode === 'long' && styles.modeTextActive]}>
            Larga
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeButton, captureMode === 'gallery' && styles.modeButtonActive]}
          onPress={() => {
            setCaptureMode('gallery');
            openGallery();
          }}>
          <Text style={[styles.modeText, captureMode === 'gallery' && styles.modeTextActive]}>
            Galeria
          </Text>
        </TouchableOpacity>
      </View>

      {/* Long Mode Instructions */}
      {captureMode === 'long' && (
        <View style={styles.longModeOverlay}>
          <Text style={styles.longModeText}>
            {longModeStep === 'top' ? 'Capture parte SUPERIOR' : 'Capture parte INFERIOR'}
          </Text>
          {longModeImages.top && (
            <Text style={styles.longModeStatus}>Superior capturada</Text>
          )}
        </View>
      )}

      {/* Controls */}
      <View style={styles.controls}>
        <IconButton
          icon={flash === 'on' ? 'flash' : 'flash-off'}
          iconColor="white"
          size={30}
          onPress={() => setFlash(flash === 'on' ? 'off' : 'on')}
        />

        <TouchableOpacity style={styles.captureButton} onPress={capturePhoto}>
          <View style={styles.captureButtonInner} />
        </TouchableOpacity>

        <IconButton
          icon="image-multiple"
          iconColor="white"
          size={30}
          onPress={openGallery}
        />
      </View>

      {/* Zoom Slider */}
      <View style={styles.zoomContainer}>
        <Text style={styles.zoomText}>{zoom.toFixed(1)}x</Text>
        <TouchableOpacity onPress={() => setZoom(Math.min(zoom + 0.5, 5))}>
          <Text style={styles.zoomButton}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setZoom(Math.max(zoom - 0.5, 1))}>
          <Text style={styles.zoomButton}>-</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  message: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  modeSelector: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    zIndex: 10,
  },
  modeButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modeButtonActive: {
    backgroundColor: '#2196F3',
  },
  modeText: {
    color: 'white',
    fontSize: 14,
  },
  modeTextActive: {
    fontWeight: 'bold',
  },
  longModeOverlay: {
    position: 'absolute',
    top: 120,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  longModeText: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: 'bold',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
    borderRadius: 10,
  },
  longModeStatus: {
    color: '#4CAF50',
    fontSize: 14,
    marginTop: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 5,
    borderRadius: 5,
  },
  controls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: 'white',
  },
  zoomContainer: {
    position: 'absolute',
    right: 20,
    top: '40%',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 10,
  },
  zoomText: {
    color: 'white',
    fontSize: 14,
    marginBottom: 10,
  },
  zoomButton: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    padding: 5,
  },
  previewContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  previewImage: {
    width: SCREEN_WIDTH - 40,
    height: SCREEN_HEIGHT * 0.6,
    borderRadius: 10,
    marginBottom: 20,
  },
  previewButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  previewButton: {
    flex: 1,
    marginHorizontal: 10,
  },
  processingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  processingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
  },
});

export default CameraScreen;
