import express from 'express';
import { User } from '../../models';

const router = express.Router();

// Get all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find({}, '-passwordHash');
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch users' });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id, '-passwordHash');
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch user' });
  }
});

// Get user summary (stats)
router.get('/:id/summary', async (req, res) => {
  try {
    const user = await User.findById(req.params.id, '-passwordHash');
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    res.json({
      success: true,
      summary: {
        userId: user._id,
        username: user.username,
        profile: user.profile,
        stats: user.stats,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch user summary' });
  }
});

export default router;
