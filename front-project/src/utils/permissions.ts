// 权限管理工具

// 定义角色类型
export type Role = 'admin' | 'editor' | 'author' | 'subscriber'

// 定义权限类型
export type Permission =
    | 'manage_articles'     // 管理文章
    | 'manage_categories'   // 管理分类
    | 'manage_tags'         // 管理标签
    | 'manage_friends'      // 管理友链
    | 'manage_users'        // 管理用户
    | 'manage_settings'     // 管理设置
    | 'view_dashboard'      // 查看仪表盘

// 当前登录用户信息
let currentUser: { role: Role } | null = null;

// 设置当前用户
export function setCurrentUser(user: { role: Role } | null) {
    currentUser = user;
}

// 获取当前用户角色
export function getCurrentUserRole(): Role | null {
    return currentUser ? currentUser.role : null;
}

// 角色权限映射
const rolePermissions: Record<Role, Permission[]> = {
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
}

// 检查用户是否具有特定权限
export function hasPermission(userRole: Role | string, permission: Permission): boolean {
    const permissions = rolePermissions[userRole as Role] || []
    return permissions.includes(permission)
}

// 检查用户是否具有多个权限中的任意一个
export function hasAnyPermission(userRole: Role, permissions: Permission[]): boolean {
    return permissions.some(permission => hasPermission(userRole, permission))
}

// 检查用户是否具有所有指定权限
export function hasAllPermissions(userRole: Role, permissions: Permission[]): boolean {
    return permissions.every(permission => hasPermission(userRole, permission))
}

// 获取角色可访问的路由
export function getRoleRoutes(userRole: Role): string[] {
    const routes: string[] = ['/admin']

    if (hasPermission(userRole, 'view_dashboard')) {
        routes.push('/admin/dashboard')
    }

    if (hasPermission(userRole, 'manage_articles')) {
        routes.push('/admin/articles')
    }

    if (hasPermission(userRole, 'manage_categories')) {
        routes.push('/admin/categories')
    }

    if (hasPermission(userRole, 'manage_tags')) {
        routes.push('/admin/tags')
    }

    if (hasPermission(userRole, 'manage_friends')) {
        routes.push('/admin/friends')
    }

    if (hasPermission(userRole, 'manage_users')) {
        routes.push('/admin/users')
    }

    if (hasPermission(userRole, 'manage_settings')) {
        routes.push('/admin/settings')
    }

    return routes
}

// 角色显示名称映射
export const roleDisplayNames: Record<Role, string> = {
    admin: '管理员',
    editor: '编辑者',
    author: '作者',
    subscriber: '订阅者'
}

// 权限显示名称映射
export const permissionDisplayNames: Record<Permission, string> = {
    manage_articles: '管理文章',
    manage_categories: '管理分类',
    manage_tags: '管理标签',
    manage_friends: '管理友链',
    manage_users: '管理用户',
    manage_settings: '管理系统设置',
    view_dashboard: '查看仪表盘'
}

export default {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getRoleRoutes,
    roleDisplayNames,
    permissionDisplayNames
}