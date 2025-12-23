<template>
  <div class="friends-page">
    <div class="container">
      <div class="page-header">
        <h1 class="page-title">友情链接</h1>
        <p class="page-subtitle">
          这里是一些我经常访问的技术博客和网站，推荐给大家
        </p>
      </div>

      <div class="friends-intro">
        <div class="intro-card">
          <h2>欢迎交换友链!</h2>
          <p>如果你也是博主，欢迎交换友链！请通过以下方式联系我：</p>
          <div class="contact-methods">
            <div class="contact-item">
              <el-icon><Message /></el-icon>
              <span>邮箱: example@email.com</span>
            </div>
            <div class="contact-item">
              <el-icon><ChatDotRound /></el-icon>
              <span>微信: your_wechat</span>
            </div>
            <div class="contact-item">
              <el-icon><Platform /></el-icon>
              <span>GitHub: github.com/username</span>
            </div>
          </div>
        </div>
      </div>

      <div class="friends-grid">
        <div
          class="friend-card"
          v-for="friend in friends"
          :key="friend.name"
          @click="visitFriend(friend.url)"
        >
          <div class="friend-avatar">
            <div class="avatar-placeholder">
              <el-icon><User /></el-icon>
            </div>
          </div>
          <div class="friend-info">
            <h3 class="friend-name">{{ friend.name }}</h3>
            <p class="friend-description">{{ friend.description }}</p>
            <div class="friend-tags">
              <el-tag
                v-for="tag in friend.tags"
                :key="tag"
                size="small"
                class="tag"
              >
                {{ tag }}
              </el-tag>
            </div>
          </div>
        </div>
      </div>

      <div class="friend-requirements">
        <h2>友链要求</h2>
        <ul>
          <li>网站内容健康，无违法不良信息</li>
          <li>网站定期更新维护</li>
          <li>不包含恶意代码或广告</li>
          <li>技术类博客优先</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElTag, ElIcon } from "element-plus";
import { Message, ChatDotRound, Platform, User } from "@element-plus/icons-vue";

interface Friend {
  name: string;
  url: string;
  description: string;
  tags: string[];
}

const friends: Friend[] = [
  {
    name: "Vue.js 官方博客",
    url: "https://vuejs.org/blog/",
    description: "Vue.js 官方技术博客，发布最新的 Vue 相关资讯和教程",
    tags: ["Vue", "官方"],
  },
  {
    name: "React Blog",
    url: "https://reactjs.org/blog/",
    description: "React 官方博客，提供 React 最新动态和技术文章",
    tags: ["React", "官方"],
  },
  {
    name: "MDN Web Docs",
    url: "https://developer.mozilla.org/",
    description: "Web 开发权威文档，涵盖 HTML、CSS、JavaScript 等技术",
    tags: ["文档", "教程"],
  },
  {
    name: "掘金",
    url: "https://juejin.cn/",
    description: "开发者技术分享社区，大量优质技术文章",
    tags: ["社区", "中文"],
  },
  {
    name: "GitHub",
    url: "https://github.com/",
    description: "全球最大的代码托管平台，开源项目聚集地",
    tags: ["代码", "开源"],
  },
  {
    name: "Stack Overflow",
    url: "https://stackoverflow.com/",
    description: "程序员问答社区，解决各种编程问题",
    tags: ["问答", "社区"],
  },
];

const visitFriend = (url: string) => {
  window.open(url, "_blank");
};
</script>

<style scoped lang="scss">
.friends-page {
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
  margin-bottom: 40px;
  padding: 30px 0;
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

.friends-intro {
  margin-bottom: 40px;
}

.intro-card {
  background: linear-gradient(120deg, #3498db 0%, #2c3e50 100%);
  border-radius: 15px;
  padding: 40px;
  text-align: center;
  color: white;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);

  h2 {
    font-size: 1.8rem;
    margin-top: 0;
    margin-bottom: 20px;
    font-weight: 700;
  }

  p {
    font-size: 1.2rem;
    margin-bottom: 30px;
    opacity: 0.9;
  }
}

.contact-methods {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 25px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.15);
  padding: 15px 25px;
  border-radius: 30px;
  color: white;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);

  i {
    font-size: 1.5rem;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: translateY(-3px);
  }
}

.friends-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 30px;
  margin-bottom: 50px;
}

.friend-card {
  background: var(--card-bg);
  border-radius: 15px;
  box-shadow: var(--card-shadow);
  padding: 30px;
  display: flex;
  align-items: center;
  gap: 25px;
  cursor: pointer;
  transition: all 0.4s ease;
  border: 1px solid var(--border-color);
  position: relative;
  overflow: hidden;
}

.friend-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 5px;
  background: linear-gradient(120deg, #3498db, #2c3e50);
}

.friend-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
}

.friend-avatar {
  flex-shrink: 0;
}

.avatar-placeholder {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: linear-gradient(120deg, #3498db, #2c3e50);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  color: white;
}

.friend-info {
  flex: 1;
  min-width: 0;
}

.friend-name {
  font-size: 1.4rem;
  font-weight: 700;
  margin: 0 0 10px 0;
  color: var(--text-color);
}

.friend-description {
  color: var(--text-color-secondary);
  line-height: 1.7;
  margin: 0 0 15px 0;
}

.friend-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.friend-requirements {
  background: var(--card-bg);
  border-radius: 15px;
  padding: 40px;
  box-shadow: var(--card-shadow);
  border: 1px solid var(--border-color);

  h2 {
    text-align: center;
    font-size: 2rem;
    margin-top: 0;
    margin-bottom: 25px;
    color: var(--text-color);
    position: relative;
    padding-bottom: 15px;

    &::after {
      content: "";
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 50px;
      height: 3px;
      background: linear-gradient(120deg, #3498db, #2c3e50);
      border-radius: 2px;
    }
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 15px;
    align-items: center;

    li {
      position: relative;
      padding-left: 30px;
      color: var(--text-color-secondary);
      font-size: 1.1rem;

      &::before {
        content: "✓";
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 22px;
        height: 22px;
        background: linear-gradient(120deg, #3498db, #2c3e50);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 0.8rem;
        font-weight: bold;
      }
    }
  }
}

@media (max-width: 768px) {
  .page-title {
    font-size: 2.2rem;
  }

  .page-subtitle {
    font-size: 1.1rem;
  }

  .friends-grid {
    grid-template-columns: 1fr;
  }

  .friend-card {
    flex-direction: column;
    text-align: center;
  }

  .contact-methods {
    flex-direction: column;
    align-items: center;
  }

  .friend-requirements {
    padding: 30px 20px;

    ul {
      align-items: flex-start;
    }
  }
}
</style>