<template>
  <transition name="article" appear>
    <div class="article-detail">
      <div class="container">
        <el-backtop :target="articleDetailRef" :right="50" :bottom="50">
          <div class="backtop-button">
            <el-icon><ArrowUp /></el-icon>
          </div>
        </el-backtop>

        <div class="article-header">
          <div class="return-button">
            <el-button @click="goBack" round>
              <el-icon><ArrowLeft /></el-icon>
              返回
            </el-button>
          </div>
          <h1 class="article-title">{{ article.title }}</h1>
          <div class="article-meta">
            <span class="article-date">
              <el-icon><Timer /></el-icon>
              {{ formatDate(article.date) }}
            </span>
            <span class="article-author">
              <el-icon><User /></el-icon>
              {{ article.author }}
            </span>
            <span class="article-views">
              <el-icon><View /></el-icon>
              {{ article.views }} 次浏览
            </span>
            <span class="article-tags">
              <el-tag
                v-for="tag in article.tags"
                :key="tag"
                class="tag"
                effect="dark"
              >
                {{ tag }}
              </el-tag>
            </span>
          </div>
          <div class="article-actions">
            <el-button
              @click="toggleFavorite"
              :type="isFavorite ? 'danger' : 'default'"
              round
            >
              <el-icon>
                <StarFilled v-if="isFavorite" />
                <Star v-else />
              </el-icon>
              {{ isFavorite ? "已收藏" : "收藏" }}
            </el-button>
            <el-dropdown @command="handleShare">
              <el-button round>
                <el-icon><Share /></el-icon>
                分享
                <el-icon class="el-icon--right"><arrow-down /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="wechat">
                    <el-icon><ChatDotRound /></el-icon>
                    微信
                  </el-dropdown-item>
                  <el-dropdown-item command="weibo">
                    <el-icon><Platform /></el-icon>
                    微博
                  </el-dropdown-item>
                  <el-dropdown-item command="qq">
                    <el-icon><CopyDocument /></el-icon>
                    QQ
                  </el-dropdown-item>
                  <el-dropdown-item command="link" divided>
                    <el-icon><Link /></el-icon>
                    复制链接
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <el-button @click="adjustFontSize('increase')" circle>
              <el-icon><CirclePlus /></el-icon>
            </el-button>
            <el-button @click="adjustFontSize('decrease')" circle>
              <el-icon><Remove /></el-icon>
            </el-button>
          </div>
        </div>

        <div class="article-content" :style="{ fontSize: fontSize + 'px' }">
          <v-md-preview :text="article.content"></v-md-preview>
        </div>

        <div class="article-comments">
          <h3>
            评论 ({{ comments && comments.length ? comments.length : 0 }})
          </h3>
          <div class="comment-form">
            <el-input
              v-model="commentForm.content"
              type="textarea"
              placeholder="请输入您的评论..."
              :rows="4"
              maxlength="500"
              show-word-limit
            ></el-input>
            <div class="comment-actions">
              <el-button
                type="primary"
                @click="submitComment"
                :disabled="!commentForm.content"
              >
                发表评论
              </el-button>
            </div>
          </div>
          <div class="comments-list">
            <div
              v-for="comment in comments"
              :key="comment.id"
              class="comment-item"
            >
              <div class="comment-header">
                <span class="comment-author">{{ comment.author }}</span>
                <span class="comment-date">{{
                  formatDate(comment.created_at)
                }}</span>
              </div>
              <div class="comment-content">
                <p
                  v-if="
                    shouldTruncate(comment.content) &&
                    !expandedComments.has(comment.id)
                  "
                >
                  {{ truncateContent(comment.content) }}
                  <el-button
                    type="primary"
                    link
                    @click="toggleCommentExpansion(comment.id)"
                    class="expand-button"
                  >
                    展开 <el-icon><CaretBottom /></el-icon>
                  </el-button>
                </p>
                <p
                  v-else-if="
                    shouldTruncate(comment.content) &&
                    expandedComments.has(comment.id)
                  "
                >
                  {{ comment.content }}
                  <el-button
                    type="primary"
                    link
                    @click="toggleCommentExpansion(comment.id)"
                    class="expand-button"
                  >
                    收起 <el-icon><CaretTop /></el-icon>
                  </el-button>
                </p>
                <p v-else>{{ comment.content }}</p>
              </div>
              <div class="comment-footer">
                <div class="comment-actions">
                  <el-button
                    size="small"
                    @click="handleLikeComment(comment.id)"
                    :type="comment.likes > 0 ? 'danger' : 'default'"
                  >
                    <el-icon><ChatDotRound /></el-icon>
                    {{ comment.likes > 0 ? comment.likes : "点赞" }}
                  </el-button>
                  <el-button
                    v-if="isUserComment(comment.user_id)"
                    size="small"
                    type="danger"
                    @click="handleDeleteComment(comment.id)"
                  >
                    <el-icon><Delete /></el-icon>
                    删除
                  </el-button>
                </div>
              </div>
            </div>
          </div>
          <div v-if="comments && comments.length === 0" class="no-comments">
            <p>暂无评论，快来发表第一条评论吧！</p>
          </div>
        </div>

        <div class="article-nav">
          <div class="prev-article" v-if="prevArticle">
            <el-button @click="goToArticle(prevArticle.id)" round>
              <el-icon><ArrowLeft /></el-icon>
              {{ prevArticle.title }}
            </el-button>
          </div>
          <div class="next-article" v-if="nextArticle">
            <el-button @click="goToArticle(nextArticle.id)" round>
              {{ nextArticle.title }}
              <el-icon><ArrowRight /></el-icon>
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, reactive } from "vue";
import { useRoute, useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import {
  ElBacktop,
  ElTag,
  ElButton,
  ElDropdown,
  ElDropdownMenu,
  ElDropdownItem,
  ElMessage,
  ElIcon,
  ElInput,
} from "element-plus";
import {
  ArrowUp,
  ArrowLeft,
  Timer,
  User,
  StarFilled,
  Star,
  Share,
  ArrowDown,
  ChatDotRound,
  Platform,
  CopyDocument,
  Link,
  CirclePlus,
  Remove,
  ArrowRight,
  View,
  Delete,
  CaretTop,
  CaretBottom,
} from "@element-plus/icons-vue";
import { getArticleById } from "../../api/article";
import {
  getCommentsByArticleId,
  createComment,
  deleteComment,
  likeComment,
  unlikeComment,
} from "../../api/comment";
import { useUserStore } from "../../stores/userStore";

interface Article {
  id: number;
  title: string;
  author: string;
  date: string;
  tags: string[];
  content: string;
  views: number;
}

interface Comment {
  id: number;
  article_id: number;
  user_id: number;
  content: string;
  author: string;
  status: "approved" | "pending" | "rejected";
  created_at: string;
  likes: number;
}

const route = useRoute();
const router = useRouter();
const articleDetailRef = ref<HTMLElement | null>(null);

// 字体大小相关
const fontSize = ref(16);
const isFavorite = ref(false);
const favoriteArticles = ref<number[]>([]);

// 文章相关
const article = ref({
  id: 0,
  title: "",
  author: "",
  date: "",
  tags: [],
  content: "",
  views: 0,
});

// 评论相关
const comments = ref<Comment[]>([]);
const commentForm = reactive({
  content: "",
});

// 用户相关
const userStore = useUserStore();
const { isAuthenticated, currentUser } = storeToRefs(userStore);

// 评论展开/收起相关
const expandedComments = ref<Set<number>>(new Set());

const prevArticle = computed(() => {
  // 暂时禁用上一篇文章功能，因为我们现在只显示一篇真实文章
  return null;
});

const nextArticle = computed(() => {
  // 暂时禁用下一篇文章功能，因为我们现在只显示一篇真实文章
  return null;
});

const goToArticle = (id: number) => {
  router.push({ name: "ArticleDetail", params: { id: id.toString() } });
};

const goBack = () => {
  router.go(-1);
};

const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  return new Date(dateString).toLocaleDateString("zh-CN", options);
};

// 字体大小调节功能
const adjustFontSize = (action: "increase" | "decrease") => {
  if (action === "increase") {
    fontSize.value = Math.min(fontSize.value + 2, 24);
  } else {
    fontSize.value = Math.max(fontSize.value - 2, 12);
  }
  ElMessage.info(`字体大小已调整为 ${fontSize.value}px`);
};

// 收藏功能
const toggleFavorite = () => {
  const articleId = article.value.id;
  const index = favoriteArticles.value.indexOf(articleId);

  if (index > -1) {
    // 取消收藏
    favoriteArticles.value.splice(index, 1);
    isFavorite.value = false;
    ElMessage.info("已取消收藏");
  } else {
    // 添加收藏
    favoriteArticles.value.push(articleId);
    isFavorite.value = true;
    ElMessage.success("已添加到收藏");
  }

  // 保存到本地存储
  localStorage.setItem(
    "favoriteArticles",
    JSON.stringify(favoriteArticles.value)
  );
};

// 分享功能
const handleShare = (command: string) => {
  const url = window.location.href;

  switch (command) {
    case "link":
      navigator.clipboard.writeText(url).then(() => {
        ElMessage.success("链接已复制到剪贴板");
      });
      break;
    case "wechat":
      ElMessage.info("请使用微信扫码分享功能");
      break;
    case "weibo":
      ElMessage.info("请使用微博分享功能");
      break;
    case "qq":
      ElMessage.info("请使用QQ分享功能");
      break;
  }
};

// 页面加载时恢复收藏状态和字体大小
onMounted(async () => {
  // 恢复收藏状态
  const savedFavorites = localStorage.getItem("favoriteArticles");
  if (savedFavorites) {
    favoriteArticles.value = JSON.parse(savedFavorites);
  }

  // 恢复字体大小
  const savedFontSize = localStorage.getItem("articleFontSize");
  if (savedFontSize) {
    fontSize.value = parseInt(savedFontSize, 10);
  }

  // 加载文章和评论
  await loadArticle();
  await loadComments();
});

// 页面卸载前保存字体大小
onBeforeUnmount(() => {
  localStorage.setItem("articleFontSize", fontSize.value.toString());
});

// 加载文章
const loadArticle = async () => {
  try {
    // 检查路由参数
    if (!route.params.id) {
      throw new Error("文章ID不存在");
    }

    const id = Number(route.params.id);

    // 检查ID是否有效
    if (isNaN(id) || id <= 0) {
      throw new Error("无效的文章ID");
    }

    const response = await getArticleById(id);

    // 映射后端返回的数据到前端所需格式
    article.value = {
      id: response.id,
      title: response.title,
      author: response.author,
      date: response.created_at,
      tags: [], // 标签暂时为空，后续可以从后端获取
      content: response.content,
      views: response.views,
    };

    // 设置收藏状态
    isFavorite.value = favoriteArticles.value.includes(article.value.id);
  } catch (error) {
    console.error("获取文章失败:", error);
    ElMessage.error("获取文章失败: " + (error.message || "未知错误"));
  }
};

// 切换评论展开/收起状态
const toggleCommentExpansion = (commentId: number) => {
  if (expandedComments.value.has(commentId)) {
    expandedComments.value.delete(commentId);
  } else {
    expandedComments.value.add(commentId);
  }
};

// 检查评论是否应该截断
const shouldTruncate = (content: string) => {
  return content.length > 150;
};

// 截断评论内容
const truncateContent = (content: string) => {
  return content.length > 150 ? content.substring(0, 150) + "..." : content;
};

// 检查是否是当前用户发布的评论
const isUserComment = (userId: number) => {
  return (
    isAuthenticated.value &&
    currentUser.value &&
    currentUser.value.id === userId
  );
};

// 删除评论
const handleDeleteComment = async (commentId: number) => {
  try {
    await deleteComment(commentId);
    // 重新加载评论
    await loadComments();
    ElMessage.success("评论删除成功");
  } catch (error) {
    console.error("删除评论失败:", error);
    ElMessage.error("删除评论失败: " + (error.message || "未知错误"));
  }
};

// 点赞评论
const handleLikeComment = async (commentId: number) => {
  try {
    await likeComment(commentId);
    // 重新加载评论
    await loadComments();
  } catch (error) {
    console.error("点赞评论失败:", error);
    ElMessage.error("点赞评论失败: " + (error.message || "未知错误"));
  }
};

// 加载评论
const loadComments = async () => {
  try {
    // 检查路由参数
    if (!route.params.id) {
      throw new Error("文章ID不存在");
    }

    const id = Number(route.params.id);

    // 检查ID是否有效
    if (isNaN(id) || id <= 0) {
      throw new Error("无效的文章ID");
    }

    const response = await getCommentsByArticleId(id);
    comments.value = response;
  } catch (error) {
    console.error("获取评论失败:", error);
    ElMessage.error("获取评论失败: " + (error.message || "未知错误"));
  }
};

// 提交评论
const submitComment = async () => {
  if (!commentForm.content) return;

  try {
    // 检查路由参数
    if (!route.params.id) {
      throw new Error("文章ID不存在");
    }

    const id = Number(route.params.id);

    // 检查ID是否有效
    if (isNaN(id) || id <= 0) {
      throw new Error("无效的文章ID");
    }

    // 检查用户是否已登录
    if (!isAuthenticated.value || !currentUser.value) {
      ElMessage.warning("请先登录后再发表评论");
      return;
    }

    // 这里应该使用实际的用户ID
    const response = await createComment({
      article_id: id,
      user_id: currentUser.value.id,
      content: commentForm.content,
    });

    // 重新加载评论
    await loadComments();
    commentForm.content = "";
    ElMessage.success("评论发表成功");
  } catch (error) {
    console.error("发表评论失败:", error);
    ElMessage.error("发表评论失败: " + (error.message || "未知错误"));
  }
};
</script>

<style scoped lang="scss">
.article-detail {
  padding: 20px 0 40px;
  min-height: calc(100vh - 120px);
  background: linear-gradient(
    135deg,
    var(--background-color) 0%,
    var(--card-bg) 100%
  );
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
}

.article-header {
  background: var(--card-bg);
  border-radius: 15px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: var(--card-shadow);
  border: 1px solid var(--border-color);
  position: relative;
  overflow: hidden;
}

.article-header::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 5px;
  background: linear-gradient(120deg, #3498db, #2c3e50);
}

.return-button {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 1;
}

.article-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 20px 0 25px 0;
  color: var(--text-color);
  text-align: center;
  line-height: 1.4;
}

.article-meta {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 25px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.article-date,
.article-author,
.article-tags {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-color-secondary);
  font-size: 0.95rem;
}

.article-tags {
  gap: 10px;
}

.article-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
  flex-wrap: wrap;
  margin-top: 20px;

  :deep(.el-button) {
    border-radius: 30px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
    }
  }

  :deep(.el-dropdown) {
    outline: none;
  }
}

.article-content {
  background: var(--card-bg);
  border-radius: 15px;
  padding: 40px;
  margin-bottom: 30px;
  box-shadow: var(--card-shadow);
  border: 1px solid var(--border-color);

  :deep(h1) {
    font-size: 2.2rem;
    margin: 30px 0 20px;
    color: var(--text-color);
    padding-bottom: 15px;
    border-bottom: 2px solid var(--border-color);
    position: relative;
  }

  :deep(h1)::after {
    content: "";
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 60px;
    height: 2px;
    background: #3498db;
    border-radius: 1px;
  }

  :deep(h2) {
    font-size: 1.8rem;
    margin: 25px 0 15px;
    color: var(--text-color);
    padding-bottom: 12px;
    border-bottom: 1px solid var(--border-color);
    position: relative;
  }

  :deep(h2)::after {
    content: "";
    position: absolute;
    bottom: -1px;
    left: 0;
    width: 40px;
    height: 2px;
    background: #3498db;
    border-radius: 1px;
  }

  :deep(p) {
    margin-bottom: 20px;
    color: var(--text-color);
    line-height: 1.9;
  }

  :deep(ul),
  :deep(ol) {
    margin: 20px 0;
    padding-left: 35px;
  }

  :deep(li) {
    margin-bottom: 12px;
    color: var(--text-color);
  }

  :deep(pre) {
    background: linear-gradient(120deg, #2c3e50, #34495e);
    padding: 25px;
    border-radius: 12px;
    overflow-x: auto;
    margin: 30px 0;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    border: none;
  }

  :deep(code) {
    font-family: "Courier New", monospace;
    background-color: var(--background-color);
    padding: 3px 8px;
    border-radius: 5px;
    font-size: 0.95rem;
    color: #e74c3c;
  }

  :deep(pre code) {
    background-color: transparent;
    padding: 0;
    color: #f8f9fa;
    font-size: 0.95rem;
  }

  :deep(strong) {
    color: var(--text-color);
    font-weight: 700;
  }

  :deep(a) {
    color: var(--link-color);

    &:hover {
      color: var(--link-hover-color);
    }
  }

  :deep(blockquote) {
    border-left: 4px solid #3498db;
    padding: 10px 20px;
    margin: 20px 0;
    background-color: var(--background-color);
    color: var(--text-color-secondary);
  }
}

.article-comments {
  background: var(--card-bg);
  border-radius: 15px;
  padding: 30px;
  margin: 30px 0;
  box-shadow: var(--card-shadow);
  border: 1px solid var(--border-color);
}

.article-comments h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: var(--text-color);
  font-size: 1.5rem;
  font-weight: 600;
}

.comment-form {
  margin-bottom: 30px;
}

.comment-actions {
  margin-top: 15px;
  text-align: right;
}

.comments-list {
  border-top: 1px solid var(--border-color);
  padding-top: 20px;
}

.comment-item {
  padding: 15px 0;
  border-bottom: 1px solid var(--border-color);
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.comment-author {
  font-weight: 600;
  color: #3498db;
}

.comment-date {
  color: var(--text-color-secondary);
  font-size: 0.9rem;
}

.comment-content {
  color: var(--text-color);
  line-height: 1.6;
  margin-bottom: 15px;
  display: flex;
}

.comment-content p {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}

.expand-button {
  margin-left: 5px;
  font-weight: bold;
}

.comment-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.comment-actions {
  display: flex;
  gap: 10px;
}

.comment-actions .el-button {
  padding: 5px 10px;
}

.no-comments {
  text-align: center;
  color: var(--text-color-secondary);
  padding: 20px 0;
}

.article-nav {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  margin-top: 30px;

  :deep(.el-button) {
    flex: 1;
    padding: 15px 20px;
    border-radius: 12px;
    background: var(--card-bg);
    color: var(--text-color);
    border: 1px solid var(--border-color);
    box-shadow: var(--card-shadow);
    transition: all 0.3s ease;
    white-space: normal;
    height: auto;
    line-height: 1.5;

    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
      border-color: #3498db;
      color: #3498db;
    }
  }
}

.prev-article,
.next-article {
  flex: 1;
  min-width: 0;
}

.next-article {
  text-align: right;
}

.backtop-button {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(120deg, #3498db, #2c3e50);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  box-shadow: 0 3px 15px rgba(52, 152, 219, 0.4);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(52, 152, 219, 0.6);
  }
}

@media (max-width: 768px) {
  .article-title {
    font-size: 2rem;
  }

  .article-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .article-nav {
    flex-direction: column;
  }

  .prev-article,
  .next-article {
    width: 100%;
  }

  .next-article {
    text-align: left;
  }

  .article-content {
    padding: 25px;
  }

  .article-header {
    padding: 20px;
  }

  .article-actions {
    flex-direction: column;
    align-items: flex-start;

    :deep(.el-button) {
      width: 100%;
      justify-content: center;
    }

    :deep(.el-dropdown) {
      width: 100%;

      .el-button {
        width: 100%;
      }
    }
  }

  .return-button {
    position: static;
    margin-bottom: 15px;
  }
}
</style>