/**
 * App.tsx - Main application entry point
 *
 * Features:
 * - React Navigation stack navigator
 * - Authentication state management
 * - React Native Paper theme provider
 * - Auto-redirect based on auth state
 */

import React, {useState, useEffect} from 'react';
import {StatusBar, LogBox} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {Provider as PaperProvider, DefaultTheme} from 'react-native-paper';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import CameraScreen from './src/screens/CameraScreen';
import InvoiceListScreen from './src/screens/InvoiceListScreen';

// Types & Config
import {RootStackParamList} from './src/types/invoice';
import {supabase, isAuthenticated} from './src/config/supabase';

// Ignore specific warnings
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

// Create Stack Navigator
const Stack = createStackNavigator<RootStackParamList>();

// Custom theme
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#1976d2',
    accent: '#ff9800',
  },
};

function App(): React.JSX.Element {
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);

  // ==========================================
  // Auth State Management
  // ==========================================

  useEffect(() => {
    // Check initial auth state
    checkAuthState();

    // Listen for auth changes
    const {
      data: {subscription},
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', _event, session?.user?.id);
      setIsUserAuthenticated(session !== null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkAuthState = async () => {
    try {
      const authenticated = await isAuthenticated();
      setIsUserAuthenticated(authenticated);
    } catch (error) {
      console.error('Error checking auth state:', error);
      setIsUserAuthenticated(false);
    } finally {
      setIsAuthChecking(false);
    }
  };

  // ==========================================
  // Render
  // ==========================================

  if (isAuthChecking) {
    // You can show a splash screen here
    return null;
  }

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <PaperProvider theme={theme}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName={isUserAuthenticated ? 'InvoiceList' : 'Login'}
            screenOptions={{
              headerStyle: {
                backgroundColor: theme.colors.primary,
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}>
            {/* Login Screen */}
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{
                headerShown: false,
              }}
            />

            {/* Invoice List Screen */}
            <Stack.Screen
              name="InvoiceList"
              component={InvoiceListScreen}
              options={{
                title: 'My Invoices',
                headerLeft: () => null, // Prevent going back to login
              }}
              initialParams={{groupId: 'default'}}
            />

            {/* Camera Screen */}
            <Stack.Screen
              name="Camera"
              component={CameraScreen}
              options={{
                title: 'Scan Invoice',
                headerStyle: {
                  backgroundColor: '#000',
                },
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}

export default App;
