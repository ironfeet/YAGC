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
import AnimalAsset from '../../../components/game/AnimalAsset.vue';
import PointingHand from '../../../components/prompts/PointingHand.vue';
import type { MatchingAnimalsLevelConfig, AnimalFeature, AnimalShape, AnimalSize, AnimalDirection } from '../../../types';

const moduleId = 'tier1-matching-animals';
const progressStore = useProgressStore();
const gameStore = useGameStore();
const { playInstruction, isPlaying } = useSpeech();
const { currentLevel, registerError, resetAll } = usePromptFading(progressStore.moduleStats[moduleId]?.currentPromptLevel || 'none');
const log = useLogger(moduleId);
const { safeSetTimeout } = useSafeTimeout();

const config = ref<MatchingAnimalsLevelConfig | null>(null);
const options = ref<{ animal: AnimalFeature, isTarget: boolean }[]>([]);
const levelCounter = ref(0);
const isSuccess = ref(false);
const hasStarted = ref(false);

const handleStart = () => {
  hasStarted.value = true;
  generateLevel();
};

const COLORS = ['#ffb6c1', '#ffa500', '#add8e6', '#98fb98', '#9b59b6', '#e74c3c', '#f1c40f', '#34495e']; // Added purple, red, yellow, dark gray
const SHAPES: AnimalShape[] = ['zebra', 'giraffe', 'elephant', 'lion', 'tiger', 'bear', 'monkey', 'rhino', 'hippo', 'crocodile', 'turtle', 'snake', 'frog', 'dog', 'cat', 'rabbit', 'mouse', 'fox', 'deer', 'cow', 'pig', 'sheep', 'horse', 'camel', 'kangaroo', 'penguin', 'duck', 'owl'];
const SIZES: AnimalSize[] = ['small', 'large'];
const DIRECTIONS: AnimalDirection[] = ['left', 'right'];

const getRandomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
import { shuffle } from '../../../utils/shuffle';

const generateLevel = () => {
  levelCounter.value++;
  isSuccess.value = false;
  
  const stat = progressStore.moduleStats[moduleId];
  resetAll(stat?.currentPromptLevel);
  
  const span = stat?.currentPhase || 1;
  const optionCount = Math.max(3, stat?.currentOptionCount || 3);
  
  // Phases based on span (complexity)
  // 1: Color only
  // 2: Shape only
  // 3: Color + Shape
  // 4: Size + Direction
  // 5: Color + Shape + Size
  // 6: All 4 features
  const phase = Math.min(6, span);

  const targetAnimal: AnimalFeature = {
    id: 'target',
    color: getRandomItem(COLORS),
    shape: getRandomItem(SHAPES),
    size: getRandomItem(SIZES),
    direction: getRandomItem(DIRECTIONS)
  };

  const distractorAnimals: AnimalFeature[] = [];
  
  const features: ('color' | 'shape' | 'size' | 'direction')[] = ['color', 'shape', 'size', 'direction'];
  
  for (let i = 0; i < optionCount - 1; i++) {
    let distractor = { ...targetAnimal, id: `distractor-${i}` };
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 50) {
      distractor = { ...targetAnimal, id: `distractor-${i}` };
      
      if (phase === 1) {
        // Color focus. MUST be different color.
        distractor.color = getRandomItem(COLORS.filter(c => c !== targetAnimal.color));
      } else if (phase === 2) {
        // Shape focus. MUST be different shape.
        distractor.shape = getRandomItem(SHAPES.filter(s => s !== targetAnimal.shape));
      } else if (phase === 3) {
        // Color + Shape.
        if (i % 2 === 0) {
          distractor.color = getRandomItem(COLORS.filter(c => c !== targetAnimal.color));
        } else {
          distractor.shape = getRandomItem(SHAPES.filter(s => s !== targetAnimal.shape));
        }
      } else if (phase === 4) {
        // Size + Direction.
        if (i % 2 === 0) {
          distractor.size = targetAnimal.size === 'small' ? 'large' : 'small';
        } else {
          distractor.direction = targetAnimal.direction === 'left' ? 'right' : 'left';
        }
      } else if (phase === 5) {
        // 3 features (Color, Shape, Size).
        const featuresToSwap: ('color' | 'shape' | 'size')[] = ['color', 'shape', 'size'];
        const f = featuresToSwap[i % featuresToSwap.length];
        if (f === 'color') distractor.color = getRandomItem(COLORS.filter(c => c !== targetAnimal.color));
        else if (f === 'shape') distractor.shape = getRandomItem(SHAPES.filter(s => s !== targetAnimal.shape));
        else distractor.size = targetAnimal.size === 'small' ? 'large' : 'small';
      } else {
        // All 4 features. Distractors share 3 out of 4.
        const f = features[i % features.length];
        if (f === 'color') distractor.color = getRandomItem(COLORS.filter(c => c !== targetAnimal.color));
        else if (f === 'shape') distractor.shape = getRandomItem(SHAPES.filter(s => s !== targetAnimal.shape));
        else if (f === 'size') distractor.size = targetAnimal.size === 'small' ? 'large' : 'small';
        else distractor.direction = targetAnimal.direction === 'left' ? 'right' : 'left';
      }
      
      isUnique = !distractorAnimals.some(d => 
        d.color === distractor.color && 
        d.shape === distractor.shape && 
        d.size === distractor.size && 
        d.direction === distractor.direction
      );
      attempts++;
    }
    
    distractorAnimals.push(distractor);
  }

  const allOptions = [
    { animal: targetAnimal, isTarget: true },
    ...distractorAnimals.map(a => ({ animal: a, isTarget: false }))
  ];

  options.value = shuffle(allOptions);

  config.value = {
    moduleId,
    tier: 1,
    currentPhase: span,
    optionCount: allOptions.length,
    instructionText: 'Find the animal that looks exactly like this one.',
    phase,
    targetAnimal,
    distractorAnimals,
    targetFeatures: { color: targetAnimal.color, shape: targetAnimal.shape },
    distractors: distractorAnimals.map(d => ({ id: d.id }))
  };

  log.generate({ phase, span, targetShape: targetAnimal.shape, targetColor: targetAnimal.color, optionCount: allOptions.length });
  gameStore.initializeGame(config.value);
  safeSetTimeout(() => {
    log.audio(config.value!.instructionText);
    playInstruction(config.value!.instructionText);
  }, 500);
};

onMounted(() => {
  log.lifecycle('mounted');
});

const handleSuccess = (matchedId: string) => {
  if (isSuccess.value) return;
  isSuccess.value = true;
  log.success(matchedId, { phase: config.value?.phase, targetShape: config.value?.targetAnimal.shape, targetColor: config.value?.targetAnimal.color });
  options.value = options.value.filter(o => o.animal.id !== matchedId);
  gameStore.handleSuccess();
  progressStore.updateStats(moduleId, true);
  const praises = ['Great job!', 'Perfect match!', 'You found it!'];
  playInstruction(getRandomItem(praises));
  safeSetTimeout(() => { generateLevel(); }, 2000);
};

const handleError = () => {
  if (isSuccess.value) return;
  log.error('wrong-drop', { phase: config.value?.phase, promptLevel: currentLevel.value });
  gameStore.handleError();
  progressStore.updateStats(moduleId, false);
  registerError();
  playInstruction('Look closely at the animal.');
};

const validateDrop = (target: HTMLElement, isTarget: boolean) => {
  return isTarget && target.dataset.targetId === 'animal-target-zone';
};

const playHint = () => {
  if (config.value) {
    playInstruction(config.value.instructionText);
  }
};
</script>

<template>
  <div class="matching-animals-module">
    <div v-if="!hasStarted" class="start-screen">
      <div class="start-icon"><MenuIcon :gameId="moduleId" style="width: 140px; height: 140px;" /></div>
      <h1>Matching Animals<br><span>Visual Discrimination</span></h1>
      <p class="start-sub">Match the animal that looks exactly like the target.</p>
      <button @click="handleStart" class="start-btn">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        Start
      </button>
    </div>

    <div v-else-if="config" class="game-board">
      <div v-if="isPlaying" class="listening-mini">
        <svg class="speaker-mini" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
        <span>Listening...</span>
      </div>
      <div class="action-layout">
        <header class="top-bar">
          <div class="phase-badge">Phase {{ config.phase }}</div>
          <button class="replay-btn" @click="playHint">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
            Replay
          </button>
        </header>

        <!-- Horizontal Split Screen Layout -->
        <div class="horizontal-split">
      
      <!-- Left Column: Target Area -->
      <div class="left-target">
        <div 
          class="animal-target-zone" 
          data-target-id="animal-target-zone"
          :class="{ 'prompt-pulse': currentLevel === 'partial' && !isSuccess, 'success-pulse': isSuccess }"
        >
          <!-- The fully rendered target animal -->
          <AnimalAsset 
            :color="config.targetAnimal.color"
            :shape="config.targetAnimal.shape"
            :size="config.targetAnimal.size"
            :direction="config.targetAnimal.direction"
            class="target-animal-asset"
          />
        </div>
        <div class="habitat-floor"></div>
      </div>

      <!-- Right Column: Selection Grid -->
      <div class="right-grid">
        <div class="options-container" :class="`grid-cols-${Math.ceil(options.length / 2)}`">
          <div class="piece-wrapper" v-for="opt in options" :key="`${levelCounter}-${opt.animal.id}`">
            <PuzzlePiece 
              :id="opt.animal.id"
              :transparent="true"
              dropZoneSelector=".animal-target-zone"
              :validateDrop="(t) => validateDrop(t, opt.isTarget)"
              @success="() => handleSuccess(opt.animal.id)"
              @error="handleError"
              :class="{ 'prompt-full': currentLevel === 'full' && opt.isTarget && !isSuccess }"
              style="width: 100%; height: 100%;"
            >
              <AnimalAsset 
                :color="opt.animal.color"
                :shape="opt.animal.shape"
                :size="opt.animal.size"
                :direction="opt.animal.direction"
                class="option-animal-asset"
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
.matching-animals-module {
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

.horizontal-split {
  flex: 1;
  display: flex;
  flex-direction: row;
}

/* LEFT COLUMN */
.left-target {
  flex: 5;
  background: linear-gradient(180deg, #e0f7fa 0%, #b2ebf2 70%);
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  border-right: 6px solid #4dd0e1;
}

.habitat-floor {
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 20%;
  background-color: #81c784;
  border-top: 4px solid #66bb6a;
}

.animal-target-zone {
  width: 260px;
  height: 260px;
  border: 6px dashed rgba(0, 150, 136, 0.6);
  background-color: rgba(255, 255, 255, 0.4);
  border-radius: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 5;
  margin-bottom: 10%; /* Lift it above the floor slightly */
  transition: all 0.3s ease;
}

.target-animal-asset {
  width: 85%;
  height: 85%;
  filter: drop-shadow(0 10px 15px rgba(0,0,0,0.2));
}

@keyframes pulse-zone {
  0%, 100% { box-shadow: 0 0 0 rgba(255, 215, 0, 0); background-color: rgba(255, 255, 255, 0.4); border-color: rgba(0, 150, 136, 0.6); }
  50% { box-shadow: 0 0 30px rgba(255, 215, 0, 0.8); background-color: rgba(255, 215, 0, 0.3); border-color: rgba(255, 215, 0, 1); }
}

.prompt-pulse {
  animation: pulse-zone 2s infinite;
}

@keyframes success-glow {
  0%, 100% { transform: scale(1); filter: drop-shadow(0 0 10px #4caf50); border-color: #4caf50; background-color: rgba(76, 175, 80, 0.3); }
  50% { transform: scale(1.05); filter: drop-shadow(0 0 30px #4caf50); border-color: #4caf50; background-color: rgba(76, 175, 80, 0.5); }
}

.success-pulse {
  animation: success-glow 1s ease-in-out infinite;
  border-style: solid;
}

/* RIGHT COLUMN */
.right-grid {
  flex: 5;
  background-color: #f5f5f5;
  padding: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 10px 0 20px rgba(0,0,0,0.05);
}

.options-container {
  display: grid;
  gap: 2rem;
  width: 100%;
  max-width: 800px;
  align-items: center;
  justify-items: center;
}

.grid-cols-1 { grid-template-columns: repeat(1, 1fr); }
.grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
.grid-cols-3 { grid-template-columns: repeat(3, 1fr); }

.piece-wrapper {
  position: relative;
  width: 260px;
  height: 260px;
  background: var(--bg-secondary);
  border-radius: 30px;
  border: 4px solid #e0e0e0;
  box-shadow: 0 8px 16px rgba(0,0,0,0.1);
  display: flex;
  justify-content: center;
  align-items: center;
}

.option-animal-asset {
  width: 85%;
  height: 85%;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));
}

@keyframes flash-full {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); filter: drop-shadow(0 0 15px var(--color-target)); }
}

.prompt-full {
  animation: flash-full 1.5s infinite;
  z-index: 50;
  border-color: var(--color-target);
  background-color: rgba(255, 215, 0, 0.1);
}
</style>