<template>
  <div class="register-page">
    <div class="register-container">
      <div class="register-box">
        <div class="register-header">
          <h2>博客管理系统</h2>
          <p>创建新账户</p>
        </div>
        <el-form
          ref="registerFormRef"
          :model="registerForm"
          :rules="registerRules"
          class="register-form"
          @submit.prevent="handleRegister"
        >
          <el-form-item prop="username">
            <el-input
              v-model="registerForm.username"
              placeholder="请输入用户名"
              prefix-icon="el-icon-user"
              size="large"
            />
          </el-form-item>
          <el-form-item prop="email">
            <el-input
              v-model="registerForm.email"
              placeholder="请输入邮箱"
              prefix-icon="el-icon-message"
              size="large"
            />
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model="registerForm.password"
              type="password"
              placeholder="请输入密码"
              prefix-icon="el-icon-lock"
              size="large"
              show-password
            />
          </el-form-item>
          <el-form-item prop="confirmPassword">
            <el-input
              v-model="registerForm.confirmPassword"
              type="password"
              placeholder="请确认密码"
              prefix-icon="el-icon-lock"
              size="large"
              show-password
            />
          </el-form-item>
          <el-form-item prop="role">
            <el-select
              v-model="registerForm.role"
              placeholder="请选择角色"
              size="large"
              style="width: 100%"
            >
              <el-option label="管理员" value="admin" />
              <el-option label="编辑者" value="editor" />
              <el-option label="作者" value="author" />
              <el-option label="订阅者" value="subscriber" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-checkbox v-model="agreeTerms">
              我已阅读并同意
              <el-link type="primary" @click="showTerms">用户协议</el-link> 和
              <el-link type="primary" @click="showPrivacy">隐私政策</el-link>
            </el-checkbox>
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              size="large"
              class="register-button"
              :loading="loading"
              @click="handleRegister"
              :disabled="!agreeTerms"
            >
              注册
            </el-button>
          </el-form-item>
        </el-form>
        <div class="login-link">
          已有账户？<el-link type="primary" @click="goToLogin"
            >立即登录</el-link
          >
        </div>
      </div>
    </div>

    <!-- 用户协议对话框 -->
    <el-dialog v-model="termsVisible" title="用户协议" width="600px">
      <div class="terms-content">
        <h3>1. 服务条款</h3>
        <p>
          欢迎您注册并使用我们的博客管理系统。在使用本服务前，请您仔细阅读以下条款。
        </p>

        <h3>2. 账户安全</h3>
        <p>您需要为您的账户提供准确的信息，并及时更新您的个人信息。</p>

        <h3>3. 使用规范</h3>
        <p>您同意不使用本服务发布任何违法、有害或侵犯他人权益的内容。</p>

        <h3>4. 知识产权</h3>
        <p>本系统的所有知识产权归系统所有者所有。</p>

        <h3>5. 免责声明</h3>
        <p>在法律允许的范围内，我们不对因使用本服务而导致的任何损失负责。</p>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="termsVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 隐私政策对话框 -->
    <el-dialog v-model="privacyVisible" title="隐私政策" width="600px">
      <div class="privacy-content">
        <h3>1. 信息收集</h3>
        <p>我们收集您在注册时提供的用户名、邮箱等信息。</p>

        <h3>2. 信息使用</h3>
        <p>我们仅将您的信息用于提供服务和改善用户体验。</p>

        <h3>3. 信息保护</h3>
        <p>我们采取合理的安全措施保护您的个人信息。</p>

        <h3>4. 信息共享</h3>
        <p>我们不会将您的个人信息分享给第三方，除非获得您的同意或法律要求。</p>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="privacyVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import {
  ElForm,
  ElFormItem,
  ElInput,
  ElButton,
  ElSelect,
  ElOption,
  ElCheckbox,
  ElLink,
  ElMessage,
  ElDialog,
} from "element-plus";
import { register } from "../../api/auth";

interface RegisterForm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
}

const router = useRouter();
const registerFormRef = ref();
const loading = ref(false);
const agreeTerms = ref(false);
const termsVisible = ref(false);
const privacyVisible = ref(false);

const registerForm = reactive<RegisterForm>({
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
  role: "author",
});

const registerRules = {
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
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 6, message: "密码长度至少6位", trigger: "blur" },
  ],
  confirmPassword: [
    { required: true, message: "请确认密码", trigger: "blur" },
    {
      validator: (rule: any, value: string, callback: any) => {
        if (value !== registerForm.password) {
          callback(new Error("两次输入的密码不一致"));
        } else {
          callback();
        }
      },
      trigger: "blur",
    },
  ],
  role: [{ required: true, message: "请选择角色", trigger: "change" }],
};

const handleRegister = async () => {
  if (!registerFormRef.value) return;

  await registerFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      if (!agreeTerms.value) {
        ElMessage.warning("请先同意用户协议和隐私政策");
        return;
      }

      loading.value = true;
      try {
        // 调用注册API
        await register({
          username: registerForm.username,
          email: registerForm.email,
          password: registerForm.password,
          role: registerForm.role,
        });

        // 注册成功
        ElMessage.success("注册成功");
        router.push("/login");
      } catch (error: any) {
        ElMessage.error(error.response?.data?.error || "注册失败");
      } finally {
        loading.value = false;
      }
    }
  });
};

const showTerms = () => {
  termsVisible.value = true;
};

const showPrivacy = () => {
  privacyVisible.value = true;
};

const goToLogin = () => {
  router.push("/login");
};
</script>

<style scoped lang="scss">
.register-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.register-container {
  width: 100%;
  max-width: 400px;
}

.register-box {
  background: white;
  border-radius: 10px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
  padding: 40px 30px;
}

.register-header {
  text-align: center;
  margin-bottom: 30px;

  h2 {
    margin: 0 0 10px 0;
    color: #333;
    font-size: 1.8rem;
  }

  p {
    margin: 0;
    color: #666;
  }
}

.register-form {
  :deep(.el-form-item) {
    margin-bottom: 20px;
  }

  :deep(.el-input__inner) {
    padding: 15px;
    border-radius: 5px;
  }

  :deep(.el-select) {
    width: 100%;
  }
}

.register-button {
  width: 100%;
  padding: 15px;
  font-size: 1.1rem;
  border-radius: 5px;
  margin-top: 10px;
}

.login-link {
  text-align: center;
  margin-top: 20px;
  color: #666;
}

.terms-content,
.privacy-content {
  h3 {
    margin: 20px 0 10px 0;
    color: #333;
  }

  p {
    color: #666;
    line-height: 1.6;
    margin: 0 0 10px 0;
  }
}
</style>