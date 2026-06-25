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

import AnimalAsset from '../../../components/game/AnimalAsset.vue';
import PuzzlePiece from '../../../components/game/PuzzlePiece.vue';
import TransportCompositeAsset from '../../../components/game/TransportCompositeAsset.vue';
import PointingHand from '../../../components/prompts/PointingHand.vue';
import type { CarriesOrRidesLevelConfig, AnimalFeature, AnimalShape, AnimalSize, TransportVerb } from '../../../types';

const moduleId = 'tier3-carriesorrides';
const progressStore = useProgressStore();
const gameStore = useGameStore();
const { playInstruction, isPlaying } = useSpeech();
const { currentLevel, registerError, resetAll } = usePromptFading(progressStore.moduleStats[moduleId]?.currentPromptLevel || 'none');
const log = useLogger(moduleId);
const { safeSetTimeout } = useSafeTimeout();

const config = ref<CarriesOrRidesLevelConfig | null>(null);
const levelCounter = ref(0);
const isSuccess = ref(false);
const hasStarted = ref(false);

const handleStart = () => {
  hasStarted.value = true;
  generateLevel();
};

const ANIMALS: AnimalShape[] = ['elephant', 'lion', 'tiger', 'bear', 'monkey', 'dog', 'cat', 'rabbit', 'cow', 'horse', 'giraffe', 'hippo', 'zebra'];
const COLORS = ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6', '#e67e22'];
const COLOR_NAMES: Record<string, string> = {
  '#e74c3c': 'red',
  '#3498db': 'blue',
  '#2ecc71': 'green',
  '#f1c40f': 'yellow',
  '#9b59b6': 'purple',
  '#e67e22': 'orange'
};

const getRandomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
import { shuffle } from '../../../utils/shuffle';

const generateLevel = () => {
  levelCounter.value++;
  isSuccess.value = false;
  resetAll();
  
  const stat = progressStore.moduleStats[moduleId];
  const span = stat?.currentPhase || 1;
  const phase: 1 | 2 | 3 | 4 | 5 = Math.min(5, span) as any;

  let carrierAnimal: AnimalShape;
  let riderAnimal: AnimalShape;
  let carrierSize: AnimalSize = 'large';
  let riderSize: AnimalSize = 'small';
  let carrierColor: string;
  let riderColor: string;
  let verb: TransportVerb;
  let sentence = '';

  const poolAnimals: AnimalFeature[] = [];

  if (phase === 1) {
    // Phase 1: Completely different animals, "carries"
    verb = 'carries';
    carrierAnimal = getRandomItem(ANIMALS);
    riderAnimal = getRandomItem(ANIMALS.filter(a => a !== carrierAnimal));
    carrierColor = getRandomItem(COLORS);
    riderColor = getRandomItem(COLORS.filter(c => c !== carrierColor));
    
    sentence = `The ${carrierAnimal} carries the ${riderAnimal}.`;

    poolAnimals.push({ id: 'carrier', shape: carrierAnimal, color: carrierColor, size: carrierSize, direction: 'right' });
    poolAnimals.push({ id: 'rider', shape: riderAnimal, color: riderColor, size: riderSize, direction: 'right' });
    
    // Add 1 distractor
    const distractorShape = getRandomItem(ANIMALS.filter(a => a !== carrierAnimal && a !== riderAnimal));
    poolAnimals.push({ id: 'distractor-1', shape: distractorShape, color: getRandomItem(COLORS), size: 'small', direction: 'right' });
    
  } else if (phase === 2) {
    // Phase 2: Completely different animals, "rides"
    verb = 'rides';
    carrierAnimal = getRandomItem(ANIMALS);
    riderAnimal = getRandomItem(ANIMALS.filter(a => a !== carrierAnimal));
    carrierColor = getRandomItem(COLORS);
    riderColor = getRandomItem(COLORS.filter(c => c !== carrierColor));
    
    sentence = `The ${riderAnimal} rides the ${carrierAnimal}.`;

    poolAnimals.push({ id: 'carrier', shape: carrierAnimal, color: carrierColor, size: carrierSize, direction: 'right' });
    poolAnimals.push({ id: 'rider', shape: riderAnimal, color: riderColor, size: riderSize, direction: 'right' });
    
    const distractorShape = getRandomItem(ANIMALS.filter(a => a !== carrierAnimal && a !== riderAnimal));
    poolAnimals.push({ id: 'distractor-1', shape: distractorShape, color: getRandomItem(COLORS), size: 'large', direction: 'right' });

  } else if (phase === 3) {
    // Phase 3: Highly similar animals, reversible roles
    verb = Math.random() > 0.5 ? 'carries' : 'rides';
    const animalShape = getRandomItem(ANIMALS);
    carrierAnimal = animalShape;
    riderAnimal = animalShape;
    carrierColor = getRandomItem(COLORS);
    riderColor = carrierColor; // Same color to force size discrimination
    
    // Distinguish by size
    carrierSize = Math.random() > 0.5 ? 'large' : 'small';
    riderSize = carrierSize === 'large' ? 'small' : 'large';

    if (verb === 'carries') {
      sentence = `The ${carrierSize} ${carrierAnimal} carries the ${riderSize} ${riderAnimal}.`;
    } else {
      sentence = `The ${riderSize} ${riderAnimal} rides the ${carrierSize} ${carrierAnimal}.`;
    }

    poolAnimals.push({ id: 'carrier', shape: carrierAnimal, color: carrierColor, size: carrierSize, direction: 'right' });
    poolAnimals.push({ id: 'rider', shape: riderAnimal, color: riderColor, size: riderSize, direction: 'right' });
    
    // 1 distractor of same shape but different color
    poolAnimals.push({ id: 'distractor-1', shape: animalShape, color: getRandomItem(COLORS.filter(c => c !== carrierColor)), size: 'large', direction: 'right' });
  } else if (phase === 4) {
    // Phase 4: Double Modifiers (Color + Animal)
    verb = Math.random() > 0.5 ? 'carries' : 'rides';
    carrierAnimal = getRandomItem(ANIMALS);
    riderAnimal = getRandomItem(ANIMALS.filter(a => a !== carrierAnimal));
    carrierColor = getRandomItem(COLORS);
    riderColor = getRandomItem(COLORS.filter(c => c !== carrierColor));
    
    if (verb === 'carries') {
      sentence = `The ${COLOR_NAMES[carrierColor]} ${carrierAnimal} carries the ${COLOR_NAMES[riderColor]} ${riderAnimal}.`;
    } else {
      sentence = `The ${COLOR_NAMES[riderColor]} ${riderAnimal} rides the ${COLOR_NAMES[carrierColor]} ${carrierAnimal}.`;
    }

    poolAnimals.push({ id: 'carrier', shape: carrierAnimal, color: carrierColor, size: carrierSize, direction: 'right' });
    poolAnimals.push({ id: 'rider', shape: riderAnimal, color: riderColor, size: riderSize, direction: 'right' });
    
    // Distractor 1: Wrong color carrier
    poolAnimals.push({ id: 'distractor-1', shape: carrierAnimal, color: getRandomItem(COLORS.filter(c => c !== carrierColor)), size: carrierSize, direction: 'right' });
    // Distractor 2: Wrong color rider
    poolAnimals.push({ id: 'distractor-2', shape: riderAnimal, color: getRandomItem(COLORS.filter(c => c !== riderColor)), size: riderSize, direction: 'right' });
  } else {
    // Phase 5: Double Modifiers with Subtlety (Role reversal distractors)
    verb = Math.random() > 0.5 ? 'carries' : 'rides';
    carrierAnimal = getRandomItem(ANIMALS);
    riderAnimal = getRandomItem(ANIMALS.filter(a => a !== carrierAnimal));
    carrierColor = getRandomItem(COLORS);
    riderColor = getRandomItem(COLORS.filter(c => c !== carrierColor));
    
    if (verb === 'carries') {
      sentence = `The ${COLOR_NAMES[carrierColor]} ${carrierAnimal} carries the ${COLOR_NAMES[riderColor]} ${riderAnimal}.`;
    } else {
      sentence = `The ${COLOR_NAMES[riderColor]} ${riderAnimal} rides the ${COLOR_NAMES[carrierColor]} ${carrierAnimal}.`;
    }

    poolAnimals.push({ id: 'carrier', shape: carrierAnimal, color: carrierColor, size: carrierSize, direction: 'right' });
    poolAnimals.push({ id: 'rider', shape: riderAnimal, color: riderColor, size: riderSize, direction: 'right' });
    
    // Distractor 1: Role reversal (Rider shape + Carrier color)
    poolAnimals.push({ id: 'distractor-1', shape: riderAnimal, color: carrierColor, size: carrierSize, direction: 'right' });
    // Distractor 2: Role reversal (Carrier shape + Rider color)
    poolAnimals.push({ id: 'distractor-2', shape: carrierAnimal, color: riderColor, size: riderSize, direction: 'right' });
  }

  const allAnimals = shuffle(poolAnimals);

  config.value = {
    moduleId,
    tier: 3,
    currentPhase: span,
    optionCount: allAnimals.length,
    instructionText: sentence,
    phase,
    rule: {
      verb,
      carrierAnimal,
      carrierColor,
      carrierSize,
      riderAnimal,
      riderColor,
      riderSize,
      sentence
    },
    poolAnimals: allAnimals,
    targetFeatures: { verb, carrier: carrierAnimal, rider: riderAnimal },
    distractors: allAnimals.filter(a => a.id === 'distractor').map(a => ({ shape: a.shape, size: a.size }))
  };

  log.generate({ phase, span, verb, sentence });
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

const validateDrop = (draggedId: string, targetId: string) => {
  // Only valid if they drop the target rider onto the target carrier
  if (draggedId === 'rider' && targetId === 'carrier') {
    return true;
  }
  return false;
};

const handleSuccess = (draggedId: string, target?: HTMLElement) => {
  if (isSuccess.value || !config.value) return;
  
  const targetId = target?.dataset?.targetId;
  if (draggedId === 'rider' && targetId === 'carrier') {
    isSuccess.value = true;
    log.success('transport-match', { phase: config.value.phase });
    
    gameStore.handleSuccess();
    progressStore.updateStats(moduleId, true);
    
    
    playInstruction(getRandomPraise());
    
    safeSetTimeout(() => {
      if (gameStore.isRandomMode) { if (!gameStore.advanceRandomRound()) generateLevel(); } else { generateLevel(); }
    }, 4000);
  } else {
    handleError();
  }
};

const handleError = () => {
  if (isSuccess.value || !config.value) return;
  log.error('wrong-transport', { phase: config.value.phase, promptLevel: currentLevel.value });
  gameStore.handleError();
  progressStore.updateStats(moduleId, false);
  registerError();
  playInstruction(config.value.instructionText);
};

const playHint = () => {
  if (config.value) {
    playInstruction(config.value.instructionText);
  }
};
</script>

<template>
  <div class="carries-or-rides-module">
    <div v-if="!hasStarted" class="start-screen">
      <div class="start-icon"><MenuIcon :gameId="moduleId" style="width: 140px; height: 140px;" /></div>
      <h1>Carries or Rides<br><span>Subject & Object</span></h1>
      <p class="start-sub">Listen closely to who is carrying and who is riding!</p>
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
            Replay Audio
          </button>
        </header>

        <!-- MAIN INTERACTION AREA -->
        <div class="main-area">
          <transition name="fade">
            <div v-if="isSuccess" class="success-animation-container">
              <TransportCompositeAsset 
                class="galloping-asset"
                :carrierAnimal="config.rule.carrierAnimal"
                :carrierColor="config.rule.carrierColor"
                :carrierSize="config.rule.carrierSize"
                :riderAnimal="config.rule.riderAnimal"
                :riderColor="config.rule.riderColor"
                :riderSize="config.rule.riderSize"
              />
            </div>
            <div v-else class="pool-container">
              <div class="pool-layout">
                <div v-for="animal in config.poolAnimals" :key="`${levelCounter}-${animal.id}`" class="animal-wrapper">
                  <!-- The Drop Zone for this animal -->
                  <div 
                    class="animal-drop-zone" 
                    :data-target-id="animal.id"
                    :class="{ 'prompt-pulse': currentLevel === 'partial' && animal.id === 'carrier' }"
                  >
                    <!-- The Draggable Piece for this animal -->
                    <PuzzlePiece 
                      :id="animal.id"
                      :transparent="true"
                      dropZoneSelector=".animal-drop-zone"
                      :validateDrop="(t) => validateDrop(animal.id, t.dataset.targetId || '')"
                      @success="(id, t) => handleSuccess(id, t)"
                      @error="handleError"
                      class="pool-piece"
                      :class="{ 'prompt-full': currentLevel === 'full' && animal.id === 'rider' }"
                    >
                      <AnimalAsset 
                        :shape="animal.shape"
                        :color="animal.color"
                        :size="animal.size"
                        direction="right"
                        class="pool-animal-svg"
                      />
                    </PuzzlePiece>
                    <PointingHand v-if="currentLevel === 'full' && animal.id === 'rider'" />
                  </div>
                </div>
              </div>
            </div>
          </transition>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.carries-or-rides-module {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  overflow: hidden;
}

.start-screen { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1.5rem; padding: 3rem; }
.start-icon { font-size: 6rem; letter-spacing: -20px; }
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

.main-area {
  flex: 1;
  background: var(--bg-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  box-shadow: inset 0 10px 20px rgba(0,0,0,0.05);
}

.pool-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pool-layout {
  display: flex;
  flex-wrap: wrap;
  gap: 4rem;
  justify-content: center;
  align-items: center;
  max-width: 1200px;
  padding: 2rem;
}

.animal-wrapper {
  position: relative;
}

.animal-drop-zone {
  width: 250px;
  height: 250px;
  min-width: 200px;
  min-height: 200px;
  border-radius: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255,255,255,0.5);
  border: 4px dashed rgba(0,0,0,0.1);
  transition: all 0.3s ease;
}

.pool-piece {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pool-animal-svg {
  width: 80%;
  height: 80%;
  filter: drop-shadow(0 8px 16px rgba(0,0,0,0.2));
}

/* SUCCESS ANIMATION */
.success-animation-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #e0f7fa;
}

.galloping-asset {
  animation: gallop 3s linear forwards;
}

@keyframes gallop {
  0% { transform: translateX(-150%) scale(1.2); }
  25% { transform: translateX(-50%) scale(1.2) translateY(-20px); }
  50% { transform: translateX(50%) scale(1.2) translateY(0); }
  75% { transform: translateX(150%) scale(1.2) translateY(-20px); }
  100% { transform: translateX(250%) scale(1.2) translateY(0); }
}

/* ABA PROMPTING */
@keyframes zone-pulse {
  0%, 100% { box-shadow: 0 0 0 rgba(255, 215, 0, 0); background-color: rgba(255,255,255,0.5); border-color: rgba(0,0,0,0.1); }
  50% { box-shadow: 0 0 30px rgba(255, 215, 0, 0.8); background-color: rgba(255, 215, 0, 0.1); border-color: rgba(255, 215, 0, 0.8); }
}

.prompt-pulse {
  animation: zone-pulse 2s infinite;
}

@keyframes flash-full {
  0%, 100% { transform: scale(1); filter: brightness(1); }
  50% { transform: scale(1.05); filter: brightness(1.2) drop-shadow(0 0 20px #f1c40f); }
}

.prompt-full {
  animation: flash-full 1.5s infinite;
  z-index: 50;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
