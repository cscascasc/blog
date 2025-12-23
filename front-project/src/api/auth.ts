import request from '@/utils/request';

// 用户注册
export const register = (data: {
    username: string;
    email: string;
    password: string;
    role?: string;
}) => {
    return request({
        url: '/auth/register',
        method: 'post',
        data
    });
};

// 用户登录
export const login = (data: {
    username: string;
    password: string;
    rememberMe?: boolean;
}) => {
    return request({
        url: '/auth/login',
        method: 'post',
        data
    });
};

// 使用记住我令牌自动登录
export const refresh = (data: {
    refreshToken: string;
}) => {
    return request({
        url: '/auth/refresh',
        method: 'post',
        data
    });
};

// 用户登出
export const logout = (data?: {
    refreshToken?: string;
}) => {
    return request({
        url: '/auth/logout',
        method: 'post',
        data
    });
};