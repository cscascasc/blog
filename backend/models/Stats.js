// Stats model
const db = require('../config/db');

class Stats {
    // Get blog statistics
    static async getBlogStats() {
        // Get articles count
        const [articlesResult] = await db.execute('SELECT COUNT(*) as count FROM articles');
        const articlesCount = articlesResult[0].count;

        // Get tags count
        const [tagsResult] = await db.execute('SELECT COUNT(*) as count FROM tags');
        const tagsCount = tagsResult[0].count;

        // Get friends count
        const [friendsResult] = await db.execute('SELECT COUNT(*) as count FROM friends WHERE status = "active"');
        const friendsCount = friendsResult[0].count;

        // Get categories count
        const [categoriesResult] = await db.execute('SELECT COUNT(*) as count FROM categories');
        const categoriesCount = categoriesResult[0].count;

        // Get users count
        const [usersResult] = await db.execute('SELECT COUNT(*) as count FROM users');
        const usersCount = usersResult[0].count;

        // Get total views
        const [viewsResult] = await db.execute('SELECT SUM(views) as total FROM articles');
        const totalViews = viewsResult[0].total || 0;

        return {
            articles: articlesCount,
            tags: tagsCount,
            friends: friendsCount,
            categories: categoriesCount,
            users: usersCount,
            views: totalViews
        };
    }
}

module.exports = Stats;