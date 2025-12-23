<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup lang="ts">
// 这是主应用组件，使用路由视图渲染不同布局
</script>

<style lang="scss">
@import "@/styles/index.scss";

#app {
  font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB",
    "Microsoft YaHei", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  min-height: 100vh;
}

// 页面切换动画 - 新页面从中心滑入，旧页面向两侧向外滑出
.page-enter-active,
.page-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.page-enter-from {
  opacity: 0;
  transform: scale(0.8);
}

.page-leave-to {
  opacity: 0;
  transform: scaleX(1.2);
}
</style>