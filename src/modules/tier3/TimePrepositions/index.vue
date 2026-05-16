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
import AssetLibrary from '../../../components/game/AssetLibrary.vue';
import PointingHand from '../../../components/prompts/PointingHand.vue';
import type { 
  TimePrepositionsLevelConfig, 
  TemporalSequenceRule, 
  TemporalSyntaxType,
  VocabularyNoun
} from '../../../types';

const moduleId = 'tier3-timeprepositions';
const progressStore = useProgressStore();
const gameStore = useGameStore();
const { playInstruction, stopSpeech, isPlaying } = useSpeech();
const log = useLogger(moduleId);
const { safeSetTimeout } = useSafeTimeout();
const { currentLevel, registerError, resetAll } = usePromptFading(progressStore.moduleStats[moduleId]?.currentPromptLevel || 'none');

// ── State ─────────────────────────────────────────────────────────────────────
const config = ref<TimePrepositionsLevelConfig | null>(null);
const hasStarted = ref(false);
const levelCounter = ref(0);
const isComplete = ref(false);

const expectedActionQueue = ref<string[]>([]);
const placedItems = ref<{ id: string; animal: VocabularyNoun }[]>([]);

// Pool of recognizable nouns for this task
const NOUNS: VocabularyNoun[] = ['dog', 'cat', 'bird', 'rabbit', 'fish', 'car', 'apple', 'banana', 'tree', 'house', 'lion', 'giraffe', 'tiger', 'monkey', 'bear', 'dinosaur', 'cow', 'horse'] as any[];

const shuffle = <T>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);
const getRandomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// ── Procedural Engine ─────────────────────────────────────────────────────────

const generateLevel = () => {
  levelCounter.value++;
  isComplete.value = false;
  placedItems.value = [];
  resetAll();

  const stat = progressStore.moduleStats[moduleId];
  const span = stat?.currentPhase ?? 1;
  const phase: 1 | 2 | 3 | 4 | 5 = Math.min(5, span) as any;

  // 1. Pick unique nouns based on phase (Phase 1-3 needs 2 items + 1 distractor, Phase 4-5 needs 3 items + 1 distractor)
  const requiredTargetCount = phase >= 4 ? 3 : 2;
  const totalOptionsCount = requiredTargetCount + 1; // Always 1 distractor
  const selectedNouns = shuffle([...NOUNS]).slice(0, totalOptionsCount);
  
  const targetNouns = selectedNouns.slice(0, requiredTargetCount);
  const distractorNoun = selectedNouns[requiredTargetCount];

  let syntax: TemporalSyntaxType;
  let sentence = "";
  let correctOrder: string[] = [];

  // 2. Generate Temporal Sentence & Execution Order
  if (phase === 1) {
    // Linear Sequential: "Give me the A, then give me the B"
    syntax = 'then';
    correctOrder = [targetNouns[0], targetNouns[1]];
    sentence = `Give me the ${targetNouns[0]}, then give me the ${targetNouns[1]}.`;
  } 
  else if (phase === 2) {
    // 2-item After
    syntax = 'after';
    const leads = Math.random() > 0.5;
    // "After you give me A, give me B" -> Order: [A, B]
    // "Give me B after you give me A" -> Order: [A, B]
    correctOrder = [targetNouns[0], targetNouns[1]];
    sentence = leads
      ? `After you give me the ${targetNouns[0]}, give me the ${targetNouns[1]}.`
      : `Give me the ${targetNouns[1]} after you give me the ${targetNouns[0]}.`;
  }
  else if (phase === 3) {
    // 2-item Before
    syntax = 'before';
    const leads = Math.random() > 0.5;
    // "Before you give me A, give me B" -> Order: [B, A]
    // "Give me B before you give me A" -> Order: [B, A]
    correctOrder = [targetNouns[1], targetNouns[0]];
    sentence = leads 
      ? `Before you give me the ${targetNouns[0]}, give me the ${targetNouns[1]}.`
      : `Give me the ${targetNouns[1]} before you give me the ${targetNouns[0]}.`;
  }
  else if (phase === 4) {
    // 3-item Sequential + Before/After
    syntax = 'complex-before-after';
    const leads = Math.random() > 0.5;
    correctOrder = [targetNouns[0], targetNouns[1], targetNouns[2]];
    if (leads) {
      sentence = `Before you give me the ${targetNouns[2]}, give me the ${targetNouns[0]}, then the ${targetNouns[1]}.`;
    } else {
      sentence = `After you give me the ${targetNouns[0]}, give me the ${targetNouns[1]}, then the ${targetNouns[2]}.`;
    }
  }
  else {
    // 3-item Complex Nested
    syntax = 'complex-after-before';
    // "Give me B, after you give me A, but before you give me C" -> Order: [A, B, C]
    correctOrder = [targetNouns[0], targetNouns[1], targetNouns[2]];
    sentence = `Give me the ${targetNouns[1]}, after you give me the ${targetNouns[0]}, but before you give me the ${targetNouns[2]}.`;
  }

  const rule: TemporalSequenceRule = {
    syntax,
    items: targetNouns,
    correctOrder,
    sentence
  };

  expectedActionQueue.value = [...correctOrder];

  // 3. Setup Options
  const options = shuffle([
    ...targetNouns.map(n => ({ id: n, animal: n, isTarget: true })),
    { id: distractorNoun, animal: distractorNoun, isTarget: false }
  ]);

  config.value = {
    moduleId,
    tier: 3,
    currentPhase: phase,
    optionCount: totalOptionsCount,
    instructionText: sentence,
    phase,
    rule,
    options,
    targetFeatures: {},
    distractors: [{ id: distractorNoun }]
  };

  gameStore.initializeGame(config.value as any);
  log.generate({ phase, syntax, expectedOrder: correctOrder });

  safeSetTimeout(() => {
    log.audio(config.value!.instructionText);
    playInstruction(config.value!.instructionText);
  }, 400);
};

// ── Drop Handlers ─────────────────────────────────────────────────────────────

// Re-write validateDrop to only allow the strictly correct chronological item to be dropped.
const strictValidateDrop = (target: HTMLElement, itemId: string) => {
  const hitsZone = target.closest('.central-basket-zone') !== null;
  const isChronological = itemId === expectedActionQueue.value[0];
  return hitsZone && isChronological;
};

// Now handleSuccess only fires if it's correct.
const handleStrictSuccess = (itemId: string) => {
  if (isComplete.value || !config.value) return;

  const itemConfig = config.value.options.find(o => o.id === itemId);
  if (itemConfig) {
    placedItems.value.push({ id: itemConfig.id, animal: itemConfig.animal });
    config.value.options = config.value.options.filter(o => o.id !== itemId);
  }
  
  expectedActionQueue.value.shift();

  if (expectedActionQueue.value.length === 0) {
    isComplete.value = true;
    log.success('sequence-complete', { phase: config.value.phase });
    gameStore.handleSuccess();
    progressStore.updateStats(moduleId, true);
    
    playInstruction(getRandomItem(['Excellent memory!', 'You followed the steps perfectly!', 'Great sequencing!']));
    safeSetTimeout(() => generateLevel(), 3500);
  } else {
    // Play subtle "ding" for correct step
    playInstruction('Good.');
  }
};

const handleStrictError = (itemId: string) => {
  if (isComplete.value || !config.value) return;
  log.error(itemId, { phase: config.value.phase, expected: expectedActionQueue.value[0] });
  gameStore.handleError();
  progressStore.updateStats(moduleId, false);
  registerError();
  
  // Replay instruction
  playInstruction(`Listen closely: ${config.value.instructionText}`);
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
  <div class="time-prepositions-module">

    <!-- ── START SCREEN ──────────────────────────────────────────────────── -->
    <div v-if="!hasStarted" class="start-screen">
      <div class="start-icon"><MenuIcon :gameId="moduleId" style="width: 140px; height: 140px;" /></div>
      <h1>Time<br><span>Prepositions</span></h1>
      <p class="start-sub">Listen to the chronological sequence and drag the items in the exact order requested.</p>
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
        
        <!-- MAIN TARGET AREA (Basket / Drop Zone) -->
        <div class="target-area" :class="{ 'is-complete': isComplete }">
          <div class="central-basket-zone" data-target-id="basket">
            
            <div class="basket-backdrop"></div>
            
            <!-- Placed Items Stack -->
            <div class="placed-items-container">
              <div 
                v-for="(item, idx) in placedItems" 
                :key="item.id"
                class="placed-item"
                :style="{ transform: `translate(${idx * 20 - (placedItems.length * 10)}px, ${-idx * 15}px)`, zIndex: idx }"
              >
                <AssetLibrary :name="item.animal" size="large" />
              </div>
            </div>

            <!-- The Front Lip of the Basket to overlay items -->
            <div class="basket-front-lip">
              <div class="basket-rim"></div>
            </div>

            <div class="zone-label" v-if="placedItems.length === 0">Drop Here in Order</div>
          </div>
        </div>

        <!-- OPTIONS GRID (Bottom Area) -->
        <div class="options-area">
          <div class="options-container">
            <div class="piece-wrapper" v-for="opt in config.options" :key="`${levelCounter}-${opt.id}`">
              <PuzzlePiece 
                :id="opt.id"
                :transparent="true"
                dropZoneSelector=".central-basket-zone"
                :validateDrop="(t) => strictValidateDrop(t, opt.id)"
                @success="() => handleStrictSuccess(opt.id)"
                @error="() => handleStrictError(opt.id)"
                :class="{ 'prompt-full': currentLevel === 'full' && opt.id === expectedActionQueue[0] }"
                class="time-piece"
              >
                <div class="asset-card">
                  <AssetLibrary :name="opt.animal" size="large" />
                </div>
              </PuzzlePiece>
              <PointingHand v-if="currentLevel === 'full' && opt.id === expectedActionQueue[0] && !isPlaying" />
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.time-prepositions-module {
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

/* ── Target Area (Basket) ──────────────────────────────────────────────────── */
.target-area {
  flex: 5; display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  padding: 2rem;
  border-bottom: 4px solid #bae6fd;
  position: relative;
}

.central-basket-zone {
  width: 400px; height: 250px;
  position: relative;
  display: flex; align-items: flex-end; justify-content: center;
  border-radius: 40px;
  background: rgba(255,255,255,0.3);
  border: 4px dashed #7dd3fc;
  transition: all 0.3s;
}

.basket-backdrop {
  position: absolute; bottom: 0; left: 10%; width: 80%; height: 120px;
  background: #fcd34d; border-radius: 20px 20px 60px 60px;
  box-shadow: inset 0 -20px 0 rgba(0,0,0,0.1);
  z-index: 1;
}

.basket-front-lip {
  position: absolute; bottom: 0; left: 10%; width: 80%; height: 60px;
  background: #fbbf24; border-radius: 0 0 60px 60px;
  z-index: 10;
}

.basket-rim {
  position: absolute; top: -10px; left: -5%; width: 110%; height: 20px;
  background: #f59e0b; border-radius: 20px;
}

.zone-label {
  position: absolute; top: -40px; font-size: 1.5rem; font-weight: 800; color: #0284c7;
}

.placed-items-container {
  position: absolute; bottom: 30px; left: 0; width: 100%; height: 160px;
  display: flex; align-items: flex-end; justify-content: center;
  z-index: 5; /* Between backdrop and lip */
}

.placed-item {
  position: absolute;
  transition: transform 0.3s cubic-bezier(0.175,0.885,0.32,1.275);
  animation: dropIn 0.5s cubic-bezier(0.175,0.885,0.32,1.275);
}

@keyframes dropIn {
  0% { transform: translateY(-50px) scale(1.2); opacity: 0; }
  100% { transform: translateY(0) scale(1); opacity: 1; }
}

.is-complete .central-basket-zone {
  border-color: #22c55e;
  animation: celebrateBasket 1s ease infinite alternate;
}

@keyframes celebrateBasket {
  0% { transform: scale(1); }
  100% { transform: scale(1.05); }
}

/* ── Options Area ──────────────────────────────────────────────────────────── */
.options-area {
  flex: 3; display: flex; align-items: center; justify-content: center;
  background: #f8fafc; padding: 1.5rem;
  transition: opacity 0.3s;
}


.options-container {
  display: flex; flex-wrap: wrap; gap: 3rem; justify-content: center; align-items: center; width: 100%;
}

.piece-wrapper {
  position: relative; width: 180px; height: 180px; transition: transform 0.2s;
}
.time-piece { width: 100%; height: 100%; }

.asset-card {
  width: 100%; height: 100%;
  background: white; border-radius: 24px;
  border: 4px solid #e2e8f0;
  box-shadow: 0 10px 20px rgba(0,0,0,0.08);
  display: flex; justify-content: center; align-items: center;
  padding: 1.5rem;
  transition: transform 0.2s, box-shadow 0.2s;
}
.asset-card:hover {
  transform: translateY(-5px); box-shadow: 0 15px 30px rgba(0,0,0,0.12); border-color: #cbd5e1;
}

/* Prompts */
@keyframes flash-full {
  0%, 100% { transform: scale(1); box-shadow: 0 0 0 transparent; }
  50% { transform: scale(1.15); box-shadow: 0 0 20px 10px rgba(255, 215, 0, 0.8); border-radius: 24px; }
}
.prompt-full { animation: flash-full 1.5s infinite; z-index: 50; }
</style>
