// Tag model
const db = require('../config/db');

class Tag {
    // Get all tags
    static async getAll() {
        const [rows] = await db.execute('SELECT * FROM tags');
        return rows;
    }

    // Get tag by ID
    static async getById(id) {
        const [rows] = await db.execute('SELECT * FROM tags WHERE id = ?', [id]);
        return rows[0];
    }

    // Create new tag
    static async create(tag) {
        const { name } = tag;
        const [result] = await db.execute(
            'INSERT INTO tags (name, created_at) VALUES (?, NOW())',
            [name]
        );
        return result.insertId;
    }

    // Update tag
    static async update(id, tag) {
        const { name } = tag;
        const [result] = await db.execute(
            'UPDATE tags SET name = ? WHERE id = ?',
            [name, id]
        );
        return result.changedRows;
    }

    // Delete tag
    static async delete(id) {
        const [result] = await db.execute('DELETE FROM tags WHERE id = ?', [id]);
        return result.affectedRows;
    }
}

module.exports = Tag;