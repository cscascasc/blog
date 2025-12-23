// 测试认证功能
const axios = require('axios');

const api = axios.create({
    baseURL: 'http://localhost:3000/api',
    timeout: 5000,
});

async function testAuth() {
    try {
        // 测试注册
        console.log('测试注册...');
        const registerResponse = await api.post('/auth/register', {
            username: 'testuser',
            email: 'test@example.com',
            password: 'testpassword123',
            role: 'author'
        });
        console.log('注册响应:', registerResponse.data);

        // 测试登录
        console.log('\n测试登录...');
        const loginResponse = await api.post('/auth/login', {
            username: 'testuser',
            password: 'testpassword123'
        });
        console.log('登录响应:', loginResponse.data);

        console.log('\n认证测试完成!');
    } catch (error) {
        console.error('测试失败:', error.response?.data || error.message);
    }
}

testAuth();