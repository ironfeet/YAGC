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
import ObjectGroupAsset from '../../../components/game/ObjectGroupAsset.vue';
import PointingHand from '../../../components/prompts/PointingHand.vue';
import type { ArithmeticsLevelConfig, MathOperand, MathOperation, MathItemType } from '../../../types';

const moduleId = 'tier2-arithmetics';
const progressStore = useProgressStore();
const gameStore = useGameStore();
const { playInstruction, isPlaying } = useSpeech();
const { currentLevel, registerError, resetAll } = usePromptFading(progressStore.moduleStats[moduleId]?.currentPromptLevel || 'none');
const log = useLogger(moduleId);
const { safeSetTimeout } = useSafeTimeout();

const config = ref<ArithmeticsLevelConfig | null>(null);
const options = ref<{ operand: MathOperand, isTarget: boolean }[]>([]);
const levelCounter = ref(0);
const isSuccess = ref(false);
const hasStarted = ref(false);

const ITEM_TYPES: MathItemType[] = ['ball', 'apple', 'star'];

const getRandomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
import { shuffle } from '../../../utils/shuffle';
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const generateLevel = () => {
  levelCounter.value++;
  isSuccess.value = false;
  resetAll();
  
  const stat = progressStore.moduleStats[moduleId];
  const span = stat?.currentPhase || 1; 
  const optionCount = Math.max(3, stat?.currentOptionCount || 4);
  
  const phase = Math.min(5, span) as 1 | 2 | 3 | 4 | 5;
  const itemType = getRandomItem(ITEM_TYPES);
  
  let operation: MathOperation;
  let leftCount = 0;
  let rightCount = 0;
  let answerCount = 0;
  let renderOptionsAsNumber = false;
  
  if (phase === 1) {
    operation = 'count';
    leftCount = randomInt(1, 10);
    answerCount = leftCount;
    renderOptionsAsNumber = true; // Options are numbers
  } else if (phase === 2) {
    operation = 'add';
    leftCount = randomInt(1, 5);
    rightCount = randomInt(1, 5);
    answerCount = leftCount + rightCount;
    renderOptionsAsNumber = false; // Options are groups of items
  } else if (phase === 3) {
    operation = 'subtract';
    leftCount = randomInt(4, 10);
    rightCount = randomInt(1, leftCount - 1); // Ensure positive answer
    answerCount = leftCount - rightCount;
    renderOptionsAsNumber = false;
  } else if (phase === 4) {
    operation = 'multiply';
    leftCount = randomInt(2, 5);
    rightCount = randomInt(1, 4);
    answerCount = leftCount * rightCount;
    renderOptionsAsNumber = true; // Numbers scale better here
  } else {
    operation = 'divide';
    rightCount = randomInt(2, 5);
    answerCount = randomInt(2, 5);
    leftCount = rightCount * answerCount;
    renderOptionsAsNumber = true;
  }

  const leftOperand: MathOperand = { id: 'left', count: leftCount, itemType, renderAsNumber: phase >= 4 };
  const rightOperand: MathOperand | undefined = operation === 'count' ? undefined : { id: 'right', count: rightCount, itemType, renderAsNumber: phase >= 4 };
  
  const targetAnswer: MathOperand = { id: 'target', count: answerCount, itemType, renderAsNumber: renderOptionsAsNumber };

  // Generate distinct distractors close to the answer
  const distractors: MathOperand[] = [];
  const usedCounts = new Set<number>([answerCount]);
  let attempts = 0;
  
  while (distractors.length < optionCount - 1 && attempts < 100) {
    let offset = randomInt(-5, 5);
    if (offset === 0) offset = 6;
    let distractorCount = answerCount + offset;
    if (distractorCount < 1) distractorCount = Math.abs(answerCount - offset) + 1 || 2;
    
    if (!usedCounts.has(distractorCount)) {
      usedCounts.add(distractorCount);
      distractors.push({
        id: `distractor-${distractorCount}`,
        count: distractorCount,
        itemType,
        renderAsNumber: renderOptionsAsNumber
      });
    }
    attempts++;
  }

  let fallback = answerCount + 1;
  while (distractors.length < optionCount - 1) {
    if (!usedCounts.has(fallback)) {
      usedCounts.add(fallback);
      distractors.push({
        id: `distractor-${fallback}`,
        count: fallback,
        itemType,
        renderAsNumber: renderOptionsAsNumber
      });
    }
    fallback++;
  }

  const allOptions = [
    { operand: targetAnswer, isTarget: true },
    ...distractors.map(d => ({ operand: d, isTarget: false }))
  ];

  options.value = shuffle(allOptions);

  let instructionText = 'How many are there?';
  if (operation === 'add') instructionText = 'Add them together!';
  else if (operation === 'subtract') instructionText = 'Subtract the items!';
  else if (operation === 'multiply') instructionText = 'Multiply the items!';
  else if (operation === 'divide') instructionText = 'Divide the items!';

  config.value = {
    moduleId,
    tier: 2,
    currentPhase: span,
    optionCount: allOptions.length,
    instructionText,
    phase,
    operation,
    leftOperand,
    rightOperand,
    targetAnswer,
    targetFeatures: {},
    distractorAnswers: distractors,
    distractors: distractors.map(d => ({ id: d.id }))
  };

  log.generate({ phase, span, operation, answerCount, itemType, optionCount: allOptions.length });
  gameStore.initializeGame(config.value!);
  safeSetTimeout(() => {
    log.audio(instructionText);
    playInstruction(instructionText);
  }, 500);
};

onMounted(() => {
  log.lifecycle('mounted');
  generateLevel();
});

const handleSuccess = (id: string) => {
  if (isSuccess.value) return;
  isSuccess.value = true;
  log.success(id, { phase: config.value?.phase, operation: config.value?.operation, answer: config.value?.targetAnswer.count });
  options.value = options.value.filter(o => o.operand.id !== id);
  gameStore.handleSuccess();
  progressStore.updateStats(moduleId, true);
  const praises = ['Great job!', 'Perfect!', 'You got it!'];
  playInstruction(getRandomItem(praises));
  safeSetTimeout(() => { generateLevel(); }, 2500);
};

const handleError = () => {
  if (isSuccess.value) return;
  log.error('wrong-drop', { phase: config.value?.phase, operation: config.value?.operation, correctAnswer: config.value?.targetAnswer.count });
  gameStore.handleError();
  progressStore.updateStats(moduleId, false);
  registerError();
  playInstruction('Try again. Count carefully!');
};

const validateDrop = (target: HTMLElement, isTarget: boolean) => {
  return isTarget && target.closest('.arithmetics-target-zone') !== null;
};

const playHint = () => {
  if (config.value) {
    playInstruction(config.value.instructionText);
  }
};
</script>

<template>
  <div class="arithmetics-module">
    <div v-if="!hasStarted" class="start-screen">
      <div class="start-icon"><MenuIcon :gameId="moduleId" style="width: 140px; height: 140px;" /></div>
      <h1>Arithmetics<br><span>Tier 2</span></h1>
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
          
          <!-- Left Operand -->
          <div class="equation-box">
            <ObjectGroupAsset 
              :count="config.leftOperand.count"
              :itemType="config.leftOperand.itemType"
              :renderAsNumber="config.leftOperand.renderAsNumber"
            />
          </div>
          
          <template v-if="config.operation !== 'count'">
            <!-- Operator -->
            <div class="math-operator">
              {{ config.operation === 'add' ? '+' : config.operation === 'subtract' ? '−' : config.operation === 'multiply' ? '×' : '÷' }}
            </div>
            
            <!-- Right Operand -->
            <div class="equation-box">
              <ObjectGroupAsset 
                :count="config.rightOperand!.count"
                :itemType="config.rightOperand!.itemType"
                :renderAsNumber="config.rightOperand!.renderAsNumber"
              />
            </div>
          </template>
          
          <div class="math-operator">=</div>
          
          <!-- Empty Drop Zone Box -->
          <div 
            class="equation-box drop-zone arithmetics-target-zone" 
            data-target-id="arithmetics-target-zone"
            :class="{ 'success-pulse': isSuccess, 'prompt-pulse': currentLevel === 'partial' && !isSuccess }"
          >
            <!-- If success, render the full target inside the box -->
            <ObjectGroupAsset 
              v-if="isSuccess"
              :count="config.targetAnswer.count"
              :itemType="config.targetAnswer.itemType"
              :renderAsNumber="config.targetAnswer.renderAsNumber"
            />
          </div>
        </div>
      </div>

      <!-- Bottom Row: The Options -->
      <div class="bottom-options">
        <div class="options-container">
          <div class="piece-wrapper" v-for="opt in options" :key="`${levelCounter}-${opt.operand.id}`">
            <PuzzlePiece 
              :id="opt.operand.id"
              :transparent="true"
              dropZoneSelector=".arithmetics-target-zone"
              :validateDrop="(t) => validateDrop(t, opt.isTarget)"
              @success="() => handleSuccess(opt.operand.id)"
              @error="handleError"
              :class="{ 'prompt-full': currentLevel === 'full' && opt.isTarget && !isSuccess }"
              style="width: 100%; height: 100%;"
            >
              <ObjectGroupAsset 
                :count="opt.operand.count"
                :itemType="opt.operand.itemType"
                :renderAsNumber="opt.operand.renderAsNumber"
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
.arithmetics-module {
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
  background: linear-gradient(135deg, #e1bee7 0%, #ce93d8 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  border-bottom: 6px solid #ba68c8;
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
  border: 4px dashed #9c27b0;
  background-color: rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;
}

.math-operator {
  font-size: 5rem;
  font-weight: 900;
  color: #8e24aa;
  text-shadow: 2px 2px 0px rgba(255,255,255,0.8);
  font-family: 'Inter', sans-serif;
}

@keyframes pulse-zone {
  0%, 100% { transform: scale(1); border-color: #9c27b0; }
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

@keyframes flash-full {
  0%, 100% { transform: scale(1); box-shadow: 0 0 0 transparent; }
  50% { transform: scale(1.15); box-shadow: 0 0 20px 10px rgba(255, 215, 0, 0.8); border-color: rgba(255, 215, 0, 0.8); }
}

.prompt-full {
  animation: flash-full 1.5s infinite;
  z-index: 50;
}
</style>
