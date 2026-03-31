/**
 * Cola offline para facturas pendientes de subir.
 * Guarda imágenes localmente cuando no hay conexión o el servidor falla.
 * Las procesa automáticamente cuando vuelve la conexión.
 *
 * Usa expo-secure-store para cifrar datos en reposo (protege URIs de facturas).
 * Chunking automático para manejar el límite de 2KB por key en iOS.
 */

import * as SecureStore from 'expo-secure-store';
import NetInfo from '@react-native-community/netinfo';

const QUEUE_KEY = 'facturaia_offline_queue';
const CHUNK_KEY_PREFIX = 'facturaia_oq_chunk_';
const CHUNK_SIZE = 1800; // Stay under 2KB iOS limit with margin
const MAX_QUEUE_SIZE = 50;

export interface QueuedInvoice {
  id: string;
  imageUri: string;
  timestamp: number;
  attempts: number;
  lastError?: string;
  status: 'pending' | 'uploading' | 'failed';
}

/**
 * Guarda datos con chunking automático para iOS.
 */
async function secureSet(key: string, value: string): Promise<void> {
  if (value.length <= CHUNK_SIZE) {
    await SecureStore.setItemAsync(key, value);
    // Clean up any old chunks
    await cleanChunks(key);
  } else {
    // Split into chunks
    const chunks = Math.ceil(value.length / CHUNK_SIZE);
    await SecureStore.setItemAsync(key, `__chunked__${chunks}`);
    for (let i = 0; i < chunks; i++) {
      const chunk = value.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
      await SecureStore.setItemAsync(`${CHUNK_KEY_PREFIX}${key}_${i}`, chunk);
    }
  }
}

/**
 * Lee datos con soporte de chunking.
 */
async function secureGet(key: string): Promise<string | null> {
  const value = await SecureStore.getItemAsync(key);
  if (!value) return null;

  if (value.startsWith('__chunked__')) {
    const chunks = parseInt(value.replace('__chunked__', ''), 10);
    let result = '';
    for (let i = 0; i < chunks; i++) {
      const chunk = await SecureStore.getItemAsync(`${CHUNK_KEY_PREFIX}${key}_${i}`);
      if (chunk) result += chunk;
    }
    return result;
  }

  return value;
}

/**
 * Elimina datos y sus chunks.
 */
async function secureDelete(key: string): Promise<void> {
  const value = await SecureStore.getItemAsync(key);
  if (value && value.startsWith('__chunked__')) {
    const chunks = parseInt(value.replace('__chunked__', ''), 10);
    for (let i = 0; i < chunks; i++) {
      await SecureStore.deleteItemAsync(`${CHUNK_KEY_PREFIX}${key}_${i}`);
    }
  }
  await SecureStore.deleteItemAsync(key);
}

/**
 * Limpia chunks huérfanos.
 */
async function cleanChunks(key: string): Promise<void> {
  // Try to clean up to 10 potential old chunks
  for (let i = 0; i < 10; i++) {
    try {
      await SecureStore.deleteItemAsync(`${CHUNK_KEY_PREFIX}${key}_${i}`);
    } catch {
      // Ignore - chunk doesn't exist
    }
  }
}

/**
 * Agrega una factura a la cola offline.
 */
export async function addToQueue(imageUri: string): Promise<string> {
  const queue = await getQueue();

  if (queue.length >= MAX_QUEUE_SIZE) {
    throw new Error('La cola de facturas está llena. Procesa las pendientes primero.');
  }

  const id = `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const item: QueuedInvoice = {
    id,
    imageUri,
    timestamp: Date.now(),
    attempts: 0,
    status: 'pending',
  };

  queue.push(item);
  await saveQueue(queue);
  return id;
}

/**
 * Obtiene la cola completa.
 */
export async function getQueue(): Promise<QueuedInvoice[]> {
  try {
    const data = await secureGet(QUEUE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * Guarda la cola.
 */
async function saveQueue(queue: QueuedInvoice[]): Promise<void> {
  await secureSet(QUEUE_KEY, JSON.stringify(queue));
}

/**
 * Elimina un item de la cola.
 */
export async function removeFromQueue(id: string): Promise<void> {
  const queue = await getQueue();
  const filtered = queue.filter(item => item.id !== id);
  await saveQueue(filtered);
}

/**
 * Actualiza el estado de un item.
 */
export async function updateQueueItem(id: string, updates: Partial<QueuedInvoice>): Promise<void> {
  const queue = await getQueue();
  const index = queue.findIndex(item => item.id === id);
  if (index >= 0) {
    queue[index] = { ...queue[index], ...updates };
    await saveQueue(queue);
  }
}

/**
 * Obtiene el conteo de items pendientes.
 */
export async function getPendingCount(): Promise<number> {
  const queue = await getQueue();
  return queue.filter(item => item.status === 'pending' || item.status === 'failed').length;
}

/**
 * Verifica si hay conexión a internet.
 */
export async function isOnline(): Promise<boolean> {
  try {
    const state = await NetInfo.fetch();
    return state.isConnected === true;
  } catch {
    return false;
  }
}

/**
 * Procesa la cola: sube facturas pendientes al servidor.
 * Llamar cuando vuelva la conexión o periódicamente.
 */
export async function processQueue(
  uploadFn: (imageUri: string) => Promise<any>,
  onProgress?: (current: number, total: number) => void,
): Promise<{ success: number; failed: number }> {
  const online = await isOnline();
  if (!online) {
    return { success: 0, failed: 0 };
  }

  const queue = await getQueue();
  const pending = queue.filter(item => item.status === 'pending' || item.status === 'failed');

  if (pending.length === 0) {
    return { success: 0, failed: 0 };
  }

  let success = 0;
  let failed = 0;

  for (let i = 0; i < pending.length; i++) {
    const item = pending[i];

    if (onProgress) {
      onProgress(i + 1, pending.length);
    }

    try {
      await updateQueueItem(item.id, { status: 'uploading' });
      await uploadFn(item.imageUri);
      await removeFromQueue(item.id);
      success++;
    } catch (err: any) {
      const newAttempts = item.attempts + 1;
      if (newAttempts >= 5) {
        await updateQueueItem(item.id, {
          status: 'failed',
          attempts: newAttempts,
          lastError: err.message || 'Max retries reached',
        });
      } else {
        await updateQueueItem(item.id, {
          status: 'failed',
          attempts: newAttempts,
          lastError: err.message,
        });
      }
      failed++;
    }
  }

  return { success, failed };
}

/**
 * Limpia la cola completa (para debug/reset).
 */
export async function clearQueue(): Promise<void> {
  await secureDelete(QUEUE_KEY);
}
