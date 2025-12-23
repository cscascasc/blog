import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { createPinia } from 'pinia'
import router from './router'

// 引入Element Plus图标
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// 引入Markdown编辑器
import VMdEditor from '@kangc/v-md-editor'
import '@kangc/v-md-editor/lib/style/base-editor.css'
import githubTheme from '@kangc/v-md-editor/lib/theme/github.js'
import '@kangc/v-md-editor/lib/theme/style/github.css'

// 引入Markdown预览组件
import VMdPreview from '@kangc/v-md-editor/lib/preview'
import '@kangc/v-md-editor/lib/style/preview.css'

// 引入highlight.js相关样式
import hljs from 'highlight.js'

// 引入主题管理工具
import { initTheme } from './utils/theme'
import { useUserStore } from './stores/userStore'

// 创建 Vue 应用实例
const app = createApp(App)

// 创建 Pinia 实例
const pinia = createPinia()

// 注册所有Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

// 配置Markdown编辑器
VMdEditor.use(githubTheme, {
    Hljs: hljs,
})

// 配置Markdown预览组件
VMdPreview.use(githubTheme, {
    Hljs: hljs,
})

// 使用 Element Plus
app.use(ElementPlus)
app.use(router)
app.use(VMdEditor)
app.use(VMdPreview)
app.use(pinia)

// 初始化主题
initTheme()

// 初始化用户状态
const userStore = useUserStore()
userStore.initUser()

// 挂载应用
app.mount('#app')