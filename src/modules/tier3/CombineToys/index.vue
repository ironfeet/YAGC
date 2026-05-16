<script setup lang="ts">
import { ref, onMounted } from 'vue';
import MenuIcon from '../../../components/game/MenuIcon.vue';
import { useGameStore } from '../../../stores/useGameStore';
import { useProgressStore } from '../../../stores/useProgressStore';
import { usePromptFading } from '../../../composables/usePromptFading';
import { useSpeech } from '../../../composables/useSpeech';
import { useLogger } from '../../../composables/useLogger';
import { useSafeTimeout } from '../../../composables/useSafeTimeout';

import PuzzlePiece from '../../../components/game/PuzzlePiece.vue';
import SpatialCompositeAsset from '../../../components/game/SpatialCompositeAsset.vue';
import PointingHand from '../../../components/prompts/PointingHand.vue';
import type { CombineToysLevelConfig, SpatialItemConfig, SpatialToy, SpatialVehicle, SpatialPreposition, SpatialOrientation } from '../../../types';

const moduleId = 'tier3-combinetoys';
const progressStore = useProgressStore();
const gameStore = useGameStore();
const { playInstruction, isPlaying } = useSpeech();
const { currentLevel, registerError, resetAll } = usePromptFading(progressStore.moduleStats[moduleId]?.currentPromptLevel || 'none');
const log = useLogger(moduleId);
const { safeSetTimeout } = useSafeTimeout();

const hasStarted = ref(false);

const handleStart = () => {
  hasStarted.value = true;
  log.lifecycle('started');
  generateLevel();
};

const config = ref<CombineToysLevelConfig | null>(null);
const options = ref<{ item: SpatialItemConfig, isTarget: boolean }[]>([]);
const levelCounter = ref(0);

const filledCells = ref<Set<string>>(new Set());
const isComplete = ref(false);

const TOYS: SpatialToy[] = ['dinosaur', 'dog', 'duck'];
const VEHICLES: SpatialVehicle[] = ['car', 'plane', 'cart'];
const PREPOSITIONS: SpatialPreposition[] = ['on_top', 'inside', 'under'];
const COLORS = ['#f44336', '#2196f3', '#4caf50', '#ffeb3b', '#9c27b0', '#ff9800'];
const ORIENTATIONS: SpatialOrientation[] = ['left', 'right'];

const getRandomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const shuffle = <T>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

const generateLevel = () => {
  levelCounter.value++;
  filledCells.value.clear();
  isComplete.value = false;
  resetAll();

  const stat = progressStore.moduleStats[moduleId];
  const span = stat?.currentPhase || 1; 
  
  const phase = Math.min(4, span) as 1 | 2 | 3 | 4;

  const rule = getRandomItem(PREPOSITIONS);
  const gridRows = phase === 1 ? 2 : (phase === 2 ? 2 : 3);
  const gridCols = phase === 1 ? 2 : (phase === 2 ? 3 : 3);
  
  const selectedToys = shuffle([...TOYS]).slice(0, gridRows);
  const selectedVehicles = shuffle([...VEHICLES]).slice(0, gridCols);
  
  const rowHeaders = selectedToys.map(t => ({ toy: t, color: getRandomItem(COLORS) }));
  const colHeaders = selectedVehicles.map(v => ({ vehicle: v, color: getRandomItem(COLORS), orientation: phase > 1 ? getRandomItem(ORIENTATIONS) : 'left' }));

  const emptyCells: { row: number, col: number }[] = [];
  
  if (phase === 1) {
    emptyCells.push({ row: 1, col: 1 });
  } else if (phase === 2) {
    emptyCells.push({ row: 1, col: 2 });
    emptyCells.push({ row: 2, col: 1 });
  } else if (phase === 3) {
    emptyCells.push({ row: 1, col: 1 });
    emptyCells.push({ row: 2, col: 3 });
    emptyCells.push({ row: 3, col: 2 });
  } else {
    // Phase 4 (Model Cell / Expert)
    for(let r=1; r<=gridRows; r++){
      for(let c=1; c<=gridCols; c++){
        if (r===1 && c===1) continue; // 1,1 is Rule Key
        emptyCells.push({row: r, col: c});
      }
    }
  }

  const targets: SpatialItemConfig[] = emptyCells.map(cell => {
    return {
      id: `target-${cell.row}-${cell.col}`,
      toy: rowHeaders[cell.row - 1].toy,
      toyColor: rowHeaders[cell.row - 1].color,
      vehicle: colHeaders[cell.col - 1].vehicle,
      vehicleColor: colHeaders[cell.col - 1].color,
      vehicleOrientation: colHeaders[cell.col - 1].orientation,
      preposition: rule
    };
  });

  const distractors: SpatialItemConfig[] = [];
  const distractorCount = phase === 1 ? 2 : (phase === 2 ? 3 : 4);
  for(let i=0; i<distractorCount; i++){
    let dist: SpatialItemConfig = {
      id: `distractor-${i}`,
      toy: getRandomItem(TOYS),
      toyColor: getRandomItem(COLORS),
      vehicle: getRandomItem(VEHICLES),
      vehicleColor: getRandomItem(COLORS),
      vehicleOrientation: phase > 1 ? getRandomItem(ORIENTATIONS) : 'left',
      preposition: phase >= 3 ? getRandomItem(PREPOSITIONS) : rule
    };
    if (phase === 4) {
      // Very subtle distractors
      const baseTarget = getRandomItem(targets);
      dist = { ...baseTarget, id: `distractor-${i}` };
      const changeType = getRandomItem(['toyColor', 'vehicleColor', 'orientation', 'preposition']);
      if (changeType === 'toyColor') dist.toyColor = getRandomItem(COLORS.filter(c => c !== baseTarget.toyColor));
      else if (changeType === 'vehicleColor') dist.vehicleColor = getRandomItem(COLORS.filter(c => c !== baseTarget.vehicleColor));
      else if (changeType === 'orientation') dist.vehicleOrientation = dist.vehicleOrientation === 'left' ? 'right' : 'left';
      else dist.preposition = getRandomItem(PREPOSITIONS.filter(p => p !== rule));
    }
    distractors.push(dist);
  }

  // Choose one target for the single-item rule if not grid based, but we established it's grid based
  const allOptions = [
    ...targets.map(t => ({ item: t, isTarget: true })),
    ...distractors.map(d => ({ item: d, isTarget: false }))
  ];

  options.value = shuffle(allOptions);

  let instructionText = `Put the toys ${rule.replace('_', ' ')} the vehicles!`;
  if (phase >= 4) instructionText = `Look at the key in the top left, then finish the grid!`;

  config.value = {
    moduleId,
    tier: 3,
    currentPhase: span,
    optionCount: allOptions.length,
    instructionText,
    phase,
    gridRows,
    gridCols,
    rule,
    targetFeatures: {},
    rowHeaders,
    colHeaders,
    emptyCells,
    targetOptions: targets,
    distractorOptions: distractors,
    distractors: distractors.map(d => ({ id: d.id }))
  };

  log.generate({ phase, span, rule, gridRows, gridCols, targetCount: targets.length, distractorCount: distractors.length });
  gameStore.initializeGame(config.value!);
  safeSetTimeout(() => {
    log.audio(instructionText);
    playInstruction(instructionText);
  }, 500);
};

onMounted(() => {
  log.lifecycle('mounted');
  // generateLevel(); // wait for start button
});

const isCellEmpty = (r: number, c: number) => {
  return config.value?.emptyCells.some(cell => cell.row === r && cell.col === c);
};

const isCellFilled = (r: number, c: number) => {
  return filledCells.value.has(`${r}-${c}`);
};

const validateDrop = (target: HTMLElement, isTarget: boolean, itemId: string) => {
  if (!isTarget) return false;
  const targetId = target.getAttribute('data-target-id');
  return targetId === itemId;
};

const handleSuccess = (itemId: string) => {
  if (isComplete.value || !config.value) return;
  
  const parts = itemId.split('-');
  const r = parseInt(parts[1]);
  const c = parseInt(parts[2]);
  
  filledCells.value.add(`${r}-${c}`);
  options.value = options.value.filter(o => o.item.id !== itemId);
  log.success(itemId, { phase: config.value.phase, rule: config.value.rule, filled: filledCells.value.size, total: config.value.emptyCells.length });
  
  gameStore.handleSuccess();
  
  if (filledCells.value.size === config.value.emptyCells.length) {
    isComplete.value = true;
    log.info('Grid complete!', { phase: config.value.phase, rule: config.value.rule });
    progressStore.updateStats(moduleId, true);
    playInstruction('Amazing! You finished the grid!');
    safeSetTimeout(() => { generateLevel(); }, 4000);
  } else {
    playInstruction('Good match!');
  }
};

const handleError = () => {
  if (isComplete.value) return;
  log.error('wrong-drop', { phase: config.value?.phase, rule: config.value?.rule, promptLevel: currentLevel.value });
  gameStore.handleError();
  progressStore.updateStats(moduleId, false);
  registerError();
  playInstruction('Check the row and column carefully!');
};

const playHint = () => {
  if (config.value) {
    playInstruction(config.value.instructionText);
  }
};
</script>

<template>
  <div class="combine-toys-module">
    <!-- START SCREEN -->
    <div v-if="!hasStarted" class="start-screen">
      <div class="start-icon"><MenuIcon :gameId="moduleId" style="width: 140px; height: 140px;" /></div>
      <h1>Combine Toys<br><span>Tier 3</span></h1>
      <p class="start-sub">Look at the key, then place the toys in the right spots!</p>
      <button @click="handleStart" class="start-btn">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        Start Game
      </button>
    </div>

    <!-- GAME BOARD -->
    <div v-else-if="config" class="game-board">
      <!-- LISTENING INDICATOR -->
      <div v-if="isPlaying" class="listening-mini">
        <div class="speaker-mini">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
          </svg>
        </div>
        <span>Listening…</span>
      </div>

      <!-- TOP BAR -->
      <header class="top-bar">
        <div class="phase-badge">Phase {{ config.phase }}</div>
        <div class="instruction-text">{{ config.instructionText }}</div>
        <button class="replay-btn" @click="playHint">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
          </svg>
          Replay
        </button>
      </header>

    <div class="vertical-layout">
      <!-- TOP MATRIX AREA -->
      <div class="top-matrix" :class="{ 'matrix-complete': isComplete }">
        <div class="grid-container" :style="{ gridTemplateColumns: `auto repeat(${config.gridCols}, 1fr)` }">
          
          <!-- TOP-LEFT EMPTY OR RULE KEY -->
          <div class="matrix-cell header-empty">
            <div v-if="config.phase >= 4" class="rule-key-label">KEY</div>
          </div>
          
          <!-- COL HEADERS -->
          <div v-for="(col, cIdx) in config.colHeaders" :key="'col'+cIdx" class="matrix-cell col-header">
            <SpatialCompositeAsset 
              :isHeaderOnly="true" headerType="vehicle" 
              :vehicle="col.vehicle" :vehicleColor="col.color" :vehicleOrientation="col.orientation"
              :toy="null" toyColor="" preposition="inside" 
            />
          </div>

          <!-- ROWS -->
          <template v-for="(row, rIdx) in config.rowHeaders" :key="'row'+rIdx">
            
            <!-- ROW HEADER -->
            <div class="matrix-cell row-header">
              <SpatialCompositeAsset 
                :isHeaderOnly="true" headerType="toy" 
                :toy="row.toy" :toyColor="row.color" 
                :vehicle="null" vehicleColor="" preposition="inside" 
              />
            </div>

            <!-- DATA CELLS -->
            <template v-for="(col, cIdx) in config.colHeaders" :key="'cell-'+rIdx+'-'+cIdx">
              <div 
                class="matrix-cell data-cell"
                :class="{ 
                  'drop-zone spatial-target': isCellEmpty(rIdx + 1, cIdx + 1) && !isCellFilled(rIdx + 1, cIdx + 1),
                  'filled-zone': isCellFilled(rIdx + 1, cIdx + 1) || (!isCellEmpty(rIdx + 1, cIdx + 1) && !(rIdx === 0 && cIdx === 0 && config.phase >= 4)),
                  'rule-key-cell': rIdx === 0 && cIdx === 0 && config.phase >= 4
                }"
                :data-target-id="`target-${rIdx + 1}-${cIdx + 1}`"
              >
                <!-- EMPTY DROP ZONE -->
                <template v-if="isCellEmpty(rIdx + 1, cIdx + 1) && !isCellFilled(rIdx + 1, cIdx + 1)">
                  <!-- Just styles via CSS -->
                </template>
                
                <!-- PRE-FILLED OR COMPLETED -->
                <template v-else>
                  <SpatialCompositeAsset 
                    :toy="row.toy" :toyColor="row.color"
                    :vehicle="col.vehicle" :vehicleColor="col.color" :vehicleOrientation="col.orientation"
                    :preposition="config.rule"
                  />
                </template>
              </div>
            </template>
            
          </template>

        </div>
      </div>

      <!-- BOTTOM OPTIONS AREA -->
      <div class="bottom-options">
        <div class="options-container">
          <div class="piece-wrapper" v-for="opt in options" :key="`${levelCounter}-${opt.item.id}`">
            <PuzzlePiece 
              :id="opt.item.id"
              :transparent="true"
              dropZoneSelector=".spatial-target"
              :validateDrop="(t) => validateDrop(t, opt.isTarget, opt.item.id)"
              @success="() => handleSuccess(opt.item.id)"
              @error="handleError"
              :class="{ 'prompt-full': currentLevel === 'full' && opt.isTarget }"
              style="width: 100%; height: 100%;"
            >
              <div class="asset-card">
                <SpatialCompositeAsset 
                  :toy="opt.item.toy" :toyColor="opt.item.toyColor"
                  :vehicle="opt.item.vehicle" :vehicleColor="opt.item.vehicleColor" :vehicleOrientation="opt.item.vehicleOrientation"
                  :preposition="opt.item.preposition"
                />
              </div>
            </PuzzlePiece>
            <PointingHand v-if="currentLevel === 'full' && opt.isTarget" />
          </div>
        </div>
      </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.combine-toys-module {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-primary);
  overflow: hidden;
}

.start-screen {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 1.5rem; padding: 3rem;
}
.start-icon { font-size: 7rem; }
.start-screen h1 { font-size: 3.5rem; font-weight: 900; color: var(--text-primary); text-align: center; line-height: 1.15; }
.start-screen h1 span { color: #f59e0b; }
.start-sub { font-size: 1.4rem; color: var(--text-secondary); text-align: center; max-width: 600px; }
.start-btn {
  display: flex; align-items: center; gap: 0.75rem;
  font-size: 1.75rem; font-weight: 700; padding: 1.25rem 3rem;
  background: #f59e0b; color: white; border: none;
  border-radius: 50px; cursor: pointer;
  box-shadow: 0 8px 24px rgba(245,158,11,0.4);
  transition: transform 0.15s;
}
.start-btn:active { transform: scale(0.96); }

.game-board { flex: 1; display: flex; flex-direction: column; position: relative; overflow: hidden; }

/* LISTENING INDICATOR */
.listening-mini {
  position: absolute;
  top: 1rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: var(--color-blue);
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

/* TOP BAR */
.top-bar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 1rem 2rem;
  background: var(--bg-secondary);
  border-bottom: 2px solid rgba(255,255,255,0.07);
  gap: 1rem; flex-shrink: 0;
}
.phase-badge {
  font-size: 1.1rem; font-weight: 700; color: var(--text-secondary);
}
.instruction-text {
  flex: 1; font-size: 1.4rem; font-weight: 700; color: var(--text-primary);
  text-align: center;
}
.replay-btn {
  display: flex; align-items: center; gap: 0.5rem;
  font-size: 1.1rem; font-weight: 700;
  padding: 0.75rem 1.75rem;
  background: var(--color-orange); color: white; border: none;
  border-radius: 50px; cursor: pointer;
  box-shadow: 0 4px 12px rgba(249,115,22,0.35);
  transition: transform 0.15s;
}
.replay-btn:active { transform: scale(0.95); }

.vertical-layout {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* TOP MATRIX */
.top-matrix {
  flex: 6;
  background: linear-gradient(135deg, #e8eaf6 0%, #c5cae9 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  border-bottom: 6px solid #9fa8da;
  position: relative;
}

.grid-container {
  display: grid;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.4);
  padding: 1.5rem;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  max-height: 100%;
}

.matrix-cell {
  background: white;
  border-radius: 15px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  display: flex;
  justify-content: center;
  align-items: center;
  width: 160px;
  height: 160px;
}

.header-empty {
  background: transparent;
  box-shadow: none;
}

.rule-key-label {
  font-size: 1.5rem;
  font-weight: bold;
  color: #3f51b5;
  text-align: center;
}

.col-header, .row-header {
  background: #f5f5f5;
  border: 4px solid #e0e0e0;
}

.data-cell {
  position: relative;
}

.drop-zone {
  background: rgba(255, 255, 255, 0.5);
  border: 4px dashed #3f51b5;
  transition: all 0.3s ease;
}

.rule-key-cell {
  background: #e8eaf6;
  border: 4px solid #3f51b5;
}

.filled-zone {
  border: 4px solid #4caf50;
  background: #f1f8e9;
  animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes popIn {
  0% { transform: scale(0.8); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes celebrateGrid {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.matrix-complete .grid-container {
  animation: celebrateGrid 0.5s ease-in-out infinite alternate;
  box-shadow: 0 0 50px rgba(76, 175, 80, 0.5);
}


/* BOTTOM OPTIONS */
.bottom-options {
  flex: 4;
  background-color: #fafafa;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  z-index: 2;
}

.options-container {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.piece-wrapper {
  position: relative;
  width: 150px;
  height: 150px;
  transition: transform 0.2s;
}

.asset-card {
  width: 100%;
  height: 100%;
  background: white;
  border-radius: 20px;
  border: 4px solid #ccc;
  box-shadow: 0 8px 16px rgba(0,0,0,0.1);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
}

@keyframes flash-full {
  0%, 100% { transform: scale(1); box-shadow: 0 0 0 transparent; }
  50% { transform: scale(1.15); box-shadow: 0 0 20px 10px rgba(255, 215, 0, 0.8); border-radius: 20px; }
}

.prompt-full {
  animation: flash-full 1.5s infinite;
  z-index: 50;
}
</style>
