const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// 数据库查询辅助函数
const dbQuery = async (query, params) => {
    try {
        const [rows] = await db.execute(query, params);
        return rows;
    } catch (error) {
        throw error;
    }
};

// 保存模板
router.post('/save-template', authenticateToken, async (req, res) => {
    const { name, description, content, type } = req.body;
    const userId = req.user.id;

    try {
        // 检查是否存在同名模板
        const checkQuery = 'SELECT id FROM user_templates WHERE user_id = ? AND name = ? AND type = ?';
        const existingTemplates = await dbQuery(checkQuery, [userId, name, type]);

        if (existingTemplates.length > 0) {
            // 如果存在同名模板，更新现有模板
            const updateQuery = 'UPDATE user_templates SET description = ?, content = ?, created_at = NOW() WHERE user_id = ? AND name = ? AND type = ?';
            const result = await dbQuery(updateQuery, [description, JSON.stringify(content), userId, name, type]);

            res.status(200).json({
                message: '模板已更新',
                templateId: existingTemplates[0].id
            });
        } else {
            // 如果不存在同名模板，创建新模板
            const insertQuery = 'INSERT INTO user_templates (user_id, name, description, content, type, created_at) VALUES (?, ?, ?, ?, ?, NOW())';
            const result = await dbQuery(insertQuery, [userId, name, description, JSON.stringify(content), type]);

            res.status(201).json({
                message: '模板保存成功',
                templateId: result.insertId
            });
        }
    } catch (err) {
        console.error('保存模板失败:', err);
        return res.status(500).json({ error: '保存模板失败' });
    }
});

// 获取用户保存的模板列表
router.get('/user-templates', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const { type } = req.query; // 可选的模板类型过滤

    let query = 'SELECT id, name, description, type, created_at FROM user_templates WHERE user_id = ?';
    let params = [userId];

    if (type) {
        query += ' AND type = ?';
        params.push(type);
    }

    query += ' ORDER BY created_at DESC';

    dbQuery(query, params)
        .then(results => {
            res.json({ templates: results });
        })
        .catch(err => {
            console.error('获取模板列表失败:', err);
            return res.status(500).json({ error: '获取模板列表失败' });
        });
});

// 获取特定模板详情
router.get('/template/:id', authenticateToken, (req, res) => {
    const templateId = req.params.id;
    const userId = req.user.id;

    const query = 'SELECT id, name, description, content, type, created_at FROM user_templates WHERE id = ? AND user_id = ?';

    dbQuery(query, [templateId, userId])
        .then(results => {
            if (results.length === 0) {
                return res.status(404).json({ error: '模板不存在或无权限访问' });
            }

            const template = results[0];
            try {
                template.content = JSON.parse(template.content); // 解析JSON内容
            } catch (parseError) {
                console.error('解析模板内容失败:', parseError);
                // 如果解析失败，返回原始内容
                template.content = template.content;
            }

            res.json({ template });
        })
        .catch(err => {
            console.error('获取模板详情失败:', err);
            return res.status(500).json({ error: '获取模板详情失败' });
        });
});

// 删除模板
router.delete('/template/:id', authenticateToken, (req, res) => {
    const templateId = req.params.id;
    const userId = req.user.id;

    const query = 'DELETE FROM user_templates WHERE id = ? AND user_id = ?';

    dbQuery(query, [templateId, userId])
        .then(result => {
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: '模板不存在或无权限删除' });
            }

            res.json({ message: '模板删除成功' });
        })
        .catch(err => {
            console.error('删除模板失败:', err);
            return res.status(500).json({ error: '删除模板失败' });
        });
});

// 保存编辑的内容
router.post('/save-content', authenticateToken, (req, res) => {
    const { title, description, content } = req.body;
    const userId = req.user.id;

    const query = 'INSERT INTO user_contents (user_id, title, description, content, created_at) VALUES (?, ?, ?, ?, NOW())';

    dbQuery(query, [userId, title, description, JSON.stringify(content)])
        .then(result => {
            res.status(201).json({
                message: '内容保存成功',
                contentId: result.insertId
            });
        })
        .catch(err => {
            console.error('保存内容失败:', err);
            return res.status(500).json({ error: '保存内容失败' });
        });
});

// 获取用户保存的内容列表
router.get('/user-contents', authenticateToken, (req, res) => {
    const userId = req.user.id;

    const query = 'SELECT id, title, description, created_at FROM user_contents WHERE user_id = ? ORDER BY created_at DESC';

    dbQuery(query, [userId])
        .then(results => {
            res.json({ contents: results });
        })
        .catch(err => {
            console.error('获取内容列表失败:', err);
            return res.status(500).json({ error: '获取内容列表失败' });
        });
});

// 获取特定内容详情
router.get('/content/:id', authenticateToken, (req, res) => {
    const contentId = req.params.id;
    const userId = req.user.id;

    const query = 'SELECT id, title, description, content, created_at FROM user_contents WHERE id = ? AND user_id = ?';

    dbQuery(query, [contentId, userId])
        .then(results => {
            if (results.length === 0) {
                return res.status(404).json({ error: '内容不存在或无权限访问' });
            }

            const content = results[0];
            content.content = JSON.parse(content.content); // 解析JSON内容

            res.json({ content });
        })
        .catch(err => {
            console.error('获取内容详情失败:', err);
            return res.status(500).json({ error: '获取内容详情失败' });
        });
});

// 删除内容
router.delete('/content/:id', authenticateToken, (req, res) => {
    const contentId = req.params.id;
    const userId = req.user.id;

    const query = 'DELETE FROM user_contents WHERE id = ? AND user_id = ?';

    dbQuery(query, [contentId, userId])
        .then(result => {
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: '内容不存在或无权限删除' });
            }

            res.json({ message: '内容删除成功' });
        })
        .catch(err => {
            console.error('删除内容失败:', err);
            return res.status(500).json({ error: '删除内容失败' });
        });
});

module.exports = router;