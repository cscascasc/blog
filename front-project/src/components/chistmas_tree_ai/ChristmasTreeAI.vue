<template>
  <div class="christmas-tree-ai-container">
    <!-- 返回按钮 -->
    <div class="back-button-container">
      <button class="back-button" @click="goBack">
        <span class="back-arrow">←</span> 返回功能页面
      </button>
    </div>

    <!-- 1. SYSTEM LOADER & PERMISSION -->
    <div
      v-if="showSystemLoader"
      id="system-loader"
      class="fullscreen-overlay"
      style="z-index: 200"
    >
      <div class="spinner" id="sys-spinner"></div>
      <div class="loader-text" id="sys-status">{{ systemStatus }}</div>
      <!-- 手势库加载进度条 -->
      <div v-if="showLoadingProgress" class="progress-container">
        <div class="progress-label">Loading Hand Gesture Library...</div>
        <div class="progress-bar">
          <div
            class="progress-fill"
            :style="{ width: loadingProgress + '%' }"
          ></div>
        </div>
        <div class="progress-percent">{{ Math.round(loadingProgress) }}%</div>
      </div>
      <button
        v-if="showInitButton"
        id="init-btn"
        class="action-btn"
        @click="requestPermissionAndNext"
      >
        Initialize & Allow Camera
      </button>
    </div>

    <!-- 2. SETUP SCREEN -->
    <div
      v-if="showSetupScreen"
      id="setup-screen"
      class="fullscreen-overlay"
      style="z-index: 150"
    >
      <div class="setup-container">
        <h2
          style="font-family: 'Cinzel'; margin-bottom: 30px; font-weight: 400"
        >
          Holiday Setup
        </h2>

        <div class="setup-group">
          <label class="setup-label">Greeting Message</label>
          <input
            type="text"
            id="greeting-input"
            class="setup-input"
            placeholder="Merry Christmas"
            v-model="greetingMessage"
            maxlength="25"
          />
        </div>

        <div class="setup-group">
          <label class="setup-label">Add Photos (Multiple)</label>
          <div class="file-input-wrapper">
            <button
              class="file-btn"
              :class="{ selected: photoSelected }"
              id="photo-btn"
              @click="triggerPhotoInput"
            >
              Select Images
            </button>
            <input
              type="file"
              id="photo-input"
              multiple
              accept="image/*"
              style="display: none"
              ref="photoInputRef"
              @change="handleSetupFiles"
            />
          </div>
        </div>

        <div class="setup-group">
          <label class="setup-label">Background Music</label>
          <div class="file-input-wrapper">
            <button
              class="file-btn"
              :class="{ selected: musicSelected }"
              id="music-btn"
              @click="triggerMusicInput"
            >
              Select Audio
            </button>
            <input
              type="file"
              id="music-input"
              accept="audio/*"
              style="display: none"
              ref="musicInputRef"
              @change="handleMusicFile"
            />
          </div>
        </div>

        <button class="action-btn" @click="finishSetupAndReveal">
          Start Magic
        </button>
      </div>
    </div>

    <!-- MAIN SCENE -->
    <div
      v-show="!showSystemLoader && !showSetupScreen"
      id="canvas-container"
    ></div>
    <canvas
      v-show="!showSystemLoader && !showSetupScreen"
      id="fireworks-canvas"
    ></canvas>

    <div v-show="!showSystemLoader && !showSetupScreen" id="ui-layer">
      <h1 id="main-title">{{ greetingMessage }}</h1>
      <!-- 手势状态显示 -->
      <div id="hand-status" v-if="isCameraReady">
        <div class="status-item">Mode: {{ STATE.mode }}</div>
        <div class="status-item">Hand Detected: {{ STATE.hand.detected }}</div>
        <div class="status-item" v-if="STATE.hand.detected">
          Avg Distance: {{ avgDistance?.toFixed(3) }}
        </div>
        <div class="status-item" v-if="STATE.hand.detected">
          Pinch Distance: {{ pinchDistance?.toFixed(3) }}
        </div>
      </div>
    </div>

    <!-- WEBCAM -->
    <div v-show="!showSystemLoader && !showSetupScreen" id="webcam-wrapper">
      <video id="webcam" autoplay playsinline style="display: none"></video>
      <canvas id="webcam-preview"></canvas>
      <!-- 摄像头预览显示 -->
      <div v-if="isCameraReady" id="camera-preview-container">
        <div class="camera-preview-label">Camera Preview</div>
        <div class="camera-preview-box">
          <video id="camera-display" autoplay playsinline muted></video>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from "vue";
import { useRouter } from "vue-router";

// 响应式数据
const showSystemLoader = ref(true);
const showSetupScreen = ref(false);
const systemStatus = ref("Preloading 3D Assets...");
const showInitButton = ref(true);
const showLoadingProgress = ref(false);
const loadingProgress = ref(0);
const greetingMessage = ref("Merry Christmas");
const photoSelected = ref(false);
const musicSelected = ref(false);

// 文件输入引用
const photoInputRef = ref<HTMLInputElement | null>(null);
const musicInputRef = ref<HTMLInputElement | null>(null);

// 用户数据
const userPhotos = ref<any[]>([]);
const userAudio = ref<File | null>(null);
const isCameraReady = ref(false);
const globalStream = ref<MediaStream | null>(null);

// 手势状态数据
const avgDistance = ref<number | null>(null);
const pinchDistance = ref<number | null>(null);

// 状态管理
const STATE = ref({
  mode: "TREE",
  focusTarget: null,
  hand: { detected: false, x: 0, y: 0 },
  rotation: { x: 0, y: 0 },
  photoIndex: -1,
  hasExpandedOnce: false,
  interactionEnabled: false,
  exitFocusAttempt: 0,
});

// 手势历史记录，用于稳定性优化
const gestureHistory = {
  pinch: [],
  fist: [],
  open: [],
  maxHistory: 8, // 保存最近8次检测结果，增加稳定性
};

// Three.js 和 fireworks 相关变量
let scene: any, camera: any, renderer: any, composer: any, mainGroup: any;
let particleSystem: any[] = [];
let snowSystem: any;
let handLandmarker: any, video: any, webcamCanvas: any, webcamCtx: any;
let raycaster: any, mouse: any;
let clock: any;

// 配置
const CONFIG = {
  colors: {
    bg: 0x02040c,
    gold: 0xffd966,
    green: 0x03180a,
    red: 0x990000,
  },
  particles: {
    count: 1600,
    treeHeight: 24,
    treeRadius: 8.5,
  },
  snow: {
    count: 1200,
    speed: 3.5,
  },
  camera: {
    z: 50,
  },
};

// fireworks 相关变量
let particles: any[] = [];
let smokes: any[] = [];
let fwCanvas: HTMLCanvasElement, fwCtx: CanvasRenderingContext2D;
let fwWidth: number, fwHeight: number, fwScale: number;

// 获取路由实例
const router = useRouter();

// 返回功能页面
const goBack = () => {
  router.push("/blog/features");
};

// 方法定义
const requestPermissionAndNext = async () => {
  const status = document.getElementById("sys-status") as HTMLElement;
  const btn = document.getElementById("init-btn") as HTMLElement;
  const spinner = document.getElementById("sys-spinner") as HTMLElement;

  btn.style.display = "none";
  spinner.style.display = "block";
  status.innerText = "Requesting Camera Access...";

  try {
    // 检查浏览器是否支持getUserMedia API
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error("浏览器不支持摄像头访问");
    }

    // 保持流开启！
    globalStream.value = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: "user", // 优先使用前置摄像头
      },
    });
    isCameraReady.value = true;
    status.innerText = "Camera Access Granted!";

    // 初始化MediaPipe逻辑
    if ((window as any).initMediaPipeModule) {
      (window as any).initMediaPipeModule(globalStream.value);
    }
  } catch (e) {
    console.error("Camera error:", e);
    isCameraReady.value = false;
    if (e instanceof Error) {
      status.innerText = `Camera access failed: ${e.message}. Mouse control enabled.`;
    } else {
      status.innerText = "Camera access failed. Mouse control enabled.";
    }
  }

  // 过渡到设置
  setTimeout(() => {
    showSystemLoader.value = false;
    showSetupScreen.value = true;
  }, 800);
};

const triggerPhotoInput = () => {
  if (photoInputRef.value) {
    photoInputRef.value.click();
  }
};

const triggerMusicInput = () => {
  if (musicInputRef.value) {
    musicInputRef.value.click();
  }
};

const handleSetupFiles = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const btn = document.getElementById("photo-btn") as HTMLElement;

  if (input.files && input.files.length > 0) {
    photoSelected.value = true;
    btn.classList.add("selected");
    btn.innerText = `${input.files.length} File(s) Selected`;

    userPhotos.value = [];
    Array.from(input.files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target?.result as string;
        img.onload = () => {
          userPhotos.value.push({
            src: e.target?.result,
            aspect: img.width / img.height,
          });
        };
      };
      reader.readAsDataURL(file);
    });
  }
};

const handleMusicFile = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const btn = document.getElementById("music-btn") as HTMLElement;

  if (input.files && input.files.length > 0) {
    userAudio.value = input.files[0];
    musicSelected.value = true;
    btn.classList.add("selected");
    btn.innerText = "Audio Selected";
  }
};

const finishSetupAndReveal = () => {
  // 1. 更新标题
  // 2. 注入照片到运行场景
  if (userPhotos.value.length > 0 && (window as any).addPhotosToRunningScene) {
    (window as any).addPhotosToRunningScene(userPhotos.value);
  }

  // 3. 播放音频
  if (userAudio.value) {
    const audioUrl = URL.createObjectURL(userAudio.value);
    const audio = new Audio(audioUrl);
    audio.loop = true;
    audio.volume = 0.5;
    audio.play().catch((e) => console.log("Audio play failed:", e));
  }

  // 4. 显示
  const setupScreen = document.getElementById("setup-screen") as HTMLElement;
  setupScreen.style.opacity = "0";
  setTimeout(() => {
    showSetupScreen.value = false;
    // 激活交互逻辑
    if ((window as any).activateInteraction) {
      (window as any).activateInteraction();
    }
    // 如果启用则显示摄像头框
    if (isCameraReady.value) {
      const webcamWrapper = document.getElementById(
        "webcam-wrapper"
      ) as HTMLElement;
      if (webcamWrapper) {
        webcamWrapper.style.opacity = "0.5";
      }
    }
  }, 800);
};

// 重新初始化MediaPipe库
const reinitializeMediaPipe = async () => {
  // 如果已有实例，先清理
  if (handLandmarker) {
    try {
      handLandmarker.close();
    } catch (e) {
      console.warn("Error closing handLandmarker:", e);
    }
    handLandmarker = null;
  }

  // 重新加载MediaPipe模块
  const visionModule = await import("@mediapipe/tasks-vision");
  (window as any).FilesetResolver = visionModule.FilesetResolver;
  (window as any).HandLandmarker = visionModule.HandLandmarker;
};

// fireworks 相关类和函数
const random = (min: number, max: number) => Math.random() * (max - min) + min;
const SPEED_MOD = 0.7;

class Smoke {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  growth: number;
  life: number;
  maxLife: number;
  alphaStart: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.vx = random(-0.25, 0.25) * fwScale * SPEED_MOD;
    this.vy = random(-0.15, 0.15) * fwScale * SPEED_MOD;
    this.size = random(20, 45) * fwScale;
    this.growth = random(0.15, 0.3) * fwScale * SPEED_MOD;
    this.life = random(60, 100) / SPEED_MOD;
    this.maxLife = this.life;
    this.alphaStart = random(0.15, 0.3);
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.size += this.growth;
    this.life--;
    return this.life > 0;
  }

  draw() {
    const progress = this.life / this.maxLife;
    const currentAlpha = this.alphaStart * Math.pow(progress, 2.0);
    if (currentAlpha > 0.005) {
      fwCtx.save();
      fwCtx.globalCompositeOperation = "source-over";
      fwCtx.globalAlpha = currentAlpha;
      const drawSize = this.size * 2;
      fwCtx.drawImage(
        (window as any).smokeCanvas,
        this.x - drawSize / 2,
        this.y - drawSize / 2,
        drawSize,
        drawSize
      );
      fwCtx.restore();
    }
  }
}

class Spark {
  x: number;
  y: number;
  isGlitter: boolean;
  vx: number;
  vy: number;
  friction: number;
  gravity: number;
  life: number;
  maxLife: number;
  size: number;
  flickerSpeed: number;
  flickerOffset: number;
  color: string;

  constructor(x: number, y: number, vx: number, vy: number, isGlitter = false) {
    this.x = x;
    this.y = y;
    this.isGlitter = isGlitter;
    if (isGlitter) {
      this.vx = (vx * 0.1 + random(-0.5, 0.5) * fwScale) * SPEED_MOD;
      this.vy = (vy * 0.1 + random(-0.5, 0.5) * fwScale) * SPEED_MOD;
      this.friction = 0.92;
      this.gravity = 0.015 * fwScale * SPEED_MOD;
      this.life = random(60, 100) / SPEED_MOD;
      this.maxLife = this.life;
      this.size = random(1, 2.5) * fwScale;
      this.flickerSpeed = random(0.3, 0.6) * SPEED_MOD;
      this.color = "rgb(255, 255, 200)";
    } else {
      this.vx = (vx * 0.3 + random(-1.5, 1.5) * fwScale) * SPEED_MOD;
      this.vy = (vy * 0.3 + random(-1.5, 1.5) * fwScale) * SPEED_MOD;
      this.friction = 0.96;
      this.gravity = 0.06 * fwScale * SPEED_MOD;
      this.life = random(40, 80) / SPEED_MOD;
      this.maxLife = this.life;
      this.size = random(1, 3) * fwScale;
      this.flickerSpeed = random(0.1, 0.3) * SPEED_MOD;
      // 随机颜色，更精细化
      const colors = [
        "rgb(255, 200, 100)",
        "rgb(255, 150, 50)",
        "rgb(255, 100, 0)",
        "rgb(255, 220, 150)",
        "rgb(255, 180, 80)",
      ];
      this.color = colors[Math.floor(Math.random() * colors.length)];
    }
    this.flickerOffset = random(0, 100);
  }

  update() {
    this.vx *= this.friction;
    this.vy *= this.friction;
    this.vy += this.gravity;
    this.x += this.vx;
    this.y += this.vy;
    this.life -= 1;
    return this.life > 0;
  }

  draw() {
    const flicker = Math.abs(
      Math.sin(this.life * this.flickerSpeed + this.flickerOffset)
    );
    const baseAlpha = this.life / this.maxLife;
    let finalAlpha;
    if (this.isGlitter) {
      finalAlpha = baseAlpha * (0.3 + flicker * 0.7);
    } else {
      finalAlpha = baseAlpha * (0.3 + flicker * 0.7);
    }

    // 使用预设的颜色
    const colorMatch = this.color.match(/rgb\((\d+), (\d+), (\d+)\)/);
    if (colorMatch) {
      const r = parseInt(colorMatch[1]);
      const g = parseInt(colorMatch[2]);
      const b = parseInt(colorMatch[3]);
      fwCtx.fillStyle = `rgba(${r}, ${g}, ${b}, ${finalAlpha})`;
    } else {
      fwCtx.fillStyle = `rgba(255, 200, 100, ${finalAlpha})`;
    }

    fwCtx.beginPath();
    // 更精细化的粒子 - 使用渐变效果
    const gradient = fwCtx.createRadialGradient(
      this.x,
      this.y,
      0,
      this.x,
      this.y,
      this.size
    );
    const colorMatch2 = this.color.match(/rgb\((\d+), (\d+), (\d+)\)/);
    if (colorMatch2) {
      const r = parseInt(colorMatch2[1]);
      const g = parseInt(colorMatch2[2]);
      const b = parseInt(colorMatch2[3]);
      gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${finalAlpha})`);
      gradient.addColorStop(0.8, `rgba(${r}, ${g}, ${b}, ${finalAlpha * 0.5})`);
      gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
    } else {
      gradient.addColorStop(0, `rgba(255, 200, 100, ${finalAlpha})`);
      gradient.addColorStop(0.8, `rgba(255, 200, 100, ${finalAlpha * 0.5})`);
      gradient.addColorStop(1, `rgba(255, 200, 100, 0)`);
    }
    fwCtx.fillStyle = gradient;
    fwCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    fwCtx.fill();
  }
}

class WillowParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  friction: number;
  gravity: number;
  life: number;
  maxLife: number;
  trail: any[];
  maxTrail: number;
  colorType: string;
  depthScale: number;
  width: number;

  constructor(
    x: number,
    y: number,
    angle: number,
    speed: number,
    colorType: string,
    depthScale: number
  ) {
    this.x = x;
    this.y = y;
    this.vx = Math.cos(angle) * speed * SPEED_MOD;
    this.vy = Math.sin(angle) * speed * SPEED_MOD;
    this.friction = 0.94;
    this.gravity = 0.07 * fwScale * SPEED_MOD;
    this.life = random(180, 250) / SPEED_MOD;
    this.maxLife = this.life;
    this.trail = [];
    this.maxTrail = 20;
    this.colorType = colorType;
    this.depthScale = depthScale;
    this.width = (colorType === "gold" ? 3.0 : 2.0) * fwScale * depthScale;
  }

  update() {
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > this.maxTrail) this.trail.shift();
    this.vx *= this.friction;
    this.vy *= this.friction;
    this.vy += this.gravity;
    this.x += this.vx;
    this.y += this.vy;
    this.life--;
    if (this.life % 8 === 0) smokes.push(new Smoke(this.x, this.y));
    return this.life > 0;
  }

  draw() {
    if (this.trail.length < 2) return;
    const progress = this.life / this.maxLife;
    const alpha = Math.min(1, progress * 3);
    fwCtx.beginPath();
    fwCtx.moveTo(this.trail[0].x, this.trail[0].y);
    for (let i = 1; i < this.trail.length; i++)
      fwCtx.lineTo(this.trail[i].x, this.trail[i].y);
    fwCtx.lineTo(this.x, this.y);
    fwCtx.lineCap = "round";
    fwCtx.lineWidth = this.width * alpha;
    let strokeStyle = `rgba(255, 240, 150, ${alpha})`;
    if (this.colorType === "red") strokeStyle = `rgba(255, 80, 80, ${alpha})`;
    else if (this.colorType === "blue")
      strokeStyle = `rgba(80, 180, 255, ${alpha})`;
    fwCtx.strokeStyle = strokeStyle;
    fwCtx.stroke();
    if (progress > 0.05) {
      const s = this.width * 2.5;
      fwCtx.drawImage(
        (window as any).glowCanvas,
        this.x - s / 2,
        this.y - s / 2,
        s,
        s
      );
    }
  }
}

class Shell {
  x: number;
  y: number;
  targetY: number;
  type: string;
  depthScale: number;
  vx: number;
  vy: number;
  gravity: number;
  isDead: boolean;
  maxLife: number;

  constructor(
    x: number,
    y: number,
    targetX: number,
    targetY: number,
    type: string,
    depthScale: number
  ) {
    this.x = x;
    this.y = y;
    this.targetY = targetY;
    this.type = type;
    this.depthScale = depthScale;
    const g = 0.15 * fwScale * SPEED_MOD;
    const dy = y - targetY;
    const vy = Math.sqrt(2 * g * dy);
    const t = vy / g;
    const dx = targetX - x;
    const vx = dx / t;
    this.vx = vx;
    this.vy = -vy;
    this.gravity = g;
    this.isDead = false;
    this.maxLife = 0;
  }

  update() {
    this.vy += this.gravity;
    this.x += this.vx;
    this.y += this.vy;
    if (Math.random() > 0.7) smokes.push(new Smoke(this.x, this.y));
    if (this.vy >= 0) {
      this.isDead = true;
      if (this.type === "willow")
        this.explodeWillow(this.x, this.y, this.depthScale);
      else if (this.type === "comet") this.explodeComet(this.x, this.y);
      for (let i = 0; i < 6; i++)
        smokes.push(
          new Smoke(this.x + random(-10, 10), this.y + random(-10, 10))
        );
    }
    return !this.isDead;
  }

  explodeWillow(x: number, y: number, depthScale: number) {
    const count = 80;
    const colors = ["gold", "red", "blue"];
    for (let i = 0; i < count; i++) {
      const angle = random(0, Math.PI * 2);
      const speed = random(5, 22) * fwScale * depthScale;
      const color = colors[Math.floor(Math.random() * colors.length)];
      particles.push(new WillowParticle(x, y, angle, speed, color, depthScale));
    }
  }

  explodeComet(x: number, y: number) {
    for (let k = 0; k < 15; k++) {
      const ang = random(0, Math.PI * 2);
      const spd = random(2, 8) * fwScale;
      particles.push(
        new Spark(x, y, Math.cos(ang) * spd, Math.sin(ang) * spd, true)
      );
    }
  }

  draw() {
    const size = 6 * fwScale * this.depthScale;
    fwCtx.drawImage(
      (window as any).glowCanvas,
      this.x - size,
      this.y - size,
      size * 2,
      size * 2
    );
    fwCtx.beginPath();
    fwCtx.moveTo(this.x, this.y);
    fwCtx.lineTo(this.x - this.vx * 2.5, this.y - this.vy * 2.5);
    fwCtx.lineCap = "round";
    fwCtx.strokeStyle = "rgba(255, 200, 100, 0.3)";
    fwCtx.lineWidth = 8 * fwScale;
    fwCtx.stroke();
    fwCtx.beginPath();
    fwCtx.moveTo(this.x, this.y);
    fwCtx.lineTo(this.x - this.vx * 2.5, this.y - this.vy * 2.5);
    fwCtx.strokeStyle = "rgba(255, 255, 220, 0.95)";
    fwCtx.lineWidth = 3 * fwScale;
    fwCtx.stroke();
  }
}

// fireworks 相关函数
const resizeFireworks = () => {
  fwWidth = fwCanvas.width = window.innerWidth;
  fwHeight = fwCanvas.height = window.innerHeight;
  fwScale = Math.min(fwWidth, fwHeight) / 900;
};

const triggerChapter3Fireworks = () => {
  const cx = fwWidth / 2;
  const targetBaseY = fwHeight * 0.25;
  const spreadW = fwWidth * 0.6;
  const startX = cx - spreadW / 2;
  const stepX = spreadW / 4;

  for (let i = 0; i < 5; i++) {
    const targetX = startX + stepX * i;
    const targetY = targetBaseY + random(-50, 50) * fwScale;
    const depth = random(0.8, 1.2);
    setTimeout(() => {
      particles.push(
        new Shell(cx, fwHeight, targetX, targetY, "willow", depth)
      );
    }, i * 200);
  }

  setTimeout(() => {
    const groundY = fwHeight;
    for (let i = 0; i < 6; i++) {
      const x =
        i < 3
          ? fwWidth * 0.15 + i * 30 * fwScale
          : fwWidth * 0.85 - (i - 3) * 30 * fwScale;
      const tx = x + (i < 3 ? 50 : -50) * fwScale;
      setTimeout(() => {
        particles.push(new Shell(x, groundY, tx, fwHeight * 0.6, "comet", 0.8));
      }, i * 150);
    }
  }, 1200);

  setTimeout(() => {
    for (let i = 0; i < 3; i++) {
      const x = cx + (i - 1) * 200 * fwScale;
      setTimeout(() => {
        particles.push(
          new Shell(x, fwHeight, x, fwHeight * 0.3, "willow", 1.0)
        );
      }, i * 300);
    }
  }, 2000);
};

// Particle 类
class Particle {
  mesh: any;
  type: string;
  isDust: boolean;
  baseScale: number;
  posTree: any;
  posScatter: any;
  spinSpeed: any;

  constructor(mesh: any, type: string, isDust: boolean) {
    this.mesh = mesh;
    this.type = type;
    this.isDust = isDust;
    this.baseScale = mesh.scale.x;
    this.posTree = new (window as any).THREE.Vector3();
    this.posScatter = new (window as any).THREE.Vector3();

    const h = CONFIG.particles.treeHeight;
    let t = Math.pow(Math.random(), 1.5);
    const y = t * h - h / 2;
    let rMax = CONFIG.particles.treeRadius * (1.0 - t);
    if (rMax < 0.5) rMax = 0.5;
    const r = rMax * (0.2 + 0.8 * Math.sqrt(Math.random()));
    const angle = t * 60 * Math.PI + Math.random() * Math.PI * 2;
    this.posTree.set(Math.cos(angle) * r, y, Math.sin(angle) * r);

    let rScatter = 10 + Math.random() * 15;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    this.posScatter.set(
      rScatter * Math.sin(phi) * Math.cos(theta),
      rScatter * Math.sin(phi) * Math.sin(theta),
      rScatter * Math.cos(phi)
    );
    const spinMult = 8.0;
    this.spinSpeed = new (window as any).THREE.Vector3(
      (Math.random() - 0.5) * spinMult,
      (Math.random() - 0.5) * spinMult,
      (Math.random() - 0.5) * spinMult
    );
  }

  update(dt: number, mode: string, focusTargetMesh: any) {
    let target = this.posTree;
    let s = this.baseScale;

    if (mode === "SCATTER") {
      target = this.posScatter;
      this.mesh.rotation.x += this.spinSpeed.x * dt;
      this.mesh.rotation.y += this.spinSpeed.y * dt;
      this.mesh.rotation.z += this.spinSpeed.z * dt;
      if (this.type === "PHOTO") {
        s = this.baseScale * 2.5;
        this.mesh.rotation.x *= 0.9;
        this.mesh.rotation.y *= 0.9;
        this.mesh.rotation.z *= 0.9;
      }
    } else if (mode === "FOCUS") {
      if (this.mesh === focusTargetMesh) {
        const desiredWorldPos = new (window as any).THREE.Vector3(0, 2, 35);
        const invMatrix = new (window as any).THREE.Matrix4()
          .copy(mainGroup.matrixWorld)
          .invert();
        target = desiredWorldPos.applyMatrix4(invMatrix);
        this.mesh.lookAt(camera.position);
        s = 4.5;
      } else {
        target = this.posScatter;
        s = this.type === "PHOTO" ? this.baseScale * 2.0 : this.baseScale * 0.8;
      }
    } else {
      this.mesh.rotation.x *= 0.95;
      this.mesh.rotation.z *= 0.95;
    }

    const lerpSpeed = mode === "FOCUS" ? 2.5 : 2.5;
    this.mesh.position.lerp(target, lerpSpeed * dt);
    this.mesh.scale.lerp(new (window as any).THREE.Vector3(s, s, s), 4.0 * dt);
  }
}

// 改变状态函数
const changeState = (newState: string) => {
  if (STATE.value.mode === newState) return;

  // FIXED: Fireworks only on COLLAPSE (Scatter -> Tree), AND has expanded once
  if (newState === "SCATTER") {
    STATE.value.hasExpandedOnce = true;
  }
  if (
    newState === "TREE" &&
    STATE.value.mode === "SCATTER" &&
    STATE.value.hasExpandedOnce
  ) {
    triggerChapter3Fireworks();
  }

  STATE.value.mode = newState;
  STATE.value.focusTarget = null;
};

// 初始化Three.js引擎
const initThree = async () => {
  // 等待DOM更新
  await nextTick();

  const container = document.getElementById("canvas-container");
  if (!container) return;

  // 创建Three.js场景
  const THREE = (window as any).THREE;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(CONFIG.colors.bg);
  scene.fog = new THREE.FogExp2(CONFIG.colors.bg, 0.015);
  camera = new THREE.PerspectiveCamera(
    42,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 2, CONFIG.camera.z);
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false,
    powerPreference: "high-performance",
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ReinhardToneMapping;
  renderer.toneMappingExposure = 2.2;
  container.appendChild(renderer.domElement);
  mainGroup = new THREE.Group();
  // FIXED: Raised tree position from -2.0 to -1.0 to clear text
  mainGroup.position.y = -1.0;
  scene.add(mainGroup);

  const EffectComposer = (window as any).EffectComposer;
  const RenderPass = (window as any).RenderPass;
  const UnrealBloomPass = (window as any).UnrealBloomPass;

  const renderScene = new RenderPass(scene, camera);
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5,
    0.4,
    0.85
  );
  bloomPass.threshold = 0.7;
  bloomPass.strength = 0.45;
  bloomPass.radius = 0.4;
  composer = new EffectComposer(renderer);
  composer.addPass(renderScene);
  composer.addPass(bloomPass);

  // FIXED: High brightness
  scene.add(new THREE.AmbientLight(0xffffff, 0.7));
  const spotGold = new THREE.SpotLight(0xffcc66, 2000);
  spotGold.position.set(30, 40, 40);
  spotGold.angle = 0.5;
  spotGold.penumbra = 0.5;
  scene.add(spotGold);
  const spotBlue = new THREE.SpotLight(0x6688ff, 600);
  spotBlue.position.set(-30, 20, -30);
  scene.add(spotBlue);
  const fill = new THREE.DirectionalLight(0xffeebb, 0.6);
  fill.position.set(0, 0, 50);
  scene.add(fill);

  // 初始化时钟
  clock = new THREE.Clock();
};

// 创建场景内容
const createSceneContent = () => {
  const THREE = (window as any).THREE;

  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  const RoomEnvironment = (window as any).RoomEnvironment;
  scene.environment = pmremGenerator.fromScene(
    new RoomEnvironment(),
    0.04
  ).texture;
  const boxGeo = new THREE.BoxGeometry(0.55, 0.55, 0.55);
  const sphereGeo = new THREE.SphereGeometry(0.5, 32, 32);
  // FIXED: Brighter materials
  const goldMat = new THREE.MeshStandardMaterial({
    color: CONFIG.colors.gold,
    metalness: 1.0,
    roughness: 0.1,
    envMapIntensity: 2.0,
    emissive: 0x443300,
    emissiveIntensity: 0.4,
  });
  const greenMat = new THREE.MeshStandardMaterial({
    color: CONFIG.colors.green,
    metalness: 0.2,
    roughness: 0.8,
    emissive: 0x002200,
    emissiveIntensity: 0.3,
  });
  const redMat = new THREE.MeshPhysicalMaterial({
    color: CONFIG.colors.red,
    metalness: 0.3,
    roughness: 0.2,
    clearcoat: 1.0,
  });

  for (let i = 0; i < CONFIG.particles.count; i++) {
    const rand = Math.random();
    let mesh: any, type: string;
    if (rand < 0.4) {
      mesh = new THREE.Mesh(boxGeo, greenMat);
      type = "BOX";
    } else if (rand < 0.7) {
      mesh = new THREE.Mesh(boxGeo, goldMat);
      type = "GOLD_BOX";
    } else if (rand < 0.9) {
      mesh = new THREE.Mesh(sphereGeo, goldMat);
      type = "GOLD_SPHERE";
    } else {
      mesh = new THREE.Mesh(sphereGeo, redMat);
      type = "RED";
    }
    const s = 0.4 + Math.random() * 0.5;
    mesh.scale.set(s, s, s);
    mesh.rotation.set(Math.random() * 6, Math.random() * 6, Math.random() * 6);
    mainGroup.add(mesh);
    particleSystem.push(new Particle(mesh, type, false));
  }
  const starGeo = new THREE.OctahedronGeometry(1.2, 0);
  const starMat = new THREE.MeshStandardMaterial({
    color: 0xffdd88,
    emissive: 0xffaa00,
    emissiveIntensity: 1.0,
    metalness: 1.0,
    roughness: 0,
  });
  const star = new THREE.Mesh(starGeo, starMat);
  star.position.set(0, CONFIG.particles.treeHeight / 2 + 1.2, 0);
  mainGroup.add(star);
  createSnow();
};

// 添加照片粒子
const addPhotoParticle = (src: string, aspect: number) => {
  const THREE = (window as any).THREE;
  const tex = new THREE.TextureLoader().load(src);
  tex.colorSpace = THREE.SRGBColorSpace;
  const baseH = 1.2;
  const baseW = baseH * aspect;
  const frameGeo = new THREE.BoxGeometry(baseW + 0.2, baseH + 0.2, 0.05);
  const frameMat = new THREE.MeshStandardMaterial({
    color: CONFIG.colors.gold,
    metalness: 1.0,
    roughness: 0.2,
  });
  const frame = new THREE.Mesh(frameGeo, frameMat);
  const photoGeo = new THREE.PlaneGeometry(baseW, baseH);
  const photoMat = new THREE.MeshBasicMaterial({ map: tex });
  const photo = new THREE.Mesh(photoGeo, photoMat);
  photo.position.z = 0.03;
  const group = new THREE.Group();
  group.add(frame);
  group.add(photo);
  group.rotation.set(Math.random() * 6, Math.random() * 6, Math.random() * 6);
  mainGroup.add(group);
  particleSystem.push(new Particle(group, "PHOTO", false));
};

// 创建雪花
const createSnow = () => {
  const THREE = (window as any).THREE;
  const geo = new THREE.BufferGeometry();
  const pos: number[] = [];
  const vel: number[] = [];
  for (let i = 0; i < CONFIG.snow.count; i++) {
    pos.push(
      (Math.random() - 0.5) * 80,
      (Math.random() - 0.5) * 80 + 10,
      (Math.random() - 0.5) * 80
    );
    vel.push(
      (Math.random() - 0.5) * 0.5,
      -(Math.random() * 0.5 + 0.5) * CONFIG.snow.speed,
      (Math.random() - 0.5) * 0.5
    );
  }
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.userData = { vel: vel };
  const cvs = document.createElement("canvas");
  cvs.width = 32;
  cvs.height = 32;
  const ctx = cvs.getContext("2d");
  if (ctx) {
    const gr = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    gr.addColorStop(0, "rgba(255,255,255,1)");
    gr.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gr;
    ctx.fillRect(0, 0, 32, 32);
  }
  const mat = new THREE.PointsMaterial({
    size: 0.6,
    map: new THREE.CanvasTexture(cvs),
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  snowSystem = new THREE.Points(geo, mat);
  scene.add(snowSystem);
};

// 设置交互
const setupInteraction = () => {
  const THREE = (window as any).THREE;
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
    resizeFireworks();
  });

  const onClick = (event: MouseEvent) => {
    if (!STATE.value.interactionEnabled) return;

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(mainGroup.children, true);
    if (STATE.value.mode === "TREE") {
      changeState("SCATTER");
    } else if (STATE.value.mode === "SCATTER") {
      let hitPhoto = false;
      for (let hit of intersects) {
        let obj = hit.object;
        while (obj.parent && obj.parent !== mainGroup) obj = obj.parent;
        const p = particleSystem.find((p) => p.mesh === obj);
        if (p && p.type === "PHOTO") {
          STATE.value.mode = "FOCUS";
          STATE.value.focusTarget = p.mesh;
          // Reset index to this photo so next cycle continues from here
          const photos = particleSystem.filter((pt) => pt.type === "PHOTO");
          STATE.value.photoIndex = photos.indexOf(p);
          hitPhoto = true;
          break;
        }
      }
      if (!hitPhoto) changeState("TREE");
    } else if (STATE.value.mode === "FOCUS") {
      changeState("SCATTER");
    }
  };
  window.addEventListener("mousedown", onClick);
  window.addEventListener(
    "touchstart",
    (e: TouchEvent) => {
      if (e.touches && e.touches[0]) {
        const touchEvent: any = {
          clientX: e.touches[0].clientX,
          clientY: e.touches[0].clientY,
        };
        onClick(touchEvent);
      }
    },
    { passive: false }
  );
};

// 动画循环
const animate = () => {
  requestAnimationFrame(animate);
  const dt = clock.getDelta();

  // 清除并绘制烟花
  fwCtx.clearRect(0, 0, fwWidth, fwHeight);
  fwCtx.globalCompositeOperation = "lighter";
  let sIdx = smokes.length;
  while (sIdx--) {
    if (!smokes[sIdx].update()) smokes.splice(sIdx, 1);
    else smokes[sIdx].draw();
  }
  let pIdx = particles.length;
  while (pIdx--) {
    if (!particles[pIdx].update()) particles.splice(pIdx, 1);
    else particles[pIdx].draw();
  }

  // 更新雪花
  if (snowSystem) {
    const pos = snowSystem.geometry.attributes.position.array;
    const vel = snowSystem.geometry.userData.vel;
    for (let i = 0; i < CONFIG.snow.count; i++) {
      pos[i * 3 + 1] += vel[i * 3 + 1] * dt * 5.0;
      pos[i * 3] += Math.sin(clock.elapsedTime + i) * 0.02;
      if (pos[i * 3 + 1] < -20) pos[i * 3 + 1] = 40;
    }
    snowSystem.geometry.attributes.position.needsUpdate = true;
  }

  // 更新旋转
  if (STATE.value.mode === "SCATTER" && STATE.value.hand.detected) {
    const tx = STATE.value.hand.y * Math.PI * 0.25;
    const ty = STATE.value.hand.x * Math.PI * 0.9;
    STATE.value.rotation.x += (tx - STATE.value.rotation.x) * 3 * dt;
    STATE.value.rotation.y += (ty - STATE.value.rotation.y) * 3 * dt;
  } else {
    if (STATE.value.mode === "TREE") STATE.value.rotation.y += 0.3 * dt;
    else STATE.value.rotation.y += 0.1 * dt;
    STATE.value.rotation.x *= 0.95;
  }
  mainGroup.rotation.x = STATE.value.rotation.x;
  mainGroup.rotation.y = STATE.value.rotation.y;

  // 更新粒子系统
  particleSystem.forEach((p) =>
    p.update(dt, STATE.value.mode, STATE.value.focusTarget)
  );

  // 渲染场景
  composer.render();
};

// 初始化MediaPipe模块
(window as any).initMediaPipeModule = async (existingStream: MediaStream) => {
  video = document.getElementById("webcam");
  webcamCanvas = document.getElementById("webcam-preview");

  if (!webcamCanvas) {
    console.error("Webcam preview canvas not found");
    return;
  }

  webcamCtx = webcamCanvas.getContext("2d");
  if (!webcamCtx) {
    console.error("Could not get 2D context for webcam preview");
    return;
  }

  webcamCanvas.width = 400;
  webcamCanvas.height = 300;

  // 显示加载进度条
  showLoadingProgress.value = true;
  loadingProgress.value = 0;

  // 创建一个进度回调函数来更新进度条
  const updateProgress = (progress: number) => {
    loadingProgress.value = progress;
  };

  try {
    // 模拟加载进度 - 首先加载Vision库
    updateProgress(20);

    // 由于FilesetResolver.forVisionTasks不支持进度回调，我们使用模拟进度
    const vision = await (window as any).FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22-rc.20250304/wasm"
    );

    // 模拟加载进度完成
    updateProgress(60);

    updateProgress(60);

    // 加载HandLandmarker模型
    systemStatus.value = "Loading Hand Landmarker Model...";

    // 创建一个模拟进度的函数，因为MediaPipe没有直接的进度回调
    const simulateProgress = (start: number, end: number, duration: number) => {
      return new Promise<void>((resolve) => {
        const startTime = Date.now();
        const interval = setInterval(() => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(
            (elapsed / duration) * (end - start) + start,
            end
          );
          updateProgress(progress);

          if (elapsed >= duration) {
            clearInterval(interval);
            updateProgress(end);
            resolve();
          }
        }, 50);
      });
    };

    await simulateProgress(60, 90, 1000); // 模拟加载模型过程

    handLandmarker = await (window as any).HandLandmarker.createFromOptions(
      vision,
      {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
          delegate: "GPU",
        },
        runningMode: "VIDEO",
        numHands: 1,
        minHandDetectionConfidence: 0.7, // 提高检测置信度
        minHandPresenceConfidence: 0.7,
        minTrackingConfidence: 0.7,
      }
    );

    await simulateProgress(90, 100, 500); // 模拟完成过程

    systemStatus.value = "Gesture Library Loaded Successfully!";

    // 短暂延迟后隐藏进度条
    setTimeout(() => {
      showLoadingProgress.value = false;
    }, 1000);
  } catch (error) {
    console.error("Error loading MediaPipe models:", error);
    systemStatus.value = "Error loading gesture library. Please try again.";
    showLoadingProgress.value = false;
  }

  // 设置摄像头预览显示
  const cameraDisplay = document.getElementById(
    "camera-display"
  ) as HTMLVideoElement;
  if (cameraDisplay) {
    cameraDisplay.srcObject = existingStream;
  }

  video.srcObject = existingStream;
  video.addEventListener("loadeddata", predictWebcam);
};

// 预测网络摄像头
let lastVideoTime = -1;
const predictWebcam = () => {
  // 检查视频元素和handLandmarker是否可用
  if (!video || !handLandmarker) {
    requestAnimationFrame(predictWebcam);
    return;
  }

  if (video.currentTime !== lastVideoTime) {
    lastVideoTime = video.currentTime;
    try {
      const result = handLandmarker.detectForVideo(video, performance.now());
      if (result.landmarks.length > 0) {
        // FIXED: Check enable flag
        if (!STATE.value.interactionEnabled) return;

        STATE.value.hand.detected = true;
        const lm = result.landmarks[0];
        const wrist = lm[0];
        const tips = [lm[8], lm[12], lm[16], lm[20]];
        let avgDist = 0;
        tips.forEach(
          (t) => (avgDist += Math.hypot(t.x - wrist.x, t.y - wrist.y))
        );
        avgDist /= 4;
        const pinchDist = Math.hypot(lm[4].x - lm[8].x, lm[4].y - lm[8].y);

        // 更新手势状态显示
        avgDistance.value = avgDist;
        pinchDistance.value = pinchDist;

        // 添加手势稳定性优化 - 历史记录和多数表决
        // 调整阈值以提高识别准确性
        const pinchThreshold = 0.08; // 增加阈值，使捏合手势更容易触发
        const fistThreshold = 0.22; // 调整握拳阈值
        const openThreshold = 0.45; // 调整张开阈值

        const currentGesture = {
          pinch: pinchDist < pinchThreshold,
          fist: avgDist < fistThreshold,
          open: avgDist > openThreshold,
        };

        // 更新历史记录
        gestureHistory.pinch.push(currentGesture.pinch);
        gestureHistory.fist.push(currentGesture.fist);
        gestureHistory.open.push(currentGesture.open);

        // 保持历史记录在最大长度，但增加清理逻辑
        if (gestureHistory.pinch.length > gestureHistory.maxHistory) {
          gestureHistory.pinch.shift();
        }
        if (gestureHistory.fist.length > gestureHistory.maxHistory) {
          gestureHistory.fist.shift();
        }
        if (gestureHistory.open.length > gestureHistory.maxHistory) {
          gestureHistory.open.shift();
        }

        // 添加调试信息，如果需要可以启用
        // console.log('Gesture state - Pinch:', currentGesture.pinch, 'Fist:', currentGesture.fist, 'Open:', currentGesture.open);
        // console.log('AvgDist:', avgDist.toFixed(3), 'PinchDist:', pinchDist.toFixed(3));

        // 多数表决 - 调整为更灵活的检测机制
        const countTrue = (arr) => arr.filter(Boolean).length;
        const requiredFrames = Math.ceil(gestureHistory.maxHistory * 0.4); // 降低帧一致要求到40%以提高响应性
        const isPinchStable = countTrue(gestureHistory.pinch) >= requiredFrames;
        const isFistStable = countTrue(gestureHistory.fist) >= requiredFrames;
        const isOpenStable = countTrue(gestureHistory.open) >= requiredFrames;

        // 添加模式切换防抖机制
        const shouldChangeMode = (newMode) => {
          // 防止快速连续切换模式
          return STATE.value.mode !== newMode;
        };

        // 改进FOCUS模式的退出检测
        if (STATE.value.mode === "FOCUS") {
          // 放宽退出FOCUS模式的条件
          if (pinchDist > 0.12) {
            // 增加退出阈值，使退出更容易
            changeState("SCATTER");
          }
        } else {
          // 改进手势状态切换逻辑
          if (isPinchStable && shouldChangeMode("FOCUS")) {
            const photos = particleSystem.filter((p) => p.type === "PHOTO");
            if (photos.length > 0) {
              STATE.value.mode = "FOCUS";
              STATE.value.photoIndex =
                (STATE.value.photoIndex + 1) % photos.length;
              STATE.value.focusTarget = photos[STATE.value.photoIndex].mesh;
            }
          } else if (isFistStable && shouldChangeMode("TREE")) {
            changeState("TREE");
          } else if (isOpenStable && shouldChangeMode("SCATTER")) {
            changeState("SCATTER");
          }
        }
        STATE.value.hand.x = (lm[9].x - 0.5) * 2;
        STATE.value.hand.y = (lm[9].y - 0.5) * 2;
      } else {
        STATE.value.hand.detected = false;
        // 重置手势历史记录，避免累积错误状态
        gestureHistory.pinch = [];
        gestureHistory.fist = [];
        gestureHistory.open = [];
      }
    } catch (error) {
      console.error("Error in hand tracking:", error);
    }
  }
  requestAnimationFrame(predictWebcam);
};

// 向窗口添加全局函数
(window as any).startThreeEngine = async () => {
  // 初始化画布
  fwCanvas = document.getElementById("fireworks-canvas") as HTMLCanvasElement;
  fwCtx = fwCanvas.getContext("2d") as CanvasRenderingContext2D;

  // 创建全局画布用于烟花效果 - 优化粒子精细化
  const glowCanvas = document.createElement("canvas");
  glowCanvas.width = 64; // 增加画布尺寸以提高细节
  glowCanvas.height = 64;
  const gCtx = glowCanvas.getContext("2d");
  if (gCtx) {
    const gradG = gCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradG.addColorStop(0, "rgba(255, 255, 200, 1)");
    gradG.addColorStop(0.3, "rgba(255, 200, 100, 0.8)");
    gradG.addColorStop(0.6, "rgba(255, 150, 50, 0.5)");
    gradG.addColorStop(1, "rgba(255, 100, 0, 0)");
    gCtx.fillStyle = gradG;
    gCtx.fillRect(0, 0, 64, 64);
  }
  (window as any).glowCanvas = glowCanvas;

  const smokeCanvas = document.createElement("canvas");
  smokeCanvas.width = 256; // 增加画布尺寸以提高细节
  smokeCanvas.height = 256;
  const smCtx = smokeCanvas.getContext("2d");
  if (smCtx) {
    const smGrad = smCtx.createRadialGradient(128, 128, 0, 128, 128, 128);
    smGrad.addColorStop(0, "rgba(200, 200, 220, 0.9)");
    smGrad.addColorStop(0.3, "rgba(150, 150, 180, 0.7)");
    smGrad.addColorStop(0.6, "rgba(100, 100, 150, 0.4)");
    smGrad.addColorStop(1, "rgba(80, 80, 120, 0)");
    smCtx.fillStyle = smGrad;
    smCtx.fillRect(0, 0, 256, 256);
  }
  (window as any).smokeCanvas = smokeCanvas;

  // 初始化Three.js
  await initThree();
  createSceneContent();
  resizeFireworks();
  setupInteraction();
  animate();
};

(window as any).addPhotosToRunningScene = (photos: any[]) => {
  photos.forEach((photoData) => {
    addPhotoParticle(photoData.src, photoData.aspect);
  });
};

(window as any).activateInteraction = () => {
  // 添加短暂延迟以防止立即触发
  setTimeout(() => {
    STATE.value.interactionEnabled = true;
  }, 1000);
};

// 初始化
onMounted(async () => {
  // 动态加载Three.js和MediaPipe库
  if (!(window as any).THREE) {
    const threeModule = await import("three");
    (window as any).THREE = threeModule;

    // 加载后处理模块
    const { EffectComposer } = await import(
      "three/examples/jsm/postprocessing/EffectComposer.js"
    );
    const { RenderPass } = await import(
      "three/examples/jsm/postprocessing/RenderPass.js"
    );
    const { UnrealBloomPass } = await import(
      "three/examples/jsm/postprocessing/UnrealBloomPass.js"
    );
    const { RoomEnvironment } = await import(
      "three/examples/jsm/environments/RoomEnvironment.js"
    );

    (window as any).EffectComposer = EffectComposer;
    (window as any).RenderPass = RenderPass;
    (window as any).UnrealBloomPass = UnrealBloomPass;
    (window as any).RoomEnvironment = RoomEnvironment;
  }

  // 确保每次进入组件时都重新初始化MediaPipe
  const visionModule = await import("@mediapipe/tasks-vision");
  (window as any).FilesetResolver = visionModule.FilesetResolver;
  (window as any).HandLandmarker = visionModule.HandLandmarker;

  // 启动3D引擎
  if ((window as any).startThreeEngine) {
    (window as any).startThreeEngine();
  }

  // UI逻辑
  const status = document.getElementById("sys-status") as HTMLElement;
  const btn = document.getElementById("init-btn") as HTMLElement;
  const spinner = document.getElementById("sys-spinner") as HTMLElement;

  status.innerHTML =
    "Welcome.<br>Please click below to enable camera access<br>for the full immersive experience.";
  if (spinner) spinner.style.display = "none";
  if (btn) btn.style.display = "block";
  showInitButton.value = true;
});

onUnmounted(() => {
  // 清理摄像头流
  if (globalStream.value) {
    globalStream.value.getTracks().forEach((track) => track.stop());
    globalStream.value = null;
  }

  // 清理MediaPipe资源
  if (handLandmarker) {
    handLandmarker.close();
    handLandmarker = null;
  }

  // 重置进度条状态
  showLoadingProgress.value = false;
  loadingProgress.value = 0;
});
</script>

<style scoped>
body {
  margin: 0;
  overflow: hidden;
  background-color: #02040c;
  font-family: "Times New Roman", serif;
  user-select: none;
}

/* 1. Scene Layers */
#canvas-container {
  width: 100vw;
  height: 100vh;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
}
#fireworks-canvas {
  width: 100vw;
  height: 100vh;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
  pointer-events: none;
}

/* 返回按钮样式 */
.back-button-container {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 100;
  pointer-events: auto;
}

.back-button {
  background: rgba(212, 175, 55, 0.2);
  color: #d4af37;
  border: 1px solid rgba(212, 175, 55, 0.5);
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  gap: 8px;
}

.back-button:hover {
  background: rgba(212, 175, 55, 0.4);
  box-shadow: 0 0 15px rgba(212, 175, 55, 0.3);
}

.back-arrow {
  font-size: 16px;
}

/* 2. UI Layer (Title) */
#ui-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 5;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 5vh;
  box-sizing: border-box;
  transition: opacity 1s;
}

h1 {
  color: #fceea7;
  font-size: min(8vw, 56px);
  margin: 0;
  font-weight: 400;
  letter-spacing: 6px;
  text-shadow: 0 0 50px rgba(252, 238, 167, 0.6);
  background: linear-gradient(to bottom, #fff, #eebb66);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-family: "Cinzel", "Times New Roman", serif;
  opacity: 0.9;
  text-align: center;
  padding: 0 20px;
}

/* 手势状态显示 */
#hand-status {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.7);
  color: #d4af37;
  padding: 15px;
  border-radius: 8px;
  font-family: monospace;
  font-size: 14px;
  z-index: 10;
  border: 1px solid rgba(212, 175, 55, 0.3);
}

#hand-status .status-item {
  margin: 5px 0;
  text-align: left;
}

/* 3. Overlay Screens */
.fullscreen-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(2, 4, 12, 0.95);
  z-index: 100;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #d4af37;
  transition: opacity 0.8s ease;
  backdrop-filter: blur(10px);
}

/* Setup Box */
.setup-container {
  width: 90%;
  max-width: 400px;
  padding: 30px;
  border: 1px solid rgba(212, 175, 55, 0.3);
  background: rgba(20, 20, 20, 0.6);
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 0 50px rgba(0, 0, 0, 0.5);
}

.setup-group {
  margin-bottom: 20px;
  text-align: left;
}
.setup-label {
  display: block;
  margin-bottom: 8px;
  font-size: 12px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #888;
}
.setup-input {
  width: 100%;
  padding: 10px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid #444;
  color: #fff;
  font-family: inherit;
  box-sizing: border-box;
  border-radius: 4px;
}
.file-input-wrapper {
  position: relative;
  overflow: hidden;
  display: inline-block;
  width: 100%;
}
.file-btn {
  border: 1px solid rgba(212, 175, 55, 0.5);
  color: #d4af37;
  background: transparent;
  padding: 12px;
  width: 100%;
  cursor: pointer;
  transition: 0.3s;
  text-transform: uppercase;
  font-size: 11px;
  letter-spacing: 2px;
  border-radius: 4px;
}
.file-btn:hover {
  background: rgba(212, 175, 55, 0.1);
}
.file-btn.selected {
  background: rgba(212, 175, 55, 0.8);
  color: #000;
}

.action-btn {
  background: #d4af37;
  color: #000;
  border: none;
  padding: 15px 40px;
  font-size: 16px;
  letter-spacing: 4px;
  text-transform: uppercase;
  cursor: pointer;
  margin-top: 20px;
  font-weight: bold;
  box-shadow: 0 0 30px rgba(212, 175, 55, 0.3);
  transition: transform 0.2s, box-shadow 0.2s;
  border-radius: 4px;
}
.action-btn:hover {
  box-shadow: 0 0 50px rgba(212, 175, 55, 0.6);
}
.action-btn:active {
  transform: scale(0.95);
}

#init-btn {
  display: none;
  margin-top: 30px;
}

/* Webcam hidden */
#webcam-wrapper {
  position: absolute;
  bottom: 20px;
  right: 20px;
  width: 100px;
  height: 75px;
  opacity: 0;
  pointer-events: none;
  z-index: 50;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: opacity 0.5s;
  border-radius: 4px;
  overflow: hidden;
}

/* 摄像头预览样式 */
#camera-preview-container {
  position: absolute;
  bottom: 20px;
  left: 20px;
  z-index: 40;
  background: rgba(0, 0, 0, 0.7);
  border: 1px solid rgba(212, 175, 55, 0.5);
  border-radius: 8px;
  padding: 10px;
  box-shadow: 0 0 15px rgba(212, 175, 55, 0.3);
}

.camera-preview-label {
  color: #d4af37;
  font-size: 12px;
  text-align: center;
  margin-bottom: 8px;
  font-family: monospace;
}

.camera-preview-box {
  width: 480px;
  height: 360px;
  overflow: hidden;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

#camera-display {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* 进度条样式 */
.progress-container {
  width: 80%;
  max-width: 400px;
  margin: 20px auto;
  text-align: center;
}

.progress-label {
  color: #d4af37;
  margin-bottom: 10px;
  font-size: 14px;
}

.progress-bar {
  width: 100%;
  height: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 5px;
  border: 1px solid rgba(212, 175, 55, 0.3);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #d4af37, #ffcc00);
  transition: width 0.3s ease;
  border-radius: 10px;
}

.progress-percent {
  color: #d4af37;
  font-size: 14px;
  font-weight: bold;
}

/* 增强整体视觉效果 */
.christmas-tree-ai-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 2px solid rgba(212, 175, 55, 0.2);
  border-top: 2px solid #d4af37;
  border-radius: 50%;
  animation: spin 1s infinite linear;
  margin-bottom: 20px;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.loader-text {
  font-size: 12px;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: #888;
  text-align: center;
  line-height: 1.5;
}
</style>