<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import MenuIcon from '../../../components/game/MenuIcon.vue';
import { useSpeech } from '../../../composables/useSpeech';
import { useLogger } from '../../../composables/useLogger';
import { useSafeTimeout } from '../../../composables/useSafeTimeout';
import { useProgressStore } from '../../../stores/useProgressStore';

const moduleId = 'fun-animal-jigsaw';
const router = useRouter();
const progressStore = useProgressStore();
const { playInstruction, isPlaying } = useSpeech();
const log = useLogger(moduleId);
const { safeSetTimeout } = useSafeTimeout();

const hasStarted = ref(false);

const handleStart = () => {
  hasStarted.value = true;
  generateLevel();
};

// ── Animal pool ──────────────────────────────────────────────────────────────
type AnimalDef = { id: string; label: string; emoji: string; color: string; svgPath: string };

const ANIMALS: AnimalDef[] = [
  {
    id: 'cat', label: 'Cat', emoji: '🐱', color: '#f97316',
    svgPath: `M22,42 L12,12 L38,32 Z M78,42 L88,12 L62,32 Z
      M78,42 L88,12 L62,32 Z M24,40 L17,20 L36,33 Z M76,40 L83,20 L64,33 Z
      M50,74 Q22,74 22,54 Q22,18 50,18 Q78,18 78,54 Q78,74 50,74 Z
      M78,80 Q96,65 88,45 Q83,33 92,28 M78,80 Q96,65 88,45
      M34,90 Q34,98 46,98 M54,90 Q54,98 66,98`
  },
  {
    id: 'dog', label: 'Dog', emoji: '🐶', color: '#a78bfa',
    svgPath: `M24,48 Q13,30 13,48 Q13,66 24,66 Z
      M76,48 Q87,30 87,48 Q87,66 76,66 Z
      M50,18 Q24,18 24,52 Q24,72 50,72 Q76,72 76,52 Q76,18 50,18 Z
      M33,88 Q33,98 45,98 M55,88 Q55,98 67,98
      M82,65 Q98,50 90,40`
  },
  {
    id: 'rabbit', label: 'Rabbit', emoji: '🐰', color: '#ec4899',
    svgPath: `M26,12 Q26,-8 42,-8 Q42,28 34,36 Z
      M74,12 Q74,-8 58,-8 Q58,28 66,36 Z
      M50,96 Q20,96 20,72 Q20,48 50,48 Q80,48 80,72 Q80,96 50,96 Z
      M50,48 Q28,48 28,28 Q28,8 50,8 Q72,8 72,28 Q72,48 50,48 Z
      M76,82 Q85,82 85,92 Q85,100 76,100`
  },
  {
    id: 'bird', label: 'Bird', emoji: '🐦', color: '#22c55e',
    svgPath: `M50,84 Q22,84 22,62 Q22,40 50,40 Z
      M50,84 Q78,84 78,62 Q78,40 50,40 Z
      M68,16 Q68,-4 84,-4 Q100,8 84,34 Q76,46 68,52 Z
      M22,58 Q8,35 22,22 Q30,45 50,50 Z
      M24,72 Q10,80 5,90 Q18,80 22,78
      M28,76 Q18,90 16,98 Q28,84 32,80`
  },
  {
    id: 'fish', label: 'Fish', emoji: '🐟', color: '#3b82f6',
    svgPath: `M72,50 L92,28 L88,50 L92,72 Z
      M8,50 Q8,25 46,25 Q84,25 84,50 Q84,75 46,75 Q8,75 8,50 Z
      M35,26 Q50,12 65,26
      M42,75 Q50,88 58,75`
  },
  {
    id: 'elephant', label: 'Elephant', emoji: '🐘', color: '#64748b',
    svgPath: `M15,90 Q15,60 35,55 Q20,40 30,20 Q50,10 70,20 Q90,10 90,40
      Q100,55 85,65 Q95,80 85,90 Z
      M35,90 L35,100 M65,90 L65,100 M75,90 L75,100 M25,90 L25,100
      M30,20 Q20,50 25,75`
  },
  {
    id: 'lion', label: 'Lion', emoji: '🦁', color: '#f59e0b',
    svgPath: `M50,10 Q70,5 80,25 Q95,40 85,65 Q90,90 70,95
      Q50,105 30,95 Q10,90 15,65 Q5,40 20,25 Q30,5 50,10 Z
      M50,30 Q65,25 72,40 Q80,55 70,68 Q50,80 30,68 Q20,55 28,40 Q35,25 50,30 Z
      M70,90 L75,100 M30,90 L25,100 M60,92 L62,102 M40,92 L38,102`
  },
  {
    id: 'penguin', label: 'Penguin', emoji: '🐧', color: '#1e293b',
    svgPath: `M100,110 Q100,55 100,55 Q100,45 100,45 Q100,165 100,165 Z
      M60,55 Q100,45 140,55 Q160,75 140,110 Q100,162 60,110 Q40,75 60,55 Z
      M70,60 Q100,50 130,60 Q130,100 100,105 Q70,100 70,60 Z
      M85,160 L75,175 L95,175 Z M115,160 L105,175 L125,175 Z
      M65,100 Q30,130 50,155 M135,100 Q170,130 150,155`
  },
];

// ── Piece grid config ─────────────────────────────────────────────────────────
const SVG_SIZE = 480;   // reference size of the full animal silhouette
const TRAY_GAP = 8;

const cols = ref(3);
const rows = ref(3);
const pieceSize = ref(160);
const trayCols = ref(3);
const guideOpacity = ref(0.2);

type Piece = {
  id: number;
  row: number;
  col: number;
  x: number;          // current left position (px) in the tray
  y: number;
  placed: boolean;
  dragging: boolean;
  jigsawPath: string;
};

// ── State ─────────────────────────────────────────────────────────────────────
const currentAnimalIdx = ref(0);
const pieces = ref<Piece[]>([]);
const completed = ref(false);
const score = ref(0);
const level = ref(1);
const isComplexScene = ref(false);

const animal = computed(() => ANIMALS[currentAnimalIdx.value]);

// Board DOM ref for measuring drop-zone positions
const boardRef = ref<HTMLElement | null>(null);

function generateJigsawPath(r: number, c: number, cols: number, rows: number, edges: any, isSimple: boolean) {
  const nw = 100 / cols;
  const nh = 100 / rows;
  const px = c * nw;
  const py = r * nh;
  
  if (isSimple) {
    return `M ${px},${py} L ${px+nw},${py} L ${px+nw},${py+nh} L ${px},${py+nh} Z`;
  }

  const tabW = nw * 0.25;
  const tabH = nh * 0.25;
  
  let d = `M ${px},${py} `;
  
  if (edges.top === 0) d += `L ${px + nw},${py} `;
  else {
    const s = edges.top; 
    d += `L ${px + nw/2 - tabW/2},${py} `;
    d += `C ${px + nw/2 - tabW/2},${py - s*tabH} ${px + nw/2 + tabW/2},${py - s*tabH} ${px + nw/2 + tabW/2},${py} `;
    d += `L ${px + nw},${py} `;
  }
  
  if (edges.right === 0) d += `L ${px + nw},${py + nh} `;
  else {
    const s = edges.right;
    d += `L ${px + nw},${py + nh/2 - tabW/2} `;
    d += `C ${px + nw + s*tabH},${py + nh/2 - tabW/2} ${px + nw + s*tabH},${py + nh/2 + tabW/2} ${px + nw},${py + nh/2 + tabW/2} `;
    d += `L ${px + nw},${py + nh} `;
  }
  
  if (edges.bottom === 0) d += `L ${px},${py + nh} `;
  else {
    const s = edges.bottom;
    d += `L ${px + nw/2 + tabW/2},${py + nh} `;
    d += `C ${px + nw/2 + tabW/2},${py + nh + s*tabH} ${px + nw/2 - tabW/2},${py + nh + s*tabH} ${px + nw/2 - tabW/2},${py + nh} `;
    d += `L ${px},${py + nh} `;
  }
  
  if (edges.left === 0) d += `L ${px},${py} Z`;
  else {
    const s = edges.left;
    d += `L ${px},${py + nh/2 + tabW/2} `;
    d += `C ${px - s*tabH},${py + nh/2 + tabW/2} ${px - s*tabH},${py + nh/2 - tabW/2} ${px},${py + nh/2 - tabW/2} `;
    d += `L ${px},${py} Z`;
  }
  
  return d;
}

// ── Level generation ──────────────────────────────────────────────────────────
function generateLevel() {
  completed.value = false;

  const stat = progressStore.moduleStats[moduleId];
  const span = stat?.currentPhase || 1;
  const phase = Math.min(5, span);

  isComplexScene.value = phase >= 5;

  // Progressive Difficulty Scaling
  if (phase === 1) { cols.value = 2; rows.value = 2; guideOpacity.value = 0.3; trayCols.value = 2; }      // Easy: 4 pieces, strong guide, simple cuts
  else if (phase === 2) { cols.value = 3; rows.value = 3; guideOpacity.value = 0.2; trayCols.value = 3; } // Easy-Med: 9 pieces
  else if (phase === 3) { cols.value = 4; rows.value = 4; guideOpacity.value = 0.15; trayCols.value = 4; } // Medium: 16 pieces
  else if (phase === 4) { cols.value = 5; rows.value = 5; guideOpacity.value = 0.05; trayCols.value = 5; } // Med-Hard: 25 pieces
  else { cols.value = 6; rows.value = 6; guideOpacity.value = 0; trayCols.value = 6; }                     // Hard: 36 pieces, no guide, complex scene

  pieceSize.value = Math.floor(SVG_SIZE / cols.value);

  // Pre-generate interlocking edges (1 = out, -1 = in)
  const horizEdges: number[][] = [];
  for (let r = 0; r < rows.value - 1; r++) {
    const row = [];
    for (let c = 0; c < cols.value; c++) row.push(Math.random() > 0.5 ? 1 : -1);
    horizEdges.push(row);
  }

  const vertEdges: number[][] = [];
  for (let r = 0; r < rows.value; r++) {
    const row = [];
    for (let c = 0; c < cols.value - 1; c++) row.push(Math.random() > 0.5 ? 1 : -1);
    vertEdges.push(row);
  }

  const newPieces: Piece[] = [];
  for (let r = 0; r < rows.value; r++) {
    for (let c = 0; c < cols.value; c++) {
      const edges = {
        top: r === 0 ? 0 : -horizEdges[r-1][c],
        bottom: r === rows.value - 1 ? 0 : horizEdges[r][c],
        left: c === 0 ? 0 : -vertEdges[r][c-1],
        right: c === cols.value - 1 ? 0 : vertEdges[r][c],
      };
      newPieces.push({
        id: r * cols.value + c,
        row: r, col: c,
        x: 0, y: 0,
        placed: false,
        dragging: false,
        jigsawPath: generateJigsawPath(r, c, cols.value, rows.value, edges, phase === 1)
      });
    }
  }

  // Shuffle tray positions across the tray grid
  const traySlots = shuffleArray(newPieces.map((_, i) => i));
  newPieces.forEach((p, i) => {
    const slot = traySlots[i];
    p.x = (slot % trayCols.value) * (pieceSize.value + TRAY_GAP);
    p.y = Math.floor(slot / trayCols.value) * (pieceSize.value + TRAY_GAP);
  });

  pieces.value = newPieces;

  log.generate({ level: level.value, animalId: animal.value.id, phase, pieces: rows.value * cols.value });
  safeSetTimeout(() => {
    const text = `Put the ${animal.value.label} together!`;
    log.audio(text);
    playInstruction(text);
  }, 500);
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Drag-and-drop ─────────────────────────────────────────────────────────────
let dragPiece: Piece | null = null;
// Absolute drag position driven by pointermove
const dragX = ref(0);
const dragY = ref(0);

function onPiecePointerDown(e: PointerEvent, piece: Piece) {
  if (piece.placed) return;
  e.preventDefault();
  (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  dragPiece = piece;
  piece.dragging = true;
  dragX.value = e.clientX;
  dragY.value = e.clientY;
}

function onPointerMove(e: PointerEvent) {
  if (!dragPiece) return;
  e.preventDefault();
  dragX.value = e.clientX;
  dragY.value = e.clientY;
}

function onPointerUp(e: PointerEvent) {
  if (!dragPiece || !boardRef.value) { dragPiece = null; return; }

  const p = dragPiece;
  p.dragging = false;

  // Check each un-filled slot on the board
  const slots = boardRef.value.querySelectorAll<HTMLElement>('.board-slot');
  let placed = false;

  slots.forEach(slot => {
    if (placed) return;
    const slotRow = Number(slot.dataset.row);
    const slotCol = Number(slot.dataset.col);
    if (pieces.value.find(p2 => p2.placed && p2.row === slotRow && p2.col === slotCol)) return;
    if (slotRow !== p.row || slotCol !== p.col) return; // wrong slot

    const rect = slot.getBoundingClientRect();
    const cx = e.clientX;
    const cy = e.clientY;
    // 40% hit tolerance
    const tolerance = pieceSize.value * 0.4;
    if (
      cx >= rect.left - tolerance && cx <= rect.right + tolerance &&
      cy >= rect.top  - tolerance && cy <= rect.bottom + tolerance
    ) {
      p.placed = true;
      placed = true;
    }
  });

  dragPiece = null;

  // Check win
  if (pieces.value.every(p => p.placed)) {
    safeSetTimeout(() => onLevelComplete(), 400);
  }
}

function onLevelComplete() {
  completed.value = true;
  score.value += 10 * level.value;
}

function nextAnimal() {
  currentAnimalIdx.value = (currentAnimalIdx.value + 1) % ANIMALS.length;
  level.value++;
  completed.value = false;
  generateLevel();
}

onMounted(() => {
  log.lifecycle('mounted');
});
const playHint = () => {
  const text = `Put the ${animal.value.label} together!`;
  playInstruction(text);
};
</script>

<template>
  <div
    class="jigsaw-root"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerUp"
  >
    <div v-if="!hasStarted" class="start-screen">
      <div class="start-icon"><MenuIcon gameId="fun-jigsaw" style="width: 140px; height: 140px;" /></div>
      <h1>Animal Jigsaw<br><span>Spatial Puzzles</span></h1>
      <p class="start-sub">Put the animal pieces together.</p>
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
            <span style="font-size: 1.5rem; margin-right: 0.5rem">{{ animal.emoji }}</span>
            Level {{ level }} — {{ animal.label }}
          </div>
          <button class="replay-btn" @click="playHint">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
            Replay
          </button>
        </header>

        <!-- Main area -->
        <div class="jig-main">

      <!-- Puzzle board -->
      <div class="board-area">
        <h3 class="area-label">Put it together!</h3>
        <div
          class="board"
          ref="boardRef"
          :style="{
            gridTemplateColumns: `repeat(${cols}, ${pieceSize}px)`,
            gridTemplateRows: `repeat(${rows}, ${pieceSize}px)`,
            width: `${cols * pieceSize}px`,
            height: `${rows * pieceSize}px`,
            position: 'relative'
          }"
        >
          <!-- Guide image -->
          <svg
            v-if="guideOpacity > 0"
            class="board-guide"
            :width="SVG_SIZE" :height="SVG_SIZE"
            viewBox="0 0 100 100"
            :style="{ position: 'absolute', top: 0, left: 0, opacity: guideOpacity, pointerEvents: 'none' }"
          >
            <g v-if="isComplexScene">
              <!-- Complex Scene: Multiple animals to form a busy jungle/farm picture -->
              <path :d="ANIMALS[0].svgPath" :fill="ANIMALS[0].color" transform="translate(-10, 10) scale(0.6)" />
              <path :d="ANIMALS[1].svgPath" :fill="ANIMALS[1].color" transform="translate(45, -5) scale(0.55)" />
              <path :d="ANIMALS[2].svgPath" :fill="ANIMALS[2].color" transform="translate(25, 45) scale(0.7)" />
              <path :d="ANIMALS[3].svgPath" :fill="ANIMALS[3].color" transform="translate(-20, 60) scale(0.4)" />
              <path :d="ANIMALS[4].svgPath" :fill="ANIMALS[4].color" transform="translate(65, 55) scale(0.5)" />
            </g>
            <path v-else :d="animal.svgPath" :fill="animal.color" stroke="none" />
          </svg>

          <template v-for="r in rows" :key="'r'+r">
            <template v-for="c in cols" :key="'c'+c">
              <div
                class="board-slot"
                :data-row="r - 1"
                :data-col="c - 1"
                :style="{
                  width: pieceSize + 'px',
                  height: pieceSize + 'px',
                  zIndex: 1
                }"
              >
                <template v-for="p in pieces" :key="p.id">
                  <div v-if="p.placed && p.row === r-1 && p.col === c-1" class="piece-placed">
                    <svg
                      :width="pieceSize" :height="pieceSize"
                      :viewBox="`${(c-1)*(100/cols)} ${(r-1)*(100/rows)} ${100/cols} ${100/rows}`"
                      style="display: block; overflow: visible"
                    >
                      <defs>
                        <clipPath :id="'clip-placed-' + p.id">
                          <path :d="p.jigsawPath" />
                        </clipPath>
                      </defs>
                      <!-- Drop shadow under piece -->
                      <path :d="p.jigsawPath" fill="rgba(0,0,0,0.15)" transform="translate(1.5, 1.5)" />
                      <!-- Contents clipped to piece -->
                      <g :clip-path="'url(#clip-placed-' + p.id + ')'">
                        <g v-if="isComplexScene">
                          <!-- Background to give piece physical body if it falls on empty space -->
                          <rect x="0" y="0" width="100" height="100" fill="rgba(255,255,255,0.05)" />
                          <path :d="ANIMALS[0].svgPath" :fill="ANIMALS[0].color" transform="translate(-10, 10) scale(0.6)" />
                          <path :d="ANIMALS[1].svgPath" :fill="ANIMALS[1].color" transform="translate(45, -5) scale(0.55)" />
                          <path :d="ANIMALS[2].svgPath" :fill="ANIMALS[2].color" transform="translate(25, 45) scale(0.7)" />
                          <path :d="ANIMALS[3].svgPath" :fill="ANIMALS[3].color" transform="translate(-20, 60) scale(0.4)" />
                          <path :d="ANIMALS[4].svgPath" :fill="ANIMALS[4].color" transform="translate(65, 55) scale(0.5)" />
                        </g>
                        <path v-else :d="animal.svgPath" :fill="animal.color" />
                      </g>
                      <!-- Puzzle piece outline -->
                      <path :d="p.jigsawPath" fill="none" stroke="rgba(255,255,255,0.8)" stroke-width="0.3" />
                    </svg>
                  </div>
                </template>
              </div>
            </template>
          </template>
        </div>
      </div>

      <!-- Piece tray -->
      <div class="tray-area">
        <h3 class="area-label">Drag pieces here 👆</h3>
        <div
          class="tray"
          :style="{
            width:  `${trayCols * (pieceSize + TRAY_GAP)}px`,
            height: `${Math.ceil((rows * cols) / trayCols) * (pieceSize + TRAY_GAP)}px`,
          }"
        >
          <div
            v-for="piece in pieces"
            :key="piece.id"
            v-show="!piece.placed && !piece.dragging"
            class="piece-tray-item"
            :style="{
              left: piece.x + 'px',
              top: piece.y + 'px',
              width: pieceSize + 'px',
              height: pieceSize + 'px',
            }"
            @pointerdown="(e) => onPiecePointerDown(e, piece)"
          >
            <svg
              :width="pieceSize" :height="pieceSize"
              :viewBox="`${piece.col * (100/cols)} ${piece.row * (100/rows)} ${100/cols} ${100/rows}`"
              style="display: block; overflow: visible"
            >
              <defs>
                <clipPath :id="'clip-tray-' + piece.id">
                  <path :d="piece.jigsawPath" />
                </clipPath>
              </defs>
              <path :d="piece.jigsawPath" fill="rgba(0,0,0,0.3)" transform="translate(2, 2)" />
              <g :clip-path="'url(#clip-tray-' + piece.id + ')'">
                <g v-if="isComplexScene">
                  <rect x="0" y="0" width="100" height="100" fill="rgba(255,255,255,0.05)" />
                  <path :d="ANIMALS[0].svgPath" :fill="ANIMALS[0].color" transform="translate(-10, 10) scale(0.6)" />
                  <path :d="ANIMALS[1].svgPath" :fill="ANIMALS[1].color" transform="translate(45, -5) scale(0.55)" />
                  <path :d="ANIMALS[2].svgPath" :fill="ANIMALS[2].color" transform="translate(25, 45) scale(0.7)" />
                  <path :d="ANIMALS[3].svgPath" :fill="ANIMALS[3].color" transform="translate(-20, 60) scale(0.4)" />
                  <path :d="ANIMALS[4].svgPath" :fill="ANIMALS[4].color" transform="translate(65, 55) scale(0.5)" />
                </g>
                <path v-else :d="animal.svgPath" :fill="animal.color" />
              </g>
              <path :d="piece.jigsawPath" fill="none" stroke="rgba(255,255,255,0.8)" stroke-width="0.3" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Floating drag ghost ────────────────────────────────── -->
    <template v-for="piece in pieces" :key="'ghost-' + piece.id">
      <div
        v-if="piece.dragging"
        class="piece-ghost"
        :style="{
          left: dragX + 'px',
          top: dragY + 'px',
          width: pieceSize + 'px',
          height: pieceSize + 'px',
          transform: 'translate(-50%, -50%) scale(1.12)',
        }"
      >
        <svg
          :width="pieceSize" :height="pieceSize"
          :viewBox="`${piece.col * (100/cols)} ${piece.row * (100/rows)} ${100/cols} ${100/rows}`"
          style="display: block; overflow: visible"
        >
          <defs>
            <clipPath :id="'clip-ghost-' + piece.id">
              <path :d="piece.jigsawPath" />
            </clipPath>
          </defs>
          <path :d="piece.jigsawPath" fill="rgba(0,0,0,0.3)" transform="translate(3, 3)" />
          <g :clip-path="'url(#clip-ghost-' + piece.id + ')'">
            <g v-if="isComplexScene">
              <rect x="0" y="0" width="100" height="100" fill="rgba(255,255,255,0.05)" />
              <path :d="ANIMALS[0].svgPath" :fill="ANIMALS[0].color" transform="translate(-10, 10) scale(0.6)" />
              <path :d="ANIMALS[1].svgPath" :fill="ANIMALS[1].color" transform="translate(45, -5) scale(0.55)" />
              <path :d="ANIMALS[2].svgPath" :fill="ANIMALS[2].color" transform="translate(25, 45) scale(0.7)" />
              <path :d="ANIMALS[3].svgPath" :fill="ANIMALS[3].color" transform="translate(-20, 60) scale(0.4)" />
              <path :d="ANIMALS[4].svgPath" :fill="ANIMALS[4].color" transform="translate(65, 55) scale(0.5)" />
            </g>
            <path v-else :d="animal.svgPath" :fill="animal.color" />
          </g>
          <path :d="piece.jigsawPath" fill="none" stroke="rgba(255,255,255,0.8)" stroke-width="0.3" />
        </svg>
      </div>
    </template>

    <!-- ── Completion overlay ─────────────────────────────────── -->
    <transition name="pop">
      <div v-if="completed" class="complete-overlay">
        <div class="complete-card">
          <div class="complete-emoji">{{ animal.emoji }}</div>
          <h2 class="complete-title">{{ animal.label }}!</h2>
          <p class="complete-sub">Great job! You built it! 🎉</p>
          <div class="complete-actions">
            <button class="btn-next" @click="nextAnimal">Next Animal →</button>
            <button class="btn-menu" @click="router.push('/')">🏠 Menu</button>
          </div>
        </div>
      </div>
    </transition>
      </div> <!-- close action-layout -->
    </div> <!-- close game-board -->
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
.start-icon { font-size: 6rem; }
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
  gap: 4rem;
  padding: 1.5rem 3rem;
  overflow: hidden;
}

.area-label {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-secondary);
  text-align: center;
  margin-bottom: 1.2rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* ── Board ───────────────────────────────────────────────── */
.board-area { display: flex; flex-direction: column; align-items: center; }

.board {
  display: grid;
  border: 3px solid rgba(255,255,255,0.15);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0,0,0,0.4);
  background: rgba(255,255,255,0.04);
}

.board-slot {
  border: 1.5px dashed rgba(255,255,255,0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.03);
  transition: background 0.2s;
  box-sizing: border-box;
  overflow: hidden;
}

.board-slot:has(.piece-placed) {
  border-color: transparent;
  background: transparent;
}

.piece-placed {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: place-pop 0.3s cubic-bezier(0.34,1.56,0.64,1);
}

@keyframes place-pop {
  from { transform: scale(0.7); opacity: 0.5; }
  to   { transform: scale(1);   opacity: 1; }
}

/* ── Tray ────────────────────────────────────────────────── */
.tray-area { display: flex; flex-direction: column; align-items: center; }

.tray {
  position: relative;
  background: rgba(255,255,255,0.04);
  border: 2px solid rgba(255,255,255,0.1);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.3);
}

.piece-tray-item {
  position: absolute;
  border-radius: 8px;
  cursor: grab;
  overflow: hidden;
  transition: box-shadow 0.15s;
  box-shadow: 0 3px 10px rgba(0,0,0,0.3);
  background: rgba(255,255,255,0.05);
  border: 2px solid rgba(255,255,255,0.12);
}

.piece-tray-item:active { cursor: grabbing; }

.piece-tray-item:hover {
  box-shadow: 0 6px 20px rgba(0,0,0,0.4);
  border-color: rgba(255,255,255,0.3);
}

/* ── Drag ghost ──────────────────────────────────────────── */
.piece-ghost {
  position: fixed;
  pointer-events: none;
  z-index: 9999;
}

/* ── Completion overlay ──────────────────────────────────── */
.complete-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  backdrop-filter: blur(6px);
}

.complete-card {
  background: var(--bg-secondary);
  border: 2px solid rgba(255,255,255,0.12);
  border-radius: 28px;
  padding: 3rem 4rem;
  text-align: center;
  box-shadow: 0 24px 60px rgba(0,0,0,0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.complete-emoji {
  font-size: 5rem;
  line-height: 1;
  animation: bounce 0.6s cubic-bezier(0.34,1.56,0.64,1);
}

@keyframes bounce {
  from { transform: scale(0.4); }
  to   { transform: scale(1); }
}

.complete-title {
  font-size: 3rem;
  font-weight: 900;
  color: var(--text-primary);
}

.complete-sub {
  font-size: 1.3rem;
  color: var(--text-secondary);
}

.complete-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.btn-next {
  padding: 1rem 2.5rem;
  font-size: 1.2rem;
  font-weight: 800;
  background: var(--color-green);
  color: white;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: transform 0.15s;
  box-shadow: 0 6px 18px rgba(34,197,94,0.4);
}

.btn-menu {
  padding: 1rem 2rem;
  font-size: 1.2rem;
  font-weight: 700;
  background: rgba(255,255,255,0.1);
  color: var(--text-primary);
  border: 2px solid rgba(255,255,255,0.15);
  border-radius: 50px;
  cursor: pointer;
  transition: transform 0.15s;
}

.btn-next:active, .btn-menu:active { transform: scale(0.95); }

/* ── Transition ──────────────────────────────────────────── */
.pop-enter-active { animation: pop-in 0.35s cubic-bezier(0.34,1.56,0.64,1); }
.pop-leave-active { animation: pop-in 0.2s ease reverse; }

@keyframes pop-in {
  from { opacity: 0; transform: scale(0.85); }
  to   { opacity: 1; transform: scale(1); }
}
</style>
