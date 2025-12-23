<template>
  <div class="articles-page">
    <div class="container">
      <transition name="page-header" appear>
        <div class="page-header">
          <h1 class="page-title">所有文章</h1>
          <div class="header-meta">
            <el-icon><Document /></el-icon>
            <span>{{ totalArticles }} 篇文章</span>
          </div>
        </div>
      </transition>

      <div class="filters">
        <div class="filter-group">
          <label>按分类筛选:</label>
          <el-select
            v-model="selectedCategory"
            placeholder="选择分类"
            clearable
            @change="filterArticles"
          >
            <el-option
              v-for="category in categories"
              :key="category"
              :label="category"
              :value="category"
            />
          </el-select>
        </div>

        <div class="filter-group">
          <label>按标签筛选:</label>
          <el-select
            v-model="selectedTag"
            placeholder="选择标签"
            clearable
            @change="filterArticles"
          >
            <el-option
              v-for="tag in allTags"
              :key="tag"
              :label="tag"
              :value="tag"
            />
          </el-select>
        </div>

        <div class="search-box">
          <el-input
            v-model="searchQuery"
            placeholder="搜索文章..."
            clearable
            @input="searchArticles"
          >
            <template #prefix>
              <el-icon class="el-input__icon"><Search /></el-icon>
            </template>
          </el-input>
        </div>
      </div>

      <transition-group name="article-list" tag="div" class="article-list">
        <div
          v-for="article in articles"
          :key="article.id"
          class="article-item"
          @click="goToArticle(article.id)"
        >
          <div class="article-content">
            <h2 class="article-title">{{ article.title }}</h2>
            <p class="article-excerpt">{{ article.excerpt }}</p>
            <div class="article-meta">
              <span class="article-date">
                <el-icon><Timer /></el-icon>
                {{ formatDate(article.date) }}
              </span>
              <span class="article-category" v-if="article.category">
                <el-tag type="success" size="small">{{
                  article.category
                }}</el-tag>
              </span>
              <span class="article-tags">
                <el-tag
                  v-for="tag in article.tags"
                  :key="tag"
                  size="small"
                  class="tag"
                >
                  {{ tag }}
                </el-tag>
              </span>
            </div>
          </div>
        </div>
      </transition-group>

      <div class="pagination" v-if="totalPages > 1">
        <el-pagination
          layout="prev, pager, next, jumper, ->, total"
          :total="totalArticles"
          :page-size="pageSize"
          :current-page="currentPage"
          @current-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import {
  ElSelect,
  ElOption,
  ElInput,
  ElTag,
  ElPagination,
  ElIcon,
  ElMessage,
} from "element-plus";
import { Document, Search, Timer } from "@element-plus/icons-vue";
import { getArticles } from "../../api/article";
import { getCategories } from "../../api/category";

interface Article {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  tags: string[];
  category: string;
}

const router = useRouter();

// 响应式数据
const articles = ref<Article[]>([]);
const categories = ref<string[]>([]);
const allTags = ref<string[]>([]);
const selectedCategory = ref("");
const selectedTag = ref("");
const searchQuery = ref("");
const currentPage = ref(1);
const pageSize = ref(5);
const totalArticles = ref(0);
const totalPages = ref(0);
const loading = ref(false);

// 获取所有分类
const fetchCategories = async () => {
  try {
    const response = await getCategories();
    categories.value = response.map((item: any) => item.name);
  } catch (error) {
    console.error("获取分类失败:", error);
    ElMessage.error("获取分类失败");
  }
};

// 获取所有标签
const fetchAllTags = async () => {
  try {
    const response = await getArticles({ limit: 1000 }); // 获取足够多的文章以收集所有标签
    const tags = new Set<string>();
    response.articles.forEach((article: any) => {
      // 假设后端会返回标签数据，这里暂时使用空数组
      if (article.tags && Array.isArray(article.tags)) {
        article.tags.forEach((tag: string) => tags.add(tag));
      }
    });
    allTags.value = Array.from(tags);
  } catch (error) {
    console.error("获取标签失败:", error);
    ElMessage.error("获取标签失败");
  }
};

// 获取文章列表
const fetchArticles = async () => {
  loading.value = true;
  try {
    const params: any = {
      page: currentPage.value,
      limit: pageSize.value,
    };

    if (selectedCategory.value) {
      params.category = selectedCategory.value;
    }

    if (searchQuery.value) {
      params.search = searchQuery.value;
    }

    const response = await getArticles(params);

    articles.value = response.articles.map((article: any) => ({
      id: article.id,
      title: article.title,
      excerpt: article.content.substring(0, 150) + "...", // 简单截取内容作为摘要
      date: article.created_at,
      tags: [], // 标签暂时为空，后续可以从后端获取
      category: article.category,
    }));

    totalArticles.value = response.total;
    totalPages.value = response.totalPages;
  } catch (error) {
    console.error("获取文章失败:", error);
    ElMessage.error("获取文章失败");
  } finally {
    loading.value = false;
  }
};

// 过滤文章
const filterArticles = () => {
  currentPage.value = 1;
  fetchArticles();
};

// 搜索文章
const searchArticles = () => {
  currentPage.value = 1;
  fetchArticles();
};

// 处理页面变化
const handlePageChange = (page: number) => {
  currentPage.value = page;
  fetchArticles();
  // 滚动到顶部
  window.scrollTo({ top: 0, behavior: "smooth" });
};

// 跳转到文章详情页
const goToArticle = (id: number) => {
  router.push({ name: "ArticleDetail", params: { id: id.toString() } });
};

// 格式化日期
const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  return new Date(dateString).toLocaleDateString("zh-CN", options);
};

// 监听筛选条件变化
watch([selectedCategory, selectedTag, searchQuery], () => {
  currentPage.value = 1;
  fetchArticles();
});

onMounted(() => {
  fetchCategories();
  fetchAllTags();
  fetchArticles();
});
</script>

<style scoped lang="scss">
.articles-page {
  padding: 20px 0 40px;
  background: linear-gradient(
    135deg,
    var(--background-color) 0%,
    var(--card-bg) 100%
  );
  min-height: calc(100vh - 140px);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
  padding: 30px 0;
}

.page-title {
  font-size: 2.8rem;
  margin-bottom: 15px;
  color: var(--text-color);
  font-weight: 800;
  position: relative;
  display: inline-block;
}

.page-title::after {
  content: "";
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 4px;
  background: linear-gradient(120deg, #3498db, #2c3e50);
  border-radius: 2px;
}

.header-meta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: var(--text-color-secondary);
  font-size: 1.1rem;
}

.filters {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 30px;
  margin-bottom: 40px;
  flex-wrap: wrap;

  .filter-group {
    display: flex;
    align-items: center;
    gap: 15px;
    color: var(--text-color);
    font-weight: 500;
  }

  .search-box {
    flex: 1;
    max-width: 400px;
  }

  :deep(.el-select) {
    width: 200px;
  }
}

.article-list {
  margin-bottom: 40px;
}

.article-item {
  background: var(--card-bg);
  border-radius: 15px;
  box-shadow: var(--card-shadow);
  padding: 30px;
  margin-bottom: 25px;
  cursor: pointer;
  transition: all 0.4s ease;
  border: 1px solid var(--border-color);

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  }
}

.article-title {
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0 0 15px 0;
  color: var(--text-color);
  transition: color 0.3s ease;
}

.article-item:hover .article-title {
  color: #3498db;
}

.article-excerpt {
  color: var(--text-color-secondary);
  line-height: 1.8;
  margin-bottom: 20px;
}

.article-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.95rem;
}

.article-date {
  color: var(--text-color-secondary);
  display: flex;
  align-items: center;
  gap: 5px;
}

.article-tags {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.tag {
  margin-right: 5px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
  }
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 30px;

  :deep(.el-pagination) {
    .btn-prev,
    .btn-next,
    .el-pager li {
      background: var(--card-bg);
      color: var(--text-color);
      border: 1px solid var(--border-color);

      &:hover {
        color: #3498db;
      }
    }

    .el-pager li.is-active {
      background: linear-gradient(120deg, #3498db, #2c3e50);
      color: white;
      border-color: #3498db;
    }
  }
}

@media (max-width: 768px) {
  .page-title {
    font-size: 2.2rem;
  }

  .filters {
    flex-direction: column;
    align-items: flex-start;
  }

  .search-box {
    max-width: 100%;
    width: 100%;
  }

  :deep(.el-select) {
    width: 100%;
  }

  .article-title {
    font-size: 1.5rem;
  }

  .article-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
}
</style>