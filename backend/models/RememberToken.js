// 记住我令牌模型 - 处理记住我令牌相关的数据库操作
const db = require('../config/db');

class RememberToken {
    // 创建新的记住我令牌
    static async create(userId, token, expiresAt) {
        const [result] = await db.execute(
            'INSERT INTO remember_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
            [userId, token, expiresAt]
        );
        return result.insertId;
    }

    // 根据令牌查找记录
    static async findByToken(token) {
        const [rows] = await db.execute(
            'SELECT * FROM remember_tokens WHERE token = ? AND expires_at > NOW()',
            [token]
        );
        return rows[0];
    }

    // 删除用户的令牌
    static async deleteByUserId(userId) {
        const [result] = await db.execute(
            'DELETE FROM remember_tokens WHERE user_id = ?',
            [userId]
        );
        return result.affectedRows;
    }

    // 删除过期的令牌
    static async deleteExpired() {
        const [result] = await db.execute(
            'DELETE FROM remember_tokens WHERE expires_at <= NOW()'
        );
        return result.affectedRows;
    }
}

module.exports = RememberToken;