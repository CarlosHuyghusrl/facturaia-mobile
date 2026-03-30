/**
 * InvoiceListScreen - Display and manage invoices
 *
 * Features:
 * - List all invoices from Go backend API
 * - Pull-to-refresh
 * - Filter by status
 * - Search functionality
 * - Navigate to camera for new scans
 */

import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  Text,
} from 'react-native';
import {
  FAB,
  Card,
  Title,
  Paragraph,
  Chip,
  Searchbar,
  IconButton,
  ActivityIndicator,
  Surface,
} from 'react-native-paper';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import {format} from 'date-fns';
import {RootStackParamList} from '../types/invoice';
import {listarFacturas, Factura} from '../services/facturasService';
import {logout, getToken} from '../services/authService';

type InvoiceListScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'InvoiceList'
>;
type InvoiceListScreenRouteProp = RouteProp<RootStackParamList, 'InvoiceList'>;

interface Props {
  navigation: InvoiceListScreenNavigationProp;
  route: InvoiceListScreenRouteProp;
}

type FacturaEstado = Factura['estado'] | 'ALL';

const InvoiceListScreen: React.FC<Props> = ({navigation, route}) => {
  const {groupId} = route.params;

  // State
  const [receipts, setReceipts] = useState<Factura[]>([]);
  const [filteredReceipts, setFilteredReceipts] = useState<Factura[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<FacturaEstado>('ALL');

  // ==========================================
  // Data Fetching
  // ==========================================

  const fetchReceipts = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) {
        navigation.replace('Login');
        return;
      }

      const response = await listarFacturas({limit: 100});
      const data = response.facturas || [];

      setReceipts(data);
      setFilteredReceipts(data);
    } catch (error: any) {
      console.error('Error fetching invoices:', error);
      Alert.alert('Error', 'No se pudieron cargar las facturas');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [navigation]);

  useEffect(() => {
    fetchReceipts();
  }, [fetchReceipts]);

  // ==========================================
  // Filtering & Search
  // ==========================================

  useEffect(() => {
    let filtered = receipts;

    // Filter by status
    if (selectedStatus !== 'ALL') {
      filtered = filtered.filter(r => r.estado === selectedStatus);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        r =>
          (r.proveedor || '').toLowerCase().includes(query) ||
          (r.ncf || '').toLowerCase().includes(query) ||
          String(r.monto || '').includes(query),
      );
    }

    setFilteredReceipts(filtered);
  }, [receipts, selectedStatus, searchQuery]);

  // ==========================================
  // Handlers
  // ==========================================

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchReceipts();
  };

  const handleNavigateToCamera = () => {
    navigation.navigate('Camera', {groupId});
  };

  const handleSignOut = async () => {
    Alert.alert('Cerrar Sesión', '¿Estás seguro que deseas cerrar sesión?', [
      {text: 'Cancelar', style: 'cancel'},
      {
        text: 'Cerrar Sesión',
        style: 'destructive',
        onPress: async () => {
          try {
            await logout();
            navigation.replace('Login');
          } catch (error) {
            Alert.alert('Error', 'No se pudo cerrar sesión');
          }
        },
      },
    ]);
  };

  // ==========================================
  // Render Functions
  // ==========================================

  const getStatusColor = (estado: string): string => {
    switch (estado) {
      case 'procesado':
      case 'procesada':
      case 'completado':
      case 'completada':
      case 'validado':
        return '#4caf50';
      case 'pendiente':
        return '#ff9800';
      case 'error':
      case 'rechazado':
        return '#f44336';
      default:
        return '#9e9e9e';
    }
  };

  const renderReceiptItem = ({item}: {item: Factura}) => {
    const statusColor = getStatusColor(item.estado);
    const displayName = item.proveedor || item.emisor_rnc || 'Sin nombre';
    const displayDate = item.fecha_documento || item.created_at;

    return (
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleContainer}>
              <Title style={styles.cardTitle}>{displayName}</Title>
              <Chip
                mode="flat"
                textStyle={{color: statusColor}}
                style={[styles.statusChip, {borderColor: statusColor}]}>
                {item.estado}
              </Chip>
            </View>
          </View>

          <View style={styles.cardDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Total:</Text>
              <Text style={styles.detailValue}>
                ${(parseFloat(String(item.monto)) || 0).toFixed(2)}
              </Text>
            </View>

            {item.ncf ? (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>NCF:</Text>
                <Text style={styles.detailValue}>{item.ncf}</Text>
              </View>
            ) : null}

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Fecha:</Text>
              <Text style={styles.detailValue}>
                {displayDate
                  ? format(new Date(displayDate), 'dd/MM/yyyy')
                  : 'Sin fecha'}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderEmptyState = () => (
    <Surface style={styles.emptyState}>
      <IconButton icon="receipt" size={64} />
      <Title>Sin Facturas</Title>
      <Paragraph style={styles.emptyText}>
        Toca el botón de cámara para escanear tu primera factura
      </Paragraph>
    </Surface>
  );

  const procesadas = receipts.filter(
    r =>
      r.estado === 'procesado' ||
      r.estado === 'procesada' ||
      r.estado === 'completado' ||
      r.estado === 'completada' ||
      r.estado === 'validado',
  );
  const errores = receipts.filter(
    r => r.estado === 'error' || r.estado === 'rechazado',
  );

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Search Bar */}
      <Searchbar
        placeholder="Buscar facturas..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      {/* Status Filters */}
      <View style={styles.filterContainer}>
        <Chip
          selected={selectedStatus === 'ALL'}
          onPress={() => setSelectedStatus('ALL')}
          style={styles.filterChip}>
          Todas ({receipts.length})
        </Chip>
        <Chip
          selected={
            selectedStatus === 'procesado' ||
            selectedStatus === 'procesada' ||
            selectedStatus === 'completado' ||
            selectedStatus === 'completada'
          }
          onPress={() => setSelectedStatus('procesado')}
          style={styles.filterChip}>
          Procesadas ({procesadas.length})
        </Chip>
        <Chip
          selected={selectedStatus === 'error' || selectedStatus === 'rechazado'}
          onPress={() => setSelectedStatus('error')}
          style={styles.filterChip}>
          Errores ({errores.length})
        </Chip>
      </View>
    </View>
  );

  // ==========================================
  // Main Render
  // ==========================================

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
        <Paragraph style={styles.loadingText}>Cargando facturas...</Paragraph>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Sign Out Button */}
      <IconButton
        icon="logout"
        size={24}
        onPress={handleSignOut}
        style={styles.signOutButton}
      />

      {/* List */}
      <FlatList
        data={filteredReceipts}
        renderItem={renderReceiptItem}
        keyExtractor={item => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
          />
        }
      />

      {/* FAB - Scan New Invoice */}
      <FAB
        icon="camera"
        style={styles.fab}
        onPress={handleNavigateToCamera}
        label="Escanear Factura"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 80,
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchBar: {
    marginBottom: 12,
    elevation: 0,
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    marginRight: 8,
  },
  card: {
    margin: 8,
    marginHorizontal: 16,
    elevation: 2,
  },
  cardHeader: {
    marginBottom: 12,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  statusChip: {
    borderWidth: 1,
  },
  cardDetails: {
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    marginTop: 100,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 16,
    color: '#666',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
  signOutButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
  },
});

export default InvoiceListScreen;
