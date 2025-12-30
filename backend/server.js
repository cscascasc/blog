// 加载环境变量
require('dotenv').config();

// 导入所需模块
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');

// 创建 Express 应用
const app = express();

// 应用配置
app.use(helmet()); // 添加安全头部信息
app.use(cors()); // 启用跨域资源共享
app.use(morgan('combined')); // 记录请求日志
app.use(express.json()); // 解析 JSON 格式的请求体
app.use(express.urlencoded({ extended: true })); // 解析 URL 编码的请求体

// 基础路由
app.get('/', (req, res) => {
    res.json({
        message: '欢迎使用博客 API',
        version: '1.0.0'
    });
});

// API 路由
app.use('/api/articles', require('./routes/articles'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/tags', require('./routes/tags'));
app.use('/api/users', require('./routes/users'));
app.use('/api/friends', require('./routes/friends'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/templates', require('./routes/templates'));

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: '发生了一些错误！',
        message: err.message
    });
});

// 404 处理器 - 当找不到对应路由时返回此处理器
app.use('*', (req, res) => {
    res.status(404).json({
        error: '找不到该路由'
    });
});

// 服务器配置
const PORT = process.env.PORT || 3001;

// 启动服务器
app.listen(PORT, () => {
    console.log(`服务器正在 ${PORT} 端口上运行`);
});

module.exports = app;