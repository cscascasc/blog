<template>
  <div class="auth-layout">
    <div class="auth-container">
      <div class="auth-header">
        <h1 class="logo">博客管理系统</h1>
      </div>
      <div class="auth-content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 认证布局组件，用于登录和注册页面
</script>

<style scoped lang="scss">
.auth-layout {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.auth-container {
  width: 100%;
  max-width: 400px;
}

.auth-header {
  text-align: center;
  margin-bottom: 30px;

  .logo {
    color: white;
    font-size: 2rem;
    font-weight: bold;
    margin: 0;
  }
}

.auth-content {
  background: white;
  border-radius: 10px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
}
</style>