<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useProgressStore } from '../../../stores/useProgressStore';
import MenuIcon from '../../../components/game/MenuIcon.vue';
import { useSpeech } from '../../../composables/useSpeech';
import { usePromptFading } from '../../../composables/usePromptFading';
import { useLogger } from '../../../composables/useLogger';
import ColorfulAnimal from '../AnimalJigsaw/ColorfulAnimal.vue';
import ColorfulVehicle from '../VehicleJigsaw/ColorfulVehicle.vue';

const router = useRouter();
const progressStore = useProgressStore();
const GAME_ID = 'fun-category-bins';

const hasStarted = ref(false);
const isComplete = ref(false);
const { playInstruction, isPlaying } = useSpeech();
const log = useLogger(GAME_ID);

const ANIMALS = ['cat', 'dog', 'rabbit', 'frog', 'pig', 'lion', 'elephant', 'penguin'];
const VEHICLES = ['car', 'bus', 'train', 'airplane', 'boat', 'submarine', 'rocket', 'truck'];

type Category = 'animal' | 'vehicle';

interface SortItem {
  id: string;
  category: Category;
  assetId: string;
  startX: number;
  startY: number;
  dragX: number;
  dragY: number;
  dragging: boolean;
  placed: boolean;
  zIndex: number;
}

const currentPhase = computed(() => progressStore.moduleStats[GAME_ID]?.currentPhase || 1);

// Map phase 1-5 to 4-12 items
const itemCount = computed(() => {
  return 4 + (currentPhase.value - 1) * 2;
});

const puzzlePieces = ref<SortItem[]>([]);
const boardRef = ref<HTMLElement | null>(null);
const piecesLayerRef = ref<HTMLElement | null>(null);

let zIndexCounter = 10;
const { currentLevel: promptLevel, resetAll: resetPrompt } = usePromptFading('none');

const initLevel = async () => {
  isComplete.value = false;
  puzzlePieces.value = [];
  resetPrompt('none');
  
  const count = itemCount.value;
  // Ensure even split or close to it
  const numAnimals = Math.floor(count / 2);
  const numVehicles = count - numAnimals;

  const aPool = [...ANIMALS].sort(() => Math.random() - 0.5).slice(0, numAnimals);
  const vPool = [...VEHICLES].sort(() => Math.random() - 0.5).slice(0, numVehicles);

  const items: SortItem[] = [];

  aPool.forEach((a, i) => items.push({
    id: `animal-${i}`, category: 'animal', assetId: a, 
    startX: 0, startY: 0, dragX: 0, dragY: 0, dragging: false, placed: false, zIndex: 0
  }));
  vPool.forEach((v, i) => items.push({
    id: `vehicle-${i}`, category: 'vehicle', assetId: v, 
    startX: 0, startY: 0, dragX: 0, dragY: 0, dragging: false, placed: false, zIndex: 0
  }));

  const shuffledItems = items.sort(() => Math.random() - 0.5);

  const trayCols = Math.max(4, Math.ceil(shuffledItems.length / 2));
  const pieceWidth = 120;
  const pieceHeight = 120;
  const spacing = 30;

  shuffledItems.forEach((item, index) => {
    const row = Math.floor(index / trayCols);
    const col = index % trayCols;
    
    const itemsInRow = row === Math.floor(shuffledItems.length / trayCols) && shuffledItems.length % trayCols !== 0 
      ? shuffledItems.length % trayCols 
      : trayCols;
    const rowWidth = itemsInRow * pieceWidth + (itemsInRow - 1) * spacing;
    
    const startX = 640 - (rowWidth / 2) + (col * (pieceWidth + spacing)) + (pieceWidth / 2);
    const startY = 560 + (row * (pieceHeight + spacing));

    item.startX = startX;
    item.startY = startY;
    item.dragX = startX;
    item.dragY = startY;
    item.zIndex = ++zIndexCounter;
    puzzlePieces.value.push(item);
  });

  await nextTick();
  playInstruction('Sort the animals and vehicles!');
};

const handleStart = () => {
  hasStarted.value = true;
  initLevel();
};

const activePointers = new Map<number, SortItem>();

function onPointerDown(e: PointerEvent, piece: SortItem) {
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

  const bins = boardRef.value.querySelectorAll('.bin');
  let placed = false;

  bins.forEach((bin) => {
    if (placed) return;
    const el = bin as HTMLElement;
    const binCategory = el.dataset.category;
    const rect = el.getBoundingClientRect();
    const cx = e.clientX;
    const cy = e.clientY;

    if (
      cx > rect.left && cx < rect.right &&
      cy > rect.top && cy < rect.bottom
    ) {
      if (binCategory === p.category) {
        // Valid bin drop
        p.placed = true;
        placed = true;
        
        // Hide it in the bin (shrink & disappear)
        if (piecesLayerRef.value) {
          const layerRect = piecesLayerRef.value.getBoundingClientRect();
          p.dragX = rect.left + rect.width / 2 - layerRect.left;
          p.dragY = rect.top + rect.height / 2 - layerRect.top;
        }
      } else {
        playInstruction('Try the other bin!');
      }
    }
  });

  if (!placed) {
    p.dragX = p.startX;
    p.dragY = p.startY;
  }

  if (puzzlePieces.value.every(p => p.placed)) {
    onLevelComplete();
  }
}

function onLevelComplete() {
  isComplete.value = true;
  log.generate({ level: 1, phase: currentPhase.value, pieces: itemCount.value });
  playInstruction('Great job! You cleaned it all up!');
  progressStore.updateStats(GAME_ID, true);
  resetPrompt();
}

const handleNextLevel = () => {
  isComplete.value = false;
  initLevel();
};
</script>

<template>
  <div class="jigsaw-root" :class="{ 'prompt-active': promptLevel === 'partial' || promptLevel === 'full' }" @pointermove="onPointerMove" @pointerup="onPointerUp" @pointercancel="onPointerUp">
    <div v-if="!hasStarted" class="start-screen">
      <div class="start-icon"><MenuIcon :gameId="GAME_ID" style="width: 140px; height: 140px;" /></div>
      <h1>Category Bins<br><span>Sort & Learn</span></h1>
      <p class="start-sub">Sort the toys into the correct bins!</p>
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
          <button class="replay-btn" @click="playInstruction('Sort the animals and vehicles!')" :disabled="isPlaying">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
            Replay
          </button>
        </header>

        <div class="jig-main">
          <!-- Bins Board -->
          <div class="board" ref="boardRef">
            <div class="bin" data-category="animal">
              <div class="bin-label">Animals</div>
              <div class="bin-basket"></div>
            </div>
            <div class="bin" data-category="vehicle">
              <div class="bin-label">Vehicles</div>
              <div class="bin-basket"></div>
            </div>
          </div>

          <!-- Pieces Layer -->
          <div class="pieces-layer" ref="piecesLayerRef">
            <div 
              v-for="piece in puzzlePieces" 
              :key="piece.id"
              class="piece-tray-item"
              :class="{ dragging: piece.dragging, placed: piece.placed, 'is-target': !piece.placed && (promptLevel === 'partial' || promptLevel === 'full') }"
              :style="{
                transform: piece.dragging ? `translate(${piece.dragX - 60}px, ${piece.dragY - 60}px) scale(1.1)` : (piece.placed ? `translate(${piece.dragX - 60}px, ${piece.dragY - 60}px) scale(0.5)` : `translate(${piece.startX - 60}px, ${piece.startY - 60}px) scale(1)`),
                zIndex: piece.zIndex,
                opacity: piece.placed ? 0 : 1
              }"
              @pointerdown="onPointerDown($event, piece)"
            >
              <ColorfulAnimal v-if="piece.category === 'animal'" :name="piece.assetId" style="width: 120px; height: 120px;" />
              <ColorfulVehicle v-else :name="piece.assetId" style="width: 120px; height: 120px;" />
            </div>
          </div>

          <transition name="pop">
            <div v-if="isComplete" class="complete-overlay">
              <div class="complete-card">
                <div class="complete-emoji">🎉</div>
                <h2 class="complete-title">Great Job!</h2>
                <p class="complete-sub">You cleaned it all up!</p>
                <div class="complete-actions">
                  <button class="btn-next" @click="handleNextLevel">Next Level →</button>
                  <button class="btn-menu" @click="router.push('/fun-games')">🏠 Menu</button>
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

/* BOARD / BINS */
.board {
  position: absolute;
  top: 150px;
  width: 100%;
  display: flex;
  justify-content: space-around;
  padding: 0 100px;
}
.bin {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.bin-label {
  font-size: 2.5rem;
  font-weight: 800;
  color: #1e3a8a;
  margin-bottom: 1rem;
  background: white;
  padding: 0.5rem 2rem;
  border-radius: 9999px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
.bin-basket {
  width: 260px;
  height: 200px;
  background: linear-gradient(180deg, #dbeafe 0%, #93c5fd 100%);
  border: 8px solid #3b82f6;
  border-radius: 20px 20px 40px 40px;
  box-shadow: inset 0 -20px 20px rgba(0,0,0,0.1), 0 10px 20px rgba(0,0,0,0.2);
  position: relative;
}
.bin-basket::after {
  content: '';
  position: absolute;
  top: 20px;
  left: 20px;
  right: 20px;
  bottom: 20px;
  border: 4px dashed rgba(255,255,255,0.5);
  border-radius: 10px 10px 20px 20px;
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
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
  cursor: grab;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease;
  filter: drop-shadow(0 10px 15px rgba(0,0,0,0.2));
}
.piece-tray-item.dragging {
  cursor: grabbing;
  transition: none;
  filter: drop-shadow(0 20px 25px rgba(0,0,0,0.3));
}
.piece-tray-item.placed {
  pointer-events: none;
  filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));
}

/* Prompt */
.prompt-active .piece-tray-item.is-target {
  animation: promptPulse 2s infinite;
}
@keyframes promptPulse {
  0% { transform: scale(1); filter: drop-shadow(0 10px 15px rgba(0,0,0,0.2)) brightness(1); }
  50% { transform: scale(1.05); filter: drop-shadow(0 10px 15px rgba(255,215,0,0.8)) brightness(1.2); }
  100% { transform: scale(1); filter: drop-shadow(0 10px 15px rgba(0,0,0,0.2)) brightness(1); }
}
</style>
