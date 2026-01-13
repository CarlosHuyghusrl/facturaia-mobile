# FacturaIA - Migración a Document Scanner

## Proyecto
App móvil React Native para escaneo de facturas con OCR.

## Stack
- **Frontend:** React Native + Expo
- **Scanner:** @dariyd/react-native-document-scanner (NUEVO)
- **OCR:** Backend Gemini Vision (ya funciona)
- **Build:** Gradle local → validar → EAS

## Tarea Actual: MIGRACIÓN COMPLETA

### FASE 1: Preparar Entorno Android SDK
1. [ ] Verificar Java 17: java -version
2. [ ] Instalar Android SDK cmdline-tools si no existe
3. [ ] Configurar ANDROID_HOME en ~/.bashrc
4. [ ] Aceptar licencias: sdkmanager --licenses
5. [ ] Instalar: sdkmanager "build-tools;34.0.0" "platforms;android-34"

### FASE 2: Migrar Código
1. [ ] npm uninstall react-native-vision-camera react-native-image-crop-picker
2. [ ] npm install @dariyd/react-native-document-scanner
3. [ ] Crear src/screens/CameraScreen.tsx usando DocumentScanner
4. [ ] Actualizar navegación en App.tsx

### FASE 3: Build Local (VALIDACIÓN)
1. [ ] npx expo prebuild --clean
2. [ ] cd android && ./gradlew clean
3. [ ] ./gradlew assembleDebug
4. [ ] Verificar APK en android/app/build/outputs/apk/debug/

### FASE 4: Solo si Fase 3 OK
1. [ ] git add . && git commit -m "feat: migrate to document-scanner"
2. [ ] git push
3. [ ] eas build --platform android --profile development

## Código CameraScreen con DocumentScanner

```typescript
import React, {useState} from 'react';
import {View, StyleSheet, Alert, ActivityIndicator, Image, Text} from 'react-native';
import {Button} from 'react-native-paper';
import DocumentScanner from '@dariyd/react-native-document-scanner';
import {processInvoice} from '../services/api';
import {supabase, getCurrentUser, uploadReceiptImage} from '../config/supabase';

const CameraScreen = ({navigation, route}) => {
  const {groupId} = route.params;
  const [scannedImages, setScannedImages] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleScanComplete = (images: string[]) => {
    setScannedImages(images);
  };

  const handleProcess = async () => {
    if (scannedImages.length === 0) return;
    
    setIsProcessing(true);
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('No autenticado');

      // Procesar cada imagen con backend Gemini
      for (const imagePath of scannedImages) {
        const result = await processInvoice(imagePath);
        if (result.success) {
          const imageUrl = await uploadReceiptImage(imagePath, user.id);
          await supabase.from('facturas').insert({
            user_id: user.id,
            group_id: groupId,
            vendor: result.data.vendor,
            date: result.data.date,
            total: result.data.total,
            image_url: imageUrl,
            items: result.data.items,
          });
        }
      }
      Alert.alert('Éxito', 'Facturas procesadas', [
        {text: 'OK', onPress: () => navigation.goBack()}
      ]);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (scannedImages.length > 0) {
    return (
      <View style={styles.container}>
        <Text>Páginas escaneadas: {scannedImages.length}</Text>
        {isProcessing ? (
          <ActivityIndicator size="large" />
        ) : (
          <View style={styles.buttons}>
            <Button onPress={() => setScannedImages([])}>Retomar</Button>
            <Button mode="contained" onPress={handleProcess}>Procesar</Button>
          </View>
        )}
      </View>
    );
  }

  return (
    <DocumentScanner
      onComplete={handleScanComplete}
      onCancel={() => navigation.goBack()}
      overlayColor="rgba(0,0,0,0.5)"
      enableMultiPage={true}
      maxPages={10}
    />
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  buttons: {flexDirection: 'row', gap: 20, marginTop: 20},
});

export default CameraScreen;
```

## Criterios de Éxito
- [ ] Android SDK instalado y funcional
- [ ] Build local genera APK sin errores
- [ ] DocumentScanner captura múltiples páginas
- [ ] Backend Gemini procesa correctamente
- [ ] EAS build exitoso (después de validación local)

## Conexiones
- Servidor: gestoria@217.216.48.91:2024
- Proyecto: ~/eas-builds/FacturaScannerApp
- Backend: https://invoice-ocr-service-production.up.railway.app
