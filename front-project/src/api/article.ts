import request from '@/utils/request';
import { ArticleDetail, Article } from '@/types';

// 获取文章列表
export const getArticles = (params?: any) => {
    return request({
        url: '/articles',
        method: 'get',
        params
    });
};

// 获取文章详情
export const getArticleById = (id: number) => {
    return request({
        url: `/articles/${id}`,
        method: 'get'
    });
};

// 创建文章
export const createArticle = (data: Article) => {
    return request({
        url: '/articles',
        method: 'post',
        data
    });
};

// 更新文章
export const updateArticle = (id: number, data: Partial<Article>) => {
    return request({
        url: `/articles/${id}`,
        method: 'put',
        data
    });
};

// 删除文章
export const deleteArticle = (id: number) => {
    return request({
        url: `/articles/${id}`,
        method: 'delete'
    });
};

// 获取最新文章
export const getRecentArticles = (limit: number = 4) => {
    return request({
        url: '/articles',
        method: 'get',
        params: { limit }
    });
};

// 获取文章发布统计
export const getArticlePublishingStats = (startDate?: string, endDate?: string) => {
    return request({
        url: '/articles/stats/publishing',
        method: 'get',
        params: { startDate, endDate }
    });
};

// 获取文章分类统计
export const getArticleCategoryStats = (startDate?: string, endDate?: string) => {
    return request({
        url: '/articles/stats/categories',
        method: 'get',
        params: { startDate, endDate }
    });
};

// 获取文章标签统计
export const getArticleTagStats = (startDate?: string, endDate?: string) => {
    return request({
        url: '/articles/stats/tags',
        method: 'get',
        params: { startDate, endDate }
    });
};

// 获取热门文章
export const getPopularArticles = (limit: number = 10, startDate?: string, endDate?: string) => {
    return request({
        url: '/articles/popular',
        method: 'get',
        params: { limit, startDate, endDate }
    });
};