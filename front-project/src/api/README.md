# 前端API接口文档

本目录包含了前端项目中所有与后端API交互的接口封装。

## 目录结构

```
src/api/
├── article.ts    # 文章相关接口
├── auth.ts       # 认证相关接口（登录/注册）
├── category.ts   # 分类相关接口
├── friend.ts     # 友链相关接口
├── stats.ts      # 统计相关接口
├── tag.ts        # 标签相关接口
└── user.ts       # 用户相关接口
```

## 使用方法

在组件中导入需要的API函数：

```typescript
import { getArticles, getArticleById } from '@/api/article'

// 获取所有文章
const articles = await getArticles()

// 获取特定文章
const article = await getArticleById(1)
```

## 接口列表

### 认证接口 (auth.ts)
- `login(data)` - 用户登录
- `register(data)` - 用户注册

### 文章接口 (article.ts)
- `getArticles()` - 获取所有文章
- `getArticleById(id)` - 根据ID获取文章
- `createArticle(data)` - 创建文章
- `updateArticle(id, data)` - 更新文章
- `deleteArticle(id)` - 删除文章

### 分类接口 (category.ts)
- `getCategories()` - 获取所有分类
- `getCategoryById(id)` - 根据ID获取分类
- `createCategory(data)` - 创建分类
- `updateCategory(id, data)` - 更新分类
- `deleteCategory(id)` - 删除分类

### 标签接口 (tag.ts)
- `getTags()` - 获取所有标签
- `getTagById(id)` - 根据ID获取标签
- `createTag(data)` - 创建标签
- `updateTag(id, data)` - 更新标签
- `deleteTag(id)` - 删除标签

### 用户接口 (user.ts)
- `getUsers()` - 获取所有用户
- `getUserById(id)` - 根据ID获取用户
- `createUser(data)` - 创建用户
- `updateUser(id, data)` - 更新用户
- `deleteUser(id)` - 删除用户

### 友链接口 (friend.ts)
- `getFriends()` - 获取所有友链
- `getFriendById(id)` - 根据ID获取友链
- `createFriend(data)` - 创建友链
- `updateFriend(id, data)` - 更新友链
- `deleteFriend(id)` - 删除友链

### 统计接口 (stats.ts)
- `getBlogStats()` - 获取博客统计数据

## 错误处理

所有API函数都返回Promise，可以使用async/await或.then().catch()进行错误处理：

```typescript
try {
  const data = await getArticles()
  // 处理数据
} catch (error) {
  // 处理错误
  console.error('获取文章失败:', error)
}
```