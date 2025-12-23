// Categories routes
const express = require('express');
const router = express.Router();
const Category = require('../models/Category');

// GET /api/categories - Get all categories
router.get('/', async (req, res) => {
    try {
        const categories = await Category.getAll();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/categories/:id - Get category by ID
router.get('/:id', async (req, res) => {
    try {
        const category = await Category.getById(req.params.id);
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }
        res.json(category);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/categories - Create new category
router.post('/', async (req, res) => {
    try {
        const categoryId = await Category.create(req.body);
        res.status(201).json({ id: categoryId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/categories/:id - Update category
router.put('/:id', async (req, res) => {
    try {
        const result = await Category.update(req.params.id, req.body);
        if (result === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }
        res.json({ message: 'Category updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/categories/:id - Delete category
router.delete('/:id', async (req, res) => {
    try {
        const result = await Category.delete(req.params.id);
        if (result === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }
        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;