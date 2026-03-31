/**
 * API Configuration - FacturaIA
 * Centraliza la URL del backend para toda la app.
 *
 * SEGURIDAD: En produccion usar HTTPS para cifrar RNC, PIN, JWT y facturas.
 * Requiere configurar Nginx/Caddy con TLS en el servidor primero.
 */

// URL de produccion (HTTPS) - activar cuando el servidor tenga TLS
const API_PRODUCTION_URL = 'https://api.facturaia.com';

// URL de desarrollo (HTTP directo al servidor)
const API_DEVELOPMENT_URL = 'http://217.216.48.91:8081';

// Usar produccion cuando __DEV__ sea false (build release con HTTPS configurado)
// Por ahora usa desarrollo hasta que el servidor tenga TLS
export const API_BASE_URL = API_DEVELOPMENT_URL;

// Exportar flag para que otros modulos sepan si estamos en HTTPS
export const IS_HTTPS = API_BASE_URL.startsWith('https');
