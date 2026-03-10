/**
 * Cola offline para facturas pendientes de subir.
 * Guarda imágenes localmente cuando no hay conexión o el servidor falla.
 * Las procesa automáticamente cuando vuelve la conexión.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

const QUEUE_KEY = '@facturaia_offline_queue';
const MAX_QUEUE_SIZE = 50; // Máximo 50 facturas en cola

export interface QueuedInvoice {
  id: string;
  imageUri: string;
  timestamp: number;
  attempts: number;
  lastError?: string;
  status: 'pending' | 'uploading' | 'failed';
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
    const data = await AsyncStorage.getItem(QUEUE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * Guarda la cola.
 */
async function saveQueue(queue: QueuedInvoice[]): Promise<void> {
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
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
 *
 * @param uploadFn - Función que sube una imagen al servidor
 * @param onProgress - Callback con (current, total) para mostrar progreso
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
        // Max retries reached, keep in queue but mark as failed permanently
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
  await AsyncStorage.removeItem(QUEUE_KEY);
}
