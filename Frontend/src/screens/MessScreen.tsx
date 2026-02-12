import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  Dimensions,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../theme';
import ChatScreen from './ChatScreen';

const { width } = Dimensions.get('window');

type ChatType = 'marketplace' | 'groupbuy';

interface Chat {
  id: string;
  type: ChatType;
  title: string;
  participants: {
    id: string;
    name: string;
    avatar: string;
    isOnline: boolean;
  }[];
  lastMessage: {
    text: string;
    sender: string;
    timestamp: string;
    isRead: boolean;
  };
  unreadCount: number;
  relatedItem?: {
    id: string;
    title: string;
    price: number;
    imageUrl: string;
    status: 'available' | 'sold' | 'reserved';
  };
  groupBuyInfo?: {
    item: string;
    spotsLeft: number;
    totalSpots: number;
    endTime: string;
  };
}

const MessScreen: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'marketplace' | 'groupbuy'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = () => {
    // Mock chat data
    setChats([
      {
        id: '1',
        type: 'marketplace',
        title: 'Sarah Chen',
        participants: [
          {
            id: '1',
            name: 'Sarah Chen',
            avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
            isOnline: true,
          }
        ],
        lastMessage: {
          text: 'Yes! Would you like to see more photos?',
          sender: 'Sarah Chen',
          timestamp: '2m',
          isRead: false,
        },
        unreadCount: 2,
        relatedItem: {
          id: 'item1',
          title: 'KitchenAid Mixer',
          price: 120,
          imageUrl: 'https://images.unsplash.com/photo-1556910103-1c02745a30bf?w=200',
          status: 'available',
        },
      },
      {
        id: '2',
        type: 'groupbuy',
        title: 'Costco Diaper Run',
        participants: [
          { id: '1', name: 'You', avatar: 'https://randomuser.me/api/portraits/women/1.jpg', isOnline: true },
          { id: '2', name: 'Emma W.', avatar: 'https://randomuser.me/api/portraits/women/68.jpg', isOnline: false },
          { id: '3', name: 'Lisa J.', avatar: 'https://randomuser.me/api/portraits/women/55.jpg', isOnline: true },
          { id: '4', name: 'Mike C.', avatar: 'https://randomuser.me/api/portraits/men/32.jpg', isOnline: false },
        ],
        lastMessage: {
          text: 'We need 1 more person to get the discount!',
          sender: 'Emma W.',
          timestamp: '15m',
          isRead: true,
        },
        unreadCount: 0,
        groupBuyInfo: {
          item: 'Huggies Diapers Mega Pack',
          spotsLeft: 1,
          totalSpots: 8,
          endTime: '2h 30m',
        },
      },
      {
        id: '3',
        type: 'marketplace',
        title: 'Alex Martinez',
        participants: [
          {
            id: '3',
            name: 'Alex Martinez',
            avatar: 'https://randomuser.me/api/portraits/men/85.jpg',
            isOnline: false,
          }
        ],
        lastMessage: {
          text: 'Perfect, see you Saturday at 2pm!',
          sender: 'You',
          timestamp: '1h',
          isRead: true,
        },
        unreadCount: 0,
        relatedItem: {
          id: 'item2',
          title: 'Vintage Coffee Table',
          price: 220,
          imageUrl: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=200',
          status: 'reserved',
        },
      },
      {
        id: '4',
        type: 'groupbuy',
        title: 'Organic Baby Food Co-op',
        participants: [
          { id: '1', name: 'You', avatar: 'https://randomuser.me/api/portraits/women/1.jpg', isOnline: true },
          { id: '5', name: 'Michelle P.', avatar: 'https://randomuser.me/api/portraits/women/33.jpg', isOnline: true },
          { id: '6', name: 'David K.', avatar: 'https://randomuser.me/api/portraits/men/41.jpg', isOnline: false },
        ],
        lastMessage: {
          text: 'The order will be ready for pickup on Friday',
          sender: 'Michelle P.',
          timestamp: '3h',
          isRead: false,
        },
        unreadCount: 1,
        groupBuyInfo: {
          item: 'Gerber Organic Pouches',
          spotsLeft: 4,
          totalSpots: 12,
          endTime: '5h 15m',
        },
      },
      {
        id: '5',
        type: 'marketplace',
        title: 'Emma Williams',
        participants: [
          {
            id: '5',
            name: 'Emma Williams',
            avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
            isOnline: true,
          }
        ],
        lastMessage: {
          text: 'Is this still available?',
          sender: 'Emma Williams',
          timestamp: 'Yesterday',
          isRead: true,
        },
        unreadCount: 0,
        relatedItem: {
          id: 'item3',
          title: 'Kids Books Bundle',
          price: 35,
          imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=200',
          status: 'sold',
        },
      },
    ]);
  };

  const filteredChats = chats.filter(chat => {
    if (activeFilter === 'all') return true;
    return chat.type === activeFilter;
  });

  const renderFilterTabs = () => (
    <View style={styles.filterContainer}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScroll}
      >
        <TouchableOpacity 
          style={[styles.filterTab, activeFilter === 'all' && styles.filterTabActive]}
          onPress={() => setActiveFilter('all')}
        >
          <Ionicons name="chatbubble" size={16} color={activeFilter === 'all' ? Colors.white : Colors.softDark} />
          <Text style={[styles.filterText, activeFilter === 'all' && styles.filterTextActive]}>
            All Chats
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.filterTab, activeFilter === 'marketplace' && styles.filterTabActive]}
          onPress={() => setActiveFilter('marketplace')}
        >
          <Ionicons name="storefront" size={16} color={activeFilter === 'marketplace' ? Colors.white : Colors.softDark} />
          <Text style={[styles.filterText, activeFilter === 'marketplace' && styles.filterTextActive]}>
            Marketplace
          </Text>
          <View style={styles.filterBadge}>
            <Text style={styles.filterBadgeText}>2</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.filterTab, activeFilter === 'groupbuy' && styles.filterTabActive]}
          onPress={() => setActiveFilter('groupbuy')}
        >
          <Ionicons name="cart" size={16} color={activeFilter === 'groupbuy' ? Colors.white : Colors.softDark} />
          <Text style={[styles.filterText, activeFilter === 'groupbuy' && styles.filterTextActive]}>
            Group-Buys
          </Text>
          <View style={styles.filterBadge}>
            <Text style={styles.filterBadgeText}>1</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  const renderProductCard = (item: Chat['relatedItem'], type: ChatType) => {
    if (!item) return null;

    const statusColors = {
      available: Colors.sageGreen,
      reserved: Colors.gold,
      sold: Colors.lightGray,
    };

    return (
      <View style={styles.productCard}>
        <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
        <View style={styles.productInfo}>
          <Text style={styles.productTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.productPrice}>${item.price}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColors[item.status] }]}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>
    );
  };

  const renderGroupBuyInfo = (info: Chat['groupBuyInfo']) => {
    if (!info) return null;

    return (
      <View style={styles.groupBuyBar}>
        <View style={styles.groupBuyIcon}>
          <Ionicons name="cart" size={14} color={Colors.deepPink} />
        </View>
        <View style={styles.groupBuyText}>
          <Text style={styles.groupBuyItem} numberOfLines={1}>{info.item}</Text>
          <View style={styles.groupBuyMeta}>
            <Ionicons name="storefront" size={12} color={Colors.deepPink} />
            <Text style={styles.spotsText}>{info.spotsLeft} spots left</Text>
            <Text style={styles.timeText}>• Ends {info.endTime}</Text>
          </View>
        </View>
        <View style={styles.progressIndicator}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${((info.totalSpots - info.spotsLeft) / info.totalSpots) * 100}%` }
              ]} 
            />
          </View>
        </View>
      </View>
    );
  };

  const renderChatItem = ({ item }: { item: Chat }) => {
    const isGroupBuy = item.type === 'groupbuy';

    return (
      <TouchableOpacity style={styles.chatCard} onPress={() => setSelectedChat(item.id)}>
        {/* Product/GroupBuy Info at Top */}
        {isGroupBuy 
          ? renderGroupBuyInfo(item.groupBuyInfo)
          : renderProductCard(item.relatedItem, item.type)
        }

        {/* Chat Participants Row */}
        <View style={styles.chatHeader}>
          <View style={styles.avatarStack}>
            {item.participants.slice(0, 3).map((participant, index) => (
              <Image 
                key={participant.id}
                source={{ uri: participant.avatar }} 
                style={[styles.avatar, { marginLeft: index > 0 ? -10 : 0, zIndex: 10 - index }]} 
              />
            ))}
            {item.participants.length > 3 && (
              <View style={styles.moreAvatar}>
                <Text style={styles.moreAvatarText}>+{item.participants.length - 3}</Text>
              </View>
            )}
          </View>
          
          <View style={styles.chatTitleSection}>
            <Text style={styles.chatTitle}>{item.title}</Text>
            <View style={styles.onlineRow}>
              {item.participants.some(p => p.isOnline) && (
                <View style={styles.onlineIndicator} />
              )}
              <Text style={styles.participantsText}>
                {item.participants.length} members
              </Text>
            </View>
          </View>
          
          <Text style={styles.timestamp}>{item.lastMessage.timestamp}</Text>
        </View>

        {/* Message Preview */}
        <View style={styles.messagePreview}>
          <Text style={styles.messageText} numberOfLines={2}>
            <Text style={styles.senderName}>{item.lastMessage.sender}: </Text>
            {item.lastMessage.text}
          </Text>
          
          <View style={styles.messageMeta}>
            <Ionicons name={item.lastMessage.isRead ? "checkmark-done" : "checkmark"} size={14} color={item.lastMessage.isRead ? Colors.deepPink : Colors.lightGray} />
            {item.unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{item.unreadCount}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
  );
};

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="chatbubble-ellipses-outline" size={48} color={Colors.lightGray} />
      <Text style={styles.emptyTitle}>No messages yet</Text>
      <Text style={styles.emptySubtitle}>Start a conversation or join a group buy to see messages here.</Text>
    </View>
  );

  if (selectedChat) {
    return (
      <ChatScreen 
        chatId={selectedChat} 
        onBack={() => setSelectedChat(null)} 
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>The Mess</Text>
          <Text style={styles.headerSubtitle}>Coordination & Trust</Text>
        </View>
        <TouchableOpacity style={styles.newChatButton}>
          <Ionicons name="add" size={24} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={Colors.lightGray} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search conversations..."
          placeholderTextColor={Colors.lightGray}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filter Tabs */}
      {renderFilterTabs()}

      {/* Chat List */}
      <FlatList
        data={filteredChats}
        renderItem={renderChatItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.chatList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
      />
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
  newChatButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.deepPink,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.deepPink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    shadowColor: Colors.charcoal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.charcoal,
  },
  filterContainer: {
    marginTop: Spacing.md,
  },
  filterScroll: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.softPink,
  },
  filterTabActive: {
    backgroundColor: Colors.deepPink,
    borderColor: Colors.deepPink,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.softDark,
  },
  filterTextActive: {
    color: Colors.white,
  },
  filterBadge: {
    backgroundColor: Colors.softPink,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 4,
  },
  filterBadgeText: {
    color: Colors.deepPink,
    fontSize: 11,
    fontWeight: '700',
  },
  chatList: {
    padding: Spacing.lg,
    paddingTop: Spacing.md,
    gap: Spacing.md,
  },
  chatCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    shadowColor: Colors.charcoal,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.blushWhite,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  productImage: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.sm,
  },
  productInfo: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.charcoal,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.deepPink,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  statusText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
  groupBuyBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.softPink,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  groupBuyIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupBuyText: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  groupBuyItem: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.charcoal,
  },
  groupBuyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  spotsText: {
    fontSize: 12,
    color: Colors.deepPink,
    fontWeight: '600',
  },
  timeText: {
    fontSize: 12,
    color: Colors.lightGray,
  },
  progressIndicator: {
    width: 40,
    alignItems: 'center',
  },
  progressBar: {
    width: 40,
    height: 4,
    backgroundColor: Colors.lightGray,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.deepPink,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  moreAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.softPink,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -10,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  moreAvatarText: {
    color: Colors.deepPink,
    fontSize: 12,
    fontWeight: '700',
  },
  chatTitleSection: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  chatTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.charcoal,
  },
  onlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  onlineIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.sageGreen,
  },
  participantsText: {
    fontSize: 12,
    color: Colors.lightGray,
  },
  timestamp: {
    fontSize: 12,
    color: Colors.lightGray,
  },
  messagePreview: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  messageText: {
    flex: 1,
    fontSize: 14,
    color: Colors.softDark,
    lineHeight: 20,
  },
  senderName: {
    fontWeight: '600',
    color: Colors.charcoal,
  },
  messageMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  unreadBadge: {
    backgroundColor: Colors.deepPink,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.charcoal,
    marginTop: Spacing.md,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.softDark,
    textAlign: 'center',
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.xl,
  },
});

export default MessScreen;
