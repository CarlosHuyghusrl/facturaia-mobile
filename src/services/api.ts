/**
 * API Service - Connection to Railway OCR Service
 *
 * This service handles communication with the Invoice OCR microservice
 * deployed on Railway (invoice-ocr-service).
 *
 * Setup Instructions:
 * 1. Deploy invoice-ocr-service to Railway
 * 2. Get the Railway service URL from the dashboard
 * 3. Add to .env file:
 *    RAILWAY_OCR_URL=https://your-service.railway.app
 */

import axios, {AxiosInstance, AxiosError} from 'axios';
import {ProcessInvoiceResponse, OCRError} from '../types/invoice';

// Environment configuration
// Backend desplegado en servidor Contabo (Coolify)
const RAILWAY_OCR_URL =
  process.env.RAILWAY_OCR_URL ||
  'http://217.216.48.91:8081';

// Validate configuration
if (RAILWAY_OCR_URL === 'https://your-invoice-ocr-service.railway.app') {
  console.warn(
    '⚠️  RAILWAY_OCR_URL not configured. Please set it in your .env file.',
  );
}

// Create axios instance with default configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: RAILWAY_OCR_URL,
  timeout: 60000, // 60 seconds for OCR processing
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

// Request interceptor for logging
apiClient.interceptors.request.use(
  config => {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  error => {
    console.error('[API] Request error:', error);
    return Promise.reject(error);
  },
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  response => {
    console.log(`[API] Response ${response.status}:`, response.data);
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      console.error(
        `[API] Error ${error.response.status}:`,
        error.response.data,
      );
    } else if (error.request) {
      console.error('[API] No response received:', error.request);
    } else {
      console.error('[API] Error:', error.message);
    }
    return Promise.reject(error);
  },
);

// ==========================================
// API Service Functions
// ==========================================

/**
 * Process invoice image with OCR and AI extraction
 *
 * @param imageUri - Local file URI of the captured image
 * @param options - Optional processing parameters
 * @returns Extracted invoice data
 */
export const processInvoice = async (
  imageUri: string,
  options?: {
    aiProvider?: 'gemini' | 'openai' | 'ollama';
    useVisionModel?: boolean;
    language?: string;
    model?: string;
  },
): Promise<ProcessInvoiceResponse> => {
  try {
    // Create FormData for multipart upload
    const formData = new FormData();

    // Add image file
    formData.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: `invoice_${Date.now()}.jpg`,
    } as any);

    // Add optional parameters
    if (options?.aiProvider) {
      formData.append('aiProvider', options.aiProvider);
    }

    if (options?.useVisionModel !== undefined) {
      formData.append('useVisionModel', options.useVisionModel.toString());
    }

    if (options?.language) {
      formData.append('language', options.language);
    }

    if (options?.model) {
      formData.append('model', options.model);
    }

    // Send request to Railway service
    const response = await apiClient.post<ProcessInvoiceResponse>(
      '/api/process-invoice',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );

    // Check if processing was successful
    if (!response.data.success) {
      throw new OCRError(
        response.data.error || 'OCR processing failed',
        response.data,
      );
    }

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        throw new OCRError('Request timeout - image processing took too long');
      }

      if (error.response) {
        throw new OCRError(
          `Server error: ${error.response.status}`,
          error.response.data,
        );
      }

      if (error.request) {
        throw new OCRError(
          'Network error - could not reach OCR service. Check your internet connection.',
        );
      }
    }

    throw new OCRError('Unexpected error during OCR processing', error);
  }
};

/**
 * Check health status of Railway OCR service
 *
 * @returns Health status information
 */
export const checkServiceHealth = async (): Promise<{
  status: string;
  version: string;
  uptime: string;
  memory: {
    allocated: string;
    total: string;
    system: string;
  };
  tesseract: {
    available: boolean;
    version?: string;
  };
  imageMagick: {
    available: boolean;
    version?: string;
  };
}> => {
  try {
    const response = await apiClient.get('/health', {
      timeout: 5000, // 5 seconds for health check
    });

    return response.data;
  } catch (error) {
    console.error('Health check failed:', error);
    throw new OCRError('Failed to check service health', error);
  }
};

/**
 * Test connection to Railway OCR service
 *
 * @returns true if service is reachable and healthy
 */
export const testConnection = async (): Promise<boolean> => {
  try {
    const health = await checkServiceHealth();
    return health.status === 'healthy';
  } catch (error) {
    console.error('Connection test failed:', error);
    return false;
  }
};

/**
 * Batch process multiple invoices
 *
 * @param imageUris - Array of local file URIs
 * @param options - Optional processing parameters
 * @returns Array of extraction results
 */
export const batchProcessInvoices = async (
  imageUris: string[],
  options?: {
    aiProvider?: 'gemini' | 'openai' | 'ollama';
    useVisionModel?: boolean;
    language?: string;
    concurrency?: number;
  },
): Promise<ProcessInvoiceResponse[]> => {
  const concurrency = options?.concurrency || 3; // Process 3 at a time
  const results: ProcessInvoiceResponse[] = [];

  // Process in batches
  for (let i = 0; i < imageUris.length; i += concurrency) {
    const batch = imageUris.slice(i, i + concurrency);

    const batchResults = await Promise.allSettled(
      batch.map(uri => processInvoice(uri, options)),
    );

    batchResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        console.error(
          `Failed to process image ${i + index}:`,
          result.reason,
        );
        results.push({
          success: false,
          error: result.reason.message || 'Processing failed',
        });
      }
    });
  }

  return results;
};

/**
 * Retry a failed OCR request
 *
 * @param imageUri - Local file URI of the image
 * @param maxRetries - Maximum number of retry attempts
 * @param options - Processing options
 * @returns Extraction result
 */
export const retryProcessInvoice = async (
  imageUri: string,
  maxRetries: number = 3,
  options?: {
    aiProvider?: 'gemini' | 'openai' | 'ollama';
    useVisionModel?: boolean;
    language?: string;
  },
): Promise<ProcessInvoiceResponse> => {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[API] Attempt ${attempt}/${maxRetries}`);
      return await processInvoice(imageUri, options);
    } catch (error) {
      lastError = error as Error;
      console.error(`[API] Attempt ${attempt} failed:`, error);

      // Wait before retrying (exponential backoff)
      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        console.log(`[API] Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw new OCRError(
    `Failed after ${maxRetries} attempts: ${lastError?.message}`,
    lastError,
  );
};

// ==========================================
// Configuration & Utilities
// ==========================================

/**
 * Get current API configuration
 */
export const getAPIConfig = () => {
  return {
    baseURL: RAILWAY_OCR_URL,
    timeout: apiClient.defaults.timeout,
    isConfigured: RAILWAY_OCR_URL !== 'https://your-invoice-ocr-service.railway.app',
  };
};

/**
 * Update API base URL (useful for switching environments)
 */
export const updateBaseURL = (newURL: string) => {
  apiClient.defaults.baseURL = newURL;
  console.log(`[API] Base URL updated to: ${newURL}`);
};

/**
 * Set API timeout
 */
export const setTimeout = (timeoutMs: number) => {
  apiClient.defaults.timeout = timeoutMs;
  console.log(`[API] Timeout set to: ${timeoutMs}ms`);
};

// Export axios instance for advanced usage
export {apiClient};

// Export default service object
export default {
  processInvoice,
  checkServiceHealth,
  testConnection,
  batchProcessInvoices,
  retryProcessInvoice,
  getAPIConfig,
  updateBaseURL,
  setTimeout,
};
