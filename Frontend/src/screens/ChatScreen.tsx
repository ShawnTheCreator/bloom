import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../theme';

const { width, height } = Dimensions.get('window');

type MessageType = 'text' | 'image' | 'location' | 'item' | 'voice';

interface Message {
  id: string;
  senderId: string;
  type: MessageType;
  content: string;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read';
  metadata?: {
    imageUrl?: string;
    latitude?: number;
    longitude?: number;
    itemTitle?: string;
    itemPrice?: number;
    itemImage?: string;
    duration?: number; // voice message duration
  };
  reactions?: string[];
}

interface ChatThread {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
  lastSeen?: string;
  type: 'direct' | 'group';
  participants?: number;
  relatedItem?: {
    id: string;
    title: string;
    price: number;
    image: string;
    status: 'available' | 'sold' | 'reserved';
  };
}

interface ChatScreenProps {
  chatId?: string;
  onBack?: () => void;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ chatId = '1', onBack }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [chatInfo, setChatInfo] = useState<ChatThread | null>(null);
  const [showItemCard, setShowItemCard] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);

  const currentUserId = 'current_user';

  useEffect(() => {
    loadChatData();
  }, [chatId]);

  const loadChatData = () => {
    // Mock chat data
    setChatInfo({
      id: chatId,
      name: 'Sarah Chen',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      isOnline: true,
      lastSeen: '2 minutes ago',
      type: 'direct',
      relatedItem: {
        id: 'item1',
        title: 'KitchenAid Stand Mixer',
        price: 120,
        image: 'https://images.unsplash.com/photo-1556910103-1c02745a30bf?w=400',
        status: 'available',
      },
    });

    setMessages([
      {
        id: '1',
        senderId: 'other',
        type: 'item',
        content: 'Interested in this item?',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        status: 'read',
        metadata: {
          itemTitle: 'KitchenAid Stand Mixer',
          itemPrice: 120,
          itemImage: 'https://images.unsplash.com/photo-1556910103-1c02745a30bf?w=400',
        },
      },
      {
        id: '2',
        senderId: 'current_user',
        type: 'text',
        content: 'Hi! Yes, I\'m very interested in the mixer. Is it still available?',
        timestamp: new Date(Date.now() - 1000 * 60 * 45),
        status: 'read',
      },
      {
        id: '3',
        senderId: 'other',
        type: 'text',
        content: 'Yes, it\'s still available! It\'s in great condition - only used a few times.',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        status: 'read',
      },
      {
        id: '4',
        senderId: 'current_user',
        type: 'text',
        content: 'That\'s great! Would you be able to meet this weekend?',
        timestamp: new Date(Date.now() - 1000 * 60 * 20),
        status: 'read',
      },
      {
        id: '5',
        senderId: 'other',
        type: 'image',
        content: 'Here are more photos:',
        timestamp: new Date(Date.now() - 1000 * 60 * 15),
        status: 'read',
        metadata: {
          imageUrl: 'https://images.unsplash.com/photo-1556910103-1c02745a30bf?w=400',
        },
      },
      {
        id: '6',
        senderId: 'other',
        type: 'text',
        content: 'Yes! Would you like to see more photos?',
        timestamp: new Date(Date.now() - 1000 * 60 * 10),
        status: 'delivered',
      },
    ]);
  };

  const sendMessage = () => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: currentUserId,
      type: 'text',
      content: inputText,
      timestamp: new Date(),
      status: 'sent',
    };

    setMessages([...messages, newMessage]);
    setInputText('');

    // Simulate reply
    setTimeout(() => {
      const reply: Message = {
        id: (Date.now() + 1).toString(),
        senderId: 'other',
        type: 'text',
        content: 'Thanks for your message! I\'ll get back to you soon.',
        timestamp: new Date(),
        status: 'sent',
      };
      setMessages(prev => [...prev, reply]);
    }, 2000);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const renderStatusIcon = (status: string) => {
    if (status === 'read') {
      return <Ionicons name="checkmark-done" size={14} color={Colors.deepPink} />;
    } else if (status === 'delivered') {
      return <Ionicons name="checkmark" size={14} color={Colors.lightGray} />;
    }
    return <Ionicons name="time" size={14} color={Colors.lightGray} />;
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isMe = item.senderId === currentUserId;
    const showAvatar = !isMe && (index === 0 || messages[index - 1].senderId !== item.senderId);

    // Check if we need to show date header
    const showDateHeader = index === 0 || 
      formatDate(messages[index - 1].timestamp) !== formatDate(item.timestamp);

    return (
      <View>
        {showDateHeader && (
          <View style={styles.dateHeader}>
            <Text style={styles.dateText}>{formatDate(item.timestamp)}</Text>
          </View>
        )}
        
        <View style={[styles.messageContainer, isMe ? styles.myMessage : styles.theirMessage]}>
          {!isMe && showAvatar && (
            <Image source={{ uri: chatInfo?.avatar }} style={styles.messageAvatar} />
          )}
          {!isMe && !showAvatar && <View style={styles.avatarPlaceholder} />}

          <View style={[
            styles.messageBubble,
            isMe ? styles.myBubble : styles.theirBubble,
            item.type === 'image' && styles.imageBubble,
          ]}>
            {item.type === 'text' && (
              <Text style={[styles.messageText, isMe && styles.myMessageText]}>
                {item.content}
              </Text>
            )}

            {item.type === 'image' && item.metadata?.imageUrl && (
              <Image source={{ uri: item.metadata.imageUrl }} style={styles.messageImage} />
            )}

            {item.type === 'item' && item.metadata && (
              <View style={styles.itemCardInMessage}>
                <Image source={{ uri: item.metadata.itemImage }} style={styles.itemCardImage} />
                <View style={styles.itemCardInfo}>
                  <Text style={styles.itemCardTitle} numberOfLines={1}>
                    {item.metadata.itemTitle}
                  </Text>
                  <Text style={styles.itemCardPrice}>${item.metadata.itemPrice}</Text>
                </View>
              </View>
            )}

            <View style={styles.messageFooter}>
              <Text style={[styles.messageTime, isMe && styles.myMessageTime]}>
                {formatTime(item.timestamp)}
              </Text>
              {isMe && renderStatusIcon(item.status)}
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderItemCard = () => {
    if (!chatInfo?.relatedItem || !showItemCard) return null;

    const { relatedItem } = chatInfo;
    const statusColors = {
      available: Colors.sageGreen,
      reserved: Colors.gold,
      sold: Colors.lightGray,
    };

    return (
      <View style={styles.itemCard}>
        <TouchableOpacity 
          style={styles.itemCardClose}
          onPress={() => setShowItemCard(false)}
        >
          <Ionicons name="close" size={16} color={Colors.white} />
        </TouchableOpacity>
        <Image source={{ uri: relatedItem.image }} style={styles.itemCardMainImage} />
        <View style={styles.itemCardOverlay}>
          <View style={styles.itemCardContent}>
            <Text style={styles.itemCardMainTitle} numberOfLines={1}>{relatedItem.title}</Text>
            <View style={styles.itemCardRow}>
              <Text style={styles.itemCardMainPrice}>${relatedItem.price}</Text>
              <View style={[styles.itemStatusBadge, { backgroundColor: statusColors[relatedItem.status] }]}>
                <Text style={styles.itemStatusText}>{relatedItem.status.toUpperCase()}</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity style={styles.buyButton}>
            <Ionicons name="heart" size={16} color={Colors.white} />
            <Text style={styles.buyButtonText}>Make Offer</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{chatInfo?.name}</Text>
          <View style={styles.onlineRow}>
            {chatInfo?.isOnline ? (
              <>
                <View style={styles.onlineDot} />
                <Text style={styles.onlineText}>Online</Text>
              </>
            ) : (
              <Text style={styles.lastSeen}>Last seen {chatInfo?.lastSeen}</Text>
            )}
          </View>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="call" size={20} color={Colors.deepPink} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="videocam" size={20} color={Colors.deepPink} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="ellipsis-vertical" size={20} color={Colors.charcoal} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Related Item Card */}
      {renderItemCard()}

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Input Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachButton}>
            <Ionicons name="attach" size={24} color={Colors.deepPink} />
          </TouchableOpacity>
          
          <View style={styles.inputWrapper}>
            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder="Type a message..."
              placeholderTextColor={Colors.lightGray}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={1000}
            />
            <TouchableOpacity style={styles.emojiButton}>
              <Ionicons name="happy" size={24} color={Colors.deepPink} />
            </TouchableOpacity>
          </View>

          {inputText.trim() ? (
            <TouchableOpacity 
              style={styles.sendButton}
              onPress={sendMessage}
            >
              <Ionicons name="send" size={24} color={Colors.white} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.micButton}
              onPressIn={() => setIsRecording(true)}
              onPressOut={() => setIsRecording(false)}
            >
              <Ionicons name="mic" size={24} color={Colors.white} />
            </TouchableOpacity>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickAction}>
            <Ionicons name="camera" size={20} color={Colors.deepPink} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction}>
            <Ionicons name="location" size={20} color={Colors.deepPink} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction}>
            <Ionicons name="cube" size={20} color={Colors.deepPink} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Recording Overlay */}
      {isRecording && (
        <View style={styles.recordingOverlay}>
          <View style={styles.recordingIndicator}>
            <View style={styles.recordingDot} />
            <Text style={styles.recordingText}>Recording...</Text>
          </View>
        </View>
      )}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.softPink,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    padding: Spacing.sm,
    marginRight: Spacing.sm,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  headerInfo: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  headerName: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.charcoal,
  },
  onlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.sageGreen,
    marginRight: 6,
  },
  onlineText: {
    fontSize: 13,
    color: Colors.sageGreen,
  },
  lastSeen: {
    fontSize: 13,
    color: Colors.lightGray,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  headerButton: {
    padding: Spacing.sm,
  },
  itemCard: {
    margin: Spacing.md,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    backgroundColor: Colors.charcoal,
    position: 'relative',
  },
  itemCardClose: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    zIndex: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemCardMainImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  itemCardOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.charcoal,
  },
  itemCardContent: {
    flex: 1,
  },
  itemCardMainTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.white,
  },
  itemCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: 4,
  },
  itemCardMainPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.deepPink,
  },
  itemStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  itemStatusText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
  buyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.deepPink,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  buyButtonText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '600',
  },
  messagesList: {
    padding: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  dateHeader: {
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  dateText: {
    fontSize: 12,
    color: Colors.lightGray,
    backgroundColor: Colors.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
    alignItems: 'flex-end',
  },
  myMessage: {
    justifyContent: 'flex-end',
  },
  theirMessage: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: Spacing.sm,
  },
  avatarPlaceholder: {
    width: 28,
    marginRight: Spacing.sm,
  },
  messageBubble: {
    maxWidth: width * 0.75,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  myBubble: {
    backgroundColor: Colors.deepPink,
    borderBottomRightRadius: 4,
  },
  theirBubble: {
    backgroundColor: Colors.white,
    borderBottomLeftRadius: 4,
  },
  imageBubble: {
    padding: 4,
  },
  messageText: {
    fontSize: 15,
    color: Colors.charcoal,
    lineHeight: 20,
  },
  myMessageText: {
    color: Colors.white,
  },
  messageImage: {
    width: width * 0.65,
    height: 200,
    borderRadius: BorderRadius.md,
  },
  itemCardInMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.blushWhite,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  itemCardImage: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.sm,
  },
  itemCardInfo: {
    marginLeft: Spacing.sm,
    flex: 1,
  },
  itemCardTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.charcoal,
  },
  itemCardPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.deepPink,
    marginTop: 2,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
    gap: 4,
  },
  messageTime: {
    fontSize: 11,
    color: Colors.lightGray,
  },
  myMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.softPink,
  },
  attachButton: {
    padding: Spacing.sm,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.blushWhite,
    borderRadius: BorderRadius.full,
    marginHorizontal: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.charcoal,
    maxHeight: 100,
    paddingVertical: 4,
  },
  emojiButton: {
    padding: Spacing.xs,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.deepPink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.deepPink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.xl,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.white,
  },
  quickAction: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.softPink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingIndicator: {
    backgroundColor: Colors.deepPink,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.white,
  },
  recordingText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ChatScreen;
