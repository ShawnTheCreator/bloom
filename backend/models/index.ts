// MongoDB Models for Bloom App
// Replacing Azure SQL, Cosmos DB, and Blob Storage with MongoDB

import { Schema, model, Document } from 'mongoose';

// User Model - Replaces Azure SQL User table
interface IUser extends Document {
  username: string;
  email: string;
  passwordHash: string;
  profile: {
    firstName: string;
    lastName: string;
    avatar?: string;
    bio?: string;
    location?: string;
    joinDate: Date;
  };
  stats: {
    totalSaved: number;
    itemsSold: number;
    itemsBought: number;
    co2SavedKg: number;
    reputation: number;
  };
  preferences: {
    notifications: boolean;
    locationSharing: boolean;
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
    avatar: { type: String }, // URL to image stored in MongoDB GridFS
    bio: { type: String },
    location: { type: String },
    joinDate: { type: Date, default: Date.now }
  },
  stats: {
    totalSaved: { type: Number, default: 0 },
    itemsSold: { type: Number, default: 0 },
    itemsBought: { type: Number, default: 0 },
    co2SavedKg: { type: Number, default: 0 },
    reputation: { type: Number, default: 100 }
  },
  preferences: {
    notifications: { type: Boolean, default: true },
    locationSharing: { type: Boolean, false },
    preferredCategories: [{ type: String }]
  }
}, {
  timestamps: true
});

// Marketplace Item Model - Replaces Azure SQL Listings
interface IMarketplaceItem extends Document {
  title: string;
  description: string;
  category: string;
  condition: 'new' | 'like-new' | 'good' | 'fair' | 'poor';
  price: number;
  originalPrice?: number;
  images: string[]; // Array of image URLs stored in GridFS
  seller: {
    userId: Schema.Types.ObjectId;
    username: string;
    avatar?: string;
    rating: number;
    location: string;
  };
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
    address: string;
  };
  groupBuy?: {
    enabled: boolean;
    maxParticipants: number;
    currentParticipants: number;
    discountPercent: number;
    endTime: Date;
    participants: [{
      userId: Schema.Types.ObjectId;
      username: string;
      joinedAt: Date;
    }];
  };
  sustainability: {
    co2SavedKg: number;
    wasteDivertedKg: number;
    localProduction: boolean;
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
  condition: { 
    type: String, 
    enum: ['new', 'like-new', 'good', 'fair', 'poor'], 
    required: true 
  },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  images: [{ type: String }], // URLs to GridFS images
  seller: {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, required: true },
    avatar: { type: String },
    rating: { type: Number, default: 5.0 },
    location: { type: String, required: true }
  },
  location: {
    type: { type: String, enum: ['Point'], required: true },
    coordinates: { type: [Number], required: true }, // [longitude, latitude]
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
    wasteDivertedKg: { type: Number, default: 0 },
    localProduction: { type: Boolean, default: false }
  },
  status: { 
    type: String, 
    enum: ['active', 'sold', 'reserved', 'inactive'], 
    default: 'active' 
  },
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 }
}, {
  timestamps: true
});

// Transaction Model - Replaces Azure SQL Transactions
interface ITransaction extends Document {
  type: 'sale' | 'purchase' | 'group-buy' | 'donation';
  item: {
    itemId: Schema.Types.ObjectId;
    title: string;
    price: number;
    image?: string;
  };
  buyer: {
    userId: Schema.Types.ObjectId;
    username: string;
  };
  seller: {
    userId: Schema.Types.ObjectId;
    username: string;
  };
  groupBuy?: {
    groupBuyId: Schema.Types.ObjectId;
    participantCount: number;
    discountApplied: number;
  };
  amount: number;
  fee: number;
  netAmount: number;
  status: 'pending' | 'completed' | 'cancelled' | 'refunded';
  paymentMethod: string;
  sustainability: {
    co2SavedKg: number;
    wasteDivertedKg: number;
  };
  messages?: [{
    senderId: Schema.Types.ObjectId;
    senderName: string;
    message: string;
    timestamp: Date;
  }];
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>({
  type: { 
    type: String, 
    enum: ['sale', 'purchase', 'group-buy', 'donation'], 
    required: true 
  },
  item: {
    itemId: { type: Schema.Types.ObjectId, ref: 'MarketplaceItem', required: true },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String }
  },
  buyer: {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, required: true }
  },
  seller: {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, required: true }
  },
  groupBuy: {
    groupBuyId: { type: Schema.Types.ObjectId },
    participantCount: { type: Number },
    discountApplied: { type: Number }
  },
  amount: { type: Number, required: true },
  fee: { type: Number, default: 0 },
  netAmount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'cancelled', 'refunded'], 
    default: 'pending' 
  },
  paymentMethod: { type: String, required: true },
  sustainability: {
    co2SavedKg: { type: Number, default: 0 },
    wasteDivertedKg: { type: Number, default: 0 }
  },
  messages: [{
    senderId: { type: Schema.Types.ObjectId, ref: 'User' },
    senderName: { type: String },
    message: { type: String },
    timestamp: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

// Hive Activity Model - Replaces Cosmos DB real-time data
interface IHiveActivity extends Document {
  type: 'community-event' | 'group-buy-started' | 'milestone' | 'local-pickup' | 'workshop';
  title: string;
  description: string;
  organizer: {
    userId: Schema.Types.ObjectId;
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
  participants: [{
    userId: Schema.Types.ObjectId;
    username: string;
    joinedAt: Date;
  }];
  category: string;
  tags: string[];
  images: string[];
  status: 'upcoming' | 'live' | 'completed' | 'cancelled';
  visibility: 'public' | 'private' | 'local';
  sustainabilityImpact?: {
    treesPlanted?: number;
    co2SavedKg?: number;
    wasteReducedKg?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const HiveActivitySchema = new Schema<IHiveActivity>({
  type: {
    type: String,
    enum: ['community-event', 'group-buy-started', 'milestone', 'local-pickup', 'workshop'],
    required: true
  },
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
  tags: [{ type: String }],
  images: [{ type: String }],
  status: {
    type: String,
    enum: ['upcoming', 'live', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  visibility: {
    type: String,
    enum: ['public', 'private', 'local'],
    default: 'public'
  },
  sustainabilityImpact: {
    treesPlanted: { type: Number },
    co2SavedKg: { type: Number },
    wasteReducedKg: { type: Number }
  }
}, {
  timestamps: true
});

// Chat/Message Model - Real-time messaging (replaces Cosmos DB chat)
interface IChatMessage extends Document {
  chatId: string;
  senderId: Schema.Types.ObjectId;
  senderName: string;
  senderAvatar?: string;
  message: string;
  type: 'text' | 'image' | 'location' | 'system';
  metadata?: {
    imageUrl?: string;
    location?: {
      coordinates: [number, number];
      address: string;
    };
    itemId?: Schema.Types.ObjectId;
  };
  readBy: [{
    userId: Schema.Types.ObjectId;
    readAt: Date;
  }];
  reactions: [{
    emoji: string;
    userId: Schema.Types.ObjectId;
    addedAt: Date;
  }];
  timestamp: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>({
  chatId: { type: String, required: true, index: true },
  senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  senderName: { type: String, required: true },
  senderAvatar: { type: String },
  message: { type: String, required: true },
  type: {
    type: String,
    enum: ['text', 'image', 'location', 'system'],
    default: 'text'
  },
  metadata: {
    imageUrl: { type: String },
    location: {
      coordinates: { type: [Number] },
      address: { type: String }
    },
    itemId: { type: Schema.Types.ObjectId, ref: 'MarketplaceItem' }
  },
  readBy: [{
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    readAt: { type: Date, default: Date.now }
  }],
  reactions: [{
    emoji: { type: String },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    addedAt: { type: Date, default: Date.now }
  }],
  timestamp: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Create indexes for performance
MarketplaceItemSchema.index({ 'location.coordinates': '2dsphere' });
MarketplaceItemSchema.index({ category: 1, status: 1 });
MarketplaceItemSchema.index({ 'seller.userId': 1 });
MarketplaceItemSchema.index({ 'groupBuy.enabled': 1, 'groupBuy.endTime': 1 });

HiveActivitySchema.index({ 'location.coordinates': '2dsphere' });
HiveActivitySchema.index({ startTime: 1, status: 1 });
HiveActivitySchema.index({ category: 1, visibility: 1 });

ChatMessageSchema.index({ chatId: 1, timestamp: 1 });
ChatMessageSchema.index({ senderId: 1 });

export const User = model<IUser>('User', UserSchema);
export const MarketplaceItem = model<IMarketplaceItem>('MarketplaceItem', MarketplaceItemSchema);
export const Transaction = model<ITransaction>('Transaction', TransactionSchema);
export const HiveActivity = model<IHiveActivity>('HiveActivity', HiveActivitySchema);
export const ChatMessage = model<IChatMessage>('ChatMessage', ChatMessageSchema);
