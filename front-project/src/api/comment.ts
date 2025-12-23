import request from '@/utils/request';
import { Comment } from '@/types';

// 获取文章的评论
export const getCommentsByArticleId = (articleId: number) => {
    return request({
        url: `/comments/article/${articleId}`,
        method: 'get'
    });
};

// 创建评论
export const createComment = (data: Partial<Comment>) => {
    return request({
        url: '/comments',
        method: 'post',
        data
    });
};

// 更新评论
export const updateComment = (id: number, data: Partial<Comment>) => {
    return request({
        url: `/comments/${id}`,
        method: 'put',
        data
    });
};

// 删除评论
export const deleteComment = (id: number) => {
    return request({
        url: `/comments/${id}`,
        method: 'delete'
    });
};

// 点赞评论
export const likeComment = (id: number) => {
    return request({
        url: `/comments/${id}/like`,
        method: 'post'
    });
};

// 取消点赞评论
export const unlikeComment = (id: number) => {
    return request({
        url: `/comments/${id}/unlike`,
        method: 'post'
    });
};