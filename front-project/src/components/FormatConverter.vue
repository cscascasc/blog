<template>
  <div class="thesis-formatter">
    <div class="header">
      <h1>论文格式编辑器</h1>
      <button @click="goBack" class="back-btn">返回功能页面</button>
    </div>

    <!-- 格式选择阶段 -->
    <div v-if="!formatConfirmed" class="format-selection">
      <div class="format-selector">
        <label for="formatType">选择论文格式:</label>
        <select
          id="formatType"
          v-model="selectedFormat"
          class="format-select"
          @change="onFormatChange"
          title="选择论文格式标准"
        >
          <option value="">请选择论文格式</option>
          <option value="cnki">知网标准论文格式</option>
          <option value="custom">自定义论文格式</option>
          <option
            v-for="template in userTemplates"
            :key="template.id"
            :value="'user-template-' + template.id"
          >
            {{ template.name }}
          </option>
        </select>
      </div>

      <div
        v-if="selectedFormat !== 'cnki' && selectedFormat"
        class="format-config"
      >
        <h3>自定义格式设置</h3>

        <div class="custom-text-types">
          <h4>自定义文本类型</h4>
          <div
            class="text-type-item"
            v-for="(type, index) in customTextTypes"
            :key="index"
          >
            <div class="text-type-inputs">
              <input
                type="text"
                v-model="type.name"
                :placeholder="'文本类型名称，如：' + type.placeholder"
                class="type-name-input"
                :title="'输入' + type.placeholder + '的名称'"
              />
              <button @click="removeTextType(index)" class="remove-type-btn">
                删除
              </button>
            </div>

            <div class="format-settings">
              <div class="config-section">
                <label>字体大小:</label>
                <input
                  type="number"
                  v-model.number="type.fontSize"
                  min="8"
                  max="72"
                  class="config-input"
                />
              </div>
              <div class="config-section">
                <label>字体类型:</label>
                <select
                  v-model="type.fontFamily"
                  class="config-select"
                  title="选择字体类型"
                >
                  <option value="SimSun">宋体</option>
                  <option value="KaiTi">楷体</option>
                  <option value="FangSong">仿宋</option>
                  <option value="Arial">Arial</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Microsoft YaHei">微软雅黑</option>
                </select>
              </div>
              <div class="config-section">
                <label>是否加粗:</label>
                <input
                  type="checkbox"
                  v-model="type.bold"
                  class="config-checkbox"
                />
              </div>
              <div class="config-section">
                <label>是否斜体:</label>
                <input
                  type="checkbox"
                  v-model="type.italic"
                  class="config-checkbox"
                />
              </div>
              <div class="config-section">
                <label>对齐方式:</label>
                <select
                  v-model="type.alignment"
                  class="config-select"
                  title="选择文本对齐方式"
                >
                  <option value="left">左对齐</option>
                  <option value="center">居中</option>
                  <option value="right">右对齐</option>
                  <option value="justify">两端对齐</option>
                </select>
              </div>
              <div
                class="config-section"
                v-if="type.name !== '正文' && type.name !== '段落'"
              >
                <label>段前间距:</label>
                <input
                  type="number"
                  v-model.number="type.marginTop"
                  min="0"
                  max="100"
                  step="0.5"
                  class="config-input"
                />
              </div>
              <div
                class="config-section"
                v-if="type.name !== '正文' && type.name !== '段落'"
              >
                <label>段后间距:</label>
                <input
                  type="number"
                  v-model.number="type.marginBottom"
                  min="0"
                  max="100"
                  step="0.5"
                  class="config-input"
                />
              </div>
              <div class="config-section">
                <label>行间距:</label>
                <input
                  type="number"
                  v-model.number="type.lineHeight"
                  step="0.1"
                  min="1.0"
                  max="3.0"
                  class="config-input"
                />
              </div>
              <div
                class="config-section"
                v-if="
                  type.name === '正文' ||
                  type.name === '段落' ||
                  type.name.toLowerCase().includes('content') ||
                  type.name.toLowerCase().includes('text')
                "
              >
                <label>首行缩进字符数:</label>
                <input
                  type="number"
                  v-model.number="type.textIndent"
                  min="0"
                  max="10"
                  class="config-input"
                />
              </div>
            </div>
          </div>

          <div class="add-type-section">
            <button @click="addTextType" class="add-type-btn">
              添加文本类型
            </button>
            <button
              v-if="selectedFormat === 'custom'"
              @click="saveCustomFormat"
              class="save-custom-format-btn"
              style="margin-left: 10px"
            >
              保存当前格式
            </button>
          </div>
        </div>
      </div>

      <div class="confirm-section">
        <button
          @click="confirmFormat"
          class="confirm-btn"
          :disabled="!canConfirmFormat"
        >
          确认格式并进入编辑
        </button>
      </div>
    </div>

    <!-- 内容编辑阶段 -->
    <div v-else class="editor-container">
      <div class="html-preview">
        <h2>预览效果</h2>
        <div class="preview-content">
          <div
            v-for="(part, index) in documentParts"
            :key="part.id"
            class="preview-item"
            @mouseenter="showActions = index"
            @mouseleave="showActions = null"
          >
            <div v-html="generateHTML(part.type, part.content)"></div>
            <div class="preview-actions" v-show="showActions === index">
              <button @click="editPart(index)" class="edit-btn">编辑</button>
              <button @click="deletePart(index)" class="delete-btn">
                删除
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="input-panel">
        <h2>内容编辑</h2>
        <div class="input-section">
          <label for="textType">选择文本类型:</label>
          <select
            id="textType"
            v-model="selectedTextType"
            class="text-type-select"
            v-if="selectedFormat === 'cnki'"
            title="选择要添加的文本类型"
          >
            <option value="title">论文标题</option>
            <option value="author">作者</option>
            <option value="affiliation">单位</option>
            <option value="abstract">摘要</option>
            <option value="keywords">关键词</option>
            <option value="section-title">一级标题</option>
            <option value="subsection-title">二级标题</option>
            <option value="subsubsection-title">三级标题</option>
            <option value="content">正文</option>
            <option value="quote">引用</option>
            <option value="list">列表项</option>
            <option value="numbered-list">编号列表</option>
            <option value="reference">参考文献</option>
          </select>

          <!-- 模板格式的文本类型选择 -->
          <select
            id="textType"
            v-model="selectedTextType"
            class="text-type-select"
            v-if="
              (selectedFormat === 'template' ||
                selectedFormat.startsWith('user-template-')) &&
              templateFormat &&
              templateFormat.types
            "
            title="选择要添加的文本类型"
          >
            <option
              v-for="(typeConfig, typeName) in templateFormat.types"
              :key="typeName"
              :value="typeName"
            >
              {{ typeConfig.displayName || typeName }}
            </option>
          </select>

          <div v-if="selectedFormat === 'cnki'" class="cnki-customize-section">
            <label>
              <input
                type="checkbox"
                v-model="showCnkiCustomize"
                class="cnki-customize-checkbox"
              />
              自定义知网格式细节
            </label>
            <div v-if="showCnkiCustomize" class="cnki-customize-options">
              <div class="config-section">
                <label>字体大小:</label>
                <input
                  type="number"
                  v-model.number="cnkiCustomSettings.fontSize"
                  min="8"
                  max="72"
                  class="config-input"
                />
              </div>
              <div class="config-section">
                <label>字体类型:</label>
                <select
                  v-model="cnkiCustomSettings.fontFamily"
                  class="config-select"
                >
                  <option value="SimSun">宋体</option>
                  <option value="KaiTi">楷体</option>
                  <option value="FangSong">仿宋</option>
                  <option value="Arial">Arial</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Microsoft YaHei">微软雅黑</option>
                </select>
              </div>
              <div class="config-section">
                <label>是否加粗:</label>
                <input
                  type="checkbox"
                  v-model="cnkiCustomSettings.bold"
                  class="config-checkbox"
                />
              </div>
              <div class="config-section">
                <label>是否斜体:</label>
                <input
                  type="checkbox"
                  v-model="cnkiCustomSettings.italic"
                  class="config-checkbox"
                />
              </div>
              <div class="config-section">
                <label>对齐方式:</label>
                <select
                  v-model="cnkiCustomSettings.alignment"
                  class="config-select"
                >
                  <option value="left">左对齐</option>
                  <option value="center">居中</option>
                  <option value="right">右对齐</option>
                  <option value="justify">两端对齐</option>
                </select>
              </div>
            </div>
          </div>
          <select
            id="textType"
            v-model="selectedTextType"
            class="text-type-select"
            v-else-if="selectedFormat === 'custom'"
          >
            <option
              v-for="type in validCustomTextTypes"
              :key="type.name"
              :value="type.name"
            >
              {{ type.name }}
            </option>
          </select>
        </div>

        <div class="input-section">
          <label for="textInput">输入文字:</label>
          <textarea
            id="textInput"
            v-model="textInput"
            placeholder="请输入文本内容..."
            rows="8"
            class="text-input"
            title="输入要添加到文档的文本内容"
          ></textarea>
        </div>

        <div class="input-actions">
          <div class="action-row">
            <button @click="addText" class="add-btn">
              {{ editingIndex !== null ? "更新内容" : "添加到文档" }}
            </button>
            <button @click="clearAll" class="clear-btn">清空全部</button>
          </div>
          <div class="action-row">
            <button @click="copyToClipboard" class="copy-btn">复制HTML</button>
            <button @click="exportToDocx" class="export-btn">
              导出Word文档
            </button>
          </div>
          <div class="action-row">
            <button @click="saveCurrentContent" class="save-content-btn">
              保存内容
            </button>
            <button @click="loadUserContent" class="load-content-btn">
              加载内容
            </button>
          </div>
          <div class="action-row">
            <button @click="resetFormat" class="reset-btn">重选格式</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import DOMPurify from "dompurify";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  saveTemplate,
  getUserTemplates,
  getTemplateById,
  saveContent,
  getUserContents,
  getContentById,
} from "@/api/template";

// 响应式数据
const textInput = ref("");
const selectedTextType = ref("content");
const selectedFormat = ref(""); // 初始为空，用户必须先选择格式
const formatConfirmed = ref(false); // 格式是否已确认
const documentParts = ref<
  Array<{ id: string; type: string; content: string; customSettings?: any }>
>([]);
const editingIndex = ref<number | null>(null); // 当前编辑的项目索引
const showCnkiCustomize = ref(false); // 是否显示知网格式自定义选项
const showActions = ref<number | null>(null); // 当前显示操作按钮的项目索引
const userTemplates = ref<any[]>([]); // 用户保存的模板列表

// 知网格式自定义设置
const cnkiCustomSettings = ref({
  fontSize: 12,
  fontFamily: "SimSun",
  bold: false,
  italic: false,
  alignment: "left",
});

// 模板相关（用于用户保存的模板功能）
const templateFormat = ref<any>(null); // 存储用户保存的模板格式
const templateName = ref(""); // 用户保存的模板名称
const isTemplateLoaded = ref(false); // 是否已加载用户模板

// 自定义文本类型
interface CustomTextType {
  name: string;
  placeholder: string;
  fontSize: number;
  fontFamily: string;
  bold: boolean;
  italic: boolean;
  alignment: string;
  marginTop?: number;
  marginBottom?: number;
  lineHeight: number;
  textIndent?: number;
}

// 初始化自定义文本类型
const customTextTypes = ref<CustomTextType[]>([
  {
    name: "标题",
    placeholder: "如：标题、论文标题、主标题",
    fontSize: 24,
    fontFamily: "SimSun",
    bold: true,
    italic: false,
    alignment: "center",
    marginTop: 20,
    marginBottom: 20,
    lineHeight: 1.5,
  },
  {
    name: "正文",
    placeholder: "如：正文、内容、段落",
    fontSize: 12,
    fontFamily: "SimSun",
    bold: false,
    italic: false,
    alignment: "justify",
    marginTop: 0,
    marginBottom: 15,
    lineHeight: 1.8,
    textIndent: 2,
  },
]);

// 获取路由实例
const router = useRouter();

// 计算属性：有效的自定义文本类型（名称不为空的）
const validCustomTextTypes = computed(() => {
  return customTextTypes.value.filter((type) => type.name.trim() !== "");
});

// 计算属性：判断是否可以确认格式
const canConfirmFormat = computed(() => {
  if (selectedFormat.value === "") {
    return false;
  }

  if (selectedFormat.value === "custom") {
    // 自定义格式需要至少有一个文本类型名称不为空
    return customTextTypes.value.some((type) => type.name.trim() !== "");
  }

  if (selectedFormat.value.startsWith("user-template-")) {
    // 用户保存的模板格式，总是可以确认
    return true;
  }

  // 知网格式可以直接确认
  return true;
});

// 当格式改变时的处理函数
const onFormatChange = async () => {
  // 格式改变时可以添加一些处理逻辑
  console.log("格式已选择:", selectedFormat.value);

  // 检查是否选择了用户保存的模板
  if (selectedFormat.value.startsWith("user-template-")) {
    const templateId = selectedFormat.value.replace("user-template-", "");

    try {
      // 从API获取模板详细信息，因为userTemplates列表中不包含content字段
      const templateDetail = await getTemplateById(parseInt(templateId));
      const template = templateDetail.template;

      if (template && template.content && template.content.types) {
        // 清空当前自定义文本类型
        customTextTypes.value = [];

        // 遍历模板中的类型并添加到自定义文本类型
        Object.keys(template.content.types).forEach((key) => {
          const typeData = template.content.types[key];
          customTextTypes.value.push({
            name: key,
            placeholder: `如：${key}`,
            fontSize: typeData.fontSize || 12,
            fontFamily: typeData.fontFamily || "SimSun",
            bold: typeData.bold || false,
            italic: typeData.italic || false,
            alignment: typeData.alignment || "left",
            lineHeight: typeData.lineHeight || 1.5,
            marginTop: typeData.marginTop || 0,
            marginBottom: typeData.marginBottom || 0,
            textIndent: typeData.textIndent || 0,
          });
        });

        // 同时设置templateFormat，确保在confirmFormat时能正确使用
        templateFormat.value = template.content;
        templateName.value = template.name;
        isTemplateLoaded.value = true;

        ElMessage.success("自定义格式已应用！");

        // 不自动进入编辑状态，让用户可以看到格式配置并进行调整
        // formatConfirmed.value = true;
        // selectedTextType.value = customTextTypes.value[0]?.name || "content";
      }
    } catch (error) {
      console.error("加载模板详情失败:", error);
      ElMessage.error("加载模板详情失败");
    }
  } else {
    // 如果切换到其他格式（非用户模板），确保清除模板相关状态
    // 清除模板状态，但保留用户模板列表
    templateFormat.value = null;
    templateName.value = "";
    isTemplateLoaded.value = false;
  }
};

// 加载用户保存的特定模板
const loadUserTemplateById = async (templateId: number) => {
  try {
    const response = await getTemplateById(templateId);
    // 根据API响应结构调整数据访问方式
    const templateData = response.template || response.data?.template;

    if (templateData) {
      templateFormat.value = templateData.content;
      templateName.value = templateData.name;
      isTemplateLoaded.value = true;

      // 根据模板数据更新自定义文本类型
      if (templateData.content && templateData.content.types) {
        // 清空当前自定义文本类型
        customTextTypes.value = [];

        // 遍历模板中的类型并添加到自定义文本类型
        Object.keys(templateData.content.types).forEach((key) => {
          const typeData = templateData.content.types[key];
          customTextTypes.value.push({
            name: key,
            placeholder: `如：${key}`,
            fontSize: typeData.fontSize || 12,
            fontFamily: typeData.fontFamily || "SimSun",
            bold: typeData.bold || false,
            italic: typeData.italic || false,
            alignment: typeData.alignment || "left",
            lineHeight: typeData.lineHeight || 1.5,
            marginTop: typeData.marginTop || 0,
            marginBottom: typeData.marginBottom || 0,
            textIndent: typeData.textIndent || 0,
          });
        });
      }

      ElMessage.success("自定义格式加载成功！");
    } else {
      ElMessage.error("未找到自定义格式数据");
    }
  } catch (error: any) {
    console.error("加载自定义格式失败:", error);
    // 检查错误类型并给出更具体的错误信息
    if (error.response && error.response.status === 404) {
      ElMessage.error("未找到指定的自定义格式");
    } else {
      ElMessage.error("加载自定义格式失败，请重试");
    }
  }
};

// 在组件挂载时加载用户模板
const loadUserTemplates = async () => {
  try {
    const response = await getUserTemplates("format");
    userTemplates.value = response?.templates || [];
    console.log("用户模板加载成功:", response, userTemplates.value);
  } catch (error) {
    console.error("加载用户模板失败:", error);
  }
};

// 在组件挂载时加载用户模板
loadUserTemplates();

// 添加新的文本类型
const addTextType = () => {
  customTextTypes.value.push({
    name: "",
    placeholder: "如：新文本类型",
    fontSize: 12,
    fontFamily: "SimSun",
    bold: false,
    italic: false,
    alignment: "left",
    lineHeight: 1.5,
    marginTop: 10,
    marginBottom: 10,
  });
};

// 删除文本类型
const removeTextType = (index: number) => {
  if (customTextTypes.value.length > 1) {
    customTextTypes.value.splice(index, 1);
  } else {
    ElMessage.warning("至少需要保留一个文本类型");
  }
};

// 确认格式
const confirmFormat = () => {
  if (!canConfirmFormat.value) {
    alert("请选择一个格式并完成必要的设置");
    return;
  }

  formatConfirmed.value = true;

  // 设置默认的文本类型选择
  if (selectedFormat.value === "cnki") {
    selectedTextType.value = "title";
  } else if (selectedFormat.value.startsWith("user-template-")) {
    // 用户保存的模板格式，使用模板中定义的第一个文本类型
    if (templateFormat.value && templateFormat.value.types) {
      const firstTypeKey = Object.keys(templateFormat.value.types)[0];
      if (firstTypeKey) {
        selectedTextType.value = firstTypeKey;
      } else {
        // 如果模板中没有定义类型，使用默认值
        selectedTextType.value = "content";
      }
    } else {
      // 如果templateFormat没有设置，尝试使用customTextTypes中的第一个类型
      if (customTextTypes.value && customTextTypes.value.length > 0) {
        selectedTextType.value = customTextTypes.value[0].name;
      } else {
        selectedTextType.value = "content";
      }
    }
  } else {
    // 自定义格式，选择第一个有效的文本类型
    const firstValidType = validCustomTextTypes.value[0]?.name;
    if (firstValidType) {
      selectedTextType.value = firstValidType;
    }
  }

  console.log("格式已确认:", selectedFormat.value);
};

// 重选格式
const resetFormat = () => {
  ElMessageBox.confirm(
    "确定要重新选择格式吗？当前编辑的内容将被保留。",
    "提示",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    }
  )
    .then(() => {
      formatConfirmed.value = false;
      // 重置格式选择，但保留用户模板列表
      selectedFormat.value = "";
    })
    .catch(() => {
      // 用户取消了操作
    });
};

// 保存自定义格式
const saveCustomFormat = async () => {
  // 验证至少有一个文本类型名称不为空
  if (!customTextTypes.value.some((type) => type.name.trim() !== "")) {
    ElMessage.error("请至少定义一个文本类型名称");
    return;
  }

  // 检查用户是否已登录
  const token = localStorage.getItem("token");
  if (!token) {
    const confirmResult = await ElMessageBox.confirm(
      "您尚未登录，需要先登录才能保存格式。是否立即跳转到登录页面？",
      "登录提示",
      {
        confirmButtonText: "去登录",
        cancelButtonText: "取消",
        type: "warning",
      }
    ).catch(() => {
      // 用户取消操作
      return false;
    });

    if (confirmResult === "confirm") {
      // 跳转到登录页面
      router.push("/login");
    }
    return;
  }

  // 使用Element UI的prompt
  try {
    const { value: formatName } = await ElMessageBox.prompt(
      "请输入格式名称：",
      "保存自定义格式",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        inputPattern: /\S+/, // 非空验证
        inputErrorMessage: "格式名称不能为空",
      }
    );

    // 创建格式数据
    const formatData = {
      types: {},
    };

    // 遍历自定义文本类型，构建格式数据
    customTextTypes.value.forEach((type) => {
      if (type.name.trim() !== "") {
        formatData.types[type.name] = {
          displayName: type.name,
          tag: "p", // 默认标签
          fontSize: type.fontSize,
          fontFamily: type.fontFamily,
          bold: type.bold,
          italic: type.italic,
          alignment: type.alignment,
          lineHeight: type.lineHeight,
          marginTop: type.marginTop || 0,
          marginBottom: type.marginBottom || 0,
          textIndent: type.textIndent || 0,
        };
      }
    });

    // 检查是否已存在同名格式
    const existingTemplate = userTemplates.value.find(
      (template) => template.name === formatName
    );
    if (existingTemplate) {
      const confirmResult = await ElMessageBox.confirm(
        `已存在名为 "${formatName}" 的格式，是否覆盖？`,
        "格式重名确认",
        {
          confirmButtonText: "覆盖",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch(() => {
        // 用户取消操作
        return false;
      });

      if (!confirmResult) {
        return; // 用户取消覆盖，直接返回
      }
    }

    // 调用API保存格式
    const response = await saveTemplate({
      name: formatName,
      description: `自定义格式: ${formatName}`,
      content: formatData,
      type: "format",
    });

    // 根据响应状态显示不同消息
    if (response.message === "模板已更新") {
      ElMessage.success("格式已更新！");
    } else {
      ElMessage.success("格式保存成功！");
    }

    // 重新加载用户模板列表
    await loadUserTemplates();
  } catch (error) {
    if (error !== "cancel") {
      if (error.response && error.response.status === 403) {
        // 令牌无效或权限不足
        ElMessage.error("访问令牌无效或权限不足，请重新登录");
        localStorage.removeItem("token");
        router.push("/login");
      } else {
        console.error("保存格式失败:", error);
        ElMessage.error("保存格式失败，请重试");
      }
    }
  }
};

// 根据文本类型和格式设置生成HTML格式和样式
const generateHTML = (type: string, content: string): string => {
  if (selectedFormat.value === "cnki") {
    // 知网标准格式
    let style = "";

    // 如果当前是知网格式且启用了自定义设置
    if (showCnkiCustomize.value) {
      style += `font-size: ${cnkiCustomSettings.value.fontSize}px; `;
      style += `font-family: ${cnkiCustomSettings.value.fontFamily}, serif; `;
      style += `font-weight: ${
        cnkiCustomSettings.value.bold ? "bold" : "normal"
      }; `;
      style += `font-style: ${
        cnkiCustomSettings.value.italic ? "italic" : "normal"
      }; `;
      style += `text-align: ${cnkiCustomSettings.value.alignment}; `;
    } else {
      // 使用默认知网格式
      switch (type) {
        case "title":
          style +=
            "text-align: center; font-size: 24px; font-weight: bold; margin: 20px 0; font-family: KaiTi, SimSun, serif; ";
          break;
        case "section-title":
          style +=
            "text-align: left; font-size: 16px; font-weight: bold; margin: 18px 0; font-family: KaiTi, SimSun, serif; ";
          break;
        case "subsection-title":
          style +=
            "text-align: left; font-size: 14px; font-weight: bold; margin: 16px 0; font-family: KaiTi, SimSun, serif; ";
          break;
        case "subsubsection-title":
          style +=
            "text-align: left; font-size: 12px; font-weight: bold; margin: 14px 0; font-family: KaiTi, SimSun, serif; ";
          break;
        case "author":
          style +=
            "text-align: center; font-size: 14px; font-weight: bold; margin: 10px 0; font-family: SimSun, serif; ";
          break;
        case "affiliation":
          style +=
            "text-align: center; font-size: 12px; margin: 8px 0; font-family: SimSun, serif; ";
          break;
        case "abstract":
          style +=
            "margin: 15px 0; font-size: 12px; font-family: SimSun, serif; text-align: justify; ";
          break;
        case "keywords":
          style +=
            "margin: 10px 0; font-size: 12px; font-family: SimSun, serif; text-align: justify; ";
          break;
        case "content":
          style +=
            "text-indent: 2em; line-height: 1.8; margin: 0 0 15px 0; font-size: 12px; font-family: SimSun, serif; text-align: justify; ";
          break;
        case "quote":
          style +=
            "margin: 15px 0; padding: 10px 15px; border-left: 3px solid #3498db; background: #f9f9f9; font-size: 12px; font-family: SimSun, serif; text-align: justify; ";
          break;
        case "list":
          style +=
            "margin: 10px 0; padding-left: 20px; font-size: 12px; font-family: SimSun, serif; ";
          break;
        case "numbered-list":
          style +=
            "margin: 10px 0; padding-left: 20px; font-size: 12px; font-family: SimSun, serif; ";
          break;
        case "reference":
          style +=
            "margin: 8px 0; text-indent: -2em; padding-left: 2em; font-size: 10.5px; font-family: SimSun, serif; line-height: 1.5; ";
          break;
        default:
          style += "font-family: SimSun, serif; ";
          break;
      }
    }

    switch (type) {
      case "title":
        return `<h1 class="thesis-title" style="${style}">${content}</h1>`;
      case "section-title":
        return `<h2 class="section-title" style="${style}">${content}</h2>`;
      case "subsection-title":
        return `<h3 class="subsection-title" style="${style}">${content}</h3>`;
      case "subsubsection-title":
        return `<h4 class="subsubsection-title" style="${style}">${content}</h4>`;
      case "author":
        return `<p class="author" style="${style}">${content}</p>`;
      case "affiliation":
        return `<p class="affiliation" style="${style}">${content}</p>`;
      case "abstract":
        return `<div class="abstract" style="${style}"><strong>摘要：</strong>${content}</div>`;
      case "keywords":
        return `<div class="keywords" style="${style}"><strong>关键词：</strong>${content}</div>`;
      case "content":
        return `<p class="content" style="${style}">${content}</p>`;
      case "quote":
        return `<blockquote class="quote" style="${style}">${content}</blockquote>`;
      case "list":
        return `<ul class="list" style="${style}"><li style="margin: 5px 0;">${content}</li></ul>`;
      case "numbered-list":
        return `<ol class="numbered-list" style="${style}"><li style="margin: 5px 0;">${content}</li></ol>`;
      case "reference":
        return `<p class="reference" style="${style}">[${
          documentParts.value.filter((p) => p.type === "reference").length + 1
        }] ${content}</p>`;
      default:
        return `<span style="${style}">${content}</span>`;
    }
  } else if (selectedFormat.value.startsWith("user-template-")) {
    // 用户保存的模板格式
    if (
      templateFormat.value &&
      templateFormat.value.types &&
      templateFormat.value.types[type]
    ) {
      // 使用模板中定义的格式
      const templateType = templateFormat.value.types[type];
      let style = "";

      if (templateType.fontSize)
        style += `font-size: ${templateType.fontSize}px; `;
      if (templateType.fontFamily)
        style += `font-family: ${templateType.fontFamily}, serif; `;
      if (templateType.bold !== undefined)
        style += `font-weight: ${templateType.bold ? "bold" : "normal"}; `;
      if (templateType.italic !== undefined)
        style += `font-style: ${templateType.italic ? "italic" : "normal"}; `;
      if (templateType.alignment)
        style += `text-align: ${templateType.alignment}; `;
      if (templateType.lineHeight)
        style += `line-height: ${templateType.lineHeight}; `;
      if (templateType.marginTop)
        style += `margin-top: ${templateType.marginTop}px; `;
      if (templateType.marginBottom)
        style += `margin-bottom: ${templateType.marginBottom}px; `;
      if (templateType.textIndent)
        style += `text-indent: ${templateType.textIndent}em; `;

      // 根据模板定义的标签类型生成HTML
      const tag = templateType.tag || "p";
      return `<${tag} class="template-content" style="${style}">${content}</${tag}>`;
    } else {
      // 如果模板中没有定义该类型，使用默认样式
      return `<span class="template-content">${content}</span>`;
    }
  } else {
    // 自定义格式
    // 查找匹配的自定义文本类型
    const customType = customTextTypes.value.find((t) => t.name === type);

    if (customType) {
      // 构建样式字符串
      let style = "";
      style += `font-size: ${customType.fontSize}px; `;
      style += `font-family: ${customType.fontFamily}, serif; `;
      style += `font-weight: ${customType.bold ? "bold" : "normal"}; `;
      style += `font-style: ${customType.italic ? "italic" : "normal"}; `;
      style += `text-align: ${customType.alignment}; `;
      style += `line-height: ${customType.lineHeight}; `;

      if (customType.marginTop !== undefined) {
        style += `margin-top: ${customType.marginTop}px; `;
      }
      if (customType.marginBottom !== undefined) {
        style += `margin-bottom: ${customType.marginBottom}px; `;
      }

      if (customType.textIndent !== undefined) {
        style += `text-indent: ${customType.textIndent}em; `;
      }

      // 根据文本类型选择合适的HTML标签
      if (
        type.includes("标题") ||
        type.includes("Title") ||
        type.includes("title")
      ) {
        // 判断标题级别
        if (type.includes("一") || type.includes("1")) {
          return `<h1 class="custom-title" style="${style}">${content}</h1>`;
        } else if (type.includes("二") || type.includes("2")) {
          return `<h2 class="custom-title" style="${style}">${content}</h2>`;
        } else if (type.includes("三") || type.includes("3")) {
          return `<h3 class="custom-title" style="${style}">${content}</h3>`;
        } else {
          return `<h2 class="custom-title" style="${style}">${content}</h2>`;
        }
      } else {
        return `<p class="custom-content" style="${style}">${content}</p>`;
      }
    } else {
      // 如果没有找到匹配的自定义类型，使用默认样式
      return `<span>${content}</span>`;
    }
  }
};

// 计算属性：生成完整的HTML内容
const renderedContent = computed(() => {
  return documentParts.value
    .map((part) => generateHTML(part.type, part.content))
    .join("\n");
});

// 添加文本到文档
const addText = () => {
  if (!formatConfirmed.value) {
    alert("请先确认论文格式");
    return;
  }

  if (textInput.value.trim() === "") return;

  if (editingIndex.value !== null) {
    // 更新已存在的项目
    documentParts.value[editingIndex.value] = {
      id: documentParts.value[editingIndex.value].id,
      type: selectedTextType.value,
      content: textInput.value,
      customSettings: showCnkiCustomize.value
        ? { ...cnkiCustomSettings.value }
        : undefined,
    };
    editingIndex.value = null;
  } else {
    // 添加新项目
    documentParts.value.push({
      id: Date.now().toString(),
      type: selectedTextType.value,
      content: textInput.value,
      customSettings: showCnkiCustomize.value
        ? { ...cnkiCustomSettings.value }
        : undefined,
    });
  }

  // 清空输入框
  textInput.value = "";
};

// 清空所有内容
const clearAll = () => {
  documentParts.value = [];
  textInput.value = "";
  editingIndex.value = null;
};

// 编辑文档部分
const editPart = (index: number) => {
  const part = documentParts.value[index];
  textInput.value = part.content;
  selectedTextType.value = part.type;
  editingIndex.value = index;

  // 如果该部分有自定义设置，恢复设置
  if (part.customSettings) {
    showCnkiCustomize.value = true;
    cnkiCustomSettings.value = { ...part.customSettings };
  }
};

// 删除文档部分
const deletePart = (index: number) => {
  if (confirm("确定要删除这个内容吗？")) {
    documentParts.value.splice(index, 1);
    if (editingIndex.value === index) {
      editingIndex.value = null;
      textInput.value = "";
    }
  }
};

// 保存当前模板到后端
const saveCurrentTemplate = async () => {
  if (!templateFormat.value) {
    alert("当前没有模板可以保存");
    return;
  }

  try {
    // 获取模板名称，如果没有则使用默认名称
    const templateName = prompt("请输入模板名称:", "我的论文格式模板");
    if (!templateName) return;

    const templateDescription = prompt("请输入模板描述:", "自定义论文格式模板");

    const response = await saveTemplate({
      name: templateName,
      description: templateDescription || "自定义论文格式模板",
      content: templateFormat.value,
      type: "format",
    });

    if (response.data) {
      alert("模板保存成功！");
      // 重新加载用户模板列表
      loadUserTemplates();
    }
  } catch (error) {
    console.error("保存模板失败:", error);
    alert("模板保存失败，请重试");
  }
};

// 保存当前内容到后端
const saveCurrentContent = async () => {
  if (documentParts.value.length === 0) {
    alert("没有内容可以保存");
    return;
  }

  try {
    // 获取内容标题，如果没有则使用默认标题
    const contentTitle = prompt("请输入内容标题:", "我的论文内容");
    if (!contentTitle) return;

    const contentDescription = prompt("请输入内容描述:", "论文内容片段");

    const response = await saveContent({
      title: contentTitle,
      description: contentDescription || "论文内容片段",
      content: {
        parts: documentParts.value,
        format: selectedFormat.value,
        customTypes: customTextTypes.value,
      },
    });

    if (response.data) {
      alert("内容保存成功！");
    }
  } catch (error) {
    console.error("保存内容失败:", error);
    alert("内容保存失败，请重试");
  }
};

// 加载用户保存的模板
const loadUserTemplate = async () => {
  try {
    const templatesResponse = await getUserTemplates("format");
    const templates = templatesResponse.data?.templates || [];

    if (templates.length === 0) {
      alert("您还没有保存任何模板");
      return;
    }

    // 创建模板选择对话框
    let templateList = "请选择要加载的模板:\n\n";
    templates.forEach((template: any, index: number) => {
      templateList += `${index + 1}. ${template.name} - ${
        template.description || "无描述"
      } (${new Date(template.created_at).toLocaleDateString()})\n`;
    });

    const selection = prompt(templateList + "\n请输入模板编号:");
    if (!selection) return;

    const templateIndex = parseInt(selection) - 1;
    if (
      isNaN(templateIndex) ||
      templateIndex < 0 ||
      templateIndex >= templates.length
    ) {
      alert("无效的模板编号");
      return;
    }

    const selectedTemplate = templates[templateIndex];

    const templateResponse = await getTemplateById(selectedTemplate.id);
    const templateData = templateResponse.data?.template;

    if (templateData) {
      templateFormat.value = templateData.content;
      templateName.value = templateData.name;
      isTemplateLoaded.value = true;
      selectedFormat.value = "template";
      formatConfirmed.value = true;
      alert("模板加载成功！");
    }
  } catch (error) {
    console.error("加载模板失败:", error);
    alert("加载模板失败，请重试");
  }
};

// 加载用户保存的内容
const loadUserContent = async () => {
  try {
    const contentsResponse = await getUserContents();
    const contents = contentsResponse.data?.contents || [];

    if (contents.length === 0) {
      alert("您还没有保存任何内容");
      return;
    }

    // 创建内容选择对话框
    let contentList = "请选择要加载的内容:\n\n";
    contents.forEach((content: any, index: number) => {
      contentList += `${index + 1}. ${content.title} - ${
        content.description || "无描述"
      } (${new Date(content.created_at).toLocaleDateString()})\n`;
    });

    const selection = prompt(contentList + "\n请输入内容编号:");
    if (!selection) return;

    const contentIndex = parseInt(selection) - 1;
    if (
      isNaN(contentIndex) ||
      contentIndex < 0 ||
      contentIndex >= contents.length
    ) {
      alert("无效的内容编号");
      return;
    }

    const selectedContent = contents[contentIndex];

    const contentResponse = await getContentById(selectedContent.id);
    const contentData = contentResponse.data?.content;

    if (contentData) {
      // 恢复内容
      documentParts.value = contentData.content.parts || [];

      // 如果有自定义格式，也恢复它
      if (contentData.content.customTypes) {
        customTextTypes.value = contentData.content.customTypes;
      }

      // 恢复格式选择
      selectedFormat.value = contentData.content.format || "custom";
      formatConfirmed.value = true;

      alert("内容加载成功！");
    }
  } catch (error) {
    console.error("加载内容失败:", error);
    alert("加载内容失败，请重试");
  }
};

// 复制HTML到剪贴板
const copyToClipboard = async () => {
  if (!formatConfirmed.value) {
    alert("请先确认论文格式");
    return;
  }

  try {
    // 生成完整的HTML文档
    const fullHTML = documentParts.value
      .map((part) => generateHTML(part.type, part.content))
      .join("\n");
    await navigator.clipboard.writeText(fullHTML);
    alert("HTML内容已复制到剪贴板!");
  } catch (error) {
    console.error("复制失败:", error);
    // 降级处理
    const textArea = document.createElement("textarea");
    const fullHTML = documentParts.value
      .map((part) => generateHTML(part.type, part.content))
      .join("\n");
    textArea.value = fullHTML;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
    alert("HTML内容已复制到剪贴板!");
  }
};

// 导出为Word文档
const exportToDocx = async () => {
  if (!formatConfirmed.value) {
    alert("请先确认论文格式");
    return;
  }

  // 检查是否已安装docx库
  try {
    // 动态导入docx库
    const docxModule = await import("docx");
    const { Document, Paragraph, TextRun, HeadingLevel, Packer } = docxModule;

    // 创建文档内容
    const paragraphs = documentParts.value.map((part) => {
      if (selectedFormat.value === "cnki") {
        // 知网标准格式
        switch (part.type) {
          case "title":
            return new Paragraph({
              children: [
                new TextRun({
                  text: part.content,
                  bold: true,
                  size: 24 * 2, // docx使用1/2磅单位
                  font: "KaiTi, SimSun",
                }),
              ],
              alignment: "center",
            });

          case "section-title":
            return new Paragraph({
              children: [
                new TextRun({
                  text: part.content,
                  bold: true,
                  size: 16 * 2,
                  font: "KaiTi, SimSun",
                }),
              ],
              heading: HeadingLevel.HEADING_1,
            });

          case "subsection-title":
            return new Paragraph({
              children: [
                new TextRun({
                  text: part.content,
                  bold: true,
                  size: 14 * 2,
                  font: "KaiTi, SimSun",
                }),
              ],
              heading: HeadingLevel.HEADING_2,
            });

          case "subsubsection-title":
            return new Paragraph({
              children: [
                new TextRun({
                  text: part.content,
                  bold: true,
                  size: 12 * 2,
                  font: "KaiTi, SimSun",
                }),
              ],
              heading: HeadingLevel.HEADING_3,
            });

          case "author":
            return new Paragraph({
              children: [
                new TextRun({
                  text: part.content,
                  bold: true,
                  size: 14 * 2,
                  font: "SimSun",
                }),
              ],
              alignment: "center",
            });

          case "affiliation":
            return new Paragraph({
              children: [
                new TextRun({
                  text: part.content,
                  size: 12 * 2,
                  font: "SimSun",
                }),
              ],
              alignment: "center",
            });

          case "abstract":
            return new Paragraph({
              children: [
                new TextRun({
                  text: "摘要：",
                  bold: true,
                  size: 12 * 2,
                  font: "SimSun",
                }),
                new TextRun({
                  text: part.content,
                  size: 12 * 2,
                  font: "SimSun",
                }),
              ],
            });

          case "keywords":
            return new Paragraph({
              children: [
                new TextRun({
                  text: "关键词：",
                  bold: true,
                  size: 12 * 2,
                  font: "SimSun",
                }),
                new TextRun({
                  text: part.content,
                  size: 12 * 2,
                  font: "SimSun",
                }),
              ],
            });

          case "content":
            return new Paragraph({
              children: [
                new TextRun({
                  text: part.content,
                  size: 12 * 2,
                  font: "SimSun",
                }),
              ],
              indent: {
                firstLine: 420, // 首行缩进2字符（420缇）
              },
              spacing: { line: 360 }, // 行距1.8倍
            });

          case "quote":
            return new Paragraph({
              children: [
                new TextRun({
                  text: part.content,
                  size: 12 * 2,
                  font: "SimSun",
                  italics: true,
                }),
              ],
              border: {
                left: {
                  color: "auto",
                  space: 1,
                  style: "single",
                  size: 6,
                },
              },
            });

          case "list":
            return new Paragraph({
              children: [
                new TextRun({
                  text: `• ${part.content}`,
                  size: 12 * 2,
                  font: "SimSun",
                }),
              ],
            });

          case "numbered-list":
            const index =
              documentParts.value
                .filter((p) => p.type === "numbered-list")
                .findIndex((p) => p === part) + 1;
            return new Paragraph({
              children: [
                new TextRun({
                  text: `${index}. ${part.content}`,
                  size: 12 * 2,
                  font: "SimSun",
                }),
              ],
            });

          case "reference":
            const refIndex =
              documentParts.value
                .filter((p) => p.type === "reference")
                .findIndex((p) => p === part) + 1;
            return new Paragraph({
              children: [
                new TextRun({
                  text: `[${refIndex}] ${part.content}`,
                  size: 10.5 * 2,
                  font: "SimSun",
                }),
              ],
              indent: {
                firstLine: -420, // 悬挂缩进
                left: 420, // 左缩进
              },
            });

          default:
            return new Paragraph({
              children: [
                new TextRun({
                  text: part.content,
                  size: 12 * 2,
                  font: "SimSun",
                }),
              ],
            });
        }
      } else {
        // 自定义格式
        // 查找匹配的自定义文本类型
        const customType = customTextTypes.value.find(
          (t) => t.name === part.type
        );

        if (customType) {
          // 创建文本运行
          const textRun = new TextRun({
            text: part.content,
            bold: customType.bold,
            italics: customType.italic,
            size: customType.fontSize * 2,
            font: customType.fontFamily,
          });

          // 创建段落
          const paragraphOptions: any = {
            children: [textRun],
          };

          // 设置对齐方式
          switch (customType.alignment) {
            case "center":
              paragraphOptions.alignment = "center";
              break;
            case "right":
              paragraphOptions.alignment = "right";
              break;
            case "justify":
              paragraphOptions.alignment = "justify";
              break;
            default:
              paragraphOptions.alignment = "left";
              break;
          }

          // 设置缩进
          if (customType.textIndent !== undefined) {
            paragraphOptions.indent = {
              firstLine: customType.textIndent * 420, // 420缇 = 1个字符
            };
          }

          // 设置间距
          paragraphOptions.spacing = {
            before:
              customType.marginTop !== undefined
                ? customType.marginTop * 20
                : 100,
            after:
              customType.marginBottom !== undefined
                ? customType.marginBottom * 20
                : 100,
            line: customType.lineHeight * 240, // 行距
          };

          return new Paragraph(paragraphOptions);
        } else {
          // 如果没有找到匹配的自定义类型，使用默认样式
          return new Paragraph({
            children: [
              new TextRun({
                text: part.content,
                size: 12 * 2,
                font: "SimSun",
              }),
            ],
          });
        }
      }
    });

    // 创建文档
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: paragraphs,
        },
      ],
    });

    // 生成并下载文档
    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download =
      selectedFormat.value === "cnki"
        ? "知网论文格式文档.docx"
        : "自定义论文格式文档.docx";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert("文档已成功导出为Word格式！");
  } catch (error) {
    console.error("导出文档失败:", error);
    alert("导出文档失败，请确保已正确安装docx库");
  }
};

// 返回功能页面
const goBack = () => {
  router.push("/blog/features");
};
</script>

<style scoped>
.thesis-formatter {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
  min-height: calc(100vh - 48px);
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4edf5 100%);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e0e6ed;
}

.header h1 {
  margin: 0;
  text-align: left;
  color: #2c3e50;
  font-size: 28px;
  font-weight: 600;
  background: linear-gradient(90deg, #3498db, #2c3e50);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.back-btn {
  padding: 10px 20px;
  background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  box-shadow: 0 2px 6px rgba(108, 117, 125, 0.3);
}

.back-btn:hover {
  background: linear-gradient(135deg, #5a6268 0%, #495057 100%);
  box-shadow: 0 4px 12px rgba(108, 117, 125, 0.4);
}

.format-selection {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.format-selector {
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  background: white;
  padding: 16px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.format-select {
  padding: 12px 16px;
  border: 2px solid #e0e6ed;
  border-radius: 8px;
  font-size: 15px;
  background-color: white;
  color: #2c3e50;
  transition: all 0.3s ease;
  min-width: 240px;
}

.format-select:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
}

.format-config {
  background: white;
  border: none;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}

.format-config h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #2c3e50;
  font-size: 20px;
  font-weight: 600;
  border-bottom: 2px solid #f0f4f8;
  padding-bottom: 12px;
}

.custom-text-types h4 {
  margin: 0 0 20px 0;
  color: #34495e;
  font-size: 18px;
  font-weight: 500;
}

.text-type-item {
  border: none;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
  background-color: #f8fafc;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
  border: 1px solid #eef2f7;
}

/* 优化占位符样式 */
.type-name-input::placeholder,
.text-input::placeholder {
  color: #a0aec0;
  font-style: italic;
  opacity: 0.7;
}

/* 优化提示文本样式 */
[type="text"],
[type="number"],
select,
textarea {
  transition: all 0.3s ease;
}

[type="text"]:focus,
[type="number"]:focus,
select:focus,
textarea:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
}

.text-type-item:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.text-type-inputs {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.type-name-input {
  flex: 1;
  padding: 10px 14px;
  border: 2px solid #e0e6ed;
  border-radius: 8px;
  font-size: 15px;
  background-color: white;
  color: #2c3e50;
  transition: all 0.3s ease;
  min-width: 200px;
}

.type-name-input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
}

.remove-type-btn {
  padding: 8px 16px;
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  box-shadow: 0 2px 6px rgba(220, 53, 69, 0.3);
}

.remove-type-btn:hover {
  background: linear-gradient(135deg, #c82333 0%, #bd2130 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.4);
}

.format-settings {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.config-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.config-section label {
  font-weight: 600;
  font-size: 14px;
  color: #34495e;
  margin-bottom: 4px;
}

.config-input,
.config-select {
  padding: 10px 14px;
  border: 2px solid #e0e6ed;
  border-radius: 8px;
  font-size: 14px;
  background-color: white;
  color: #2c3e50;
  transition: all 0.3s ease;
  width: 100%;
}

.config-input:focus,
.config-select:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
}

.config-checkbox {
  width: auto;
  align-self: flex-start;
  transform: scale(1.2);
  margin-top: 4px;
}

.add-type-section {
  margin-top: 20px;
  text-align: center;
}

.add-type-btn {
  padding: 12px 24px;
  background: linear-gradient(135deg, #28a745 0%, #218838 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  font-size: 15px;
  box-shadow: 0 2px 8px rgba(40, 167, 69, 0.3);
}

.save-custom-format-btn {
  padding: 12px 24px;
  background: linear-gradient(135deg, #007bff 0%, #0062cc 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  font-size: 15px;
  box-shadow: 0 2px 8px rgba(0, 123, 255, 0.3);
}

.save-custom-format-btn:hover {
  background: linear-gradient(135deg, #0062cc 0%, #0056b3 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 123, 255, 0.4);
}

.add-type-btn:hover {
  background: linear-gradient(135deg, #218838 0%, #1e7e34 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(40, 167, 69, 0.4);
}

.confirm-section {
  text-align: center;
  margin-top: 24px;
}

.confirm-btn {
  padding: 14px 32px;
  background: linear-gradient(135deg, #007bff 0%, #0069d9 100%);
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
}

.confirm-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #0069d9 0%, #005cbf 100%);
  box-shadow: 0 6px 18px rgba(0, 123, 255, 0.4);
}

.confirm-btn:disabled {
  background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.editor-container {
  display: flex;
  flex: 1;
  gap: 24px;
  height: 100%;
}

.html-preview {
  flex: 1;
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  padding: 20px;
  background-color: white;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  border: 1px solid #eef2f7;
  overflow: hidden;
}

.html-preview h2 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #2c3e50;
  font-size: 20px;
  font-weight: 600;
  border-bottom: 2px solid #f0f4f8;
  padding-bottom: 12px;
}

.preview-content {
  flex: 1;
  overflow-y: auto;
  background-color: #ffffff;
  border-radius: 8px;
  padding: 20px;
  white-space: normal;
  border: 1px solid #f0f4f8;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.03);
}

.preview-item {
  position: relative;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #eef2f7;
  border-radius: 8px;
  background-color: #f8fafc;
}

.preview-item:hover {
  background-color: #edf2f7;
}

.preview-actions {
  margin-top: 8px;
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.edit-btn,
.delete-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s ease;
}

.edit-btn {
  background-color: #ffc107;
  color: #212529;
}

.edit-btn:hover {
  background-color: #e0a800;
}

.delete-btn {
  background-color: #dc3545;
  color: white;
}

.delete-btn:hover {
  background-color: #c82333;
}

.cnki-customize-section {
  margin-top: 15px;
  padding: 15px;
  border: 1px solid #eef2f7;
  border-radius: 8px;
  background-color: #f8fafc;
}

.cnki-customize-checkbox {
  margin-right: 8px;
}

.cnki-customize-options {
  margin-top: 10px;
  padding-top: 15px;
  border-top: 1px solid #eef2f7;
}

/* 知网论文格式样式 */
.thesis-title {
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  margin: 20px 0;
  font-family: KaiTi, SimSun, serif;
  color: #2c3e50;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.section-title {
  text-align: left;
  font-size: 16px;
  font-weight: bold;
  margin: 18px 0;
  font-family: KaiTi, SimSun, serif;
  color: #34495e;
  border-left: 4px solid #3498db;
  padding-left: 12px;
}

.subsection-title {
  text-align: left;
  font-size: 14px;
  font-weight: bold;
  margin: 16px 0;
  font-family: KaiTi, SimSun, serif;
  color: #34495e;
  border-bottom: 2px solid #bdc3c7;
  padding-bottom: 6px;
}

.subsubsection-title {
  text-align: left;
  font-size: 12px;
  font-weight: bold;
  margin: 14px 0;
  font-family: KaiTi, SimSun, serif;
  color: #34495e;
  border-left: 2px solid #95a5a6;
  padding-left: 8px;
}

.author {
  text-align: center;
  font-size: 14px;
  font-weight: bold;
  margin: 10px 0;
  font-family: SimSun, serif;
  color: #2c3e50;
}

.affiliation {
  text-align: center;
  font-size: 12px;
  margin: 8px 0;
  font-family: SimSun, serif;
  color: #7f8c8d;
}

.abstract,
.keywords {
  margin: 10px 0;
  font-size: 12px;
  font-family: SimSun, serif;
  text-align: justify;
  line-height: 1.6;
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 6px;
}

.abstract strong,
.keywords strong {
  color: #2c3e50;
}

.content {
  text-indent: 2em;
  line-height: 1.8;
  margin: 0 0 15px 0;
  font-size: 12px;
  font-family: SimSun, serif;
  text-align: justify;
  color: #2c3e50;
}

.quote {
  margin: 15px 0;
  padding: 15px 20px;
  border-left: 4px solid #3498db;
  background: #f8f9fa;
  font-size: 12px;
  font-family: SimSun, serif;
  text-align: justify;
  border-radius: 0 8px 8px 0;
  background: linear-gradient(to right, #f0f7ff 0%, #f8f9fa 100%);
}

.list,
.numbered-list {
  margin: 10px 0;
  padding-left: 20px;
  font-size: 12px;
  font-family: SimSun, serif;
}

.list li,
.numbered-list li {
  margin: 8px 0;
  line-height: 1.5;
}

.reference {
  margin: 8px 0;
  text-indent: -2em;
  padding-left: 2em;
  font-size: 10.5px;
  font-family: SimSun, serif;
  line-height: 1.5;
  background-color: #f8f9fa;
  padding: 8px 12px;
  border-radius: 4px;
}

.input-panel {
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  padding: 20px;
  background-color: white;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  border: 1px solid #eef2f7;
  box-sizing: border-box;
}

.input-panel h2 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #2c3e50;
  font-size: 20px;
  font-weight: 600;
  border-bottom: 2px solid #f0f4f8;
  padding-bottom: 12px;
}

.input-section {
  margin-bottom: 20px;
  width: 100%;
  box-sizing: border-box;
}

.input-section label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  font-size: 14px;
  color: #34495e;
}

.text-type-select {
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e6ed;
  border-radius: 8px;
  font-size: 15px;
  background-color: white;
  color: #2c3e50;
  transition: all 0.3s ease;
  box-sizing: border-box;
  max-width: 100%;
}

.text-type-select:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
}

.text-input {
  width: 100%;
  padding: 14px;
  border: 2px solid #e0e6ed;
  border-radius: 8px;
  font-family: monospace;
  resize: vertical;
  font-size: 15px;
  background-color: white;
  color: #2c3e50;
  transition: all 0.3s ease;
  min-height: 120px;
  box-sizing: border-box;
  max-width: 100%;
}

.text-input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
}

.input-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: auto;
}

.action-group {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.input-actions button {
  padding: 12px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 15px;
  transition: all 0.3s ease;
  font-weight: 500;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.add-btn {
  background: linear-gradient(135deg, #28a745 0%, #218838 100%);
  color: white;
}

.add-btn:hover {
  background: linear-gradient(135deg, #218838 0%, #1e7e34 100%);
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
}

.clear-btn {
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
  color: white;
}

.clear-btn:hover {
  background: linear-gradient(135deg, #c82333 0%, #bd2130 100%);
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
}

.copy-btn {
  background: linear-gradient(135deg, #007bff 0%, #0069d9 100%);
  color: white;
}

.copy-btn:hover {
  background: linear-gradient(135deg, #0069d9 0%, #005cbf 100%);
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
}

.export-btn {
  background: linear-gradient(135deg, #6f42c1 0%, #5a32a3 100%);
  color: white;
}

.export-btn:hover {
  background: linear-gradient(135deg, #5a32a3 0%, #522e92 100%);
  box-shadow: 0 4px 12px rgba(111, 66, 193, 0.3);
}

.reset-btn {
  background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
  color: white;
}

.reset-btn:hover {
  background: linear-gradient(135deg, #5a6268 0%, #495057 100%);
  box-shadow: 0 4px 12px rgba(108, 117, 125, 0.3);
}

@media (max-width: 1200px) {
  .editor-container {
    flex-direction: column;
    height: auto;
  }

  .input-panel {
    width: auto;
    margin-top: 24px;
  }

  .format-settings {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .thesis-formatter {
    padding: 16px;
    min-height: calc(100vh - 32px);
  }

  .header {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .header h1 {
    font-size: 24px;
  }

  .input-panel {
    width: 100%;
  }

  .format-selector {
    flex-direction: column;
    align-items: stretch;
  }

  .format-select {
    min-width: auto;
  }

  .text-type-inputs {
    flex-direction: column;
    align-items: stretch;
  }

  .type-name-input {
    min-width: auto;
  }
}

.preview-item {
  position: relative;
}

.preview-actions {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 8px;
  transition: opacity 0.2s ease;
}

.edit-btn,
.delete-btn {
  padding: 4px 8px;
  font-size: 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  opacity: 0.8;
}

.edit-btn {
  background-color: #007bff;
  color: white;
}

.delete-btn {
  background-color: #dc3545;
  color: white;
}

.edit-btn:hover,
.delete-btn:hover {
  opacity: 1;
  transform: scale(1.05);
}

.save-template-btn {
  background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
  color: white;
}

.save-template-btn:hover {
  background: linear-gradient(135deg, #138496 0%, #117a8b 100%);
  box-shadow: 0 4px 12px rgba(23, 162, 184, 0.3);
}

.save-content-btn {
  background: linear-gradient(135deg, #28a745 0%, #218838 100%);
  color: white;
}

.save-content-btn:hover {
  background: linear-gradient(135deg, #218838 0%, #1e7e34 100%);
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
}

.load-template-btn {
  background: linear-gradient(135deg, #ffc107 0%, #e0a800 100%);
  color: #212529;
}

.load-template-btn:hover {
  background: linear-gradient(135deg, #e0a800 0%, #d39e00 100%);
  box-shadow: 0 4px 12px rgba(255, 193, 7, 0.3);
}

.load-content-btn {
  background: linear-gradient(135deg, #6f42c1 0%, #6337a9 100%);
  color: white;
}

.load-content-btn:hover {
  background: linear-gradient(135deg, #6337a9 0%, #582fc0 100%);
  box-shadow: 0 4px 12px rgba(111, 66, 193, 0.3);
}
</style>