// Comment model
const db = require('../config/db');

class Comment {
    // Get comments by article ID
    static async getByArticleId(articleId) {
        const [rows] = await db.execute(
            `SELECT c.*, u.username as author 
             FROM comments c 
             LEFT JOIN users u ON c.user_id = u.id 
             WHERE c.article_id = ? AND c.status = 'approved'
             ORDER BY c.created_at DESC`,
            [articleId]
        );
        return rows;
    }

    // Create new comment
    static async create(comment) {
        const { article_id, user_id, content } = comment;
        const [result] = await db.execute(
            'INSERT INTO comments (article_id, user_id, content, status, created_at, likes) VALUES (?, ?, ?, ?, NOW(), 0)',
            [article_id, user_id, content, 'approved']
        );
        return result.insertId;
    }

    // Get comment by ID
    static async getById(id) {
        const [rows] = await db.execute(
            `SELECT c.*, u.username as author 
             FROM comments c 
             LEFT JOIN users u ON c.user_id = u.id 
             WHERE c.id = ?`,
            [id]
        );
        return rows[0];
    }

    // Update comment
    static async update(id, comment) {
        const { content, status } = comment;
        const [result] = await db.execute(
            'UPDATE comments SET content = ?, status = ? WHERE id = ?',
            [content, status, id]
        );
        return result.affectedRows;
    }

    // Delete comment
    static async delete(id) {
        const [result] = await db.execute('DELETE FROM comments WHERE id = ?', [id]);
        return result.affectedRows;
    }

    // Get total comments count for an article
    static async getCountByArticleId(articleId) {
        const [rows] = await db.execute(
            'SELECT COUNT(*) as count FROM comments WHERE article_id = ? AND status = "approved"',
            [articleId]
        );
        return rows[0].count;
    }

    // Get all comments (for admin)
    static async getAll() {
        const [rows] = await db.execute(
            `SELECT c.*, u.username as author, a.title as article_title
             FROM comments c
             LEFT JOIN users u ON c.user_id = u.id
             LEFT JOIN articles a ON c.article_id = a.id
             ORDER BY c.created_at DESC`
        );
        return rows;
    }

    // Like a comment
    static async likeComment(id) {
        const [result] = await db.execute(
            'UPDATE comments SET likes = likes + 1 WHERE id = ?',
            [id]
        );
        return result.affectedRows;
    }

    // Unlike a comment
    static async unlikeComment(id) {
        const [result] = await db.execute(
            'UPDATE comments SET likes = GREATEST(0, likes - 1) WHERE id = ?',
            [id]
        );
        return result.affectedRows;
    }
}

module.exports = Comment;