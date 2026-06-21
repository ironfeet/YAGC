<script setup lang="ts">
import { getRandomPraise } from '../../../utils/praises';
import { shuffle } from '../../../utils/shuffle';
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

const currentPhase = computed(() => progressStore.moduleStats[GAME_ID]?.currentPhase || 1);
const shadowCount = computed(() => Math.min(currentPhase.value * 2, ANIMALS.length));

// Generate the sequence of animals based on currentPhase
const targetSequence = ref<AnimalDef[]>([]);

const puzzlePieces = ref<ShadowItem[]>([]);
const boardRef = ref<HTMLElement | null>(null);
const piecesLayerRef = ref<HTMLElement | null>(null);

let zIndexCounter = 10;

const { currentLevel: promptLevel, resetAll: resetPrompt } = usePromptFading('none');

const initLevel = async () => {
  isComplete.value = false;
  puzzlePieces.value = [];
  resetPrompt('none');
  
  targetSequence.value = shuffle([...ANIMALS]).slice(0, shadowCount.value);
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
    const startY = 650 + (row * (pieceHeight + spacing));

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
    const targetId = slot.dataset.animal;
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
  log.generate({ level: 1, phase: currentPhase.value, pieces: shadowCount.value });
  playInstruction(`${getRandomPraise()} You matched all the animals!`);
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
    <!-- Start Screen -->
    <div v-if="!hasStarted" class="start-screen">
      <div class="start-icon"><MenuIcon :gameId="GAME_ID" style="width: 140px; height: 140px;" /></div>
      <h1>Shadow Match<br><span>Match & Learn</span></h1>
      <p class="start-sub">Match the animals to their shadows.</p>
      <button @click="handleStart" class="start-btn">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        Start
      </button>
    </div>

    <!-- Game Screen -->
    <div v-else class="game-board">
      <div v-if="isPlaying" class="listening-mini">
        <svg class="speaker-mini" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
        <span>Listening...</span>
      </div>

      <div class="action-layout">
        <!-- Standard Top Bar -->
        <header class="top-bar">
          <div class="phase-badge">
            <span style="font-size: 1.5rem; margin-right: 0.5rem">⭐</span>
            Phase {{ currentPhase }}
          </div>
          <button class="replay-btn" @click="playInstruction('Match the animals to their shadows!')" :disabled="isPlaying">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
            Replay
          </button>
        </header>

        <div class="jig-main">
          <!-- The Board -->
          <div class="board" ref="boardRef">
            <div 
              v-for="animal in targetSequence" 
              :key="'shadow-'+animal.id"
              class="board-slot"
              :data-animal="animal.id"
            >
              <!-- Silhouette (black/grey) -->
              <ColorfulAnimal 
                :name="animal.id"
                style="width: 120px; height: 120px; filter: brightness(0); opacity: 0.2;"
                v-if="!puzzlePieces.find(p => p.animalId === animal.id)?.placed"
              />
            </div>
          </div>

          <!-- The pieces layer -->
          <div class="pieces-layer" ref="piecesLayerRef">
            <div 
              v-for="piece in puzzlePieces" 
              :key="piece.id"
              class="piece-tray-item"
              :class="{ dragging: piece.dragging, placed: piece.placed, 'is-target': !piece.placed && targetSequence.length > 0 && piece.animalId === targetSequence[0].id }"
              :style="{
                transform: piece.dragging ? `translate(${piece.dragX - 70}px, ${piece.dragY - 70}px) scale(1.1)` : `translate(${piece.startX - 70}px, ${piece.startY - 70}px) scale(1)`,
                zIndex: piece.zIndex
              }"
              @pointerdown="onPointerDown($event, piece)"
            >
              <ColorfulAnimal 
                :name="piece.animalId" 
                style="width: 120px; height: 120px;"
              />
            </div>
          </div>

          <transition name="pop">
            <div v-if="isComplete" class="complete-overlay">
              <div class="complete-card">
                <div class="complete-emoji">🎉</div>
                <h2 class="complete-title">Great Job!</h2>
                <p class="complete-sub">You matched all the animals!</p>
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
  top: 100px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: center;
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
  width: 140px;
  height: 140px;
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
  0% { transform: scale(1); filter: drop-shadow(0 10px 15px rgba(0,0,0,0.2)) brightness(1); }
  50% { transform: scale(1.05); filter: drop-shadow(0 10px 15px rgba(255,215,0,0.8)) brightness(1.2); }
  100% { transform: scale(1); filter: drop-shadow(0 10px 15px rgba(0,0,0,0.2)) brightness(1); }
}
</style>
