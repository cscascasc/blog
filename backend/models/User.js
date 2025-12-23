// 用户模型 - 处理用户相关的数据库操作
const db = require('../config/db');

// 确保数据库表结构是最新的
const initializeTableStructure = async () => {
    try {
        // 检查并添加个人资料相关字段（如果不存在）
        const [rows] = await db.execute(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = 'blog_db' 
            AND TABLE_NAME = 'users' 
            AND COLUMN_NAME IN (
                'profile_name', 
                'profile_title', 
                'profile_bio', 
                'profile_skills', 
                'profile_projects', 
                'profile_phone', 
                'profile_location'
            )
        `);

        const existingColumns = rows.map(row => row.COLUMN_NAME);

        // 定义需要的列
        const requiredColumns = [
            { name: 'profile_name', definition: 'VARCHAR(100)' },
            { name: 'profile_title', definition: 'VARCHAR(100)' },
            { name: 'profile_bio', definition: 'TEXT' },
            { name: 'profile_skills', definition: 'JSON' },
            { name: 'profile_projects', definition: 'JSON' },
            { name: 'profile_phone', definition: 'VARCHAR(20)' },
            { name: 'profile_location', definition: 'VARCHAR(100)' }
        ];

        // 添加缺失的列
        for (const column of requiredColumns) {
            if (!existingColumns.includes(column.name)) {
                // 使用单独的 ALTER TABLE 语句添加每个列
                await db.execute(`
                    ALTER TABLE users 
                    ADD COLUMN ${column.name} ${column.definition}
                `);
                console.log(`Added column ${column.name} to users table`);
            }
        }
    } catch (error) {
        console.error('初始化表结构失败:', error);
    }
};

// 初始化表结构
initializeTableStructure();

class User {
    // 根据ID获取用户
    static async getById(id) {
        const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [id]);
        return rows[0];
    }

    // 根据用户名获取用户
    static async getByUsername(username) {
        const [rows] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
        return rows[0];
    }

    // 创建新用户
    static async create(user) {
        const { username, email, password } = user;
        const [result] = await db.execute(
            'INSERT INTO users (username, email, password, role, status, created_at) VALUES (?, ?, ?, "author", "active", NOW())',
            [username, email, password]
        );
        return result.insertId;
    }

    // 更新用户资料
    static async updateProfile(id, profile) {
        const { name, title, bio, skills, projects, phone, location } = profile;
        const [result] = await db.execute(
            `UPDATE users SET 
                profile_name = ?, 
                profile_title = ?, 
                profile_bio = ?, 
                profile_skills = ?, 
                profile_projects = ?, 
                profile_phone = ?, 
                profile_location = ? 
            WHERE id = ?`,
            [name, title, bio, JSON.stringify(skills), JSON.stringify(projects), phone, location, id]
        );
        return result.changedRows;
    }
}

module.exports = User;