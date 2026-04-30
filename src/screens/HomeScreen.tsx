/**
 * HomeScreen - Lista de facturas con resumen
 * Pull to refresh, infinite scroll, FAB escanear
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Text,
  Surface,
  FAB,
  Chip,
  IconButton,
  ActivityIndicator,
  Divider,
} from 'react-native-paper';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { useAuth } from '../hooks/useAuth';
import {
  Factura,
  FacturaResumen,
  listarFacturas,
  obtenerResumen,
} from '../services/facturasService';
import { RootStackParamList } from '../../App';
import OfflineQueueBadge from '../components/OfflineQueueBadge';
import { api } from '../utils/apiClient';

type NavigationProp = StackNavigationProp<RootStackParamList>;

// Devuelve color/label para el badge de clasificación fiscal de la factura.
// Prioridad: review > 606 > 607 > gasto sin RNC.
function getClasificacionBadge(item: Factura): { label: string; color: string; textColor: string } {
  if (item.extraction_status === 'review') {
    return { label: '🟡 Revisar', color: '#fbbf24', textColor: '#78350f' };
  }
  if (item.aplica_606 === true) {
    return { label: '🟢 606', color: '#22c55e', textColor: '#052e16' };
  }
  if (item.aplica_607 === true) {
    return { label: '🔵 607', color: '#3b82f6', textColor: '#0c1e3e' };
  }
  // Validated pero sin clasificar (gasto sin RNC)
  return { label: '⚪ Gasto', color: '#94a3b8', textColor: '#0f172a' };
}

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { cliente, logout } = useAuth();

  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [resumen, setResumen] = useState<FacturaResumen | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [tipoFilter, setTipoFilter] = useState<'todas' | 'compras' | 'ventas'>('todas');

  const ITEMS_PER_PAGE = 20;

  // Cargar datos iniciales
  const loadData = useCallback(async (refresh = false) => {
    try {
      if (refresh) {
        setIsRefreshing(true);
        setPage(1);
      } else {
        setIsLoading(true);
      }

      const [facturasRes, resumenRes] = await Promise.all([
        listarFacturas({ page: 1, limit: ITEMS_PER_PAGE }),
        obtenerResumen(),
      ]);

      setFacturas(facturasRes.facturas);
      setResumen(resumenRes);
      setHasMore(facturasRes.page < facturasRes.total_pages);
    } catch (error) {
      console.error('[HomeScreen] Error cargando datos:', error);
      Alert.alert('Error', 'No se pudieron cargar las facturas.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Cargar más facturas (infinite scroll)
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    try {
      setIsLoadingMore(true);
      const nextPage = page + 1;

      const response = await listarFacturas({ page: nextPage, limit: ITEMS_PER_PAGE });

      setFacturas(prev => [...prev, ...response.facturas]);
      setPage(nextPage);
      setHasMore(response.page < response.total_pages);
    } catch (error) {
      console.error('[HomeScreen] Error cargando más:', error);
      Alert.alert('Error', 'No se pudieron cargar más facturas.');
    } finally {
      setIsLoadingMore(false);
    }
  }, [page, hasMore, isLoadingMore]);

  // Recargar datos cada vez que la pantalla recibe foco (ej: volver de CameraScreen)
  useFocusEffect(
    useCallback(() => {
      loadData(true);
    }, [])
  );

  const facturasFiltradas = facturas.filter(f => {
    if (tipoFilter === 'compras') return f.aplica_607 !== true;
    if (tipoFilter === 'ventas') return f.aplica_607 === true;
    return true;
  });

  // Formatear moneda
  const formatMoney = (amount: number) => {
    return `RD$ ${amount.toLocaleString('es-DO', { minimumFractionDigits: 2 })}`;
  };

  // Formatear fecha
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-DO', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Color del badge de estado
  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'validado': return '#22c55e';
      case 'procesado': return '#3b82f6';
      case 'pendiente': return '#f59e0b';
      case 'error': return '#ef4444';
      default: return '#6b7280';
    }
  };

  // Función de subida para la cola offline
  const uploadFacturaOffline = async (imageUri: string): Promise<any> => {
    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'factura.jpg',
    } as any);
    return api.upload('/api/facturas/upload', formData);
  };

  // Renderizar header de la lista (badge offline + resumen)
  const renderListHeader = () => (
    <>
      <OfflineQueueBadge
        uploadFn={uploadFacturaOffline}
        onSyncComplete={(results) => {
          if (results.success > 0) {
            Alert.alert(
              'Sincronización completa',
              `${results.success} factura${results.success > 1 ? 's' : ''} subida${results.success > 1 ? 's' : ''} exitosamente.`,
            );
            loadData(true);
          }
          if (results.failed > 0) {
            Alert.alert(
              'Algunas facturas fallaron',
              `${results.failed} factura${results.failed > 1 ? 's' : ''} no se pudo${results.failed > 1 ? 'ron' : ''} subir. Intenta de nuevo más tarde.`,
            );
          }
        }}
      />
      {renderResumen()}
      {/* Filtro tabs */}
      <View style={styles.filterRow}>
        {(['todas', 'compras', 'ventas'] as const).map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterTab, tipoFilter === f && styles.filterTabActive]}
            onPress={() => setTipoFilter(f)}
          >
            <Text style={[styles.filterTabText, tipoFilter === f && styles.filterTabTextActive]}>
              {f === 'todas' ? 'Todas' : f === 'compras' ? '📥 Compras' : '📤 Ventas'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </>
  );

  // Renderizar card de resumen
  const renderResumen = () => (
    <View style={styles.resumenContainer}>
      <Surface style={styles.resumenCard}>
        <Text style={styles.resumenValue}>{resumen?.total_facturas || 0}</Text>
        <Text style={styles.resumenLabel}>Total Facturas</Text>
      </Surface>
      <Surface style={styles.resumenCard}>
        <Text style={[styles.resumenValue, { color: '#22D3EE' }]}>
          {formatMoney(resumen?.itbis_mes || 0)}
        </Text>
        <Text style={styles.resumenLabel}>ITBIS Mes</Text>
      </Surface>
      <Surface style={styles.resumenCard}>
        <Text style={[styles.resumenValue, { color: '#f59e0b' }]}>
          {resumen?.pendientes || 0}
        </Text>
        <Text style={styles.resumenLabel}>Pendientes</Text>
      </Surface>
    </View>
  );

  // Renderizar item de factura
  const renderFactura = ({ item }: { item: Factura }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('InvoiceDetail' as any, { facturaId: item.id })}
      activeOpacity={0.7}
    >
      <Surface style={styles.facturaCard}>
        <View style={styles.facturaHeader}>
          <View style={styles.facturaInfo}>
            <Text style={styles.facturaEmisor} numberOfLines={1}>
              {item.proveedor || 'Sin nombre'}
            </Text>
            <Text style={styles.facturaNcf}>{item.ncf}</Text>
          </View>
          <View style={styles.badgeRow}>
            <Chip
              style={[styles.estadoBadge, { backgroundColor: getEstadoColor(item.estado) }]}
              textStyle={styles.estadoText}
            >
              {item.estado}
            </Chip>
            <Chip
              style={[styles.clasificacionBadge, { backgroundColor: getClasificacionBadge(item).color }]}
              textStyle={{ color: getClasificacionBadge(item).textColor, fontSize: 11, fontWeight: '700' }}
              compact
            >
              {getClasificacionBadge(item).label}
            </Chip>
          </View>
        </View>

        <Divider style={styles.divider} />

        <View style={styles.facturaFooter}>
          <View>
            <Text style={styles.facturaFecha}>{formatDate(item.fecha_documento)}</Text>
            <Text style={styles.facturaRnc}>RNC: {item.emisor_rnc}</Text>
          </View>
          <View style={styles.facturaMontos}>
            <Text style={styles.facturaTotal}>{formatMoney(item.monto)}</Text>
            <Text style={styles.facturaItbis}>ITBIS: {formatMoney(item.itbis)}</Text>
          </View>
        </View>
      </Surface>
    </TouchableOpacity>
  );

  // Loading inicial
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#22D3EE" />
        <Text style={styles.loadingText}>Cargando facturas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <Surface style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hola, {cliente?.nombre || 'Usuario'}</Text>
          <Text style={styles.subGreeting}>Tus facturas del mes</Text>
        </View>
        <IconButton
          icon="logout"
          iconColor="#ef4444"
          size={24}
          onPress={logout}
        />
      </Surface>

      {/* Lista con resumen */}
      <FlatList
        testID="home-invoice-list"
        accessibilityLabel="Lista de facturas"
        data={facturasFiltradas}
        keyExtractor={(item) => item.id}
        renderItem={renderFactura}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay facturas aún</Text>
            <Text style={styles.emptySubtext}>Presiona el botón + para escanear tu primera factura</Text>
          </View>
        }
        ListFooterComponent={
          isLoadingMore ? (
            <ActivityIndicator style={styles.loadingMore} color="#22D3EE" />
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => loadData(true)}
            colors={['#22D3EE']}
            tintColor="#22D3EE"
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        windowSize={10}
        maxToRenderPerBatch={15}
        initialNumToRender={10}
        removeClippedSubviews={true}
        getItemLayout={(_, index) => ({
          length: 100,
          offset: 100 * index,
          index,
        })}
        contentContainerStyle={styles.listContent}
      />

      {/* FAB Escanear */}
      <FAB
        icon="camera"
        style={styles.fab}
        color="#0f172a"
        onPress={() => navigation.navigate('Camera')}
        testID="home-scan-button"
        accessibilityLabel="Escanear factura"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
  },
  loadingText: {
    marginTop: 12,
    color: '#94a3b8',
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1e293b',
  },
  greeting: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  subGreeting: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 2,
  },
  resumenContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  resumenCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#1e293b',
    alignItems: 'center',
  },
  resumenValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  resumenLabel: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 4,
  },
  listContent: {
    paddingBottom: 80,
  },
  facturaCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#1e293b',
  },
  facturaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  facturaInfo: {
    flex: 1,
    marginRight: 12,
  },
  facturaEmisor: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  facturaNcf: {
    fontSize: 13,
    color: '#22D3EE',
    marginTop: 2,
    fontFamily: 'monospace',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  estadoBadge: {
    height: 28,
    justifyContent: 'center',
  },
  clasificacionBadge: {
    height: 24,
    marginLeft: 6,
    justifyContent: 'center',
  },
  estadoText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
    textTransform: 'uppercase',
    lineHeight: 14,
  },
  divider: {
    marginVertical: 12,
    backgroundColor: '#334155',
  },
  facturaFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  facturaFecha: {
    fontSize: 13,
    color: '#94a3b8',
  },
  facturaRnc: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  facturaMontos: {
    alignItems: 'flex-end',
  },
  facturaTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  facturaItbis: {
    fontSize: 12,
    color: '#22D3EE',
    marginTop: 2,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 8,
    textAlign: 'center',
  },
  loadingMore: {
    padding: 16,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#22D3EE',
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#1e293b',
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: '#0e4a6d',
    borderWidth: 1,
    borderColor: '#22D3EE',
  },
  filterTabText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  filterTabTextActive: {
    color: '#22D3EE',
  },
});

export default HomeScreen;
