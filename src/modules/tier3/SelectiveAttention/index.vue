<script setup lang="ts">
import { ref, onMounted } from 'vue';
import MenuIcon from '../../../components/game/MenuIcon.vue';
import { useGameStore } from '../../../stores/useGameStore';
import { useProgressStore } from '../../../stores/useProgressStore';
import { usePromptFading } from '../../../composables/usePromptFading';
import { useSpeech } from '../../../composables/useSpeech';
import { useLogger } from '../../../composables/useLogger';
import { useSafeTimeout } from '../../../composables/useSafeTimeout';

import SearchItemAsset from '../../../components/game/SearchItemAsset.vue';
import PointingHand from '../../../components/prompts/PointingHand.vue';
import type { SelectiveAttentionLevelConfig, SearchItemType, SearchItemData } from '../../../types';

const moduleId = 'tier3-selectiveattention';
const progressStore = useProgressStore();
const gameStore = useGameStore();
const { playInstruction, isPlaying } = useSpeech();
const { currentLevel, registerError, resetAll } = usePromptFading(progressStore.moduleStats[moduleId]?.currentPromptLevel || 'none');
const log = useLogger(moduleId);
const { safeSetTimeout } = useSafeTimeout();

const config = ref<SelectiveAttentionLevelConfig | null>(null);
const levelCounter = ref(0);
const isSuccess = ref(false);
const hasStarted = ref(false);

const remainingTargets = ref(0);
const assetRefs = ref<InstanceType<typeof SearchItemAsset>[]>([]);
const fieldItemsWithStyles = ref<(SearchItemData & { style: any })[]>([]);

const handleStart = () => {
  hasStarted.value = true;
  generateLevel();
};

const TYPES: SearchItemType[] = ['apple', 'strawberry', 'star', 'car', 'flower', 'balloon'];
const COLORS = ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6', '#e67e22'];

const getRandomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const shuffle = <T>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

const generateLevel = () => {
  levelCounter.value++;
  isSuccess.value = false;
  resetAll();
  
  const stat = progressStore.moduleStats[moduleId];
  const span = stat?.currentPhase || 1;
  const phase = Math.min(5, span) as 1 | 2 | 3 | 4 | 5;

  const targetType = getRandomItem(TYPES);
  const targetColor = getRandomItem(COLORS);
  const targetHasDetail = Math.random() > 0.5;

  const targetItem: SearchItemData = {
    id: 'target',
    itemType: targetType,
    color: targetColor,
    hasDetail: targetHasDetail,
    isTarget: true
  };

  const distractorItems: SearchItemData[] = [];
  let totalTargets = 0;
  let totalDistractors = 0;

  if (phase === 1) {
    // Phase 1: Feature Search (Color difference only) - Low density
    totalTargets = Math.floor(Math.random() * 3) + 3; // 3 to 5
    totalDistractors = 15;
    const diffColor = getRandomItem(COLORS.filter(c => c !== targetColor));
    for (let i = 0; i < totalDistractors; i++) {
      distractorItems.push({
        id: `d-${i}`,
        itemType: targetType,
        color: diffColor,
        hasDetail: targetHasDetail,
        isTarget: false
      });
    }
  } else if (phase === 2) {
    // Phase 2: Conjunction Search (Color OR Shape difference) - Medium density
    totalTargets = Math.floor(Math.random() * 3) + 4; // 4 to 6
    totalDistractors = 25;
    const diffColor = getRandomItem(COLORS.filter(c => c !== targetColor));
    const diffType = getRandomItem(TYPES.filter(t => t !== targetType));
    
    for (let i = 0; i < totalDistractors; i++) {
      if (i % 2 === 0) {
        distractorItems.push({
          id: `d-${i}`,
          itemType: targetType,
          color: diffColor,
          hasDetail: targetHasDetail,
          isTarget: false
        });
      } else {
        distractorItems.push({
          id: `d-${i}`,
          itemType: diffType,
          color: targetColor,
          hasDetail: targetHasDetail,
          isTarget: false
        });
      }
    }
  } else if (phase === 3) {
    // Phase 3: Conjunction Search - High density
    totalTargets = Math.floor(Math.random() * 3) + 5; // 5 to 7
    totalDistractors = 40;
    
    for (let i = 0; i < totalDistractors; i++) {
      const diffColor = getRandomItem(COLORS.filter(c => c !== targetColor));
      const diffType = getRandomItem(TYPES.filter(t => t !== targetType));
      if (i % 3 === 0) {
        distractorItems.push({
          id: `d-${i}`, itemType: targetType, color: diffColor, hasDetail: targetHasDetail, isTarget: false
        });
      } else if (i % 3 === 1) {
        distractorItems.push({
          id: `d-${i}`, itemType: diffType, color: targetColor, hasDetail: targetHasDetail, isTarget: false
        });
      } else {
        distractorItems.push({
          id: `d-${i}`, itemType: diffType, color: diffColor, hasDetail: targetHasDetail, isTarget: false
        });
      }
    }
  } else if (phase === 4) {
    // Phase 4: Detail Conjunction - Very high density
    totalTargets = Math.floor(Math.random() * 3) + 6; // 6 to 8
    totalDistractors = 55;
    
    for (let i = 0; i < totalDistractors; i++) {
      const diffColor = getRandomItem(COLORS.filter(c => c !== targetColor));
      const diffType = getRandomItem(TYPES.filter(t => t !== targetType));
      const scenario = i % 4;
      if (scenario === 0) {
        // Same shape and color, wrong detail (extremely subtle)
        distractorItems.push({ id: `d-${i}`, itemType: targetType, color: targetColor, hasDetail: !targetHasDetail, isTarget: false });
      } else if (scenario === 1) {
        distractorItems.push({ id: `d-${i}`, itemType: targetType, color: diffColor, hasDetail: targetHasDetail, isTarget: false });
      } else if (scenario === 2) {
        distractorItems.push({ id: `d-${i}`, itemType: diffType, color: targetColor, hasDetail: targetHasDetail, isTarget: false });
      } else {
        distractorItems.push({ id: `d-${i}`, itemType: diffType, color: diffColor, hasDetail: !targetHasDetail, isTarget: false });
      }
    }
  } else {
    // Phase 5: Maximum Density & Subtlety - Extremely high density (Conjunction of 3 features)
    totalTargets = Math.floor(Math.random() * 4) + 6; // 6 to 9
    totalDistractors = 80;
    
    for (let i = 0; i < totalDistractors; i++) {
      const diffColor = getRandomItem(COLORS.filter(c => c !== targetColor));
      const diffType = getRandomItem(TYPES.filter(t => t !== targetType));
      const scenario = i % 5;
      
      if (scenario === 0 || scenario === 1) {
        // High frequency of the most subtle distractor (wrong detail only)
        distractorItems.push({ id: `d-${i}`, itemType: targetType, color: targetColor, hasDetail: !targetHasDetail, isTarget: false });
      } else if (scenario === 2) {
        distractorItems.push({ id: `d-${i}`, itemType: targetType, color: diffColor, hasDetail: targetHasDetail, isTarget: false });
      } else if (scenario === 3) {
        distractorItems.push({ id: `d-${i}`, itemType: diffType, color: targetColor, hasDetail: targetHasDetail, isTarget: false });
      } else {
        distractorItems.push({ id: `d-${i}`, itemType: diffType, color: targetColor, hasDetail: !targetHasDetail, isTarget: false });
      }
    }
  }

  const allTargets: SearchItemData[] = [];
  for (let i = 0; i < totalTargets; i++) {
    allTargets.push({ ...targetItem, id: `t-${i}` });
  }

  const allItems = shuffle([...allTargets, ...distractorItems]);
  remainingTargets.value = totalTargets;

  fieldItemsWithStyles.value = allItems.map(item => ({
    ...item,
    style: {
      transform: `rotate(${Math.floor(Math.random() * 40 - 20)}deg) translate(${Math.floor(Math.random() * 10 - 5)}px, ${Math.floor(Math.random() * 10 - 5)}px)`,
      margin: phase >= 4 ? `${Math.floor(Math.random() * 4 + 2)}px` : `${Math.floor(Math.random() * 10 + 5)}px`,
      width: phase >= 4 ? '70px' : '90px', // scale down for density
      height: phase >= 4 ? '70px' : '90px'
    }
  }));

  config.value = {
    moduleId,
    tier: 3,
    currentPhase: span,
    optionCount: allItems.length,
    instructionText: `Find all the matching items!`,
    phase,
    targetItem,
    totalTargets,
    fieldItems: allItems,
    targetFeatures: { itemType: targetType, color: targetColor },
    distractors: distractorItems.map(d => ({ itemType: d.itemType, color: d.color }))
  };

  log.generate({ phase, span, totalTargets, totalDistractors });
  gameStore.initializeGame(config.value!);
  
  safeSetTimeout(() => {
    log.audio(config.value!.instructionText);
    playInstruction(config.value!.instructionText);
  }, 500);
};

onMounted(() => {
  log.lifecycle('mounted');
});

const handleTap = (index: number) => {
  if (isSuccess.value || !config.value) return;
  
  const item = fieldItemsWithStyles.value[index];
  if (item.isCollected) return;

  if (item.isTarget) {
    item.isCollected = true;
    remainingTargets.value--;
    log.success(`target-${item.id}`, { phase: config.value.phase, remaining: remainingTargets.value });
    
    if (remainingTargets.value <= 0) {
      isSuccess.value = true;
      gameStore.handleSuccess();
      progressStore.updateStats(moduleId, true);
      const praises = ['Amazing scanning!', 'You found them all!', 'Great job!'];
      playInstruction(getRandomItem(praises));
      
      safeSetTimeout(() => {
        generateLevel();
      }, 3000);
    } else {
      playInstruction(getRandomItem(['Got it!', 'Found one!', 'Nice!']));
      resetAll(); // reset prompts on success
    }
  } else {
    log.error(`distractor-${item.id}`, { phase: config.value.phase, promptLevel: currentLevel.value });
    if (assetRefs.value[index]) {
      assetRefs.value[index].triggerShake();
    }
    playInstruction('Boop.');
    gameStore.handleError();
    progressStore.updateStats(moduleId, false);
    registerError();
  }
};

const playHint = () => {
  if (config.value) {
    playInstruction(config.value.instructionText);
  }
};
</script>

<template>
  <div class="selective-attention-module">
    <div v-if="!hasStarted" class="start-screen">
      <div class="start-icon"><MenuIcon :gameId="moduleId" style="width: 140px; height: 140px;" /></div>
      <h1>Selective Attention<br><span>Visual Search</span></h1>
      <p class="start-sub">Find all the target items hidden in the field.</p>
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
          
          <!-- TARGET PANEL -->
          <div class="target-panel" :class="{ 'prompt-pulse': currentLevel !== 'none' && remainingTargets > 0 }">
            <span class="target-label">Find:</span>
            <div class="target-preview-wrapper">
              <SearchItemAsset 
                :itemType="config.targetItem.itemType"
                :color="config.targetItem.color"
                :hasDetail="config.targetItem.hasDetail"
              />
            </div>
            <div class="remaining-counter">
              {{ remainingTargets }} Remaining
            </div>
          </div>

          <button class="replay-btn" @click="playHint">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
            Replay
          </button>
        </header>

        <!-- MAIN SEARCH FIELD -->
        <div class="field-container" :class="{ 'celebrate': isSuccess }">
          <div class="search-field">
            <div 
              v-for="(item, index) in fieldItemsWithStyles" 
              :key="`${levelCounter}-${item.id}`"
              class="field-item-wrapper"
              :style="item.style"
              @click="() => handleTap(index)"
              @touchstart.prevent="() => handleTap(index)"
            >
              <SearchItemAsset 
                ref="assetRefs"
                :itemType="item.itemType"
                :color="item.color"
                :hasDetail="item.hasDetail"
                :isCollected="item.isCollected"
                class="field-asset"
                :class="{ 'target-pulse': currentLevel === 'full' && item.isTarget && !item.isCollected }"
              />
              <PointingHand 
                v-if="currentLevel === 'full' && item.isTarget && !item.isCollected && index === fieldItemsWithStyles.findIndex(i => i.isTarget && !i.isCollected)" 
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.selective-attention-module {
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

/* TARGET PANEL */
.target-panel {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  background: rgba(255,255,255,0.1);
  padding: 0.5rem 2rem;
  border-radius: 50px;
  border: 2px solid rgba(255,255,255,0.2);
}

.target-label {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.target-preview-wrapper {
  width: 50px;
  height: 50px;
  pointer-events: none; /* purely visual here */
}

.remaining-counter {
  font-size: 1.5rem;
  font-weight: 900;
  color: var(--color-target, #f1c40f);
  min-width: 150px;
  text-align: right;
}

/* FIELD CONTAINER */
.field-container {
  flex: 1;
  background-color: #e0e5ec;
  padding: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: inset 0 10px 20px rgba(0,0,0,0.05);
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.search-field {
  width: 100%;
  max-width: 1400px;
  height: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-content: center;
  gap: 1.5rem;
}

/* Ensure large tappable targets for StanbyME touch display */
.field-item-wrapper {
  width: 90px;
  height: 90px;
  min-width: 80px;
  min-height: 80px;
  position: relative;
  /* Inline margins/rotations apply extra visual jitter */
}

.field-asset {
  width: 100%;
  height: 100%;
}

/* ABA Prompts */
@keyframes flash-full {
  0%, 100% { transform: scale(1); filter: brightness(1); }
  50% { transform: scale(1.1); filter: brightness(1.2) drop-shadow(0 0 15px #f1c40f); }
}

.target-pulse {
  animation: flash-full 1.5s infinite;
  z-index: 50;
  background-color: rgba(255, 215, 0, 0.2);
  border-radius: 50%;
}

@keyframes panel-pulse {
  0%, 100% { box-shadow: 0 0 0 rgba(255, 215, 0, 0); background-color: rgba(255,255,255,0.1); }
  50% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.6); background-color: rgba(255, 215, 0, 0.2); }
}

.prompt-pulse {
  animation: panel-pulse 2s infinite;
}

/* Celebration */
@keyframes celebrate {
  0% { transform: scale(1); background-color: #e0e5ec; }
  50% { transform: scale(1.02); background-color: #d4edda; }
  100% { transform: scale(1); background-color: #e0e5ec; }
}

.celebrate {
  animation: celebrate 1.5s ease-out;
}
</style>
