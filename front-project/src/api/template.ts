import request from '@/utils/request';
import { Template, Content } from '@/types/template';

export interface SaveTemplateRequest {
    name: string;
    description: string;
    content: any;
    type: string;
}

export interface SaveContentRequest {
    title: string;
    description: string;
    content: any;
}

export interface GetUserTemplatesResponse {
    templates: Template[];
}

export interface GetTemplateByIdResponse {
    template: Template;
}

export interface GetUserContentsResponse {
    contents: Content[];
}

export interface GetContentByIdResponse {
    content: Content;
}

// 保存模板
export const saveTemplate = (data: SaveTemplateRequest) => {
    return request({
        url: '/templates/save-template',
        method: 'post',
        data
    });
};

// 获取用户保存的模板列表
export const getUserTemplates = (type?: string) => {
    return request<GetUserTemplatesResponse>({
        url: '/templates/user-templates',
        method: 'get',
        params: { type }
    });
};

// 获取特定模板详情
export const getTemplateById = (id: number) => {
    return request<GetTemplateByIdResponse>({
        url: `/templates/template/${id}`,
        method: 'get'
    });
};

// 删除模板
export const deleteTemplate = (id: number) => {
    return request({
        url: `/templates/template/${id}`,
        method: 'delete'
    });
};

// 保存编辑的内容
export const saveContent = (data: SaveContentRequest) => {
    return request({
        url: '/templates/save-content',
        method: 'post',
        data
    });
};

// 获取用户保存的内容列表
export const getUserContents = () => {
    return request<GetUserContentsResponse>({
        url: '/templates/user-contents',
        method: 'get'
    });
};

// 获取特定内容详情
export const getContentById = (id: number) => {
    return request<GetContentByIdResponse>({
        url: `/templates/content/${id}`,
        method: 'get'
    });
};

// 删除内容
export const deleteContent = (id: number) => {
    return request({
        url: `/templates/content/${id}`,
        method: 'delete'
    });
};