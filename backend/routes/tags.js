// Tags routes
const express = require('express');
const router = express.Router();
const Tag = require('../models/Tag');

// GET /api/tags - Get all tags
router.get('/', async (req, res) => {
    try {
        const tags = await Tag.getAll();
        res.json(tags);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/tags/:id - Get tag by ID
router.get('/:id', async (req, res) => {
    try {
        const tag = await Tag.getById(req.params.id);
        if (!tag) {
            return res.status(404).json({ error: 'Tag not found' });
        }
        res.json(tag);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/tags - Create new tag
router.post('/', async (req, res) => {
    try {
        const tagId = await Tag.create(req.body);
        res.status(201).json({ id: tagId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/tags/:id - Update tag
router.put('/:id', async (req, res) => {
    try {
        const result = await Tag.update(req.params.id, req.body);
        if (result === 0) {
            return res.status(404).json({ error: 'Tag not found' });
        }
        res.json({ message: 'Tag updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/tags/:id - Delete tag
router.delete('/:id', async (req, res) => {
    try {
        const result = await Tag.delete(req.params.id);
        if (result === 0) {
            return res.status(404).json({ error: 'Tag not found' });
        }
        res.json({ message: 'Tag deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;