<template>
  <div class="blog-home">
    <div class="hero-section">
      <div class="hero-content">
        <transition name="title" appear>
          <h1 class="hero-title">欢迎来到我的个人博客</h1>
        </transition>
        <transition name="subtitle" appear>
          <p class="hero-subtitle">在这里分享技术、生活和思考</p>
        </transition>
        <div class="hero-meta">
          <span class="meta-item">
            <el-icon><Document /></el-icon>
            {{ stats.articles }} 篇文章
          </span>
          <span class="meta-item">
            <el-icon><PriceTag /></el-icon>
            {{ stats.tags }} 个标签
          </span>
        </div>
        <div class="hero-actions">
          <el-button type="primary" size="large" @click="goToArticles">
            <el-icon><Document /></el-icon>
            浏览文章
          </el-button>
          <el-button type="info" size="large" @click="goToFeatures">
            <el-icon><More /></el-icon>
            了解更多
          </el-button>
        </div>
      </div>
    </div>

    <div class="container">
      <div class="content-grid">
        <div class="main-content">
          <div class="section-header">
            <h2 class="section-title">最新文章</h2>
            <el-link @click="goToArticles" type="primary">
              <el-icon><View /></el-icon>
              查看全部
            </el-link>
          </div>

          <div class="article-list">
            <div
              v-for="article in recentArticles"
              :key="article.id"
              class="article-item"
              @click="goToArticle(article.id)"
            >
              <div class="article-content">
                <h3 class="article-title">{{ article.title }}</h3>
                <p class="article-excerpt">{{ article.excerpt }}</p>
                <div class="article-meta">
                  <span class="article-date">
                    <el-icon><Timer /></el-icon>
                    {{ formatDate(article.date) }}
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
          </div>
        </div>

        <div class="sidebar">
          <div class="about-card card">
            <div class="avatar">
              <div class="avatar-placeholder">
                <el-icon><User /></el-icon>
              </div>
            </div>
            <h3>关于我</h3>
            <p class="bio">
              我是一名热爱技术和编程的开发者，专注于前端和全栈开发。在这里我会分享我的学习心得和技术经验。
            </p>
            <div class="social-links">
              <el-link href="#" target="_blank">
                <el-icon><ChatDotRound /></el-icon>
              </el-link>
              <el-link href="#" target="_blank">
                <el-icon><Platform /></el-icon>
              </el-link>
              <el-link href="#" target="_blank">
                <el-icon><Guide /></el-icon>
              </el-link>
            </div>
          </div>

          <div class="stats-card card">
            <h3>博客统计</h3>
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-number">{{ stats.articles }}</div>
                <div class="stat-label">文章</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">{{ stats.tags }}</div>
                <div class="stat-label">标签</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">{{ stats.friends }}</div>
                <div class="stat-label">友链</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">{{ stats.categories }}</div>
                <div class="stat-label">分类</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">{{ stats.users }}</div>
                <div class="stat-label">用户</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">{{ stats.views }}</div>
                <div class="stat-label">浏览量</div>
              </div>
            </div>
          </div>

          <div class="tags-card card">
            <h3>热门标签</h3>
            <div class="tags-list">
              <el-tag
                v-for="tag in popularTags"
                :key="tag"
                size="small"
                class="tag"
                @click="filterByTag(tag)"
              >
                {{ tag }}
              </el-tag>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElTag, ElLink, ElButton, ElMessage, ElIcon } from "element-plus";
import {
  Document,
  PriceTag,
  More,
  View,
  Timer,
  User,
  ChatDotRound,
  Platform,
  Guide,
} from "@element-plus/icons-vue";
import { getRecentArticles } from "../../api/article";
import { getBlogStats } from "../../api/stats";

interface Article {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  tags: string[];
  image?: string;
}

const router = useRouter();

const recentArticles = ref<Article[]>([]);
const stats = ref({
  articles: 0,
  tags: 0,
  friends: 0,
  categories: 0,
  users: 0,
  views: 0,
});

const popularTags = ref([
  "Vue",
  "React",
  "JavaScript",
  "CSS",
  "TypeScript",
  "Node.js",
  "前端",
  "后端",
]);

// 获取最新文章
const fetchRecentArticles = async () => {
  try {
    // 获取最近的10篇文章
    const response = await getRecentArticles(10);
    recentArticles.value = response.articles.map((item: any) => ({
      id: item.id,
      title: item.title,
      excerpt: item.content.substring(0, 150) + "...",
      date: item.created_at,
      tags: [], // 标签暂时为空，后续可以从后端获取
      image: "",
    }));
  } catch (error) {
    ElMessage.error("获取文章失败");
  }
};

// 获取博客统计数据
const fetchBlogStats = async () => {
  try {
    // 调用实际的API获取统计数据
    const response = await getBlogStats();
    stats.value = response;
  } catch (error) {
    ElMessage.error("获取统计数据失败");
  }
};

const goToArticle = (id: number) => {
  router.push({ name: "ArticleDetail", params: { id } });
};

const goToArticles = () => {
  router.push("/blog/articles");
};

const goToFeatures = () => {
  router.push("/blog/features");
};

const filterByTag = (tag: string) => {
  ElMessage.info(`筛选标签: ${tag}`);
};

const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  return new Date(dateString).toLocaleDateString("zh-CN", options);
};

onMounted(() => {
  fetchRecentArticles();
  fetchBlogStats();
});
</script>

<style scoped lang="scss">
.blog-home {
  padding-top: 20px;
}

.hero-section {
  background: linear-gradient(120deg, #3498db 0%, #2c3e50 100%);
  padding: 100px 20px;
  text-align: center;
  margin-bottom: 40px;
  color: white;
  border-radius: 0 0 20px 20px;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
}

.hero-title {
  font-size: 2.8rem;
  font-weight: 700;
  margin-bottom: 15px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.hero-subtitle {
  font-size: 1.3rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 30px;
}

.hero-meta {
  display: flex;
  justify-content: center;
  gap: 30px;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 40px;
  flex-wrap: wrap;

  .meta-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 1.1rem;
  }
}

.hero-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;

  :deep(.el-button) {
    border-radius: 30px;
    padding: 12px 30px;
    font-size: 1.1rem;
    border: none;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);

    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
    }
  }
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  .section-title {
    font-size: 1.8rem;
    font-weight: 700;
    margin: 0;
    color: #2c3e50;
    position: relative;
    padding-bottom: 10px;
  }

  .section-title::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    width: 50px;
    height: 4px;
    background: linear-gradient(120deg, #3498db, #2c3e50);
    border-radius: 2px;
  }
}

.article-item {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 15px rgba(0, 0, 0, 0.05);
  margin-bottom: 25px;
  overflow: hidden;
  transition: all 0.4s ease;
  border: 1px solid #f1f1f1;
  cursor: pointer;
}

.article-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.article-content {
  padding: 30px;
}

.article-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 15px 0;
  color: #2c3e50;
  transition: color 0.3s ease;
}

.article-item:hover .article-title {
  color: #3498db;
}

.article-excerpt {
  color: #7f8c8d;
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
  color: #95a5a6;
  display: flex;
  align-items: center;
  gap: 5px;
}

.tag {
  margin-right: 5px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
  }
}

.sidebar {
  .card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 1px 15px rgba(0, 0, 0, 0.05);
    padding: 25px;
    margin-bottom: 25px;
    border: 1px solid #f1f1f1;
    transition: all 0.3s ease;
  }

  .card:hover {
    transform: translateY(-3px);
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
  }

  h3 {
    margin-top: 0;
    margin-bottom: 20px;
    color: #2c3e50;
    font-size: 1.4rem;
    font-weight: 700;
    padding-bottom: 15px;
    border-bottom: 2px solid #f1f1f1;
    position: relative;
  }

  h3::after {
    content: "";
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 40px;
    height: 2px;
    background: #3498db;
  }

  p {
    color: #7f8c8d;
    line-height: 1.8;
  }
}

.avatar {
  text-align: center;
  margin-bottom: 20px;

  .avatar-placeholder {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: linear-gradient(120deg, #3498db, #2c3e50);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2.5rem;
    color: white;
    margin: 0 auto;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }
}

.bio {
  margin-bottom: 25px;
  font-size: 1.05rem;
}

.social-links {
  display: flex;
  justify-content: center;
  gap: 20px;

  :deep(.el-link) {
    font-size: 1.5rem;
    color: #7f8c8d;
    transition: all 0.3s ease;

    &:hover {
      color: #3498db;
      transform: translateY(-3px);
    }
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  text-align: center;
}

.stat-item {
  padding: 15px 0;
}

.stat-number {
  font-size: 2rem;
  font-weight: 800;
  color: #3498db;
  margin-bottom: 5px;
}

.stat-label {
  color: #95a5a6;
  font-size: 0.95rem;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;

  :deep(.el-tag) {
    cursor: pointer;
    border: none;
    background: linear-gradient(120deg, #f8f9fa, #eef2f7);
    color: #2c3e50;
    transition: all 0.3s ease;

    &:hover {
      background: linear-gradient(120deg, #3498db, #2c3e50);
      color: white;
      transform: translateY(-2px);
    }
  }
}

@media (max-width: 768px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .hero-title {
    font-size: 2.2rem;
  }

  .hero-section {
    padding: 60px 20px;
  }

  .article-content {
    padding: 20px;
  }

  .article-title {
    font-size: 1.3rem;
  }

  .hero-actions {
    flex-direction: column;
    align-items: center;
  }

  :deep(.el-button) {
    width: 80%;
  }
}
</style>