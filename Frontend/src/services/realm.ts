// MongoDB Atlas Realm Integration for React Native
// This file sets up the connection between your React Native app and Atlas

import Realm from 'realm';
import { ObjectId } from 'bson';

// ============================================
// REALM APP CONFIGURATION
// ============================================

const REALM_APP_ID = 'bloom-app-xyz'; // Replace with your Atlas App ID

export const app = new Realm.App({ id: REALM_APP_ID });

// ============================================
// REALM SCHEMAS (must match Atlas collection structure)
// ============================================

export const UserSchema = {
  name: 'User',
  primaryKey: '_id',
  properties: {
    _id: 'objectId',
    username: 'string',
    email: 'string',
    profile: 'Profile?',
    location: 'Location?',
    stats: 'UserStats?',
    subscription: 'Subscription?',
    preferences: 'Preferences?',
    createdAt: 'date?',
    updatedAt: 'date?'
  }
};

export const ProfileSchema = {
  name: 'Profile',
  embedded: true,
  properties: {
    firstName: 'string',
    lastName: 'string',
    avatar: 'string?',
    bio: 'string?',
    phone: 'string?'
  }
};

export const LocationSchema = {
  name: 'Location',
  embedded: true,
  properties: {
    type: 'string',
    coordinates: 'double[]',
    address: 'string',
    neighborhood: 'string?'
  }
};

export const UserStatsSchema = {
  name: 'UserStats',
  embedded: true,
  properties: {
    totalSaved: { type: 'int', default: 0 },
    itemsSold: { type: 'int', default: 0 },
    itemsBought: { type: 'int', default: 0 },
    co2SavedKg: { type: 'int', default: 0 },
    reputation: { type: 'int', default: 100 }
  }
};

export const SubscriptionSchema = {
  name: 'Subscription',
  embedded: true,
  properties: {
    isMamaPro: { type: 'bool', default: false },
    plan: 'string',
    expiresAt: 'date?',
    revenueCatId: 'string?'
  }
};

export const PreferencesSchema = {
  name: 'Preferences',
  embedded: true,
  properties: {
    notifications: { type: 'bool', default: true },
    locationSharing: { type: 'bool', default: false },
    fcmToken: 'string?',
    preferredCategories: 'string[]'
  }
};

export const ConversationSchema = {
  name: 'Conversation',
  primaryKey: '_id',
  properties: {
    _id: 'objectId',
    participants: 'Participant[]',
    messages: 'Message[]',
    lastMessage: 'LastMessage?',
    type: 'string',
    relatedItem: 'RelatedItem?',
    unreadCount: 'string{}',
    createdAt: 'date',
    updatedAt: 'date'
  }
};

export const ParticipantSchema = {
  name: 'Participant',
  embedded: true,
  properties: {
    userId: 'objectId',
    username: 'string',
    avatar: 'string?',
    lastReadAt: 'date?'
  }
};

export const MessageSchema = {
  name: 'Message',
  embedded: true,
  properties: {
    _id: 'objectId',
    senderId: 'objectId',
    senderName: 'string',
    senderAvatar: 'string?',
    text: 'string',
    type: 'string',
    metadata: 'MessageMetadata?',
    reactions: 'Reaction[]',
    readBy: 'ReadReceipt[]',
    createdAt: 'date'
  }
};

export const LastMessageSchema = {
  name: 'LastMessage',
  embedded: true,
  properties: {
    text: 'string',
    senderId: 'objectId',
    senderName: 'string',
    createdAt: 'date'
  }
};

export const RelatedItemSchema = {
  name: 'RelatedItem',
  embedded: true,
  properties: {
    itemId: 'objectId',
    title: 'string',
    image: 'string?'
  }
};

export const MessageMetadataSchema = {
  name: 'MessageMetadata',
  embedded: true,
  properties: {
    imageUrl: 'string?',
    itemId: 'objectId?',
    itemTitle: 'string?',
    location: 'MessageLocation?'
  }
};

export const MessageLocationSchema = {
  name: 'MessageLocation',
  embedded: true,
  properties: {
    coordinates: 'double[]',
    address: 'string'
  }
};

export const ReactionSchema = {
  name: 'Reaction',
  embedded: true,
  properties: {
    emoji: 'string',
    userId: 'objectId'
  }
};

export const ReadReceiptSchema = {
  name: 'ReadReceipt',
  embedded: true,
  properties: {
    userId: 'objectId',
    readAt: 'date'
  }
};

export const MarketplaceItemSchema = {
  name: 'MarketplaceItem',
  primaryKey: '_id',
  properties: {
    _id: 'objectId',
    title: 'string',
    description: 'string',
    category: 'string',
    condition: 'string',
    price: 'int',
    originalPrice: 'int?',
    images: 'string[]',
    seller: 'Seller?',
    location: 'Location?',
    groupBuy: 'GroupBuy?',
    sustainability: 'Sustainability?',
    status: 'string',
    views: { type: 'int', default: 0 },
    likes: { type: 'int', default: 0 },
    createdAt: 'date',
    updatedAt: 'date'
  }
};

export const SellerSchema = {
  name: 'Seller',
  embedded: true,
  properties: {
    userId: 'objectId',
    username: 'string',
    avatar: 'string?',
    rating: { type: 'double', default: 5 },
    location: 'string?'
  }
};

export const GroupBuySchema = {
  name: 'GroupBuy',
  embedded: true,
  properties: {
    enabled: { type: 'bool', default: false },
    maxParticipants: { type: 'int', default: 5 },
    currentParticipants: { type: 'int', default: 0 },
    discountPercent: { type: 'int', default: 10 },
    endTime: 'date?',
    participants: 'GroupBuyParticipant[]'
  }
};

export const GroupBuyParticipantSchema = {
  name: 'GroupBuyParticipant',
  embedded: true,
  properties: {
    userId: 'objectId',
    username: 'string',
    joinedAt: 'date'
  }
};

export const SustainabilitySchema = {
  name: 'Sustainability',
  embedded: true,
  properties: {
    co2SavedKg: { type: 'int', default: 0 },
    wasteDivertedKg: { type: 'int', default: 0 }
  }
};

// ============================================
// REALM CONFIGURATION
// ============================================

const schemas = [
  UserSchema,
  ProfileSchema,
  LocationSchema,
  UserStatsSchema,
  SubscriptionSchema,
  PreferencesSchema,
  ConversationSchema,
  ParticipantSchema,
  MessageSchema,
  LastMessageSchema,
  RelatedItemSchema,
  MessageMetadataSchema,
  MessageLocationSchema,
  ReactionSchema,
  ReadReceiptSchema,
  MarketplaceItemSchema,
  SellerSchema,
  GroupBuySchema,
  GroupBuyParticipantSchema,
  SustainabilitySchema
];

// ============================================
// AUTHENTICATION FUNCTIONS
// ============================================

export const realmAuth = {
  // Anonymous login (for quick app testing)
  async loginAnonymous() {
    try {
      const credentials = Realm.Credentials.anonymous();
      const user = await app.logIn(credentials);
      console.log('Anonymous login successful:', user.id);
      return user;
    } catch (error) {
      console.error('Anonymous login failed:', error);
      throw error;
    }
  },

  // Email/password login
  async loginEmailPassword(email, password) {
    try {
      const credentials = Realm.Credentials.emailPassword(email, password);
      const user = await app.logIn(credentials);
      console.log('Email login successful:', user.id);
      return user;
    } catch (error) {
      console.error('Email login failed:', error);
      throw error;
    }
  },

  // Register new user
  async registerUser(email, password) {
    try {
      await app.emailPasswordAuth.registerUser({ email, password });
      console.log('User registered successfully');
      return true;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  },

  // Logout
  async logout() {
    try {
      const user = app.currentUser;
      if (user) {
        await user.logOut();
        console.log('Logout successful');
      }
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  },

  // Get current user
  getCurrentUser() {
    return app.currentUser;
  }
};

// ============================================
// OPEN REALM (with sync)
// ============================================

export async function openRealm() {
  const user = app.currentUser;
  if (!user) {
    throw new Error('No user logged in');
  }

  const config = {
    schema: schemas,
    sync: {
      user: user,
      flexible: true,
      initialSubscriptions: {
        update: (subs, realm) => {
          // Subscribe to user's conversations
          subs.add(
            realm.objects('Conversation').filtered('participants.userId == $0', user.id),
            { name: 'myConversations' }
          );
          
          // Subscribe to nearby items (within 10km)
          subs.add(
            realm.objects('MarketplaceItem').filtered('status == "active"'),
            { name: 'activeItems' }
          );
        }
      }
    }
  };

  return await Realm.open(config);
}

// ============================================
// CHAT FUNCTIONS
// ============================================

export const chatService = {
  // Send a message
  async sendMessage(conversationId, text, type = 'text', metadata = null) {
    const realm = await openRealm();
    const user = app.currentUser;
    
    try {
      realm.write(() => {
        const conversation = realm.objectForPrimaryKey('Conversation', new ObjectId(conversationId));
        if (!conversation) throw new Error('Conversation not found');
        
        const newMessage = {
          _id: new ObjectId(),
          senderId: new ObjectId(user.id),
          senderName: user.profile?.firstName || user.username,
          senderAvatar: user.profile?.avatar,
          text: text,
          type: type,
          metadata: metadata,
          reactions: [],
          readBy: [],
          createdAt: new Date()
        };
        
        conversation.messages.push(newMessage);
        conversation.lastMessage = {
          text: text,
          senderId: new ObjectId(user.id),
          senderName: user.profile?.firstName || user.username,
          createdAt: new Date()
        };
        conversation.updatedAt = new Date();
        
        // Update unread counts for other participants
        conversation.participants.forEach(participant => {
          if (participant.userId.toString() !== user.id) {
            const currentCount = conversation.unreadCount[participant.userId.toString()] || 0;
            conversation.unreadCount[participant.userId.toString()] = currentCount + 1;
          }
        });
      });
      
      console.log('Message sent successfully');
      return true;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    } finally {
      realm.close();
    }
  },

  // Mark messages as read
  async markAsRead(conversationId) {
    const realm = await openRealm();
    const user = app.currentUser;
    
    try {
      realm.write(() => {
        const conversation = realm.objectForPrimaryKey('Conversation', new ObjectId(conversationId));
        if (conversation) {
          conversation.unreadCount[user.id] = 0;
          
          // Update participant lastReadAt
          const participant = conversation.participants.find(
            p => p.userId.toString() === user.id
          );
          if (participant) {
            participant.lastReadAt = new Date();
          }
        }
      });
    } finally {
      realm.close();
    }
  },

  // Get conversations for current user
  async getConversations() {
    const realm = await openRealm();
    
    try {
      const conversations = realm.objects('Conversation')
        .filtered('participants.userId == $0', app.currentUser.id)
        .sorted('updatedAt', true);
      
      return Array.from(conversations);
    } finally {
      realm.close();
    }
  }
};

// ============================================
// SCAN FUNCTIONS (AI Image Scanning)
// ============================================

export const scanService = {
  // Call Atlas Function to process image
  async scanImage(imageBase64, location = null) {
    try {
      const user = app.currentUser;
      const result = await user.functions.processImageScan({
        imageBase64: imageBase64,
        userId: user.id,
        location: location
      });
      
      console.log('Scan result:', result);
      return result;
    } catch (error) {
      console.error('Scan failed:', error);
      throw error;
    }
  },

  // Get user's scan history
  async getScanHistory() {
    const realm = await openRealm();
    const user = app.currentUser;
    
    try {
      // Assuming you have a Scan schema (add it if needed)
      const scans = realm.objects('Scan')
        .filtered('userId == $0', user.id)
        .sorted('createdAt', true);
      
      return Array.from(scans);
    } finally {
      realm.close();
    }
  }
};

// ============================================
// MARKETPLACE FUNCTIONS
// ============================================

export const marketplaceService = {
  // Get items near location
  async getNearbyItems(longitude, latitude, radiusKm = 10) {
    const realm = await openRealm();
    
    try {
      // For geospatial queries, you'd typically use Atlas Aggregation pipeline
      // This is a simplified version
      const items = realm.objects('MarketplaceItem')
        .filtered('status == "active"')
        .sorted('createdAt', true);
      
      return Array.from(items);
    } finally {
      realm.close();
    }
  },

  // Create new listing
  async createListing(listingData) {
    const realm = await openRealm();
    const user = app.currentUser;
    
    try {
      realm.write(() => {
        realm.create('MarketplaceItem', {
          _id: new ObjectId(),
          ...listingData,
          seller: {
            userId: new ObjectId(user.id),
            username: user.profile?.username || 'user',
            avatar: user.profile?.avatar,
            rating: 5,
            location: user.profile?.neighborhood || ''
          },
          status: 'active',
          views: 0,
          likes: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      });
      
      console.log('Listing created successfully');
      return true;
    } catch (error) {
      console.error('Failed to create listing:', error);
      throw error;
    } finally {
      realm.close();
    }
  }
};

// ============================================
// FCM TOKEN MANAGEMENT
// ============================================

export async function updateFCMToken(fcmToken) {
  const realm = await openRealm();
  const user = app.currentUser;
  
  try {
    realm.write(() => {
      const userData = realm.objectForPrimaryKey('User', new ObjectId(user.id));
      if (userData && userData.preferences) {
        userData.preferences.fcmToken = fcmToken;
      }
    });
    console.log('FCM token updated');
  } finally {
    realm.close();
  }
}
