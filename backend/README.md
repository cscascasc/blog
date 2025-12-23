# 博客后端 API

这是一个使用 Node.js、Express 和 MySQL 构建的博客后端 API。

## 项目结构

```
backend/
├── config/          # 配置文件
├── database/        # 数据库相关文件
├── models/          # 数据模型
├── routes/          # 路由定义
├── server.js        # 主服务文件
└── package.json     # 项目依赖配置
```

## API 接口

### 认证相关接口
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录

### 文章相关接口
- `GET /api/articles` - 获取所有文章
- `GET /api/articles/:id` - 获取特定文章
- `POST /api/articles` - 创建新文章
- `PUT /api/articles/:id` - 更新文章
- `DELETE /api/articles/:id` - 删除文章

### 分类相关接口
- `GET /api/categories` - 获取所有分类
- `GET /api/categories/:id` - 获取特定分类
- `POST /api/categories` - 创建新分类
- `PUT /api/categories/:id` - 更新分类
- `DELETE /api/categories/:id` - 删除分类

### 标签相关接口
- `GET /api/tags` - 获取所有标签
- `GET /api/tags/:id` - 获取特定标签
- `POST /api/tags` - 创建新标签
- `PUT /api/tags/:id` - 更新标签
- `DELETE /api/tags/:id` - 删除标签

### 用户相关接口
- `GET /api/users` - 获取所有用户
- `GET /api/users/:id` - 获取特定用户
- `POST /api/users` - 创建新用户
- `PUT /api/users/:id` - 更新用户信息
- `DELETE /api/users/:id` - 删除用户

### 友链相关接口
- `GET /api/friends` - 获取所有友链
- `GET /api/friends/:id` - 获取特定友链
- `POST /api/friends` - 创建新友链
- `PUT /api/friends/:id` - 更新友链
- `DELETE /api/friends/:id` - 删除友链

### 统计相关接口
- `GET /api/stats` - 获取博客统计数据

## 环境变量配置

创建 `.env` 文件并配置以下变量：

```
DB_HOST=localhost     # 数据库主机地址
DB_USER=root          # 数据库用户名
DB_PASSWORD=123456    # 数据库密码
DB_NAME=blog_db       # 数据库名称
PORT=3000             # 服务端口
```

## 安装和运行

1. 安装依赖：
   ```
   npm install
   ```

2. 初始化数据库：
   ```
   npm run init-db
   ```

3. 启动服务：
   ```
   npm start
   ```

   或者开发模式启动：
   ```
   npm run dev
   ```

## 数据库表结构

- `users` - 用户表
- `categories` - 文章分类表
- `tags` - 标签表
- `articles` - 文章表
- `article_tags` - 文章标签关联表（多对多）
- `friends` - 友链表