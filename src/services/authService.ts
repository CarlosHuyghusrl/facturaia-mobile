/**
 * authService.ts - Autenticación de clientes
 * Backend: Usa API_BASE_URL de config/api.ts
 */

import * as SecureStore from 'expo-secure-store';
import { api } from '../utils/apiClient';

const TOKEN_KEY = 'auth_token';
const CLIENTE_KEY = 'cliente_data';

// Tipos
export interface Cliente {
  id: string;
  nombre: string;
  rnc: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  ultimoAcceso?: string;
}

export interface LoginParams {
  rnc: string;
  pin: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  cliente?: Cliente;
  error?: string;
}

export interface ClienteStats {
  facturasPendientes: number;
  facturasProcesadas: number;
}

/**
 * Login con RNC y PIN
 */
export const login = async (params: LoginParams): Promise<AuthResponse> => {
  try {
    const data = await api.post('/api/clientes/login/', {
      rnc: params.rnc.replace(/-/g, ''),
      pin: params.pin,
    }, { skipAuth: true, showErrorAlert: false });

    if (!data.success) {
      return {
        success: false,
        error: data.error || data.message || 'Error de autenticación',
      };
    }

    // Guardar token y datos del cliente
    if (data.token) {
      await SecureStore.setItemAsync(TOKEN_KEY, data.token);
    }
    if (data.cliente) {
      await SecureStore.setItemAsync(CLIENTE_KEY, JSON.stringify(data.cliente));
    }

    return {
      success: true,
      token: data.token,
      cliente: data.cliente,
    };
  } catch (error: any) {
    console.error('[authService] Login error:', error);
    return {
      success: false,
      error: error.message || 'Error de conexión',
    };
  }
};

/**
 * Logout - limpia tokens
 */
export const logout = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(CLIENTE_KEY);
  } catch (error) {
    console.error('[authService] Logout error:', error);
  }
};

/**
 * Obtener token guardado
 */
export const getToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    return null;
  }
};

/**
 * Obtener cliente guardado localmente
 */
export const getCliente = async (): Promise<Cliente | null> => {
  try {
    const data = await SecureStore.getItemAsync(CLIENTE_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

/**
 * Verificar sesión con el servidor
 */
export const verificarSesion = async (): Promise<{ cliente: Cliente; stats: ClienteStats } | null> => {
  try {
    const token = await getToken();
    if (!token) return null;

    const data = await api.get('/api/clientes/me/', { showErrorAlert: false });

    if (data.success && data.cliente) {
      // Actualizar datos locales
      await SecureStore.setItemAsync(CLIENTE_KEY, JSON.stringify(data.cliente));
      return {
        cliente: data.cliente,
        stats: data.stats || { facturasPendientes: 0, facturasProcesadas: 0 },
      };
    }

    return null;
  } catch (error) {
    console.error('[authService] Verificar sesión error:', error);
    return null;
  }
};

/**
 * Verificar si hay sesión activa
 */
export const isAuthenticated = async (): Promise<boolean> => {
  const token = await getToken();
  return token !== null;
};

export default {
  login,
  logout,
  getToken,
  getCliente,
  verificarSesion,
  isAuthenticated,
};
