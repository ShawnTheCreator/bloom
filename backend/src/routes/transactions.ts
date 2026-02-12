import express from 'express';
import { Transaction } from '../../models';

const router = express.Router();

// Get all transactions
router.get('/', async (req, res) => {
  try {
    const { userId, type, limit = 20 } = req.query;
    
    const query: any = {};
    if (userId) {
      query.$or = [
        { 'buyer.userId': userId },
        { 'seller.userId': userId }
      ];
    }
    if (type) query.type = type;
    
    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit));
    
    res.json({ success: true, transactions });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch transactions' });
  }
});

// Create transaction
router.post('/', async (req, res) => {
  try {
    const {
      type,
      item,
      buyer,
      seller,
      amount,
      fee,
      netAmount,
      paymentMethod,
      groupBuy
    } = req.body;

    const transaction = new Transaction({
      type,
      item,
      buyer,
      seller,
      amount,
      fee: fee || 0,
      netAmount,
      paymentMethod,
      groupBuy,
      status: 'pending'
    });

    await transaction.save();
    res.status(201).json({ success: true, transaction });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create transaction' });
  }
});

export default router;
