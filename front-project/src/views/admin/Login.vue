<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-box">
        <div class="login-header">
          <h2>博客管理系统</h2>
          <p>请登录您的账户</p>
        </div>
        <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="loginRules"
          class="login-form"
          @submit.prevent="handleLogin"
        >
          <el-form-item prop="username">
            <el-input
              v-model="loginForm.username"
              placeholder="请输入用户名"
              size="large"
              @input="onUsernameInput"
            >
              <template #prefix>
                <el-icon><User /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              size="large"
              show-password
            >
              <template #prefix>
                <el-icon><Lock /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item>
            <el-checkbox v-model="rememberMe">记住我</el-checkbox>
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              size="large"
              class="login-button"
              :loading="loading"
              @click="handleLogin"
            >
              <el-icon v-if="!loading"><Unlock /></el-icon>
              登录
            </el-button>
          </el-form-item>
        </el-form>
        <div class="register-link">
          还没有账户？<el-link type="primary" @click="goToRegister"
            >立即注册</el-link
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import {
  ElForm,
  ElFormItem,
  ElInput,
  ElButton,
  ElCheckbox,
  ElMessage,
  ElLink,
  ElIcon,
} from "element-plus";
import { User, Lock, Unlock } from "@element-plus/icons-vue";
import { useUserStore } from "../../stores/userStore";

interface LoginForm {
  username: string;
  password: string;
}

const router = useRouter();
const userStore = useUserStore();
const loginFormRef = ref();
const loading = ref(false);
const rememberMe = ref(false);

const loginForm = reactive<LoginForm>({
  username: "",
  password: "",
});

const loginRules = {
  username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 6, message: "密码长度至少6位", trigger: "blur" },
  ],
};

// 加密函数
const encryptData = (text: string, key: string): string => {
  // 简单的异或加密 + base64编码
  let result = "";
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(
      text.charCodeAt(i) ^ key.charCodeAt(i % key.length)
    );
  }
  return btoa(result);
};

// 解密函数
const decryptData = (text: string, key: string): string => {
  try {
    const decoded = atob(text);
    let result = "";
    for (let i = 0; i < decoded.length; i++) {
      result += String.fromCharCode(
        decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      );
    }
    return result;
  } catch (e) {
    return "";
  }
};

// 生成加密密钥（基于浏览器指纹等信息）
const getEncryptionKey = (): string => {
  // 在实际应用中，可以结合更多信息生成密钥
  // 如：navigator.userAgent, screen dimensions 等
  return "blog_remember_me_key_" + window.location.origin;
};

// 页面加载时检查是否有记住的登录信息
onMounted(async () => {
  // 检查URL参数，如果用户是主动退出登录，则不自动登录
  const urlParams = new URLSearchParams(window.location.search);
  const logout = urlParams.get("logout");

  if (logout !== "true") {
    // 检查是否有保存的记住我令牌
    const savedRefreshToken = localStorage.getItem("refreshToken");
    if (savedRefreshToken) {
      try {
        // 尝试使用记住我令牌自动登录
        const response = await userStore.refreshLogin(savedRefreshToken);
        ElMessage.success("自动登录成功");

        // 根据用户角色决定跳转位置
        if (response.user.role === "subscriber") {
          // 订阅者跳转到博客首页
          router.push("/blog");
        } else {
          // 其他角色跳转到管理系统
          router.push("/admin");
        }
      } catch (error: any) {
        // 自动登录失败，清除令牌
        localStorage.removeItem("refreshToken");
        console.error("自动登录失败:", error);
      }
    } else {
      // 检查是否有为当前用户名保存的密码
      const savedUsername = localStorage.getItem("savedUsername");
      if (savedUsername) {
        loginForm.username = savedUsername;
        // 检查是否为该用户名保存了密码
        const savedPasswords = JSON.parse(
          localStorage.getItem("savedPasswords") || "{}"
        );
        const encryptedPassword = savedPasswords[savedUsername];
        if (encryptedPassword) {
          try {
            const key = getEncryptionKey();
            const decryptedPassword = decryptData(encryptedPassword, key);
            loginForm.password = decryptedPassword || "";
            rememberMe.value = true;
          } catch (e) {
            console.error("解密密码失败:", e);
          }
        }
      }
    }
  } else {
    // 用户是主动退出登录，清除自动登录令牌
    localStorage.removeItem("refreshToken");
  }
});

// 当用户名输入框有变化时
const onUsernameInput = () => {
  // 用户手动输入用户名时，检查是否为该用户名保存了密码
  const savedPasswords = JSON.parse(
    localStorage.getItem("savedPasswords") || "{}"
  );
  const encryptedPassword = savedPasswords[loginForm.username];
  if (encryptedPassword) {
    try {
      const key = getEncryptionKey();
      const decryptedPassword = decryptData(encryptedPassword, key);
      loginForm.password = decryptedPassword || "";
      rememberMe.value = true;
    } catch (e) {
      console.error("解密密码失败:", e);
    }
  } else {
    // 如果没有为该用户名保存密码，则清空密码字段
    loginForm.password = "";
    rememberMe.value = false;
  }
};

const handleLogin = async () => {
  if (!loginFormRef.value) return;

  await loginFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      loading.value = true;
      try {
        // 调用登录API
        const response = await userStore.login({
          username: loginForm.username,
          password: loginForm.password,
          rememberMe: rememberMe.value,
        });

        // 如果选择了"记住我"
        if (rememberMe.value) {
          // 保存记住我令牌（如果有的话）
          if (response.refreshToken) {
            localStorage.setItem("refreshToken", response.refreshToken);
          }

          // 保存用户名
          localStorage.setItem("savedUsername", loginForm.username);

          // 保存该用户名对应的加密密码
          try {
            const key = getEncryptionKey();
            const encryptedPassword = encryptData(loginForm.password, key);

            // 获取现有的保存密码对象或创建新的
            const savedPasswords = JSON.parse(
              localStorage.getItem("savedPasswords") || "{}"
            );
            savedPasswords[loginForm.username] = encryptedPassword;
            localStorage.setItem(
              "savedPasswords",
              JSON.stringify(savedPasswords)
            );
          } catch (e) {
            console.error("加密密码失败:", e);
          }
        } else {
          // 如果未选择"记住我"，则清除该用户的保存信息
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("savedUsername");

          // 清除该用户的保存密码
          const savedPasswords = JSON.parse(
            localStorage.getItem("savedPasswords") || "{}"
          );
          delete savedPasswords[loginForm.username];
          if (Object.keys(savedPasswords).length > 0) {
            localStorage.setItem(
              "savedPasswords",
              JSON.stringify(savedPasswords)
            );
          } else {
            localStorage.removeItem("savedPasswords");
          }
        }

        ElMessage.success("登录成功");

        // 根据用户角色决定跳转位置
        if (response.user.role === "subscriber") {
          // 订阅者跳转到博客首页
          router.push("/blog");
        } else {
          // 其他角色跳转到管理系统
          router.push("/admin");
        }
      } catch (error: any) {
        ElMessage.error(error.response?.data?.error || "登录失败");
      } finally {
        loading.value = false;
      }
    }
  });
};

const goToRegister = () => {
  router.push("/register");
};
</script>

<style scoped lang="scss">
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-container {
  width: 100%;
  max-width: 400px;
}

.login-box {
  background: white;
  border-radius: 10px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
  padding: 40px 30px;
}

.login-header {
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

.login-form {
  :deep(.el-form-item) {
    margin-bottom: 25px;
  }

  :deep(.el-input__inner) {
    padding: 15px;
    border-radius: 5px;
  }
}

.login-button {
  width: 100%;
  padding: 15px;
  font-size: 1.1rem;
  border-radius: 5px;
  margin-top: 10px;
}

.register-link {
  text-align: center;
  margin-top: 20px;
  color: #666;
}
</style>