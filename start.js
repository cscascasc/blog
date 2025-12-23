// 启动脚本 - 同时启动前端和后端
const { spawn } = require('child_process');
const path = require('path');

console.log('正在启动博客项目...');

// 启动后端服务
const backend = spawn('npm', ['run', 'dev'], {
    cwd: path.join(__dirname, 'backend'),
    stdio: 'inherit',
    shell: true
});

// 启动前端服务
const frontend = spawn('npm', ['run', 'dev'], {
    cwd: path.join(__dirname, 'front-project'),
    stdio: 'inherit',
    shell: true
});

// 监听进程退出
backend.on('close', (code) => {
    console.log(`后端服务退出，退出码 ${code}`);
});

frontend.on('close', (code) => {
    console.log(`前端服务退出，退出码 ${code}`);
});

// 处理中断信号
process.on('SIGINT', () => {
    console.log('正在关闭服务...');
    backend.kill();
    frontend.kill();
    process.exit();
});