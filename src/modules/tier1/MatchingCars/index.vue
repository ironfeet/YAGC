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
import CarAsset from '../../../components/game/CarAsset.vue';
import PointingHand from '../../../components/prompts/PointingHand.vue';
import type { MatchingCarsLevelConfig, CarFeature, CarShape, CarPassenger, CarRoofItem } from '../../../types';

const moduleId = 'tier1-matching-cars';
const progressStore = useProgressStore();
const gameStore = useGameStore();
const { playInstruction, isPlaying } = useSpeech();
const { currentLevel, registerError, resetAll } = usePromptFading(progressStore.moduleStats[moduleId].currentPromptLevel);
const log = useLogger(moduleId);
const { safeSetTimeout } = useSafeTimeout();

const config = ref<MatchingCarsLevelConfig | null>(null);
const options = ref<{ car: CarFeature, isTarget: boolean }[]>([]);
const levelCounter = ref(0);
const isSuccess = ref(false);
const hasStarted = ref(false);

const handleStart = () => {
  hasStarted.value = true;
  generateLevel();
};

const COLORS = ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6', '#e67e22', '#1abc9c', '#34495e'];
const SHAPES: CarShape[] = ['sedan', 'truck', 'beetle', 'van', 'sports', 'bus'];
const PASSENGERS: CarPassenger[] = ['none', 'boy', 'girl', 'dog', 'cat'];
const ROOF_ITEMS: CarRoofItem[] = ['none', 'luggage', 'surfboard', 'bicycle', 'skis'];

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
  // 4: Passenger + Roof Item
  // 5: Color + Shape + Passenger
  // 6: All 4 features
  const phase = Math.min(6, span);

  // Generate target car
  const targetCar: CarFeature = {
    id: 'target',
    color: getRandomItem(COLORS),
    shape: getRandomItem(SHAPES),
    passenger: phase >= 4 ? getRandomItem(PASSENGERS.filter(p => p !== 'none')) : getRandomItem(PASSENGERS),
    roofItem: phase >= 4 ? getRandomItem(ROOF_ITEMS.filter(r => r !== 'none')) : getRandomItem(ROOF_ITEMS)
  };

  const distractorCars: CarFeature[] = [];
  
  const features: ('color' | 'shape' | 'passenger' | 'roofItem')[] = ['color', 'shape', 'passenger', 'roofItem'];
  
  for (let i = 0; i < optionCount - 1; i++) {
    let distractor = { ...targetCar, id: `distractor-${i}` };
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 50) {
      distractor = { ...targetCar, id: `distractor-${i}` };
      
      if (phase === 1) {
        // Color focus. Others can be same or different, but color MUST be different.
        distractor.color = getRandomItem(COLORS.filter(c => c !== targetCar.color));
      } else if (phase === 2) {
        // Shape focus.
        distractor.shape = getRandomItem(SHAPES.filter(s => s !== targetCar.shape));
      } else if (phase === 3) {
        // Color + Shape. Distractors have one or the other wrong.
        if (i % 2 === 0) {
          distractor.color = getRandomItem(COLORS.filter(c => c !== targetCar.color));
        } else {
          distractor.shape = getRandomItem(SHAPES.filter(s => s !== targetCar.shape));
        }
      } else if (phase === 4) {
        // Passenger + Roof Item.
        if (i % 2 === 0) {
          distractor.passenger = getRandomItem(PASSENGERS.filter(p => p !== targetCar.passenger));
        } else {
          distractor.roofItem = getRandomItem(ROOF_ITEMS.filter(r => r !== targetCar.roofItem));
        }
      } else if (phase === 5) {
        // 3 features.
        const featuresToSwap: ('color' | 'shape' | 'passenger')[] = ['color', 'shape', 'passenger'];
        const f = featuresToSwap[i % featuresToSwap.length];
        if (f === 'color') distractor.color = getRandomItem(COLORS.filter(c => c !== targetCar.color));
        else if (f === 'shape') distractor.shape = getRandomItem(SHAPES.filter(s => s !== targetCar.shape));
        else distractor.passenger = getRandomItem(PASSENGERS.filter(p => p !== targetCar.passenger));
      } else {
        // All 4 features. Distractors share 3 out of 4.
        const f = features[i % features.length];
        if (f === 'color') distractor.color = getRandomItem(COLORS.filter(c => c !== targetCar.color));
        else if (f === 'shape') distractor.shape = getRandomItem(SHAPES.filter(s => s !== targetCar.shape));
        else if (f === 'passenger') distractor.passenger = getRandomItem(PASSENGERS.filter(p => p !== targetCar.passenger));
        else distractor.roofItem = getRandomItem(ROOF_ITEMS.filter(r => r !== targetCar.roofItem));
      }
      
      isUnique = !distractorCars.some(d => 
        d.color === distractor.color && 
        d.shape === distractor.shape && 
        d.passenger === distractor.passenger && 
        d.roofItem === distractor.roofItem
      );
      attempts++;
    }
    
    distractorCars.push(distractor);
  }

  const allOptions = [
    { car: targetCar, isTarget: true },
    ...distractorCars.map(c => ({ car: c, isTarget: false }))
  ];

  options.value = shuffle(allOptions);

  config.value = {
    moduleId,
    tier: 1,
    currentPhase: span,
    optionCount: allOptions.length,
    instructionText: 'Match the car at the stoplight.',
    phase,
    targetCar,
    distractorCars,
    targetFeatures: { color: targetCar.color, shape: targetCar.shape },
    distractors: distractorCars.map(d => ({ id: d.id }))
  };

  log.generate({ phase, span, targetColor: targetCar.color, targetShape: targetCar.shape, optionCount: allOptions.length });
  gameStore.initializeGame(config.value);
  safeSetTimeout(() => {
    log.audio(config.value!.instructionText);
    playInstruction(config.value!.instructionText);
  }, 500);
};

onMounted(() => {
  log.lifecycle('mounted');
  // In Random Mode, bypass the start screen and begin immediately
  if (gameStore.isRandomMode) handleStart();
});

const handleSuccess = (matchedId: string) => {
  if (isSuccess.value) return;
  isSuccess.value = true;
  log.success(matchedId, { phase: config.value?.phase, targetColor: config.value?.targetCar.color, targetShape: config.value?.targetCar.shape });
  
  // Remove the dragged piece from the garage immediately
  options.value = options.value.filter(o => o.car.id !== matchedId);
  
  gameStore.handleSuccess();
  progressStore.updateStats(moduleId, true);
  
  
  playInstruction(getRandomPraise());
  
  // Wait for the drive-off animation to finish before generating the next level
  safeSetTimeout(() => {
    if (gameStore.isRandomMode) { if (!gameStore.advanceRandomRound()) generateLevel(); } else { generateLevel(); }
  }, 2500);
};

const handleError = () => {
  if (isSuccess.value) return;
  log.error('wrong-drop', { phase: config.value?.phase, promptLevel: currentLevel.value });
  gameStore.handleError();
  progressStore.updateStats(moduleId, false);
  registerError();
  playInstruction('Look closely at the car at the light.');
};

const validateDrop = (target: HTMLElement, isTarget: boolean) => {
  // If they drop on the target zone, check if it's the right car
  return isTarget && target.dataset.targetId === 'target-zone';
};

const playHint = () => {
  if (config.value) {
    playInstruction(config.value.instructionText);
  }
};
</script>

<template>
  <div class="matching-cars-module">
    <div v-if="!hasStarted" class="start-screen">
      <div class="start-icon"><MenuIcon :gameId="moduleId" style="width: 140px; height: 140px;" /></div>
      <h1>Matching Cars<br><span>Visual Discrimination</span></h1>
      <p class="start-sub">Match the car at the stoplight with the ones in the garage.</p>
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

        <!-- Vertical Split Screen Layout -->
        <div class="vertical-split">
      
      <!-- Top Half: The Scene (Road & Traffic Light) -->
      <div class="top-scene">
        <!-- SVG Background -->
        <svg class="scene-bg" viewBox="0 0 1000 300" preserveAspectRatio="xMidYMax slice">
          <!-- Sky -->
          <rect width="1000" height="200" fill="#a0e6ff" />
          
          <!-- Clouds -->
          <g fill="white" opacity="0.8">
            <circle cx="100" cy="50" r="20" />
            <circle cx="120" cy="50" r="25" />
            <circle cx="140" cy="50" r="20" />
            
            <circle cx="400" cy="80" r="30" />
            <circle cx="440" cy="80" r="35" />
            <circle cx="480" cy="80" r="30" />

            <circle cx="800" cy="40" r="25" />
            <circle cx="830" cy="40" r="30" />
            <circle cx="860" cy="40" r="25" />
          </g>

          <!-- Mountains / Scenery -->
          <path d="M 0,200 Q 150,100 300,200 T 700,200 T 1000,200 L 1000,300 L 0,300 Z" fill="#7cb342" />
          
          <!-- Trees -->
          <g v-for="n in 5" :key="n" :transform="`translate(${n * 180 - 50}, 160) scale(0.8)`">
            <rect x="15" y="40" width="10" height="20" fill="#5D4037" />
            <circle cx="20" cy="30" r="25" fill="#388E3C" />
          </g>

          <!-- Road -->
          <rect y="200" width="1000" height="100" fill="#555" />
          <!-- Road lines -->
          <line x1="0" y1="250" x2="1000" y2="250" stroke="#fff" stroke-width="6" stroke-dasharray="40,40" />
        </svg>

        <!-- Traffic Light -->
        <div class="traffic-light-container">
          <svg viewBox="0 0 100 240" class="traffic-light">
            <rect x="20" y="20" width="60" height="200" rx="10" fill="#222" stroke="#444" stroke-width="4" />
            <!-- Red Light -->
            <circle cx="50" cy="60" r="22" :fill="isSuccess ? '#4a0000' : '#ff3b30'" :style="{ filter: isSuccess ? 'none' : 'drop-shadow(0 0 10px #ff3b30)' }" />
            <!-- Yellow Light -->
            <circle cx="50" cy="120" r="22" fill="#5a5a00" />
            <!-- Green Light -->
            <circle cx="50" cy="180" r="22" :fill="isSuccess ? '#34c759' : '#004a00'" :style="{ filter: isSuccess ? 'drop-shadow(0 0 15px #34c759)' : 'none' }" />
          </svg>
          <div class="pole"></div>
        </div>

        <!-- Target Car Drop Zone -->
        <div 
          class="target-zone" 
          data-target-id="target-zone"
          :class="{ 'prompt-pulse': currentLevel === 'partial' && !isSuccess }"
        >
          <!-- Stop line -->
          <div class="stop-line"></div>
          <!-- The Target Car -->
          <div class="target-car-wrapper" :class="{ 'drive-off': isSuccess }">
            <CarAsset 
              :color="config.targetCar.color"
              :shape="config.targetCar.shape"
              :passenger="config.targetCar.passenger"
              :roofItem="config.targetCar.roofItem"
              class="target-car-asset"
            />
          </div>
        </div>
      </div>

      <!-- Bottom Half: The Garage (Options) -->
      <div class="bottom-garage">
        <div class="garage-background">
          <div class="garage-door" v-for="n in 4" :key="n"></div>
        </div>
        <div class="options-grid">
          <div class="piece-wrapper" v-for="opt in options" :key="`${levelCounter}-${opt.car.id}`">
            <PuzzlePiece 
              :id="opt.car.id"
              :transparent="true"
              dropZoneSelector=".target-zone"
              :validateDrop="(t) => validateDrop(t, opt.isTarget)"
              @success="() => handleSuccess(opt.car.id)"
              @error="handleError"
              :class="{ 'prompt-full': currentLevel === 'full' && opt.isTarget && !isSuccess }"
              style="width: 100%; height: 100%;"
            >
              <CarAsset 
                :color="opt.car.color"
                :shape="opt.car.shape"
                :passenger="opt.car.passenger"
                :roofItem="opt.car.roofItem"
                class="option-car-asset"
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
.matching-cars-module {
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

.vertical-split {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* TOP SCENE */
.top-scene {
  flex: 5;
  position: relative;
  background-color: #a0e6ff;
  border-bottom: 6px solid #333;
  overflow: hidden;
}

.scene-bg {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.traffic-light-container {
  position: absolute;
  right: 15%;
  bottom: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 2;
}

.traffic-light {
  width: 80px;
  height: auto;
  filter: drop-shadow(0 5px 10px rgba(0,0,0,0.3));
}

.pole {
  width: 12px;
  height: 150px;
  background: linear-gradient(90deg, #666, #999, #666);
  border: 2px solid #333;
  border-top: none;
  border-bottom: none;
}

.target-zone {
  position: absolute;
  left: 15%;
  bottom: 30px; /* Aligned with the road */
  width: 320px;
  height: 180px;
  z-index: 5;
  border-radius: 20px;
  border: 4px dashed rgba(255, 255, 255, 0.4);
  background-color: rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s, box-shadow 0.3s;
}

.stop-line {
  position: absolute;
  right: -20px;
  top: 10%;
  bottom: 10%;
  width: 12px;
  background-color: var(--bg-secondary);
  border-radius: 4px;
  box-shadow: 0 0 10px rgba(255,255,255,0.5);
}

/* The pulse indicates the drop area */
@keyframes zone-pulse {
  0%, 100% { box-shadow: 0 0 0 rgba(255, 215, 0, 0); background-color: rgba(0, 0, 0, 0.05); }
  50% { box-shadow: 0 0 30px rgba(255, 215, 0, 0.8); background-color: rgba(255, 215, 0, 0.2); }
}

.prompt-pulse {
  animation: zone-pulse 2s infinite;
  border-color: rgba(255, 215, 0, 0.8);
}

.target-car-wrapper {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 10px 15px rgba(0,0,0,0.4));
}

.target-car-asset {
  width: 100%;
  height: 100%;
}

@keyframes driveOffRight {
  0% { transform: translateX(0) scale(1); }
  20% { transform: translateX(-20px) scale(1); } /* Anticipation pull-back */
  100% { transform: translateX(150vw) scale(1.1); }
}

.drive-off {
  animation: driveOffRight 1.5s cubic-bezier(0.5, -0.2, 1, 1) forwards;
}

/* BOTTOM GARAGE */
.bottom-garage {
  flex: 5;
  background-color: #546e7a;
  padding: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 10px 20px rgba(0,0,0,0.3);
  position: relative;
  overflow: hidden;
}

.garage-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-around;
  padding: 0 5%;
  opacity: 0.3;
  pointer-events: none;
}

.garage-door {
  width: 22%;
  height: 100%;
  background: repeating-linear-gradient(
    0deg,
    #37474f,
    #37474f 20px,
    #263238 20px,
    #263238 40px
  );
  border-left: 8px solid #263238;
  border-right: 8px solid #263238;
}

.options-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 3rem;
  width: 100%;
  max-width: 1200px;
  z-index: 2;
}

.piece-wrapper {
  position: relative;
  width: 250px;
  height: 150px;
  filter: drop-shadow(0 10px 20px rgba(0,0,0,0.4));
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  border: 2px solid #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s, box-shadow 0.2s;
}

.piece-wrapper:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0,0,0,0.5);
}

.option-car-asset {
  width: 90%;
  height: 90%;
}

@keyframes flash-full {
  0%, 100% { transform: scale(1); filter: brightness(1); }
  50% { transform: scale(1.1); filter: brightness(1.2) drop-shadow(0 0 20px var(--color-target)); }
}

.prompt-full {
  animation: flash-full 1.5s infinite;
  z-index: 50;
  border: 4px solid var(--color-target) !important;
  background-color: rgba(255, 215, 0, 0.3) !important;
}
</style>