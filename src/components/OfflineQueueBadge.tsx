/**
 * Badge que muestra cuántas facturas están pendientes en la cola offline.
 * Se muestra en HomeScreen cuando hay facturas guardadas localmente sin subir.
 */
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { getPendingCount, processQueue } from '../utils/offlineQueue';

interface Props {
  uploadFn: (imageUri: string) => Promise<any>;
  onSyncComplete?: (results: { success: number; failed: number }) => void;
}

export default function OfflineQueueBadge({ uploadFn, onSyncComplete }: Props) {
  const [count, setCount] = useState(0);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadCount();
    // Refresca el conteo cada 30 segundos
    const interval = setInterval(loadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  async function loadCount() {
    const c = await getPendingCount();
    setCount(c);
  }

  async function handleSync() {
    if (syncing) return;
    setSyncing(true);
    try {
      const results = await processQueue(uploadFn);
      await loadCount();
      if (onSyncComplete) {
        onSyncComplete(results);
      }
    } finally {
      setSyncing(false);
    }
  }

  if (count === 0) return null;

  return (
    <TouchableOpacity style={styles.container} onPress={handleSync} disabled={syncing}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{count}</Text>
      </View>
      <Text style={styles.text}>
        {syncing
          ? 'Subiendo facturas pendientes...'
          : `${count} factura${count > 1 ? 's' : ''} pendiente${count > 1 ? 's' : ''} de subir`
        }
      </Text>
      {!syncing && (
        <Text style={styles.action}>Subir ahora</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3CD',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#FFEAA7',
  },
  badge: {
    backgroundColor: '#F39C12',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  text: {
    flex: 1,
    fontSize: 13,
    color: '#856404',
  },
  action: {
    fontSize: 13,
    color: '#F39C12',
    fontWeight: '600',
  },
});
