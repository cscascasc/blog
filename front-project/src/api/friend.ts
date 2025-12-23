import request from '@/utils/request';

// 获取所有友链
export const getFriends = () => {
    return request({
        url: '/friends',
        method: 'get'
    });
};

// 根据ID获取友链
export const getFriendById = (id: number) => {
    return request({
        url: `/friends/${id}`,
        method: 'get'
    });
};

// 创建友链
export const createFriend = (data: { name: string; url: string; description?: string; status?: 'active' | 'inactive' }) => {
    return request({
        url: '/friends',
        method: 'post',
        data
    });
};

// 更新友链
export const updateFriend = (id: number, data: { name?: string; url?: string; description?: string; status?: 'active' | 'inactive' }) => {
    return request({
        url: `/friends/${id}`,
        method: 'put',
        data
    });
};

// 删除友链
export const deleteFriend = (id: number) => {
    return request({
        url: `/friends/${id}`,
        method: 'delete'
    });
};