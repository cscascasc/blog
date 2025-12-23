// 用户管理路由 - 处理用户管理相关请求
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticateToken, requireAdmin, requirePermission } = require('../middleware/auth');

// 所有用户管理接口都需要认证
router.use(authenticateToken);

// 获取所有用户
router.get('/', requirePermission('manage_users'), async (req, res) => {
    try {
        const users = await User.getAll();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 获取单个用户
router.get('/:id', requirePermission('manage_users'), async (req, res) => {
    try {
        const user = await User.getById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: '用户不存在' });
        }
        // 不返回密码字段
        const { password, ...userInfo } = user;
        res.json(userInfo);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 更新用户
router.put('/:id', requirePermission('manage_users'), async (req, res) => {
    try {
        const { username, email, role, status } = req.body;
        const result = await User.update(req.params.id, { username, email, role, status });
        if (result === 0) {
            return res.status(404).json({ error: '用户不存在' });
        }
        // 获取更新后的用户信息
        const updatedUser = await User.getById(req.params.id);
        const { password, ...userInfo } = updatedUser;
        res.json({ message: '用户更新成功', user: userInfo });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 删除用户
router.delete('/:id', requirePermission('manage_users'), async (req, res) => {
    try {
        // 检查是否是管理员账户
        const user = await User.getById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: '用户不存在' });
        }

        if (user.role === 'admin') {
            return res.status(400).json({ error: '不能删除管理员账户' });
        }

        const result = await User.delete(req.params.id);
        if (result === 0) {
            return res.status(404).json({ error: '用户不存在' });
        }
        res.json({ message: '用户删除成功' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 更新用户状态
router.patch('/:id/status', requirePermission('manage_users'), async (req, res) => {
    try {
        const { status } = req.body;
        const result = await User.updateStatus(req.params.id, status);
        if (result === 0) {
            return res.status(404).json({ error: '用户不存在' });
        }
        res.json({ message: '用户状态更新成功' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;