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
import NumberCard from '../../../components/game/NumberCard.vue';
import PointingHand from '../../../components/prompts/PointingHand.vue';
import AnimalAsset from '../../../components/game/AnimalAsset.vue';
import CarAsset from '../../../components/game/CarAsset.vue';
import BugAsset from '../../../components/game/BugAsset.vue';
import TrainAsset from '../../../components/game/TrainAsset.vue';
import type { CountEverythingLevelConfig, AnimalShape, BugShape, TrainShape, CountItemData, CountItemType } from '../../../types';

const moduleId = 'tier2-count-everything';
const progressStore = useProgressStore();
const gameStore = useGameStore();
const { playInstruction, isPlaying } = useSpeech();
const { currentLevel, registerError, resetAll } = usePromptFading(progressStore.moduleStats[moduleId]?.currentPromptLevel || 'none');
const log = useLogger(moduleId);
const { safeSetTimeout } = useSafeTimeout();

const config = ref<CountEverythingLevelConfig | null>(null);
const options = ref<{ number: number, isTarget: boolean, id: string }[]>([]);
const levelCounter = ref(0);
const isSuccess = ref(false);
const hasStarted = ref(false);

const tappedItems = ref<Set<number>>(new Set());

const ANIMAL_TYPES: AnimalShape[] = ['zebra', 'giraffe', 'elephant', 'lion', 'tiger', 'bear', 'monkey', 'rhino', 'hippo', 'crocodile', 'turtle', 'snake', 'frog', 'dog', 'cat', 'rabbit', 'mouse', 'fox', 'deer', 'cow', 'pig', 'sheep', 'horse', 'camel', 'kangaroo', 'penguin', 'duck', 'owl'];
const BUG_SHAPES: BugShape[] = ['beetle', 'butterfly', 'caterpillar', 'ladybug', 'bee'];
const TRAIN_SHAPES: TrainShape[] = ['steam', 'bullet', 'boxcar', 'diesel'];
const COLORS = ['#f44336', '#2196f3', '#4caf50', '#ffeb3b', '#9c27b0', '#ff9800', '#00bcd4'];

const getRandomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
import { shuffle } from '../../../utils/shuffle';
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const generateScatterCoordinates = (count: number, containerWidth: number, containerHeight: number, objectSize: number) => {
  const coords: { x: number, y: number }[] = [];
  const maxAttempts = 1000;
  
  for (let i = 0; i < count; i++) {
    let attempts = 0;
    let placed = false;
    
    while (!placed && attempts < maxAttempts) {
      // Keep away from the edges and the top right drop box
      const x = Math.random() * (containerWidth - objectSize);
      const y = Math.random() * (containerHeight - objectSize);
      
      // Top right reserved area (width 20, height 25 approx)
      if (x > (containerWidth - 25) && y < 30) {
        attempts++;
        continue;
      }
      
      const overlap = coords.some(c => {
        const dx = c.x - x;
        const dy = c.y - y;
        return Math.sqrt(dx * dx + dy * dy) < (objectSize * 1.2); 
      });
      
      if (!overlap) {
        coords.push({ x, y });
        placed = true;
      }
      attempts++;
    }
  }
  return coords;
};

const generateLevel = () => {
  levelCounter.value++;
  isSuccess.value = false;
  tappedItems.value.clear();
  resetAll();
  
  const stat = progressStore.moduleStats[moduleId];
  const span = stat?.currentPhase || 1; 
  const optionCount = Math.max(3, stat?.currentOptionCount || 4);
  
  const phase = Math.min(4, span) as 1 | 2 | 3 | 4;

  let targetCount: number;
  let allowedTypes: CountItemType[];
  let objectSize: number;
  
  if (phase === 1) {
    targetCount = randomInt(1, 5);
    allowedTypes = ['ball'];
    objectSize = 18;
  } else if (phase === 2) {
    targetCount = randomInt(4, 10);
    allowedTypes = ['animal'];
    objectSize = 15;
  } else if (phase === 3) {
    targetCount = randomInt(8, 15);
    allowedTypes = ['car', 'train'];
    objectSize = 12;
  } else {
    targetCount = randomInt(10, 20);
    allowedTypes = ['ball', 'animal', 'car', 'bug', 'train'];
    objectSize = 10;
  }

  const scatterCoords = generateScatterCoordinates(targetCount, 100, 100, objectSize);

  const items: CountItemData[] = scatterCoords.map(coord => {
    const type = getRandomItem(allowedTypes);
    return {
      x: coord.x,
      y: coord.y,
      type,
      animalShape: type === 'animal' ? getRandomItem(ANIMAL_TYPES) : undefined,
      carColor: type === 'car' ? getRandomItem(COLORS) : undefined,
      bugShape: type === 'bug' ? getRandomItem(BUG_SHAPES) : undefined,
      trainShape: type === 'train' ? getRandomItem(TRAIN_SHAPES) : undefined,
      color: getRandomItem(COLORS)
    };
  });

  const distractors: number[] = [];
  const usedCounts = new Set<number>([targetCount]);
  let attempts = 0;
  
  while (distractors.length < optionCount - 1 && attempts < 100) {
    let offset = randomInt(-5, 5);
    if (offset === 0) offset = 6;
    let distractorCount = targetCount + offset;
    if (distractorCount < 1) distractorCount = Math.abs(targetCount - offset) + 1 || 2;
    
    if (!usedCounts.has(distractorCount)) {
      usedCounts.add(distractorCount);
      distractors.push(distractorCount);
    }
    attempts++;
  }
  
  let fallback = targetCount + 1;
  while (distractors.length < optionCount - 1) {
    if (!usedCounts.has(fallback)) {
      usedCounts.add(fallback);
      distractors.push(fallback);
    }
    fallback++;
  }

  const allOptions = [
    { number: targetCount, isTarget: true, id: `ans-${targetCount}` },
    ...distractors.map(d => ({ number: d, isTarget: false, id: `dist-${d}` }))
  ];

  options.value = shuffle(allOptions);

  config.value = {
    moduleId,
    tier: 2,
    currentPhase: span,
    optionCount: allOptions.length,
    instructionText: 'Count the items!',
    phase,
    targetCount,
    targetFeatures: {},
    items,
    distractorCounts: distractors,
    distractors: distractors.map(d => ({ id: `dist-${d}` }))
  };

  log.generate({ phase, span, targetCount, optionCount: allOptions.length });
  gameStore.initializeGame(config.value!);
  safeSetTimeout(() => {
    log.audio(config.value!.instructionText);
    playInstruction(config.value!.instructionText);
  }, 500);
};

onMounted(() => {
  log.lifecycle('mounted');
  // In Random Mode, bypass the start screen and begin immediately
  if (gameStore.isRandomMode) hasStarted.value = true;
  generateLevel();
});

const toggleTap = (index: number) => {
  if (tappedItems.value.has(index)) {
    tappedItems.value.delete(index);
  } else {
    tappedItems.value.add(index);
    playInstruction('Pop!'); // Optional fun feedback
  }
};

const handleSuccess = (id: string) => {
  if (isSuccess.value) return;
  isSuccess.value = true;
  log.success(id, { phase: config.value?.phase, targetCount: config.value?.targetCount });
  
  options.value = options.value.filter(o => o.id !== id);
  gameStore.handleSuccess();
  progressStore.updateStats(moduleId, true);
  
  playInstruction(getRandomPraise());
  safeSetTimeout(() => { 
      if (gameStore.isRandomMode) { if (!gameStore.advanceRandomRound()) generateLevel(); }
      else generateLevel(); 
    }, 3500);
};

const handleError = () => {
  if (isSuccess.value) return;
  log.error('wrong-drop', { phase: config.value?.phase, targetCount: config.value?.targetCount, promptLevel: currentLevel.value });
  gameStore.handleError();
  progressStore.updateStats(moduleId, false);
  registerError();
  playInstruction('Try again! Use your finger to tap and count each one.');
};

const validateDrop = (target: HTMLElement, isTarget: boolean) => {
  return isTarget && target.closest('.counteverything-target-zone') !== null;
};

const playHint = () => {
  if (config.value) {
    playInstruction(config.value.instructionText);
  }
};
</script>

<template>
  <div class="count-everything-module">
    <div v-if="!hasStarted" class="start-screen">
      <div class="start-icon"><MenuIcon :gameId="moduleId" style="width: 140px; height: 140px;" /></div>
      <h1>Count Everything<br><span>Tier 2</span></h1>
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
      
      <!-- Top Row: The Field -->
      <div class="top-field">
        
        <!-- Target Drop Box positioned top right -->
        <div 
          class="drop-box-container counteverything-target-zone" 
          data-target-id="counteverything-target-zone"
          :class="{ 'success-pulse': isSuccess, 'prompt-pulse': currentLevel === 'partial' && !isSuccess }"
        >
          <NumberCard v-if="isSuccess" :number="config.targetCount" class="success-card" />
        </div>

        <!-- The scattered field -->
        <div class="scatter-container" :class="{ 'celebrate': isSuccess }">
          <div 
            v-for="(item, idx) in config.items" 
            :key="idx"
            class="scatter-item"
            :style="{ 
              left: `${item.x}%`, 
              top: `${item.y}%`,
              width: config.phase === 4 ? '10%' : config.phase === 3 ? '12%' : config.phase === 2 ? '15%' : '18%',
              height: config.phase === 4 ? '10%' : config.phase === 3 ? '12%' : config.phase === 2 ? '15%' : '18%'
            }"
            :class="{ 'tapped': tappedItems.has(idx) }"
            @click="toggleTap(idx)"
          >
            <!-- Item Rendering -->
            <svg v-if="item.type === 'ball'" viewBox="0 0 100 100" class="base-item">
              <circle cx="50" cy="50" r="40" :fill="item.color" stroke="#333" stroke-width="4" />
              <circle cx="35" cy="35" r="10" fill="white" opacity="0.5" />
            </svg>
            
            <AnimalAsset 
              v-else-if="item.type === 'animal'"
              :shape="item.animalShape!"
              :color="item.color"
              size="large"
              :direction="idx % 2 === 0 ? 'left' : 'right'"
              class="base-item"
            />
            
            <CarAsset 
              v-else-if="item.type === 'car'"
              shape="sedan"
              passenger="none"
              roofItem="none"
              :color="item.carColor || item.color"
              class="base-item"
            />

            <BugAsset 
              v-else-if="item.type === 'bug'"
              :shape="item.bugShape!"
              :color="item.color"
              pattern="none"
              :rotation="0"
              class="base-item"
            />

            <TrainAsset 
              v-else-if="item.type === 'train'"
              renderMode="full"
              :trainShape="item.trainShape!"
              :trainColor="item.color"
              :isFacingLeft="idx % 2 === 0"
              windowColor="#ffeb3b"
              windowPattern="square-2"
              class="base-item"
            />
            
            <!-- Checkmark Overlay for tapped items -->
            <div v-if="tappedItems.has(idx)" class="checkmark-overlay">
              <svg viewBox="0 0 24 24" fill="none" stroke="#4caf50" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>

          </div>
        </div>

      </div>

      <!-- Bottom Row: The Options -->
      <div class="bottom-options">
        <div class="options-container">
          <div class="piece-wrapper" v-for="opt in options" :key="`${levelCounter}-${opt.id}`">
            <PuzzlePiece 
              :id="opt.id"
              :transparent="true"
              dropZoneSelector=".counteverything-target-zone"
              :validateDrop="(t) => validateDrop(t, opt.isTarget)"
              @success="() => handleSuccess(opt.id)"
              @error="handleError"
              :class="{ 'prompt-full': currentLevel === 'full' && opt.isTarget && !isSuccess }"
              style="width: 100%; height: 100%;"
            >
              <NumberCard :number="opt.number" />
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
.count-everything-module {
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

/* TOP ROW: FIELD */
.top-field {
  flex: 5;
  background: linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%);
  border-bottom: 6px solid #80deea;
  position: relative;
  z-index: 1;
  overflow: hidden;
}

.scatter-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.scatter-item {
  position: absolute;
  cursor: pointer;
  transition: transform 0.2s ease, opacity 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.scatter-item:active {
  transform: scale(0.9);
}

.scatter-item.tapped {
  opacity: 0.6;
  filter: grayscale(0.5);
}

.base-item {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 4px 6px rgba(0,0,0,0.2));
}

.checkmark-overlay {
  position: absolute;
  top: -10%;
  right: -10%;
  width: 50%;
  height: 50%;
  background: white;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px;
  animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes popIn {
  0% { transform: scale(0); }
  100% { transform: scale(1); }
}

.drop-box-container {
  position: absolute;
  top: 2rem;
  right: 2rem;
  width: 180px;
  height: 180px;
  background-color: rgba(255, 255, 255, 0.8);
  border: 4px dashed #00bcd4;
  border-radius: 20px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  z-index: 5;
  transition: all 0.3s ease;
}

@keyframes pulse-zone {
  0%, 100% { transform: scale(1); border-color: #00bcd4; }
  50% { transform: scale(1.05); border-color: #00acc1; background-color: rgba(255,255,255,0.95); }
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

@keyframes celebrateJump {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-30px) rotate(10deg); }
}

.scatter-container.celebrate .scatter-item {
  animation: celebrateJump 0.5s ease-in-out infinite alternate;
  opacity: 1 !important;
  filter: none !important;
}
.scatter-container.celebrate .checkmark-overlay {
  display: none;
}


/* BOTTOM ROW: OPTIONS */
.bottom-options {
  flex: 5;
  background-color: #fafafa;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
  z-index: 2;
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
  border-radius: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: transform 0.2s;
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
