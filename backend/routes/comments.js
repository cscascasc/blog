// Comments routes
const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');

// GET /api/comments - Get all comments (admin only)
router.get('/', async (req, res) => {
    try {
        const comments = await Comment.getAll();
        res.json(comments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/comments/article/:articleId - Get comments by article ID
router.get('/article/:articleId', async (req, res) => {
    try {
        const comments = await Comment.getByArticleId(req.params.articleId);
        res.json(comments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/comments - Create new comment
router.post('/', async (req, res) => {
    try {
        const commentId = await Comment.create(req.body);
        res.status(201).json({ id: commentId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/comments/:id - Update comment
router.put('/:id', async (req, res) => {
    try {
        const result = await Comment.update(req.params.id, req.body);
        if (result === 0) {
            return res.status(404).json({ error: 'Comment not found' });
        }
        res.json({ message: 'Comment updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/comments/:id - Delete comment
router.delete('/:id', async (req, res) => {
    try {
        const result = await Comment.delete(req.params.id);
        if (result === 0) {
            return res.status(404).json({ error: 'Comment not found' });
        }
        res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/comments/:id/like - Like a comment
router.post('/:id/like', async (req, res) => {
    try {
        const result = await Comment.likeComment(req.params.id);
        if (result === 0) {
            return res.status(404).json({ error: 'Comment not found' });
        }
        res.json({ message: 'Comment liked successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/comments/:id/unlike - Unlike a comment
router.post('/:id/unlike', async (req, res) => {
    try {
        const result = await Comment.unlikeComment(req.params.id);
        if (result === 0) {
            return res.status(404).json({ error: 'Comment not found' });
        }
        res.json({ message: 'Comment unliked successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;