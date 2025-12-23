import request from '@/utils/request';

// 获取所有分类
export const getCategories = () => {
    return request({
        url: '/categories',
        method: 'get'
    });
};

// 根据ID获取分类
export const getCategoryById = (id: number) => {
    return request({
        url: `/categories/${id}`,
        method: 'get'
    });
};

// 创建分类
export const createCategory = (data: { name: string; description?: string }) => {
    return request({
        url: '/categories',
        method: 'post',
        data
    });
};

// 更新分类
export const updateCategory = (id: number, data: { name: string; description?: string }) => {
    return request({
        url: `/categories/${id}`,
        method: 'put',
        data
    });
};

// 删除分类
export const deleteCategory = (id: number) => {
    return request({
        url: `/categories/${id}`,
        method: 'delete'
    });
};