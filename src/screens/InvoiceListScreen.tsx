/**
 * InvoiceListScreen - Display and manage invoices
 *
 * Features:
 * - List all receipts from Supabase
 * - Pull-to-refresh
 * - Filter by status
 * - Search functionality
 * - Navigate to camera for new scans
 * - Real-time updates via Supabase subscriptions
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
import {RootStackParamList, Receipt, ReceiptStatus} from '../types/invoice';
import {supabase, getCurrentUser, signOut} from '../config/supabase';

type InvoiceListScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'InvoiceList'
>;
type InvoiceListScreenRouteProp = RouteProp<RootStackParamList, 'InvoiceList'>;

interface Props {
  navigation: InvoiceListScreenNavigationProp;
  route: InvoiceListScreenRouteProp;
}

const InvoiceListScreen: React.FC<Props> = ({navigation, route}) => {
  const {groupId} = route.params;

  // State
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [filteredReceipts, setFilteredReceipts] = useState<Receipt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<ReceiptStatus | 'ALL'>(
    'ALL',
  );

  // ==========================================
  // Data Fetching
  // ==========================================

  const fetchReceipts = useCallback(async () => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        navigation.replace('Login');
        return;
      }

      // Don't filter by group_id if it's "default"
      let query = supabase
        .from('receipts')
        .select('*');

      if (groupId !== 'default') {
        query = query.eq('group_id', groupId);
      }

      const {data, error} = await query.order('date', {ascending: false});

      if (error) {
        throw error;
      }

      setReceipts(data || []);
      setFilteredReceipts(data || []);
    } catch (error: any) {
      console.error('Error fetching receipts:', error);
      Alert.alert('Error', 'Failed to load invoices');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [groupId, navigation]);

  useEffect(() => {
    fetchReceipts();

    // Set up real-time subscription
    const subscriptionConfig: any = {
      event: '*',
      schema: 'public',
      table: 'receipts',
    };

    // Only filter by group_id if not "default"
    if (groupId !== 'default') {
      subscriptionConfig.filter = `group_id=eq.${groupId}`;
    }

    const subscription = supabase
      .channel('receipts-channel')
      .on('postgres_changes', subscriptionConfig, payload => {
        console.log('Real-time update:', payload);
        fetchReceipts();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchReceipts, groupId]);

  // ==========================================
  // Filtering & Search
  // ==========================================

  useEffect(() => {
    let filtered = receipts;

    // Filter by status
    if (selectedStatus !== 'ALL') {
      filtered = filtered.filter(r => r.status === selectedStatus);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        r =>
          r.name.toLowerCase().includes(query) ||
          r.amount.toString().includes(query),
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
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
            navigation.replace('Login');
          } catch (error) {
            Alert.alert('Error', 'Failed to sign out');
          }
        },
      },
    ]);
  };

  // ==========================================
  // Render Functions
  // ==========================================

  const renderReceiptItem = ({item}: {item: Receipt}) => {
    const statusColor =
      item.status === 'OPEN'
        ? '#ff9800'
        : item.status === 'RESOLVED'
        ? '#4caf50'
        : '#f44336';

    return (
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleContainer}>
              <Title style={styles.cardTitle}>{item.name}</Title>
              <Chip
                mode="flat"
                textStyle={{color: statusColor}}
                style={[styles.statusChip, {borderColor: statusColor}]}>
                {item.status}
              </Chip>
            </View>
          </View>

          <View style={styles.cardDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Amount:</Text>
              <Text style={styles.detailValue}>
                ${(parseFloat(String(item.amount)) || 0).toFixed(2)}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Date:</Text>
              <Text style={styles.detailValue}>
                {format(new Date(item.date), 'MMM dd, yyyy')}
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
      <Title>No Invoices Yet</Title>
      <Paragraph style={styles.emptyText}>
        Tap the camera button below to scan your first invoice
      </Paragraph>
    </Surface>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Search Bar */}
      <Searchbar
        placeholder="Search invoices..."
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
          All ({receipts.length})
        </Chip>
        <Chip
          selected={selectedStatus === 'OPEN'}
          onPress={() => setSelectedStatus('OPEN')}
          style={styles.filterChip}>
          Open ({receipts.filter(r => r.status === 'OPEN').length})
        </Chip>
        <Chip
          selected={selectedStatus === 'RESOLVED'}
          onPress={() => setSelectedStatus('RESOLVED')}
          style={styles.filterChip}>
          Resolved ({receipts.filter(r => r.status === 'RESOLVED').length})
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
        <Paragraph style={styles.loadingText}>Loading invoices...</Paragraph>
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
        label="Scan Invoice"
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
