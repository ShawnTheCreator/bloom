// MongoDB Atlas Schemas for Bloom App
// Optimized for real-time chat, AI scanning, and geospatial queries

import { Schema, model, Document, ObjectId } from 'mongoose';

// ============================================
// 1. USERS Collection
// ============================================
export interface IUser extends Document {
  _id: ObjectId;
  username: string;
  email: string;
  passwordHash: string;
  profile: {
    firstName: string;
    lastName: string;
    avatar?: string;
    bio?: string;
    phone?: string;
  };
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
    address: string;
    neighborhood?: string;
  };
  stats: {
    totalSaved: number;
    itemsSold: number;
    itemsBought: number;
    co2SavedKg: number;
    reputation: number;
  };
  subscription: {
    isMamaPro: boolean;
    plan: 'free' | 'monthly' | 'yearly';
    expiresAt?: Date;
    revenueCatId?: string;
  };
  preferences: {
    notifications: boolean;
    locationSharing: boolean;
    fcmToken?: string;
    preferredCategories: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  profile: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    avatar: { type: String },
    bio: { type: String },
    phone: { type: String }
  },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] },
    address: { type: String, default: '' },
    neighborhood: { type: String }
  },
  stats: {
    totalSaved: { type: Number, default: 0 },
    itemsSold: { type: Number, default: 0 },
    itemsBought: { type: Number, default: 0 },
    co2SavedKg: { type: Number, default: 0 },
    reputation: { type: Number, default: 100 }
  },
  subscription: {
    isMamaPro: { type: Boolean, default: false },
    plan: { type: String, enum: ['free', 'monthly', 'yearly'], default: 'free' },
    expiresAt: { type: Date },
    revenueCatId: { type: String }
  },
  preferences: {
    notifications: { type: Boolean, default: true },
    locationSharing: { type: Boolean, default: false },
    fcmToken: { type: String },
    preferredCategories: [{ type: String }]
  }
}, {
  timestamps: true
});

// Geospatial index for location-based queries
UserSchema.index({ location: '2dsphere' });

// ============================================
// 2. CONVERSATIONS Collection (Embedded Messages)
// ============================================
export interface IMessage {
  _id: ObjectId;
  senderId: ObjectId;
  senderName: string;
  senderAvatar?: string;
  text: string;
  type: 'text' | 'image' | 'item' | 'location';
  metadata?: {
    imageUrl?: string;
    itemId?: ObjectId;
    itemTitle?: string;
    location?: {
      coordinates: [number, number];
      address: string;
    };
  };
  reactions: {
    emoji: string;
    userId: ObjectId;
  }[];
  readBy: {
    userId: ObjectId;
    readAt: Date;
  }[];
  createdAt: Date;
}

export interface IConversation extends Document {
  _id: ObjectId;
  participants: {
    userId: ObjectId;
    username: string;
    avatar?: string;
    lastReadAt?: Date;
  }[];
  messages: IMessage[];
  lastMessage: {
    text: string;
    senderId: ObjectId;
    senderName: string;
    createdAt: Date;
  };
  type: 'direct' | 'group_buy' | 'event';
  relatedItem?: {
    itemId: ObjectId;
    title: string;
    image?: string;
  };
  unreadCount: Map<string, number>; // userId -> count
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>({
  participants: [{
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, required: true },
    avatar: { type: String },
    lastReadAt: { type: Date }
  }],
  messages: [{
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    senderName: { type: String, required: true },
    senderAvatar: { type: String },
    text: { type: String, required: true },
    type: { type: String, enum: ['text', 'image', 'item', 'location'], default: 'text' },
    metadata: {
      imageUrl: { type: String },
      itemId: { type: Schema.Types.ObjectId },
      itemTitle: { type: String },
      location: {
        coordinates: { type: [Number] },
        address: { type: String }
      }
    },
    reactions: [{
      emoji: { type: String },
      userId: { type: Schema.Types.ObjectId }
    }],
    readBy: [{
      userId: { type: Schema.Types.ObjectId },
      readAt: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now }
  }],
  lastMessage: {
    text: { type: String, default: '' },
    senderId: { type: Schema.Types.ObjectId },
    senderName: { type: String },
    createdAt: { type: Date }
  },
  type: { type: String, enum: ['direct', 'group_buy', 'event'], default: 'direct' },
  relatedItem: {
    itemId: { type: Schema.Types.ObjectId, ref: 'MarketplaceItem' },
    title: { type: String },
    image: { type: String }
  },
  unreadCount: { type: Map, of: Number, default: {} }
}, {
  timestamps: true
});

// Index for fast conversation lookups
ConversationSchema.index({ 'participants.userId': 1 });
ConversationSchema.index({ updatedAt: -1 });

// ============================================
// 3. SCANS Collection (AI Vision Results)
// ============================================
export interface IScan extends Document {
  _id: ObjectId;
  userId: ObjectId;
  rawImage: string; // Base64 or URL
  rawText?: string; // OCR text from image
  detectedItem: {
    name: string;
    category: string;
    brand?: string;
    condition: 'new' | 'like-new' | 'good' | 'fair' | 'poor';
    confidence: number; // AI confidence score
  };
  estimatedValue: {
    originalPrice: number;
    resaleValue: number;
    currency: string;
  };
  sustainability: {
    co2SavedKg: number;
    wasteDivertedKg: number;
  };
  status: 'draft' | 'listed' | 'sold' | 'discarded';
  listingId?: ObjectId; // Reference if converted to listing
  location?: {
    coordinates: [number, number];
    address: string;
  };
  metadata: {
    scannedAt: Date;
    deviceInfo?: string;
    aiModel: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ScanSchema = new Schema<IScan>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  rawImage: { type: String, required: true },
  rawText: { type: String },
  detectedItem: {
    name: { type: String, required: true },
    category: { type: String, required: true },
    brand: { type: String },
    condition: { type: String, enum: ['new', 'like-new', 'good', 'fair', 'poor'] },
    confidence: { type: Number, default: 0 }
  },
  estimatedValue: {
    originalPrice: { type: Number, default: 0 },
    resaleValue: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' }
  },
  sustainability: {
    co2SavedKg: { type: Number, default: 0 },
    wasteDivertedKg: { type: Number, default: 0 }
  },
  status: { type: String, enum: ['draft', 'listed', 'sold', 'discarded'], default: 'draft' },
  listingId: { type: Schema.Types.ObjectId, ref: 'MarketplaceItem' },
  location: {
    coordinates: { type: [Number] },
    address: { type: String }
  },
  metadata: {
    scannedAt: { type: Date, default: Date.now },
    deviceInfo: { type: String },
    aiModel: { type: String, default: 'vision-ai-v1' }
  }
}, {
  timestamps: true
});

ScanSchema.index({ userId: 1, status: 1 });
ScanSchema.index({ createdAt: -1 });

// ============================================
// 4. GRIDS Collection (Neighborhood Carts)
// ============================================
export interface IGrid extends Document {
  _id: ObjectId;
  name: string;
  description?: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
    address: string;
    radius: number; // meters
  };
  items: {
    itemId: ObjectId;
    sellerId: ObjectId;
    sellerName: string;
    title: string;
    price: number;
    image?: string;
    addedAt: Date;
  }[];
  members: {
    userId: ObjectId;
    username: string;
    avatar?: string;
    joinedAt: Date;
    role: 'member' | 'admin';
  }[];
  stats: {
    totalItems: number;
    totalSaved: number;
    activeMembers: number;
  };
  settings: {
    isPublic: boolean;
    requiresApproval: boolean;
    maxMembers?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const GridSchema = new Schema<IGrid>({
  name: { type: String, required: true },
  description: { type: String },
  location: {
    type: { type: String, enum: ['Point'], required: true },
    coordinates: { type: [Number], required: true },
    address: { type: String, required: true },
    radius: { type: Number, default: 1000 } // 1km default
  },
  items: [{
    itemId: { type: Schema.Types.ObjectId, ref: 'MarketplaceItem' },
    sellerId: { type: Schema.Types.ObjectId, ref: 'User' },
    sellerName: { type: String },
    title: { type: String },
    price: { type: Number },
    image: { type: String },
    addedAt: { type: Date, default: Date.now }
  }],
  members: [{
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    username: { type: String },
    avatar: { type: String },
    joinedAt: { type: Date, default: Date.now },
    role: { type: String, enum: ['member', 'admin'], default: 'member' }
  }],
  stats: {
    totalItems: { type: Number, default: 0 },
    totalSaved: { type: Number, default: 0 },
    activeMembers: { type: Number, default: 0 }
  },
  settings: {
    isPublic: { type: Boolean, default: true },
    requiresApproval: { type: Boolean, default: false },
    maxMembers: { type: Number }
  }
}, {
  timestamps: true
});

GridSchema.index({ location: '2dsphere' });
GridSchema.index({ 'members.userId': 1 });

// ============================================
// 5. MARKETPLACE ITEMS Collection
// ============================================
export interface IMarketplaceItem extends Document {
  _id: ObjectId;
  title: string;
  description: string;
  category: string;
  condition: 'new' | 'like-new' | 'good' | 'fair' | 'poor';
  price: number;
  originalPrice?: number;
  images: string[];
  seller: {
    userId: ObjectId;
    username: string;
    avatar?: string;
    rating: number;
    location: string;
  };
  location: {
    type: 'Point';
    coordinates: [number, number];
    address: string;
  };
  groupBuy?: {
    enabled: boolean;
    maxParticipants: number;
    currentParticipants: number;
    discountPercent: number;
    endTime: Date;
    participants: {
      userId: ObjectId;
      username: string;
      joinedAt: Date;
    }[];
  };
  sustainability: {
    co2SavedKg: number;
    wasteDivertedKg: number;
  };
  status: 'active' | 'sold' | 'reserved' | 'inactive';
  views: number;
  likes: number;
  createdAt: Date;
  updatedAt: Date;
}

const MarketplaceItemSchema = new Schema<IMarketplaceItem>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  condition: { type: String, enum: ['new', 'like-new', 'good', 'fair', 'poor'], required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  images: [{ type: String }],
  seller: {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, required: true },
    avatar: { type: String },
    rating: { type: Number, default: 5 },
    location: { type: String }
  },
  location: {
    type: { type: String, enum: ['Point'], required: true },
    coordinates: { type: [Number], required: true },
    address: { type: String, required: true }
  },
  groupBuy: {
    enabled: { type: Boolean, default: false },
    maxParticipants: { type: Number, default: 5 },
    currentParticipants: { type: Number, default: 0 },
    discountPercent: { type: Number, default: 10 },
    endTime: { type: Date },
    participants: [{
      userId: { type: Schema.Types.ObjectId, ref: 'User' },
      username: { type: String },
      joinedAt: { type: Date, default: Date.now }
    }]
  },
  sustainability: {
    co2SavedKg: { type: Number, default: 0 },
    wasteDivertedKg: { type: Number, default: 0 }
  },
  status: { type: String, enum: ['active', 'sold', 'reserved', 'inactive'], default: 'active' },
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 }
}, {
  timestamps: true
});

MarketplaceItemSchema.index({ location: '2dsphere' });
MarketplaceItemSchema.index({ category: 1, status: 1 });
MarketplaceItemSchema.index({ 'groupBuy.enabled': 1, 'groupBuy.endTime': 1 });

// ============================================
// 6. HIVE ACTIVITIES Collection
// ============================================
export interface IHiveActivity extends Document {
  _id: ObjectId;
  type: 'community-event' | 'group-buy' | 'milestone' | 'local-pickup' | 'workshop';
  title: string;
  description: string;
  organizer: {
    userId: ObjectId;
    username: string;
    avatar?: string;
  };
  location: {
    type: 'Point';
    coordinates: [number, number];
    address: string;
  };
  startTime: Date;
  endTime: Date;
  maxParticipants?: number;
  currentParticipants: number;
  participants: {
    userId: ObjectId;
    username: string;
    joinedAt: Date;
  }[];
  category: string;
  images: string[];
  status: 'upcoming' | 'live' | 'completed' | 'cancelled';
  sustainabilityImpact?: {
    treesPlanted?: number;
    co2SavedKg?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const HiveActivitySchema = new Schema<IHiveActivity>({
  type: { type: String, enum: ['community-event', 'group-buy', 'milestone', 'local-pickup', 'workshop'], required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  organizer: {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, required: true },
    avatar: { type: String }
  },
  location: {
    type: { type: String, enum: ['Point'], required: true },
    coordinates: { type: [Number], required: true },
    address: { type: String, required: true }
  },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  maxParticipants: { type: Number },
  currentParticipants: { type: Number, default: 0 },
  participants: [{
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    username: { type: String },
    joinedAt: { type: Date, default: Date.now }
  }],
  category: { type: String, required: true },
  images: [{ type: String }],
  status: { type: String, enum: ['upcoming', 'live', 'completed', 'cancelled'], default: 'upcoming' },
  sustainabilityImpact: {
    treesPlanted: { type: Number },
    co2SavedKg: { type: Number }
  }
}, {
  timestamps: true
});

HiveActivitySchema.index({ location: '2dsphere' });
HiveActivitySchema.index({ startTime: 1, status: 1 });

// Export models
export const User = model<IUser>('User', UserSchema);
export const Conversation = model<IConversation>('Conversation', ConversationSchema);
export const Scan = model<IScan>('Scan', ScanSchema);
export const Grid = model<IGrid>('Grid', GridSchema);
export const MarketplaceItem = model<IMarketplaceItem>('MarketplaceItem', MarketplaceItemSchema);
export const HiveActivity = model<IHiveActivity>('HiveActivity', HiveActivitySchema);
