/**
 * Mapeo de error codes del backend a mensajes amigables en español.
 * El backend retorna: { error_code: string, error: string, user_message: string }
 * Este módulo proporciona fallbacks locales si el backend no envía user_message.
 */

// Error codes del backend
export const ERROR_MESSAGES: Record<string, string> = {
  // AI/OCR errors
  ai_unavailable: 'El servicio de IA no está disponible en este momento. Tu factura se guardó y se procesará automáticamente cuando el servicio se restablezca.',
  ai_parse_error: 'No pudimos extraer la información de esta imagen. Intenta con mejor iluminación o una foto más nítida.',

  // Storage errors
  storage_unavailable: 'El almacenamiento no está disponible. Por favor intenta de nuevo en unos minutos.',

  // Database errors
  db_unavailable: 'Hubo un problema guardando los datos. Tu imagen está segura y reintentaremos en unos minutos.',
  db_save_error: 'Hubo un problema guardando los datos. Tu imagen está segura y reintentaremos en unos minutos.',

  // File errors
  format_unsupported: 'Este formato de imagen no es compatible. Usa JPG, PNG o PDF.',
  file_too_large: 'La imagen es demasiado grande. El tamaño máximo es 20MB.',

  // Auth errors
  auth_expired: 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.',

  // Timeout
  timeout: 'El procesamiento está tardando más de lo normal. Tu factura está en cola y se procesará pronto.',
};

// Mensajes para errores de red (detectados en el frontend)
export const NETWORK_MESSAGES = {
  no_internet: 'No hay conexión a internet. La imagen se guardó localmente y se procesará cuando vuelva la conexión.',
  connection_refused: 'No se pudo conectar con el servidor. Verifica tu conexión a internet.',
  timeout: 'La conexión tardó demasiado. Por favor intenta de nuevo.',
  server_error: 'El servidor encontró un problema. Estamos trabajando para resolverlo.',
};

/**
 * Extrae el mensaje amigable de una respuesta de error del backend.
 * Prioriza: user_message del backend > mapeo local por error_code > mensaje genérico
 */
export function getUserMessage(responseData: any): string {
  // 1. Si el backend envió user_message, usarlo
  if (responseData?.user_message) {
    return responseData.user_message;
  }

  // 2. Si hay error_code, buscar en mapeo local
  if (responseData?.error_code && ERROR_MESSAGES[responseData.error_code]) {
    return ERROR_MESSAGES[responseData.error_code];
  }

  // 3. Mensaje genérico
  return 'Ocurrió un error inesperado. Por favor intenta de nuevo.';
}

/**
 * Detecta el tipo de error de red y devuelve mensaje amigable.
 */
export function getNetworkErrorMessage(error: Error): string {
  const msg = error.message.toLowerCase();

  if (msg.includes('network') || msg.includes('fetch')) {
    return NETWORK_MESSAGES.no_internet;
  }

  if (msg.includes('abort') || msg.includes('timeout')) {
    return NETWORK_MESSAGES.timeout;
  }

  if (msg.includes('refused') || msg.includes('econnrefused')) {
    return NETWORK_MESSAGES.connection_refused;
  }

  return NETWORK_MESSAGES.server_error;
}

/**
 * Determina si un error es recuperable (se puede reintentar).
 */
export function isRetryableError(errorCode?: string): boolean {
  const retryable = ['ai_unavailable', 'db_unavailable', 'db_save_error', 'storage_unavailable', 'timeout'];
  return errorCode ? retryable.includes(errorCode) : false;
}
