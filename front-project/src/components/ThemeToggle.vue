<template>
  <div class="theme-toggle" @click="toggleTheme">
    <el-icon v-if="theme === 'dark'">
      <Moon />
    </el-icon>
    <el-icon v-else>
      <Sunny />
    </el-icon>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import {
  getCurrentTheme,
  toggleTheme as toggleThemeUtil,
} from "../utils/theme";
import { Moon, Sunny } from "@element-plus/icons-vue";

const theme = ref(getCurrentTheme());

const toggleTheme = () => {
  theme.value = toggleThemeUtil();

  // 触发自定义事件，通知其他组件主题已更改
  window.dispatchEvent(
    new CustomEvent("theme-changed", { detail: theme.value })
  );
};

// 监听系统主题变化
const handleSystemThemeChange = (e: MediaQueryListEvent) => {
  const newTheme = e.matches ? "dark" : "light";
  theme.value = newTheme;
  localStorage.setItem("theme", newTheme);
  document.documentElement.setAttribute("data-theme", newTheme);
  document.documentElement.classList.toggle("dark", newTheme === "dark");

  // 触发自定义事件
  window.dispatchEvent(new CustomEvent("theme-changed", { detail: newTheme }));
};

// 监听其他窗口的主题变化
const handleThemeChange = (e: CustomEvent) => {
  theme.value = e.detail;
};

onMounted(() => {
  theme.value = getCurrentTheme();

  // 监听系统主题偏好变化
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", handleSystemThemeChange);

  // 监听自定义主题变化事件
  window.addEventListener("theme-changed", handleThemeChange as EventListener);
});

onUnmounted(() => {
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .removeEventListener("change", handleSystemThemeChange);
  window.removeEventListener(
    "theme-changed",
    handleThemeChange as EventListener
  );
});
</script>

<script lang="ts">
export default {
  name: "ThemeToggle"
}
</script>

<style scoped lang="scss">
.theme-toggle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: var(--theme-toggle-bg);
  color: var(--theme-toggle-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--border-color);

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  i {
    font-size: 20px;
  }
}
</style>