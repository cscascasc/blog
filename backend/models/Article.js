// Article model
const db = require('../config/db');

class Article {
    // Get all articles with pagination and search
    static async getAll(options = {}) {
        const { page = 1, limit = 10, category, search } = options;
        const offset = (page - 1) * limit;

        let query = `SELECT a.*, u.username as author, c.name as category 
                     FROM articles a 
                     LEFT JOIN users u ON a.author_id = u.id 
                     LEFT JOIN categories c ON a.category_id = c.id`;
        let countQuery = `SELECT COUNT(*) as count 
                          FROM articles a 
                     LEFT JOIN users u ON a.author_id = u.id 
                     LEFT JOIN categories c ON a.category_id = c.id`;
        let whereClause = '';
        let params = [];

        // 添加搜索条件
        if (search) {
            if (whereClause) {
                whereClause += ' AND ';
            } else {
                whereClause = ' WHERE ';
            }
            whereClause += '(a.title LIKE ? OR a.content LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        // 添加分类条件
        if (category) {
            if (whereClause) {
                whereClause += ' AND ';
            } else {
                whereClause = ' WHERE ';
            }
            whereClause += 'c.name = ?';
            params.push(category);
        }

        // 添加 WHERE 子句到查询
        query += whereClause;
        countQuery += whereClause;

        // 添加排序和分页
        query += ' ORDER BY a.created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const [rows] = await db.execute(query, params);
        const [countResult] = await db.execute(countQuery, params.slice(0, -2)); // 移除 limit 和 offset 参数

        return {
            articles: rows,
            total: countResult[0].count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(countResult[0].count / limit)
        };
    }

    // Get article by ID with author and category info
    static async getById(id) {
        // 增加浏览量
        await db.execute(
            'UPDATE articles SET views = views + 1 WHERE id = ?',
            [id]
        );

        const [rows] = await db.execute(
            `SELECT a.*, u.username as author, c.name as category 
             FROM articles a 
             LEFT JOIN users u ON a.author_id = u.id 
             LEFT JOIN categories c ON a.category_id = c.id 
             WHERE a.id = ?`,
            [id]
        );
        return rows[0];
    }

    // Create new article
    static async create(article) {
        const { title, content, author_id, category_id } = article;
        const [result] = await db.execute(
            'INSERT INTO articles (title, content, author_id, category_id, views, created_at, updated_at) VALUES (?, ?, ?, ?, 0, NOW(), NOW())',
            [title, content, author_id, category_id]
        );
        return result.insertId;
    }

    // Update article
    static async update(id, article) {
        const { title, content, author_id, category_id } = article;
        const [result] = await db.execute(
            'UPDATE articles SET title = ?, content = ?, author_id = ?, category_id = ?, updated_at = NOW() WHERE id = ?',
            [title, content, author_id, category_id, id]
        );
        return result.affectedRows;
    }

    // Delete article
    static async delete(id) {
        const [result] = await db.execute('DELETE FROM articles WHERE id = ?', [id]);
        return result.affectedRows;
    }

    // Get recent articles (for homepage)
    static async getRecent(limit = 4) {
        const [rows] = await db.execute(
            `SELECT a.*, u.username as author, c.name as category 
             FROM articles a 
             LEFT JOIN users u ON a.author_id = u.id 
             LEFT JOIN categories c ON a.category_id = c.id 
             ORDER BY a.created_at DESC LIMIT ?`,
            [limit]
        );
        return rows;
    }

    // Search articles by title or content
    static async search(query) {
        const searchQuery = `%${query}%`;
        const [rows] = await db.execute(
            `SELECT a.*, u.username as author, c.name as category 
             FROM articles a 
             LEFT JOIN users u ON a.author_id = u.id 
             LEFT JOIN categories c ON a.category_id = c.id 
             WHERE a.title LIKE ? OR a.content LIKE ? 
             ORDER BY a.created_at DESC`,
            [searchQuery, searchQuery]
        );
        return rows;
    }

    // Get all categories
    static async getCategories() {
        const [rows] = await db.execute('SELECT id, name FROM categories');
        return rows;
    }

    // Get article publishing statistics by date
    static async getPublishingStats(startDate = null, endDate = null) {
        let sql = `
            SELECT 
                DATE(created_at) as date,
                COUNT(*) as count
            FROM articles`;

        const params = [];

        // 如果提供了日期范围，则添加 WHERE 条件
        if (startDate && endDate) {
            sql += ` WHERE created_at BETWEEN ? AND ?`;
            params.push(startDate, endDate);
        } else if (startDate) {
            sql += ` WHERE created_at >= ?`;
            params.push(startDate);
        } else if (endDate) {
            sql += ` WHERE created_at <= ?`;
            params.push(endDate);
        }

        sql += `
            GROUP BY DATE(created_at)
            ORDER BY date ASC`;

        const [rows] = await db.execute(sql, params);
        return rows;
    }

    // Get article statistics by category
    static async getCategoryStats(startDate = null, endDate = null) {
        let sql = `
            SELECT 
                c.name as category,
                COUNT(a.id) as count
            FROM categories c
            LEFT JOIN articles a ON c.id = a.category_id`;

        const params = [];

        // 如果提供了日期范围，则添加 WHERE 条件
        if (startDate && endDate) {
            sql += ` WHERE a.created_at BETWEEN ? AND ?`;
            params.push(startDate, endDate);
        } else if (startDate) {
            sql += ` WHERE a.created_at >= ?`;
            params.push(startDate);
        } else if (endDate) {
            sql += ` WHERE a.created_at <= ?`;
            params.push(endDate);
        }

        sql += `
            GROUP BY c.id, c.name
            ORDER BY count DESC`;

        const [rows] = await db.execute(sql, params);
        return rows;
    }

    // Get article statistics by tag
    static async getTagStats(startDate = null, endDate = null) {
        let sql = `
            SELECT 
                t.name as tag,
                COUNT(at.article_id) as count
            FROM tags t
            LEFT JOIN article_tags at ON t.id = at.tag_id
            LEFT JOIN articles a ON at.article_id = a.id`;

        const params = [];

        // 如果提供了日期范围，则添加 WHERE 条件
        if (startDate && endDate) {
            sql += ` WHERE a.created_at BETWEEN ? AND ?`;
            params.push(startDate, endDate);
        } else if (startDate) {
            sql += ` WHERE a.created_at >= ?`;
            params.push(startDate);
        } else if (endDate) {
            sql += ` WHERE a.created_at <= ?`;
            params.push(endDate);
        }

        sql += `
            GROUP BY t.id, t.name
            ORDER BY count DESC
            LIMIT 10`;

        const [rows] = await db.execute(sql, params);
        return rows;
    }

    // Get popular articles by views and comments
    static async getPopularArticles(limit = 10, startDate = null, endDate = null) {
        let sql = `
            SELECT 
                a.id,
                a.title,
                a.views,
                COUNT(c.id) as comment_count
            FROM articles a
            LEFT JOIN comments c ON a.id = c.article_id AND c.status = 'approved'`;

        const params = [parseInt(limit)];

        // 如果提供了日期范围，则添加 WHERE 条件
        if (startDate && endDate) {
            sql += ` WHERE a.created_at BETWEEN ? AND ?`;
            params.unshift(startDate, endDate);
        } else if (startDate) {
            sql += ` WHERE a.created_at >= ?`;
            params.unshift(startDate);
        } else if (endDate) {
            sql += ` WHERE a.created_at <= ?`;
            params.unshift(endDate);
        }

        sql += `
            GROUP BY a.id, a.title, a.views
            ORDER BY (a.views + COUNT(c.id) * 5) DESC
            LIMIT ?`;

        const [rows] = await db.execute(sql, params);
        return rows;
    }
}

module.exports = Article;