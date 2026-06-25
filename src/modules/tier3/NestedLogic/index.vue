<script setup lang="ts">
import { onMounted, ref, computed, onUnmounted } from 'vue';
import MenuIcon from '../../../components/game/MenuIcon.vue';
import { useProgressStore } from '../../../stores/useProgressStore';
import { useGameStore } from '../../../stores/useGameStore';
import { useSpeech } from '../../../composables/useSpeech';
import { useLogger } from '../../../composables/useLogger';
import { useSafeTimeout } from '../../../composables/useSafeTimeout';

import HouseGrid from './HouseGrid.vue';
import AssetLibrary from '../../../components/game/AssetLibrary.vue';
import type { NestedLogicLevelConfig, NestedAnimal, HouseCell } from '../../../types';

const moduleId = 'tier3-nested-logic';
const progressStore = useProgressStore();
const gameStore = useGameStore();
const { playInstruction, stopSpeech, isPlaying } = useSpeech();
const log = useLogger(moduleId);
const { safeSetTimeout } = useSafeTimeout();

// ── State ─────────────────────────────────────────────────────────────────────
const config = ref<NestedLogicLevelConfig | null>(null);
const hasStarted = ref(false);
const levelCounter = ref(0);
const isComplete = ref(false);
const showSuccess = ref(false);

// Grid interaction state
const placedGrid = ref<Map<string, string>>(new Map());   // zoneId → animalId
const yardAnimalIds = ref<string[]>([]);                  // animals still in yard
const lockedCells = ref<Set<string>>(new Set());
const shakingCells = ref<Set<string>>(new Set());

// Confetti particles
const confetti = ref<Array<{ x: number; y: number; color: string; angle: number; id: number }>>([]);

// ── Vocabulary ────────────────────────────────────────────────────────────────
const ANIMALS = [
  { noun: 'dog'    as const, color: '#f97316', colorName: 'orange' },
  { noun: 'cat'    as const, color: '#a855f7', colorName: 'purple' },
  { noun: 'bird'   as const, color: '#22c55e', colorName: 'green'  },
  { noun: 'rabbit' as const, color: '#ef4444', colorName: 'red'    },
  { noun: 'fish'   as const, color: '#3b82f6', colorName: 'blue'   },
];

import { shuffle } from '../../../utils/shuffle';
const getRandomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// ── Procedural Generation ─────────────────────────────────────────────────────
const generateLevel = () => {
  levelCounter.value++;
  isComplete.value = false;
  showSuccess.value = false;
  placedGrid.value = new Map();
  lockedCells.value = new Set();
  shakingCells.value = new Set();
  confetti.value = [];

  const stat = progressStore.moduleStats[moduleId];
  const span = stat?.currentPhase ?? 1;
  const phase: 1 | 2 | 3 | 4 | 5 = Math.min(5, span) as any;

  const animalPool = shuffle([...ANIMALS]);

  let rows: number, cols: number;
  let cells: HouseCell[] = [];
  let targetAnimals: NestedAnimal[] = [];
  let audioPrompt = '';

  // ── PHASE 1: 1 col × 2 rows ──────────────────────────────────────────────
  if (phase === 1) {
    rows = 2; cols = 1;
    const [a, b] = animalPool;
    targetAnimals = [
      { id: 'a', noun: a.noun, color: a.color, colorName: a.colorName },
      { id: 'b', noun: b.noun, color: b.color, colorName: b.colorName },
    ];
    cells = [
      { row: 0, col: 0, zoneId: 'r0c0', animalId: 'a' },
      { row: 1, col: 0, zoneId: 'r1c0', animalId: 'b' },
    ];
    audioPrompt = `The ${a.colorName} ${a.noun} lives on top of the ${b.colorName} ${b.noun}.`;
  }
  // ── PHASE 2: 1 col × 3 rows ──────────────────────────────────────────────
  else if (phase === 2) {
    rows = 3; cols = 1;
    const [a, b, c] = animalPool;
    targetAnimals = [
      { id: 'a', noun: a.noun, color: a.color, colorName: a.colorName },
      { id: 'b', noun: b.noun, color: b.color, colorName: b.colorName },
      { id: 'c', noun: c.noun, color: c.color, colorName: c.colorName },
    ];
    cells = [
      { row: 0, col: 0, zoneId: 'r0c0', animalId: 'c' },
      { row: 1, col: 0, zoneId: 'r1c0', animalId: 'a' },
      { row: 2, col: 0, zoneId: 'r2c0', animalId: 'b' },
    ];
    audioPrompt = `The ${a.colorName} ${a.noun} lives on top of the ${b.colorName} ${b.noun} AND under the ${c.colorName} ${c.noun}.`;
  }
  // ── PHASE 3: 2×2 grid ────────────────────────────────────────────────────
  else if (phase === 3) {
    rows = 2; cols = 2;
    const [a, b, c] = animalPool;
    targetAnimals = [
      { id: 'a', noun: a.noun, color: a.color, colorName: a.colorName },
      { id: 'b', noun: b.noun, color: b.color, colorName: b.colorName },
      { id: 'c', noun: c.noun, color: c.color, colorName: c.colorName },
    ];
    cells = [
      { row: 0, col: 0, zoneId: 'r0c0', animalId: 'a' },
      { row: 1, col: 0, zoneId: 'r1c0', animalId: 'b' },
      { row: 0, col: 1, zoneId: 'r0c1', animalId: 'c' },
      { row: 1, col: 1, zoneId: 'r1c1', animalId: null },
    ];
    audioPrompt = `The ${a.colorName} ${a.noun} lives on top of the ${b.colorName} ${b.noun} AND next to the ${c.colorName} ${c.noun}.`;
  }
  // ── PHASE 4: 2×2 grid with BEHIND (Spatial Depth) ────────────────────────
  else if (phase === 4) {
    rows = 2; cols = 2;
    const [a, b, c, d] = animalPool;
    targetAnimals = [
      { id: 'a', noun: a.noun, color: a.color, colorName: a.colorName },
      { id: 'b', noun: b.noun, color: b.color, colorName: b.colorName },
      { id: 'c', noun: c.noun, color: c.color, colorName: c.colorName },
      { id: 'd', noun: d.noun, color: d.color, colorName: d.colorName },
    ];
    cells = [
      { row: 0, col: 0, zoneId: 'r0c0', animalId: 'a', behindAnimalId: 'd' }, // D is behind A
      { row: 1, col: 0, zoneId: 'r1c0', animalId: 'b' },
      { row: 0, col: 1, zoneId: 'r0c1', animalId: 'c' },
      { row: 1, col: 1, zoneId: 'r1c1', animalId: null },
    ];
    audioPrompt = `The ${a.colorName} ${a.noun} lives on top of the ${b.colorName} ${b.noun} AND next to the ${c.colorName} ${c.noun}. The ${d.colorName} ${d.noun} lives behind the ${a.colorName} ${a.noun}.`;
  }
  // ── PHASE 5: 3-story house with BEHIND ──────────────────────────────────
  else {
    rows = 3; cols = 2;
    const [a, b, c, d, e] = animalPool;
    targetAnimals = [
      { id: 'a', noun: a.noun, color: a.color, colorName: a.colorName },
      { id: 'b', noun: b.noun, color: b.color, colorName: b.colorName },
      { id: 'c', noun: c.noun, color: c.color, colorName: c.colorName },
      { id: 'd', noun: d.noun, color: d.color, colorName: d.colorName },
      { id: 'e', noun: e.noun, color: e.color, colorName: e.colorName },
    ];
    cells = [
      { row: 0, col: 0, zoneId: 'r0c0', animalId: 'c' },
      { row: 1, col: 0, zoneId: 'r1c0', animalId: 'a', behindAnimalId: 'd' },
      { row: 2, col: 0, zoneId: 'r2c0', animalId: 'b' },
      { row: 1, col: 1, zoneId: 'r1c1', animalId: 'e' },
      { row: 0, col: 1, zoneId: 'r0c1', animalId: null },
      { row: 2, col: 1, zoneId: 'r2c1', animalId: null },
    ];
    audioPrompt = `The ${a.colorName} ${a.noun} lives on top of the ${b.colorName} ${b.noun} AND under the ${c.colorName} ${c.noun}. The ${d.colorName} ${d.noun} lives behind the ${a.colorName} ${a.noun}. The ${e.colorName} ${e.noun} lives next to the ${a.colorName} ${a.noun}.`;
  }

  // Add 1-2 distractors
  const usedNouns = new Set(targetAnimals.map(a => a.noun));
  const distractorCount = phase === 5 ? 0 : (phase === 4 ? 1 : (phase === 1 ? 1 : 2));
  const distractors: NestedAnimal[] = animalPool
    .filter(a => !usedNouns.has(a.noun))
    .slice(0, distractorCount)
    .map((a, i) => ({ id: `d${i}`, noun: a.noun, color: a.color, colorName: a.colorName, isDistractor: true }));

  const allAnimals = shuffle([...targetAnimals, ...distractors]);
  yardAnimalIds.value = allAnimals.map(a => a.id);

  config.value = {
    moduleId,
    tier: 3,
    currentPhase: phase,
    optionCount: allAnimals.length,
    targetFeatures: {},
    distractors: [],
    phase,
    rows,
    cols,
    cells,
    audioPrompt,
    animals: allAnimals,
    targetAnimalIds: targetAnimals.map(a => a.id),
    rule: { subjectId: 'a', relations: [] },
  };

  gameStore.initializeGame(config.value as any);
  log.generate({ phase, rows, cols, audioPrompt });

  safeSetTimeout(() => {
    log.audio(audioPrompt);
    playInstruction(audioPrompt);
  }, 400);
};

// ── Animal lookup helpers ─────────────────────────────────────────────────────
const getAnimal = (id: string): NestedAnimal | undefined =>
  config.value?.animals.find(a => a.id === id);

const yardAnimals = computed(() =>
  yardAnimalIds.value.map(id => getAnimal(id)).filter(Boolean) as NestedAnimal[]
);

// ── Drop Handlers ─────────────────────────────────────────────────────────────

// Called when an animal is dragged from yard → room, or room → room
const onZoneDrop = (zoneId: string, animalId: string) => {
  if (isComplete.value || !config.value) return;

  // If animal was already in another zone, evict it first
  for (const [existingZone, existingAnimal] of placedGrid.value.entries()) {
    if (existingAnimal === animalId && existingZone !== zoneId) {
      placedGrid.value.delete(existingZone);
      break;
    }
  }

  // Handle 'behind' logic
  const isBehindSlot = zoneId.endsWith('-behind');
  const baseZoneId = isBehindSlot ? zoneId.replace('-behind', '') : zoneId;
  const cell = config.value.cells.find(c => c.zoneId === baseZoneId);
  
  if (!cell) return;

  if (cell.behindAnimalId !== undefined && !isBehindSlot) {
    // If dropping into a cell that supports 'behind', fill front first, then behind.
    const frontOccupied = placedGrid.value.has(baseZoneId);
    const behindOccupied = placedGrid.value.has(baseZoneId + '-behind');

    if (!frontOccupied) {
      placedGrid.value.set(baseZoneId, animalId);
    } else if (!behindOccupied) {
      placedGrid.value.set(baseZoneId + '-behind', animalId);
    } else {
      // Both full. Evaluate intent based on target solution to prevent frustrating layer swaps.
      if (cell.behindAnimalId === animalId) {
        const displaced = placedGrid.value.get(baseZoneId + '-behind');
        if (displaced && !yardAnimalIds.value.includes(displaced)) {
          yardAnimalIds.value = [...yardAnimalIds.value, displaced];
        }
        placedGrid.value.set(baseZoneId + '-behind', animalId);
      } else {
        const displaced = placedGrid.value.get(baseZoneId);
        if (displaced && !yardAnimalIds.value.includes(displaced)) {
          yardAnimalIds.value = [...yardAnimalIds.value, displaced];
        }
        placedGrid.value.set(baseZoneId, animalId);
      }
    }
  } else {
    // Normal cell or explicitly dropped into -behind slot
    const displaced = placedGrid.value.get(zoneId);
    if (displaced && displaced !== animalId) {
      if (!yardAnimalIds.value.includes(displaced)) {
        yardAnimalIds.value = [...yardAnimalIds.value, displaced];
      }
    }
    placedGrid.value.set(zoneId, animalId);
  }

  // Remove from yard
  yardAnimalIds.value = yardAnimalIds.value.filter(id => id !== animalId);
};

// Called when animal is dragged out of a room
const onZonePickup = (zoneId: string) => {
  const animalId = placedGrid.value.get(zoneId);
  if (!animalId) return;
  const newGrid = new Map(placedGrid.value);
  newGrid.delete(zoneId);
  placedGrid.value = newGrid;
  if (!yardAnimalIds.value.includes(animalId)) {
    yardAnimalIds.value = [...yardAnimalIds.value, animalId];
  }
};

// Yard animal dragged to yard drop zone (drag native fallback)
const onYardDrop = (e: DragEvent) => {
  const animalId = e.dataTransfer?.getData('animalId');
  if (!animalId) return;
  // Find if animal is in grid and evict it
  for (const [zone, id] of placedGrid.value.entries()) {
    if (id === animalId) {
      const newGrid = new Map(placedGrid.value);
      newGrid.delete(zone);
      placedGrid.value = newGrid;
      break;
    }
  }
  if (!yardAnimalIds.value.includes(animalId)) {
    yardAnimalIds.value = [...yardAnimalIds.value, animalId];
  }
};

// ── Validation ────────────────────────────────────────────────────────────────
const handleCheck = () => {
  if (!config.value || isComplete.value) return;

  const allCells = config.value.cells;
  const wrongZones = new Set<string>();
  let allCorrect = true;
  let allTargetsPlaced = true;

  for (const cell of allCells) {
    // Check front slot
    if (cell.animalId) {
      const placedFront = placedGrid.value.get(cell.zoneId);
      if (!placedFront) allTargetsPlaced = false;
      if (placedFront !== cell.animalId) {
        allCorrect = false;
        wrongZones.add(cell.zoneId);
      }
    } else {
      if (placedGrid.value.has(cell.zoneId)) {
        allCorrect = false;
        wrongZones.add(cell.zoneId);
      }
    }

    // Check behind slot
    if (cell.behindAnimalId !== undefined && cell.behindAnimalId !== null) {
      const placedBehind = placedGrid.value.get(cell.zoneId + '-behind');
      if (!placedBehind) allTargetsPlaced = false;
      if (placedBehind !== cell.behindAnimalId) {
        allCorrect = false;
        wrongZones.add(cell.zoneId + '-behind'); // Won't shake visually but will trigger error
      }
    } else {
      if (placedGrid.value.has(cell.zoneId + '-behind')) {
        allCorrect = false;
        wrongZones.add(cell.zoneId + '-behind');
      }
    }
  }

  if (allCorrect && allTargetsPlaced) {
    // SUCCESS
    isComplete.value = true;
    showSuccess.value = true;
    allCells.forEach(c => {
      if (c.animalId) lockedCells.value.add(c.zoneId);
    });
    spawnConfetti();
    log.success('check', { phase: config.value.phase });
    gameStore.handleSuccess();
    progressStore.updateStats(moduleId, true);
    const praise = getRandomItem(['Amazing!', 'Perfect!', 'You got it!', 'Outstanding!']);
    playInstruction(praise);
    safeSetTimeout(() => { if (gameStore.isRandomMode) { if (!gameStore.advanceRandomRound()) generateLevel(); } else { generateLevel(); } }, 3500);
  } else {
    // FAIL — shake wrong cells, evict wrong animals back to yard
    shakingCells.value = wrongZones;
    log.error('check', { wrongZones: [...wrongZones], phase: config.value.phase });
    gameStore.handleError();
    progressStore.updateStats(moduleId, false);

    safeSetTimeout(() => {
      // Evict wrong animals from wrong zones back to yard
      for (const zoneId of wrongZones) {
        const animalId = placedGrid.value.get(zoneId);
        if (animalId) {
          const newGrid = new Map(placedGrid.value);
          newGrid.delete(zoneId);
          placedGrid.value = newGrid;
          if (!yardAnimalIds.value.includes(animalId)) {
            yardAnimalIds.value = [...yardAnimalIds.value, animalId];
          }
        }
      }
      shakingCells.value = new Set();
      playInstruction('Not quite. Listen again!');
      safeSetTimeout(() => replayAudio(), 1500);
    }, 600);
  }
};

const canCheck = computed(() => {
  if (!config.value) return false;
  for (const cell of config.value.cells) {
    if (cell.animalId && !placedGrid.value.has(cell.zoneId)) return false;
    if (cell.behindAnimalId && !placedGrid.value.has(cell.zoneId + '-behind')) return false;
  }
  return true;
});

// ── Confetti ──────────────────────────────────────────────────────────────────
const spawnConfetti = () => {
  const colors = ['#f59e0b', '#22c55e', '#3b82f6', '#ef4444', '#a855f7', '#ec4899'];
  confetti.value = Array.from({ length: 28 }, (_, i) => ({
    x: 30 + Math.random() * 40,
    y: 20 + Math.random() * 60,
    color: colors[i % colors.length],
    angle: Math.random() * 360,
    id: i,
  }));
  safeSetTimeout(() => { confetti.value = []; }, 3000);
};

// ── Controls ──────────────────────────────────────────────────────────────────
const handleStart = () => {
  hasStarted.value = true;
  log.lifecycle('started');
  generateLevel();
};

const replayAudio = () => {
  if (!config.value) return;
  log.audio(`[replay] ${config.value.audioPrompt}`);
  playInstruction(config.value.audioPrompt);
};

onUnmounted(() => {
  log.lifecycle('unmounted');
  stopSpeech();
});

onMounted(() => {
  // In Random Mode, bypass the start screen and begin immediately
  if (gameStore.isRandomMode) handleStart();
});
</script>

<template>
  <div class="nl-module">

    <!-- Confetti particles -->
    <div v-if="confetti.length" class="confetti-layer" aria-hidden="true">
      <div
        v-for="p in confetti" :key="p.id"
        class="confetti-piece"
        :style="{ left: p.x + '%', top: p.y + '%', background: p.color, transform: `rotate(${p.angle}deg)` }"
      ></div>
    </div>

    <!-- ── START SCREEN ──────────────────────────────────────────────────── -->
    <div v-if="!hasStarted" class="start-screen">
      <div class="start-icon"><MenuIcon :gameId="moduleId" style="width: 140px; height: 140px;" /></div>
      <h1>Nested Logic<br><span>Animal House</span></h1>
      <p class="start-sub">Listen to where each animal lives, then place them in the right rooms.</p>
      <button @click="handleStart" class="start-btn">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        Start Game
      </button>
    </div>

    <!-- ── GAME ──────────────────────────────────────────────────────────── -->
    <div v-else-if="config" class="game-board">

      <!-- Listening Indicator -->
      <div v-if="isPlaying" class="listening-mini">
        <div class="speaker-mini">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
          </svg>
        </div>
        <span>Listening…</span>
      </div>

      <!-- Action layout -->
      <div class="action-layout">

        <!-- Top bar -->
        <header class="top-bar">
          <div class="phase-badge">
            Phase {{ config.phase }}
            <span class="grid-tag">{{ config.rows }}×{{ config.cols }} house</span>
          </div>
          <div class="instruction-text">{{ config.audioPrompt }}</div>
          <button class="replay-btn" @click="replayAudio">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
            </svg>
            Replay
          </button>
        </header>

        <!-- Main: the house -->
        <div class="main-area">
          <HouseGrid
            :rows="config.rows"
            :cols="config.cols"
            :cells="config.cells"
            :animals="config.animals"
            :placedGrid="placedGrid"
            :lockedCells="lockedCells"
            :shakingCells="shakingCells"
            :successMode="showSuccess"
            @zone-drop="onZoneDrop"
            @zone-pickup="onZonePickup"
          />
        </div>

        <!-- Bottom: yard with animals + check button -->
        <div class="yard-area" @dragover.prevent @drop.prevent="onYardDrop">
          <div class="yard-label">🌿 Yard</div>
          <div class="yard-animals">
            <div
              v-for="animal in yardAnimals"
              :key="`${levelCounter}-${animal.id}`"
              class="yard-card"
              draggable="true"
              @dragstart="(e: DragEvent) => { if (e.dataTransfer) e.dataTransfer.setData('animalId', animal.id); }"
            >
              <div class="yard-asset-ring" :style="{ background: animal.color + '22', borderColor: animal.color }">
                <AssetLibrary :name="animal.noun" :color="animal.color" size="medium" />
              </div>
              <div class="yard-noun">{{ animal.noun }}</div>
            </div>

            <!-- Placeholder when all placed -->
            <div v-if="yardAnimals.length === 0" class="yard-empty">
              All animals placed! Tap Check when ready.
            </div>
          </div>

          <!-- CHECK button -->
          <button
            class="check-btn"
            :class="{ 'check-ready': canCheck }"
            :disabled="!canCheck || isComplete"
            @click="handleCheck"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Check!
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
/* ── Base ──────────────────────────────────────────────────────────────────── */
.nl-module {
  width: 100%; height: 100%;
  display: flex; flex-direction: column;
  background: linear-gradient(160deg, #0f172a 0%, #1e293b 100%);
  font-family: 'Inter', sans-serif;
  overflow: hidden; position: relative;
  user-select: none;
}

/* ── Confetti ──────────────────────────────────────────────────────────────── */
.confetti-layer { position: fixed; inset: 0; pointer-events: none; z-index: 200; }
.confetti-piece {
  position: absolute;
  width: 12px; height: 12px;
  border-radius: 2px;
  animation: confetti-fall 2.8s ease-in forwards;
}
@keyframes confetti-fall {
  0%   { transform: translateY(0) rotate(0deg); opacity: 1; }
  100% { transform: translateY(60vh) rotate(720deg); opacity: 0; }
}

/* ── Start screen ──────────────────────────────────────────────────────────── */
.start-screen {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 1.5rem; padding: 3rem;
}
.start-icon { font-size: 7rem; }
.start-screen h1 { font-size: 3.5rem; font-weight: 900; color: white; text-align: center; line-height: 1.15; }
.start-screen h1 span { color: #f59e0b; }
.start-sub { font-size: 1.4rem; color: rgba(255,255,255,0.65); text-align: center; max-width: 600px; }
.start-btn {
  display: flex; align-items: center; gap: 0.75rem;
  font-size: 1.75rem; font-weight: 700; padding: 1.25rem 3rem;
  background: #f59e0b; color: white; border: none;
  border-radius: 50px; cursor: pointer;
  box-shadow: 0 8px 24px rgba(245,158,11,0.4);
  transition: transform 0.15s;
}
.start-btn:active { transform: scale(0.96); }

/* ── Game board ────────────────────────────────────────────────────────────── */
.game-board { flex: 1; display: flex; flex-direction: column; position: relative; overflow: hidden; }

/* LISTENING INDICATOR (Non-blocking) */
.listening-mini {
  position: absolute;
  top: 4.5rem; /* Adjusted for top-bar */
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: #3b82f6;
  color: white;
  padding: 0.5rem 1.25rem;
  border-radius: 50px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.3);
  pointer-events: none;
  animation: slide-down 0.3s ease-out;
}
.speaker-mini { width: 20px; height: 20px; }
.listening-mini span { font-weight: 700; font-size: 1.1rem; }
@keyframes slide-down {
  from { transform: translate(-50%, -20px); opacity: 0; }
  to { transform: translate(-50%, 0); opacity: 1; }
}

/* ── Action layout ─────────────────────────────────────────────────────────── */
.action-layout { flex: 1; display: flex; flex-direction: column; overflow: hidden; }

/* ── Top bar ───────────────────────────────────────────────────────────────── */
.top-bar {
  display: flex; align-items: center;
  padding: 0.75rem 1.5rem; gap: 1rem;
  background: rgba(0,0,0,0.3);
  border-bottom: 1px solid rgba(255,255,255,0.08);
  flex-shrink: 0;
}
.phase-badge {
  font-size: 1rem; font-weight: 700; color: rgba(255,255,255,0.6);
  display: flex; align-items: center; gap: 0.5rem; flex-shrink: 0;
}
.grid-tag {
  font-size: 0.85rem; padding: 0.15rem 0.6rem;
  background: rgba(255,255,255,0.1); border-radius: 20px;
  color: #f59e0b;
}
.instruction-text {
  flex: 1; font-size: 1.1rem; font-weight: 600; color: white;
  text-align: center; line-height: 1.4;
}
.replay-btn {
  display: flex; align-items: center; gap: 0.5rem;
  font-size: 1rem; font-weight: 700; padding: 0.6rem 1.4rem;
  background: #f59e0b; color: white; border: none;
  border-radius: 50px; cursor: pointer; flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(245,158,11,0.35);
  transition: transform 0.15s;
}
.replay-btn:active { transform: scale(0.95); }

/* ── Main area ─────────────────────────────────────────────────────────────── */
.main-area {
  flex: 1; display: flex; align-items: center; justify-content: center;
  padding: 1.5rem; overflow: hidden;
}

/* ── Yard ──────────────────────────────────────────────────────────────────── */
.yard-area {
  flex-shrink: 0; background: rgba(15,23,42,0.8);
  border-top: 2px solid rgba(255,255,255,0.08);
  padding: 1rem 1.5rem;
  display: flex; align-items: center; gap: 1.5rem;
  min-height: 160px;
}
.yard-label {
  font-size: 1rem; font-weight: 700; color: rgba(255,255,255,0.4);
  writing-mode: vertical-rl; text-orientation: mixed; flex-shrink: 0;
}
.yard-animals {
  display: flex; gap: 1.25rem; flex-wrap: wrap; flex: 1;
  align-items: center;
}
.yard-empty {
  color: rgba(255,255,255,0.4); font-size: 1.1rem; font-style: italic;
  padding: 1rem;
}
.yard-card {
  display: flex; flex-direction: column; align-items: center;
  border-radius: 18px; overflow: hidden;
  border: 3px solid rgba(255,255,255,0.15);
  background: rgba(255,255,255,0.06);
  cursor: grab; padding: 0.5rem 0.5rem 0.75rem;
  width: 130px; min-height: 150px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.3);
  transition: transform 0.2s, box-shadow 0.2s;
}
.yard-card:hover { transform: translateY(-4px) scale(1.03); box-shadow: 0 10px 24px rgba(0,0,0,0.4); }
.yard-card:active { cursor: grabbing; transform: scale(1.06); }
.yard-asset-ring {
  width: 96px; height: 96px; border-radius: 50%; border: 3px solid;
  display: flex; align-items: center; justify-content: center;
}
.yard-noun {
  margin-top: 0.4rem; font-size: 1rem; font-weight: 700;
  color: white; text-align: center; text-transform: capitalize;
}

/* ── Check button ──────────────────────────────────────────────────────────── */
.check-btn {
  display: flex; align-items: center; gap: 0.75rem;
  font-size: 1.6rem; font-weight: 900; padding: 1rem 2.5rem;
  background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.3);
  border: 3px solid rgba(255,255,255,0.15); border-radius: 50px;
  cursor: not-allowed; flex-shrink: 0;
  transition: all 0.35s cubic-bezier(0.34,1.56,0.64,1);
}
.check-btn.check-ready {
  background: #22c55e; color: white; border-color: #22c55e;
  cursor: pointer;
  box-shadow: 0 0 40px rgba(34,197,94,0.5);
  animation: glow-check 1.5s ease-in-out infinite alternate;
}
.check-btn.check-ready:active { transform: scale(0.95); }
@keyframes glow-check {
  from { box-shadow: 0 0 20px rgba(34,197,94,0.4); }
  to   { box-shadow: 0 0 55px rgba(34,197,94,0.8); }
}
</style>

