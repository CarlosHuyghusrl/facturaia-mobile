/**
 * LoginScreen - Authentication screen
 *
 * Features:
 * - Email/password authentication with Supabase
 * - Sign up functionality
 * - Form validation
 * - Loading states
 * - Error handling
 */

import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import {
  TextInput,
  Button,
  Title,
  Paragraph,
  HelperText,
  Divider,
} from 'react-native-paper';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../types/invoice';
import {signInWithEmail, signUpWithEmail} from '../config/supabase';

type LoginScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Login'
>;

interface Props {
  navigation: LoginScreenNavigationProp;
}

const LoginScreen: React.FC<Props> = ({navigation}) => {
  // State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Validation
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // ==========================================
  // Validation Functions
  // ==========================================

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('Email is required');
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (password: string): boolean => {
    if (!password) {
      setPasswordError('Password is required');
      return false;
    }
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const validateConfirmPassword = (): boolean => {
    if (isSignUpMode && password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }
    return true;
  };

  // ==========================================
  // Authentication Handlers
  // ==========================================

  const handleSignIn = async () => {
    // Validate inputs
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    setIsLoading(true);

    try {
      const {user, session} = await signInWithEmail(email, password);

      if (user && session) {
        console.log('Sign in successful:', user.id);
        // Navigation will be handled by auth state listener in App.tsx
        // For now, navigate to InvoiceList with default group
        navigation.replace('InvoiceList', {groupId: 'default'});
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      Alert.alert(
        'Sign In Failed',
        error.message || 'Invalid email or password',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async () => {
    // Validate inputs
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    const isConfirmValid = validateConfirmPassword();

    if (!isEmailValid || !isPasswordValid || !isConfirmValid) {
      return;
    }

    setIsLoading(true);

    try {
      const {user, session} = await signUpWithEmail(email, password);

      if (user) {
        Alert.alert(
          'Sign Up Successful',
          'Please check your email to verify your account',
          [
            {
              text: 'OK',
              onPress: () => {
                setIsSignUpMode(false);
                setPassword('');
                setConfirmPassword('');
              },
            },
          ],
        );
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      Alert.alert(
        'Sign Up Failed',
        error.message || 'Could not create account',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = () => {
    if (isSignUpMode) {
      handleSignUp();
    } else {
      handleSignIn();
    }
  };

  const toggleMode = () => {
    setIsSignUpMode(!isSignUpMode);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setEmailError('');
    setPasswordError('');
  };

  // ==========================================
  // Render
  // ==========================================

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Title style={styles.title}>FacturaScanner</Title>
            <Paragraph style={styles.subtitle}>
              {isSignUpMode
                ? 'Create your account to get started'
                : 'Sign in to manage your invoices'}
            </Paragraph>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Email Input */}
            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              onBlur={() => validateEmail(email)}
              mode="outlined"
              autoCapitalize="none"
              keyboardType="email-address"
              textContentType="emailAddress"
              error={!!emailError}
              disabled={isLoading}
              style={styles.input}
            />
            <HelperText type="error" visible={!!emailError}>
              {emailError}
            </HelperText>

            {/* Password Input */}
            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              onBlur={() => validatePassword(password)}
              mode="outlined"
              secureTextEntry={!showPassword}
              textContentType="password"
              error={!!passwordError}
              disabled={isLoading}
              right={
                <TextInput.Icon
                  icon={showPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
              style={styles.input}
            />
            <HelperText type="error" visible={!!passwordError}>
              {passwordError}
            </HelperText>

            {/* Confirm Password (Sign Up only) */}
            {isSignUpMode && (
              <>
                <TextInput
                  label="Confirm Password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  mode="outlined"
                  secureTextEntry={!showPassword}
                  textContentType="password"
                  disabled={isLoading}
                  style={styles.input}
                />
              </>
            )}

            {/* Submit Button */}
            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={isLoading}
              disabled={isLoading}
              style={styles.submitButton}>
              {isSignUpMode ? 'Sign Up' : 'Sign In'}
            </Button>

            {/* Toggle Mode */}
            <Divider style={styles.divider} />

            <Button
              mode="text"
              onPress={toggleMode}
              disabled={isLoading}
              style={styles.toggleButton}>
              {isSignUpMode
                ? 'Already have an account? Sign In'
                : "Don't have an account? Sign Up"}
            </Button>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  input: {
    marginBottom: 8,
  },
  submitButton: {
    marginTop: 16,
    paddingVertical: 8,
  },
  divider: {
    marginVertical: 24,
  },
  toggleButton: {
    marginTop: 8,
  },
});

export default LoginScreen;
