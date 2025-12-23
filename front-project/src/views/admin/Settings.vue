<template>
  <div class="settings-management">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="基本设置" name="basic">
        <el-form
          :model="basicSettings"
          label-width="120px"
          class="settings-form"
        >
          <el-form-item label="网站标题">
            <el-input v-model="basicSettings.siteTitle" />
          </el-form-item>
          <el-form-item label="网站描述">
            <el-input v-model="basicSettings.siteDescription" type="textarea" />
          </el-form-item>
          <el-form-item label="网站关键词">
            <el-input v-model="basicSettings.siteKeywords" />
          </el-form-item>
          <el-form-item label="备案号">
            <el-input v-model="basicSettings.beianNumber" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="saveBasicSettings"
              >保存设置</el-button
            >
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="SEO设置" name="seo">
        <el-form :model="seoSettings" label-width="120px" class="settings-form">
          <el-form-item label="首页标题">
            <el-input v-model="seoSettings.homeTitle" />
          </el-form-item>
          <el-form-item label="首页描述">
            <el-input v-model="seoSettings.homeDescription" type="textarea" />
          </el-form-item>
          <el-form-item label="文章页标题模板">
            <el-input v-model="seoSettings.articleTitleTemplate" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="saveSeoSettings"
              >保存设置</el-button
            >
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="用户设置" name="user">
        <el-form
          :model="userSettings"
          label-width="120px"
          class="settings-form"
        >
          <el-form-item label="用户名">
            <el-input v-model="userSettings.username" />
          </el-form-item>
          <el-form-item label="邮箱">
            <el-input v-model="userSettings.email" />
          </el-form-item>
          <el-form-item label="新密码">
            <el-input
              v-model="userSettings.newPassword"
              type="password"
              show-password
            />
          </el-form-item>
          <el-form-item label="确认密码">
            <el-input
              v-model="userSettings.confirmPassword"
              type="password"
              show-password
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="saveUserSettings"
              >保存设置</el-button
            >
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { ElMessage } from "element-plus";

const activeTab = ref("basic");

const basicSettings = reactive({
  siteTitle: "我的个人博客",
  siteDescription: "这是一个使用Vue 3构建的个人博客系统",
  siteKeywords: "博客,Vue 3,前端开发",
  beianNumber: "",
});

const seoSettings = reactive({
  homeTitle: "我的个人博客 - 分享技术与生活",
  homeDescription: "分享前端技术、编程经验和生活随笔的个人博客",
  articleTitleTemplate: "{title} - {siteName}",
});

const userSettings = reactive({
  username: "admin",
  email: "admin@example.com",
  newPassword: "",
  confirmPassword: "",
});

const saveBasicSettings = () => {
  ElMessage.success("基本设置已保存");
  console.log("保存基本设置:", basicSettings);
};

const saveSeoSettings = () => {
  ElMessage.success("SEO设置已保存");
  console.log("保存SEO设置:", seoSettings);
};

const saveUserSettings = () => {
  if (
    userSettings.newPassword &&
    userSettings.newPassword !== userSettings.confirmPassword
  ) {
    ElMessage.error("两次输入的密码不一致");
    return;
  }

  ElMessage.success("用户设置已保存");
  console.log("保存用户设置:", userSettings);

  // 重置密码字段
  userSettings.newPassword = "";
  userSettings.confirmPassword = "";
};
</script>

<style scoped lang="scss">
.settings-management {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.settings-form {
  max-width: 600px;
  margin: 20px 0;

  :deep(.el-form-item) {
    margin-bottom: 25px;
  }
}
</style>