import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ElMessage } from 'element-plus';

// 创建axios实例
const service: AxiosInstance = axios.create({
    baseURL: 'http://localhost:3000/api', // 后端API基础路径
    timeout: 10000, // 请求超时时间
    headers: {
        'Content-Type': 'application/json',
    },
});

// 请求拦截器
service.interceptors.request.use(
    (config: AxiosRequestConfig) => {
        // 在发送请求之前做些什么
        // 添加token等认证信息
        const token = localStorage.getItem('token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        // 对请求错误做些什么
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// 响应拦截器
service.interceptors.response.use(
    (response: AxiosResponse) => {
        // 对响应数据做点什么
        return response.data;
    },
    (error) => {
        // 对响应错误做点什么
        console.error('Response error:', error);

        // 检查是否是认证错误（401）
        if (error.response && error.response.status === 401) {
            // 清除本地存储的令牌
            localStorage.removeItem('token');

            // 重定向到登录页面
            window.location.href = '/#/login';

            // 刷新页面以确保状态更新
            window.location.reload();
        }

        // 检查是否是权限错误（403）
        if (error.response && error.response.status === 403) {
            // 提示用户权限不足
            ElMessage.error('权限不足，无法执行此操作');

            // 可能是令牌过期或权限变更，清除本地存储的令牌
            localStorage.removeItem('token');

            // 重定向到登录页面
            window.location.href = '/#/login';
        }

        return Promise.reject(error);
    }
);

export default service;