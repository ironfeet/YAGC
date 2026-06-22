<script setup lang="ts">
import { ref, onUnmounted } from 'vue';
import MenuIcon from '../../../components/game/MenuIcon.vue';
import { useProgressStore } from '../../../stores/useProgressStore';
import { useGameStore } from '../../../stores/useGameStore';
import { useSpeech } from '../../../composables/useSpeech';
import { useLogger } from '../../../composables/useLogger';
import { useSafeTimeout } from '../../../composables/useSafeTimeout';

import { usePromptFading } from '../../../composables/usePromptFading';
import PuzzlePiece from '../../../components/game/PuzzlePiece.vue';
import AnalogyAsset from './AnalogyAsset.vue';
import PointingHand from '../../../components/prompts/PointingHand.vue';
import type { 
  AnalogiesLevelConfig, 
  AnalogyHouse, 
  TransformationRule, 
  AnalogyItem,
  AnalogyShape,
  AnalogyOrientation,
  AnalogyInhabitant
} from '../../../types';

const moduleId = 'tier3-analogies';
const progressStore = useProgressStore();
const gameStore = useGameStore();
const { playInstruction, stopSpeech, isPlaying } = useSpeech();
const log = useLogger(moduleId);
const { safeSetTimeout } = useSafeTimeout();
const { currentLevel, registerError, resetAll } = usePromptFading(progressStore.moduleStats[moduleId]?.currentPromptLevel || 'none');

// ── State ─────────────────────────────────────────────────────────────────────
const config = ref<AnalogiesLevelConfig | null>(null);
const hasStarted = ref(false);
const levelCounter = ref(0);
const isComplete = ref(false);

const SHAPES: AnalogyShape[] = ['tall', 'wide', 'angled'];
const ORIENTATIONS: AnalogyOrientation[] = ['left', 'right'];
const INHABITANTS: AnalogyInhabitant[] = ['none', 'cat', 'dog'];
const COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#a855f7', '#f97316', '#eab308'];

import { shuffle } from '../../../utils/shuffle';
const getRandomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Random valid house
const generateRandomHouse = (): AnalogyHouse => ({
  color: getRandomItem(COLORS),
  shape: getRandomItem(SHAPES),
  orientation: getRandomItem(ORIENTATIONS),
  count: Math.random() > 0.5 ? 1 : 2,
  inhabitant: getRandomItem(INHABITANTS),
});

// Apply rule to a house
const applyRule = (base: AnalogyHouse, rule: TransformationRule): AnalogyHouse => {
  const result = { ...base };
  if (rule.color && rule.color !== 'SAME') result.color = rule.color;
  if (rule.shape && rule.shape !== 'SAME') result.shape = rule.shape;
  if (rule.orientation === 'FLIP') {
    result.orientation = result.orientation === 'left' ? 'right' : 'left';
  }
  if (rule.count === 'ADD' && result.count === 1) result.count = 2;
  else if (rule.count === 'REMOVE' && result.count === 2) result.count = 1;
  // If count is same, it remains unchanged. If we try to ADD to 2 or REMOVE from 1, it silently ignores (cap at 1-2).
  
  if (rule.inhabitant && rule.inhabitant !== 'SAME') result.inhabitant = rule.inhabitant;
  
  return result;
};

// Procedural Level Generation
const generateLevel = () => {
  levelCounter.value++;
  isComplete.value = false;
  resetAll();

  const stat = progressStore.moduleStats[moduleId];
  const span = stat?.currentPhase ?? 1;
  const phase: 1 | 2 | 3 | 4 | 5 = Math.min(5, span) as any;

  // 1. Pick number of transformations based on phase
  const transformCount = phase;
  
  // 2. Select properties to change
  const allProps = ['color', 'shape', 'orientation', 'count', 'inhabitant'];
  const propsToChange = shuffle(allProps).slice(0, transformCount);
  
  const rule: TransformationRule = {};
  
  // Base houses
  let houseA = generateRandomHouse();
  
  if (propsToChange.includes('color')) {
    rule.color = getRandomItem(COLORS.filter(c => c !== houseA.color));
  }
  if (propsToChange.includes('shape')) {
    rule.shape = getRandomItem(SHAPES.filter(s => s !== houseA.shape));
  }
  if (propsToChange.includes('orientation')) {
    rule.orientation = 'FLIP';
  }
  if (propsToChange.includes('count')) {
    rule.count = houseA.count === 1 ? 'ADD' : 'REMOVE';
  }
  if (propsToChange.includes('inhabitant')) {
    rule.inhabitant = getRandomItem(INHABITANTS.filter(i => i !== houseA.inhabitant));
  }

  const houseB = applyRule(houseA, rule);

  // Generate C (make sure it's not identical to A)
  let houseC = generateRandomHouse();
  if (rule.count === 'ADD') houseC.count = 1;
  if (rule.count === 'REMOVE') houseC.count = 2;
  while (JSON.stringify(houseC) === JSON.stringify(houseA)) {
    houseC = generateRandomHouse();
    if (rule.count === 'ADD') houseC.count = 1;
    if (rule.count === 'REMOVE') houseC.count = 2;
  }

  // Generate D (correct answer)
  const houseD = applyRule(houseC, rule);
  
  // Determine distractor count
  const optionCount = phase === 1 ? 3 : (phase === 2 ? 4 : 4);
  const distractors: AnalogyHouse[] = [];
  
  // Generate Near-Miss Distractors
  for (let i = 0; i < optionCount - 1; i++) {
    // Start with the correct answer, then ruin 1 or more transformed properties
    const distractor = { ...houseD };
    
    // Pick one property that was supposed to change, and undo its change (revert to C's state or random)
    const revertProp = propsToChange.length > 0 ? getRandomItem(propsToChange) : getRandomItem(allProps);
    
    if (revertProp === 'color') distractor.color = houseC.color;
    else if (revertProp === 'shape') distractor.shape = houseC.shape;
    else if (revertProp === 'orientation') distractor.orientation = houseC.orientation;
    else if (revertProp === 'count') distractor.count = houseC.count;
    else if (revertProp === 'inhabitant') distractor.inhabitant = houseC.inhabitant;
    
    // If it accidentally equals D or C exactly, mutate it randomly
    if (JSON.stringify(distractor) === JSON.stringify(houseD) || JSON.stringify(distractor) === JSON.stringify(houseC)) {
      distractor.color = getRandomItem(COLORS.filter(c => c !== distractor.color));
    }
    
    distractors.push(distractor);
  }

  const targetItem: AnalogyItem = { id: 'target', house: houseD };
  const distractorItems: AnalogyItem[] = distractors.map((d, idx) => ({ id: `d-${idx}`, house: d }));
  
  const allOptions = shuffle([targetItem, ...distractorItems]);

  config.value = {
    moduleId,
    tier: 3,
    currentPhase: phase,
    optionCount: allOptions.length,
    instructionText: 'Find the rule and complete the pattern!',
    phase,
    rule,
    houseA,
    houseB,
    houseC,
    houseD,
    options: allOptions,
    targetFeatures: {},
    distractors: [] // Unused dynamically here
  };

  gameStore.initializeGame(config.value as any);
  log.generate({ phase, transformCount, propsChanged: propsToChange });

  safeSetTimeout(() => {
    log.audio(config.value!.instructionText);
    playInstruction(config.value!.instructionText);
  }, 400);
};

// ── Drop Handlers ─────────────────────────────────────────────────────────────

const validateDrop = (target: HTMLElement, isTarget: boolean) => {
  return isTarget && target.closest('.analogy-target') !== null;
};

const handleSuccess = (itemId: string) => {
  if (isComplete.value || !config.value) return;
  
  isComplete.value = true;
  log.success(itemId, { phase: config.value.phase });
  gameStore.handleSuccess();
  progressStore.updateStats(moduleId, true);
  
  const praise = getRandomItem(['Brilliant logic!', 'Exactly right!', 'You figured it out!']);
  playInstruction(praise);
  
  safeSetTimeout(() => {
    if (gameStore.isRandomMode) {
      if (!gameStore.advanceRandomRound()) generateLevel();
    } else {
      generateLevel();
    }
  }, 3500);
};

const handleError = (itemId: string) => {
  if (isComplete.value || !config.value) return;
  
  log.error(itemId, { phase: config.value.phase, promptLevel: currentLevel.value });
  gameStore.handleError();
  progressStore.updateStats(moduleId, false);
  registerError();
  
  playInstruction('Look closely at the top row. What changed?');
};

const handleStart = () => {
  hasStarted.value = true;
  log.lifecycle('started');
  generateLevel();
};

const replayAudio = () => {
  if (!config.value) return;
  log.audio(`[replay] ${config.value.instructionText}`);
  playInstruction(config.value.instructionText);
};

onUnmounted(() => {
  log.lifecycle('unmounted');
  stopSpeech();
});
</script>

<template>
  <div class="analogies-module">

    <!-- ── START SCREEN ──────────────────────────────────────────────────── -->
    <div v-if="!hasStarted" class="start-screen">
      <div class="start-icon"><MenuIcon :gameId="moduleId" style="width: 140px; height: 140px;" /></div>
      <h1>Analogies<br><span>Logic Matrix</span></h1>
      <p class="start-sub">Deduce the rule from the top row, and apply it to the bottom row.</p>
      <button @click="handleStart" class="start-btn">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        Start Game
      </button>
    </div>

    <!-- ── GAME ──────────────────────────────────────────────────────────── -->
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
        <button class="replay-btn" @click="replayAudio">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
          </svg>
          Replay
        </button>
      </header>

      <div class="action-layout">
        
        <!-- LOGIC BOARD (Top Area) -->
        <div class="logic-board-area" :class="{ 'board-complete': isComplete }">
          <div class="logic-grid">
            
            <!-- Row 1: A -> B -->
            <div class="logic-cell">
              <AnalogyAsset v-bind="config.houseA" />
            </div>
            <div class="arrow-cell">
              <svg viewBox="0 0 24 24" class="arrow-svg"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>
            </div>
            <div class="logic-cell logic-cell-result">
              <AnalogyAsset v-bind="config.houseB" />
            </div>

            <!-- Row 2: C -> D (Drop zone) -->
            <div class="logic-cell">
              <AnalogyAsset v-bind="config.houseC" />
            </div>
            <div class="arrow-cell">
              <svg viewBox="0 0 24 24" class="arrow-svg"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>
            </div>
            
            <div class="logic-cell drop-zone-container" :class="{ 'is-complete': isComplete }">
              <div v-if="!isComplete" class="analogy-target" data-target-id="target">
                <div class="question-mark">?</div>
              </div>
              <div v-else class="analogy-target-filled">
                <AnalogyAsset v-bind="config.houseD" />
              </div>
            </div>

          </div>
        </div>

        <!-- OPTIONS GRID (Bottom Area) -->
        <div class="options-area">
          <div class="options-container">
            <div class="piece-wrapper" v-for="opt in config.options" :key="`${levelCounter}-${opt.id}`">
              <PuzzlePiece 
                :id="opt.id"
                :transparent="true"
                dropZoneSelector=".analogy-target"
                :validateDrop="(t) => validateDrop(t, opt.id === 'target')"
                @success="() => handleSuccess(opt.id)"
                @error="() => handleError(opt.id)"
                :class="{ 'prompt-full': currentLevel === 'full' && opt.id === 'target' }"
                class="analogy-piece"
              >
                <div class="asset-card">
                  <AnalogyAsset v-bind="opt.house" />
                </div>
              </PuzzlePiece>
              <PointingHand v-if="currentLevel === 'full' && opt.id === 'target'" />
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.analogies-module {
  width: 100%; height: 100%;
  display: flex; flex-direction: column;
  background: var(--bg-primary);
  font-family: 'Inter', sans-serif;
  overflow: hidden; position: relative;
  user-select: none;
}

/* ── Start screen ──────────────────────────────────────────────────────────── */
.start-screen {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 1.5rem; padding: 3rem;
}
.start-icon { font-size: 7rem; }
.start-screen h1 { font-size: 3.5rem; font-weight: 900; color: var(--text-primary); text-align: center; line-height: 1.15; }
.start-screen h1 span { color: var(--color-blue); }
.start-sub { font-size: 1.4rem; color: var(--text-secondary); text-align: center; max-width: 600px; }
.start-btn {
  display: flex; align-items: center; gap: 0.75rem;
  font-size: 1.75rem; font-weight: 700; padding: 1.25rem 3rem;
  background: var(--color-blue); color: white; border: none;
  border-radius: 50px; cursor: pointer;
  box-shadow: 0 8px 24px rgba(59,130,246,0.4);
  transition: transform 0.15s;
}
.start-btn:active { transform: scale(0.96); }

/* ── Game board ────────────────────────────────────────────────────────────── */
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

/* ── Action layout ─────────────────────────────────────────────────────────── */
.action-layout { flex: 1; display: flex; flex-direction: column; overflow: hidden; }

/* ── Logic Board ───────────────────────────────────────────────────────────── */
.logic-board-area {
  flex: 6; display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 2rem;
  border-bottom: 4px solid #cbd5e1;
  position: relative;
}

.logic-grid {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 2rem 3rem;
  background: white;
  padding: 2rem 3rem;
  border-radius: 24px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
}

.logic-cell {
  width: 180px; height: 180px;
  background: #f1f5f9;
  border-radius: 16px;
  display: flex; align-items: center; justify-content: center;
  border: 4px solid #e2e8f0;
  padding: 1rem;
}
.logic-cell-result {
  background: #f0fdf4;
  border-color: #bbf7d0;
}

.arrow-cell {
  display: flex; align-items: center; justify-content: center;
}
.arrow-svg {
  width: 48px; height: 48px; color: #94a3b8;
}

.drop-zone-container {
  background: transparent; border: none; padding: 0;
}
.analogy-target {
  width: 100%; height: 100%;
  background: rgba(255,255,255,0.6);
  border: 4px dashed #94a3b8;
  border-radius: 16px;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.3s;
}
.analogy-target .question-mark {
  font-size: 4rem; font-weight: 900; color: #cbd5e1;
}
.analogy-target-filled {
  width: 100%; height: 100%;
  background: #f0fdf4;
  border: 4px solid #22c55e;
  border-radius: 16px;
  display: flex; align-items: center; justify-content: center;
  padding: 1rem;
  animation: popIn 0.4s cubic-bezier(0.175,0.885,0.32,1.275);
}

@keyframes popIn {
  0% { transform: scale(0.8); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

.board-complete .logic-grid {
  box-shadow: 0 0 50px rgba(34, 197, 94, 0.3);
  border: 2px solid rgba(34, 197, 94, 0.4);
}

/* ── Options Area ──────────────────────────────────────────────────────────── */
.options-area {
  flex: 4; display: flex; align-items: center; justify-content: center;
  background: #f8fafc;
  padding: 1.5rem;
}

.options-container {
  display: flex; flex-wrap: wrap; gap: 2rem; justify-content: center; align-items: center; width: 100%;
}

.piece-wrapper {
  position: relative; width: 150px; height: 150px; transition: transform 0.2s;
}
.analogy-piece { width: 100%; height: 100%; }

.asset-card {
  width: 100%; height: 100%;
  background: white; border-radius: 16px;
  border: 4px solid #e2e8f0;
  box-shadow: 0 8px 16px rgba(0,0,0,0.06);
  display: flex; justify-content: center; align-items: center;
  padding: 1rem;
  transition: transform 0.2s, box-shadow 0.2s;
}
.asset-card:hover {
  transform: translateY(-4px); box-shadow: 0 12px 24px rgba(0,0,0,0.1); border-color: #cbd5e1;
}

/* Prompts */
@keyframes flash-full {
  0%, 100% { transform: scale(1); box-shadow: 0 0 0 transparent; }
  50% { transform: scale(1.15); box-shadow: 0 0 20px 10px rgba(255, 215, 0, 0.8); border-radius: 16px; }
}
.prompt-full { animation: flash-full 1.5s infinite; z-index: 50; }
</style>
