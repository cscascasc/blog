import { defineStore } from 'pinia'
import { User } from '@/types'
import { login as loginApi, register as registerApi, refresh as refreshApi, logout as logoutApi } from '@/api/auth'
import { hasPermission, setCurrentUser } from '@/utils/permissions'

interface UserState {
    user: User | null
    isAuthenticated: boolean
    token: string | null
}

export const useUserStore = defineStore('user', {
    state: (): UserState => ({
        user: null,
        isAuthenticated: false,
        token: null
    }),

    getters: {
        currentUser: (state) => state.user,
        userRole: (state) => state.user?.role || 'subscriber',
        hasAuth: (state) => state.isAuthenticated,
        authToken: (state) => state.token,

        // 权限检查方法
        hasPermission: (state) => (permission: string) => {
            if (!state.user?.role) return false
            return hasPermission(state.user.role, permission as any)
        }
    },

    actions: {
        // 初始化用户状态（从 localStorage 恢复）
        initUser() {
            const storedUser = localStorage.getItem('currentUser')
            const storedToken = localStorage.getItem('token')
            const storedUserRole = localStorage.getItem('userRole')

            if (storedUser && storedToken && storedUserRole) {
                this.user = JSON.parse(storedUser)
                this.token = storedToken
                this.isAuthenticated = true
                setCurrentUser({ role: this.user.role })
            }
        },

        // 登录
        async login(credentials: { username: string; password: string; rememberMe?: boolean }) {
            try {
                const response = await loginApi(credentials)

                this.user = response.user
                this.token = response.token
                this.isAuthenticated = true

                // 保存到 localStorage
                localStorage.setItem('currentUser', JSON.stringify(response.user))
                localStorage.setItem('token', response.token)
                localStorage.setItem('userRole', response.user.role)
                localStorage.setItem('isAuthenticated', 'true')

                // 设置当前用户角色
                setCurrentUser({ role: response.user.role })

                return response
            } catch (error) {
                throw error
            }
        },

        // 使用记住我令牌自动登录
        async refreshLogin(refreshToken: string) {
            try {
                const response = await refreshApi({ refreshToken })

                this.user = response.user
                this.token = response.token
                this.isAuthenticated = true

                // 保存到 localStorage
                localStorage.setItem('currentUser', JSON.stringify(response.user))
                localStorage.setItem('token', response.token)
                localStorage.setItem('userRole', response.user.role)
                localStorage.setItem('isAuthenticated', 'true')

                // 设置当前用户角色
                setCurrentUser({ role: response.user.role })

                return response
            } catch (error) {
                throw error
            }
        },

        // 注册
        async register(userData: { username: string; email: string; password: string }) {
            try {
                const response = await registerApi(userData)

                this.user = response.user
                this.token = response.token
                this.isAuthenticated = true

                // 保存到 localStorage
                localStorage.setItem('currentUser', JSON.stringify(response.user))
                localStorage.setItem('token', response.token)
                localStorage.setItem('userRole', response.user.role)
                localStorage.setItem('isAuthenticated', 'true')

                // 设置当前用户角色
                setCurrentUser({ role: response.user.role })

                return response
            } catch (error) {
                throw error
            }
        },

        // 登出
        async logout() {
            try {
                // 获取记住我令牌
                const refreshToken = localStorage.getItem('refreshToken');

                // 调用后端登出接口，清除记住我令牌
                if (refreshToken) {
                    await logoutApi({ refreshToken });
                }
            } catch (error) {
                console.error('登出时清除记住我令牌失败:', error);
            } finally {
                // 清除本地状态
                this.user = null;
                this.token = null;
                this.isAuthenticated = false;

                // 清除 localStorage，但保留记住的用户名和密码
                localStorage.removeItem('currentUser');
                localStorage.removeItem('token');
                localStorage.removeItem('userRole');
                localStorage.removeItem('isAuthenticated');
                localStorage.removeItem('refreshToken');
                // 注意：不清除 savedUsername 和 savedPasswords，以便下次登录时可以自动填充

                // 清除当前用户角色
                setCurrentUser(null);
            }
        },

        // 更新用户信息
        updateUser(user: User) {
            this.user = user
            localStorage.setItem('currentUser', JSON.stringify(user))
            localStorage.setItem('userRole', user.role)
        }
    }
})