/**
 * API Configuration - FacturaIA
 * Centraliza la URL del backend para toda la app.
 *
 * SEGURIDAD: En produccion usar HTTPS para cifrar RNC, PIN, JWT y facturas.
 * Requiere configurar Nginx/Caddy con TLS en el servidor primero.
 */

// URL de produccion (HTTPS) - ocr.huyghusrl.com con TLS verificado
const API_PRODUCTION_URL = 'https://ocr.huyghusrl.com';

// URL de desarrollo (HTTP directo al servidor)
const API_DEVELOPMENT_URL = 'http://217.216.48.91:8081'; // fallback if HTTPS down

// Usar HTTPS por defecto (TLS verificado en ocr.huyghusrl.com)
export const API_BASE_URL = API_PRODUCTION_URL;

// Exportar flag para que otros modulos sepan si estamos en HTTPS
export const IS_HTTPS = API_BASE_URL.startsWith('https');

// URL del SM dashboard interno (Carlos, panel monitoreo agentes)
// IP directa porque SM no tiene HTTPS aún. NO usar en producción cliente final.
export const SM_DASHBOARD_URL = 'http://217.216.48.91:9099';

// API key compartida bug report. Mover a env var en wave futura.
export const SM_DASHBOARD_API_KEY = 'huygh-secret-2026';
