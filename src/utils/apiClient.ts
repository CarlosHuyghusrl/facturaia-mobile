/**
 * apiClient.ts - Cliente HTTP con interceptores
 * - Token automático en headers
 * - Manejo 401 (logout automático)
 * - Retry con exponential backoff
 * - Manejo de errores de red
 */

import { Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { getUserMessage, getNetworkErrorMessage } from './errorMessages';
import { API_BASE_URL } from '../config/api';

// Hosts permitidos para requests - previene redireccion a servidores externos
const ALLOWED_HOSTS = [
  '217.216.48.91', // legacy HTTP fallback
  'ocr.huyghusrl.com',
  'localhost',
  '127.0.0.1',
  'api.facturaia.com', // futuro HTTPS
];

/**
 * Valida que una URL absoluta apunte a un host permitido.
 */
const isAllowedUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return ALLOWED_HOSTS.some(host => parsed.hostname === host);
  } catch {
    return false;
  }
};

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

  let url: string;
  if (endpoint.startsWith('http')) {
    if (!isAllowedUrl(endpoint)) {
      throw new Error(`URL no permitida: ${endpoint}`);
    }
    url = endpoint;
  } else {
    url = `${API_BASE_URL}${endpoint}`;
  }

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
        // W21fix B-N2: añadir .status al error para que UI muestre código correcto.
        const err = new Error('Sesión expirada. Por favor inicie sesión nuevamente.') as any;
        err.status = 401;
        throw err;
      }

      // Manejar otros errores HTTP
      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        const errorMessage = getUserMessage(errorBody) || errorBody.error || errorBody.message || `Error ${response.status}`;

        // Si es error de servidor, puede ser retryable
        if (isRetryableError(new Error(), response.status) && attempt < MAX_RETRIES && !skipRetry) {
          attempt++;
          console.log(`[apiClient] Retry ${attempt}/${MAX_RETRIES} for ${endpoint}`);
          await delay(attempt);
          continue;
        }

        // W21fix B-N2: propagar status HTTP en el error para que consumers
        // (Wave 4 handleRevalidate, etc.) muestren el código real en vez de "sin código".
        const err = new Error(errorMessage) as any;
        err.status = response.status;
        err.errorCode = errorBody.error_code;
        err.userMessage = errorMessage;
        err.body = errorBody;
        throw err;
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

      // Enriquecer errores de red con mensaje amigable si no tienen uno ya
      if (!error.userMessage && !error.errorCode) {
        const friendlyMessage = getNetworkErrorMessage(error);
        error.userMessage = friendlyMessage;
        error.message = friendlyMessage;
      }

      if (showErrorAlert && error.message !== 'Sesión expirada. Por favor inicie sesión nuevamente.') {
        Alert.alert(
          'Error de conexión',
          error.userMessage || error.message || 'No se pudo conectar con el servidor. Verifique su conexión a internet.',
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
    let url: string;
    if (endpoint.startsWith('http')) {
      if (!isAllowedUrl(endpoint)) {
        throw new Error(`URL no permitida: ${endpoint}`);
      }
      url = endpoint;
    } else {
      url = `${API_BASE_URL}${endpoint}`;
    }

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

      // W17.4 — t2: HTTP response headers received (network round-trip + backend + Gemini done)
      const __w17_t2 = Date.now();
      const __W17_DIAG = __DEV__ || true;
      if (__W17_DIAG) console.log(`[W17.4] t2 (headers_received) = ${__w17_t2}`);
      // Expose t2 for facturasService to pick up
      (api as any).__lastUploadT2 = __w17_t2;

      if (response.status === 401) {
        if (onUnauthorized) {
          onUnauthorized();
        }
        // W21fix B-N2: añadir .status al error para que UI muestre código correcto.
        const err401 = new Error('Sesión expirada') as any;
        err401.status = 401;
        throw err401;
      }

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        const friendlyMessage = getUserMessage(errorBody) || errorBody.error || errorBody.message || `Error ${response.status}`;
        // W21fix B-N2: propagar status HTTP en el error para upload también.
        const err = new Error(friendlyMessage) as any;
        err.status = response.status;
        err.errorCode = errorBody.error_code;
        err.userMessage = friendlyMessage;
        err.body = errorBody;
        throw err;
      }

      const parsed = await response.json();

      // W17.4 — t3: response.json() fully parsed (struct deserialization done)
      const __w17_t3 = Date.now();
      if (__W17_DIAG) console.log(`[W17.4] t3 (json_parsed) = ${__w17_t3} | delta_t2_t3=${__w17_t3 - __w17_t2}ms`);
      (api as any).__lastUploadT3 = __w17_t3;

      return parsed;
    } catch (error: any) {
      console.error(`[apiClient] Upload error:`, error.message);
      // Enriquecer errores de red si no tienen mensaje amigable
      if (!error.userMessage) {
        error.userMessage = getNetworkErrorMessage(error);
      }
      if (showErrorAlert) {
        Alert.alert('Error', error.userMessage || error.message || 'Error al subir archivo');
      }
      throw error;
    }
  },
};

export default api;
