<template>
  <div class="frontend-layout">
    <SidebarMenu @close-menu="closeMenu" />

    <!-- 主内容区 -->
    <div class="main-wrapper">
      <!-- 移动端菜单 -->
      <div class="mobile-menu" :class="{ active: isMenuOpen }">
        <div class="mobile-menu-content">
          <ul class="mobile-nav-list">
            <li class="mobile-nav-item">
              <router-link
                to="/blog"
                class="mobile-nav-link"
                @click="closeMenu"
              >
                <el-icon><House /></el-icon>
                主页
              </router-link>
            </li>
            <li class="mobile-nav-item">
              <router-link
                to="/blog/articles"
                class="mobile-nav-link"
                @click="closeMenu"
              >
                <el-icon><Document /></el-icon>
                文章
              </router-link>
            </li>
            <li class="mobile-nav-item">
              <router-link
                to="/blog/features"
                class="mobile-nav-link"
                @click="closeMenu"
              >
                <el-icon><MagicStick /></el-icon>
                功能
              </router-link>
            </li>
            <li class="mobile-nav-item">
              <router-link
                to="/blog/friends"
                class="mobile-nav-link"
                @click="closeMenu"
              >
                <el-icon><Link /></el-icon>
                友链
              </router-link>
            </li>
          </ul>

          <div class="mobile-user-actions" v-if="isAuthenticated">
            <div class="mobile-user-info">
              <el-icon><User /></el-icon>
              {{ currentUser.username }}
            </div>
            <el-button
              type="primary"
              size="small"
              @click="router.push('/admin')"
              v-if="userRole !== 'subscriber'"
            >
              <el-icon><Setting /></el-icon>
              进入后台
            </el-button>
            <el-button type="danger" size="small" @click="logout">
              <el-icon><SwitchButton /></el-icon>
              退出登录
            </el-button>
          </div>

          <div class="mobile-auth-actions" v-else>
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

      <!-- 页面切换遮罩 -->
      <div
        class="page-transition-mask"
        :class="{ active: isTransitioning }"
      ></div>

      <div class="main-content">
        <router-view v-slot="{ Component, route }">
          <transition
            name="page"
            mode="out-in"
            @before-enter="startTransition"
            @after-leave="endTransition"
          >
            <keep-alive include="Articles">
              <component :is="Component" :key="route.path" />
            </keep-alive>
          </transition>
        </router-view>
      </div>

      <footer class="footer">
        <div class="footer-content">
          <div class="footer-section">
            <h3>关于博客</h3>
            <p>
              这是一个使用Vue 3、TypeScript和Element Plus构建的现代化博客系统。
            </p>
          </div>
          <div class="footer-section">
            <h3>快速链接</h3>
            <ul>
              <li>
                <router-link to="/blog">
                  <el-icon><House /></el-icon>
                  主页
                </router-link>
              </li>
              <li>
                <router-link to="/profile">
                  <el-icon><User /></el-icon>
                  个人主页
                </router-link>
              </li>
              <li>
                <router-link to="/blog/articles">
                  <el-icon><Document /></el-icon>
                  文章
                </router-link>
              </li>
              <li>
                <router-link to="/blog/features">
                  <el-icon><MagicStick /></el-icon>
                  功能
                </router-link>
              </li>
              <li>
                <router-link to="/blog/friends">
                  <el-icon><Link /></el-icon>
                  友链
                </router-link>
              </li>
            </ul>
          </div>
          <div class="footer-section">
            <h3>联系我</h3>
            <div class="social-links">
              <a href="#">
                <el-icon><ChatDotRound /></el-icon>
              </a>
              <a href="#">
                <el-icon><Platform /></el-icon>
              </a>
              <a href="#">
                <el-icon><Guide /></el-icon>
              </a>
            </div>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; 2025 我的博客. 保留所有权利.</p>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { storeToRefs } from "pinia";
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
  Menu,
  ArrowDown,
  ChatDotRound,
  Platform,
  Guide,
} from "@element-plus/icons-vue";
import SidebarMenu from "../components/SidebarMenu.vue";
import { useUserStore } from "../stores/userStore";

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const { isAuthenticated, currentUser, userRole } = storeToRefs(userStore);
const isMenuOpen = ref(false);
const isTransitioning = ref(false);

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const closeMenu = () => {
  isMenuOpen.value = false;
};

const goToLogin = () => {
  router.push("/login");
};

const goToRegister = () => {
  router.push("/register");
};

const handleUserCommand = (command: string) => {
  switch (command) {
    case "profile":
      // 进入个人主页
      router.push("/profile");
      break;
    case "admin":
      // 进入后台管理
      router.push("/admin");
      break;
    case "logout":
      // 退出登录
      logout();
      break;
  }
};

const logout = async () => {
  try {
    await userStore.logout();
    ElMessage.success("已退出登录");
    // 跳转到登录页，不添加 logout 参数，这样用户再次登录时可以自动填充
    router.push("/login");
  } catch (error) {
    console.error("登出失败:", error);
    ElMessage.error("登出失败");
  }
};

const checkLoginStatus = () => {
  userStore.initUser();
};

// 页面切换动画相关方法
const startTransition = () => {
  isTransitioning.value = true;
};

const endTransition = () => {
  isTransitioning.value = false;
};

// 监听路由变化，平滑滚动到顶部
watch(
  () => route.path,
  () => {
    // 使用平滑滚动到顶部
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }
);

onMounted(() => {
  checkLoginStatus();
});
</script>

<style scoped lang="scss">
.frontend-layout {
  min-height: 100vh;
  display: flex;
}

.main-wrapper {
  flex: 1;
  margin-left: 250px;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  transition: margin-left 0.3s ease;
}

.header {
  position: sticky;
  top: 0;
  background-color: var(--header-bg);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  z-index: 1000;
  height: 60px;
  border-bottom: 1px solid var(--border-color);
}

.header-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 20px;
}

.header-left {
  flex: 1;
}

.header-right {
  display: flex;
  justify-content: flex-end;
}

.user-actions {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-dropdown {
  .el-dropdown-link {
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--text-color);
    font-weight: 500;
    transition: all 0.3s ease;

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
  align-items: center;
  gap: 10px;
}

.menu-toggle {
  display: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-color);
}

.mobile-menu {
  position: fixed;
  top: 70px;
  left: 0;
  width: 100%;
  height: 0;
  background: linear-gradient(
    135deg,
    var(--background-color) 0%,
    var(--card-bg) 100%
  );
  overflow: hidden;
  transition: height 0.3s ease;
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
  z-index: 999;
  border-top: 1px solid var(--border-color);
}

.mobile-menu.active {
  height: calc(100vh - 70px);
}

.mobile-menu-content {
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.mobile-nav-list {
  list-style: none;
  padding: 0;
  margin: 0 0 30px 0;
}

.mobile-nav-item {
  margin-bottom: 15px;
}

.mobile-nav-link {
  display: block;
  text-decoration: none;
  color: var(--text-color-secondary);
  font-size: 1.2rem;
  padding: 15px 0;
  border-bottom: 1px solid var(--border-color);
  transition: all 0.3s ease;
}

.mobile-nav-link.router-link-exact-active {
  color: #3498db;
  font-weight: 500;
}

.mobile-user-actions,
.mobile-auth-actions {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.mobile-user-info {
  text-align: center;
  padding: 15px;
  color: var(--text-color);
  font-weight: 500;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 15px;
  background: var(--card-bg);
  border-radius: 8px;
}

.main-content {
  flex: 1;
  padding: 20px;
}

.footer {
  background: linear-gradient(120deg, #2c3e50, #34495e);
  color: white;
  padding: 40px 0 0;
  margin-top: auto;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
  padding: 0 20px 20px;
}

.footer-section {
  h3 {
    margin-top: 0;
    margin-bottom: 20px;
    font-size: 1.3rem;
    position: relative;
    padding-bottom: 10px;
    color: white;
  }

  h3::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    width: 50px;
    height: 3px;
    background: #3498db;
    border-radius: 3px;
  }

  p {
    color: #ecf0f1;
    line-height: 1.7;
  }

  ul {
    list-style: none;
    padding: 0;

    li {
      margin-bottom: 10px;

      a {
        color: #ecf0f1;
        text-decoration: none;
        transition: all 0.3s ease;

        &:hover {
          color: #3498db;
          padding-left: 5px;
        }
      }
    }
  }
}

.social-links {
  display: flex;
  gap: 15px;

  a {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    color: white;
    font-size: 1.2rem;
    transition: all 0.3s ease;

    &:hover {
      background: #3498db;
      transform: translateY(-3px);
    }
  }
}

.footer-bottom {
  text-align: center;
  padding: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: 20px;

  p {
    margin: 0;
    color: #bdc3c7;
    font-size: 0.9rem;
  }
}

@media (max-width: 768px) {
  .sidebar {
    width: 0;
    overflow: hidden;
  }

  .main-wrapper {
    margin-left: 0;
  }

  .menu-toggle {
    display: block;
  }

  .header {
    height: 60px;
  }

  .header-container {
    padding: 0 15px;
  }

  .logo a {
    font-size: 1.5rem;
  }

  .footer-content {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .footer-section {
    h3::after {
      left: 50%;
      transform: translateX(-50%);
    }
  }

  .social-links {
    justify-content: center;
  }

  .mobile-menu {
    top: 60px;
  }

  .mobile-menu.active {
    height: calc(100vh - 60px);
  }

  .mobile-nav-link {
    font-size: 1.1rem;
    padding: 12px 0;
  }

  .mobile-user-info {
    font-size: 0.9rem;
    padding: 12px;
  }

  .main-content {
    padding: 15px;
  }

  .auth-buttons {
    gap: 5px;
  }

  .user-dropdown .el-dropdown-link {
    padding: 5px 10px;
    font-size: 0.9rem;

    .user-avatar {
      width: 24px;
      height: 24px;
      line-height: 24px;
    }
  }
}

@media (min-width: 769px) {
  .mobile-menu {
    display: none;
  }
}
</style>