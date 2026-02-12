import express from 'express';
import mongoose from 'mongoose';
import { MarketplaceItem } from '../../models';

const router = express.Router();

// Get all marketplace items
router.get('/items', async (req, res) => {
  try {
    const { category, status = 'active', groupBuy, limit = 20, skip = 0 } = req.query;
    
    const query: any = { status };
    if (category && category !== 'All') query.category = category;
    if (groupBuy === 'true') query['groupBuy.enabled'] = true;
    
    console.log('Fetching items with query:', query);
    
    const items = await MarketplaceItem.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(skip));
    
    console.log(`Found ${items.length} items`);
    res.json({ success: true, items, count: items.length });
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch items', details: String(error) });
  }
});

// Get single item
router.get('/items/:id', async (req, res) => {
  try {
    const item = await MarketplaceItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }
    res.json({ success: true, item });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch item' });
  }
});

// Create new marketplace item
router.post('/items', async (req, res) => {
  try {
    const { 
      title, 
      description, 
      category, 
      condition, 
      price, 
      originalPrice,
      images,
      seller,
      location,
      groupBuy,
      sustainability 
    } = req.body;

    // Validate required fields
    if (!title || !description || !category || !condition || !price || !seller || !location) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields' 
      });
    }

    const item = new MarketplaceItem({
      title,
      description,
      category,
      condition,
      price,
      originalPrice,
      images: images || [],
      seller,
      location,
      groupBuy: groupBuy || { enabled: false },
      sustainability: sustainability || { co2SavedKg: 0, wasteDivertedKg: 0, localProduction: false },
      status: 'active',
      views: 0,
      likes: 0
    });

    await item.save();
    
    res.status(201).json({ success: true, item });
  } catch (error) {
    console.error('Create item error:', error);
    res.status(500).json({ success: false, error: 'Failed to create item' });
  }
});

// Join group buy
router.post('/items/:id/join', async (req, res) => {
  try {
    const { userId, username } = req.body;
    
    if (!userId || !username) {
      return res.status(400).json({ 
        success: false, 
        error: 'User ID and username required' 
      });
    }

    const item = await MarketplaceItem.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }

    if (!item.groupBuy?.enabled) {
      return res.status(400).json({ 
        success: false, 
        error: 'Group buy not enabled for this item' 
      });
    }

    // Check if user already joined
    const alreadyJoined = item.groupBuy.participants.some(
      (p: any) => p.userId.toString() === userId
    );
    
    if (alreadyJoined) {
      return res.status(400).json({ 
        success: false, 
        error: 'Already joined this group buy' 
      });
    }

    // Check if group buy is full
    if (item.groupBuy.currentParticipants >= item.groupBuy.maxParticipants) {
      return res.status(400).json({ 
        success: false, 
        error: 'Group buy is full' 
      });
    }

    // Check if group buy has ended
    if (item.groupBuy.endTime && new Date() > item.groupBuy.endTime) {
      return res.status(400).json({ 
        success: false, 
        error: 'Group buy has ended' 
      });
    }

    // Add participant
    item.groupBuy.participants.push({
      userId: new mongoose.Types.ObjectId(userId) as any,
      username,
      joinedAt: new Date()
    } as any);
    item.groupBuy.currentParticipants += 1;

    await item.save();
    
    res.json({ 
      success: true, 
      message: 'Successfully joined group buy',
      item 
    });
  } catch (error) {
    console.error('Join group buy error:', error);
    res.status(500).json({ success: false, error: 'Failed to join group buy' });
  }
});

// Leave group buy
router.post('/items/:id/leave', async (req, res) => {
  try {
    const { userId } = req.body;
    
    const item = await MarketplaceItem.findById(req.params.id);
    
    if (!item || !item.groupBuy?.enabled) {
      return res.status(404).json({ success: false, error: 'Item or group buy not found' });
    }

    // Remove participant
    item.groupBuy.participants = item.groupBuy.participants.filter(
      (p: any) => p.userId.toString() !== userId
    );
    item.groupBuy.currentParticipants = Math.max(0, item.groupBuy.currentParticipants - 1);

    await item.save();
    
    res.json({ 
      success: true, 
      message: 'Successfully left group buy',
      item 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to leave group buy' });
  }
});

// Like/unlike item
router.post('/items/:id/like', async (req, res) => {
  try {
    const { userId } = req.body;
    
    const item = await MarketplaceItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }

    // For now, just increment likes
    item.likes += 1;
    await item.save();
    
    res.json({ success: true, likes: item.likes });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to like item' });
  }
});

// Get categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await MarketplaceItem.distinct('category');
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch categories' });
  }
});

export default router;
