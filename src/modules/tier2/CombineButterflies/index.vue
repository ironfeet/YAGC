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
import ButterflyAsset from '../../../components/game/ButterflyAsset.vue';
import PointingHand from '../../../components/prompts/PointingHand.vue';
import type { CombineButterfliesLevelConfig, ButterflyPartConfig, ButterflyOrientation, ButterflyWingShape, ButterflyPatternColor, ButterflyBodyColor } from '../../../types';

const moduleId = 'tier2-combine-butterflies';
const progressStore = useProgressStore();
const gameStore = useGameStore();
const { playInstruction, isPlaying } = useSpeech();
const { currentLevel, registerError, resetAll } = usePromptFading(progressStore.moduleStats[moduleId]?.currentPromptLevel || 'none');
const log = useLogger(moduleId);
const { safeSetTimeout } = useSafeTimeout();

const config = ref<CombineButterfliesLevelConfig | null>(null);
const options = ref<{ butterfly: ButterflyPartConfig, isTarget: boolean }[]>([]);
const levelCounter = ref(0);
const isSuccess = ref(false);
const hasStarted = ref(false);

const ORIENTATIONS: ButterflyOrientation[] = [0, 90, 180, 270];
const WING_SHAPES: ButterflyWingShape[] = ['rounded', 'pointed', 'triangle', 'wide'];
const BODY_COLORS: ButterflyBodyColor[] = ['#444444', '#795548', '#5c6bc0', '#009688'];
const PATTERN_COLORS: ButterflyPatternColor[] = ['#ff4081', '#2196f3', '#4caf50', '#ff9800', '#9c27b0', '#e91e63'];

const getRandomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const shuffle = <T>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

const generateLevel = () => {
  levelCounter.value++;
  isSuccess.value = false;
  resetAll();
  
  const stat = progressStore.moduleStats[moduleId];
  const span = stat?.currentPhase || 1; 
  const optionCount = Math.max(3, stat?.currentOptionCount || 3);
  
  const phase = Math.min(4, span) as 1 | 2 | 3 | 4;

  const targetButterfly: ButterflyPartConfig = {
    id: 'target',
    orientation: getRandomItem(ORIENTATIONS),
    bodyColor: getRandomItem(BODY_COLORS),
    wingShape: getRandomItem(WING_SHAPES),
    patternColor: getRandomItem(PATTERN_COLORS)
  };

  const distractorButterflies: ButterflyPartConfig[] = [];
  
  const createDistractor = (id: string, diffs: { orientation?: boolean, bodyColor?: boolean, wingShape?: boolean, patternColor?: boolean }) => {
    const d: ButterflyPartConfig = { ...targetButterfly, id };
    if (diffs.orientation) d.orientation = getRandomItem(ORIENTATIONS.filter(o => o !== targetButterfly.orientation));
    if (diffs.bodyColor) d.bodyColor = getRandomItem(BODY_COLORS.filter(c => c !== targetButterfly.bodyColor));
    if (diffs.wingShape) d.wingShape = getRandomItem(WING_SHAPES.filter(s => s !== targetButterfly.wingShape));
    if (diffs.patternColor) d.patternColor = getRandomItem(PATTERN_COLORS.filter(c => c !== targetButterfly.patternColor));
    return d;
  };
  
  if (phase === 1) {
    // Phase 1: Distractors are totally wrong (wrong body AND wrong wings)
    for (let i = 0; i < optionCount - 1; i++) {
      distractorButterflies.push(createDistractor(`distractor-${i}`, { orientation: true, bodyColor: true, wingShape: true, patternColor: true }));
    }
  } else if (phase === 2) {
    // Phase 2: Distractors isolate variables (One has wrong body but right wings, one has right body but wrong wings)
    if (optionCount >= 2) distractorButterflies.push(createDistractor(`distractor-0`, { orientation: true, bodyColor: true })); // Wrong body, right wings
    if (optionCount >= 3) distractorButterflies.push(createDistractor(`distractor-1`, { wingShape: true, patternColor: true })); // Right body, wrong wings
    
    // Any remaining distractors are totally wrong
    for (let i = 2; i < optionCount - 1; i++) {
      distractorButterflies.push(createDistractor(`distractor-${i}`, { orientation: true, bodyColor: true, wingShape: true, patternColor: true }));
    }
  } else if (phase === 3) {
    // Phase 3: Partial part errors. e.g. body color right but orientation wrong.
    for (let i = 0; i < optionCount - 1; i++) {
      const diffs: any = {};
      const errorTypes = shuffle(['orientation', 'bodyColor', 'wingShape', 'patternColor']);
      // Pick 2 random features to be wrong
      diffs[errorTypes[0]] = true;
      diffs[errorTypes[1]] = true;
      distractorButterflies.push(createDistractor(`distractor-${i}`, diffs));
    }
  } else {
    // Phase 4: Extremely subtle. Only ONE feature is wrong per distractor.
    const errorTypes = shuffle(['orientation', 'bodyColor', 'wingShape', 'patternColor']);
    for (let i = 0; i < optionCount - 1; i++) {
      const diffs: any = {};
      diffs[errorTypes[i % errorTypes.length]] = true;
      distractorButterflies.push(createDistractor(`distractor-${i}`, diffs));
    }
  }

  const allOptions = [
    { butterfly: targetButterfly, isTarget: true },
    ...distractorButterflies.map(d => ({ butterfly: d, isTarget: false }))
  ];

  options.value = shuffle(allOptions);

  config.value = {
    moduleId,
    tier: 2,
    currentPhase: span,
    optionCount: allOptions.length,
    instructionText: 'Combine the pieces!',
    phase,
    targetButterfly,
    targetFeatures: {},
    distractorButterflies,
    distractors: distractorButterflies.map(d => ({ id: d.id }))
  };

  log.generate({ phase, span, wingShape: targetButterfly.wingShape, patternColor: targetButterfly.patternColor, orientation: targetButterfly.orientation, optionCount: allOptions.length });
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
  log.success(id, { phase: config.value?.phase, wingShape: config.value?.targetButterfly.wingShape, patternColor: config.value?.targetButterfly.patternColor });
  options.value = options.value.filter(o => o.butterfly.id !== id);
  gameStore.handleSuccess();
  progressStore.updateStats(moduleId, true);
  const praises = ['Great job!', 'You put it together!', 'Perfect!'];
  playInstruction(getRandomItem(praises));
  safeSetTimeout(() => { generateLevel(); }, 2500);
};

const handleError = () => {
  if (isSuccess.value) return;
  gameStore.handleError();
  progressStore.updateStats(moduleId, false);
  registerError();
  playInstruction('Look closely, does it match both parts?');
};

const validateDrop = (target: HTMLElement, isTarget: boolean) => {
  return isTarget && target.closest('.butterfly-target-zone') !== null;
};

const playHint = () => {
  if (config.value) {
    playInstruction(config.value.instructionText);
  }
};
</script>

<template>
  <div class="combine-butterflies-module">
    <div v-if="!hasStarted" class="start-screen">
      <div class="start-icon"><MenuIcon :gameId="moduleId" style="width: 140px; height: 140px;" /></div>
      <h1>Combine Butterflies<br><span>Tier 2</span></h1>
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
            <ButterflyAsset 
              renderMode="bodyOnly"
              :wingShape="config.targetButterfly.wingShape"
              :patternColor="config.targetButterfly.patternColor"
              :bodyColor="config.targetButterfly.bodyColor"
              :orientation="config.targetButterfly.orientation"
              class="equation-asset"
            />
          </div>
          
          <div class="math-operator">+</div>
          
          <!-- Wings Part -->
          <div class="equation-box">
            <ButterflyAsset 
              renderMode="wingsOnly"
              :wingShape="config.targetButterfly.wingShape"
              :patternColor="config.targetButterfly.patternColor"
              :bodyColor="config.targetButterfly.bodyColor"
              :orientation="config.targetButterfly.orientation"
              class="equation-asset"
            />
          </div>
          
          <div class="math-operator">=</div>
          
          <!-- Empty Drop Zone Box -->
          <div 
            class="equation-box drop-zone butterfly-target-zone" 
            data-target-id="butterfly-target-zone"
            :class="{ 'success-pulse': isSuccess, 'prompt-pulse': currentLevel === 'partial' && !isSuccess }"
          >
            <!-- If success, render the full target inside the box -->
            <ButterflyAsset 
              v-if="isSuccess"
              renderMode="full"
              :wingShape="config.targetButterfly.wingShape"
              :patternColor="config.targetButterfly.patternColor"
              :bodyColor="config.targetButterfly.bodyColor"
              :orientation="config.targetButterfly.orientation"
              class="equation-asset"
            />
          </div>
        </div>
      </div>

      <!-- Bottom Row: The Options -->
      <div class="bottom-options">
        <div class="options-container">
          <div class="piece-wrapper" v-for="opt in options" :key="`${levelCounter}-${opt.butterfly.id}`">
            <PuzzlePiece 
              :id="opt.butterfly.id"
              :transparent="true"
              dropZoneSelector=".butterfly-target-zone"
              :validateDrop="(t) => validateDrop(t, opt.isTarget)"
              @success="() => handleSuccess(opt.butterfly.id)"
              @error="handleError"
              :class="{ 'prompt-full': currentLevel === 'full' && opt.isTarget && !isSuccess }"
              style="width: 100%; height: 100%;"
            >
              <ButterflyAsset 
                renderMode="full"
                :wingShape="opt.butterfly.wingShape"
                :patternColor="opt.butterfly.patternColor"
                :bodyColor="opt.butterfly.bodyColor"
                :orientation="opt.butterfly.orientation"
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
.combine-butterflies-module {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-primary);
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
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  border-bottom: 6px solid #a5d6a7;
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
  background-color: white;
  border-radius: 20px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
}

.equation-box.drop-zone {
  border: 4px dashed var(--color-green);
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
  color: #388e3c;
  text-shadow: 2px 2px 0px rgba(255,255,255,0.8);
}

@keyframes pulse-zone {
  0%, 100% { transform: scale(1); border-color: var(--color-green); }
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
  background-color: #ffffff;
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
e>
