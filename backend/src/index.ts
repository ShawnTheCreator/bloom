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

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
