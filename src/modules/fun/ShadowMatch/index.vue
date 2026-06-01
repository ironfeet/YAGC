<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useProgressStore } from '../../../stores/useProgressStore';
import MenuIcon from '../../../components/game/MenuIcon.vue';
import { useSpeech } from '../../../composables/useSpeech';
import ColorfulAnimal from '../AnimalJigsaw/ColorfulAnimal.vue';
import { usePromptFading } from '../../../composables/usePromptFading';
import { useLogger } from '../../../composables/useLogger';

const router = useRouter();
const progressStore = useProgressStore();
const GAME_ID = 'fun-shadow-match';

const hasStarted = ref(false);
const isComplete = ref(false);
const { playInstruction, isPlaying } = useSpeech();
const log = useLogger(GAME_ID);

type AnimalDef = { id: string; label: string; emoji: string; };

const ANIMALS: AnimalDef[] = [
  { id: 'cat', label: 'Cat', emoji: '🐱' },
  { id: 'dog', label: 'Dog', emoji: '🐶' },
  { id: 'rabbit', label: 'Rabbit', emoji: '🐰' },
  { id: 'frog', label: 'Frog', emoji: '🐸' },
  { id: 'pig', label: 'Pig', emoji: '🐷' },
  { id: 'lion', label: 'Lion', emoji: '🦁' },
  { id: 'elephant', label: 'Elephant', emoji: '🐘' },
  { id: 'penguin', label: 'Penguin', emoji: '🐧' },
  { id: 'fox', label: 'Fox', emoji: '🦊' },
  { id: 'bear', label: 'Bear', emoji: '🐻' },
  { id: 'monkey', label: 'Monkey', emoji: '🐵' },
  { id: 'owl', label: 'Owl', emoji: '🦉' },
  { id: 'duck', label: 'Duck', emoji: '🦆' },
  { id: 'turtle', label: 'Turtle', emoji: '🐢' },
  { id: 'fish', label: 'Fish', emoji: '🐟' },
  { id: 'ladybug', label: 'Ladybug', emoji: '🐞' },
  { id: 'cow', label: 'Cow', emoji: '🐮' },
  { id: 'sheep', label: 'Sheep', emoji: '🐑' },
  { id: 'horse', label: 'Horse', emoji: '🐴' },
  { id: 'hippo', label: 'Hippo', emoji: '🦛' },
  { id: 'rhino', label: 'Rhino', emoji: '🦏' },
  { id: 'crocodile', label: 'Crocodile', emoji: '🐊' },
  { id: 'tiger', label: 'Tiger', emoji: '🐯' },
  { id: 'zebra', label: 'Zebra', emoji: '🦓' },
];

interface ShadowItem {
  id: string;
  animalId: string;
  startX: number;
  startY: number;
  dragX: number;
  dragY: number;
  dragging: boolean;
  placed: boolean;
  zIndex: number;
}

const currentOptionCount = computed(() => progressStore.moduleStats[GAME_ID]?.currentOptionCount || 2);

// Generate the sequence of animals based on currentOptionCount
const targetSequence = computed(() => {
  const count = Math.min(currentOptionCount.value, ANIMALS.length);
  // We want a deterministic set per level for simplicity in ABA, but here we can just pick the first `count` shuffled
  return [...ANIMALS].sort(() => Math.random() - 0.5).slice(0, count);
});

const boardColumns = computed(() => {
  const len = targetSequence.value.length;
  if (len <= 2) return 2;
  if (len <= 4) return 2;
  if (len <= 6) return 3;
  if (len <= 8) return 4;
  return 5;
});

const boardRows = computed(() => Math.ceil(targetSequence.value.length / boardColumns.value));

const puzzlePieces = ref<ShadowItem[]>([]);
const boardRef = ref<HTMLElement | null>(null);
const piecesLayerRef = ref<HTMLElement | null>(null);

let zIndexCounter = 10;

const { currentLevel: promptLevel, resetAll: resetPrompt } = usePromptFading('none');

const initLevel = async () => {
  isComplete.value = false;
  puzzlePieces.value = [];
  resetPrompt('none');
  
  const seq = [...targetSequence.value];
  // Shuffle pieces
  for (let i = seq.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [seq[i], seq[j]] = [seq[j], seq[i]];
  }

  const trayCols = Math.max(5, Math.ceil(seq.length / 2));
  const pieceWidth = 140;
  const pieceHeight = 140;
  const spacing = 16;

  seq.forEach((animal, index) => {
    const row = Math.floor(index / trayCols);
    const col = index % trayCols;
    
    // Spread in a grid within the tray area
    const itemsInRow = row === Math.floor(seq.length / trayCols) && seq.length % trayCols !== 0 
      ? seq.length % trayCols 
      : trayCols;
    const rowWidth = itemsInRow * pieceWidth + (itemsInRow - 1) * spacing;
    
    const startX = 640 - (rowWidth / 2) + (col * (pieceWidth + spacing));
    const startY = 480 + (row * (pieceHeight + spacing));

    puzzlePieces.value.push({
      id: `piece-${animal.id}`,
      animalId: animal.id,
      startX,
      startY,
      dragX: startX,
      dragY: startY,
      dragging: false,
      placed: false,
      zIndex: ++zIndexCounter
    });
  });

  await nextTick();
  playInstruction('Match the animals to their shadows!');
};

const handleStart = () => {
  hasStarted.value = true;
  initLevel();
};

const activePointers = new Map<number, ShadowItem>();

function onPointerDown(e: PointerEvent, piece: ShadowItem) {
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

  const slots = boardRef.value.querySelectorAll<HTMLElement>('.board-slot');
  let placed = false;

  slots.forEach(slot => {
    if (placed) return;
    const targetId = slot.dataset.id;
    if (targetId !== p.animalId) return;

    const rect = slot.getBoundingClientRect();
    const cx = e.clientX;
    const cy = e.clientY;
    const slotCenterX = rect.left + rect.width / 2;
    const slotCenterY = rect.top + rect.height / 2;
    
    // Strict proximity check
    if (Math.abs(cx - slotCenterX) < 60 && Math.abs(cy - slotCenterY) < 60) {
      p.placed = true;
      placed = true;
      
      // Visual snap calculation relative to pieces layer
      if (piecesLayerRef.value) {
        const layerRect = piecesLayerRef.value.getBoundingClientRect();
        p.dragX = slotCenterX - layerRect.left;
        p.dragY = slotCenterY - layerRect.top;
      }
      p.startX = p.dragX;
      p.startY = p.dragY;
    }
  });

  if (!placed) {
    // Snap back
    p.dragX = p.startX;
    p.dragY = p.startY;
  }

  if (puzzlePieces.value.every(p => p.placed)) {
    onLevelComplete();
  }
}

function onLevelComplete() {
  isComplete.value = true;
  log.generate({ level: 1, phase: currentOptionCount.value, pieces: currentOptionCount.value });
  playInstruction('Great job! You matched all the animals!');
  progressStore.updateStats(GAME_ID, true);
  resetPrompt();
}

const handleNextLevel = () => {
  isComplete.value = false;
  initLevel();
};
</script>

<template>
  <div class="shadow-match" :class="{ 'prompt-active': promptLevel === 'partial' || promptLevel === 'full' }" @pointermove="onPointerMove" @pointerup="onPointerUp" @pointercancel="onPointerUp">
    <!-- Start Screen -->
    <div v-if="!hasStarted" class="start-screen">
      <div class="start-icon"><MenuIcon :gameId="GAME_ID" style="width: 140px; height: 140px;" /></div>
      <h1 class="start-title">Shadow Match</h1>
      <p class="start-sub">Match the animals to their shadows.</p>
      <button class="start-btn" @click="handleStart">Start</button>
      <button class="home-btn-alt" @click="router.push('/fun-games')">Home</button>
    </div>

    <!-- Game Screen -->
    <div v-else class="game-screen">
      <header class="game-header">
        <button class="icon-btn" @click="router.push('/')" aria-label="Home">🏠</button>
        <div class="phase-badge">{{ currentOptionCount }} Shadows</div>
        <button class="icon-btn" @click="playInstruction('Match the animals to their shadows!')" :disabled="isPlaying" aria-label="Replay Instructions">🔊</button>
      </header>

      <!-- Drop Targets Board -->
      <div class="board" ref="boardRef" :style="{
        gridTemplateColumns: `repeat(${boardColumns}, 140px)`,
        gridTemplateRows: `repeat(${boardRows}, 140px)`
      }">
        <div 
          v-for="animal in targetSequence" 
          :key="animal.id"
          class="board-slot"
          :data-id="animal.id"
        >
          <!-- Using the SVG component directly but completely blackened via CSS -->
          <ColorfulAnimal :name="animal.id" width="120" height="120" class="shadow-animal" />
        </div>
      </div>

      <!-- Pieces Layer -->
      <div class="pieces-layer" ref="piecesLayerRef">
        <div 
          v-for="piece in puzzlePieces" 
          :key="piece.id"
          class="piece-tray-item"
          :class="{ dragging: piece.dragging, placed: piece.placed }"
          :style="{
            transform: piece.dragging ? `translate(${piece.dragX - 70}px, ${piece.dragY - 70}px) scale(1.1)` : `translate(${piece.startX - 70}px, ${piece.startY - 70}px) scale(1)`,
            zIndex: piece.zIndex
          }"
          @pointerdown="onPointerDown($event, piece)"
        >
          <ColorfulAnimal :name="piece.animalId" width="120" height="120" />
        </div>
      </div>

      <!-- Celebration -->
      <div v-if="isComplete" class="celebration-overlay">
        <div class="celebration-card">
          <div class="celebration-emoji">👥</div>
          <h2>Awesome!</h2>
          <p>You matched all shadows!</p>
          <div class="celebration-actions">
            <button class="next-btn" @click="handleNextLevel">Next Level ➔</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.shadow-match {
  width: 100vw;
  min-height: 100vh;
  background: linear-gradient(135deg, #ccfbf1 0%, #a7f3d0 100%);
  position: relative;
  overflow: hidden;
  touch-action: none;
  user-select: none;
}

/* START SCREEN */
.start-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  text-align: center;
}
.start-icon {
  margin-bottom: 2rem;
  background: white;
  border-radius: 32px;
  padding: 2rem;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
  animation: float 3s ease-in-out infinite;
}
.start-title {
  font-size: 4rem;
  font-weight: 800;
  color: #0f766e;
  margin-bottom: 1rem;
}
.start-sub {
  font-size: 1.5rem;
  color: #0d9488;
  margin-bottom: 3rem;
  opacity: 0.8;
}
.start-btn {
  background: #0d9488;
  color: white;
  font-size: 2rem;
  font-weight: bold;
  padding: 1.5rem 4rem;
  border-radius: 9999px;
  border: none;
  cursor: pointer;
  box-shadow: 0 10px 25px rgba(13, 148, 136, 0.4);
  transition: all 0.2s;
}
.start-btn:hover {
  transform: scale(1.05);
}
.home-btn-alt {
  margin-top: 2rem;
  background: transparent;
  color: #14b8a6;
  border: 2px solid #14b8a6;
  font-size: 1.2rem;
  padding: 0.75rem 2rem;
  border-radius: 9999px;
  cursor: pointer;
}

/* GAME SCREEN */
.game-screen {
  position: relative;
  width: 1280px; /* Reference width */
  height: 100vh;
  margin: 0 auto;
}

.game-header {
  position: absolute;
  top: 2rem;
  left: 2rem;
  right: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 100;
}
.icon-btn {
  width: 64px;
  height: 64px;
  border-radius: 32px;
  border: none;
  background: white;
  font-size: 2rem;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
.phase-badge {
  background: white;
  padding: 0.75rem 2rem;
  border-radius: 9999px;
  font-size: 1.5rem;
  font-weight: bold;
  color: #0f766e;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

/* BOARD */
.board {
  position: absolute;
  top: 150px;
  left: 50%;
  transform: translateX(-50%);
  display: grid;
  gap: 20px;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 32px;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0,0,0,0.05);
}

.board-slot {
  width: 140px;
  height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 20px;
  box-shadow: inset 0 4px 12px rgba(0,0,0,0.05);
  transition: transform 0.2s;
}

.shadow-animal {
  filter: brightness(0); /* Make it completely black */
  opacity: 0.2; /* Make it a subtle shadow */
  transition: all 0.3s ease;
}

/* TRAY AND PIECES */
.pieces-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none; /* Let events fall through to board if needed */
}

.piece-tray-item {
  position: absolute;
  width: 140px;
  height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
  cursor: grab;
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  filter: drop-shadow(0 10px 15px rgba(0,0,0,0.2));
}

.piece-tray-item.dragging {
  cursor: grabbing;
  transition: none; /* Instant follow */
  filter: drop-shadow(0 20px 25px rgba(0,0,0,0.3));
}

.piece-tray-item.placed {
  pointer-events: none;
  filter: none;
}

/* CELEBRATION */
.celebration-overlay {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

.celebration-card {
  background: white;
  padding: 4rem;
  border-radius: 32px;
  text-align: center;
  box-shadow: 0 20px 50px rgba(0,0,0,0.15);
  transform: scale(0);
  animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}
.celebration-emoji {
  font-size: 6rem;
  margin-bottom: 1rem;
}
.celebration-card h2 {
  font-size: 4rem;
  color: #10b981;
  margin-bottom: 1rem;
}
.celebration-card p {
  font-size: 2rem;
  color: #4b5563;
  margin-bottom: 2rem;
}
.next-btn {
  background: #10b981;
  color: white;
  font-size: 2rem;
  font-weight: bold;
  padding: 1rem 3rem;
  border-radius: 9999px;
  border: none;
  cursor: pointer;
  box-shadow: 0 10px 25px rgba(16, 185, 129, 0.4);
  transition: all 0.2s;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes popIn {
  from { transform: scale(0.8); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

@keyframes float {
  0% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
  100% { transform: translateY(0); }
}

/* Prompt Fading Highlight */
.prompt-active .piece-tray-item:not(.placed) {
  animation: promptPulse 2s infinite;
}

@keyframes promptPulse {
  0% { transform: scale(1); filter: drop-shadow(0 10px 15px rgba(0,0,0,0.2)) brightness(1); }
  50% { transform: scale(1.05); filter: drop-shadow(0 10px 15px rgba(255, 215, 0, 0.8)) brightness(1.2); }
  100% { transform: scale(1); filter: drop-shadow(0 10px 15px rgba(0,0,0,0.2)) brightness(1); }
}
</style>
