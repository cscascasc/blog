import request from '@/utils/request';
import { User } from '@/types';

// 获取所有用户
export const getUsers = () => {
    return request({
        url: '/users',
        method: 'get'
    });
};

// 根据ID获取用户
export const getUserById = (id: number) => {
    return request({
        url: `/users/${id}`,
        method: 'get'
    });
};

// 创建用户
export const createUser = (data: Partial<User>) => {
    return request({
        url: '/users',
        method: 'post',
        data
    });
};

// 更新用户
export const updateUser = (id: number, data: Partial<User>) => {
    return request({
        url: `/users/${id}`,
        method: 'put',
        data
    });
};

// 删除用户
export const deleteUser = (id: number) => {
    return request({
        url: `/users/${id}`,
        method: 'delete'
    });
};

// 更新用户状态
export const updateUserStatus = (id: number, status: 'active' | 'inactive') => {
    return request({
        url: `/users/${id}/status`,
        method: 'patch',
        data: { status }
    });
};