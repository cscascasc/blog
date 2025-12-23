// 数据库配置文件
const mysql = require('mysql2');

// 创建连接池
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',        // 数据库主机地址
    user: process.env.DB_USER || 'root',             // 数据库用户名
    password: process.env.DB_PASSWORD || '',         // 数据库密码
    database: process.env.DB_NAME || 'blog_db',      // 数据库名称
    waitForConnections: true,                        // 当无可用连接时是否等待
    connectionLimit: 10,                             // 连接池最大连接数
    queueLimit: 0                                    // 等待连接的队列最大长度，0表示无限制
});

// 获取基于 Promise 的连接池
const promisePool = pool.promise();

module.exports = promisePool;