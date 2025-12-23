<template>
  <div class="friends-management">
    <div class="toolbar">
      <el-button type="primary" @click="handleCreate">
        <i class="el-icon-plus"></i>
        添加友链
      </el-button>
    </div>

    <el-table :data="friends" style="width: 100%" v-loading="loading" stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="网站名称" />
      <el-table-column prop="url" label="链接地址" />
      <el-table-column prop="description" label="描述" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status === 'active' ? 'success' : 'info'">
            {{ scope.row.status === "active" ? "启用" : "禁用" }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="创建时间" width="180" />
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

    <!-- 友链编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form
        ref="friendFormRef"
        :model="friendForm"
        :rules="friendRules"
        label-width="100px"
      >
        <el-form-item label="网站名称" prop="name">
          <el-input v-model="friendForm.name" />
        </el-form-item>
        <el-form-item label="链接地址" prop="url">
          <el-input v-model="friendForm.url" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="friendForm.description" type="textarea" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="friendForm.status">
            <el-radio label="active">启用</el-radio>
            <el-radio label="inactive">禁用</el-radio>
          </el-radio-group>
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
import {
  getFriends,
  createFriend,
  updateFriend,
  deleteFriend,
} from "@/api/friend";

interface Friend {
  id: number;
  name: string;
  url: string;
  description: string;
  status: string;
  created_at: string;
}

const loading = ref(false);
const dialogVisible = ref(false);
const dialogTitle = ref("添加友链");
const isEdit = ref(false);
const friendFormRef = ref();

const friends = ref<Friend[]>([]);

const friendForm = reactive({
  id: 0,
  name: "",
  url: "",
  description: "",
  status: "active",
});

const friendRules = {
  name: [{ required: true, message: "请输入网站名称", trigger: "blur" }],
  url: [
    { required: true, message: "请输入链接地址", trigger: "blur" },
    { type: "url", message: "请输入正确的URL地址", trigger: "blur" },
  ],
};

// 获取友链列表
const fetchData = async () => {
  loading.value = true;
  try {
    const data = await getFriends();
    friends.value = data;
  } catch (error) {
    ElMessage.error("获取友链列表失败");
  } finally {
    loading.value = false;
  }
};

const handleCreate = () => {
  dialogTitle.value = "添加友链";
  isEdit.value = false;
  resetForm();
  dialogVisible.value = true;
};

const handleEdit = (row: Friend) => {
  dialogTitle.value = "编辑友链";
  isEdit.value = true;
  Object.assign(friendForm, row);
  dialogVisible.value = true;
};

const handleDelete = (row: Friend) => {
  ElMessageBox.confirm(`确定要删除友链"${row.name}"吗？`, "确认删除", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      try {
        await deleteFriend(row.id);
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

const submitForm = () => {
  if (!friendFormRef.value) return;

  friendFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        if (isEdit.value) {
          await updateFriend(friendForm.id, {
            name: friendForm.name,
            url: friendForm.url,
            description: friendForm.description,
            status: friendForm.status,
          });
          ElMessage.success("更新成功");
        } else {
          await createFriend({
            name: friendForm.name,
            url: friendForm.url,
            description: friendForm.description,
            status: friendForm.status,
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
  Object.assign(friendForm, {
    id: 0,
    name: "",
    url: "",
    description: "",
    status: "active",
  });
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped lang="scss">
.friends-management {
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