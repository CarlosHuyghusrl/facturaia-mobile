/**
 * App.tsx - Main application entry point
 * Sistema Multi-Tenant con AuthProvider
 */

import React from "react";
import {StatusBar, LogBox, View, Text, ActivityIndicator, StyleSheet} from "react-native";
import {NavigationContainer} from "@react-navigation/native";
import {createStackNavigator} from "@react-navigation/stack";
import {Provider as PaperProvider, DefaultTheme} from "react-native-paper";
import {GestureHandlerRootView} from "react-native-gesture-handler";

// Auth Provider
import {AuthProvider, useAuth} from "./src/hooks/useAuth";

// Screens
import LoginScreen from "./src/screens/LoginScreen";
import HomeScreen from "./src/screens/HomeScreen";
import CameraScreen from "./src/screens/CameraScreen";
import InvoiceDetailScreen from "./src/screens/InvoiceDetailScreen";

LogBox.ignoreLogs([
  "Non-serializable values were found in the navigation state",
]);

// Navigation types
export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Camera: undefined;
  InvoiceDetail: { facturaId: string };
};

const Stack = createStackNavigator<RootStackParamList>();

// Tema con colores FacturaIA (cyan)
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#22D3EE",    // cyan-400
    accent: "#3B82F6",     // blue-500
    background: "#0f172a", // slate-900
    surface: "#1e293b",    // slate-800
  },
};

// Splash Screen Component
const SplashScreen = () => (
  <View style={styles.splash}>
    <Text style={styles.splashTitle}>Factura<Text style={styles.splashAccent}>IA</Text></Text>
    <ActivityIndicator size="large" color="#22D3EE" style={{marginTop: 20}} />
    <Text style={styles.splashText}>Cargando...</Text>
  </View>
);

// Navigator con lógica de auth
const AppNavigator = () => {
  const {isLoading, isAuthenticated} = useAuth();

  // Mostrar splash mientras verifica auth
  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {backgroundColor: "#0f172a"},
          headerTintColor: "#fff",
          headerTitleStyle: {fontWeight: "bold"},
        }}>
        {!isAuthenticated ? (
          // Stack de autenticación
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{headerShown: false}}
          />
        ) : (
          // Stack autenticado
          <>
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{
                title: "FacturaIA",
                headerLeft: () => null,
              }}
            />
            <Stack.Screen
              name="Camera"
              component={CameraScreen}
              options={{
                title: "Escanear Factura",
                headerStyle: {backgroundColor: "#000"},
              }}
            />
            <Stack.Screen
              name="InvoiceDetail"
              component={InvoiceDetailScreen}
              options={{
                title: "Detalle Factura",
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

function App(): React.JSX.Element {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <AuthProvider>
        <PaperProvider theme={theme}>
          <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
          <AppNavigator />
        </PaperProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0f172a",
  },
  splashTitle: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#fff",
  },
  splashAccent: {
    color: "#22D3EE",
  },
  splashText: {
    marginTop: 10,
    fontSize: 16,
    color: "#94a3b8",
  },
});

export default App;
