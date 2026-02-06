/**
 * useAuth Hook - Context de autenticación
 * Para backend puerto 3080
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  Cliente,
  LoginParams,
  login as authLogin,
  logout as authLogout,
  getCliente,
  verificarSesion,
  isAuthenticated as checkAuth,
} from '../services/authService';
import { setOnUnauthorized } from '../utils/apiClient';

interface ClienteStats {
  facturasPendientes: number;
  facturasProcesadas: number;
}

interface AuthState {
  cliente: Cliente | null;
  stats: ClienteStats | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (params: LoginParams) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    cliente: null,
    stats: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Verificar sesión al iniciar
  const checkSession = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));

      const isAuth = await checkAuth();
      if (!isAuth) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          isAuthenticated: false,
          cliente: null,
          stats: null,
        }));
        return;
      }

      // Verificar token con backend
      const result = await verificarSesion();

      if (result) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          isAuthenticated: true,
          cliente: result.cliente,
          stats: result.stats,
        }));
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          isAuthenticated: false,
          cliente: null,
          stats: null,
        }));
      }
    } catch (error) {
      console.error('[useAuth] Error verificando sesión:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        isAuthenticated: false,
        cliente: null,
        stats: null,
      }));
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    try {
      await authLogout();
      setState(prev => ({
        ...prev,
        isAuthenticated: false,
        cliente: null,
        stats: null,
      }));
    } catch (error) {
      console.error('[useAuth] Error en logout:', error);
    }
  }, []);

  // Configurar callback para logout automático en 401
  useEffect(() => {
    setOnUnauthorized(() => {
      console.log('[useAuth] 401 received - auto logout');
      logout();
    });
  }, [logout]);

  // Inicializar al montar
  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // Login
  const login = useCallback(async (params: LoginParams) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));

      const result = await authLogin(params);

      if (result.success && result.cliente) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          isAuthenticated: true,
          cliente: result.cliente!,
        }));
        return { success: true };
      }

      setState(prev => ({ ...prev, isLoading: false }));
      return { success: false, error: result.error };
    } catch (error: any) {
      setState(prev => ({ ...prev, isLoading: false }));
      return { success: false, error: error.message };
    }
  }, []);

  // Refrescar sesión
  const refreshSession = useCallback(async () => {
    await checkSession();
  }, [checkSession]);

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    refreshSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};

export default useAuth;
