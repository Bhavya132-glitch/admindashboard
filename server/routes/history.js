const express = require('express');
const History = require('../models/History');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

// Get history
router.get('/', async (req, res) => {
    try {
        const history = await History.find({ userId: req.user.userId }).sort({ createdAt: -1 });
        res.json(history);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add history item
router.post('/', async (req, res) => {
    try {
        const { query } = req.body;
        if (!query) return res.status(400).json({ message: 'Query is required' });

        const newHistory = new History({
            userId: req.user.userId,
            query
        });
        await newHistory.save();
        res.status(201).json(newHistory);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Clear history (Optional utility)
router.delete('/', async (req, res) => {
    try {
        await History.deleteMany({ userId: req.user.userId });
        res.json({ message: 'History cleared' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
