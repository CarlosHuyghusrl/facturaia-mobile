/**
 * Error Reporter — Captura y reporta errores de produccion.
 *
 * Funciona sin dependencias externas. Cuando se configure Sentry,
 * reemplazar las funciones con Sentry.captureException() etc.
 *
 * Para activar Sentry: npm install @sentry/react-native --ignore-scripts
 * Luego cambiar las funciones abajo por Sentry.* equivalentes.
 */

import { API_BASE_URL } from '../config/api';

// Cola de errores no enviados (max 20)
const errorQueue: ErrorReport[] = [];
const MAX_QUEUE = 20;

interface ErrorReport {
  message: string;
  stack?: string;
  context?: Record<string, any>;
  timestamp: string;
  level: 'error' | 'warning' | 'info';
}

/**
 * Inicializa el error reporter.
 * Captura errores globales no manejados.
 */
export function initErrorReporter(): void {
  // Capturar errores JS no manejados
  const originalHandler = ErrorUtils.getGlobalHandler();
  ErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
    captureException(error, { isFatal });
    // Llamar handler original para que RN muestre el red screen en dev
    if (originalHandler) {
      originalHandler(error, isFatal);
    }
  });

  // Capturar promesas rechazadas sin catch
  if (typeof global !== 'undefined') {
    const tracking = require('promise/setimmediate/rejection-tracking');
    tracking.enable({
      allRejections: true,
      onUnhandled: (_id: number, error: Error) => {
        captureException(error, { unhandledRejection: true });
      },
    });
  }
}

/**
 * Captura una excepcion con contexto opcional.
 */
export function captureException(
  error: Error | string,
  context?: Record<string, any>
): void {
  const report: ErrorReport = {
    message: typeof error === 'string' ? error : error.message,
    stack: typeof error === 'string' ? undefined : error.stack,
    context,
    timestamp: new Date().toISOString(),
    level: 'error',
  };

  // Log siempre en consola
  console.error('[ErrorReporter]', report.message, context);

  // Agregar a cola
  if (errorQueue.length >= MAX_QUEUE) {
    errorQueue.shift(); // Eliminar el mas viejo
  }
  errorQueue.push(report);

  // Intentar enviar al servidor (fire-and-forget)
  sendToServer(report).catch(() => {
    // Silenciar errores de envio - no queremos loops infinitos
  });
}

/**
 * Captura un mensaje informativo.
 */
export function captureMessage(
  message: string,
  level: 'warning' | 'info' = 'info'
): void {
  const report: ErrorReport = {
    message,
    timestamp: new Date().toISOString(),
    level,
  };

  if (errorQueue.length >= MAX_QUEUE) {
    errorQueue.shift();
  }
  errorQueue.push(report);
}

/**
 * Obtiene los errores en cola (para debug).
 */
export function getErrorQueue(): ErrorReport[] {
  return [...errorQueue];
}

/**
 * Envia un reporte de error al backend.
 * Endpoint: POST /api/errors (crear en backend cuando sea necesario).
 * Si el endpoint no existe (404), simplemente no envía.
 */
async function sendToServer(report: ErrorReport): Promise<void> {
  try {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 5000);

    await fetch(`${API_BASE_URL}/api/errors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(report),
      signal: controller.signal,
    });
  } catch {
    // Silenciar - no queremos errores del error reporter
  }
}
