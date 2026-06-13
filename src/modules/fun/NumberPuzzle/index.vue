<script setup lang="ts">
import { getRandomPraise } from '../../../utils/praises';
import { ref, computed, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useProgressStore } from '../../../stores/useProgressStore';
import NumberBlock from './NumberBlock.vue';
import MenuIcon from '../../../components/game/MenuIcon.vue';
import { useSpeech } from '../../../composables/useSpeech';

const router = useRouter();
const progressStore = useProgressStore();
const { playInstruction, isPlaying } = useSpeech();
const GAME_ID = 'fun-number-puzzle';

const hasStarted = ref(false);
const isComplete = ref(false);

const COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#84cc16', 
  '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', 
  '#d946ef', '#f43f5e', '#14b8a6', '#6366f1',
  '#ec4899', '#eab308', '#10b981', '#0ea5e9'
];

interface NumberItem {
  id: string;
  num: number;
  color: string;
  startX: number;
  startY: number;
  dragX: number;
  dragY: number;
  dragging: boolean;
  placed: boolean;
  zIndex: number;
}

const currentPhase = computed(() => progressStore.moduleStats[GAME_ID]?.currentPhase || 1);

// Generate the sequence of numbers based on phase
const targetSequence = computed(() => {
  switch (currentPhase.value) {
    case 1: return [1, 2, 3]; // 3 items
    case 2: return [1, 2, 3, 4, 5]; // 5 items
    case 3: return [1, 2, 3, 4, 5, 6, 7, 8, 9]; // 9 items (3x3)
    case 4: return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]; // 10 items (2x5)
    case 5: return Array.from({ length: 15 }, (_, i) => i + 1); // 15 items (3x5)
    default: return [1, 2, 3];
  }
});

const boardColumns = computed(() => {
  const len = targetSequence.value.length;
  if (len === 3) return 3;
  if (len === 5) return 5;
  if (len === 9) return 3;
  if (len === 10) return 5;
  if (len === 15) return 5;
  return 3;
});

const boardRows = computed(() => Math.ceil(targetSequence.value.length / boardColumns.value));

const puzzlePieces = ref<NumberItem[]>([]);
const boardRef = ref<HTMLElement | null>(null);
const piecesLayerRef = ref<HTMLElement | null>(null);

let zIndexCounter = 10;

// Generate randomized tray layout
const initLevel = async () => {
  isComplete.value = false;
  puzzlePieces.value = [];
  
  const seq = [...targetSequence.value];
  // Shuffle pieces
  for (let i = seq.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [seq[i], seq[j]] = [seq[j], seq[i]];
  }

  const trayCols = Math.max(5, Math.ceil(seq.length / 2));
  const pieceWidth = 100;
  const pieceHeight = 100;
  const spacing = 16;

  seq.forEach((num, index) => {
    const row = Math.floor(index / trayCols);
    const col = index % trayCols;
    
    // Spread in a grid within the tray area
    const itemsInRow = row === Math.floor(seq.length / trayCols) && seq.length % trayCols !== 0 
      ? seq.length % trayCols 
      : trayCols;
    const rowWidth = itemsInRow * pieceWidth + (itemsInRow - 1) * spacing;
    
    const startX = 640 - (rowWidth / 2) + (col * (pieceWidth + spacing));
    const startY = 490 + row * (pieceHeight + spacing);

    puzzlePieces.value.push({
      id: `piece-${num}`,
      num,
      color: COLORS[num % COLORS.length],
      startX,
      startY,
      dragX: startX,
      dragY: startY,
      dragging: false,
      placed: false,
      zIndex: zIndexCounter++,
    });
  });

  await nextTick();
};

const handleStart = () => {
  hasStarted.value = true;
  initLevel();
  speakInstruction();
};

const speakInstruction = () => {
  playInstruction("Put the numbers on the board!");
};

const playHint = () => {
  speakInstruction();
};

// Pointer Events Drag Logic
const activePointers = new Map<number, NumberItem>();

function onPointerDown(e: PointerEvent, piece: NumberItem) {
  if (piece.placed) return;
  e.preventDefault();
  (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  activePointers.set(e.pointerId, piece);
  piece.dragging = true;
  piece.zIndex = zIndexCounter++;
  
  if (piecesLayerRef.value) {
    const rect = piecesLayerRef.value.getBoundingClientRect();
    piece.dragX = e.clientX - rect.left;
    piece.dragY = e.clientY - rect.top;
  } else {
    piece.dragX = e.clientX;
    piece.dragY = e.clientY;
  }
}

function onPointerMove(e: PointerEvent) {
  const p = activePointers.get(e.pointerId);
  if (!p || !piecesLayerRef.value) return;
  e.preventDefault();
  const rect = piecesLayerRef.value.getBoundingClientRect();
  p.dragX = e.clientX - rect.left;
  p.dragY = e.clientY - rect.top;
}

function onPointerUp(e: PointerEvent) {
  const p = activePointers.get(e.pointerId);
  if (!p) return;

  p.dragging = false;
  activePointers.delete(e.pointerId);

  if (!boardRef.value) return;

  const slots = boardRef.value.querySelectorAll<HTMLElement>('.board-slot-wrapper');
  let placed = false;

  slots.forEach(slot => {
    if (placed) return;
    const slotNum = Number(slot.dataset.num);
    if (slotNum !== p.num) return;

    const rect = slot.getBoundingClientRect();
    const cx = e.clientX;
    const cy = e.clientY;
    const slotCenterX = rect.left + rect.width / 2;
    const slotCenterY = rect.top + rect.height / 2;
    
    // Require pointer to be close to the center of the slot
    if (Math.abs(cx - slotCenterX) < 40 && Math.abs(cy - slotCenterY) < 40) {
      p.placed = true;
      placed = true;
    }
  });

  if (puzzlePieces.value.every(p => p.placed)) {
    onLevelComplete();
  }
}

function onLevelComplete() {
  isComplete.value = true;
  playInstruction(`${getRandomPraise()} You built it!`);
  progressStore.updateStats(GAME_ID, true);
}

const handleNextLevel = () => {
  isComplete.value = false;
  initLevel();
};
</script>

<template>
  <div class="jigsaw-root" @pointermove="onPointerMove" @pointerup="onPointerUp" @pointercancel="onPointerUp">
    <div v-if="!hasStarted" class="start-screen">
      <div class="start-icon"><MenuIcon :gameId="GAME_ID" style="width: 140px; height: 140px;" /></div>
      <h1>Number Puzzle<br><span>Learn & Match</span></h1>
      <p class="start-sub">Place the numbers in their correct spots.</p>
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
        <!-- Standard Top Bar -->
        <header class="top-bar">
          <div class="phase-badge">
            <span style="font-size: 1.5rem; margin-right: 0.5rem">🔢</span>
            Level {{ currentPhase }}
          </div>
          <button class="replay-btn" @click="playHint">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
            Replay
          </button>
        </header>

        <div class="jig-main">
          <!-- Wooden Board containing the empty slots -->
          <div class="board-container">
            <div class="wooden-board" :style="{ 
              gridTemplateColumns: `repeat(${boardColumns}, 100px)`,
              gridTemplateRows: `repeat(${boardRows}, 100px)`
            }" ref="boardRef">
              <div 
                v-for="num in targetSequence" 
                :key="'slot-'+num"
                class="board-slot-wrapper"
                :data-num="num"
              >
                <NumberBlock 
                  :number="num" 
                  :color="COLORS[num % COLORS.length]"
                  :isSlot="!puzzlePieces.find(p => p.num === num)?.placed"
                />
              </div>
            </div>
          </div>

          <!-- Playable Pieces layer -->
          <div class="pieces-layer" ref="piecesLayerRef">
            <div
              v-for="piece in puzzlePieces"
              :key="piece.id"
              v-show="!piece.placed"
              class="piece-container"
              :style="{
                transform: piece.dragging 
                  ? `translate(${piece.dragX - 50}px, ${piece.dragY - 50}px) scale(1.1)` 
                  : `translate(${piece.startX}px, ${piece.startY}px) scale(1)`,
                zIndex: piece.zIndex,
                pointerEvents: piece.placed ? 'none' : 'auto',
                transition: piece.dragging ? 'none' : 'transform 0.3s ease'
              }"
              @pointerdown="onPointerDown($event, piece)"
            >
              <NumberBlock 
                :number="piece.num" 
                :color="piece.color"
              />
            </div>
          </div>
          
          <!-- Tray background visual -->
          <div class="tray-bg"></div>
        </div>
      </div>

      <!-- Completion overlay -->
      <transition name="pop">
        <div v-if="isComplete" class="complete-overlay">
          <div class="complete-card">
            <div class="complete-emoji">🔢</div>
            <h2 class="complete-title">Great Job!</h2>
            <p class="complete-sub">You placed all the numbers! 🎉</p>
            <div class="complete-actions">
              <button class="btn-next" @click="handleNextLevel">Next Board →</button>
              <button class="btn-menu" @click="router.push('/')">🏠 Menu</button>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<style scoped>
/* ── Root ────────────────────────────────────────────────── */
.jigsaw-root {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  user-select: none;
  position: relative;
  overflow: hidden;
  touch-action: none;
}

/* START SCREEN */
.start-screen { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1.5rem; padding: 3rem; }
.start-icon { font-size: 6rem; filter: drop-shadow(0 10px 20px rgba(0,0,0,0.2)); animation: bounce 2s infinite ease-in-out; }
@keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }
.start-screen h1 { font-size: 3.5rem; font-weight: 900; color: var(--text-primary); text-align: center; line-height: 1.15; }
.start-screen h1 span { color: var(--color-blue); }
.start-sub { font-size: 1.4rem; color: var(--text-secondary); text-align: center; max-width: 600px; }
.start-btn { display: flex; align-items: center; gap: 0.75rem; font-size: 1.75rem; font-weight: 700; padding: 1.25rem 3rem; background: var(--color-blue); color: white; border: none; border-radius: 50px; cursor: pointer; box-shadow: 0 8px 24px rgba(59,130,246,0.4); transition: transform 0.15s, box-shadow 0.15s; }
.start-btn:active { transform: scale(0.96); box-shadow: none; }

.game-board { flex: 1; display: flex; flex-direction: column; position: relative; overflow: hidden; }

/* LISTENING INDICATOR */
.listening-mini { position: absolute; top: 1rem; left: 50%; transform: translateX(-50%); z-index: 100; display: flex; align-items: center; gap: 0.75rem; background: var(--color-blue); color: white; padding: 0.5rem 1.25rem; border-radius: 50px; box-shadow: 0 4px 15px rgba(0,0,0,0.3); pointer-events: none; animation: slide-down 0.3s ease-out; }
.speaker-mini { width: 20px; height: 20px; }
.listening-mini span { font-weight: 700; font-size: 1.1rem; }
@keyframes slide-down { from { transform: translate(-50%, -20px); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }

/* LAYOUT */
.action-layout { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
.top-bar { display: flex; align-items: center; justify-content: space-between; padding: 1rem 2rem; background: var(--bg-secondary); border-bottom: 2px solid rgba(255,255,255,0.07); gap: 1rem; flex-shrink: 0; }
.phase-badge { font-size: 1.5rem; font-weight: 900; color: var(--text-primary); display: flex; align-items: center; gap: 0.5rem; }
.replay-btn { display: flex; align-items: center; gap: 0.5rem; font-size: 1.1rem; font-weight: 700; padding: 0.75rem 1.75rem; background: var(--color-orange); color: white; border: none; border-radius: 50px; cursor: pointer; box-shadow: 0 4px 12px rgba(249,115,22,0.35); transition: transform 0.15s; }
.replay-btn:active { transform: scale(0.95); }

/* ── Main layout ─────────────────────────────────────────── */
.jig-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.board-container {
  width: 1280px;
  height: 600px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 40px; /* Offset to keep it away from tray */
}

.wooden-board {
  background-color: #d4a373;
  padding: 20px;
  border-radius: 20px;
  box-shadow: 
    inset 0 4px 0 rgba(255, 255, 255, 0.2),
    0 16px 24px rgba(0,0,0,0.3);
  display: grid;
  gap: 16px;
  border: 4px solid #b88655;
  background-image: repeating-linear-gradient(
    45deg,
    rgba(255,255,255,0.05) 0px,
    rgba(255,255,255,0.05) 20px,
    transparent 20px,
    transparent 40px
  );
}

.board-slot-wrapper {
  width: 100px;
  height: 100px;
  border-radius: 12px;
  position: relative;
}

.pieces-layer {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-640px); /* Center 1280px logical canvas */
  width: 1280px;
  height: 100%;
  pointer-events: none;
}

.piece-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100px;
  height: 100px;
  cursor: grab;
  pointer-events: auto;
  filter: drop-shadow(0 10px 15px rgba(0,0,0,0.2));
}

.piece-container:active {
  cursor: grabbing;
}

.tray-bg {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-640px);
  width: 1280px;
  height: 280px;
  background: rgba(0, 0, 0, 0.15);
  border-top-left-radius: 40px;
  border-top-right-radius: 40px;
  z-index: -1;
  box-shadow: inset 0 4px 12px rgba(0,0,0,0.1);
}

/* ── Overlays ────────────────────────────────────────────── */
.complete-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.complete-card { background: var(--bg-secondary); padding: 4rem; border-radius: 32px; text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.4); border: 2px solid rgba(255,255,255,0.1); animation: bounce-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1); }
.complete-emoji { font-size: 5rem; margin-bottom: 1rem; filter: drop-shadow(0 10px 15px rgba(0,0,0,0.2)); }
.complete-title { font-size: 3.5rem; font-weight: 900; color: white; margin-bottom: 0.5rem; }
.complete-sub { font-size: 1.5rem; color: var(--text-secondary); margin-bottom: 3rem; }
.complete-actions { display: flex; gap: 1rem; justify-content: center; }
.btn-next, .btn-menu { font-size: 1.4rem; font-weight: 700; padding: 1rem 2rem; border-radius: 50px; border: none; cursor: pointer; transition: transform 0.15s; }
.btn-next { background: var(--color-green); color: white; box-shadow: 0 8px 20px rgba(34,197,94,0.3); }
.btn-menu { background: rgba(255,255,255,0.1); color: white; }
.btn-next:active, .btn-menu:active { transform: scale(0.95); }

/* Transitions */
.pop-enter-active, .pop-leave-active { transition: opacity 0.3s, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.pop-enter-from, .pop-leave-to { opacity: 0; transform: scale(0.9); }
@keyframes bounce-in { 0% { transform: scale(0.5); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
</style>
