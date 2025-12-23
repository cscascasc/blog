// Stats routes
const express = require('express');
const router = express.Router();
const Stats = require('../models/Stats');

// GET /api/stats - Get blog statistics
router.get('/', async (req, res) => {
    try {
        const stats = await Stats.getBlogStats();
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;