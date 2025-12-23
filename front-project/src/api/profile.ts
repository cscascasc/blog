import request from '@/utils/request';

// 获取当前用户的个人资料
export const getProfile = () => {
    return request({
        url: '/profile',
        method: 'get'
    });
};

// 更新当前用户的个人资料
export const updateProfile = (data: {
    name?: string;
    title?: string;
    bio?: string;
    skills?: string[];
    projects?: Array<{
        name: string;
        description: string;
        tags: string[];
    }>;
    phone?: string;
    location?: string;
}) => {
    return request({
        url: '/profile',
        method: 'put',
        data
    });
};