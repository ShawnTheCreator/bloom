// MongoDB Seed Data for Bloom App
// Comprehensive seed data replacing Azure services

import { User, MarketplaceItem, Transaction, HiveActivity, ChatMessage } from '../models';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

// Seed Users
const seedUsers = async () => {
  console.log('Seeding users...');
  
  const users = [
    {
      username: 'sarah_bloom',
      email: 'sarah@bloom.com',
      passwordHash: await bcrypt.hash('password123', 10),
      profile: {
        firstName: 'Sarah',
        lastName: 'Johnson',
        avatar: 'https://bloom-images.s3.amazonaws.com/avatars/sarah.jpg',
        bio: 'Passionate about sustainable living and community building',
        location: 'Portland, OR',
        joinDate: new Date('2024-01-15')
      },
      stats: {
        totalSaved: 2847,
        itemsSold: 43,
        itemsBought: 12,
        co2SavedKg: 156,
        reputation: 487
      },
      preferences: {
        notifications: true,
        locationSharing: true,
        preferredCategories: ['electronics', 'furniture', 'clothing']
      }
    },
    {
      username: 'mike_eco',
      email: 'mike@bloom.com',
      passwordHash: await bcrypt.hash('password123', 10),
      profile: {
        firstName: 'Mike',
        lastName: 'Chen',
        avatar: 'https://bloom-images.s3.amazonaws.com/avatars/mike.jpg',
        bio: 'Tech enthusiast focused on reducing e-waste',
        location: 'Seattle, WA',
        joinDate: new Date('2024-02-20')
      },
      stats: {
        totalSaved: 1523,
        itemsSold: 28,
        itemsBought: 8,
        co2SavedKg: 89,
        reputation: 412
      },
      preferences: {
        notifications: true,
        locationSharing: false,
        preferredCategories: ['electronics', 'appliances']
      }
    },
    {
      username: 'emma_green',
      email: 'emma@bloom.com',
      passwordHash: await bcrypt.hash('password123', 10),
      profile: {
        firstName: 'Emma',
        lastName: 'Williams',
        avatar: 'https://bloom-images.s3.amazonaws.com/avatars/emma.jpg',
        bio: 'Mom of three, always looking for sustainable family solutions',
        location: 'San Francisco, CA',
        joinDate: new Date('2024-03-10')
      },
      stats: {
        totalSaved: 3421,
        itemsSold: 67,
        itemsBought: 34,
        co2SavedKg: 234,
        reputation: 523
      },
      preferences: {
        notifications: true,
        locationSharing: true,
        preferredCategories: ['clothing', 'toys', 'furniture', 'books']
      }
    },
    {
      username: 'alex_repair',
      email: 'alex@bloom.com',
      passwordHash: await bcrypt.hash('password123', 10),
      profile: {
        firstName: 'Alex',
        lastName: 'Martinez',
        avatar: 'https://bloom-images.s3.amazonaws.com/avatars/alex.jpg',
        bio: 'Repair specialist and upcycling artist',
        location: 'Austin, TX',
        joinDate: new Date('2024-01-28')
      },
      stats: {
        totalSaved: 987,
        itemsSold: 15,
        itemsBought: 23,
        co2SavedKg: 67,
        reputation: 398
      },
      preferences: {
        notifications: false,
        locationSharing: true,
        preferredCategories: ['furniture', 'appliances', 'tools']
      }
    }
  ];

  await User.insertMany(users);
  console.log('Users seeded successfully');
};

// Seed Marketplace Items
const seedMarketplaceItems = async () => {
  console.log('Seeding marketplace items...');
  
  const users = await User.find({});
  const sarah = users.find(u => u.username === 'sarah_bloom');
  const mike = users.find(u => u.username === 'mike_eco');
  const emma = users.find(u => u.username === 'emma_green');
  const alex = users.find(u => u.username === 'alex_repair');

  const items = [
    {
      title: 'Vintage Kitchen Mixer - Group Buy Special',
      description: 'Beautiful vintage KitchenAid mixer in excellent condition. Perfect for baking enthusiasts. Group buy available - get 20% off if 3+ people join!',
      category: 'appliances',
      condition: 'like-new',
      price: 120,
      originalPrice: 299,
      images: [
        'https://bloom-images.s3.amazonaws.com/items/mixer1.jpg',
        'https://bloom-images.s3.amazonaws.com/items/mixer2.jpg'
      ],
      seller: {
        userId: sarah!._id,
        username: sarah!.username,
        avatar: sarah!.profile.avatar,
        rating: 4.8,
        location: sarah!.profile.location
      },
      location: {
        type: 'Point',
        coordinates: [-122.6765, 45.5231], // Portland
        address: '123 Main St, Portland, OR 97201'
      },
      groupBuy: {
        enabled: true,
        maxParticipants: 5,
        currentParticipants: 2,
        discountPercent: 20,
        endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        participants: [
          { userId: emma!._id, username: emma!.username, joinedAt: new Date() },
          { userId: mike!._id, username: mike!.username, joinedAt: new Date(Date.now() - 2 * 60 * 60 * 1000) }
        ]
      },
      sustainability: {
        co2SavedKg: 12.5,
        wasteDivertedKg: 8.2,
        localProduction: true
      },
      status: 'active',
      views: 234,
      likes: 18
    },
    {
      title: 'Modern Office Chair - Ergonomic Design',
      description: 'High-quality office chair with lumbar support. Perfect for home office setup. Barely used - upgrading to standing desk.',
      category: 'furniture',
      condition: 'new',
      price: 180,
      originalPrice: 450,
      images: [
        'https://bloom-images.s3.amazonaws.com/items/chair1.jpg',
        'https://bloom-images.s3.amazonaws.com/items/chair2.jpg'
      ],
      seller: {
        userId: mike!._id,
        username: mike!.username,
        avatar: mike!.profile.avatar,
        rating: 4.9,
        location: mike!.profile.location
      },
      location: {
        type: 'Point',
        coordinates: [-122.3321, 47.6062], // Seattle
        address: '456 Tech Ave, Seattle, WA 98101'
      },
      sustainability: {
        co2SavedKg: 23.7,
        wasteDivertedKg: 15.3,
        localProduction: false
      },
      status: 'active',
      views: 156,
      likes: 12
    },
    {
      title: 'Kids Educational Books Bundle',
      description: 'Set of 15 educational books for ages 3-8. Like new condition. Perfect for homeschooling or supplementing learning.',
      category: 'books',
      condition: 'good',
      price: 35,
      originalPrice: 120,
      images: [
        'https://bloom-images.s3.amazonaws.com/items/books1.jpg'
      ],
      seller: {
        userId: emma!._id,
        username: emma!.username,
        avatar: emma!.profile.avatar,
        rating: 4.7,
        location: emma!.profile.location
      },
      location: {
        type: 'Point',
        coordinates: [-122.4194, 37.7749], // San Francisco
        address: '789 Family Ln, San Francisco, CA 94102'
      },
      sustainability: {
        co2SavedKg: 5.8,
        wasteDivertedKg: 3.2,
        localProduction: true
      },
      status: 'active',
      views: 89,
      likes: 7
    },
    {
      title: 'Upcycled Wooden Coffee Table',
      description: 'Beautiful coffee table made from reclaimed wood. Unique design with storage compartment. Hand-finished with eco-friendly stains.',
      category: 'furniture',
      condition: 'like-new',
      price: 220,
      images: [
        'https://bloom-images.s3.amazonaws.com/items/table1.jpg',
        'https://bloom-images.s3.amazonaws.com/items/table2.jpg'
      ],
      seller: {
        userId: alex!._id,
        username: alex!.username,
        avatar: alex!.profile.avatar,
        rating: 5.0,
        location: alex!.profile.location
      },
      location: {
        type: 'Point',
        coordinates: [-97.7431, 30.2672], // Austin
        address: '321 Craft St, Austin, TX 78701'
      },
      sustainability: {
        co2SavedKg: 34.2,
        wasteDivertedKg: 28.7,
        localProduction: true
      },
      status: 'active',
      views: 312,
      likes: 28
    },
    {
      title: 'Smartphone Battery Pack - Group Buy',
      description: '20000mAh portable charger with fast charging. Group buy available - save 25% when 4+ people join!',
      category: 'electronics',
      condition: 'new',
      price: 25,
      originalPrice: 60,
      images: [
        'https://bloom-images.s3.amazonaws.com/items/battery1.jpg'
      ],
      seller: {
        userId: mike!._id,
        username: mike!.username,
        avatar: mike!.profile.avatar,
        rating: 4.9,
        location: mike!.profile.location
      },
      location: {
        type: 'Point',
        coordinates: [-122.3321, 47.6062], // Seattle
        address: '456 Tech Ave, Seattle, WA 98101'
      },
      groupBuy: {
        enabled: true,
        maxParticipants: 8,
        currentParticipants: 3,
        discountPercent: 25,
        endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        participants: [
          { userId: sarah!._id, username: sarah!.username, joinedAt: new Date() },
          { userId: alex!._id, username: alex!.username, joinedAt: new Date(Date.now() - 4 * 60 * 60 * 1000) },
          { userId: emma!._id, username: emma!.username, joinedAt: new Date(Date.now() - 1 * 60 * 60 * 1000) }
        ]
      },
      sustainability: {
        co2SavedKg: 3.2,
        wasteDivertedKg: 1.8,
        localProduction: false
      },
      status: 'active',
      views: 445,
      likes: 31
    }
  ];

  await MarketplaceItem.insertMany(items);
  console.log('Marketplace items seeded successfully');
};

// Seed Transactions
const seedTransactions = async () => {
  console.log('Seeding transactions...');
  
  const users = await User.find({});
  const items = await MarketplaceItem.find({});
  
  const transactions = [
    {
      type: 'sale',
      item: {
        itemId: items[0]._id,
        title: items[0].title,
        price: items[0].price,
        image: items[0].images[0]
      },
      buyer: {
        userId: users[2]._id, // Emma
        username: users[2].username
      },
      seller: {
        userId: users[0]._id, // Sarah
        username: users[0].username
      },
      amount: 96, // After group buy discount
      fee: 4.80,
      netAmount: 91.20,
      status: 'completed',
      paymentMethod: 'stripe',
      sustainability: {
        co2SavedKg: 12.5,
        wasteDivertedKg: 8.2
      },
      messages: [
        {
          senderId: users[2]._id,
          senderName: users[2].username,
          message: 'Is this still available for pickup this weekend?',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
        },
        {
          senderId: users[0]._id,
          senderName: users[0].username,
          message: 'Yes! Saturday afternoon works perfectly for me.',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000)
        }
      ]
    },
    {
      type: 'purchase',
      item: {
        itemId: items[1]._id,
        title: items[1].title,
        price: items[1].price,
        image: items[1].images[0]
      },
      buyer: {
        userId: users[3]._id, // Alex
        username: users[3].username
      },
      seller: {
        userId: users[1]._id, // Mike
        username: users[1].username
      },
      amount: 180,
      fee: 9.00,
      netAmount: 171.00,
      status: 'completed',
      paymentMethod: 'paypal',
      sustainability: {
        co2SavedKg: 23.7,
        wasteDivertedKg: 15.3
      }
    },
    {
      type: 'group-buy',
      item: {
        itemId: items[4]._id,
        title: items[4].title,
        price: items[4].price,
        image: items[4].images[0]
      },
      buyer: {
        userId: users[0]._id, // Sarah
        username: users[0].username
      },
      seller: {
        userId: users[1]._id, // Mike
        username: users[1].username
      },
      groupBuy: {
        groupBuyId: items[4]._id,
        participantCount: 4,
        discountApplied: 25
      },
      amount: 18.75, // After 25% discount
      fee: 0.94,
      netAmount: 17.81,
      status: 'completed',
      paymentMethod: 'stripe',
      sustainability: {
        co2SavedKg: 3.2,
        wasteDivertedKg: 1.8
      }
    }
  ];

  await Transaction.insertMany(transactions);
  console.log('Transactions seeded successfully');
};

// Seed Hive Activities
const seedHiveActivities = async () => {
  console.log('Seeding hive activities...');
  
  const users = await User.find({});
  
  const activities = [
    {
      type: 'community-event',
      title: 'Community Repair Workshop',
      description: 'Learn basic repair skills for electronics and furniture. Bring your broken items and let\'s fix them together!',
      organizer: {
        userId: users[3]._id, // Alex
        username: users[3].username,
        avatar: users[3].profile.avatar
      },
      location: {
        type: 'Point',
        coordinates: [-97.7431, 30.2672], // Austin
        address: '123 Community Center, Austin, TX 78701'
      },
      startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
      endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
      maxParticipants: 25,
      currentParticipants: 12,
      participants: [
        { userId: users[0]._id, username: users[0].username, joinedAt: new Date() },
        { userId: users[1]._id, username: users[1].username, joinedAt: new Date(Date.now() - 2 * 60 * 60 * 1000) },
        { userId: users[2]._id, username: users[2].username, joinedAt: new Date(Date.now() - 4 * 60 * 60 * 1000) }
      ],
      category: 'workshop',
      tags: ['repair', 'sustainability', 'skills', 'community'],
      images: [
        'https://bloom-images.s3.amazonaws.com/events/repair1.jpg',
        'https://bloom-images.s3.amazonaws.com/events/repair2.jpg'
      ],
      status: 'upcoming',
      visibility: 'public',
      sustainabilityImpact: {
        wasteReducedKg: 50,
        co2SavedKg: 25
      }
    },
    {
      type: 'group-buy-started',
      title: 'Bulk Organic Food Co-op Order',
      description: 'Join our monthly organic food co-op order! Get fresh, local produce at wholesale prices while supporting local farmers.',
      organizer: {
        userId: users[2]._id, // Emma
        username: users[2].username,
        avatar: users[2].profile.avatar
      },
      location: {
        type: 'Point',
        coordinates: [-122.4194, 37.7749], // San Francisco
        address: '456 Green Market, San Francisco, CA 94102'
      },
      startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // In 2 days
      endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
      maxParticipants: 30,
      currentParticipants: 18,
      participants: [
        { userId: users[0]._id, username: users[0].username, joinedAt: new Date() },
        { userId: users[3]._id, username: users[3].username, joinedAt: new Date(Date.now() - 1 * 60 * 60 * 1000) }
      ],
      category: 'food',
      tags: ['organic', 'local', 'group-buy', 'sustainable'],
      images: [
        'https://bloom-images.s3.amazonaws.com/events/food1.jpg'
      ],
      status: 'upcoming',
      visibility: 'local',
      sustainabilityImpact: {
        co2SavedKg: 75,
        wasteReducedKg: 30
      }
    },
    {
      type: 'milestone',
      title: 'Community Sustainability Milestone!',
      description: 'Our community has saved 1000kg of CO2 this month through reuse and sharing! Let\'s celebrate and keep the momentum going.',
      organizer: {
        userId: users[0]._id, // Sarah
        username: users[0].username,
        avatar: users[0].profile.avatar
      },
      location: {
        type: 'Point',
        coordinates: [-122.6765, 45.5231], // Portland
        address: '789 Eco Park, Portland, OR 97201'
      },
      startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // In 3 days
      endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
      maxParticipants: 100,
      currentParticipants: 45,
      participants: [
        { userId: users[1]._id, username: users[1].username, joinedAt: new Date() },
        { userId: users[2]._id, username: users[2].username, joinedAt: new Date(Date.now() - 30 * 60 * 1000) },
        { userId: users[3]._id, username: users[3].username, joinedAt: new Date(Date.now() - 2 * 60 * 60 * 1000) }
      ],
      category: 'celebration',
      tags: ['milestone', 'sustainability', 'community', 'achievement'],
      images: [
        'https://bloom-images.s3.amazonaws.com/events/milestone1.jpg'
      ],
      status: 'upcoming',
      visibility: 'public',
      sustainabilityImpact: {
        co2SavedKg: 1000,
        treesPlanted: 50
      }
    }
  ];

  await HiveActivity.insertMany(activities);
  console.log('Hive activities seeded successfully');
};

// Seed Chat Messages
const seedChatMessages = async () => {
  console.log('Seeding chat messages...');
  
  const users = await User.find({});
  const items = await MarketplaceItem.find({});
  
  const messages = [
    {
      chatId: `item_${items[0]._id}`,
      senderId: users[2]._id, // Emma
      senderName: users[2].username,
      senderAvatar: users[2].profile.avatar,
      message: 'Hi! Is the kitchen mixer still available?',
      type: 'text',
      readBy: [
        { userId: users[0]._id, readAt: new Date() }
      ],
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
      chatId: `item_${items[0]._id}`,
      senderId: users[0]._id, // Sarah
      senderName: users[0].username,
      senderAvatar: users[0].profile.avatar,
      message: 'Yes! Would you like to see more photos?',
      type: 'text',
      readBy: [
        { userId: users[2]._id, readAt: new Date() }
      ],
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 15 * 60 * 1000)
    },
    {
      chatId: `item_${items[0]._id}`,
      senderId: users[2]._id, // Emma
      senderName: users[2].username,
      senderAvatar: users[2].profile.avatar,
      message: 'That would be great! Also, what\'s the best time for pickup?',
      type: 'text',
      readBy: [
        { userId: users[0]._id, readAt: new Date() }
      ],
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 30 * 60 * 1000)
    },
    {
      chatId: `groupbuy_${items[4]._id}`,
      senderId: users[0]._id, // Sarah
      senderName: users[0].username,
      senderAvatar: users[0].profile.avatar,
      message: 'Excited about this group buy! How many more people do we need?',
      type: 'text',
      readBy: [
        { userId: users[1]._id, readAt: new Date() },
        { userId: users[3]._id, readAt: new Date() }
      ],
      reactions: [
        { emoji: '👍', userId: users[1]._id, addedAt: new Date() },
        { emoji: '🎉', userId: users[3]._id, addedAt: new Date() }
      ],
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000)
    },
    {
      chatId: `groupbuy_${items[4]._id}`,
      senderId: users[1]._id, // Mike
      senderName: users[1].username,
      senderAvatar: users[1].profile.avatar,
      message: 'We need 1 more person to get the maximum discount! Almost there!',
      type: 'text',
      readBy: [
        { userId: users[0]._id, readAt: new Date() },
        { userId: users[3]._id, readAt: new Date() }
      ],
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000 + 20 * 60 * 1000)
    },
    {
      chatId: `event_${activities[0]._id}`,
      senderId: users[3]._id, // Alex
      senderName: users[3].username,
      senderAvatar: users[3].profile.avatar,
      message: 'Don\'t forget to bring any broken electronics you\'d like to learn to repair!',
      type: 'text',
      readBy: [
        { userId: users[0]._id, readAt: new Date() },
        { userId: users[1]._id, readAt: new Date() },
        { userId: users[2]._id, readAt: new Date() }
      ],
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000)
    }
  ];

  await ChatMessage.insertMany(messages);
  console.log('Chat messages seeded successfully');
};

// Main seed function
export const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');
    
    // Clear existing data
    await User.deleteMany({});
    await MarketplaceItem.deleteMany({});
    await Transaction.deleteMany({});
    await HiveActivity.deleteMany({});
    await ChatMessage.deleteMany({});
    
    console.log('Cleared existing data');
    
    // Seed in order
    await seedUsers();
    await seedMarketplaceItems();
    await seedTransactions();
    await seedHiveActivities();
    await seedChatMessages();
    
    console.log('Database seeding completed successfully!');
    
    // Print summary
    const userCount = await User.countDocuments();
    const itemCount = await MarketplaceItem.countDocuments();
    const transactionCount = await Transaction.countDocuments();
    const activityCount = await HiveActivity.countDocuments();
    const messageCount = await ChatMessage.countDocuments();
    
    console.log('\\n=== Seeding Summary ===');
    console.log(`Users: ${userCount}`);
    console.log(`Marketplace Items: ${itemCount}`);
    console.log(`Transactions: ${transactionCount}`);
    console.log(`Hive Activities: ${activityCount}`);
    console.log(`Chat Messages: ${messageCount}`);
    console.log('========================\\n');
    
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
};

// Run if called directly
if (require.main === module) {
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bloom')
    .then(() => {
      console.log('Connected to MongoDB');
      return seedDatabase();
    })
    .then(() => {
      console.log('Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}
