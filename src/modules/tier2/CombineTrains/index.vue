<script setup lang="ts">
import { getRandomPraise } from '../../../utils/praises';
import { ref, onMounted } from 'vue';
import MenuIcon from '../../../components/game/MenuIcon.vue';
import { useGameStore } from '../../../stores/useGameStore';
import { useProgressStore } from '../../../stores/useProgressStore';
import { usePromptFading } from '../../../composables/usePromptFading';
import { useSpeech } from '../../../composables/useSpeech';
import { useLogger } from '../../../composables/useLogger';
import { useSafeTimeout } from '../../../composables/useSafeTimeout';

import PuzzlePiece from '../../../components/game/PuzzlePiece.vue';
import TrainAsset from '../../../components/game/TrainAsset.vue';
import PointingHand from '../../../components/prompts/PointingHand.vue';
import type { CombineTrainsLevelConfig, TrainPartConfig, TrainShape, TrainOrientation, TrainWindowPattern, TrainColor, TrainWindowColor } from '../../../types';

const moduleId = 'tier2-combine-trains';
const progressStore = useProgressStore();
const gameStore = useGameStore();
const { playInstruction, isPlaying } = useSpeech();
const { currentLevel, registerError, resetAll } = usePromptFading(progressStore.moduleStats[moduleId]?.currentPromptLevel || 'none');
const log = useLogger(moduleId);
const { safeSetTimeout } = useSafeTimeout();

const config = ref<CombineTrainsLevelConfig | null>(null);
const options = ref<{ train: TrainPartConfig, isTarget: boolean }[]>([]);
const levelCounter = ref(0);
const isSuccess = ref(false);
const hasStarted = ref(false);

const TRAIN_SHAPES: TrainShape[] = ['steam', 'bullet', 'boxcar', 'diesel'];
const ORIENTATIONS: TrainOrientation[] = ['left', 'right'];
const TRAIN_COLORS: TrainColor[] = ['#607d8b', '#eceff1', '#795548', '#8bc34a', '#ff9800'];
const WINDOW_COLORS: TrainWindowColor[] = ['#ffeb3b', '#2196f3', '#f44336', '#9c27b0'];
const WINDOW_PATTERNS: TrainWindowPattern[] = ['square-2', 'square-3', 'round-2', 'round-3'];

const getRandomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
import { shuffle } from '../../../utils/shuffle';

const generateLevel = () => {
  levelCounter.value++;
  isSuccess.value = false;
  resetAll();
  
  const stat = progressStore.moduleStats[moduleId];
  const span = stat?.currentPhase || 1; 
  const optionCount = Math.max(3, stat?.currentOptionCount || 3);
  
  const phase = Math.min(4, span) as 1 | 2 | 3 | 4;

  const targetTrain: TrainPartConfig = {
    id: 'target',
    trainShape: getRandomItem(TRAIN_SHAPES),
    trainColor: getRandomItem(TRAIN_COLORS),
    orientation: getRandomItem(ORIENTATIONS),
    windowColor: getRandomItem(WINDOW_COLORS),
    windowPattern: getRandomItem(WINDOW_PATTERNS)
  };

  const distractorTrains: TrainPartConfig[] = [];
  
  const createDistractor = (id: string, diffs: { trainShape?: boolean, trainColor?: boolean, orientation?: boolean, windowColor?: boolean, windowPattern?: boolean }) => {
    const d: TrainPartConfig = { ...targetTrain, id };
    if (diffs.trainShape) d.trainShape = getRandomItem(TRAIN_SHAPES.filter(s => s !== targetTrain.trainShape));
    if (diffs.trainColor) d.trainColor = getRandomItem(TRAIN_COLORS.filter(c => c !== targetTrain.trainColor));
    if (diffs.orientation) d.orientation = getRandomItem(ORIENTATIONS.filter(o => o !== targetTrain.orientation));
    if (diffs.windowColor) d.windowColor = getRandomItem(WINDOW_COLORS.filter(c => c !== targetTrain.windowColor));
    if (diffs.windowPattern) d.windowPattern = getRandomItem(WINDOW_PATTERNS.filter(p => p !== targetTrain.windowPattern));
    return d;
  };
  
  if (phase === 1) {
    // Phase 1: Distractors are totally wrong (wrong body AND wrong windows)
    for (let i = 0; i < optionCount - 1; i++) {
      distractorTrains.push(createDistractor(`distractor-${i}`, { trainShape: true, trainColor: true, windowColor: true, windowPattern: true }));
    }
  } else if (phase === 2) {
    // Phase 2: Distractors isolate variables (One has wrong body but right windows, one has right body but wrong windows)
    if (optionCount >= 2) distractorTrains.push(createDistractor(`distractor-0`, { trainShape: true, trainColor: true })); // Wrong body, right windows
    if (optionCount >= 3) distractorTrains.push(createDistractor(`distractor-1`, { windowColor: true, windowPattern: true })); // Right body, wrong windows
    
    // Any remaining distractors are totally wrong
    for (let i = 2; i < optionCount - 1; i++) {
      distractorTrains.push(createDistractor(`distractor-${i}`, { trainShape: true, trainColor: true, windowColor: true, windowPattern: true }));
    }
  } else if (phase === 3) {
    // Phase 3: Partial part errors.
    for (let i = 0; i < optionCount - 1; i++) {
      const diffs: any = {};
      const errorTypes = shuffle(['trainShape', 'trainColor', 'windowColor', 'windowPattern', 'orientation']);
      diffs[errorTypes[0]] = true;
      diffs[errorTypes[1]] = true;
      distractorTrains.push(createDistractor(`distractor-${i}`, diffs));
    }
  } else {
    // Phase 4: Extremely subtle. Only ONE feature is wrong per distractor.
    const errorTypes = shuffle(['trainShape', 'trainColor', 'windowColor', 'windowPattern', 'orientation']);
    for (let i = 0; i < optionCount - 1; i++) {
      const diffs: any = {};
      diffs[errorTypes[i % errorTypes.length]] = true;
      distractorTrains.push(createDistractor(`distractor-${i}`, diffs));
    }
  }

  const allOptions = [
    { train: targetTrain, isTarget: true },
    ...distractorTrains.map(d => ({ train: d, isTarget: false }))
  ];

  options.value = shuffle(allOptions);

  config.value = {
    moduleId,
    tier: 2,
    currentPhase: span,
    optionCount: allOptions.length,
    instructionText: 'Combine the pieces!',
    phase,
    targetTrain,
    targetFeatures: {},
    distractorTrains,
    distractors: distractorTrains.map(d => ({ id: d.id }))
  };

  log.generate({ phase, span, trainShape: targetTrain.trainShape, windowColor: targetTrain.windowColor, windowPattern: targetTrain.windowPattern, optionCount: allOptions.length });
  gameStore.initializeGame(config.value!);
  safeSetTimeout(() => {
    log.audio(config.value!.instructionText);
    playInstruction(config.value!.instructionText);
  }, 500);
};

onMounted(() => {
  log.lifecycle('mounted');
  generateLevel();
});

const handleSuccess = (id: string) => {
  if (isSuccess.value) return;
  isSuccess.value = true;
  log.success(id, { phase: config.value?.phase, trainShape: config.value?.targetTrain.trainShape, windowColor: config.value?.targetTrain.windowColor });
  options.value = options.value.filter(o => o.train.id !== id);
  gameStore.handleSuccess();
  progressStore.updateStats(moduleId, true);
  
  playInstruction(getRandomPraise());
  safeSetTimeout(() => { 
      if (gameStore.isRandomMode) { if (!gameStore.advanceRandomRound()) generateLevel(); }
      else generateLevel(); 
    }, 2500);
};

const handleError = () => {
  if (isSuccess.value) return;
  log.error('wrong-drop', { phase: config.value?.phase, trainShape: config.value?.targetTrain.trainShape, promptLevel: currentLevel.value });
  gameStore.handleError();
  progressStore.updateStats(moduleId, false);
  registerError();
  playInstruction('Look closely, does it match both parts?');
};

const validateDrop = (target: HTMLElement, isTarget: boolean) => {
  return isTarget && target.closest('.train-target-zone') !== null;
};

const playHint = () => {
  if (config.value) {
    playInstruction(config.value.instructionText);
  }
};
</script>

<template>
  <div class="combine-trains-module">
    <div v-if="!hasStarted" class="start-screen">
      <div class="start-icon"><MenuIcon :gameId="moduleId" style="width: 140px; height: 140px;" /></div>
      <h1>Combine Trains<br><span>Tier 2</span></h1>
      <p class="start-sub">{{ config?.instructionText || 'Get ready to play!' }}</p>
      <button @click="hasStarted = true" class="start-btn">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        Start Challenge
      </button>
    </div>

    <div v-else-if="config" class="game-board">
      <div v-if="isPlaying" class="listening-mini">
        <div class="speaker-mini">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
        </div>
        <span>Listening...</span>
      </div>

      <header class="top-bar">
        <div class="phase-badge">Phase {{ config.phase }}</div>
        <button class="replay-btn" @click="playHint">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
          Replay
        </button>
      </header>

      <div class="action-layout">
        <!-- Layout: Vertical Split -->
    <div class="vertical-layout">
      
      <!-- Top Row: The Equation -->
      <div class="top-equation">
        <div class="equation-container">
          <!-- Body Part -->
          <div class="equation-box">
            <TrainAsset 
              renderMode="bodyOnly"
              :trainShape="config.targetTrain.trainShape"
              :trainColor="config.targetTrain.trainColor"
              :isFacingLeft="config.targetTrain.orientation === 'left'"
              :windowColor="config.targetTrain.windowColor"
              :windowPattern="config.targetTrain.windowPattern"
              class="equation-asset"
            />
          </div>
          
          <div class="math-operator">+</div>
          
          <!-- Windows Part -->
          <div class="equation-box">
            <TrainAsset 
              renderMode="windowsOnly"
              :trainShape="config.targetTrain.trainShape"
              :trainColor="config.targetTrain.trainColor"
              :isFacingLeft="config.targetTrain.orientation === 'left'"
              :windowColor="config.targetTrain.windowColor"
              :windowPattern="config.targetTrain.windowPattern"
              class="equation-asset"
            />
          </div>
          
          <div class="math-operator">=</div>
          
          <!-- Empty Drop Zone Box -->
          <div 
            class="equation-box drop-zone train-target-zone" 
            data-target-id="train-target-zone"
            :class="{ 'success-pulse': isSuccess, 'prompt-pulse': currentLevel === 'partial' && !isSuccess }"
          >
            <!-- If success, render the full target inside the box -->
            <TrainAsset 
              v-if="isSuccess"
              renderMode="full"
              :trainShape="config.targetTrain.trainShape"
              :trainColor="config.targetTrain.trainColor"
              :isFacingLeft="config.targetTrain.orientation === 'left'"
              :windowColor="config.targetTrain.windowColor"
              :windowPattern="config.targetTrain.windowPattern"
              class="equation-asset"
            />
          </div>
        </div>
      </div>

      <!-- Bottom Row: The Options -->
      <div class="bottom-options">
        <div class="options-container">
          <div class="piece-wrapper" v-for="opt in options" :key="`${levelCounter}-${opt.train.id}`">
            <PuzzlePiece 
              :id="opt.train.id"
              :transparent="true"
              dropZoneSelector=".train-target-zone"
              :validateDrop="(t) => validateDrop(t, opt.isTarget)"
              @success="() => handleSuccess(opt.train.id)"
              @error="handleError"
              :class="{ 'prompt-full': currentLevel === 'full' && opt.isTarget && !isSuccess }"
              style="width: 100%; height: 100%;"
            >
              <TrainAsset 
                renderMode="full"
                :trainShape="opt.train.trainShape"
                :trainColor="opt.train.trainColor"
                :isFacingLeft="opt.train.orientation === 'left'"
                :windowColor="opt.train.windowColor"
                :windowPattern="opt.train.windowPattern"
                class="option-asset"
              />
            </PuzzlePiece>
            <PointingHand v-if="currentLevel === 'full' && opt.isTarget && !isSuccess" />
          </div>
        </div>
      </div>

    </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.combine-trains-module {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  overflow: hidden;
}

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
.phase-badge { font-size: 1.1rem; font-weight: 700; color: var(--text-secondary); display: flex; align-items: center; gap: 0.5rem; }
.replay-btn { display: flex; align-items: center; gap: 0.5rem; font-size: 1.1rem; font-weight: 700; padding: 0.75rem 1.75rem; background: var(--color-orange); color: white; border: none; border-radius: 50px; cursor: pointer; box-shadow: 0 4px 12px rgba(249,115,22,0.35); transition: transform 0.15s; }
.replay-btn:active { transform: scale(0.95); }

.vertical-layout {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* TOP ROW: EQUATION */
.top-equation {
  flex: 4;
  background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  border-bottom: 6px solid #ffcc80;
  position: relative;
  z-index: 1;
}

.equation-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 30px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
}

.equation-box {
  width: 180px;
  height: 180px;
  background-color: var(--bg-secondary);
  border-radius: 20px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
}

.equation-box.drop-zone {
  border: 4px dashed var(--color-orange);
  background-color: rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;
}

.equation-asset {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 4px 6px rgba(0,0,0,0.15));
}

.math-operator {
  font-size: 5rem;
  font-weight: 900;
  color: #f57c00;
  text-shadow: 2px 2px 0px rgba(255,255,255,0.8);
}

@keyframes pulse-zone {
  0%, 100% { transform: scale(1); border-color: var(--color-orange); }
  50% { transform: scale(1.05); border-color: #ff9800; }
}

.prompt-pulse {
  animation: pulse-zone 2s infinite;
}

@keyframes success-glow {
  0%, 100% { transform: scale(1); filter: drop-shadow(0 0 10px #4caf50); }
  50% { transform: scale(1.05); filter: drop-shadow(0 0 40px #4caf50); border-color: #4caf50; background-color: #e8f5e9; }
}

.success-pulse {
  animation: success-glow 1s ease-in-out infinite;
  border: 4px solid #4caf50 !important;
}

/* BOTTOM ROW: OPTIONS */
.bottom-options {
  flex: 6;
  background-color: #fafafa;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
  z-index: 2; /* Ensures dragged items appear over the top equation */
}

.options-container {
  display: flex;
  flex-wrap: wrap;
  gap: 3rem;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 1000px;
}

.piece-wrapper {
  position: relative;
  width: 180px;
  height: 180px;
  background: var(--bg-secondary);
  border-radius: 20px;
  border: 4px solid #e0e0e0;
  box-shadow: 0 8px 16px rgba(0,0,0,0.1);
  display: flex;
  justify-content: center;
  align-items: center;
  transition: transform 0.2s;
}

.option-asset {
  width: 90%;
  height: 90%;
  filter: drop-shadow(0 6px 12px rgba(0,0,0,0.2));
}

@keyframes flash-full {
  0%, 100% { transform: scale(1); box-shadow: 0 0 0 transparent; }
  50% { transform: scale(1.15); box-shadow: 0 0 20px 10px rgba(255, 215, 0, 0.8); border-color: rgba(255, 215, 0, 0.8); }
}

.prompt-full {
  animation: flash-full 1.5s infinite;
  z-index: 50;
}
</style>
