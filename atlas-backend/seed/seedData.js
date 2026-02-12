// MongoDB Atlas Seed Data for Bloom
// Run this script to populate your Atlas cluster with sample data

const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');

// Connection URI - Load from environment variable
const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('❌ ERROR: MONGODB_URI environment variable is not set');
  console.error('   Please set it before running this script:');
  console.error('   export MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/Bloom?retryWrites=true&w=majority"');
  process.exit(1);
}

async function seedDatabase() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB Atlas');
    
    const db = client.db('Bloom');
    
    // Clear existing data (optional - comment out if you want to keep existing data)
    // Note: Using 'User' collection name (capital U) as it already exists
    await db.collection('User').deleteMany({});
    await db.collection('conversations').deleteMany({});
    await db.collection('scans').deleteMany({});
    await db.collection('grids').deleteMany({});
    await db.collection('marketplaceitems').deleteMany({});
    await db.collection('hiveactivities').deleteMany({});
    
    console.log('Cleared existing collections');
    
    // Seed Users (into 'User' collection)
    const users = await seedUsers(db);
    
    // Seed Marketplace Items (into 'MarketplaceItem' collection)
    await seedMarketplaceItems(db, users);
    
    // Seed Conversations (into 'Conversation' collection)
    await seedConversations(db, users);
    
    // Seed Scans (into 'Scan' collection)
    await seedScans(db, users);
    
    // Seed Grids (into 'Grid' collection)
    await seedGrids(db, users);
    
    // Seed Hive Activities (into 'HiveActivity' collection)
    await seedHiveActivities(db, users);
    
    console.log('\n✅ Database seeded successfully!');
    
    // Print summary - using PascalCase collection names
    const userCount = await db.collection('User').countDocuments();
    const itemCount = await db.collection('MarketplaceItem').countDocuments();
    const convCount = await db.collection('Conversation').countDocuments();
    const scanCount = await db.collection('Scan').countDocuments();
    const gridCount = await db.collection('Grid').countDocuments();
    const activityCount = await db.collection('HiveActivity').countDocuments();
    
    console.log('\n📊 Seeding Summary:');
    console.log(`   Users: ${userCount}`);
    console.log(`   Marketplace Items: ${itemCount}`);
    console.log(`   Conversations: ${convCount}`);
    console.log(`   Scans: ${scanCount}`);
    console.log(`   Grids: ${gridCount}`);
    console.log(`   Hive Activities: ${activityCount}`);
    
  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    await client.close();
    console.log('\nConnection closed');
  }
}

async function seedUsers(db) {
  console.log('\n👤 Seeding User collection...');
  
  const passwordHash = await bcrypt.hash('password123', 10);
  
  const users = [
    {
      _id: new ObjectId(),
      username: 'sarah_bloom',
      email: 'sarah@bloom.com',
      passwordHash: passwordHash,
      profile: {
        firstName: 'Sarah',
        lastName: 'Johnson',
        avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
        bio: 'Mom of two, passionate about sustainable living! 🌱',
        phone: '+1-555-0123'
      },
      location: {
        type: 'Point',
        coordinates: [-122.4194, 37.7749], // San Francisco
        address: '123 Eco Street, San Francisco, CA',
        neighborhood: 'Mission District'
      },
      stats: {
        totalSaved: 2847,
        itemsSold: 43,
        itemsBought: 12,
        co2SavedKg: 156,
        reputation: 487
      },
      subscription: {
        isMamaPro: true,
        plan: 'monthly',
        expiresAt: new Date('2025-12-31')
      },
      preferences: {
        notifications: true,
        locationSharing: true,
        fcmToken: 'sample-fcm-token-sarah',
        preferredCategories: ['electronics', 'furniture', 'clothing', 'toys']
      },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: new ObjectId(),
      username: 'mike_eco',
      email: 'mike@bloom.com',
      passwordHash: passwordHash,
      profile: {
        firstName: 'Mike',
        lastName: 'Chen',
        avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
        bio: 'Tech enthusiast reducing e-waste one gadget at a time 📱♻️',
        phone: '+1-555-0124'
      },
      location: {
        type: 'Point',
        coordinates: [-122.3321, 47.6062], // Seattle
        address: '456 Tech Ave, Seattle, WA',
        neighborhood: 'Capitol Hill'
      },
      stats: {
        totalSaved: 1523,
        itemsSold: 28,
        itemsBought: 8,
        co2SavedKg: 89,
        reputation: 412
      },
      subscription: {
        isMamaPro: false,
        plan: 'free'
      },
      preferences: {
        notifications: true,
        locationSharing: false,
        preferredCategories: ['electronics', 'appliances']
      },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: new ObjectId(),
      username: 'emma_green',
      email: 'emma@bloom.com',
      passwordHash: passwordHash,
      profile: {
        firstName: 'Emma',
        lastName: 'Williams',
        avatar: 'https://randomuser.me/api/portraits/women/3.jpg',
        bio: 'Sustainable mom of three! Love finding treasures for my kids 🧸',
        phone: '+1-555-0125'
      },
      location: {
        type: 'Point',
        coordinates: [-122.4194, 37.7749], // San Francisco
        address: '789 Family Lane, San Francisco, CA',
        neighborhood: 'Noe Valley'
      },
      stats: {
        totalSaved: 3421,
        itemsSold: 67,
        itemsBought: 34,
        co2SavedKg: 234,
        reputation: 523
      },
      subscription: {
        isMamaPro: true,
        plan: 'yearly',
        expiresAt: new Date('2025-06-30')
      },
      preferences: {
        notifications: true,
        locationSharing: true,
        fcmToken: 'sample-fcm-token-emma',
        preferredCategories: ['clothing', 'toys', 'furniture', 'books']
      },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: new ObjectId(),
      username: 'alex_repair',
      email: 'alex@bloom.com',
      passwordHash: passwordHash,
      profile: {
        firstName: 'Alex',
        lastName: 'Martinez',
        avatar: 'https://randomuser.me/api/portraits/men/4.jpg',
        bio: 'Repair specialist & upcycling artist 🔧✨',
        phone: '+1-555-0126'
      },
      location: {
        type: 'Point',
        coordinates: [-97.7431, 30.2672], // Austin
        address: '321 Craft St, Austin, TX',
        neighborhood: 'East Austin'
      },
      stats: {
        totalSaved: 987,
        itemsSold: 15,
        itemsBought: 23,
        co2SavedKg: 67,
        reputation: 398
      },
      subscription: {
        isMamaPro: false,
        plan: 'free'
      },
      preferences: {
        notifications: false,
        locationSharing: true,
        preferredCategories: ['furniture', 'appliances', 'tools']
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];
  
  await db.collection('User').insertMany(users);
  console.log(`   Created ${users.length} users in User collection`);
  
  return users;
}

async function seedMarketplaceItems(db, users) {
  console.log('\n📦 Seeding MarketplaceItem collection...');
  
  const items = [
    {
      _id: new ObjectId(),
      title: 'Vintage KitchenAid Mixer - Pink! 💗',
      description: 'Beautiful vintage KitchenAid mixer in perfect condition. This pink beauty is perfect for all your baking needs! Group buy available - save 20% if 3+ people join.',
      category: 'appliances',
      condition: 'like-new',
      price: 120,
      originalPrice: 299,
      images: [
        'https://images.unsplash.com/photo-1556910103-1c02745a30bf?w=400',
        'https://images.unsplash.com/photo-1594385208974-2e75f8d7bb48?w=400'
      ],
      seller: {
        userId: users[0]._id,
        username: users[0].username,
        avatar: users[0].profile.avatar,
        rating: 4.8,
        location: users[0].profile.neighborhood
      },
      location: {
        type: 'Point',
        coordinates: [-122.4194, 37.7749],
        address: '123 Eco Street, San Francisco, CA'
      },
      groupBuy: {
        enabled: true,
        maxParticipants: 5,
        currentParticipants: 2,
        discountPercent: 20,
        endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        participants: [
          { userId: users[2]._id, username: users[2].username, joinedAt: new Date() },
          { userId: users[1]._id, username: users[1].username, joinedAt: new Date(Date.now() - 2 * 60 * 60 * 1000) }
        ]
      },
      sustainability: {
        co2SavedKg: 12.5,
        wasteDivertedKg: 8.2
      },
      status: 'active',
      views: 234,
      likes: 18,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: new ObjectId(),
      title: 'Ergonomic Office Chair - Great for WFH',
      description: 'High-quality ergonomic office chair with lumbar support. Barely used - upgrading to standing desk.',
      category: 'furniture',
      condition: 'new',
      price: 180,
      originalPrice: 450,
      images: [
        'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=400'
      ],
      seller: {
        userId: users[1]._id,
        username: users[1].username,
        avatar: users[1].profile.avatar,
        rating: 4.9,
        location: users[1].profile.neighborhood
      },
      location: {
        type: 'Point',
        coordinates: [-122.3321, 47.6062],
        address: '456 Tech Ave, Seattle, WA'
      },
      sustainability: {
        co2SavedKg: 23.7,
        wasteDivertedKg: 15.3
      },
      status: 'active',
      views: 156,
      likes: 12,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: new ObjectId(),
      title: 'Kids Book Bundle - Ages 3-8 📚',
      description: '15 educational books for young learners. Perfect for homeschooling or supplementing school learning.',
      category: 'books',
      condition: 'good',
      price: 35,
      originalPrice: 120,
      images: [
        'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400'
      ],
      seller: {
        userId: users[2]._id,
        username: users[2].username,
        avatar: users[2].profile.avatar,
        rating: 4.7,
        location: users[2].profile.neighborhood
      },
      location: {
        type: 'Point',
        coordinates: [-122.4194, 37.7749],
        address: '789 Family Lane, San Francisco, CA'
      },
      sustainability: {
        co2SavedKg: 5.8,
        wasteDivertedKg: 3.2
      },
      status: 'active',
      views: 89,
      likes: 7,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];
  
  await db.collection('MarketplaceItem').insertMany(items);
  console.log(`   Created ${items.length} marketplace items in MarketplaceItem collection`);
  
  return items;
}

async function seedConversations(db, users) {
  console.log('\n💬 Seeding Conversation collection...');
  
  const conversations = [
    {
      _id: new ObjectId(),
      participants: [
        { userId: users[0]._id, username: users[0].username, avatar: users[0].profile.avatar },
        { userId: users[2]._id, username: users[2].username, avatar: users[2].profile.avatar }
      ],
      messages: [
        {
          _id: new ObjectId(),
          senderId: users[2]._id,
          senderName: users[2].username,
          senderAvatar: users[2].profile.avatar,
          text: 'Hi Sarah! Is the pink mixer still available? 🎀',
          type: 'text',
          reactions: [],
          readBy: [{ userId: users[0]._id, readAt: new Date() }],
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
        },
        {
          _id: new ObjectId(),
          senderId: users[0]._id,
          senderName: users[0].username,
          senderAvatar: users[0].profile.avatar,
          text: 'Hi Emma! Yes it is! Would you like to see more photos?',
          type: 'text',
          reactions: [{ emoji: '💗', userId: users[2]._id }],
          readBy: [{ userId: users[2]._id, readAt: new Date() }],
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 15 * 60 * 1000)
        },
        {
          _id: new ObjectId(),
          senderId: users[2]._id,
          senderName: users[2].username,
          senderAvatar: users[2].profile.avatar,
          text: 'That would be great! Can I pick it up this weekend?',
          type: 'text',
          reactions: [],
          readBy: [{ userId: users[0]._id, readAt: new Date() }],
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
        }
      ],
      lastMessage: {
        text: 'That would be great! Can I pick it up this weekend?',
        senderId: users[2]._id,
        senderName: users[2].username,
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
      },
      type: 'direct',
      unreadCount: {},
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
    }
  ];
  
  await db.collection('Conversation').insertMany(conversations);
  console.log(`   Created ${conversations.length} conversations in Conversation collection`);
  
  return conversations;
}

async function seedScans(db, users) {
  console.log('\n📱 Seeding Scan collection...');
  
  const scans = [
    {
      _id: new ObjectId(),
      userId: users[0]._id,
      rawImage: 'https://images.unsplash.com/photo-1556910103-1c02745a30bf?w=400',
      rawText: 'KitchenAid Artisan Series 5-Quart Tilt-Head Stand Mixer',
      detectedItem: {
        name: 'KitchenAid Stand Mixer',
        category: 'appliances',
        brand: 'KitchenAid',
        condition: 'like-new',
        confidence: 0.95
      },
      estimatedValue: {
        originalPrice: 299,
        resaleValue: 120,
        currency: 'USD'
      },
      sustainability: {
        co2SavedKg: 12.5,
        wasteDivertedKg: 8.2
      },
      status: 'draft',
      location: {
        coordinates: [-122.4194, 37.7749],
        address: '123 Eco Street, San Francisco, CA'
      },
      metadata: {
        scannedAt: new Date(),
        deviceInfo: 'React Native iOS',
        aiModel: 'google-vision-v1'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: new ObjectId(),
      userId: users[2]._id,
      rawImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400',
      rawText: 'Children\'s Book Set Educational Learning',
      detectedItem: {
        name: 'Children Book Bundle',
        category: 'books',
        brand: null,
        condition: 'good',
        confidence: 0.88
      },
      estimatedValue: {
        originalPrice: 120,
        resaleValue: 35,
        currency: 'USD'
      },
      sustainability: {
        co2SavedKg: 5.8,
        wasteDivertedKg: 3.2
      },
      status: 'listed',
      listingId: new ObjectId(), // Would reference actual listing
      location: {
        coordinates: [-122.4194, 37.7749],
        address: '789 Family Lane, San Francisco, CA'
      },
      metadata: {
        scannedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        deviceInfo: 'React Native Android',
        aiModel: 'google-vision-v1'
      },
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      updatedAt: new Date()
    }
  ];
  
  await db.collection('Scan').insertMany(scans);
  console.log(`   Created ${scans.length} scans in Scan collection`);
  
  return scans;
}

async function seedGrids(db, users) {
  console.log('\n🏘️ Seeding Grid collection (Neighborhoods)...');
  
  const grids = [
    {
      _id: new ObjectId(),
      name: 'Mission District Moms',
      description: 'Sustainable moms in the Mission! Share, swap, and save together. 🌸',
      location: {
        type: 'Point',
        coordinates: [-122.4194, 37.7594],
        address: 'Mission District, San Francisco',
        radius: 2000 // 2km
      },
      items: [],
      members: [
        { userId: users[0]._id, username: users[0].username, avatar: users[0].profile.avatar, joinedAt: new Date(), role: 'admin' },
        { userId: users[2]._id, username: users[2].username, avatar: users[2].profile.avatar, joinedAt: new Date(), role: 'member' }
      ],
      stats: {
        totalItems: 15,
        totalSaved: 3240,
        activeMembers: 2
      },
      settings: {
        isPublic: true,
        requiresApproval: false,
        maxMembers: 50
      },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: new ObjectId(),
      name: 'Seattle Tech Reuse',
      description: 'Tech professionals reducing e-waste in Seattle. Gadgets, electronics, and more! 💻',
      location: {
        type: 'Point',
        coordinates: [-122.3321, 47.6062],
        address: 'Capitol Hill, Seattle',
        radius: 3000 // 3km
      },
      items: [],
      members: [
        { userId: users[1]._id, username: users[1].username, avatar: users[1].profile.avatar, joinedAt: new Date(), role: 'admin' }
      ],
      stats: {
        totalItems: 8,
        totalSaved: 1560,
        activeMembers: 1
      },
      settings: {
        isPublic: true,
        requiresApproval: true,
        maxMembers: 100
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];
  
  await db.collection('Grid').insertMany(grids);
  console.log(`   Created ${grids.length} grids in Grid collection`);
  
  return grids;
}

async function seedHiveActivities(db, users) {
  console.log('\n🐝 Seeding HiveActivity collection...');
  
  const activities = [
    {
      _id: new ObjectId(),
      type: 'workshop',
      title: 'Community Repair Workshop 🔧',
      description: 'Learn basic repair skills for electronics and furniture. Bring your broken items and let\'s fix them together! Tools provided.',
      organizer: {
        userId: users[3]._id,
        username: users[3].username,
        avatar: users[3].profile.avatar
      },
      location: {
        type: 'Point',
        coordinates: [-97.7431, 30.2672],
        address: 'Austin Community Center, 123 Main St'
      },
      startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
      maxParticipants: 25,
      currentParticipants: 12,
      participants: [
        { userId: users[0]._id, username: users[0].username, joinedAt: new Date() },
        { userId: users[1]._id, username: users[1].username, joinedAt: new Date() },
        { userId: users[2]._id, username: users[2].username, joinedAt: new Date() }
      ],
      category: 'workshop',
      images: ['https://images.unsplash.com/photo-1581092921461-eab62e97a782?w=400'],
      status: 'upcoming',
      sustainabilityImpact: {
        wasteReducedKg: 50,
        co2SavedKg: 25
      },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: new ObjectId(),
      type: 'group-buy',
      title: 'Bulk Organic Baby Food Co-op 🍼',
      description: 'Monthly co-op order for organic baby food and snacks. Save 30% when we order together!',
      organizer: {
        userId: users[2]._id,
        username: users[2].username,
        avatar: users[2].profile.avatar
      },
      location: {
        type: 'Point',
        coordinates: [-122.4194, 37.7749],
        address: 'Noe Valley Playground, San Francisco'
      },
      startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
      maxParticipants: 30,
      currentParticipants: 18,
      participants: [
        { userId: users[0]._id, username: users[0].username, joinedAt: new Date() },
        { userId: users[3]._id, username: users[3].username, joinedAt: new Date() }
      ],
      category: 'food',
      images: ['https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=400'],
      status: 'upcoming',
      sustainabilityImpact: {
        co2SavedKg: 75
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];
  
  await db.collection('HiveActivity').insertMany(activities);
  console.log(`   Created ${activities.length} activities in HiveActivity collection`);
  
  return activities;
}

// Run the seed function
seedDatabase();
