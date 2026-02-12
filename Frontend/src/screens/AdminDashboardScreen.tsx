import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../theme';

const { width } = Dimensions.get('window');

interface AdminStats {
  totalUsers: number;
  totalListings: number;
  activeTransactions: number;
  revenueToday: number;
  flaggedContent: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
}

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  avatar: string;
  status: 'active' | 'suspended' | 'pending';
  joinDate: string;
  listings: number;
  sales: number;
}

interface Listing {
  id: string;
  title: string;
  price: number;
  seller: string;
  status: 'active' | 'flagged' | 'removed';
  imageUrl: string;
  createdAt: string;
}

const AdminDashboardScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'listings' | 'system'>('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAdminData();
  }, [activeTab]);

  const fetchAdminData = async () => {
    // Mock admin data - replace with actual API calls
    setStats({
      totalUsers: 2847,
      totalListings: 15342,
      activeTransactions: 892,
      revenueToday: 12580,
      flaggedContent: 23,
      systemHealth: 'healthy',
    });

    setUsers([
      { id: '1', username: 'sarah_bloom', email: 'sarah@bloom.com', role: 'creator', avatar: 'https://randomuser.me/api/portraits/women/44.jpg', status: 'active', joinDate: '2024-01-15', listings: 47, sales: 128 },
      { id: '2', username: 'mike_eco', email: 'mike@bloom.com', role: 'user', avatar: 'https://randomuser.me/api/portraits/men/32.jpg', status: 'active', joinDate: '2024-02-20', listings: 12, sales: 34 },
      { id: '3', username: 'emma_green', email: 'emma@bloom.com', role: 'creator', avatar: 'https://randomuser.me/api/portraits/women/68.jpg', status: 'suspended', joinDate: '2024-03-01', listings: 0, sales: 89 },
      { id: '4', username: 'admin_shawn', email: 'shawn@bloom.com', role: 'admin', avatar: 'https://randomuser.me/api/portraits/men/85.jpg', status: 'active', joinDate: '2023-12-01', listings: 0, sales: 0 },
      { id: '5', username: 'dev_team', email: 'dev@bloom.com', role: 'developer', avatar: 'https://randomuser.me/api/portraits/men/41.jpg', status: 'active', joinDate: '2023-11-15', listings: 0, sales: 0 },
    ]);

    setListings([
      { id: '1', title: 'KitchenAid Mixer', price: 120, seller: 'sarah_bloom', status: 'active', imageUrl: 'https://images.unsplash.com/photo-1556910103-1c02745a30bf?w=200', createdAt: '2h ago' },
      { id: '2', title: 'Vintage Dress', price: 45, seller: 'emma_green', status: 'flagged', imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=200', createdAt: '5h ago' },
      { id: '3', title: 'Baby Stroller', price: 180, seller: 'mike_eco', status: 'active', imageUrl: 'https://images.unsplash.com/photo-1522858547137-f1dcec554f55?w=200', createdAt: '1d ago' },
    ]);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAdminData().then(() => setRefreshing(false));
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return Shield;
      case 'developer': return Code;
      case 'creator': return Crown;
      default: return Users;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return Colors.powerPink;
      case 'developer': return Colors.charcoal;
      case 'creator': return Colors.gold;
      default: return Colors.softDark;
    }
  };

  const renderOverview = () => (
    <ScrollView 
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.deepPink} />}
    >
      {/* Stats Cards */}
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: Colors.deepPink }]}>
          <Ionicons name="code-slash" size={20} color={Colors.white} />
          <Text style={styles.statNumber}>{stats?.totalUsers.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Total Users</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: Colors.sageGreen }]}>
          <Ionicons name="bag" size={24} color={Colors.deepPink} />
          <Text style={styles.statNumber}>{stats?.totalListings.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Listings</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: Colors.gold }]}>
          <Ionicons name="cash" size={24} color={Colors.deepPink} />
          <Text style={styles.statNumber}>${stats?.revenueToday.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Revenue Today</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: Colors.charcoal }]}>
          <Ionicons name="pulse" size={24} color={Colors.deepPink} />
          <Text style={styles.statNumber}>{stats?.activeTransactions}</Text>
          <Text style={styles.statLabel}>Active Deals</Text>
        </View>
      </View>

      {/* System Health */}
      <View style={styles.healthCard}>
        <View style={styles.healthHeader}>
          <Ionicons name="server" size={24} color={Colors.deepPink} />
          <Text style={styles.sectionTitle}>System Health</Text>
          <View style={[styles.healthBadge, { backgroundColor: Colors.sageGreen }]}>
            <Text style={styles.healthText}>HEALTHY</Text>
          </View>
        </View>
        <View style={styles.healthMetrics}>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>99.9%</Text>
            <Text style={styles.metricLabel}>Uptime</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>45ms</Text>
            <Text style={styles.metricLabel}>Latency</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>2.1%</Text>
            <Text style={styles.metricLabel}>CPU Usage</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsCard}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity style={styles.actionItem}>
            <View style={[styles.actionIcon, { backgroundColor: Colors.softPink }]}>
              <Ionicons name="shield-checkmark" size={24} color={Colors.deepPink} />
            </View>
            <Text style={styles.actionLabel}>Moderate</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionItem}>
            <View style={[styles.actionIcon, { backgroundColor: Colors.softPink }]}>
              <Ionicons name="server" size={24} color={Colors.deepPink} />
            </View>
            <Text style={styles.actionLabel}>Database</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionItem}>
            <View style={[styles.actionIcon, { backgroundColor: Colors.softPink }]}>
              <Ionicons name="bar-chart" size={24} color={Colors.deepPink} />
            </View>
            <Text style={styles.actionLabel}>Analytics</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionItem}>
            <View style={[styles.actionIcon, { backgroundColor: Colors.softPink }]}>
              <Ionicons name="settings" size={24} color={Colors.charcoal} />
            </View>
            <Text style={styles.actionLabel}>Settings</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Flagged Content Alert */}
      {stats && stats.flaggedContent > 0 && (
        <TouchableOpacity style={styles.alertCard}>
          <Ionicons name="warning" size={20} color={Colors.error} />
          <View style={styles.alertContent}>
            <Text style={styles.alertTitle}>{stats.flaggedContent} Items Flagged</Text>
            <Text style={styles.alertSubtitle}>Requires review and action</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.powerPink} />
        </TouchableOpacity>
      )}
    </ScrollView>
  );

  const renderUsers = () => (
    <FlatList
      data={users}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContainer}
      renderItem={({ item }) => {
        const RoleIcon = getRoleIcon(item.role);
        return (
          <View style={styles.userCard}>
            <Image source={{ uri: item.avatar }} style={styles.userAvatar} />
            <View style={styles.userInfo}>
              <View style={styles.userHeader}>
                <Text style={styles.userName}>{item.username}</Text>
                <View style={[styles.roleBadge, { backgroundColor: getRoleColor(item.role) + '20' }]}>
                  <Ionicons name={RoleIcon} size={12} color={getRoleColor(item.role)} />
                  <Text style={[styles.roleText, { color: getRoleColor(item.role) }]}>
                    {item.role.toUpperCase()}
                  </Text>
                </View>
              </View>
              <Text style={styles.userEmail}>{item.email}</Text>
              <View style={styles.userMeta}>
                <Text style={styles.metaText}>{item.listings} listings</Text>
                <Text style={styles.metaText}>•</Text>
                <Text style={styles.metaText}>{item.sales} sales</Text>
                <Text style={styles.metaText}>•</Text>
                <Text style={styles.metaText}>{item.joinDate}</Text>
              </View>
            </View>
            <View style={styles.userActions}>
              <View style={[styles.statusBadge, { 
                backgroundColor: item.status === 'active' ? Colors.sageGreen + '20' : Colors.powerPink + '20' 
              }]}>
                <Text style={[styles.statusText, { 
                  color: item.status === 'active' ? Colors.sageGreen : Colors.powerPink 
                }]}>
                  {item.status.toUpperCase()}
                </Text>
              </View>
              <TouchableOpacity style={styles.moreButton}>
                <Ionicons name="ellipsis-vertical" size={20} color={Colors.deepPink} />
              </TouchableOpacity>
            </View>
          </View>
        );
      }}
    />
  );

  const renderListings = () => (
    <FlatList
      data={listings}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContainer}
      renderItem={({ item }) => (
        <View style={styles.listingCard}>
          <Image source={{ uri: item.imageUrl }} style={styles.listingImage} />
          <View style={styles.listingInfo}>
            <Text style={styles.listingTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.listingPrice}>${item.price}</Text>
            <Text style={styles.listingSeller}>by {item.seller}</Text>
            <Text style={styles.listingTime}>{item.createdAt}</Text>
          </View>
          <View style={styles.listingActions}>
            <View style={[styles.statusBadge, { 
              backgroundColor: item.status === 'active' ? Colors.sageGreen + '20' : 
                              item.status === 'flagged' ? Colors.gold + '20' : Colors.powerPink + '20'
            }]}>
              <Text style={[styles.statusText, { 
                color: item.status === 'active' ? Colors.sageGreen : 
                       item.status === 'flagged' ? Colors.gold : Colors.powerPink
              }]}>
                {item.status.toUpperCase()}
              </Text>
            </View>
            <View style={styles.actionButtons}>
              {item.status === 'flagged' && (
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: Colors.sageGreen }]}>
                  <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
                </TouchableOpacity>
              )}
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: Colors.powerPink }]}>
                <Ionicons name="close-circle" size={20} color={Colors.error} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    />
  );

  const renderSystem = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.systemCard}>
        <View style={styles.systemHeader}>
          <Ionicons name="code" size={24} color={Colors.deepPink} />
          <Text style={styles.sectionTitle}>Developer Tools</Text>
        </View>
        
        <View style={styles.toolList}>
          <TouchableOpacity style={styles.toolItem}>
            <Ionicons name="database" size={20} color={Colors.softDark} />
            <Text style={styles.toolText}>Database Console</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.lightGray} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolItem}>
            <Ionicons name="server" size={20} color={Colors.softDark} />
            <Text style={styles.toolText}>API Logs</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.lightGray} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolItem}>
            <Ionicons name="activity" size={20} color={Colors.softDark} />
            <Text style={styles.toolText}>Performance Monitor</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.lightGray} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolItem}>
            <Ionicons name="trash" size={20} color={Colors.error} />
            <Text style={[styles.toolText, { color: Colors.powerPink }]}>Clear Cache</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.powerPink} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.systemCard}>
        <View style={styles.systemHeader}>
          <Ionicons name="settings" size={24} color={Colors.charcoal} />
          <Text style={styles.sectionTitle}>Configuration</Text>
        </View>
        
        <View style={styles.configList}>
          <View style={styles.configItem}>
            <Text style={styles.configLabel}>App Version</Text>
            <Text style={styles.configValue}>2.1.0</Text>
          </View>
          <View style={styles.configItem}>
            <Text style={styles.configLabel}>API Endpoint</Text>
            <Text style={styles.configValue}>api.bloom.app/v2</Text>
          </View>
          <View style={styles.configItem}>
            <Text style={styles.configLabel}>Database</Text>
            <Text style={styles.configValue}>MongoDB Atlas</Text>
          </View>
          <View style={styles.configItem}>
            <Text style={styles.configLabel}>Environment</Text>
            <Text style={[styles.configValue, { color: Colors.sageGreen }]}>Production</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Admin Dashboard</Text>
          <Text style={styles.headerSubtitle}>Creator & Developer Tools</Text>
        </View>
        <View style={styles.adminBadge}>
          <Ionicons name="shield-checkmark" size={20} color={Colors.white} />
          <Text style={styles.adminText}>ADMIN</Text>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
          {['overview', 'users', 'listings', 'system'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab as any)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'users' && renderUsers()}
        {activeTab === 'listings' && renderListings()}
        {activeTab === 'system' && renderSystem()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.blushWhite,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.charcoal,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.softDark,
    marginTop: 2,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.powerPink,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  adminText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  tabContainer: {
    marginTop: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.softPink,
  },
  tabScroll: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  tabActive: {
    borderBottomWidth: 3,
    borderBottomColor: Colors.deepPink,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.softDark,
    textTransform: 'capitalize',
  },
  tabTextActive: {
    color: Colors.deepPink,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  statCard: {
    width: (width - Spacing.lg * 2 - Spacing.md) / 2,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.white,
    marginTop: Spacing.sm,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  healthCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    shadowColor: Colors.charcoal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  healthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: Colors.charcoal,
  },
  healthBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  healthText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  healthMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.softPink,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.charcoal,
  },
  metricLabel: {
    fontSize: 12,
    color: Colors.softDark,
    marginTop: 4,
  },
  quickActionsCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    shadowColor: Colors.charcoal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
  },
  actionItem: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  actionIcon: {
    width: 60,
    height: 60,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.softDark,
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.powerPink + '10',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.powerPink + '30',
    gap: Spacing.md,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.powerPink,
  },
  alertSubtitle: {
    fontSize: 13,
    color: Colors.softDark,
    marginTop: 2,
  },
  listContainer: {
    gap: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    shadowColor: Colors.charcoal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  userInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.charcoal,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '700',
  },
  userEmail: {
    fontSize: 13,
    color: Colors.softDark,
    marginTop: 2,
  },
  userMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: 4,
  },
  metaText: {
    fontSize: 12,
    color: Colors.lightGray,
  },
  userActions: {
    alignItems: 'flex-end',
    gap: Spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  moreButton: {
    padding: 4,
  },
  listingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    shadowColor: Colors.charcoal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  listingImage: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.md,
  },
  listingInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  listingTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.charcoal,
  },
  listingPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.deepPink,
    marginTop: 2,
  },
  listingSeller: {
    fontSize: 12,
    color: Colors.softDark,
    marginTop: 2,
  },
  listingTime: {
    fontSize: 11,
    color: Colors.lightGray,
    marginTop: 2,
  },
  listingActions: {
    alignItems: 'flex-end',
    gap: Spacing.sm,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  systemCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    shadowColor: Colors.charcoal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  systemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  toolList: {
    gap: Spacing.sm,
  },
  toolItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.softPink,
  },
  toolText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: Colors.charcoal,
  },
  configList: {
    gap: Spacing.md,
    paddingTop: Spacing.md,
  },
  configItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  configLabel: {
    fontSize: 14,
    color: Colors.softDark,
  },
  configValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.charcoal,
  },
});

export default AdminDashboardScreen;
