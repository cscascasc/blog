<template>
  <div class="not-found">
    <div class="container">
      <div class="content">
        <h1 class="title">404</h1>
        <p class="subtitle">页面未找到</p>
        <p class="description">抱歉，您访问的页面不存在。</p>
        <div class="actions">
          <el-button type="primary" @click="goHome">
            <el-icon><HomeFilled /></el-icon>
            返回首页
          </el-button>
          <el-button @click="goBack">
            <el-icon><ArrowLeft /></el-icon>
            返回上一页
          </el-button>
        </div>
      </div>
      <div class="image">
        <img
          src="https://via.placeholder.com/400x300?text=404+Page+Not+Found"
          alt="404页面未找到"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { ElButton, ElIcon } from "element-plus";
import { HomeFilled, ArrowLeft } from "@element-plus/icons-vue";

const router = useRouter();

const goHome = () => {
  router.push("/");
};

const goBack = () => {
  router.go(-1);
};
</script>

<style scoped lang="scss">
.not-found {
  min-height: calc(100vh - 120px);
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    135deg,
    var(--background-color) 0%,
    var(--card-bg) 100%
  );
  padding: 20px;
}

.container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  width: 100%;
  background: var(--card-bg);
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  padding: 40px;
  gap: 40px;
}

.content {
  flex: 1;
  text-align: center;
}

.title {
  font-size: 6rem;
  font-weight: 800;
  margin: 0 0 20px;
  background: linear-gradient(120deg, #3498db, #2c3e50);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1;
}

.subtitle {
  font-size: 2rem;
  color: var(--text-color);
  margin: 0 0 15px;
  font-weight: 600;
}

.description {
  font-size: 1.2rem;
  color: var(--text-color);
  margin: 0 0 30px;
  line-height: 1.6;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;

  .el-button {
    padding: 12px 30px;
    font-size: 1rem;
    border-radius: 30px;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    }
  }
}

.image {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;

  img {
    max-width: 100%;
    border-radius: 10px;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  }
}

@media (max-width: 768px) {
  .container {
    flex-direction: column;
    padding: 30px 20px;
  }

  .title {
    font-size: 4rem;
  }

  .subtitle {
    font-size: 1.5rem;
  }

  .description {
    font-size: 1rem;
  }

  .actions {
    flex-direction: column;
    gap: 15px;

    .el-button {
      width: 100%;
      max-width: 300px;
    }
  }
}
</style>