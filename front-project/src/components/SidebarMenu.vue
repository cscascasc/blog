<template>
  <aside class="sidebar">
    <div class="logo">
      <router-link to="/blog">我的博客</router-link>
    </div>

    <nav class="nav">
      <div class="carousel-container">
        <ul class="carousel-list" :style="carouselListStyle">
          <li
            v-for="(item, index) in menuItems"
            :key="index"
            class="carousel-item"
            :class="{ active: index === activeIndex }"
            :style="getItemStyle(index)"
          >
            <router-link :to="item.path" class="nav-link" @click="closeMenu">
              <el-icon><component :is="item.icon" /></el-icon>
              <span class="nav-text">{{ item.text }}</span>
            </router-link>
          </li>
        </ul>
      </div>
    </nav>

    <div class="sidebar-footer">
      <ThemeToggle />
      <div class="user-actions">
        <div v-if="isAuthenticated" class="user-dropdown">
          <el-dropdown @command="handleUserCommand">
            <span class="el-dropdown-link">
              <el-avatar :size="30" class="user-avatar">
                {{ currentUser.username?.charAt(0).toUpperCase() }}
              </el-avatar>
              {{ currentUser.username }}
              <el-icon class="el-icon--right">
                <arrow-down />
              </el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon>
                  个人主页
                </el-dropdown-item>
                <el-dropdown-item
                  command="admin"
                  v-if="userRole !== 'subscriber'"
                >
                  <el-icon><Setting /></el-icon>
                  进入后台
                </el-dropdown-item>
                <el-dropdown-item command="logout" divided>
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
        <div v-else class="auth-buttons">
          <el-button type="primary" size="small" @click="goToLogin">
            <el-icon><User /></el-icon>
            登录
          </el-button>
          <el-button type="success" size="small" @click="goToRegister">
            <el-icon><User /></el-icon>
            注册
          </el-button>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { useUserStore } from "../stores/userStore";
import {
  ElButton,
  ElDropdown,
  ElDropdownMenu,
  ElDropdownItem,
  ElMessage,
  ElIcon,
  ElAvatar,
} from "element-plus";
import {
  User,
  Setting,
  SwitchButton,
  ArrowDown,
} from "@element-plus/icons-vue";
import { useRoute } from "vue-router";
import { House, Document, MagicStick, Link } from "@element-plus/icons-vue";
import ThemeToggle from "./ThemeToggle.vue";

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const { isAuthenticated, currentUser, userRole } = storeToRefs(userStore);
const emit = defineEmits<{
  closeMenu: [];
}>();

// 定义菜单项
const menuItems = ref([
  { path: "/blog", text: "主页", icon: House },
  { path: "/blog/articles", text: "文章", icon: Document },
  { path: "/blog/features", text: "功能", icon: MagicStick },
  { path: "/blog/friends", text: "友链", icon: Link },
]);

// 计算当前激活的菜单索引
const activeIndex = ref(0);

// 计算当前路由对应的菜单索引
const calculateActiveIndex = () => {
  const currentPath = route.path;

  // 精确匹配路由
  let index = -1;

  // 特殊处理：/blog 对应主页，/blog/articles 对应文章页等
  if (currentPath === "/blog" || currentPath === "/blog/") {
    index = 0; // 主页
  } else {
    // 查找其他匹配的路由
    for (let i = 1; i < menuItems.value.length; i++) {
      if (currentPath.startsWith(menuItems.value[i].path)) {
        index = i;
        break;
      }
    }
  }

  activeIndex.value = index !== -1 ? index : 0;
};

// 计算轮播列表样式
const carouselListStyle = computed(() => {
  const itemHeight = 70; // 每个菜单项的高度
  // 计算偏移量，使当前项居中 (窗口高度的一半减去当前项在列表中的位置)
  const offset = -activeIndex.value * itemHeight + 150; // 150是使中间项居中的偏移量
  return {
    transform: `translateY(${offset}px)`,
    transition: "transform 0.8s cubic-bezier(0.22, 0.61, 0.36, 1)",
  };
});

// 根据索引计算单个菜单项样式（表盘式效果）
const getItemStyle = (index: number) => {
  const distance = Math.abs(index - activeIndex.value);
  const scale = distance === 0 ? 1.1 : Math.max(0.8, 1 - distance * 0.1);
  const opacity = distance === 0 ? 1 : Math.max(0.5, 1 - distance * 0.2);

  return {
    transform: `scale(${scale})`,
    opacity: opacity,
    zIndex: 100 - distance,
    transition: "all 0.8s cubic-bezier(0.22, 0.61, 0.36, 1)",
  };
};

const handleUserCommand = (command: string) => {
  switch (command) {
    case "profile":
      router.push("/profile");
      break;
    case "admin":
      router.push("/admin");
      break;
    case "logout":
      logout();
      break;
  }
};

const logout = async () => {
  try {
    await userStore.logout();
    ElMessage.success("已退出登录");
    router.push("/login");
  } catch (error) {
    console.error("登出失败:", error);
    ElMessage.error("登出失败");
  }
};

const goToLogin = () => {
  router.push("/login");
};

const goToRegister = () => {
  router.push("/register");
};

const closeMenu = () => {
  emit("closeMenu");
};

// 监听路由变化
watch(
  () => route.path,
  () => {
    calculateActiveIndex();
  },
  { immediate: true }
);

onMounted(() => {
  calculateActiveIndex();
});

// 导入computed函数
import { computed } from "vue";
</script>

<style scoped lang="scss">
.sidebar {
  width: 250px;
  background: var(--header-bg);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
  transition: all 0.3s ease;
  border-right: 1px solid var(--border-color);
}

.logo {
  padding: 20px;
  text-align: center;
  border-bottom: 1px solid var(--border-color);

  a {
    font-size: 1.8rem;
    font-weight: 700;
    color: #3498db;
    text-decoration: none;
    letter-spacing: 1px;
    background: linear-gradient(120deg, #3498db, #2c3e50);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    white-space: nowrap;
    overflow: hidden;
    transition: all 0.3s ease;
  }
}

.nav {
  flex: 1;
  padding: 80px 0;
  overflow: hidden;
  position: relative;
  display: flex;
  align-items: flex-start;
}

.carousel-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.carousel-list {
  list-style: none;
  padding: 0;
  margin: 0;
  position: absolute;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.carousel-item {
  width: 90%;
  margin: 8px 0;
  display: flex;
  justify-content: center;
  background: var(--card-bg);
  border-radius: 8px;
  transition: all 0.5s ease;
  position: relative;

  &.active {
    background: linear-gradient(120deg, #3498db, #2980b9);
    color: white;
    transform: scale(1.05);
    box-shadow: 0 4px 15px rgba(52, 152, 219, 0.4),
      inset -12px 0 15px -8px rgba(0, 0, 0, 0.4); // 更明显的向页面方向的内凹效果
    z-index: 100;
    border-radius: 8px 0 0 8px; // 左侧保持直角，右侧向内凹

    .nav-link {
      color: white;
      border-left: 3px solid transparent;
      border-radius: 8px 0 0 8px; // 左侧保持直角，右侧向内凹
      box-shadow: inset -12px 0 15px -8px rgba(0, 0, 0, 0.4); // 更明显的向页面方向的内凹效果
      padding: 15px 35px 15px 20px; // 调整内边距，增加右侧空间
    }

    .el-icon {
      color: white;
    }
  }
}

.nav-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: var(--text-color-secondary);
  font-weight: 500;
  padding: 15px 20px;
  transition: all 0.3s ease;
  border-left: 3px solid transparent;
  white-space: nowrap;
  overflow: hidden;
  width: 100%;
  border-radius: 8px;

  .el-icon {
    font-size: 1.2rem;
    margin-right: 15px;
    width: 24px;
    text-align: center;
    flex-shrink: 0;
    color: #3498db;
    transition: all 0.3s ease;
  }

  .nav-text {
    font-size: 1rem;
    opacity: 1;
    transform: translateX(0);
    transition: all 0.3s ease;
    flex-shrink: 0;
  }

  &:hover {
    color: #3498db;
    background-color: rgba(52, 152, 219, 0.1);
  }

  &.router-link-exact-active {
    color: #3498db;
    background-color: rgba(52, 152, 219, 0.1);
    border-left: 3px solid #3498db;
  }

  // 激活状态下的特殊凹进效果
  .carousel-item.active & {
    background: rgba(255, 255, 255, 0.1);
    box-shadow: inset 2px 0 8px rgba(0, 0, 0, 0.2);
  }
}

.sidebar-footer {
  padding: 20px;
  border-top: 1px solid var(--border-color);
  display: flex;
  // flex-direction: column;
  gap: 15px;

  .user-actions {
    display: flex;
    flex-direction: column;
    gap: 10px;

    .user-dropdown {
      .el-dropdown-link {
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        color: var(--text-color);
        font-weight: 500;
        transition: all 0.3s ease;
        padding: 8px;
        border-radius: 6px;
        background: var(--card-bg);

        &:hover {
          color: #3498db;
        }

        .user-avatar {
          background: linear-gradient(135deg, #3498db, #2c3e50);
          color: white;
          font-weight: 600;
        }

        .el-icon--right {
          transition: transform 0.3s ease;
        }

        &:hover .el-icon--right {
          transform: rotate(180deg);
        }
      }
    }

    .auth-buttons {
      display: flex;
      flex-direction: column;
      gap: 8px;

      .el-button {
        width: 100%;
      }
    }
  }
}
</style>