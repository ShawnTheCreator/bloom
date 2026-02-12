import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../theme';

const { width } = Dimensions.get('window');

interface Transaction {
  id: string;
  type: 'sale' | 'purchase';
  item: string;
  amount: number;
  status: 'completed' | 'pending' | 'shipping';
  date: string;
  imageUrl: string;
}

interface BalanceStats {
  totalEarnings: number;
  availableBalance: number;
  pendingBalance: number;
  commissionEarnings: number;
  monthlyGrowth: number;
}

const VaultScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'buying' | 'selling'>('selling');
  const [balance, setBalance] = useState<BalanceStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isMamaPro, setIsMamaPro] = useState(true);
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Simulate data fetch
    setBalance({
      totalEarnings: 2847,
      availableBalance: 1250,
      pendingBalance: 487,
      commissionEarnings: 156,
      monthlyGrowth: 12.5,
    });

    setTransactions([
      {
        id: '1',
        type: 'sale',
        item: 'KitchenAid Mixer',
        amount: 85,
        status: 'completed',
        date: '2 hours ago',
        imageUrl: 'https://images.unsplash.com/photo-1556910103-1c02745a30bf?w=200',
      },
      {
        id: '2',
        type: 'sale',
        item: 'Office Chair',
        amount: 180,
        status: 'shipping',
        date: 'Yesterday',
        imageUrl: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=200',
      },
      {
        id: '3',
        type: 'purchase',
        item: 'Educational Books Bundle',
        amount: 35,
        status: 'completed',
        date: '3 days ago',
        imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=200',
      },
      {
        id: '4',
        type: 'sale',
        item: 'Coffee Table',
        amount: 220,
        status: 'pending',
        date: '1 week ago',
        imageUrl: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=200',
      },
    ]);

    // Animate balance counter
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: false,
    }).start();
  }, []);

  const renderEarningsCard = () => {
    const displayBalance = balance?.availableBalance || 0;
    
    return (
      <View style={styles.earningsCard}>
        <View style={styles.earningsHeader}>
          <View style={styles.walletIconContainer}>
            <Ionicons name="diamond" size={24} color={Colors.white} />
          </View>
          <View>
            <Text style={styles.earningsLabel}>Available Balance</Text>
            <Animated.Text style={styles.earningsAmount}>
              ${animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [0, displayBalance],
              }).__getValue?.() || displayBalance}
            </Animated.Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Total Earnings</Text>
            <Text style={styles.statValue}>${balance?.totalEarnings || 0}</Text>
            <View style={styles.growthIndicator}>
              <Ionicons name="arrow-forward" size={20} color={Colors.deepPink} />
              <Text style={styles.growthText}>+{balance?.monthlyGrowth}%</Text>
            </View>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Pending</Text>
            <Text style={styles.statValue}>${balance?.pendingBalance || 0}</Text>
            <Text style={styles.pendingText}>Clearing soon</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Commissions</Text>
            <Text style={styles.statValue}>${balance?.commissionEarnings || 0}</Text>
            <Text style={styles.commissionText}>From referrals</Text>
          </View>
        </View>

        {/* Quick Actions - Thumb Zone */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="arrow-back" size={20} color={Colors.deepPink} />
            <Text style={styles.actionText}>Withdraw</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="cube" size={20} color={Colors.deepPink} />
            <Text style={styles.actionText}>Instant Pay</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderMamaProCard = () => (
    <View style={[styles.mamaProCard, isMamaPro && styles.mamaProActive]}>
      <View style={styles.mamaProHeader}>
        <View style={styles.crownContainer}>
          <Ionicons name="ribbon" size={28} color={isMamaPro ? Colors.gold : Colors.lightGray} />
        </View>
        <View style={styles.mamaProTitleSection}>
          <Text style={styles.mamaProTitle}>
            {isMamaPro ? 'MamaPro Active' : 'Upgrade to MamaPro'}
          </Text>
          <Text style={styles.mamaProSubtitle}>
            {isMamaPro 
              ? 'Premium benefits unlocked' 
              : 'Boost earnings by 40%'}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={isMamaPro ? Colors.white : Colors.softDark} />
      </View>

      {isMamaPro && (
        <View style={styles.benefitsRow}>
          <View style={styles.benefitItem}>
            <Ionicons name="shield-checkmark" size={24} color={Colors.white} />
            <Text style={styles.benefitText}>0% fees</Text>
          </View>
          <View style={styles.benefitItem}>
            <Ionicons name="flash" size={24} color={Colors.white} />
            <Text style={styles.benefitText}>Instant pay</Text>
          </View>
          <View style={styles.benefitItem}>
            <Ionicons name="star" size={24} color={Colors.white} />
            <Text style={styles.benefitText}>Featured listings</Text>
          </View>
        </View>
      )}

      {!isMamaPro && (
        <TouchableOpacity style={styles.upgradeButton}>
          <Text style={styles.upgradeText}>Upgrade $9.99/mo</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderOrderTabs = () => (
    <View style={styles.tabsContainer}>
      <TouchableOpacity 
        style={[styles.tab, activeTab === 'buying' && styles.activeTab]}
        onPress={() => setActiveTab('buying')}
      >
        <Ionicons name="cart" size={18} color={activeTab === 'buying' ? Colors.deepPink : Colors.softDark} />
        <Text style={[styles.tabText, activeTab === 'buying' && styles.activeTabText]}>
          Buying
        </Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>2</Text>
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.tab, activeTab === 'selling' && styles.activeTab]}
        onPress={() => setActiveTab('selling')}
      >
        <Ionicons name="briefcase" size={18} color={activeTab === 'selling' ? Colors.deepPink : Colors.softDark} />
        <Text style={[styles.tabText, activeTab === 'selling' && styles.activeTabText]}>
          Selling
        </Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>3</Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderTransactionItem = (transaction: Transaction) => {
    const isSale = transaction.type === 'sale';
    const statusColors = {
      completed: Colors.sageGreen,
      pending: Colors.gold,
      shipping: Colors.deepPink,
    };

    const StatusIcon = {
      completed: Ionicons,
      pending: Ionicons,
      shipping: Ionicons,
    }[transaction.status];

    return (
      <TouchableOpacity key={transaction.id} style={styles.transactionCard}>
        <Image source={{ uri: transaction.imageUrl }} style={styles.transactionImage} />
        <View style={styles.transactionContent}>
          <View style={styles.transactionTop}>
            <Text style={styles.transactionItem}>{transaction.item}</Text>
            <Text style={[styles.transactionAmount, isSale && styles.saleAmount]}>
              {isSale ? '+' : '-'}${transaction.amount}
            </Text>
          </View>
          <View style={styles.transactionBottom}>
            <View style={styles.statusRow}>
              <Ionicons name={transaction.status === 'completed' ? 'checkmark-circle' : transaction.status === 'pending' ? 'time' : 'train'} size={14} color={statusColors[transaction.status]} />
              <Text style={[styles.statusText, { color: statusColors[transaction.status] }]}>
                {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
              </Text>
            </View>
            <Text style={styles.transactionDate}>{transaction.date}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderActiveListings = () => (
    <View style={styles.listingsSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Active Listings</Text>
        <TouchableOpacity>
          <Text style={styles.manageText}>Manage</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.listingsScroll}>
        {transactions
          .filter(t => t.type === 'sale' && t.status !== 'completed')
          .map((listing) => (
            <TouchableOpacity key={listing.id} style={styles.listingCard}>
              <Image source={{ uri: listing.imageUrl }} style={styles.listingImage} />
              <View style={styles.listingOverlay}>
                <Text style={styles.listingPrice}>${listing.amount}</Text>
                <View style={styles.listingViews}>
                  <Ionicons name="trending-up" size={24} color={Colors.white} />
                  <Text style={styles.listingViewsText}>12 views</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>The Vault</Text>
          <Text style={styles.headerSubtitle}>Wallet & Management</Text>
        </View>

        {/* Earnings Dashboard */}
        {renderEarningsCard()}

        {/* MamaPro Status */}
        {renderMamaProCard()}

        {/* Active Listings Preview */}
        {renderActiveListings()}

        {/* Order Tracking Tabs */}
        {renderOrderTabs()}

        {/* Transaction List */}
        <View style={styles.transactionsList}>
          {transactions
            .filter(t => t.type === activeTab.slice(0, -3))
            .map(renderTransactionItem)}
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Action - Thumb Zone */}
      <TouchableOpacity style={styles.withdrawButton}>
        <Ionicons name="wallet-outline" size={24} color={Colors.white} />
        <Text style={styles.withdrawText}>Withdraw Funds</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.blushWhite,
  },
  header: {
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
  scrollContent: {
    paddingBottom: 120,
  },
  earningsCard: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    backgroundColor: Colors.deepPink,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    shadowColor: Colors.deepPink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
  },
  earningsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  walletIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  earningsLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  earningsAmount: {
    color: Colors.white,
    fontSize: 36,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  statLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
  },
  statValue: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
  },
  growthIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 2,
  },
  growthText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  pendingText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 11,
    marginTop: 4,
  },
  commissionText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 11,
    marginTop: 4,
  },
  quickActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.white,
    paddingVertical: 12,
    borderRadius: BorderRadius.full,
  },
  actionText: {
    color: Colors.deepPink,
    fontSize: 14,
    fontWeight: '600',
  },
  mamaProCard: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    shadowColor: Colors.charcoal,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  mamaProActive: {
    backgroundColor: Colors.charcoal,
  },
  mamaProHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  crownContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  mamaProTitleSection: {
    flex: 1,
  },
  mamaProTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.charcoal,
  },
  mamaProSubtitle: {
    fontSize: 13,
    color: Colors.softDark,
    marginTop: 2,
  },
  benefitsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  benefitText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '500',
  },
  upgradeButton: {
    backgroundColor: Colors.gold,
    paddingVertical: 12,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  upgradeText: {
    color: Colors.charcoal,
    fontSize: 14,
    fontWeight: '700',
  },
  listingsSection: {
    marginTop: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.charcoal,
  },
  manageText: {
    color: Colors.deepPink,
    fontSize: 14,
    fontWeight: '600',
  },
  listingsScroll: {
    paddingLeft: Spacing.lg,
  },
  listingCard: {
    width: 120,
    height: 120,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginRight: Spacing.md,
    position: 'relative',
  },
  listingImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  listingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
    padding: Spacing.sm,
  },
  listingPrice: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  listingViews: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 2,
  },
  listingViewsText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 11,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    gap: Spacing.md,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    borderColor: Colors.softPink,
  },
  activeTab: {
    borderColor: Colors.deepPink,
    backgroundColor: Colors.softPink,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.softDark,
  },
  activeTabText: {
    color: Colors.deepPink,
  },
  badge: {
    backgroundColor: Colors.deepPink,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  transactionsList: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    gap: Spacing.md,
  },
  transactionCard: {
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
  transactionImage: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.md,
    marginRight: Spacing.md,
  },
  transactionContent: {
    flex: 1,
  },
  transactionTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionItem: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.charcoal,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.charcoal,
  },
  saleAmount: {
    color: Colors.sageGreen,
  },
  transactionBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  transactionDate: {
    fontSize: 12,
    color: Colors.lightGray,
  },
  withdrawButton: {
    position: 'absolute',
    bottom: Spacing.lg + 50,
    left: Spacing.lg,
    right: Spacing.lg,
    backgroundColor: Colors.deepPink,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: BorderRadius.full,
    gap: Spacing.sm,
    shadowColor: Colors.deepPink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  withdrawText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default VaultScreen;
