<script setup lang="ts">
import { ref, computed, nextTick, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useProgressStore } from '../../../stores/useProgressStore';
import MenuIcon from '../../../components/game/MenuIcon.vue';
import { useSpeech } from '../../../composables/useSpeech';
import { usePromptFading } from '../../../composables/usePromptFading';
import { useLogger } from '../../../composables/useLogger';
import { useSafeTimeout } from '../../../composables/useSafeTimeout';
import ColorfulAnimal from '../AnimalJigsaw/ColorfulAnimal.vue';

const router = useRouter();
const progressStore = useProgressStore();
const GAME_ID = 'fun-connect-dots';

const hasStarted = ref(false);
const isComplete = ref(false);
const { playInstruction, stopSpeech, isPlaying } = useSpeech();
const log = useLogger(GAME_ID);
const { safeSetTimeout } = useSafeTimeout();

const ANIMALS = ['cat', 'dog', 'rabbit', 'frog', 'pig', 'lion', 'elephant', 'penguin'];

interface Point {
  x: number;
  y: number;
}

const currentPhase = computed(() => progressStore.moduleStats[GAME_ID]?.currentPhase || 1);

// Cap the dots based on phase
// Phase 1 = 3 dots, Phase 2 = 5 dots, Phase 3 = 8 dots, Phase 4 = 12 dots, Phase 5 = 15 dots
const dotCount = computed(() => {
  const p = currentPhase.value;
  if (p === 1) return 3;
  if (p === 2) return 5;
  if (p === 3) return 8;
  if (p === 4) return 12;
  return 15;
});

const points = ref<Point[]>([]);
const currentTargetIndex = ref(1); // The next dot they need to connect to (0-indexed array, so dot 2 is index 1)
const drawnLines = ref<{x1: number, y1: number, x2: number, y2: number}[]>([]);

// Dragging state
const isDrawing = ref(false);
const currentDragX = ref(0);
const currentDragY = ref(0);
const svgRef = ref<SVGSVGElement | null>(null);

const hiddenAnimal = ref('cat');
const showOverlay = ref(false);

const { currentLevel: promptLevel, resetAll: resetPrompt } = usePromptFading('none');

const generatePoints = () => {
  const pts: Point[] = [];
  const cx = 300;
  const cy = 300;
  const baseRadius = 200;
  const count = dotCount.value;
  const animal = hiddenAnimal.value;

  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count; // 0 to 2PI, starting at top, clockwise
    let rMult = 1.0;
    
    switch(animal) {
      case 'cat':
        // pointy ears at top corners
        if (angle > 0.5 && angle < 1.2) rMult = 1.25;
        else if (angle > 5.0 && angle < 5.8) rMult = 1.25;
        else rMult = 0.9;
        break;
      case 'dog':
        // floppy ears at sides
        if (angle > 1.2 && angle < 2.2) rMult = 1.15;
        else if (angle > 4.0 && angle < 5.0) rMult = 1.15;
        else rMult = 0.9;
        break;
      case 'rabbit':
        // tall ears at top
        if (angle > 5.7 || angle < 0.6) rMult = 1.45;
        else rMult = 0.8;
        break;
      case 'frog':
        // bulging eyes at top, wide base
        if (angle > 5.2 && angle < 5.8) rMult = 1.15;
        else if (angle > 0.4 && angle < 1.0) rMult = 1.15;
        else if (angle > 1.8 && angle < 4.4) rMult = 1.2;
        else rMult = 0.85;
        break;
      case 'pig':
        // round with slight ear bumps
        if (angle > 0.6 && angle < 1.0) rMult = 1.05;
        else if (angle > 5.2 && angle < 5.6) rMult = 1.05;
        else rMult = 1.0;
        break;
      case 'lion':
        // zigzag mane (more prominent if lots of dots)
        rMult = 1.0 + Math.sin(angle * 10) * 0.08;
        break;
      case 'elephant':
        // big ears at sides, trunk at bottom
        if (angle > 1.0 && angle < 2.2) rMult = 1.3;
        else if (angle > 4.0 && angle < 5.2) rMult = 1.3;
        else if (angle > 2.8 && angle < 3.4) rMult = 1.2;
        else rMult = 0.85;
        break;
      case 'penguin':
        // tall oval
        rMult = Math.abs(Math.sin(angle)) * 0.15 + 0.9;
        break;
      default:
        console.warn(`ConnectDots: Unknown animal shape '${animal}', using default circle.`);
        rMult = 1.0;
        break;
    }
    
    // Map 0 (top) to x=sin, y=-cos
    pts.push({
      x: cx + baseRadius * rMult * Math.sin(angle),
      y: cy - baseRadius * rMult * Math.cos(angle)
    });
  }
  return pts;
};

const initLevel = async () => {
  isComplete.value = false;
  drawnLines.value = [];
  currentTargetIndex.value = 1;
  isDrawing.value = false;
  resetPrompt('none');
  
  hiddenAnimal.value = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  points.value = generatePoints();

  await nextTick();
  playInstruction('Connect the dots in order!');
};

const handleStart = () => {
  hasStarted.value = true;
  initLevel();
};

const getSvgMousePosition = (evt: PointerEvent) => {
  if (!svgRef.value) return { x: 0, y: 0 };
  const CTM = svgRef.value.getScreenCTM();
  if (!CTM) return { x: 0, y: 0 };
  return {
    x: (evt.clientX - CTM.e) / CTM.a,
    y: (evt.clientY - CTM.f) / CTM.d
  };
};

const startDrawing = (evt: PointerEvent, dotIndex: number) => {
  if (isComplete.value) return;
  // Can only start drawing from the last connected dot
  if (dotIndex === currentTargetIndex.value - 1) {
    evt.preventDefault();
    isDrawing.value = true;
    const pos = getSvgMousePosition(evt);
    currentDragX.value = pos.x;
    currentDragY.value = pos.y;
    resetPrompt();
  } else if (dotIndex !== currentTargetIndex.value) {
    playInstruction(`Start at number ${currentTargetIndex.value}`);
  }
};

const draw = (evt: PointerEvent) => {
  if (!isDrawing.value) return;
  evt.preventDefault();
  const pos = getSvgMousePosition(evt);
  currentDragX.value = pos.x;
  currentDragY.value = pos.y;
};

const endDrawing = () => {
  isDrawing.value = false;
};

const dotEnter = (dotIndex: number) => {
  if (!isDrawing.value) return;
  if (dotIndex === currentTargetIndex.value) {
    // Valid connection
    const p1 = points.value[currentTargetIndex.value - 1];
    const p2 = points.value[currentTargetIndex.value];
    
    drawnLines.value.push({ x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y });
    currentTargetIndex.value++;
    
    // Play a small ding? Could just use resetPrompt as interaction
    resetPrompt();

    if (currentTargetIndex.value >= points.value.length) {
      // Connect last to first
      const first = points.value[0];
      const last = points.value[points.value.length - 1];
      drawnLines.value.push({ x1: last.x, y1: last.y, x2: first.x, y2: first.y });
      isDrawing.value = false;
      onLevelComplete();
    } else {
      // Allow continuing drawing seamlessly without lifting finger
      // Actually we just set the new start point to the current dot
      const p = points.value[dotIndex];
      currentDragX.value = p.x;
      currentDragY.value = p.y;
    }
  }
};

function onLevelComplete() {
  isComplete.value = true;
  log.generate({ level: 1, phase: currentPhase.value, pieces: dotCount.value });
  playInstruction('You drew a beautiful picture!');
  progressStore.updateStats(GAME_ID, true);
  
  // Use safeSetTimeout so this is auto-cleared if user navigates away before it fires
  safeSetTimeout(() => {
    showOverlay.value = true;
    resetPrompt();
  }, 2000);
}

onUnmounted(() => {
  stopSpeech();
});

const handleNextLevel = () => {
  showOverlay.value = false;
  isComplete.value = false;
  initLevel();
};
</script>

<template>
  <div class="jigsaw-root" :class="{ 'prompt-active': promptLevel === 'partial' || promptLevel === 'full' }" @pointermove="draw" @pointerup="endDrawing" @pointercancel="endDrawing" @pointerleave="endDrawing">
    <div v-if="!hasStarted" class="start-screen">
      <div class="start-icon"><MenuIcon :gameId="GAME_ID" style="width: 140px; height: 140px;" /></div>
      <h1>Connect Dots<br><span>Draw & Learn</span></h1>
      <p class="start-sub">Connect the dots in order to reveal the picture!</p>
      <button @click="handleStart" class="start-btn">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        Start
      </button>
    </div>

    <div v-else class="game-board">
      <div v-if="isPlaying" class="listening-mini">
        <svg class="speaker-mini" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
        <span>Listening...</span>
      </div>

      <div class="action-layout">
        <header class="top-bar">
          <div class="phase-badge">
            <span style="font-size: 1.5rem; margin-right: 0.5rem">⭐</span>
            Phase {{ currentPhase }}
          </div>
          <button class="replay-btn" @click="playInstruction('Connect the dots in order!')" :disabled="isPlaying">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
            Replay
          </button>
        </header>

        <div class="jig-main">
          <!-- The Canvas Area -->
          <div class="board">
            <!-- The Hidden Image (Revealed at the end) -->
            <div class="hidden-image" :class="{ 'revealed': isComplete }">
              <ColorfulAnimal :name="hiddenAnimal" width="400" height="400" />
            </div>

            <!-- SVG for drawing lines -->
            <svg class="drawing-layer" viewBox="0 0 600 600" ref="svgRef">
              <!-- Completed Lines -->
              <line 
                v-for="(line, idx) in drawnLines" 
                :key="'l'+idx"
                :x1="line.x1" :y1="line.y1"
                :x2="line.x2" :y2="line.y2"
                stroke="#3b82f6" stroke-width="8" stroke-linecap="round"
              />
              <!-- Active Line -->
              <line 
                v-if="isDrawing"
                :x1="points[currentTargetIndex - 1].x" :y1="points[currentTargetIndex - 1].y"
                :x2="currentDragX" :y2="currentDragY"
                stroke="#93c5fd" stroke-width="8" stroke-linecap="round" stroke-dasharray="10 10"
              />
            </svg>

            <!-- Dots -->
            <div 
              v-for="(pt, idx) in points" 
              :key="'d'+idx"
              class="dot-wrapper"
              :class="{ 
                'completed': idx < currentTargetIndex - 1, 
                'active': idx === currentTargetIndex - 1,
                'is-target': promptLevel === 'full' && idx === currentTargetIndex
              }"
              :style="{ left: pt.x + 'px', top: pt.y + 'px' }"
              @pointerdown="startDrawing($event, idx)"
              @pointerenter="dotEnter(idx)"
            >
              <div class="dot"></div>
              <div class="dot-label">{{ idx + 1 }}</div>
            </div>
          </div>

          <transition name="pop">
            <div v-if="showOverlay" class="complete-overlay">
              <div class="complete-card">
                <div class="complete-emoji">🎨</div>
                <h2 class="complete-title">Beautiful!</h2>
                <p class="complete-sub">You revealed the picture!</p>
                <div class="complete-actions">
                  <button class="btn-next" @click="handleNextLevel">Next Level →</button>
                  <button class="btn-menu" @click="router.push('/')">🏠 Menu</button>
                </div>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import '../../../assets/fun-games-shared.css';

/* BOARD */
.board {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 600px;
  height: 600px;
  background-color: #f8fafc;
  background-image: 
    linear-gradient(#e2e8f0 2px, transparent 2px),
    linear-gradient(90deg, #e2e8f0 2px, transparent 2px),
    linear-gradient(#e2e8f0 1px, transparent 1px),
    linear-gradient(90deg, #e2e8f0 1px, transparent 1px);
  background-size: 100px 100px, 100px 100px, 20px 20px, 20px 20px;
  background-position: -2px -2px, -2px -2px, -1px -1px, -1px -1px;
  border-radius: 40px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.1);
  overflow: hidden;
  touch-action: none;
}

.hidden-image {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  opacity: 0;
  filter: grayscale(100%) blur(10px);
  transition: none;
}
.hidden-image.revealed {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1.1);
  filter: grayscale(0%) blur(0px);
  transition: opacity 1s ease-in-out, transform 1s cubic-bezier(0.34, 1.56, 0.64, 1), filter 1s ease-in-out;
}

.drawing-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.dot-wrapper {
  position: absolute;
  width: 60px;
  height: 60px;
  margin-left: -30px;
  margin-top: -30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  cursor: pointer;
  touch-action: none;
  z-index: 10;
}

.dot {
  width: 24px;
  height: 24px;
  background: #cbd5e1;
  border: 4px solid white;
  border-radius: 50%;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.dot-label {
  font-size: 1.5rem;
  font-weight: 800;
  color: #64748b;
  margin-top: 4px;
  text-shadow: 0 2px 4px white;
  transition: all 0.3s;
}

.dot-wrapper.active .dot {
  background: #3b82f6;
  transform: scale(1.5);
  box-shadow: 0 0 15px rgba(59,130,246,0.5);
}
.dot-wrapper.active .dot-label {
  color: #2563eb;
  transform: scale(1.2);
}

.dot-wrapper.completed .dot {
  background: #10b981;
  transform: scale(0.8);
}
.dot-wrapper.completed .dot-label {
  opacity: 0.5;
}

/* Prompt */
.prompt-active .dot-wrapper.is-target .dot {
  animation: promptPulse 2s infinite;
}
@keyframes promptPulse {
  0% { transform: scale(1.5); box-shadow: 0 0 15px rgba(59,130,246,0.5); }
  50% { transform: scale(2); box-shadow: 0 0 30px rgba(255,215,0,0.8); background: #f59e0b; }
  100% { transform: scale(1.5); box-shadow: 0 0 15px rgba(59,130,246,0.5); }
}
</style>
