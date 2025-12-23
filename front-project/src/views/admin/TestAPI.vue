<template>
  <div class="test-api">
    <h1>API测试页面</h1>

    <div class="section">
      <h2>友链测试</h2>
      <el-button @click="testFriendsAPI">测试友链API</el-button>
      <div v-if="friendsData.length > 0">
        <div v-for="friend in friendsData" :key="friend.id">
          <p>{{ friend.name }} - {{ friend.url }}</p>
        </div>
      </div>
      <p v-else-if="friendsTested">暂无友链数据</p>
    </div>

    <div class="section">
      <h2>统计测试</h2>
      <el-button @click="testStatsAPI">测试统计API</el-button>
      <div v-if="statsData">
        <p>文章数: {{ statsData.articles }}</p>
        <p>标签数: {{ statsData.tags }}</p>
        <p>友链数: {{ statsData.friends }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { ElButton, ElMessage } from "element-plus";
import { getFriends } from "../../api/friend";
import { getBlogStats } from "../../api/stats";
import type { Friend, Stats } from "../../types";

const friendsData = ref<Friend[]>([]);
const statsData = ref<Stats | null>(null);
const friendsTested = ref(false);

const testFriendsAPI = async () => {
  try {
    const data = await getFriends();
    friendsData.value = data;
    friendsTested.value = true;
    ElMessage.success("友链API测试成功");
  } catch (error) {
    ElMessage.error("友链API测试失败: " + (error as Error).message);
  }
};

const testStatsAPI = async () => {
  try {
    const data = await getBlogStats();
    statsData.value = data;
    ElMessage.success("统计API测试成功");
  } catch (error) {
    ElMessage.error("统计API测试失败: " + (error as Error).message);
  }
};
</script>

<style scoped>
.test-api {
  padding: 20px;
}

.section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 5px;
}
</style>