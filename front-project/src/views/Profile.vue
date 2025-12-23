<template>
  <div class="profile-page">
    <div class="profile-header">
      <div class="header-actions">
        <el-button @click="goToBlog" type="primary" size="small">
          <el-icon><Postcard /></el-icon>
          返回博客
        </el-button>
      </div>

      <div class="avatar-container">
        <img
          src="https://via.placeholder.com/150"
          alt="个人头像"
          class="avatar"
        />
      </div>

      <!-- 姓名编辑 -->
      <div class="profile-name-container">
        <h1 class="profile-name" v-if="!isEditing">
          {{ userProfile.name || "未设置姓名" }}
        </h1>
        <el-input
          v-else
          v-model="userProfile.name"
          placeholder="请输入姓名"
          class="profile-name-input"
          size="large"
          clearable
        />
      </div>

      <!-- 职位编辑 -->
      <div class="profile-title-container">
        <p class="profile-title" v-if="!isEditing">
          {{ userProfile.title || "未设置职位" }}
        </p>
        <el-input
          v-else
          v-model="userProfile.title"
          placeholder="请输入职位"
          class="profile-title-input"
          size="small"
          clearable
        />
      </div>

      <div class="profile-actions">
        <el-button type="primary" @click="editProfile" v-if="!isEditing">
          <el-icon><Edit /></el-icon>
          编辑资料
        </el-button>
        <el-button type="success" @click="saveProfile" v-else>
          <el-icon><Check /></el-icon>
          保存资料
        </el-button>
        <el-button @click="cancelEdit" v-if="isEditing">
          <el-icon><Close /></el-icon>
          取消
        </el-button>
        <el-button @click="viewResume">
          <el-icon><Document /></el-icon>
          查看简历
        </el-button>
      </div>
    </div>

    <div class="profile-content">
      <div class="profile-section">
        <h2>个人简介</h2>
        <div v-if="!isEditing" class="profile-bio">
          {{ userProfile.bio || "暂无个人简介" }}
        </div>
        <el-input
          v-else
          v-model="userProfile.bio"
          type="textarea"
          :rows="4"
          placeholder="请输入个人简介"
        />
      </div>

      <div class="profile-section">
        <h2>技能</h2>
        <div v-if="!isEditing" class="skills-container">
          <el-tag
            v-for="skill in userProfile.skills"
            :key="skill"
            class="skill-tag"
          >
            {{ skill }}
          </el-tag>
          <div v-if="userProfile.skills.length === 0" class="empty-placeholder">
            暂无技能信息
          </div>
        </div>
        <div v-else class="skills-edit">
          <el-select
            v-model="selectedSkills"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="请选择或添加技能"
            style="width: 100%"
          >
            <el-option
              v-for="skill in allSkills"
              :key="skill"
              :label="skill"
              :value="skill"
            />
          </el-select>
          <div class="skills-container" style="margin-top: 15px">
            <el-tag
              v-for="skill in selectedSkills"
              :key="skill"
              class="skill-tag"
              closable
              @close="removeSkill(skill)"
            >
              {{ skill }}
            </el-tag>
          </div>
        </div>
      </div>

      <div class="profile-section">
        <h2>项目经验</h2>
        <div class="projects-container">
          <div
            v-for="(project, index) in userProfile.projects"
            :key="index"
            class="project-card"
          >
            <div v-if="!isEditing">
              <h3>{{ project.name || "未命名项目" }}</h3>
              <p>{{ project.description || "暂无描述" }}</p>
              <div class="project-tags">
                <el-tag
                  v-for="tag in project.tags"
                  :key="tag"
                  class="project-tag"
                  type="info"
                >
                  {{ tag }}
                </el-tag>
              </div>
            </div>
            <div v-else class="project-edit">
              <el-form-item label="项目名称">
                <el-input v-model="project.name" placeholder="请输入项目名称" />
              </el-form-item>
              <el-form-item label="项目描述">
                <el-input
                  v-model="project.description"
                  type="textarea"
                  :rows="2"
                  placeholder="请输入项目描述"
                />
              </el-form-item>
              <el-form-item label="技术标签">
                <el-select
                  v-model="project.tags"
                  multiple
                  filterable
                  allow-create
                  default-first-option
                  placeholder="请选择或添加技术标签"
                  style="width: 100%"
                >
                  <el-option
                    v-for="tag in allTags"
                    :key="tag"
                    :label="tag"
                    :value="tag"
                  />
                </el-select>
              </el-form-item>
              <div class="project-actions">
                <el-button
                  type="danger"
                  size="small"
                  @click="removeProject(index)"
                >
                  删除项目
                </el-button>
              </div>
            </div>
          </div>
          <div v-if="isEditing" class="add-project">
            <el-button type="primary" @click="addProject">
              <el-icon><Plus /></el-icon>
              添加项目
            </el-button>
          </div>
          <div
            v-if="!isEditing && userProfile.projects.length === 0"
            class="empty-placeholder"
          >
            暂无项目经验
          </div>
        </div>
      </div>

      <div class="profile-section">
        <h2>联系方式</h2>
        <div class="contact-info">
          <div class="contact-item" v-if="!isEditing">
            <el-icon><Message /></el-icon>
            <span>{{ userProfile.email || "未设置邮箱" }}</span>
          </div>
          <div class="contact-item" v-else>
            <el-icon><Message /></el-icon>
            <el-input v-model="userProfile.email" placeholder="请输入邮箱" />
          </div>

          <div class="contact-item" v-if="!isEditing">
            <el-icon><Phone /></el-icon>
            <span>{{ userProfile.phone || "未设置电话" }}</span>
          </div>
          <div class="contact-item" v-else>
            <el-icon><Phone /></el-icon>
            <el-input v-model="userProfile.phone" placeholder="请输入电话" />
          </div>

          <div class="contact-item" v-if="!isEditing">
            <el-icon><Location /></el-icon>
            <span>{{ userProfile.location || "未设置地址" }}</span>
          </div>
          <div class="contact-item" v-else>
            <el-icon><Location /></el-icon>
            <el-input v-model="userProfile.location" placeholder="请输入地址" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
import {
  ElButton,
  ElMessage,
  ElTag,
  ElIcon,
  ElInput,
  ElSelect,
  ElOption,
  ElFormItem,
} from "element-plus";
import {
  Edit,
  Document,
  Message,
  Phone,
  Location,
  Postcard,
  Check,
  Close,
  Plus,
} from "@element-plus/icons-vue";
import { getProfile, updateProfile } from "../api/profile";

interface Project {
  name: string;
  description: string;
  tags: string[];
}

const router = useRouter();

const isEditing = ref(false);
const selectedSkills = ref<string[]>([]);
const originalProfile = ref<any>({});

// 用户资料数据
const userProfile = reactive({
  id: 0,
  username: "",
  email: "",
  name: "",
  title: "",
  bio: "",
  skills: [] as string[],
  projects: [] as Project[],
  phone: "",
  location: "",
});

// 所有技能选项（用于下拉框）
const allSkills = ref([
  "Vue.js",
  "React",
  "Angular",
  "TypeScript",
  "JavaScript",
  "HTML5",
  "CSS3",
  "Sass",
  "Less",
  "Node.js",
  "Webpack",
  "Vite",
  "Git",
  "Element Plus",
  "Ant Design",
  "Bootstrap",
  "MongoDB",
  "PostgreSQL",
  "MySQL",
  "Redis",
  "Docker",
  "AWS",
  "Azure",
]);

// 所有标签选项（用于项目标签）
const allTags = ref([
  "Vue 3",
  "React",
  "Angular",
  "TypeScript",
  "JavaScript",
  "HTML5",
  "CSS3",
  "Sass",
  "Less",
  "Node.js",
  "Webpack",
  "Vite",
  "Git",
  "Element Plus",
  "Ant Design",
  "Bootstrap",
  "MongoDB",
  "PostgreSQL",
  "MySQL",
  "Redis",
  "Docker",
  "AWS",
  "Azure",
]);

// 获取用户个人资料
const fetchProfile = async () => {
  try {
    const response = await getProfile();
    // 根据我们的规范，需要明确检查响应结构
    if (response) {
      Object.assign(userProfile, response);
      // 复制一份原始数据用于取消编辑时恢复
      originalProfile.value = JSON.parse(JSON.stringify(response));
    }
  } catch (error: any) {
    ElMessage.error(error.response?.data?.error || "获取个人资料失败");
    console.error("获取个人资料失败:", error);
  }
};

// 编辑资料
const editProfile = () => {
  isEditing.value = true;
  selectedSkills.value = [...userProfile.skills];
  // 保存当前状态用于取消时恢复
  originalProfile.value = JSON.parse(JSON.stringify(userProfile));
};

// 保存资料
const saveProfile = async () => {
  try {
    const profileData = {
      name: userProfile.name,
      title: userProfile.title,
      bio: userProfile.bio,
      skills: selectedSkills.value,
      projects: userProfile.projects,
      phone: userProfile.phone,
      location: userProfile.location,
    };

    const response = await updateProfile(profileData);
    // 根据我们的规范，需要明确检查响应结构
    if (response && response.message) {
      ElMessage.success(response.message);
    } else {
      ElMessage.success("资料保存成功");
    }

    // 更新本地数据
    userProfile.skills = [...selectedSkills.value];
    isEditing.value = false;
  } catch (error: any) {
    ElMessage.error(error.response?.data?.error || "保存资料失败");
    console.error("保存资料失败:", error);
  }
};

// 取消编辑
const cancelEdit = () => {
  isEditing.value = false;
  selectedSkills.value = [];
  // 恢复到编辑前的状态
  Object.assign(userProfile, originalProfile.value);
  ElMessage.info("已取消编辑");
};

// 添加技能
const removeSkill = (skill: string) => {
  const index = selectedSkills.value.indexOf(skill);
  if (index > -1) {
    selectedSkills.value.splice(index, 1);
  }
};

// 添加项目
const addProject = () => {
  userProfile.projects.push({
    name: "",
    description: "",
    tags: [],
  });
};

// 删除项目
const removeProject = (index: number) => {
  userProfile.projects.splice(index, 1);
  ElMessage.success("项目已删除");
};

// 查看简历
const viewResume = () => {
  ElMessage.info("查看简历功能待实现");
};

// 返回博客
const goToBlog = () => {
  router.push("/blog");
};

onMounted(() => {
  fetchProfile();
});
</script>

<style scoped lang="scss">
.profile-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.profile-header {
  text-align: center;
  padding: 40px 20px;
  background: linear-gradient(120deg, #e0f7fa, #bbdefb);
  border-radius: 15px;
  margin-bottom: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  position: relative;
}

.header-actions {
  position: absolute;
  top: 20px;
  left: 20px;
}

.avatar-container {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.avatar {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  border: 5px solid #fff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.profile-name-container {
  margin: 15px 0 10px;
  position: relative;
}

.profile-name {
  font-size: 2.5rem;
  margin: 0;
  color: #2c3e50;
  font-weight: 700;
}

.profile-name-input {
  width: 300px;
  margin: 0 auto;
  :deep(.el-input__inner) {
    font-size: 2.5rem;
    font-weight: 700;
    text-align: center;
    padding: 10px 15px;
    border: 2px solid #3498db;
    border-radius: 8px;
    background-color: rgba(255, 255, 255, 0.9);
    transition: all 0.3s ease;
    color: #2c3e50;

    &:focus {
      border-color: #2980b9;
      box-shadow: 0 0 8px rgba(52, 152, 219, 0.5);
      background-color: #fff;
    }

    &::placeholder {
      color: #95a5a6;
    }
  }
}

.profile-title-container {
  margin-bottom: 25px;
  position: relative;
}

.profile-title {
  font-size: 1.3rem;
  color: #7f8c8d;
  margin: 0;
}

.profile-title-input {
  width: 300px;
  margin: 0 auto;
  :deep(.el-input__inner) {
    font-size: 1.3rem;
    text-align: center;
    padding: 8px 12px;
    border: 1px solid #bdc3c7;
    border-radius: 6px;
    background-color: rgba(255, 255, 255, 0.8);
    transition: all 0.3s ease;
    color: #7f8c8d;

    &:focus {
      border-color: #3498db;
      box-shadow: 0 0 6px rgba(52, 152, 219, 0.3);
      background-color: #fff;
    }

    &::placeholder {
      color: #95a5a6;
    }
  }
}

.profile-actions {
  .el-button {
    margin: 0 5px;
    border-radius: 20px;
    padding: 10px 20px;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
  }
}

.profile-content {
  .profile-section {
    margin-bottom: 40px;
    padding: 20px;
    background: #fff;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    }

    h2 {
      font-size: 1.8rem;
      color: #2c3e50;
      margin-top: 0;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid #3498db;
      display: flex;
      align-items: center;

      &::before {
        content: "";
        display: inline-block;
        width: 8px;
        height: 8px;
        background-color: #3498db;
        border-radius: 50%;
        margin-right: 10px;
      }
    }
  }
}

.profile-bio {
  font-size: 1.1rem;
  line-height: 1.8;
  color: #34495e;
}

.empty-placeholder {
  color: #95a5a6;
  font-style: italic;
  padding: 20px 0;
  text-align: center;
}

.skills-container {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;

  .skill-tag {
    font-size: 1rem;
    padding: 10px 15px;
    border-radius: 20px;
    background: linear-gradient(120deg, #3498db, #2980b9);
    border: none;
    color: white;
    font-weight: 500;
    box-shadow: 0 2px 6px rgba(52, 152, 219, 0.3);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(52, 152, 219, 0.4);
    }
  }
}

.skills-edit {
  .el-select {
    width: 100%;
  }

  .skills-container {
    margin-top: 15px;

    .skill-tag {
      .el-tag__close {
        color: white;
        background-color: transparent;

        &:hover {
          background-color: rgba(255, 255, 255, 0.2);
          color: white;
        }
      }
    }
  }
}

.projects-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 25px;
}

.project-card {
  padding: 20px;
  border-radius: 10px;
  background: #f8f9fa;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }

  h3 {
    margin-top: 0;
    color: #2c3e50;
    font-size: 1.4rem;
  }

  p {
    color: #7f8c8d;
    line-height: 1.6;
  }
}

.project-tags {
  margin-top: 15px;

  .project-tag {
    margin-right: 8px;
    margin-bottom: 8px;
    border-radius: 15px;
  }
}

.project-edit {
  .el-form-item {
    margin-bottom: 15px;

    :deep(.el-form-item__label) {
      font-weight: 500;
      color: #2c3e50;
    }

    .el-input,
    .el-textarea,
    .el-select {
      width: 100%;
    }
  }

  .project-actions {
    margin-top: 10px;
    text-align: right;
  }
}

.add-project {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;

  .el-button {
    border-radius: 25px;
    padding: 12px 24px;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
  }
}

.contact-info {
  .contact-item {
    display: flex;
    align-items: center;
    margin-bottom: 15px;
    font-size: 1.1rem;
    color: #34495e;
    padding: 10px 15px;
    border-radius: 8px;
    transition: all 0.3s ease;

    &:hover {
      background-color: #f8f9fa;
    }

    i {
      font-size: 1.3rem;
      margin-right: 15px;
      color: #3498db;
      width: 24px;
      text-align: center;
    }

    .el-input {
      flex: 1;

      :deep(.el-input__inner) {
        border-radius: 6px;
        border: 1px solid #ddd;
        padding: 8px 12px;

        &:focus {
          border-color: #3498db;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .profile-page {
    padding: 10px;
  }

  .profile-header {
    padding: 20px 10px;
  }

  .header-actions {
    position: static;
    margin-bottom: 15px;
  }

  .profile-name-input,
  .profile-title-input {
    width: 100%;
    max-width: 300px;
  }

  .profile-name {
    font-size: 2rem;
  }

  .projects-container {
    grid-template-columns: 1fr;
  }

  .profile-content .profile-section {
    padding: 15px;
  }

  .profile-actions {
    .el-button {
      margin: 5px;
      padding: 8px 16px;
      font-size: 0.9rem;
    }
  }
}
</style>