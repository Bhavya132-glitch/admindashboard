const express = require('express');
const CartItem = require('../models/CartItem');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

// Get all items
router.get('/', async (req, res) => {
    try {
        const items = await CartItem.find({ userId: req.user.userId });
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add item
router.post('/', async (req, res) => {
    try {
        const { name, quantity, price } = req.body;
        const newItem = new CartItem({
            userId: req.user.userId,
            name,
            quantity,
            price
        });
        await newItem.save();
        res.status(201).json(newItem);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update item
router.put('/:id', async (req, res) => {
    try {
        const { quantity, price } = req.body;
        const updateData = {};
        if (quantity !== undefined) updateData.quantity = quantity;
        if (price !== undefined) updateData.price = price;

        const updatedItem = await CartItem.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.userId },
            updateData,
            { new: true }
        );

        if (!updatedItem) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.json(updatedItem);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete item
router.delete('/:id', async (req, res) => {
    try {
        const deletedItem = await CartItem.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.userId
        });
        if (!deletedItem) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.json({ message: 'Item deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Clear cart
router.delete('/', async (req, res) => {
    try {
        await CartItem.deleteMany({ userId: req.user.userId });
        res.json({ message: 'Cart cleared' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
