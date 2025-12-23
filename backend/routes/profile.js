// 个人资料路由 - 处理个人资料相关请求
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

// 所有个人资料接口都需要认证
router.use(authenticateToken);

// 获取当前用户的个人资料
router.get('/', async (req, res) => {
    try {
        const user = await User.getById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: '用户不存在' });
        }

        // 构造个人资料响应
        const profile = {
            id: user.id,
            username: user.username,
            email: user.email,
            name: user.profile_name || '',
            title: user.profile_title || '',
            bio: user.profile_bio || '',
            skills: user.profile_skills || [],
            projects: user.profile_projects || [],
            phone: user.profile_phone || '',
            location: user.profile_location || ''
        };

        res.json(profile);
    } catch (error) {
        console.error('获取个人资料失败:', error);
        res.status(500).json({ error: '服务器内部错误' });
    }
});

// 更新当前用户的个人资料
router.put('/', async (req, res) => {
    try {
        const { name, title, bio, skills, projects, phone, location } = req.body;

        const profileData = {
            name: name || '',
            title: title || '',
            bio: bio || '',
            skills: skills || [],
            projects: projects || [],
            phone: phone || '',
            location: location || ''
        };

        const result = await User.updateProfile(req.user.id, profileData);
        if (result === 0) {
            return res.status(404).json({ error: '用户不存在' });
        }

        // 获取更新后的个人资料
        const updatedUser = await User.getById(req.user.id);
        const profile = {
            id: updatedUser.id,
            username: updatedUser.username,
            email: updatedUser.email,
            name: updatedUser.profile_name || '',
            title: updatedUser.profile_title || '',
            bio: updatedUser.profile_bio || '',
            skills: updatedUser.profile_skills || [],
            projects: updatedUser.profile_projects || [],
            phone: updatedUser.profile_phone || '',
            location: updatedUser.profile_location || ''
        };

        res.json({
            message: '个人资料更新成功',
            profile: profile
        });
    } catch (error) {
        console.error('更新个人资料失败:', error);
        res.status(500).json({ error: '服务器内部错误' });
    }
});

module.exports = router;