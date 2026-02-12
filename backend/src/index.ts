import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import marketplaceRoutes from './routes/marketplace';
import userRoutes from './routes/users';
import transactionRoutes from './routes/transactions';
import { seedDatabase } from '../seed';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bloom';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/users', userRoutes);
app.use('/api/transactions', transactionRoutes);

// Seed endpoint (protected by secret)
app.post('/api/seed', async (req, res) => {
  const { secret } = req.body;
  if (secret !== process.env.SEED_SECRET) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
  
  try {
    await seedDatabase();
    res.json({ success: true, message: 'Database seeded successfully' });
  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ success: false, error: 'Failed to seed database' });
  }
});

// Seed only marketplace items endpoint
app.post('/api/seed-items', async (req, res) => {
  const { secret } = req.body;
  if (secret !== process.env.SEED_SECRET) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
  
  try {
    const { MarketplaceItem } = await import('../models');
    
    // Clear only marketplace items
    await MarketplaceItem.deleteMany({});
    console.log('Cleared existing marketplace items');
    
    // Get existing users to link items to
    const { User } = await import('../models');
    const users = await User.find({});
    
    if (users.length === 0) {
      return res.status(400).json({ success: false, error: 'No users found. Seed users first.' });
    }
    
    const sarah = users.find((u: any) => u.username === 'sarah_bloom') || users[0];
    const mike = users.find((u: any) => u.username === 'mike_eco') || users[1];
    const emma = users.find((u: any) => u.username === 'emma_green') || users[2];
    const alex = users.find((u: any) => u.username === 'alex_repair') || users[3];
    
    const items = [
      {
        title: 'Vintage Kitchen Mixer - Group Buy Special',
        description: 'Beautiful vintage KitchenAid mixer in excellent condition.',
        category: 'appliances',
        condition: 'like-new',
        price: 120,
        originalPrice: 299,
        images: ['https://images.unsplash.com/photo-1556910103-1c02745a30bf?w=400'],
        seller: {
          userId: sarah._id,
          username: sarah.username,
          avatar: sarah.profile?.avatar,
          rating: 4.8,
          location: sarah.profile?.location || 'Portland, OR'
        },
        location: {
          type: 'Point',
          coordinates: [-122.6765, 45.5231],
          address: 'Portland, OR'
        },
        groupBuy: {
          enabled: true,
          maxParticipants: 5,
          currentParticipants: 2,
          discountPercent: 20,
          endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          participants: []
        },
        sustainability: { co2SavedKg: 12.5, wasteDivertedKg: 8.2, localProduction: true },
        status: 'active',
        views: 234,
        likes: 18
      },
      {
        title: 'Modern Office Chair - Ergonomic Design',
        description: 'High-quality office chair with lumbar support.',
        category: 'furniture',
        condition: 'new',
        price: 180,
        originalPrice: 450,
        images: ['https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=400'],
        seller: {
          userId: mike._id,
          username: mike.username,
          avatar: mike.profile?.avatar,
          rating: 4.9,
          location: mike.profile?.location || 'Seattle, WA'
        },
        location: {
          type: 'Point',
          coordinates: [-122.3321, 47.6062],
          address: 'Seattle, WA'
        },
        sustainability: { co2SavedKg: 23.7, wasteDivertedKg: 15.3, localProduction: false },
        status: 'active',
        views: 156,
        likes: 12
      },
      {
        title: 'Kids Educational Books Bundle',
        description: 'Set of 15 educational books for ages 3-8.',
        category: 'books',
        condition: 'good',
        price: 35,
        originalPrice: 120,
        images: ['https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400'],
        seller: {
          userId: emma._id,
          username: emma.username,
          avatar: emma.profile?.avatar,
          rating: 4.7,
          location: emma.profile?.location || 'San Francisco, CA'
        },
        location: {
          type: 'Point',
          coordinates: [-122.4194, 37.7749],
          address: 'San Francisco, CA'
        },
        sustainability: { co2SavedKg: 5.8, wasteDivertedKg: 3.2, localProduction: true },
        status: 'active',
        views: 89,
        likes: 7
      }
    ];
    
    await MarketplaceItem.insertMany(items);
    const count = await MarketplaceItem.countDocuments();
    
    res.json({ success: true, message: `Seeded ${items.length} marketplace items`, totalItems: count });
  } catch (error: any) {
    console.error('Seed items error:', error);
    res.status(500).json({ success: false, error: 'Failed to seed items', details: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
