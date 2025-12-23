// Friends routes
const express = require('express');
const router = express.Router();
const Friend = require('../models/Friend');

// GET /api/friends - Get all friends
router.get('/', async (req, res) => {
    try {
        const friends = await Friend.getAll();
        res.json(friends);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/friends/:id - Get friend by ID
router.get('/:id', async (req, res) => {
    try {
        const friend = await Friend.getById(req.params.id);
        if (!friend) {
            return res.status(404).json({ error: 'Friend not found' });
        }
        res.json(friend);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/friends - Create new friend
router.post('/', async (req, res) => {
    try {
        const friendId = await Friend.create(req.body);
        res.status(201).json({ id: friendId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/friends/:id - Update friend
router.put('/:id', async (req, res) => {
    try {
        const result = await Friend.update(req.params.id, req.body);
        if (result === 0) {
            return res.status(404).json({ error: 'Friend not found' });
        }
        res.json({ message: 'Friend updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/friends/:id - Delete friend
router.delete('/:id', async (req, res) => {
    try {
        const result = await Friend.delete(req.params.id);
        if (result === 0) {
            return res.status(404).json({ error: 'Friend not found' });
        }
        res.json({ message: 'Friend deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;