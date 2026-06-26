<script setup lang="ts">
import { getRandomPraise } from '../../../utils/praises';
import { shuffle } from '../../../utils/shuffle';
import { onMounted, ref, computed, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useProgressStore } from '../../../stores/useProgressStore';
import { useGameStore } from '../../../stores/useGameStore';
import MenuIcon from '../../../components/game/MenuIcon.vue';
import { useSpeech } from '../../../composables/useSpeech';
import { usePromptFading } from '../../../composables/usePromptFading';
import { useLogger } from '../../../composables/useLogger';
import ShapeBlock from '../ShapeSorter/ShapeBlock.vue';

const router = useRouter();
const progressStore = useProgressStore();
const gameStore = useGameStore();
const GAME_ID = 'fun-pattern-train';

const hasStarted = ref(false);
const isComplete = ref(false);
const { playInstruction, isPlaying } = useSpeech();
const log = useLogger(GAME_ID);

const SHAPES = ['circle', 'square', 'triangle', 'star', 'hexagon'];
const COLORS = ['#ef4444', '#3b82f6', '#facc15', '#22c55e', '#a855f7'];

interface PatternPiece {
  shape: string;
  color: string;
}

interface DragItem {
  id: string;
  piece: PatternPiece;
  startX: number;
  startY: number;
  dragX: number;
  dragY: number;
  dragging: boolean;
  placed: boolean;
  zIndex: number;
  isTarget: boolean;
}

const currentPhase = computed(() => progressStore.moduleStats[GAME_ID]?.currentPhase || 1);
const currentOptionCount = computed(() => progressStore.moduleStats[GAME_ID]?.currentOptionCount || 3);



const trainSequence = ref<PatternPiece[]>([]);
const missingPiece = ref<PatternPiece | null>(null);
const puzzlePieces = ref<DragItem[]>([]);
const boardRef = ref<HTMLElement | null>(null);
const piecesLayerRef = ref<HTMLElement | null>(null);

let zIndexCounter = 10;
const { currentLevel: promptLevel, resetAll: resetPrompt } = usePromptFading('none');

const generatePattern = () => {
  // Shuffle pools
  const sPool = shuffle([...SHAPES]);
  const cPool = shuffle([...COLORS]);

  const A = { shape: sPool[0], color: cPool[0] };
  const B = { shape: sPool[1], color: cPool[1] };
  const C = { shape: sPool[2], color: cPool[2] };

  let pattern: PatternPiece[] = [];
  
  if (currentPhase.value === 1) {
    // ABAB
    pattern = [A, B, A, B, A]; 
  } else if (currentPhase.value === 2) {
    // AABBAA
    pattern = [A, A, B, B, A, A];
  } else if (currentPhase.value === 3) {
    // ABCABC
    pattern = [A, B, C, A, B, C];
  } else {
    // ABCDABCD
    const D = { shape: sPool[3], color: cPool[3] };
    pattern = [A, B, C, D, A, B, C, D];
  }

  // The last item is the missing one
  missingPiece.value = pattern.pop() || null;
  trainSequence.value = pattern;

  // Generate options for tray
  const options = [missingPiece.value!];
  
  // Add distractors from the pattern set
  const set = Array.from(new Set(pattern.map(p => JSON.stringify(p)))).map(p => JSON.parse(p));
  for (const item of set) {
    if (options.length >= currentOptionCount.value) break;
    if (item.shape !== missingPiece.value!.shape || item.color !== missingPiece.value!.color) {
      options.push(item);
    }
  }

  // If we still need more distractors, generate random ones
  while (options.length < currentOptionCount.value) {
    const randomItem = { 
      shape: SHAPES[Math.floor(Math.random() * SHAPES.length)], 
      color: COLORS[Math.floor(Math.random() * COLORS.length)] 
    };
    if (!options.some(o => o.shape === randomItem.shape && o.color === randomItem.color)) {
      options.push(randomItem);
    }
  }

  return shuffle(options);
};

const initLevel = async () => {
  isComplete.value = false;
  puzzlePieces.value = [];
  resetPrompt('none');
  
  const options = generatePattern();

  const trayCols = options.length;
  const pieceWidth = 100;
  const spacing = 30;
  const totalWidth = trayCols * pieceWidth + (trayCols - 1) * spacing;

  options.forEach((opt, i) => {
    const startX = 640 - (totalWidth / 2) + (i * (pieceWidth + spacing)) + (pieceWidth / 2);
    const startY = 600;

    puzzlePieces.value.push({
      id: `piece-${i}`,
      piece: opt,
      startX,
      startY,
      dragX: startX,
      dragY: startY,
      dragging: false,
      placed: false,
      zIndex: ++zIndexCounter,
      isTarget: opt.shape === missingPiece.value!.shape && opt.color === missingPiece.value!.color
    });
  });

  await nextTick();
  playInstruction('Complete the pattern!');
};

const handleStart = () => {
  hasStarted.value = true;
  initLevel();
};

const activePointers = new Map<number, DragItem>();

function onPointerDown(e: PointerEvent, piece: DragItem) {
  if (piece.placed) return;
  e.preventDefault();
  (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  activePointers.set(e.pointerId, piece);
  piece.dragging = true;
  piece.zIndex = ++zIndexCounter;
  
  if (piecesLayerRef.value) {
    const rect = piecesLayerRef.value.getBoundingClientRect();
    piece.dragX = e.clientX - rect.left;
    piece.dragY = e.clientY - rect.top;
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

  if (!boardRef.value) {
    p.dragX = p.startX;
    p.dragY = p.startY;
    return;
  }

  const dropZone = boardRef.value.querySelector('.empty-car');
  if (dropZone) {
    const rect = dropZone.getBoundingClientRect();
    const cx = e.clientX;
    const cy = e.clientY;
    
    const zoneCenterX = rect.left + rect.width / 2;
    const zoneCenterY = rect.top + rect.height / 2;

    if (Math.abs(cx - zoneCenterX) < 60 && Math.abs(cy - zoneCenterY) < 60) {
      if (p.isTarget) {
        p.placed = true;
        if (piecesLayerRef.value) {
          const layerRect = piecesLayerRef.value.getBoundingClientRect();
          p.dragX = zoneCenterX - layerRect.left;
          p.dragY = zoneCenterY - layerRect.top - 10; // slightly above the car floor
        }
        p.startX = p.dragX;
        p.startY = p.dragY;
        onLevelComplete();
        return;
      } else {
        // Wrong piece dropped in zone
        playInstruction('Try again!');
      }
    }
  }

  // Snap back
  p.dragX = p.startX;
  p.dragY = p.startY;
}

function onLevelComplete() {
  if (gameStore.isRandomMode) { setTimeout(() => { if (!gameStore.advanceRandomRound()) handleNextLevel(); }, 2500); } else { isComplete.value = true; }
  log.generate({ level: 1, phase: currentPhase.value, pieces: currentOptionCount.value });
  playInstruction(`${getRandomPraise()} You finished the pattern!`);
  progressStore.updateStats(GAME_ID, true);
  resetPrompt();
}

const handleNextLevel = () => {
  if (gameStore.isRandomMode) {
    isComplete.value = false;
    initLevel();
  } else {
    isComplete.value = false;
    initLevel();
  }
};

onMounted(() => {
  // In Random Mode, bypass the start screen and begin immediately
  if (gameStore.isRandomMode) handleStart();
});
</script>

<template>
  <div class="jigsaw-root" :class="{ 'prompt-active': promptLevel === 'partial' || promptLevel === 'full' }" @pointermove="onPointerMove" @pointerup="onPointerUp" @pointercancel="onPointerUp">
    <div v-if="!hasStarted" class="start-screen">
      <div class="start-icon"><MenuIcon :gameId="GAME_ID" style="width: 140px; height: 140px;" /></div>
      <h1>Pattern Train<br><span>Complete & Learn</span></h1>
      <p class="start-sub">Find the missing piece to complete the train.</p>
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
          <button class="replay-btn" @click="playInstruction('Complete the pattern!')" :disabled="isPlaying">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
            Replay
          </button>
        </header>

        <div class="jig-main">
          <!-- The Train -->
          <div class="board" ref="boardRef">
            <!-- Engine -->
            <div class="train-engine">
              <div class="chimney"></div>
              <div class="cab"></div>
              <div class="engine-body"></div>
              <div class="wheels">
                <div class="wheel"></div>
                <div class="wheel"></div>
                <div class="wheel"></div>
              </div>
            </div>

            <!-- Train Cars -->
            <div class="train-car" v-for="(item, idx) in trainSequence" :key="'car-'+idx">
              <div class="link"></div>
              <div class="car-body">
                <ShapeBlock :shape="item.shape" :color="item.color" style="transform: scale(0.8);" />
              </div>
              <div class="wheels"><div class="wheel"></div><div class="wheel"></div></div>
            </div>

            <!-- Empty Car (Drop Zone) -->
            <div class="train-car empty-car">
              <div class="link"></div>
              <div class="car-body drop-zone">
                <div class="drop-hint">?</div>
              </div>
              <div class="wheels"><div class="wheel"></div><div class="wheel"></div></div>
            </div>
          </div>

          <!-- Pieces Layer -->
          <div class="pieces-layer" ref="piecesLayerRef">
            <div 
              v-for="piece in puzzlePieces" 
              :key="piece.id"
              class="piece-tray-item"
              :class="{ dragging: piece.dragging, placed: piece.placed, 'is-target': !piece.placed && piece.isTarget }"
              :style="{
                transform: piece.dragging ? `translate(${piece.dragX - 50}px, ${piece.dragY - 50}px) scale(1.1)` : `translate(${piece.startX - 50}px, ${piece.startY - 50}px) scale(1)`,
                zIndex: piece.zIndex
              }"
              @pointerdown="onPointerDown($event, piece)"
            >
              <ShapeBlock :shape="piece.piece.shape" :color="piece.piece.color" />
            </div>
          </div>

          <transition name="pop">
            <div v-if="isComplete" class="complete-overlay">
              <div class="complete-card">
                <div class="complete-emoji">🚂</div>
                <h2 class="complete-title">Great Job!</h2>
                <p class="complete-sub">You finished the pattern!</p>
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

/* BOARD / TRAIN */
.board {
  position: absolute;
  top: 150px;
  width: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.train-engine {
  position: relative;
  width: 140px;
  height: 120px;
  margin-right: 10px;
}
.engine-body {
  position: absolute;
  bottom: 20px;
  right: 0;
  width: 140px;
  height: 60px;
  background: #3b82f6;
  border-radius: 20px 10px 10px 10px;
}
.cab {
  position: absolute;
  bottom: 80px;
  right: 10px;
  width: 60px;
  height: 60px;
  background: #2563eb;
  border-radius: 10px 10px 0 0;
}
.cab::after {
  content: '';
  position: absolute;
  top: 10px;
  left: 10px;
  width: 40px;
  height: 30px;
  background: #bfdbfe;
  border-radius: 5px;
}
.chimney {
  position: absolute;
  bottom: 80px;
  left: 20px;
  width: 20px;
  height: 40px;
  background: #1d4ed8;
  border-radius: 5px;
}
.wheels {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: space-around;
}
.wheel {
  width: 30px;
  height: 30px;
  background: #333;
  border-radius: 50%;
  border: 4px solid #9ca3af;
}

.train-car {
  position: relative;
  width: 120px;
  height: 100px;
  margin-left: 5px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}
.car-body {
  width: 100%;
  height: 60px;
  background: #e5e7eb;
  border: 4px solid #9ca3af;
  border-radius: 10px 10px 10px 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  position: relative;
}
.link {
  position: absolute;
  bottom: 30px;
  left: -20px;
  width: 20px;
  height: 8px;
  background: #6b7280;
}
.drop-zone {
  background: rgba(255,255,255,0.5);
  border: 4px dashed #9ca3af;
}
.drop-hint {
  font-size: 2rem;
  font-weight: bold;
  color: #9ca3af;
}

/* PIECES */
.pieces-layer {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-640px); /* Center 1280px logical canvas */
  width: 1280px;
  height: 100%;
  pointer-events: none;
}
.piece-tray-item {
  position: absolute;
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
  cursor: grab;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  filter: drop-shadow(0 10px 15px rgba(0,0,0,0.2));
}
.piece-tray-item.dragging {
  cursor: grabbing;
  transition: none;
  filter: drop-shadow(0 20px 25px rgba(0,0,0,0.3));
}
.piece-tray-item.placed {
  pointer-events: none;
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));
}

/* Prompt */
.prompt-active .piece-tray-item.is-target {
  animation: promptPulse 2s infinite;
}
@keyframes promptPulse {
  /* Only animate filter — never touch transform so the translate position is preserved */
  0%   { filter: drop-shadow(0 10px 15px rgba(0,0,0,0.2)) brightness(1); }
  50%  { filter: drop-shadow(0 0 18px rgba(255,215,0,1)) brightness(1.25); }
  100% { filter: drop-shadow(0 10px 15px rgba(0,0,0,0.2)) brightness(1); }
}
</style>
