// 认证路由 - 处理登录和注册请求
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const RememberToken = require('../models/RememberToken');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// 生成随机令牌
const generateToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

// 用户注册
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        // 棜查用户名是否已存在
        const existingUser = await User.getByUsername(username);
        if (existingUser) {
            return res.status(400).json({ error: '用户名已存在' });
        }

        // 密码加密
        const hashedPassword = await bcrypt.hash(password, 10);

        // 创建用户（在实际应用中，新用户的角色通常不是直接从前端传入）
        const userRole = role || 'author'; // 默认角色为作者
        const userId = await User.create({
            username,
            email,
            password: hashedPassword,
            role: userRole
        });

        // 获取创建的用户信息
        const newUser = await User.getById(userId);
        const { password: _, ...userInfo } = newUser;

        // 生成 JWT token
        const token = jwt.sign(
            { id: newUser.id, username: newUser.username, role: newUser.role },
            process.env.JWT_SECRET || 'blog_jwt_secret_key',
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: '用户注册成功',
            user: userInfo,
            token
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 用户登录
router.post('/login', async (req, res) => {
    try {
        const { username, password, rememberMe } = req.body;

        // 查找用户
        const user = await User.getByUsername(username);
        if (!user) {
            return res.status(400).json({ error: '用户名或密码错误' });
        }

        // 检查用户状态
        if (user.status !== 'active') {
            return res.status(400).json({ error: '用户账户已被禁用' });
        }

        // 验证密码
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ error: '用户名或密码错误' });
        }

        // 返回用户信息（不包括密码）
        const { password: _, ...userInfo } = user;

        // 生成 JWT token
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET || 'blog_jwt_secret_key',
            { expiresIn: '24h' }
        );

        let refreshToken = null;
        // 如果用户选择了"记住我"，生成记住我令牌
        if (rememberMe) {
            // 删除用户之前的记住我令牌
            await RememberToken.deleteByUserId(user.id);

            // 生成新的记住我令牌（7天有效期）
            refreshToken = generateToken();
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 7); // 7天后过期

            // 保存令牌到数据库
            await RememberToken.create(user.id, refreshToken, expiresAt);
        }

        res.json({
            message: '登录成功',
            user: userInfo,
            token,
            refreshToken
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 使用记住我令牌自动登录
router.post('/refresh', async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({ error: '缺少刷新令牌' });
        }

        // 查找令牌
        const rememberToken = await RememberToken.findByToken(refreshToken);
        if (!rememberToken) {
            return res.status(401).json({ error: '无效的刷新令牌' });
        }

        // 获取用户信息
        const user = await User.getById(rememberToken.user_id);
        if (!user) {
            return res.status(401).json({ error: '用户不存在' });
        }

        // 检查用户状态
        if (user.status !== 'active') {
            return res.status(401).json({ error: '用户账户已被禁用' });
        }

        // 返回用户信息（不包括密码）
        const { password: _, ...userInfo } = user;

        // 生成新的 JWT token
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET || 'blog_jwt_secret_key',
            { expiresIn: '24h' }
        );

        res.json({
            message: '自动登录成功',
            user: userInfo,
            token
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 用户登出
router.post('/logout', async (req, res) => {
    try {
        const { refreshToken } = req.body;

        // 如果提供了记住我令牌，则删除它
        if (refreshToken) {
            // 查找令牌
            const rememberToken = await RememberToken.findByToken(refreshToken);
            if (rememberToken) {
                // 删除令牌
                await RememberToken.deleteByUserId(rememberToken.user_id);
            }
        }

        res.json({ message: '登出成功' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;