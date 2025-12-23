<template>
  <div class="admin-layout">
    <div class="sidebar">
      <div class="logo">
        <h2>博客管理</h2>
      </div>
      <el-menu
        :default-active="activeMenu"
        class="sidebar-menu"
        @select="handleMenuSelect"
        :collapse="isSidebarCollapsed"
      >
        <el-menu-item index="/admin/dashboard">
          <el-icon><House /></el-icon>
          <span>仪表盘</span>
        </el-menu-item>
        <el-menu-item index="/admin/articles">
          <el-icon><Document /></el-icon>
          <span>文章管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/categories">
          <el-icon><Folder /></el-icon>
          <span>分类管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/tags">
          <el-icon><PriceTag /></el-icon>
          <span>标签管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/friends">
          <el-icon><Link /></el-icon>
          <span>友链管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/users">
          <el-icon><User /></el-icon>
          <span>用户管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/settings">
          <el-icon><Setting /></el-icon>
          <span>系统设置</span>
        </el-menu-item>
      </el-menu>
      <div class="sidebar-footer">
        <el-button
          @click="toggleSidebar"
          type="info"
          size="small"
          class="toggle-sidebar-btn"
          circle
        >
          <el-icon v-if="isSidebarCollapsed"><Expand /></el-icon>
          <el-icon v-else><Fold /></el-icon>
        </el-button>
        <el-button @click="logout" type="danger" plain size="small">
          <el-icon><SwitchButton /></el-icon>
          退出登录
        </el-button>
      </div>
    </div>
    <div class="main-content">
      <div class="header">
        <div class="header-title">
          <h2>{{ pageTitle }}</h2>
        </div>
        <div class="user-info">
          <el-button @click="goToBlog" type="primary" size="small">
            <el-icon><Postcard /></el-icon>
            返回博客
          </el-button>
          <el-dropdown @command="handleUserCommand">
            <span class="el-dropdown-link">
              <el-avatar :size="30" class="user-avatar">{{
                currentUser.username?.charAt(0).toUpperCase()
              }}</el-avatar>
              {{ currentUser.username }}
              <el-icon class="el-icon--right">
                <arrow-down />
              </el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon>
                  个人资料
                </el-dropdown-item>
                <el-dropdown-item command="settings">
                  <el-icon><Setting /></el-icon>
                  设置
                </el-dropdown-item>
                <el-dropdown-item command="logout" divided>
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
      <div class="content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUserStore } from "../stores/userStore";
import {
  ElMenu,
  ElMenuItem,
  ElButton,
  ElDropdown,
  ElDropdownMenu,
  ElDropdownItem,
  ElMessage,
  ElIcon,
  ElAvatar,
} from "element-plus";
import {
  House,
  Document,
  Folder,
  PriceTag,
  Link,
  User,
  Setting,
  Postcard,
  SwitchButton,
  ArrowDown,
  Expand,
  Fold,
} from "@element-plus/icons-vue";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const currentUser = ref({} as any);
const isSidebarCollapsed = ref(false);

const activeMenu = computed(() => {
  const { meta, path } = route;
  // if set path, the sidebar will highlight the path you set
  if (meta.activeMenu) {
    return meta.activeMenu as string;
  }
  return path;
});

const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    "/admin/dashboard": "仪表盘",
    "/admin/articles": "文章管理",
    "/admin/categories": "分类管理",
    "/admin/tags": "标签管理",
    "/admin/friends": "友链管理",
    "/admin/users": "用户管理",
    "/admin/settings": "系统设置",
  };
  return titles[route.path] || "博客管理";
});

const handleMenuSelect = (index: string) => {
  router.push(index);
};

const handleUserCommand = (command: string) => {
  if (command === "logout") {
    logout();
  } else {
    // 处理其他命令
    ElMessage.info(`功能 "${command}" 尚未实现`);
  }
};

const logout = async () => {
  try {
    // 调用 store 中的登出方法，确保清除记住我令牌
    await userStore.logout();
    ElMessage.success("已退出登录");
    // 跳转到登录页，不添加 logout 参数，这样用户再次登录时可以自动填充
    router.push("/login");
  } catch (error) {
    console.error("登出失败:", error);
    ElMessage.error("登出失败");
  }
};

const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
};

const checkLoginStatus = () => {
  const user = localStorage.getItem("currentUser");
  if (user) {
    currentUser.value = JSON.parse(user);
  } else {
    // 如果没有用户信息，重定向到登录页
    router.push("/login");
  }
};

const goToBlog = () => {
  router.push("/blog");
};

onMounted(() => {
  checkLoginStatus();
});
</script>

<style scoped lang="scss">
.admin-layout {
  display: flex;
  min-height: 100vh;
  background-color: var(--background-color);
}

.sidebar {
  width: 240px;
  background: linear-gradient(180deg, #2c3e50 0%, #1a2530 100%);
  color: #fff;
  display: flex;
  flex-direction: column;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 3px 0 15px rgba(0, 0, 0, 0.15);
  position: relative;
  z-index: 100;
  border-right: 1px solid rgba(255, 255, 255, 0.05);
}

.logo {
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.3s ease;

  h2 {
    margin: 0;
    color: #fff;
    font-size: 1.5rem;
    font-weight: 700;
    letter-spacing: 1px;
    transition: all 0.3s ease;
    text-shadow: 0 0 10px rgba(52, 152, 219, 0.5);
  }
}

.sidebar-menu {
  flex: 1;
  border: none;
  background: transparent;
  padding: 15px 0;

  :deep(.el-menu-item) {
    color: #aab4c0;
    height: 50px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    margin: 5px 15px;
    border-radius: 8px;
    position: relative;
    display: flex;
    align-items: center;

    &.is-active,
    &:hover {
      background: linear-gradient(
        90deg,
        rgba(52, 152, 219, 0.3) 0%,
        rgba(52, 152, 219, 0.1) 100%
      );
      color: #fff;

      &::before {
        content: "";
        position: absolute;
        left: -15px;
        top: 0;
        height: 100%;
        width: 4px;
        background: linear-gradient(to bottom, #3498db, #2c3e50);
        border-radius: 0 4px 4px 0;
      }
    }

    &.is-active {
      box-shadow: 0 4px 10px rgba(52, 152, 219, 0.25);
      transform: translateX(5px);

      i {
        color: #3498db;
        transform: scale(1.1);
      }
    }

    i {
      color: #aab4c0;
      font-size: 18px;
      transition: all 0.3s ease;
      margin-right: 15px;
      width: 24px;
      text-align: center;
    }

    &:hover i {
      color: #3498db;
      transform: scale(1.1);
    }

    .el-icon {
      margin-right: 12px;
      width: 24px;
      text-align: center;
    }
  }

  :deep(.el-menu--inline) {
    background: rgba(0, 0, 0, 0.15) !important;
    margin: 0 15px;
    border-radius: 8px;
    padding: 5px 0;

    .el-menu-item {
      background: transparent !important;
      padding-left: 45px !important;
      margin: 3px 0;

      &:hover,
      &.is-active {
        background: rgba(52, 152, 219, 0.2) !important;
      }
    }
  }

  :deep(.el-sub-menu__title) {
    color: #aab4c0;
    height: 50px;
    transition: all 0.3s ease;
    margin: 5px 15px;
    border-radius: 8px;

    &:hover {
      background: rgba(255, 255, 255, 0.08);
      color: #fff;
    }

    .el-icon {
      color: #aab4c0;
      margin-right: 12px;
      width: 24px;
      text-align: center;
    }

    &:hover .el-icon {
      color: #3498db;
    }
  }
}

.sidebar-footer {
  padding: 20px 15px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: rgba(0, 0, 0, 0.2);

  .toggle-sidebar-btn {
    background: linear-gradient(135deg, #3498db, #2c3e50);
    border: none;
    color: #ecf0f1;
    transition: all 0.3s ease;
    width: 100%;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      background: linear-gradient(135deg, #3ca0e3, #34495e);
      transform: translateY(-2px);
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    }

    i {
      font-size: 16px;
    }
  }

  .el-button--danger {
    background: linear-gradient(135deg, #e74c3c, #c0392b);
    border: none;
    color: white;
    transition: all 0.3s ease;
    width: 100%;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      background: linear-gradient(135deg, #ff6b6b, #e74c3c);
      transform: translateY(-2px);
      box-shadow: 0 4px 10px rgba(231, 76, 60, 0.3);
    }
  }

  .el-button {
    span {
      margin-left: 8px;
    }
  }
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.header {
  height: 70px;
  background-color: var(--header-bg);
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 25px;
  position: sticky;
  top: 0;
  z-index: 99;
  border-bottom: 1px solid var(--border-color);
}

.header-title h2 {
  margin: 0;
  color: var(--text-color);
  font-size: 1.6rem;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 25px;
}

.user-dropdown {
  .el-dropdown-link {
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 10px;
    color: var(--text-color);
    font-weight: 500;
    transition: all 0.3s ease;
    padding: 8px 15px;
    border-radius: 30px;
    background: var(--card-bg);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    border: 1px solid var(--border-color);

    &:hover {
      background: linear-gradient(135deg, #3498db, #2c3e50);
      color: white;
      box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
      transform: translateY(-2px);
    }

    .user-avatar {
      background: linear-gradient(135deg, #3498db, #2c3e50);
      color: white;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .el-icon--right {
      transition: transform 0.3s ease;
    }

    &:hover .el-icon--right {
      transform: rotate(180deg);
    }
  }
}

.content {
  flex: 1;
  padding: 25px;
  overflow: auto;
}

// 折叠状态样式
.sidebar.collapsed {
  .logo h2 {
    font-size: 0;
    opacity: 0;
  }

  :deep(.el-menu-item) {
    justify-content: center;
    padding: 0 !important;
    margin: 5px 10px;

    span {
      display: none;
    }

    .el-icon {
      margin: 0;
    }

    &.is-active::before {
      left: 0;
      height: 40%;
      top: 30%;
      width: 3px;
    }
  }

  :deep(.el-sub-menu__title) {
    justify-content: center;
    padding: 0 !important;
    margin: 5px 10px;

    span {
      display: none;
    }

    .el-icon {
      margin: 0;
    }
  }

  .sidebar-footer {
    align-items: center;

    .el-button span {
      display: none;
    }

    .toggle-sidebar-btn {
      padding: 8px;
    }
  }
}

@media (max-width: 768px) {
  .sidebar {
    width: 64px;
    position: fixed;
    height: 100vh;
    z-index: 1000;

    .logo h2 {
      display: none;
    }

    :deep(.el-menu-item) span {
      display: none;
    }

    :deep(.el-menu-item) {
      padding-left: 20px !important;
      justify-content: center;
    }

    :deep(.el-sub-menu__title) span {
      display: none;
    }

    :deep(.el-sub-menu__title) {
      justify-content: center;
      padding-left: 20px !important;
    }
  }

  .sidebar-footer {
    align-items: center;

    .el-button {
      justify-content: center;
      padding: 8px;
    }

    .el-button:last-child span {
      display: none;
    }
  }

  .main-content {
    margin-left: 64px;
  }

  .header {
    height: 60px;
    padding: 0 15px;
  }

  .header-title h2 {
    font-size: 1.3rem;
  }

  .user-info {
    gap: 15px;
  }

  .user-dropdown .el-dropdown-link {
    padding: 6px 12px;
    font-size: 0.9rem;
    
    .user-avatar {
      width: 26px;
      height: 26px;
      line-height: 26px;
    }
  }

  .content {
    padding: 15px;
  }

  .sidebar.collapsed {
    width: 0;
    overflow: hidden;
  }

  .main-content {
    margin-left: 0;
  }
}
</style>