// 主题管理工具

export type Theme = 'light' | 'dark';

// 获取当前主题
export function getCurrentTheme(): Theme {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    if (savedTheme) {
        return savedTheme;
    }

    // 检查系统主题偏好
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
    }

    return 'light';
}

// 设置主题
export function setTheme(theme: Theme): void {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);

    // 更新Element Plus主题
    if (theme === 'dark') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }

    // 触发自定义事件，通知其他组件主题已更改
    window.dispatchEvent(new CustomEvent('theme-changed', { detail: theme }));
}

// 切换主题
export function toggleTheme(): Theme {
    const currentTheme = getCurrentTheme();
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    return newTheme;
}

// 初始化主题
export function initTheme(): void {
    const theme = getCurrentTheme();
    setTheme(theme);

    // 监听系统主题偏好变化
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        // 只有在用户没有手动设置主题时才跟随系统变化
        if (!localStorage.getItem('theme')) {
            const newTheme = e.matches ? 'dark' : 'light';
            setTheme(newTheme);
        }
    });
}