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

const router = useRouter();
const progressStore = useProgressStore();
const gameStore = useGameStore();
const GAME_ID = 'fun-size-sorter';

const hasStarted = ref(false);
const isComplete = ref(false);
const { playInstruction, isPlaying } = useSpeech();
const log = useLogger(GAME_ID);

const COLORS = [
  '#ef4444', // Red
  '#f97316', // Orange
  '#facc15', // Yellow
  '#22c55e', // Green
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#8b5cf6', // Violet
];

interface RingItem {
  id: number;
  sizeIndex: number; // 0 is largest, N is smallest
  width: number;
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
// Map phase 1-5 to 3-7 rings
const ringCount = computed(() => Math.min(currentPhase.value + 2, COLORS.length));

const puzzlePieces = ref<RingItem[]>([]);
const piecesLayerRef = ref<HTMLElement | null>(null);
const pegRef = ref<HTMLElement | null>(null);

let zIndexCounter = 10;
const placedRings = ref<number[]>([]); // Array of sizeIndexes currently on the peg

const { currentLevel: promptLevel, resetAll: resetPrompt } = usePromptFading('none');

const initLevel = async () => {
  isComplete.value = false;
  puzzlePieces.value = [];
  placedRings.value = [];
  resetPrompt('none');
  
  const count = ringCount.value;
  const items: RingItem[] = [];
  
  // Create rings
  for (let i = 0; i < count; i++) {
    items.push({
      id: i,
      sizeIndex: i, // 0 = largest (bottom), count-1 = smallest (top)
      width: 240 - (i * 25), // Scale down nicely
      color: COLORS[i],
      startX: 0,
      startY: 0,
      dragX: 0,
      dragY: 0,
      dragging: false,
      placed: false,
      zIndex: ++zIndexCounter
    });
  }

  // Shuffle start positions
  const shuffledItems = shuffle([...items]);

  shuffledItems.forEach((ring, index) => {
    // Alternate left and right sides of the peg
    const isLeft = index % 2 === 0;
    const sideIndex = Math.floor(index / 2);
    
    // Spread out vertically along the sides
    const startY = 250 + (sideIndex * 100);
    
    // X positions (center of the 1280 canvas is 640. Peg takes up ~490 to 790)
    const startX = isLeft ? 250 : 1030;

    ring.startX = startX;
    ring.startY = startY;
    ring.dragX = startX;
    ring.dragY = startY;
    puzzlePieces.value.push(ring);
  });

  await nextTick();
  playInstruction('Stack the rings from biggest to smallest!');
};

const handleStart = () => {
  hasStarted.value = true;
  initLevel();
};

const activePointers = new Map<number, RingItem>();

function onPointerDown(e: PointerEvent, piece: RingItem) {
  if (piece.placed) return; // Cannot drag placed rings
  
  // Extra Rule: Only allow dragging if this is the ONLY valid ring to place next? No, let them drag any, but drop will fail if wrong.
  
  e.preventDefault();
  (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  activePointers.set(e.pointerId, piece);
  piece.dragging = true;
  piece.zIndex = ++zIndexCounter;
  
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

  if (!pegRef.value) {
    p.dragX = p.startX;
    p.dragY = p.startY;
    return;
  }

  const pegRect = pegRef.value.getBoundingClientRect();
  const cx = e.clientX;
  const cy = e.clientY;
  
  // Peg center and hit box
  const pegCenterX = pegRect.left + pegRect.width / 2;
  const hitBoxYTop = pegRect.top - 100;
  const hitBoxYBottom = pegRect.bottom + 50;

  // Check if dropped near the peg
  if (Math.abs(cx - pegCenterX) < 150 && cy > hitBoxYTop && cy < hitBoxYBottom) {
    
    // Check game logic: Must be the next expected ring in sequence
    // The expected sizeIndex is placedRings.length (since it starts at 0 and increments)
    const expectedSizeIndex = placedRings.value.length;
    
    if (p.sizeIndex === expectedSizeIndex) {
      // Valid placement!
      p.placed = true;
      placedRings.value.push(p.sizeIndex);
      
      // Calculate stacking position on peg
      if (piecesLayerRef.value) {
        const layerRect = piecesLayerRef.value.getBoundingClientRect();
        p.dragX = pegCenterX - layerRect.left;
        
        // Stack height: Base is near bottom of peg, each ring goes higher
        const pegBaseY = pegRect.bottom - layerRect.top - 20; // 20px offset from absolute bottom
        const ringHeight = 40;
        p.dragY = pegBaseY - (placedRings.value.length * ringHeight);
      }
      
      p.startX = p.dragX;
      p.startY = p.dragY;
    } else {
      // Dropped wrong ring
      if (expectedSizeIndex === 0) {
        playInstruction('Start with number 1, the biggest ring!');
      } else {
        playInstruction(`Find number ${expectedSizeIndex + 1}!`);
      }
    }
  }

  if (!p.placed) {
    // Snap back or rejected
    p.dragX = p.startX;
    p.dragY = p.startY;
  }

  if (placedRings.value.length === ringCount.value) {
    onLevelComplete();
  }
}

function onLevelComplete() {
  if (gameStore.isRandomMode) { setTimeout(() => { if (!gameStore.advanceRandomRound()) handleNextLevel(); }, 2500); } else { isComplete.value = true; }
  log.generate({ level: 1, phase: currentPhase.value, pieces: ringCount.value });
  playInstruction(`${getRandomPraise()} You sorted them all!`);
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
    <!-- Start Screen -->
    <div v-if="!hasStarted" class="start-screen">
      <div class="start-icon"><MenuIcon :gameId="GAME_ID" style="width: 140px; height: 140px;" /></div>
      <h1>Size Sorter<br><span>Stack & Learn</span></h1>
      <p class="start-sub">Stack the rings from biggest to smallest!</p>
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
          <button class="replay-btn" @click="playInstruction('Stack the rings from biggest to smallest!')" :disabled="isPlaying">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
            Replay
          </button>
        </header>

        <div class="jig-main">
          <!-- The Stick -->
          <div class="board" ref="pegRef">
            <div class="base"></div>
            <div class="stick"></div>
          </div>

          <!-- Pieces Layer -->
          <div class="pieces-layer" ref="piecesLayerRef">
            <div 
              v-for="piece in puzzlePieces" 
              :key="piece.id"
              class="piece-tray-item"
              :class="{ dragging: piece.dragging, placed: piece.placed, 'is-target': !piece.placed && piece.sizeIndex === placedRings.length }"
              :style="{
                transform: piece.dragging ? `translate(${piece.dragX - piece.width/2}px, ${piece.dragY - 20}px) scale(1.05)` : `translate(${piece.startX - piece.width/2}px, ${piece.startY - 20}px) scale(1)`,
                zIndex: piece.zIndex,
                width: piece.width + 'px',
                height: '40px',
                background: piece.color
              }"
              @pointerdown="onPointerDown($event, piece)"
            >
              <span v-if="piece.placed || piece.dragging" class="ring-number">{{ piece.sizeIndex + 1 }}</span>
            </div>
          </div>

          <transition name="pop">
            <div v-if="isComplete" class="complete-overlay">
              <div class="complete-card">
                <div class="complete-emoji">🎉</div>
                <h2 class="complete-title">Great Job!</h2>
                <p class="complete-sub">You sorted them all!</p>
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

/* STICK */
.board {
  position: absolute;
  top: 150px;
  left: 50%;
  transform: translateX(-50%);
  width: 300px;
  height: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
}
.stick {
  width: 20px;
  height: 380px;
  background: #d4d4d8;
  border-radius: 10px 10px 0 0;
  box-shadow: inset 4px 0 8px rgba(0,0,0,0.1);
}
.base {
  width: 240px;
  height: 20px;
  background: #a1a1aa;
  border-radius: 10px;
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
  border-radius: 20px;
  border: 3px solid rgba(255,255,255,0.5);
  pointer-events: auto;
  cursor: grab;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 8px 15px rgba(0,0,0,0.2), inset 0 4px 6px rgba(255,255,255,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
}
.ring-number {
  color: rgba(255, 255, 255, 0.9);
  font-weight: bold;
  font-size: 1.5rem;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}
.piece-tray-item.dragging {
  cursor: grabbing;
  transition: none;
  box-shadow: 0 15px 25px rgba(0,0,0,0.3), inset 0 4px 6px rgba(255,255,255,0.4);
}
.piece-tray-item.placed {
  pointer-events: none;
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 2px 5px rgba(0,0,0,0.1), inset 0 4px 6px rgba(255,255,255,0.4);
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
