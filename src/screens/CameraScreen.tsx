/**
 * CameraScreen - Document Scanner + Gemini Vision OCR
 */

import React, {useState, useEffect} from "react";
import {
  View,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Text,
  ScrollView,
  Image,
  Dimensions,
} from "react-native";
import {Button} from "react-native-paper";
import {StackNavigationProp} from "@react-navigation/stack";
import {RouteProp} from "@react-navigation/native";
import DocumentScanner from "react-native-document-scanner-plugin";
import {RootStackParamList} from "../types/invoice";
import {processInvoice} from "../services/api";
import {supabase, getCurrentUser, uploadReceiptImage} from "../config/supabase";

const {width: SCREEN_WIDTH} = Dimensions.get("window");

type CameraScreenNavigationProp = StackNavigationProp<RootStackParamList, "Camera">;
type CameraScreenRouteProp = RouteProp<RootStackParamList, "Camera">;

interface Props {
  navigation: CameraScreenNavigationProp;
  route: CameraScreenRouteProp;
}

const CameraScreen: React.FC<Props> = ({navigation, route}) => {
  const {groupId} = route.params;
  
  const [scannedImages, setScannedImages] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState("");

  const startScanner = async () => {
    try {
      const result = await DocumentScanner.scanDocument({
        croppedImageQuality: 100,
        maxNumDocuments: 10,
        responseType: "imageFilePath",
      });

      if (result.scannedImages && result.scannedImages.length > 0) {
        setScannedImages(result.scannedImages);
      }
    } catch (error: any) {
      if (error.message !== "User canceled") {
        Alert.alert("Error", "No se pudo escanear el documento");
      }
    }
  };

  const handleProcessInvoices = async () => {
    if (scannedImages.length === 0) return;

    setIsProcessing(true);
    let successCount = 0;

    try {
      const user = await getCurrentUser();
      if (!user) {
        Alert.alert("Error", "Debe iniciar sesión");
        return;
      }

      for (let i = 0; i < scannedImages.length; i++) {
        const imagePath = scannedImages[i];
        setProcessingStatus("Procesando página " + (i + 1) + " de " + scannedImages.length + "...");

        try {
          const result = await processInvoice(imagePath);

          if (result.success && result.data) {
            setProcessingStatus("Guardando factura " + (i + 1) + "...");
            const imageUrl = await uploadReceiptImage(imagePath, user.id);

            const {error} = await supabase.from("facturas").insert({
              user_id: user.id,
              group_id: groupId,
              vendor: result.data.vendor || "Desconocido",
              date: result.data.date || new Date().toISOString().split("T")[0],
              total: result.data.total || 0,
              subtotal: result.data.subtotal || 0,
              tax: result.data.tax || 0,
              ncf: result.data.ncf || null,
              rnc: result.data.rnc || null,
              image_url: imageUrl,
              items: result.data.items || [],
              raw_text: result.data.raw_text || "",
            });

            if (!error) successCount++;
          }
        } catch (pageError) {
          console.error("Error página " + (i + 1), pageError);
        }
      }

      if (successCount > 0) {
        Alert.alert(
          "Éxito",
          successCount + " de " + scannedImages.length + " facturas procesadas",
          [{text: "OK", onPress: () => navigation.goBack()}]
        );
      } else {
        Alert.alert("Error", "No se pudo procesar ninguna factura");
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Error al procesar");
    } finally {
      setIsProcessing(false);
      setProcessingStatus("");
    }
  };

  const resetScanner = () => {
    setScannedImages([]);
    startScanner();
  };

  useEffect(() => {
    startScanner();
  }, []);

  if (scannedImages.length > 0) {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.previewContainer}>
          <Text style={styles.title}>
            {scannedImages.length} página(s) escaneada(s)
          </Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={true} style={styles.imageScroll}>
            {scannedImages.map((uri, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image source={{uri}} style={styles.previewImage} resizeMode="contain" />
                <Text style={styles.pageNumber}>Página {index + 1}</Text>
              </View>
            ))}
          </ScrollView>

          {isProcessing ? (
            <View style={styles.processingContainer}>
              <ActivityIndicator size="large" color="#2196F3" />
              <Text style={styles.processingText}>{processingStatus}</Text>
            </View>
          ) : (
            <View style={styles.buttonContainer}>
              <Button mode="outlined" onPress={resetScanner} style={styles.button} icon="camera-retake">
                Escanear de nuevo
              </Button>
              <Button mode="contained" onPress={handleProcessInvoices} style={styles.button} icon="check">
                Procesar
              </Button>
            </View>
          )}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#2196F3" />
      <Text style={styles.loadingText}>Abriendo escáner...</Text>
      <Button mode="outlined" onPress={() => navigation.goBack()} style={{marginTop: 20}}>
        Cancelar
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: "#f5f5f5"},
  loadingContainer: {flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff"},
  loadingText: {marginTop: 15, fontSize: 16, color: "#666"},
  previewContainer: {flexGrow: 1, padding: 20, alignItems: "center"},
  title: {fontSize: 20, fontWeight: "bold", marginBottom: 20, color: "#333"},
  imageScroll: {maxHeight: 350, marginBottom: 20},
  imageWrapper: {marginRight: 15, alignItems: "center"},
  previewImage: {width: SCREEN_WIDTH * 0.7, height: 300, borderRadius: 10, backgroundColor: "#fff"},
  pageNumber: {marginTop: 8, fontSize: 14, color: "#666"},
  processingContainer: {alignItems: "center", padding: 20},
  processingText: {marginTop: 15, fontSize: 16, color: "#666"},
  buttonContainer: {flexDirection: "row", justifyContent: "space-around", width: "100%", marginTop: 20},
  button: {flex: 1, marginHorizontal: 10},
});

export default CameraScreen;
