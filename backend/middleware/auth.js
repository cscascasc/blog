// 权限验证中间件
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 验证 token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ error: '访问令牌缺失' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'blog_jwt_secret_key', async (err, user) => {
        if (err) {
            return res.status(403).json({ error: '访问令牌无效' });
        }

        // 获取完整的用户信息（包括角色）
        try {
            const fullUser = await User.getById(user.id);
            if (!fullUser) {
                return res.status(403).json({ error: '用户不存在' });
            }

            if (fullUser.status !== 'active') {
                return res.status(403).json({ error: '用户账户已被禁用' });
            }

            req.user = fullUser;
            next();
        } catch (error) {
            return res.status(500).json({ error: '服务器内部错误' });
        }
    });
};

// 验证管理员权限
const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: '需要管理员权限' });
    }
    next();
};

// 验证特定角色权限
const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: '权限不足' });
        }
        next();
    };
};

// 验证特定权限
const requirePermission = (permission) => {
    return (req, res, next) => {
        // 角色权限映射
        const rolePermissions = {
            admin: [
                'manage_articles',
                'manage_categories',
                'manage_tags',
                'manage_friends',
                'manage_users',
                'manage_settings',
                'view_dashboard'
            ],
            editor: [
                'manage_articles',
                'manage_categories',
                'manage_tags',
                'manage_friends',
                'view_dashboard'
            ],
            author: [
                'manage_articles',
                'view_dashboard'
            ],
            subscriber: [
                'view_dashboard'
            ]
        };

        const permissions = rolePermissions[req.user.role] || [];
        if (!permissions.includes(permission)) {
            return res.status(403).json({ error: '权限不足' });
        }
        next();
    };
};

module.exports = {
    authenticateToken,
    requireAdmin,
    requireRole,
    requirePermission
};