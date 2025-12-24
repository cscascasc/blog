import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import NotFound from '@/views/NotFound.vue'
import { setupRouterGuards } from './guards'

const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home
    },
    {
        path: '/chrismasTree',
        name: 'ChrismasTree',
        component: () => import('@/components/chistmas_tree_ai/ChristmasTreeAI.vue')
    },
    {
        path: '/login',
        name: 'Login',
        component: () => import('@/views/admin/Login.vue')
    },
    {
        path: '/register',
        name: 'Register',
        component: () => import('@/views/admin/Register.vue')
    },
    {
        path: '/blog',
        name: 'Blog',
        component: () => import('@/layouts/FrontendLayout.vue'),
        children: [
            {
                path: '',
                name: 'BlogHome',
                component: () => import('@/views/blog/Home.vue')
            },
            {
                path: 'articles',
                name: 'Articles',
                component: () => import('@/views/blog/Articles.vue')
            },
            {
                path: 'article/:id',
                name: 'ArticleDetail',
                component: () => import('@/views/blog/ArticleDetail.vue'),
                props: true
            },
            {
                path: 'features',
                name: 'Features',
                component: () => import('@/views/blog/Features.vue')
            },
            {
                path: 'friends',
                name: 'BlogFriends',
                component: () => import('@/views/blog/Friends.vue')
            }
        ]
    },
    {
        path: '/admin',
        name: 'Admin',
        component: () => import('@/layouts/AdminLayout.vue'),
        children: [
            {
                path: 'dashboard',
                name: 'Dashboard',
                component: () => import('@/views/admin/Dashboard.vue')
            },
            {
                path: 'articles',
                name: 'AdminArticles',
                component: () => import('@/views/admin/Articles.vue')
            },
            {
                path: 'categories',
                name: 'Categories',
                component: () => import('@/views/admin/Categories.vue')
            },
            {
                path: 'tags',
                name: 'Tags',
                component: () => import('@/views/admin/Tags.vue')
            },
            {
                path: 'users',
                name: 'Users',
                component: () => import('@/views/admin/Users.vue')
            },
            {
                path: 'friends',
                name: 'Friends',
                component: () => import('@/views/admin/Friends.vue')
            },
            {
                path: 'test-api',
                name: 'TestAPI',
                component: () => import('@/views/admin/TestAPI.vue')
            },
            {
                path: 'settings',
                name: 'Settings',
                component: () => import('@/views/admin/Settings.vue')
            }
        ]
    },
    {
        path: '/profile',
        name: 'Profile',
        component: () => import('@/views/Profile.vue')
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: NotFound
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// 设置路由守卫
setupRouterGuards(router)

export default router