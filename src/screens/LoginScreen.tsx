/**
 * LoginScreen - Login con RNC + PIN
 * Sin selector de empresa
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  ActivityIndicator,
  Surface,
  HelperText,
} from 'react-native-paper';
import { useAuth } from '../hooks/useAuth';
import Logo from '../components/Logo';

const LoginScreen: React.FC = () => {
  const { login, isLoading } = useAuth();

  const [rnc, setRnc] = useState('');
  const [pin, setPin] = useState('');
  const [errors, setErrors] = useState<{ rnc?: string; pin?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!rnc) {
      newErrors.rnc = 'Ingrese su RNC o Cédula';
    } else if (!/^\d{9,11}$/.test(rnc.replace(/-/g, ''))) {
      newErrors.rnc = 'RNC debe tener 9 u 11 dígitos';
    }

    if (!pin) {
      newErrors.pin = 'Ingrese su PIN';
    } else if (!/^\d{4,6}$/.test(pin)) {
      newErrors.pin = 'PIN debe tener 4-6 dígitos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    setErrors({});

    try {
      const result = await login({
        rnc: rnc.replace(/-/g, ''),
        pin: pin,
      });

      if (!result.success) {
        Alert.alert('Error', result.error || 'Error de autenticación');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error de conexión');
    } finally {
      setSubmitting(false);
    }
  };

  const formatRNC = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 9) {
      return numbers;
    }
    // Formato cédula: 000-0000000-0
    return numbers.slice(0, 3) + '-' + numbers.slice(3, 10) + '-' + numbers.slice(10, 11);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header con Logo */}
        <View style={styles.logoContainer}>
          <Logo size={100} showBackground={true} />
          <Text style={styles.title}>Factura<Text style={styles.titleAccent}>IA</Text></Text>
          <Text style={styles.subtitle}>Gestor de Facturas Inteligente</Text>
        </View>

        <Surface style={styles.card}>
          <View style={styles.inputContainer}>
            <TextInput
              label="RNC / Cédula"
              value={rnc}
              onChangeText={(text) => {
                setRnc(formatRNC(text));
                setErrors(prev => ({ ...prev, rnc: undefined }));
              }}
              keyboardType="numeric"
              maxLength={13}
              mode="outlined"
              error={!!errors.rnc}
              left={<TextInput.Icon icon="card-account-details" />}
              outlineColor="#64748b"
              activeOutlineColor="#22D3EE"
              textColor="#FFFFFF"
              style={styles.input}
              theme={{ colors: { onSurfaceVariant: '#94a3b8' } }}
            />
            {errors.rnc && (
              <HelperText type="error" visible>{errors.rnc}</HelperText>
            )}
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              label="PIN"
              value={pin}
              onChangeText={(text) => {
                setPin(text.replace(/\D/g, '').slice(0, 6));
                setErrors(prev => ({ ...prev, pin: undefined }));
              }}
              keyboardType="numeric"
              secureTextEntry
              maxLength={6}
              mode="outlined"
              error={!!errors.pin}
              left={<TextInput.Icon icon="lock" />}
              outlineColor="#64748b"
              activeOutlineColor="#22D3EE"
              textColor="#FFFFFF"
              style={styles.input}
              theme={{ colors: { onSurfaceVariant: '#94a3b8' } }}
            />
            {errors.pin && (
              <HelperText type="error" visible>{errors.pin}</HelperText>
            )}
          </View>

          <Button
            mode="contained"
            onPress={handleLogin}
            disabled={submitting || isLoading}
            style={styles.button}
            contentStyle={styles.buttonContent}
            buttonColor="#22D3EE"
            textColor="#0f172a"
            labelStyle={styles.buttonLabel}
          >
            {submitting ? (
              <ActivityIndicator color="#0f172a" size="small" />
            ) : (
              'Iniciar Sesión'
            )}
          </Button>

          <Text style={styles.infoText}>
            Ingrese los datos proporcionados por su gestoría
          </Text>
        </Surface>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 16,
  },
  titleAccent: {
    color: '#22D3EE',
  },
  subtitle: {
    fontSize: 14,
    color: '#CBD5E1',
    textAlign: 'center',
    marginTop: 4,
  },
  card: {
    padding: 24,
    borderRadius: 16,
    elevation: 4,
    backgroundColor: '#1e293b',
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#1e293b',
  },
  button: {
    marginTop: 24,
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoText: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 16,
  },
});

export default LoginScreen;
