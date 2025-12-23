<template>
  <div class="users-management">
    <div class="toolbar">
      <el-button type="primary" @click="handleCreate" v-if="canManageUsers">
        <i class="el-icon-plus"></i>
        添加用户
      </el-button>
    </div>

    <el-table :data="users" style="width: 100%" v-loading="loading" stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="username" label="用户名" />
      <el-table-column prop="email" label="邮箱" />
      <el-table-column prop="role" label="角色">
        <template #default="scope">
          <el-tag :type="getRoleTagType(scope.row.role)">
            {{ getRoleDisplayName(scope.row.role) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status === 'active' ? 'success' : 'info'">
            {{ scope.row.status === "active" ? "启用" : "禁用" }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" width="180" />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="scope">
          <el-button
            size="small"
            @click="handleEdit(scope.row)"
            v-if="canManageUsers"
            >编辑</el-button
          >
          <el-button
            size="small"
            type="danger"
            @click="handleDelete(scope.row)"
            v-if="canManageUsers && scope.row.username !== 'admin'"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <!-- 用户编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form
        ref="userFormRef"
        :model="userForm"
        :rules="userRules"
        label-width="100px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userForm.username" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userForm.email" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="userForm.role" style="width: 100%">
            <el-option
              v-for="role in availableRoles"
              :key="role.value"
              :label="role.label"
              :value="role.value"
              :disabled="!canAssignRole(role.value)"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="userForm.status">
            <el-radio label="active">启用</el-radio>
            <el-radio label="inactive">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="!isEdit" label="密码" prop="password">
          <el-input v-model="userForm.password" type="password" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm" v-if="canManageUsers"
            >保存</el-button
          >
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from "vue";
import { storeToRefs } from "pinia";
import { ElMessage, ElMessageBox } from "element-plus";
import { hasPermission, roleDisplayNames } from "../../utils/permissions";
import { getUsers, createUser, updateUser, deleteUser } from "../../api/user";
import { useUserStore } from "@/stores/userStore";

interface User {
  id: number;
  username: string;
  email: string;
  role: "admin" | "editor" | "author" | "subscriber";
  status: "active" | "inactive";
  created_at: string;
}

const userStore = useUserStore();
const { userRole } = storeToRefs(userStore);

// 检查当前用户权限
const canManageUsers = computed(() =>
  hasPermission(userRole.value, "manage_users")
);

const loading = ref(false);
const dialogVisible = ref(false);
const dialogTitle = ref("添加用户");
const isEdit = ref(false);
const userFormRef = ref();

const users = ref<User[]>([]);

const userForm = reactive({
  id: 0,
  username: "",
  email: "",
  role: "author",
  status: "active",
  password: "",
});

// 可用角色选项
const availableRoles = computed(() => {
  return Object.entries(roleDisplayNames).map(([value, label]) => ({
    value,
    label,
  }));
});

const userRules = {
  username: [
    { required: true, message: "请输入用户名", trigger: "blur" },
    {
      min: 3,
      max: 20,
      message: "用户名长度应在3-20个字符之间",
      trigger: "blur",
    },
  ],
  email: [
    { required: true, message: "请输入邮箱", trigger: "blur" },
    { type: "email", message: "请输入正确的邮箱地址", trigger: "blur" },
  ],
  role: [{ required: true, message: "请选择角色", trigger: "change" }],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 6, message: "密码长度至少6位", trigger: "blur" },
  ],
};

const handleCreate = () => {
  if (!canManageUsers.value) {
    ElMessage.warning("您没有权限执行此操作");
    return;
  }

  dialogTitle.value = "添加用户";
  isEdit.value = false;
  resetForm();
  dialogVisible.value = true;
};

const handleEdit = (row: User) => {
  if (!canManageUsers.value) {
    ElMessage.warning("您没有权限执行此操作");
    return;
  }

  dialogTitle.value = "编辑用户";
  isEdit.value = true;
  Object.assign(userForm, {
    id: row.id,
    username: row.username,
    email: row.email,
    role: row.role,
    status: row.status,
    password: "", // 编辑时不显示密码
  });
  dialogVisible.value = true;
};

const handleDelete = (row: User) => {
  if (!canManageUsers.value) {
    ElMessage.warning("您没有权限执行此操作");
    return;
  }

  // 禁止删除当前登录用户
  if (row.username === "admin") {
    ElMessage.warning("不能删除管理员账户");
    return;
  }

  ElMessageBox.confirm(`确定要删除用户"${row.username}"吗？`, "确认删除", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      try {
        await deleteUser(row.id);
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

const submitForm = async () => {
  if (!canManageUsers.value) {
    ElMessage.warning("您没有权限执行此操作");
    return;
  }

  if (!userFormRef.value) return;

  userFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        if (isEdit.value) {
          // 更新用户
          await updateUser(userForm.id, {
            username: userForm.username,
            email: userForm.email,
            role: userForm.role,
            status: userForm.status,
          });
          ElMessage.success("更新成功");
        } else {
          // 创建用户
          await createUser({
            username: userForm.username,
            email: userForm.email,
            password: userForm.password,
            role: userForm.role,
            status: userForm.status,
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
  Object.assign(userForm, {
    id: 0,
    username: "",
    email: "",
    role: "author",
    status: "active",
    password: "",
  });
};

const getRoleDisplayName = (
  role: "admin" | "editor" | "author" | "subscriber"
) => {
  return roleDisplayNames[role] || role;
};

const getRoleTagType = (role: "admin" | "editor" | "author" | "subscriber") => {
  const typeMap: Record<string, string> = {
    admin: "danger",
    editor: "warning",
    author: "success",
    subscriber: "info",
  };
  return typeMap[role] || "info";
};

// 检查是否可以分配某个角色
const canAssignRole = (role: "admin" | "editor" | "author" | "subscriber") => {
  // 简单实现：管理员可以分配任何角色
  return userRole.value === "admin";
};

const fetchData = async () => {
  loading.value = true;
  try {
    const data = await getUsers();
    users.value = data.map((item: any) => ({
      ...item,
      created_at: new Date(item.created_at).toLocaleDateString(),
    }));
  } catch (error) {
    ElMessage.error("获取用户列表失败");
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped lang="scss">
.users-management {
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