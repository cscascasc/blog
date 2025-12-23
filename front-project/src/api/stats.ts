import request from '@/utils/request';

// 获取博客统计数据
export const getBlogStats = () => {
    return request({
        url: '/stats',
        method: 'get'
    });
};