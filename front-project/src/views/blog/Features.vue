<template>
  <div class="features-page">
    <div class="container">
      <div class="page-header">
        <h1 class="page-title">博客功能</h1>
        <p class="page-subtitle">探索本博客提供的各种功能和特性</p>
        <!-- 返回按钮 -->
        <div class="header-actions">
          <button class="back-button" @click="goBack">
            <el-icon><ArrowLeft /></el-icon>
            返回首页
          </button>
        </div>
      </div>

      <div class="features-grid">
        <div
          class="feature-card"
          v-for="feature in features"
          :key="feature.title"
          @click="visitFeature(feature.path)"
        >
          <div class="feature-icon">
            <el-icon v-if="feature.icon === 'el-icon-document'"
              ><Document
            /></el-icon>
            <el-icon v-else-if="feature.icon === 'el-icon-search'"
              ><Search
            /></el-icon>
            <el-icon v-else-if="feature.icon === 'el-icon-chat-dot-round'"
              ><ChatDotRound
            /></el-icon>
            <el-icon v-else-if="feature.icon === 'el-icon-mobile'"
              ><Iphone
            /></el-icon>
            <el-icon v-else-if="feature.icon === 'el-icon-lock'"
              ><Lock
            /></el-icon>
            <el-icon v-else-if="feature.icon === 'el-icon-data-line'"
              ><DataLine
            /></el-icon>
          </div>
          <h3 class="feature-title">{{ feature.title }}</h3>
          <p class="feature-description">{{ feature.description }}</p>
        </div>
      </div>

      <div class="tech-stack">
        <h2>技术栈</h2>
        <p class="section-description">
          本博客使用了以下技术和工具构建，确保提供最佳的用户体验
        </p>

        <div class="tech-grid">
          <div class="tech-item" v-for="tech in techStack" :key="tech.name">
            <div class="tech-icon">
              <el-icon v-if="tech.icon === 'el-icon-monitor'"
                ><Monitor
              /></el-icon>
              <el-icon v-else-if="tech.icon === 'el-icon-edit'"
                ><Edit
              /></el-icon>
              <el-icon v-else-if="tech.icon === 'el-icon-lightning'"
                ><Lightning
              /></el-icon>
              <el-icon v-else-if="tech.icon === 'el-icon-cpu'"><Cpu /></el-icon>
              <el-icon v-else-if="tech.icon === 'el-icon-brush'"
                ><Brush
              /></el-icon>
              <el-icon v-else-if="tech.icon === 'el-icon-picture'"
                ><Picture
              /></el-icon>
              <el-icon v-else-if="feature.icon === 'el-icon-tools'"
                ><Tools
              /></el-icon>
            </div>
            <h4>{{ tech.name }}</h4>
            <p>{{ tech.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElIcon } from "element-plus";
import {
  Document,
  Search,
  ChatDotRound,
  Iphone,
  Lock,
  DataLine,
  Monitor,
  Edit,
  Lightning,
  Cpu,
  Brush,
  Picture,
  ArrowLeft,
  Tools,
} from "@element-plus/icons-vue";
import { useRouter } from "vue-router";

interface Feature {
  icon: string;
  title: string;
  description: string;
  path: string;
}

interface Tech {
  name: string;
  description: string;
  icon: string;
}

const features: Feature[] = [
  {
    icon: "el-icon-document",
    title: "手势控制圣诞树",
    description:
      "支持文章的创建、编辑、删除和分类管理，提供富文本编辑器和Markdown支持。",
    path: "/chrismasTree",
  },
  {
    icon: "el-icon-tools",
    title: "格式转化工具",
    description:
      "支持JSON、XML、CSV等多种格式之间的相互转换，以及大小写转换、Base64编码等实用功能。",
    path: "/format-converter",
  },
];

const router = useRouter();

const visitFeature = (path: string) => {
  router.push({
    path: path,
  });
};

const goBack = () => {
  router.push("/");
};

const techStack: Tech[] = [
  {
    name: "Vue 3",
    description: "渐进式JavaScript框架，用于构建用户界面",
    icon: "el-icon-monitor",
  },
  {
    name: "TypeScript",
    description: "JavaScript的超集，提供静态类型检查",
    icon: "el-icon-edit",
  },
  {
    name: "Vite",
    description: "下一代前端构建工具，提供快速的开发体验",
    icon: "el-icon-lightning",
  },
  {
    name: "Element Plus",
    description: "基于Vue 3的桌面端组件库",
    icon: "el-icon-cpu",
  },
  {
    name: "Sass",
    description: "成熟、稳定、强大的CSS扩展语言",
    icon: "el-icon-brush",
  },
  {
    name: "Tailwind CSS",
    description: "功能类优先的CSS框架",
    icon: "el-icon-picture",
  },
];
</script>

<style scoped lang="scss">
.features-page {
  padding: 20px 0 40px;
  background: linear-gradient(
    135deg,
    var(--background-color) 0%,
    var(--card-bg) 100%
  );
  min-height: calc(100vh - 140px);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 50px;
  padding: 30px 0;
  position: relative;
}

.page-title {
  font-size: 2.8rem;
  margin-bottom: 15px;
  color: var(--text-color);
  font-weight: 800;
  position: relative;
  display: inline-block;
}

.page-title::after {
  content: "";
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 4px;
  background: linear-gradient(120deg, #3498db, #2c3e50);
  border-radius: 2px;
}

.page-subtitle {
  font-size: 1.3rem;
  color: var(--text-color-secondary);
  max-width: 600px;
  margin: 30px auto 0;
}

.header-actions {
  margin-top: 20px;
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-color);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  text-decoration: none;

  &:hover {
    background: var(--background-color);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  margin-bottom: 60px;
}

.feature-card {
  background: var(--card-bg);
  border-radius: 15px;
  padding: 40px 30px;
  text-align: center;
  box-shadow: var(--card-shadow);
  transition: all 0.4s ease;
  border: 1px solid var(--border-color);
  cursor: pointer;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
  }
}

.feature-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(120deg, #3498db, #2c3e50);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 25px;
  font-size: 2rem;
  color: white;
  box-shadow: 0 5px 15px rgba(52, 152, 219, 0.4);
}

.feature-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 15px 0;
  color: var(--text-color);
}

.feature-description {
  color: var(--text-color-secondary);
  line-height: 1.8;
  margin: 0;
}

.tech-stack {
  h2 {
    text-align: center;
    font-size: 2.2rem;
    margin-bottom: 20px;
    color: var(--text-color);
    position: relative;
    padding-bottom: 20px;

    &::after {
      content: "";
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 60px;
      height: 4px;
      background: linear-gradient(120deg, #3498db, #2c3e50);
      border-radius: 2px;
    }
  }

  .section-description {
    text-align: center;
    font-size: 1.1rem;
    color: var(--text-color-secondary);
    max-width: 600px;
    margin: 0 auto 40px;
  }
}

.tech-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
}

.tech-item {
  background: var(--card-bg);
  border-radius: 15px;
  padding: 30px;
  text-align: center;
  box-shadow: var(--card-shadow);
  transition: all 0.4s ease;
  border: 1px solid var(--border-color);

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  }

  .tech-icon {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: linear-gradient(120deg, #3498db, #2c3e50);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;
    font-size: 1.5rem;
    color: white;
  }

  h4 {
    font-size: 1.3rem;
    margin: 0 0 15px 0;
    color: var(--text-color);
  }

  p {
    color: var(--text-color-secondary);
    line-height: 1.7;
    margin: 0;
  }
}

@media (max-width: 768px) {
  .page-title {
    font-size: 2.2rem;
  }

  .page-subtitle {
    font-size: 1.1rem;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .feature-card {
    padding: 30px 20px;
  }

  .tech-grid {
    grid-template-columns: 1fr;
  }

  .tech-stack h2 {
    font-size: 1.8rem;
  }
}
</style>