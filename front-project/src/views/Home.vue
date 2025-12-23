<template>
  <div class="home">
    <div class="header">
      <h1 class="text-3xl font-bold underline text-primary">
        欢迎使用 Vue 3 + TypeScript + Vite 项目
      </h1>
    </div>
    <p class="mt-4 text-lg">
      这是一个使用 Vue 3、TypeScript、Vite、Sass、Tailwind CSS 和 Element Plus
      构建的前端项目。
    </p>
    <div class="mt-6">
      <el-button type="primary" @click="handleClick"
        >点击测试 Element Plus</el-button
      >
      <el-button @click="goToBlog">进入博客</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElButton, ElMessage } from "element-plus";
import { useRouter } from "vue-router";

const router = useRouter();

const handleClick = () => {
  ElMessage.success("Element Plus 工作正常!");
};

const goToBlog = () => {
  router.push("/blog");
};
</script>

<style scoped lang="scss">
.home {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
}

.mt-6 {
  margin-top: 30px;

  .el-button {
    margin: 0 10px;
  }
}
</style>