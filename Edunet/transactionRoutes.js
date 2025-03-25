const express = require('express');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Middleware to authenticate JWT
const authenticate = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ message: 'Access denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(400).json({ message: 'Invalid token' });
  }
};

// Transfer funds
router.post('/transfer', authenticate, async (req, res) => {
  try {
    const { receiverEmail, amount, description } = req.body;

    const sender = await User.findById(req.userId);
    if (sender.balance < amount) {
      return res.status(400).json({ message: 'Insufficient funds' });
    }

    const receiver = await User.findOne({ email: receiverEmail });
    if (!receiver) {
      return res.status(404).json({ message: 'Receiver not found' });
    }

    // Deduct amount from sender and add to receiver
    sender.balance -= amount;
    receiver.balance += amount;

    await sender.save();
    await receiver.save();

    // Create transaction record
    const transaction = new Transaction({
      amount,
      description,
      sender: sender._id,
      receiver: receiver._id
    });

    await transaction.save();

    res.status(200).json({ message: 'Transfer successful', transaction });
  } catch (err) {
    res.status(500).json({ message: 'Error during transaction', error: err.message });
  }
});

// Get transaction history
router.get('/history', authenticate, async (req, res) => {
  try {
    const transactions = await Transaction.find({ 
      $or: [{ sender: req.userId }, { receiver: req.userId }] 
    }).populate('sender receiver', 'name email');
    
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching transaction history', error: err.message });
  }
});

module.exports = router;