// Friend model
const db = require('../config/db');

class Friend {
    // Get all friends
    static async getAll() {
        const [rows] = await db.execute('SELECT * FROM friends ORDER BY created_at DESC');
        return rows;
    }

    // Get friend by ID
    static async getById(id) {
        const [rows] = await db.execute('SELECT * FROM friends WHERE id = ?', [id]);
        return rows[0];
    }

    // Create new friend
    static async create(friend) {
        const { name, url, description, status } = friend;
        const [result] = await db.execute(
            'INSERT INTO friends (name, url, description, status) VALUES (?, ?, ?, ?)',
            [name, url, description, status]
        );
        return result.insertId;
    }

    // Update friend
    static async update(id, friend) {
        const { name, url, description, status } = friend;
        const [result] = await db.execute(
            'UPDATE friends SET name = ?, url = ?, description = ?, status = ? WHERE id = ?',
            [name, url, description, status, id]
        );
        return result.affectedRows;
    }

    // Delete friend
    static async delete(id) {
        const [result] = await db.execute('DELETE FROM friends WHERE id = ?', [id]);
        return result.affectedRows;
    }
}

module.exports = Friend;