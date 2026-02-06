/**
 * apiClient.ts - Cliente HTTP con interceptores
 * - Token automático en headers
 * - Manejo 401 (logout automático)
 * - Retry con exponential backoff
 * - Manejo de errores de red
 */

import { Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = 'http://217.216.48.91:8081';
const TOKEN_KEY = 'auth_token';

// Configuración de retry
const MAX_RETRIES = 3;
const INITIAL_DELAY = 1000; // 1 segundo

// Tipo para las opciones de request
interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
  skipRetry?: boolean;
  showErrorAlert?: boolean;
}

// Tipo para respuesta de error
interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

// Callback para logout (se configura desde useAuth)
let onUnauthorized: (() => void) | null = null;

export const setOnUnauthorized = (callback: () => void) => {
  onUnauthorized = callback;
};

/**
 * Delay con exponential backoff
 */
const delay = (attempt: number): Promise<void> => {
  const ms = INITIAL_DELAY * Math.pow(2, attempt);
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Obtiene el token del storage
 */
const getToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    return null;
  }
};

/**
 * Verifica si el error es recuperable (retry)
 */
const isRetryableError = (error: any, status?: number): boolean => {
  // Errores de red
  if (error.message?.includes('Network') || error.message?.includes('fetch')) {
    return true;
  }
  // Errores de servidor (5xx)
  if (status && status >= 500 && status < 600) {
    return true;
  }
  // Timeout
  if (error.name === 'AbortError') {
    return true;
  }
  return false;
};

/**
 * Cliente HTTP principal con retry y manejo de errores
 */
export const apiClient = async <T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> => {
  const {
    skipAuth = false,
    skipRetry = false,
    showErrorAlert = true,
    ...fetchOptions
  } = options;

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  // Preparar headers
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers || {}),
  };

  // Agregar token si no se salta auth
  if (!skipAuth) {
    const token = await getToken();
    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }
  }

  let lastError: Error | null = null;
  let attempt = 0;

  while (attempt <= (skipRetry ? 0 : MAX_RETRIES)) {
    try {
      // Timeout de 30 segundos
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(url, {
        ...fetchOptions,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Manejar 401 - No autorizado
      if (response.status === 401) {
        console.log('[apiClient] 401 Unauthorized - triggering logout');
        if (onUnauthorized) {
          onUnauthorized();
        }
        throw new Error('Sesión expirada. Por favor inicie sesión nuevamente.');
      }

      // Manejar otros errores HTTP
      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        const errorMessage = errorBody.error || errorBody.message || `Error ${response.status}`;

        // Si es error de servidor, puede ser retryable
        if (isRetryableError(new Error(), response.status) && attempt < MAX_RETRIES && !skipRetry) {
          attempt++;
          console.log(`[apiClient] Retry ${attempt}/${MAX_RETRIES} for ${endpoint}`);
          await delay(attempt);
          continue;
        }

        throw new Error(errorMessage);
      }

      // Parsear respuesta
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        return await response.json();
      }
      return await response.text() as unknown as T;

    } catch (error: any) {
      lastError = error;

      // Si es retryable y no hemos agotado intentos
      if (isRetryableError(error) && attempt < MAX_RETRIES && !skipRetry) {
        attempt++;
        console.log(`[apiClient] Retry ${attempt}/${MAX_RETRIES} for ${endpoint}: ${error.message}`);
        await delay(attempt);
        continue;
      }

      // Error final
      console.error(`[apiClient] Error en ${endpoint}:`, error.message);

      if (showErrorAlert && error.message !== 'Sesión expirada. Por favor inicie sesión nuevamente.') {
        Alert.alert(
          'Error de conexión',
          error.message || 'No se pudo conectar con el servidor. Verifique su conexión a internet.',
          [{ text: 'OK' }]
        );
      }

      throw error;
    }
  }

  throw lastError || new Error('Error desconocido');
};

/**
 * Métodos de conveniencia
 */
export const api = {
  get: <T = any>(endpoint: string, options?: RequestOptions) =>
    apiClient<T>(endpoint, { ...options, method: 'GET' }),

  post: <T = any>(endpoint: string, data?: any, options?: RequestOptions) =>
    apiClient<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T = any>(endpoint: string, data?: any, options?: RequestOptions) =>
    apiClient<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T = any>(endpoint: string, options?: RequestOptions) =>
    apiClient<T>(endpoint, { ...options, method: 'DELETE' }),

  /**
   * Upload de archivo (multipart/form-data)
   */
  upload: async <T = any>(endpoint: string, formData: FormData, options?: RequestOptions): Promise<T> => {
    const { skipAuth = false, showErrorAlert = true } = options || {};
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

    const headers: HeadersInit = {};

    if (!skipAuth) {
      const token = await getToken();
      if (token) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
      }
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (response.status === 401) {
        if (onUnauthorized) {
          onUnauthorized();
        }
        throw new Error('Sesión expirada');
      }

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.error || errorBody.message || `Error ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error(`[apiClient] Upload error:`, error.message);
      if (showErrorAlert) {
        Alert.alert('Error', error.message || 'Error al subir archivo');
      }
      throw error;
    }
  },
};

export default api;
