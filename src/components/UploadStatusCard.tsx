/**
 * Componente que muestra el estado de subida de una factura.
 * Se usa en CameraScreen después de procesar una imagen.
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';

export type UploadStatus =
  | 'uploading'       // Subiendo al servidor
  | 'processing'      // IA procesando
  | 'success'         // Factura procesada OK
  | 'queued_local'    // Guardada offline, pendiente de subir
  | 'queued_server'   // Guardada en servidor, pendiente de IA
  | 'error_retry'     // Error, se puede reintentar
  | 'error_permanent'; // Error, no se puede reintentar

interface Props {
  status: UploadStatus;
  message?: string;
  onRetry?: () => void;
  onViewInvoice?: () => void;
  onGoHome?: () => void;
}

const STATUS_CONFIG: Record<UploadStatus, { icon: string; color: string; title: string; defaultMessage: string }> = {
  uploading: {
    icon: '\u2B06',
    color: '#3498db',
    title: 'Subiendo imagen...',
    defaultMessage: 'Enviando la imagen al servidor para procesarla.',
  },
  processing: {
    icon: '\uD83D\uDD0D',
    color: '#f39c12',
    title: 'Procesando factura...',
    defaultMessage: 'La IA está leyendo tu factura. Esto puede tomar unos segundos.',
  },
  success: {
    icon: '\u2713',
    color: '#27ae60',
    title: 'Factura procesada',
    defaultMessage: 'Los datos fueron extraídos exitosamente.',
  },
  queued_local: {
    icon: '\uD83D\uDCF1',
    color: '#9b59b6',
    title: 'Guardada localmente',
    defaultMessage: 'No hay conexión. La factura se procesará cuando vuelva la conexión.',
  },
  queued_server: {
    icon: '\u23F3',
    color: '#f39c12',
    title: 'En cola de procesamiento',
    defaultMessage: 'Tu factura está en cola y se procesará pronto.',
  },
  error_retry: {
    icon: '\u26A0',
    color: '#e74c3c',
    title: 'Error al procesar',
    defaultMessage: 'Hubo un problema. Puedes intentarlo de nuevo.',
  },
  error_permanent: {
    icon: '\u2715',
    color: '#e74c3c',
    title: 'No se pudo procesar',
    defaultMessage: 'No pudimos procesar esta imagen. Intenta con una foto más nítida.',
  },
};

export default function UploadStatusCard({ status, message, onRetry, onViewInvoice, onGoHome }: Props) {
  const config = STATUS_CONFIG[status];
  const isLoading = status === 'uploading' || status === 'processing';

  return (
    <View style={[styles.container, { borderLeftColor: config.color }]}>
      <View style={styles.header}>
        {isLoading ? (
          <ActivityIndicator size="small" color={config.color} style={styles.icon} />
        ) : (
          <Text style={[styles.iconText, { color: config.color }]}>{config.icon}</Text>
        )}
        <Text style={[styles.title, { color: config.color }]}>{config.title}</Text>
      </View>

      <Text style={styles.message}>{message || config.defaultMessage}</Text>

      <View style={styles.actions}>
        {status === 'error_retry' && onRetry && (
          <TouchableOpacity style={[styles.button, { backgroundColor: config.color }]} onPress={onRetry}>
            <Text style={styles.buttonText}>Reintentar</Text>
          </TouchableOpacity>
        )}
        {status === 'success' && onViewInvoice && (
          <TouchableOpacity style={[styles.button, { backgroundColor: config.color }]} onPress={onViewInvoice}>
            <Text style={styles.buttonText}>Ver factura</Text>
          </TouchableOpacity>
        )}
        {(status === 'success' || status === 'queued_local' || status === 'error_permanent') && onGoHome && (
          <TouchableOpacity style={[styles.buttonOutline, { borderColor: config.color }]} onPress={onGoHome}>
            <Text style={[styles.buttonOutlineText, { color: config.color }]}>Ir al inicio</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderLeftWidth: 4,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    marginRight: 8,
  },
  iconText: {
    fontSize: 20,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  message: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonOutline: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  buttonOutlineText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
