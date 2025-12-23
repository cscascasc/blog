<template>
  <div class="article-preview">
    <div class="preview-header">
      <el-page-header @back="goBack" :content="article.title || '文章预览'">
      </el-page-header>
    </div>

    <div class="preview-content">
      <div class="article-info">
        <div class="info-item">
          <i class="el-icon-user"></i>
          <span>{{ article.author }}</span>
        </div>
        <div class="info-item">
          <i class="el-icon-time"></i>
          <span>{{ formatDate(article.date) }}</span>
        </div>
        <div class="info-item">
          <i class="el-icon-folder"></i>
          <span>{{ article.category }}</span>
        </div>
        <div class="info-item tags">
          <i class="el-icon-price-tag"></i>
          <el-tag v-for="tag in article.tags" :key="tag" class="tag">
            {{ tag }}
          </el-tag>
        </div>
      </div>

      <div class="preview-area">
        <v-md-preview :text="article.content"></v-md-preview>
      </div>

      <div class="preview-actions">
        <el-button @click="goBack" size="large">返回编辑</el-button>
        <el-button type="primary" @click="confirmPublish" size="large">
          {{ article.status === "published" ? "更新文章" : "发布文章" }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage, ElPageHeader, ElTag, ElButton } from "element-plus";

interface Article {
  id: number;
  title: string;
  author: string;
  date: string;
  category: string;
  tags: string[];
  content: string;
  status: string;
}

const route = useRoute();
const router = useRouter();

// 从路由参数获取文章数据
const article = computed<Article>(() => {
  const articleData = route.query.article;
  if (articleData) {
    try {
      return JSON.parse(decodeURIComponent(articleData as string));
    } catch (e) {
      ElMessage.error("文章数据解析失败");
    }
  }

  // 默认数据
  return {
    id: 0,
    title: "文章标题",
    author: "作者",
    date: new Date().toISOString().split("T")[0],
    category: "技术",
    tags: ["Vue", "Markdown"],
    content: "# 标题\n\n这是文章内容",
    status: "draft",
  };
});

const goBack = () => {
  router.go(-1);
};

const confirmPublish = () => {
  ElMessage.success(
    `${
      article.value.status === "published" ? "文章已更新" : "文章已发布"
    }成功！`
  );
  router.push("/admin/articles");
};

const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  return new Date(dateString).toLocaleDateString("zh-CN", options);
};
</script>

<style scoped lang="scss">
.article-preview {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.preview-header {
  border-bottom: 1px solid #eee;
  padding-bottom: 20px;
  margin-bottom: 20px;
}

.preview-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.article-info {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  padding: 15px 20px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 20px;
  align-items: center;

  .info-item {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #606266;

    i {
      color: #909399;
    }

    &.tags {
      gap: 10px;
    }
  }

  .tag {
    margin-right: 5px;
  }
}

.preview-area {
  flex: 1;
  overflow-y: auto;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 20px;
  background: white;

  :deep(.v-md-editor-preview) {
    padding: 0;
  }
}

.preview-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  padding: 20px 0;
  margin-top: 20px;
  border-top: 1px solid #eee;

  .el-button {
    padding: 12px 30px;
  }
}

@media (max-width: 768px) {
  .article-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .preview-actions {
    flex-direction: column;
    align-items: center;

    .el-button {
      width: 100%;
      max-width: 300px;
    }
  }
}
</style>