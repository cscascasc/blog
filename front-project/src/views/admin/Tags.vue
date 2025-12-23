<template>
  <div class="tags-management">
    <div class="toolbar">
      <el-button type="primary" @click="handleCreate">
        <i class="el-icon-plus"></i>
        新建标签
      </el-button>
    </div>

    <el-table :data="tags" style="width: 100%" v-loading="loading" stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="标签名称" />
      <el-table-column prop="articleCount" label="文章数" width="120" />
      <el-table-column prop="createdAt" label="创建时间" width="180" />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="scope">
          <el-button size="small" @click="handleEdit(scope.row)"
            >编辑</el-button
          >
          <el-button size="small" type="danger" @click="handleDelete(scope.row)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <!-- 标签编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form
        ref="tagFormRef"
        :model="tagForm"
        :rules="tagRules"
        label-width="100px"
      >
        <el-form-item label="标签名称" prop="name">
          <el-input v-model="tagForm.name" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";

interface Tag {
  id: number;
  name: string;
  articleCount: number;
  createdAt: string;
}

const loading = ref(false);
const dialogVisible = ref(false);
const dialogTitle = ref("新建标签");
const isEdit = ref(false);
const tagFormRef = ref();

const tags = ref<Tag[]>([
  { id: 1, name: "Vue", articleCount: 8, createdAt: "2025-01-01" },
  { id: 2, name: "React", articleCount: 5, createdAt: "2025-01-02" },
  { id: 3, name: "JavaScript", articleCount: 12, createdAt: "2025-01-03" },
  { id: 4, name: "CSS", articleCount: 6, createdAt: "2025-01-04" },
  { id: 5, name: "TypeScript", articleCount: 4, createdAt: "2025-01-05" },
]);

const tagForm = reactive({
  id: 0,
  name: "",
});

const tagRules = {
  name: [{ required: true, message: "请输入标签名称", trigger: "blur" }],
};

const handleCreate = () => {
  dialogTitle.value = "新建标签";
  isEdit.value = false;
  resetForm();
  dialogVisible.value = true;
};

const handleEdit = (row: Tag) => {
  dialogTitle.value = "编辑标签";
  isEdit.value = true;
  Object.assign(tagForm, {
    id: row.id,
    name: row.name,
  });
  dialogVisible.value = true;
};

const handleDelete = (row: Tag) => {
  ElMessageBox.confirm(`确定要删除标签"${row.name}"吗？`, "确认删除", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      const index = tags.value.findIndex((item: Tag) => item.id === row.id);
      if (index > -1) {
        tags.value.splice(index, 1);
        ElMessage.success("删除成功");
      }
    })
    .catch(() => {
      ElMessage.info("已取消删除");
    });
};

const submitForm = () => {
  if (!tagFormRef.value) return;

  tagFormRef.value.validate((valid: boolean) => {
    if (valid) {
      if (isEdit.value) {
        const index = tags.value.findIndex(
          (item: Tag) => item.id === tagForm.id
        );
        if (index > -1) {
          tags.value[index].name = tagForm.name;
          ElMessage.success("更新成功");
        }
      } else {
        const newTag = {
          id: Date.now(),
          name: tagForm.name,
          articleCount: 0,
          createdAt: new Date().toISOString().split("T")[0],
        };
        tags.value.push(newTag);
        ElMessage.success("创建成功");
      }
      dialogVisible.value = false;
    }
  });
};

const resetForm = () => {
  Object.assign(tagForm, {
    id: 0,
    name: "",
  });
};

const fetchData = () => {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
  }, 500);
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped lang="scss">
.tags-management {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
</style>