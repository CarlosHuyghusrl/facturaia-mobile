/**
 * API Service - Connection to Backend OCR Service
 */

import axios, {AxiosInstance, AxiosError} from 'axios';
import {ProcessInvoiceResponse, OCRError} from '../types/invoice';

// Backend en Contabo
const RAILWAY_OCR_URL = 'http://217.216.48.91:8081';

// Token JWT hardcodeado (expira 2027-01-12)
const HARDCODED_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNTQzMWUzYWItZmM4Yi00ZTYwLTk2NWItNWIxYWViMjhmOThmIiwiZW1haWwiOiJhc2llckBnZXN0b3JpYS5jb20iLCJlbXByZXNhX2FsaWFzIjoiaHV5Z2h1IiwiZW1wcmVzYV9ub21icmUiOiJIdXlnaHUgJiBBc29jLiBTUkwiLCJyb2wiOiJhZG1pbiIsImlzcyI6ImZhY3R1cmFpYSIsImV4cCI6MTc5OTc2Mjg0N30.RSPhekibZVsHwGuo2ms5aLin8vhiXVNhVqrCjy6Jf-Q';

const apiClient: AxiosInstance = axios.create({
  baseURL: RAILWAY_OCR_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

// Interceptor - añade JWT a todas las requests
apiClient.interceptors.request.use(
  config => {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    if (config.url !== '/health') {
      config.headers.Authorization = `Bearer ${HARDCODED_JWT}`;
    }
    return config;
  },
  error => {
    console.error('[API] Request error:', error);
    return Promise.reject(error);
  },
);

apiClient.interceptors.response.use(
  response => {
    console.log(`[API] Response ${response.status}`);
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      console.error(`[API] Error ${error.response.status}:`, error.response.data);
    }
    return Promise.reject(error);
  },
);

export const processInvoice = async (
  imageUri: string,
  options?: {
    aiProvider?: 'gemini' | 'openai' | 'ollama';
    useVisionModel?: boolean;
    language?: string;
  },
): Promise<ProcessInvoiceResponse> => {
  try {
    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: `invoice_${Date.now()}.jpg`,
    } as any);

    if (options?.aiProvider) {
      formData.append('aiProvider', options.aiProvider);
    }
    if (options?.useVisionModel !== undefined) {
      formData.append('useVisionModel', options.useVisionModel.toString());
    }
    if (options?.language) {
      formData.append('language', options.language);
    }

    const response = await apiClient.post<ProcessInvoiceResponse>(
      '/api/process-invoice',
      formData,
    );

    if (!response.data.success) {
      throw new OCRError(response.data.error || 'OCR processing failed');
    }

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new OCRError(`Server error: ${error.response.status}`, error.response.data);
      }
      throw new OCRError('Network error - could not reach OCR service');
    }
    throw new OCRError('Unexpected error', error);
  }
};

export const checkServiceHealth = async () => {
  const response = await apiClient.get('/health', { timeout: 5000 });
  return response.data;
};

export const testConnection = async (): Promise<boolean> => {
  try {
    const health = await checkServiceHealth();
    return health.status === 'healthy';
  } catch {
    return false;
  }
};

export const getAPIConfig = () => ({
  baseURL: RAILWAY_OCR_URL,
  timeout: apiClient.defaults.timeout,
  isConfigured: true,
});

export {apiClient};

export default {
  processInvoice,
  checkServiceHealth,
  testConnection,
  getAPIConfig,
};
