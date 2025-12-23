<template>
  <div class="articles-management">
    <div class="toolbar">
      <el-button type="primary" @click="handleCreate" class="create-button">
        <el-icon><Plus /></el-icon>
        <span class="button-text">新建文章</span>
      </el-button>
      <div class="toolbar-right">
        <el-input v-model="searchQuery" placeholder="搜索文章...">
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button @click="handleSearch" class="search-button">
          <el-icon><Search /></el-icon>
          搜索
        </el-button>
      </div>
    </div>

    <el-table :data="articles" style="width: 100%" v-loading="loading" stripe>
      <el-table-column prop="id" label="ID" :width="isMobile ? 60 : 80" />
      <el-table-column
        prop="title"
        label="标题"
        :min-width="isMobile ? 150 : 200"
      >
        <template #default="scope">
          <el-link type="primary" @click="handleView(scope.row)">
            {{ scope.row.title }}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column
        prop="category"
        label="分类"
        :width="isMobile ? 100 : 120"
        :class-name="isMobile ? 'hidden-column' : ''"
      />
      <el-table-column label="标签" :width="isMobile ? 150 : 200">
        <template #default="scope">
          <el-tag
            v-for="tag in scope.row.tags"
            :key="tag"
            size="small"
            style="margin-right: 5px"
          >
            {{ tag }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="author"
        label="作者"
        :width="isMobile ? 80 : 100"
        :class-name="isMobile ? 'hidden-column' : ''"
      />
      <el-table-column
        prop="date"
        label="发布日期"
        :width="isMobile ? 100 : 120"
        :class-name="isMobile ? 'hidden-column' : ''"
      />
      <el-table-column prop="status" label="状态" :width="isMobile ? 100 : 100">
        <template #default="scope">
          <el-tag :type="scope.row.status === 'published' ? 'success' : 'info'">
            {{ scope.row.status === "published" ? "已发布" : "草稿" }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" :width="isMobile ? 150 : 200" fixed="right">
        <template #default="scope">
          <el-button size="small" @click="handleEdit(scope.row)">
            <el-icon><Edit /></el-icon>
            编辑
          </el-button>
          <el-button
            size="small"
            type="danger"
            @click="handleDelete(scope.row)"
          >
            <el-icon><Delete /></el-icon>
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination">
      <el-pagination
        :current-page="currentPage"
        :page-size="pageSize"
        :page-sizes="isMobile ? [5, 10, 20] : [10, 20, 50, 100]"
        :total="total"
        :layout="
          isMobile
            ? 'prev, pager, next'
            : 'total, sizes, prev, pager, next, jumper'
        "
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 文章编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      :width="isMobile ? '95%' : '80%'"
      :fullscreen="fullscreen"
    >
      <el-form
        ref="articleFormRef"
        :model="articleForm"
        :rules="articleRules"
        label-width="100px"
      >
        <el-form-item label="标题" prop="title">
          <el-input v-model="articleForm.title" />
        </el-form-item>
        <el-form-item label="摘要">
          <el-input v-model="articleForm.excerpt" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="articleForm.category" placeholder="请选择分类">
            <el-option
              v-for="category in categories"
              :key="category.id"
              :label="category.name"
              :value="category.name"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="标签">
          <el-select
            v-model="articleForm.tags"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="请选择或创建标签"
          >
            <el-option
              v-for="tag in allTags"
              :key="tag"
              :label="tag"
              :value="tag"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <v-md-editor
            v-model="articleForm.content"
            :height="isMobile ? '300px' : '400px'"
          ></v-md-editor>
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="articleForm.status">
            <el-radio label="draft">草稿</el-radio>
            <el-radio label="published">发布</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="previewArticle">
            <el-icon><View /></el-icon>
            预览
          </el-button>
          <el-button @click="toggleFullscreen">
            <el-icon
              ><FullScreen v-if="!fullscreen" /><Bottom v-else
            /></el-icon>
            {{ fullscreen ? "退出全屏" : "全屏编辑" }}
          </el-button>
          <el-button @click="dialogVisible = false">
            <el-icon><Close /></el-icon>
            取消
          </el-button>
          <el-button type="primary" @click="submitForm">
            <el-icon><Check /></el-icon>
            保存
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Plus,
  Search,
  Edit,
  Delete,
  View,
  FullScreen,
  Bottom,
  Close,
  Check,
} from "@element-plus/icons-vue";
import {
  getArticles,
  createArticle,
  updateArticle,
  deleteArticle,
} from "../../api/article";
import { getCategories } from "../../api/category";
import { ArticleDetail, Category } from "../../types";

const router = useRouter();
const isMobile = ref(false);

const loading = ref(false);
const searchQuery = ref("");
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const dialogVisible = ref(false);
const fullscreen = ref(false);
const dialogTitle = ref("新建文章");
const isEdit = ref(false);
const articleFormRef = ref();

// 文章数据
const articles = ref<ArticleDetail[]>([]);
const categories = ref<Category[]>([]);

const allTags = ref([
  "Vue",
  "React",
  "JavaScript",
  "CSS",
  "TypeScript",
  "Node.js",
  "前端",
  "后端",
]);

const articleForm = reactive({
  id: 0,
  title: "",
  excerpt: "",
  content: "",
  category: "",
  tags: [] as string[],
  author: "管理员",
  date: "",
  status: "draft",
});

const articleRules = {
  title: [{ required: true, message: "请输入标题", trigger: "blur" }],
  content: [{ required: true, message: "请输入内容", trigger: "blur" }],
};

const handleCreate = () => {
  dialogTitle.value = "新建文章";
  isEdit.value = false;
  resetForm();
  dialogVisible.value = true;
};

const handleEdit = (row: ArticleDetail) => {
  dialogTitle.value = "编辑文章";
  isEdit.value = true;
  Object.assign(articleForm, row);
  dialogVisible.value = true;
};

const handleView = (row: ArticleDetail) => {
  // 查看文章详情
  router.push({ name: "ArticleDetail", params: { id: row.id.toString() } });
};

const handleDelete = (row: ArticleDetail) => {
  ElMessageBox.confirm(`确定要删除文章"${row.title}"吗？`, "确认删除", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      try {
        await deleteArticle(row.id);
        ElMessage.success("删除成功");
        fetchData(); // 重新获取数据
      } catch (error) {
        ElMessage.error("删除失败");
      }
    })
    .catch(() => {
      ElMessage.info("已取消删除");
    });
};

const handleSearch = () => {
  fetchData();
};

const handleSizeChange = (val: number) => {
  pageSize.value = val;
  fetchData();
};

const handleCurrentChange = (val: number) => {
  currentPage.value = val;
  fetchData();
};

const toggleFullscreen = () => {
  fullscreen.value = !fullscreen.value;
};

const previewArticle = () => {
  if (!articleForm.title || !articleForm.content) {
    ElMessage.warning("请填写标题和内容后再预览");
    return;
  }

  // 跳转到预览页面
  router.push({
    path: "/admin/articles/preview",
    query: {
      article: encodeURIComponent(JSON.stringify({ ...articleForm })),
    },
  });
};

const submitForm = () => {
  if (!articleFormRef.value) return;

  articleFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        // 查找选中分类的ID
        const selectedCategory = categories.value.find(
          (cat) => cat.name === articleForm.category
        );
        const categoryId = selectedCategory ? selectedCategory.id : 1;

        if (isEdit.value) {
          // 编辑文章
          await updateArticle(articleForm.id, {
            title: articleForm.title,
            content: articleForm.content,
            excerpt: articleForm.excerpt,
            category_id: categoryId,
            author_id: 1, // 默认作者ID
          });
          ElMessage.success("更新成功");
        } else {
          // 新建文章
          await createArticle({
            title: articleForm.title,
            content: articleForm.content,
            excerpt: articleForm.excerpt,
            category_id: categoryId,
            author_id: 1, // 默认作者ID
          });
          ElMessage.success("创建成功");
        }
        dialogVisible.value = false;
        fetchData(); // 重新获取数据
      } catch (error) {
        ElMessage.error(isEdit.value ? "更新失败" : "创建失败");
      }
    }
  });
};

const resetForm = () => {
  Object.assign(articleForm, {
    id: 0,
    title: "",
    excerpt: "",
    content: "",
    category: "",
    tags: [],
    author: "管理员",
    date: "",
    status: "draft",
  });
};

const fetchCategories = async () => {
  try {
    const data = await getCategories();
    categories.value = data;
  } catch (error) {
    ElMessage.error("获取分类列表失败");
  }
};

const fetchData = async () => {
  loading.value = true;
  try {
    const data = await getArticles();
    articles.value = data.articles.map((item: any) => ({
      id: item.id,
      title: item.title,
      excerpt: item.excerpt || item.content.substring(0, 100) + "...",
      content: item.content,
      category: item.category || "未分类",
      tags: [], // 简化处理，实际应该从关联表获取
      author: item.author || "未知作者",
      date: new Date(item.created_at).toLocaleDateString(),
      status: "published", // 简化处理
    }));
    total.value = articles.value.length;
  } catch (error) {
    ElMessage.error("获取文章列表失败");
  } finally {
    loading.value = false;
  }
};

const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768;
};

onMounted(() => {
  fetchData();
  fetchCategories();
  checkMobile();
  window.addEventListener("resize", checkMobile);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", checkMobile);
});
</script>

<style scoped lang="scss">
.articles-management {
  background: var(--card-bg);
  border-radius: 8px;
  box-shadow: var(--card-shadow);
  padding: 20px;
  border: 1px solid var(--border-color);
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
}

.create-button {
  .button-text {
    margin-left: 5px;
  }
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.search-input {
  width: 200px;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  flex-wrap: wrap;
}

// 为Markdown编辑器添加一些样式
:deep(.v-md-editor) {
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: var(--card-bg);

  .v-md-editor__editor-wrapper,
  .v-md-editor__preview-wrapper {
    height: 400px;
  }
}

@media (max-width: 768px) {
  .articles-management {
    padding: 15px;
  }

  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .toolbar-right {
    width: 100%;
    justify-content: space-between;
  }

  .search-input {
    flex: 1;
    width: auto;
  }

  .pagination {
    justify-content: center;
  }

  :deep(.hidden-column) {
    display: none;
  }

  .dialog-footer {
    flex-direction: column;

    :deep(.el-button) {
      width: 100%;
    }
  }

  :deep(.v-md-editor) {
    .v-md-editor__editor-wrapper,
    .v-md-editor__preview-wrapper {
      height: 300px;
    }
  }
}

@media (max-width: 480px) {
  .search-input {
    width: 100%;
  }

  .search-button {
    flex-shrink: 0;
  }
}
</style>
