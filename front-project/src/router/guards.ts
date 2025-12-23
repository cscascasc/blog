import { Router } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { hasPermission } from '@/utils/permissions'

// 设置路由守卫
export function setupRouterGuards(router: Router) {
    router.beforeEach((to, from, next) => {
        // 初始化用户状态
        const userStore = useUserStore()

        // 检查是否需要认证
        const requiresAuth = to.path.startsWith('/admin') || to.path === '/profile'

        if (requiresAuth) {
            // 检查用户是否已登录
            if (!userStore.isAuthenticated) {
                // 未登录，重定向到登录页
                next('/login')
                return
            }

            // 已登录，检查是否有权限访问
            if (to.path.startsWith('/admin')) {
                // 订阅者不能访问管理系统
                if (userStore.userRole === 'subscriber') {
                    next('/blog')
                    return
                }

                // 检查具体权限
                const routePermissions: Record<string, string> = {
                    '/admin/users': 'manage_users',
                    '/admin/settings': 'manage_settings'
                }

                const requiredPermission = routePermissions[to.path]
                if (requiredPermission && !userStore.hasPermission(requiredPermission)) {
                    // 权限不足，重定向到仪表盘
                    next('/admin/dashboard')
                    return
                }
            }
        }

        next()
    })
}