<template>
  <div class="dashboard">
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-icon" style="background-color: #40c9c6">
            <i class="el-icon-document"></i>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ stats.articles }}</div>
            <div class="stat-label">文章数</div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-icon" style="background-color: #34bfa3">
            <i class="el-icon-user"></i>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ stats.users }}</div>
            <div class="stat-label">用户数</div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-icon" style="background-color: #f4516c">
            <i class="el-icon-chat-dot-round"></i>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ stats.comments }}</div>
            <div class="stat-label">评论数</div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-icon" style="background-color: #3498db">
            <i class="el-icon-view"></i>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ stats.views }}</div>
            <div class="stat-label">浏览量</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="content-row">
      <el-col :span="16">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>热门文章排行</span>
              <div class="chart-controls">
                <el-date-picker
                  v-model="dateRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  size="small"
                  style="width: 240px; margin-right: 10px"
                  value-format="YYYY-MM-DD"
                  @change="onDateRangeChange"
                />
                <el-radio-group
                  v-model="chartType"
                  size="small"
                  @change="onChartTypeChange"
                >
                  <el-radio-button label="bar">柱状图</el-radio-button>
                  <el-radio-button label="line">折线图</el-radio-button>
                  <el-radio-button label="pie">饼图</el-radio-button>
                </el-radio-group>
              </div>
            </div>
          </template>
          <div class="chart-container" ref="chartContainerRef">
            <!-- ECharts图表将在这里渲染 -->
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="recent-card">
          <template #header>
            <div class="card-header">
              <span>最新文章</span>
            </div>
          </template>
          <div class="recent-list">
            <div
              v-for="article in recentArticles"
              :key="article.id"
              class="recent-item"
              @click="goToArticle(article.id)"
            >
              <div class="recent-title">{{ article.title }}</div>
              <div class="recent-date">
                {{ formatDate(article.created_at) }}
              </div>
            </div>
            <div v-if="recentArticles.length === 0" class="no-data">
              暂无文章
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import {
  ElRow,
  ElCol,
  ElCard,
  ElRadioGroup,
  ElRadioButton,
  ElDatePicker,
} from "element-plus";
import * as echarts from "echarts";
import { getBlogStats } from "../../api/stats";
import { getPopularArticles, getRecentArticles } from "../../api/article";

const router = useRouter();

// 统计数据
const stats = ref({
  articles: 0,
  users: 0,
  comments: 0,
  views: 0,
});

// 最新文章
const recentArticles = ref<any[]>([]);

// 图表相关
const chartContainerRef = ref<HTMLElement | null>(null);
let chartInstance: echarts.ECharts | null = null;
const chartType = ref("bar");
const dateRange = ref<[string, string] | null>(null);

// 热门文章数据
const popularArticles = ref<
  {
    id: number;
    title: string;
    views: number;
    comment_count: number;
    popularity_score: number;
  }[]
>([]);

// 初始化图表
const initChart = () => {
  if (chartContainerRef.value) {
    chartInstance = echarts.init(chartContainerRef.value);
    // 设置初始图表选项
    updateChartDisplay();
  }
};

// 更新图表显示
const updateChartDisplay = () => {
  if (!chartInstance) return;

  // 处理数据
  const titles = popularArticles.value.map((item) => item.title);
  const views = popularArticles.value.map((item) => item.views);
  const comments = popularArticles.value.map((item) => item.comment_count);
  const popularityScores = popularArticles.value.map(
    (item) => item.popularity_score
  );

  let option = {};

  switch (chartType.value) {
    case "bar":
      option = {
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "shadow",
          },
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          borderColor: "#3498db",
          borderWidth: 1,
          textStyle: {
            color: "#333",
            fontSize: 12,
          },
          padding: [10, 15],
          extraCssText:
            "box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15); border-radius: 4px;",
        },
        legend: {
          data: ["浏览量", "评论数", "综合热度"],
          top: "8%",
          textStyle: {
            color: "#666",
          },
          itemWidth: 12,
          itemHeight: 12,
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "15%",
          top: "20%",
          containLabel: true,
        },
        xAxis: {
          type: "category",
          data: titles,
          axisLine: {
            lineStyle: {
              color: "#e0e0e0",
            },
          },
          axisLabel: {
            color: "#666",
            rotate: 45,
            fontSize: 11,
          },
          axisTick: {
            show: false,
          },
        },
        yAxis: {
          type: "value",
          axisLine: {
            show: false,
          },
          axisTick: {
            show: false,
          },
          axisLabel: {
            color: "#666",
            fontSize: 11,
          },
          splitLine: {
            lineStyle: {
              type: "dashed",
              color: "#f0f0f0",
            },
          },
        },
        series: [
          {
            name: "浏览量",
            type: "bar",
            barWidth: "20%",
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: "#4e73df",
                },
                {
                  offset: 1,
                  color: "#2e59d9",
                },
              ]),
              borderRadius: [4, 4, 0, 0],
            },
            emphasis: {
              itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  {
                    offset: 0,
                    color: "#5a8bff",
                  },
                  {
                    offset: 1,
                    color: "#3a66ff",
                  },
                ]),
              },
            },
            data: views,
            animationDuration: 1500,
            animationEasing: "cubicOut",
          },
          {
            name: "评论数",
            type: "bar",
            barWidth: "20%",
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: "#1cc88a",
                },
                {
                  offset: 1,
                  color: "#13b176",
                },
              ]),
              borderRadius: [4, 4, 0, 0],
            },
            emphasis: {
              itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  {
                    offset: 0,
                    color: "#2fe0a5",
                  },
                  {
                    offset: 1,
                    color: "#1dcc8d",
                  },
                ]),
              },
            },
            data: comments,
            animationDuration: 1500,
            animationEasing: "cubicOut",
          },
          {
            name: "综合热度",
            type: "bar",
            barWidth: "20%",
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: "#36b9cc",
                },
                {
                  offset: 1,
                  color: "#2c9faf",
                },
              ]),
              borderRadius: [4, 4, 0, 0],
            },
            emphasis: {
              itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  {
                    offset: 0,
                    color: "#4accdc",
                  },
                  {
                    offset: 1,
                    color: "#3ab5c5",
                  },
                ]),
              },
            },
            data: popularityScores,
            animationDuration: 1500,
            animationEasing: "cubicOut",
          },
        ],
      };
      break;

    case "line":
      option = {
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "line",
          },
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          borderColor: "#3498db",
          borderWidth: 1,
          textStyle: {
            color: "#333",
            fontSize: 12,
          },
          padding: [10, 15],
          extraCssText:
            "box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15); border-radius: 4px;",
        },
        legend: {
          data: ["浏览量", "评论数", "综合热度"],
          top: "8%",
          textStyle: {
            color: "#666",
          },
          itemWidth: 12,
          itemHeight: 12,
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "15%",
          top: "20%",
          containLabel: true,
        },
        xAxis: {
          type: "category",
          data: titles,
          axisLine: {
            lineStyle: {
              color: "#e0e0e0",
            },
          },
          axisLabel: {
            color: "#666",
            rotate: 45,
            fontSize: 11,
          },
          axisTick: {
            show: false,
          },
        },
        yAxis: {
          type: "value",
          axisLine: {
            show: false,
          },
          axisTick: {
            show: false,
          },
          axisLabel: {
            color: "#666",
            fontSize: 11,
          },
          splitLine: {
            lineStyle: {
              type: "dashed",
              color: "#f0f0f0",
            },
          },
        },
        series: [
          {
            name: "浏览量",
            type: "line",
            smooth: true,
            symbolSize: 6,
            showSymbol: true,
            symbol: "circle",
            lineStyle: {
              width: 3,
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: "#4e73df",
                },
                {
                  offset: 1,
                  color: "#2e59d9",
                },
              ]),
            },
            areaStyle: {
              opacity: 0.1,
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: "#4e73df",
                },
                {
                  offset: 1,
                  color: "#ffffff",
                },
              ]),
            },
            emphasis: {
              focus: "series",
            },
            data: views,
            animationDuration: 1500,
            animationEasing: "cubicOut",
          },
          {
            name: "评论数",
            type: "line",
            smooth: true,
            symbolSize: 6,
            showSymbol: true,
            symbol: "circle",
            lineStyle: {
              width: 3,
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: "#1cc88a",
                },
                {
                  offset: 1,
                  color: "#13b176",
                },
              ]),
            },
            areaStyle: {
              opacity: 0.1,
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: "#1cc88a",
                },
                {
                  offset: 1,
                  color: "#ffffff",
                },
              ]),
            },
            emphasis: {
              focus: "series",
            },
            data: comments,
            animationDuration: 1500,
            animationEasing: "cubicOut",
          },
          {
            name: "综合热度",
            type: "line",
            smooth: true,
            symbolSize: 6,
            showSymbol: true,
            symbol: "circle",
            lineStyle: {
              width: 3,
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: "#36b9cc",
                },
                {
                  offset: 1,
                  color: "#2c9faf",
                },
              ]),
            },
            areaStyle: {
              opacity: 0.1,
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: "#36b9cc",
                },
                {
                  offset: 1,
                  color: "#ffffff",
                },
              ]),
            },
            emphasis: {
              focus: "series",
            },
            data: popularityScores,
            animationDuration: 1500,
            animationEasing: "cubicOut",
          },
        ],
      };
      break;

    case "pie":
      option = {
        tooltip: {
          trigger: "item",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          borderColor: "#3498db",
          borderWidth: 1,
          textStyle: {
            color: "#333",
            fontSize: 12,
          },
          padding: [10, 15],
          extraCssText:
            "box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15); border-radius: 4px;",
        },
        legend: {
          data: titles,
          top: "bottom",
          type: "scroll",
          textStyle: {
            color: "#666",
            fontSize: 11,
          },
          pageIconColor: "#3498db",
          pageIconInactiveColor: "#ccc",
          pageTextStyle: {
            color: "#666",
          },
        },
        series: [
          {
            name: "综合热度",
            type: "pie",
            radius: ["30%", "70%"],
            center: ["50%", "50%"],
            roseType: "radius",
            itemStyle: {
              borderRadius: 3,
              borderColor: "#fff",
              borderWidth: 2,
            },
            label: {
              show: true,
              fontSize: 11,
              color: "#666",
              formatter: "{b}\n{d}%",
            },
            labelLine: {
              smooth: 0.2,
              length: 10,
              length2: 20,
            },
            data: popularArticles.value.map((item, index) => ({
              name: item.title,
              value: item.popularity_score,
              itemStyle: {
                color: echarts.color.modifyHSL(
                  "#4e73df",
                  (index * 40) % 360,
                  undefined,
                  undefined
                ),
              },
            })),
            animationDuration: 1500,
            animationEasing: "cubicOut",
          },
        ],
      };
      break;
  }

  chartInstance.setOption(option, true);
};

// 图表类型变化处理
const onChartTypeChange = () => {
  updateChartDisplay();
};

// 日期范围变化处理
const onDateRangeChange = () => {
  fetchPopularArticles();
};

// 更新热门文章数据
const updatePopularArticles = (
  data: {
    id: number;
    title: string;
    views: number;
    comment_count: number;
  }[]
) => {
  // 计算综合热度分数 (浏览量 + 评论数 * 5)
  const articlesWithScore = data.map((item) => ({
    ...item,
    popularity_score: item.views + item.comment_count * 5,
  }));

  popularArticles.value = articlesWithScore;
  updateChartDisplay();
};

// 获取热门文章
const fetchPopularArticles = async () => {
  try {
    let startDate, endDate;
    if (dateRange.value) {
      [startDate, endDate] = dateRange.value;
    }
    const data = await getPopularArticles(10, startDate, endDate);
    updatePopularArticles(data);
  } catch (error) {
    console.error("获取热门文章失败:", error);
  }
};

// 获取最新文章
const fetchRecentArticles = async () => {
  try {
    const response = await getRecentArticles(5);
    recentArticles.value = response.articles || response;
  } catch (error) {
    console.error("获取最新文章失败:", error);
  }
};

// 获取统计数据
const fetchStats = async () => {
  try {
    const data = await getBlogStats();
    stats.value = {
      articles: data.articles,
      users: data.users,
      comments: 56, // 暂时使用默认值
      views: data.views,
    };
  } catch (error) {
    console.error("获取统计数据失败:", error);
  }
};

// 跳转到文章详情页
const goToArticle = (id: number) => {
  router.push(`/blog/article/${id}`);
};

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

// 组件挂载时初始化
onMounted(() => {
  initChart();
  fetchStats();
  fetchPopularArticles();
  fetchRecentArticles();

  // 监听窗口大小变化，自适应图表
  window.addEventListener("resize", () => {
    if (chartInstance) {
      chartInstance.resize();
    }
  });
});
</script>

<style scoped lang="scss">
.dashboard {
  padding: 20px;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  display: flex;
  background: var(--card-bg);
  border-radius: 8px;
  box-shadow: var(--card-shadow);
  padding: 20px;
  transition: all 0.3s ease;
  border: 1px solid var(--border-color);

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  }
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  flex-shrink: 0;

  i {
    font-size: 24px;
    color: white;
  }
}

.stat-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  color: var(--text-color);
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: var(--text-color-secondary);
}

.content-row {
  margin-bottom: 20px;
}

.chart-card,
.recent-card {
  background: var(--card-bg);
  border-radius: 8px;
  box-shadow: var(--card-shadow);
  border: 1px solid var(--border-color);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--text-color);
}

.chart-container {
  width: 100%;
  height: 400px;
}

.recent-list {
  max-height: 400px;
  overflow-y: auto;
}

.recent-item {
  padding: 12px 0;
  border-bottom: 1px solid var(--border-color);
  cursor: pointer;
  transition: all 0.3s ease;
  color: var(--text-color);

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: var(--background-color);
    padding-left: 10px;
  }
}

.recent-title {
  font-weight: 500;
  margin-bottom: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.recent-date {
  font-size: 12px;
  color: var(--text-color-secondary);
}

.no-data {
  text-align: center;
  padding: 40px 0;
  color: var(--text-color-secondary);
}

.chart-controls {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

@media (max-width: 768px) {
  .stats-row {
    :deep(.el-col) {
      margin-bottom: 15px;
    }
  }

  .content-row {
    :deep(.el-col) {
      margin-bottom: 15px;
    }
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .chart-controls {
    width: 100%;
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>