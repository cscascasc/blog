// Category model
const db = require('../config/db');

class Category {
    // Get all categories
    static async getAll() {
        const [rows] = await db.execute('SELECT * FROM categories');
        return rows;
    }

    // Get category by ID
    static async getById(id) {
        const [rows] = await db.execute('SELECT * FROM categories WHERE id = ?', [id]);
        return rows[0];
    }

    // Create new category
    static async create(category) {
        const { name, description } = category;
        const [result] = await db.execute(
            'INSERT INTO categories (name, description, created_at) VALUES (?, ?, NOW())',
            [name, description]
        );
        return result.insertId;
    }

    // Update category
    static async update(id, category) {
        const { name, description } = category;
        const [result] = await db.execute(
            'UPDATE categories SET name = ?, description = ? WHERE id = ?',
            [name, description, id]
        );
        return result.changedRows;
    }

    // Delete category
    static async delete(id) {
        const [result] = await db.execute('DELETE FROM categories WHERE id = ?', [id]);
        return result.affectedRows;
    }
}

module.exports = Category;