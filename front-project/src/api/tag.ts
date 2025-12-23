import request from '@/utils/request';

// 获取所有标签
export const getTags = () => {
    return request({
        url: '/tags',
        method: 'get'
    });
};

// 根据ID获取标签
export const getTagById = (id: number) => {
    return request({
        url: `/tags/${id}`,
        method: 'get'
    });
};

// 创建标签
export const createTag = (data: { name: string }) => {
    return request({
        url: '/tags',
        method: 'post',
        data
    });
};

// 更新标签
export const updateTag = (id: number, data: { name: string }) => {
    return request({
        url: `/tags/${id}`,
        method: 'put',
        data
    });
};

// 删除标签
export const deleteTag = (id: number) => {
    return request({
        url: `/tags/${id}`,
        method: 'delete'
    });
};