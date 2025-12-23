// Articles routes
const express = require('express');
const router = express.Router();
const Article = require('../models/Article');

// GET /api/articles/popular - Get popular articles by views and comments
router.get('/popular', async (req, res) => {
    try {
        const { startDate, endDate, limit = 10 } = req.query;
        const articles = await Article.getPopularArticles(limit, startDate, endDate);
        res.json(articles);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/articles - Get all articles with pagination and search
router.get('/', async (req, res) => {
    try {
        const { page, limit, category, search } = req.query;
        const options = {
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 10,
            category: category || null,
            search: search || null
        };

        const result = await Article.getAll(options);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/articles/:id - Get article by ID
router.get('/:id', async (req, res) => {
    try {
        const article = await Article.getById(req.params.id);
        if (!article) {
            return res.status(404).json({ error: 'Article not found' });
        }
        res.json(article);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/articles/categories - Get all categories
router.get('/categories', async (req, res) => {
    try {
        const categories = await Article.getCategories();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/articles/stats/publishing - Get article publishing statistics
router.get('/stats/publishing', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const stats = await Article.getPublishingStats(startDate, endDate);
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/articles/stats/categories - Get article statistics by category
router.get('/stats/categories', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const stats = await Article.getCategoryStats(startDate, endDate);
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/articles/stats/tags - Get article statistics by tag
router.get('/stats/tags', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const stats = await Article.getTagStats(startDate, endDate);
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/articles - Create a new article
router.post('/', async (req, res) => {
    try {
        const { title, content, excerpt, author_id, category_id } = req.body;

        // Validate required fields
        if (!title || !content || !author_id || !category_id) {
            return res.status(400).json({ error: 'Title, content, author_id, and category_id are required' });
        }

        const articleData = { title, content, author_id, category_id };
        const articleId = await Article.create(articleData);

        res.status(201).json({ id: articleId, message: 'Article created successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/articles/:id - Update an article
router.put('/:id', async (req, res) => {
    try {
        const { title, content, excerpt, author_id, category_id } = req.body;

        // Validate required fields
        if (!title || !content || !author_id || !category_id) {
            return res.status(400).json({ error: 'Title, content, author_id, and category_id are required' });
        }

        const articleData = { title, content, author_id, category_id };
        const result = await Article.update(req.params.id, articleData);

        if (result === 0) {
            return res.status(404).json({ error: 'Article not found' });
        }

        res.json({ message: 'Article updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/articles/:id - Delete an article
router.delete('/:id', async (req, res) => {
    try {
        const result = await Article.delete(req.params.id);

        if (result === 0) {
            return res.status(404).json({ error: 'Article not found' });
        }

        res.json({ message: 'Article deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;