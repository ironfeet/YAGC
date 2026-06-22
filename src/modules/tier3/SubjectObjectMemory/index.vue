<script setup lang="ts">
import { getRandomPraise } from '../../../utils/praises';
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
  SubjectObjectMemoryLevelConfig, 
  HoseLogicRule, 
  SubjectObjectSyntaxType,
  VocabularyNoun
} from '../../../types';

const moduleId = 'tier3-subjectobject-memory';
const progressStore = useProgressStore();
const gameStore = useGameStore();
const { playInstruction, stopSpeech, isPlaying } = useSpeech();
const log = useLogger(moduleId);
const { safeSetTimeout } = useSafeTimeout();
const { currentLevel, registerError, resetAll } = usePromptFading(progressStore.moduleStats[moduleId]?.currentPromptLevel || 'none');

// ── State ─────────────────────────────────────────────────────────────────────
const config = ref<SubjectObjectMemoryLevelConfig | null>(null);
const hasStarted = ref(false);
const levelCounter = ref(0);
const isComplete = ref(false);
const showSuccess = ref(false);

const availableAnimals = ref<{ id: string; animal: VocabularyNoun; isTarget: boolean }[]>([]);
const puddleAnimals = ref<{ id: string; animal: VocabularyNoun; isTarget: boolean }[]>([]);
const initialOptions = ref<{ id: string; animal: VocabularyNoun; isTarget: boolean }[]>([]);

// Confetti particles
const confetti = ref<Array<{ x: number; y: number; color: string; angle: number; id: number }>>([]);

// Pool of recognizable nouns for this task
const NOUNS: VocabularyNoun[] = ['lion', 'monkey', 'giraffe', 'duck', 'cat', 'bear', 'rabbit', 'horse', 'elephant', 'dog'] as any[];

import { shuffle } from '../../../utils/shuffle';

// ── Procedural Engine ─────────────────────────────────────────────────────────

const generateLevel = () => {
  levelCounter.value++;
  isComplete.value = false;
  showSuccess.value = false;
  puddleAnimals.value = [];
  availableAnimals.value = [];
  confetti.value = [];
  resetAll();

  const stat = progressStore.moduleStats[moduleId];
  const span = stat?.currentPhase ?? 1;
  const phase: 1 | 2 | 3 | 4 | 5 = Math.min(5, span) as any;

  // 1. Pick unique racers
  const requiredTargetCount = phase === 5 ? 4 : (phase >= 3 ? 3 : 2);
  const totalOptionsCount = requiredTargetCount + 1; // Always 1 distractor
  const selectedNouns = shuffle([...NOUNS]).slice(0, totalOptionsCount);
  
  const actors = selectedNouns.slice(0, requiredTargetCount);
  const distractorNoun = selectedNouns[requiredTargetCount];

  let syntax: SubjectObjectSyntaxType;
  let sentence = "";
  let wetAnimals: VocabularyNoun[] = [];

  // 2. Generate Grammatical Sentence & Determine Wet Animals
  if (phase === 1) {
    // Active Voice: A showered B. Wet is B.
    syntax = 'active';
    wetAnimals = [actors[1]];
    sentence = `The ${actors[0]} showered the ${actors[1]}. Which one is wet?`;
  } 
  else if (phase === 2) {
    // Passive Voice: A was showered by B. Wet is A.
    syntax = 'passive';
    wetAnimals = [actors[0]];
    sentence = `The ${actors[0]} was showered by the ${actors[1]}. Which one is wet?`;
  } 
  else if (phase === 3) {
    // Compound Active/Passive
    syntax = 'compound';
    // A showered B and was showered by C. Wet = [A, B]
    wetAnimals = [actors[0], actors[1]];
    sentence = `The ${actors[0]} showered the ${actors[1]}, and was showered by the ${actors[2]}. Which animals are wet?`;
  }
  else if (phase === 4) {
    // Compound Passive/Active
    syntax = 'compound';
    // A was showered by B and showered C. Wet = [A, C]
    wetAnimals = [actors[0], actors[2]];
    sentence = `The ${actors[0]} was showered by the ${actors[1]}, and showered the ${actors[2]}. Which animals are wet?`;
  }
  else {
    // Complex Compound with 4 animals
    syntax = 'complex-compound';
    // A showered B, and C was showered by D. Wet = [B, C]
    wetAnimals = [actors[1], actors[2]];
    sentence = `The ${actors[0]} showered the ${actors[1]}, and the ${actors[2]} was showered by the ${actors[3]}. Which animals are wet?`;
  }

  const rule: HoseLogicRule = {
    syntax,
    actors,
    wetAnimals,
    sentence
  };

  // 3. Setup Options
  const options = shuffle([
    ...actors.map(n => ({ id: n, animal: n, isTarget: wetAnimals.includes(n) })),
    { id: distractorNoun, animal: distractorNoun, isTarget: false }
  ]);

  initialOptions.value = [...options];
  availableAnimals.value = [...options];

  config.value = {
    moduleId,
    tier: 3,
    currentPhase: phase,
    optionCount: totalOptionsCount,
    instructionText: sentence,
    phase,
    rule,
    options: [...options],
    targetFeatures: {},
    distractors: [{ id: distractorNoun }]
  };

  gameStore.initializeGame(config.value as any);
  log.generate({ phase, syntax, wetAnimals });

  safeSetTimeout(() => {
    log.audio(config.value!.instructionText);
    playInstruction(config.value!.instructionText);
  }, 400);
};

// ── Drop Validation ───────────────────────────────────────────────────────────

const isValidDropZone = (target: HTMLElement) => {
  return target.closest('.valid-drop-zone') !== null;
};

const handleDrop = (id: string, target?: HTMLElement) => {
  if (!target || isComplete.value) return;

  const puddleZone = target.closest('.puddle-drop-zone');
  const yardZone = target.closest('.yard-drop-zone');

  if (puddleZone) {
    const itemIdx = availableAnimals.value.findIndex(i => i.id === id);
    if (itemIdx > -1) {
      const item = availableAnimals.value[itemIdx];
      availableAnimals.value.splice(itemIdx, 1);
      puddleAnimals.value.push(item);
    }
  } else if (yardZone) {
    const itemIdx = puddleAnimals.value.findIndex(i => i.id === id);
    if (itemIdx > -1) {
      const item = puddleAnimals.value[itemIdx];
      puddleAnimals.value.splice(itemIdx, 1);
      availableAnimals.value.push(item);
    }
  }
};

const validateDone = () => {
  if (!config.value || isComplete.value) return;

  const selectedIds = puddleAnimals.value.map(a => a.animal).sort();
  const targetIds = [...config.value.rule.wetAnimals].sort();

  if (JSON.stringify(selectedIds) === JSON.stringify(targetIds)) {
    // Success
    isComplete.value = true;
    showSuccess.value = true;
    spawnConfetti();
    log.success('subject-object-memory-complete', { phase: config.value.phase });
    gameStore.handleSuccess();
    progressStore.updateStats(moduleId, true);
    
    playInstruction(`${getRandomPraise()} You found the wet animals!`);
    safeSetTimeout(() => { if (gameStore.isRandomMode) { if (!gameStore.advanceRandomRound()) generateLevel(); } else { generateLevel(); } }, 3500);
  } else {
    // Error
    log.error('validation-failed', { phase: config.value.phase, expected: targetIds, selected: selectedIds });
    gameStore.handleError();
    progressStore.updateStats(moduleId, false);
    registerError();
    
    // Memory Reset: Clear puddle and restore initial yard state
    puddleAnimals.value = [];
    availableAnimals.value = [...initialOptions.value];
    
    // Instantly loop audio to trigger the full-screen listening focus mode
    playInstruction(`Oops. Listen closely and remember: ${config.value.instructionText}`);
  }
};

const spawnConfetti = () => {
  const colors = ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe']; // Water themed confetti
  confetti.value = Array.from({ length: 40 }, (_, i) => ({
    x: 20 + Math.random() * 60,
    y: 10 + Math.random() * 40,
    color: colors[i % colors.length],
    angle: Math.random() * 360,
    id: i,
  }));
};

const handleStart = () => {
  hasStarted.value = true;
  log.lifecycle('started');
  generateLevel();
};

const replayAudio = () => {
  if (!config.value) return;
  // Memory constraint: Manually replaying also wipes the board clean
  puddleAnimals.value = [];
  availableAnimals.value = [...initialOptions.value];
  log.audio(`[replay] ${config.value.instructionText}`);
  playInstruction(config.value.instructionText);
};

onUnmounted(() => {
  log.lifecycle('unmounted');
  stopSpeech();
});
</script>

<template>
  <div class="subject-object-memory-module">

    <!-- Confetti particles -->
    <div v-if="confetti.length" class="confetti-layer" aria-hidden="true">
      <div
        v-for="p in confetti" :key="p.id"
        class="confetti-piece"
        :style="{ left: p.x + '%', top: p.y + '%', background: p.color, transform: `rotate(${p.angle}deg)` }"
      ></div>
    </div>

    <!-- ── START SCREEN ──────────────────────────────────────────────────── -->
    <div v-if="!hasStarted" class="start-screen">
      <div class="start-icon"><MenuIcon :gameId="moduleId" style="width: 140px; height: 140px;" /></div>
      <h1>Garden Hose Game<br><span>Memory Training</span></h1>
      <p class="start-sub">Listen carefully. The items will be hidden while you listen. Drag the wet animals into the puddle from memory!</p>
      <button @click="handleStart" class="start-btn">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        Play
      </button>
    </div>

    <!-- ── LISTENING FOCUS MODE ──────────────────────────────────────────── -->
    <div v-else-if="isPlaying" class="focus-listening-mode">
      <div class="listening-content">
        <div class="water-pulse-wrapper">
          <svg class="giant-drop" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 21.5c-3.03 0-5.5-2.47-5.5-5.5 0-2.34 1.34-4.47 3.32-5.18.23-.08.48.06.56.29.08.23-.06.48-.29.56-1.57.56-2.63 2.25-2.63 4.13 0 2.48 2.02 4.5 4.5 4.5s4.5-2.02 4.5-4.5c0-1.88-1.06-3.57-2.63-4.13-.23-.08-.37-.33-.29-.56.08-.23.33-.37.56-.29 1.98.71 3.32 2.84 3.32 5.18 0 3.03-2.47 5.5-5.5 5.5z"/><path d="M12 11c-.28 0-.5-.22-.5-.5V3c0-.28.22-.5.5-.5s.5.22.5.5v7.5c0 .28-.22.5-.5.5z"/>
          </svg>
          <div class="pulse-ring"></div>
          <div class="pulse-ring delay"></div>
        </div>
        <h2>Who got wet?</h2>
        <button class="replay-btn massive-replay" @click="replayAudio">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
          </svg>
          Replay Story
        </button>
      </div>
    </div>

    <!-- ── GAME BOARD ────────────────────────────────────────────────────── -->
    <div v-else-if="config" class="game-board">

      <!-- TOP BAR -->
      <header class="top-bar">
        <div class="phase-badge">Phase {{ config.phase }}</div>
        <div class="instruction-text">Which animals are wet?</div>
        <button class="replay-btn" @click="replayAudio">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
          </svg>
          Replay
        </button>
      </header>

      <div class="action-layout">
        
        <!-- MAIN TARGET AREA (Puddle) -->
        <div class="target-area">
          <div class="puddle-wrapper">
            <div class="valid-drop-zone puddle-drop-zone" data-target-id="puddle">
              
              <div class="puddle-graphic"></div>
              
              <div class="puddle-items-container">
                <div class="piece-wrapper" v-for="opt in puddleAnimals" :key="`${levelCounter}-puddle-${opt.id}`">
                  <PuzzlePiece 
                    :id="opt.id"
                    :transparent="true"
                    dropZoneSelector=".valid-drop-zone"
                    :validateDrop="isValidDropZone"
                    @success="(id, target) => handleDrop(id, target)"
                    class="racer-piece"
                  >
                    <!-- Wet Visual State -->
                    <div class="asset-card is-wet">
                      <AssetLibrary :name="opt.animal" size="large" />
                      <div class="water-drops">
                        <svg viewBox="0 0 24 24" fill="#3b82f6"><path d="M12 21.5c-3.03 0-5.5-2.47-5.5-5.5 0-2.34 1.34-4.47 3.32-5.18.23-.08.48.06.56.29.08.23-.06.48-.29.56-1.57.56-2.63 2.25-2.63 4.13 0 2.48 2.02 4.5 4.5 4.5s4.5-2.02 4.5-4.5c0-1.88-1.06-3.57-2.63-4.13-.23-.08-.37-.33-.29-.56.08-.23.33-.37.56-.29 1.98.71 3.32 2.84 3.32 5.18 0 3.03-2.47 5.5-5.5 5.5z"/><path d="M12 11c-.28 0-.5-.22-.5-.5V3c0-.28.22-.5.5-.5s.5.22.5.5v7.5c0 .28-.22.5-.5.5z"/></svg>
                      </div>
                    </div>
                  </PuzzlePiece>
                </div>
              </div>

              <div class="zone-label" v-if="puddleAnimals.length === 0">Drag Wet Animals Here</div>
            </div>
            
            <button class="done-btn" @click="validateDone" :disabled="isComplete || puddleAnimals.length === 0">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              DONE!
            </button>
          </div>
        </div>

        <!-- OPTIONS GRID (The Yard) -->
        <div class="options-area">
          <div class="valid-drop-zone yard-drop-zone options-container">
            <div class="piece-wrapper" v-for="opt in availableAnimals" :key="`${levelCounter}-yard-${opt.id}`">
              <PuzzlePiece 
                :id="opt.id"
                :transparent="true"
                dropZoneSelector=".valid-drop-zone"
                :validateDrop="isValidDropZone"
                @success="(id, target) => handleDrop(id, target)"
                :class="{ 'prompt-full': currentLevel === 'full' && opt.isTarget }"
                class="racer-piece"
              >
                <div class="asset-card">
                  <AssetLibrary :name="opt.animal" size="large" />
                </div>
              </PuzzlePiece>
              <PointingHand v-if="currentLevel === 'full' && opt.isTarget && puddleAnimals.length === 0" />
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.subject-object-memory-module {
  width: 100%; height: 100%;
  display: flex; flex-direction: column;
  background: linear-gradient(to bottom, #f0fdfa, #ccfbf1);
  font-family: 'Inter', sans-serif;
  overflow: hidden; position: relative;
  user-select: none;
}

/* ── Confetti ──────────────────────────────────────────────────────────────── */
.confetti-layer { position: fixed; inset: 0; pointer-events: none; z-index: 200; }
.confetti-piece {
  position: absolute;
  width: 14px; height: 14px;
  border-radius: 50%;
  animation: confetti-fall 2.5s ease-in forwards;
}
@keyframes confetti-fall {
  0%   { transform: translateY(0) rotate(0deg); opacity: 1; }
  100% { transform: translateY(60vh) rotate(720deg); opacity: 0; }
}

/* ── Start screen ──────────────────────────────────────────────────────────── */
.start-screen {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 1.5rem; padding: 3rem;
}
.start-icon { font-size: 7rem; }
.start-screen h1 { font-size: 3.5rem; font-weight: 900; color: #0f172a; text-align: center; line-height: 1.15; }
.start-screen h1 span { color: #3b82f6; }
.start-sub { font-size: 1.4rem; color: #475569; text-align: center; max-width: 600px; }
.start-btn {
  display: flex; align-items: center; gap: 0.75rem;
  font-size: 1.75rem; font-weight: 700; padding: 1.25rem 3rem;
  background: #3b82f6; color: white; border: none;
  border-radius: 50px; cursor: pointer;
  box-shadow: 0 8px 24px rgba(59,130,246,0.4);
  transition: transform 0.15s;
}
.start-btn:active { transform: scale(0.96); }

/* ── Listening Focus Mode ──────────────────────────────────────────────────── */
.focus-listening-mode {
  flex: 1; display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
  animation: fadeIn 0.3s ease;
}

.listening-content {
  display: flex; flex-direction: column; align-items: center; gap: 3rem;
}

.listening-content h2 {
  font-size: 3rem; font-weight: 800; color: white; margin: 0;
  text-shadow: 0 4px 12px rgba(0,0,0,0.3);
}

.water-pulse-wrapper {
  position: relative; width: 160px; height: 160px;
  display: flex; align-items: center; justify-content: center;
}

.giant-drop {
  width: 100px; height: 100px; color: white; z-index: 10;
}

.pulse-ring {
  position: absolute; top: 0; left: 0; right: 0; bottom: 0;
  border: 4px solid rgba(255,255,255,0.8); border-radius: 50%;
  animation: pulse 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
}

.pulse-ring.delay {
  animation-delay: 1s;
}

@keyframes pulse {
  0% { transform: scale(0.8); opacity: 0.8; }
  100% { transform: scale(2.2); opacity: 0; }
}

.massive-replay {
  font-size: 1.6rem !important; padding: 1.2rem 3rem !important;
  background: #f59e0b !important;
  box-shadow: 0 10px 25px rgba(245,158,11,0.4) !important;
  color: white !important;
  border: none !important;
  border-radius: 50px !important;
  display: flex !important;
  align-items: center !important;
  gap: 0.5rem !important;
  cursor: pointer !important;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* ── Game board ────────────────────────────────────────────────────────────── */
.game-board { flex: 1; display: flex; flex-direction: column; position: relative; overflow: hidden; animation: fadeIn 0.3s ease; }

/* TOP BAR */
.top-bar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 1rem 2rem;
  background: white;
  border-bottom: 2px solid #e2e8f0;
  gap: 1rem; flex-shrink: 0;
}
.phase-badge {
  font-size: 1.1rem; font-weight: 700; color: #64748b;
}
.instruction-text {
  flex: 1; font-size: 1.5rem; font-weight: 800; color: #1e293b;
  text-align: center;
}
.replay-btn {
  display: flex; align-items: center; gap: 0.5rem;
  font-size: 1.1rem; font-weight: 700;
  padding: 0.75rem 1.75rem;
  background: #f1f5f9; color: #475569; border: none;
  border-radius: 50px; cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  transition: all 0.15s;
}
.replay-btn:active { transform: scale(0.95); background: #e2e8f0; }

/* ── Action layout ─────────────────────────────────────────────────────────── */
.action-layout { flex: 1; display: flex; flex-direction: column; overflow: hidden; }

/* ── Target Area (Puddle) ──────────────────────────────────────────────────── */
.target-area {
  flex: 5; display: flex; align-items: center; justify-content: center;
  padding: 2rem;
  position: relative;
}

.puddle-wrapper {
  display: flex; align-items: center; gap: 4rem;
}

.puddle-drop-zone {
  width: 500px; height: 320px;
  position: relative;
  display: flex; align-items: center; justify-content: center;
  border-radius: 60px;
}

.puddle-graphic {
  position: absolute; top: 0; left: 0; right: 0; bottom: 0;
  background: #bfdbfe;
  border: 8px solid #93c5fd;
  border-radius: 60px;
  box-shadow: inset 0 10px 20px rgba(59,130,246,0.2), 0 20px 40px rgba(59,130,246,0.15);
  z-index: 1;
}

.puddle-items-container {
  position: relative; z-index: 10;
  display: flex; gap: 2rem; justify-content: center; align-items: center;
  width: 100%; height: 100%;
}

.zone-label {
  position: absolute; z-index: 5;
  font-size: 1.8rem; font-weight: 800; color: #60a5fa;
  text-transform: uppercase; letter-spacing: 2px;
}

.done-btn {
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.5rem;
  width: 140px; height: 140px;
  background: #22c55e; color: white; border: none;
  border-radius: 50%; cursor: pointer;
  box-shadow: 0 12px 30px rgba(34,197,94,0.4), inset 0 4px 0 rgba(255,255,255,0.3);
  transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  font-size: 1.8rem; font-weight: 900;
}
.done-btn:disabled {
  background: #cbd5e1; box-shadow: none; color: #94a3b8; transform: scale(0.95); cursor: not-allowed;
}
.done-btn:not(:disabled):hover { transform: scale(1.05); }
.done-btn:not(:disabled):active { transform: scale(0.95); }

/* ── Options Area (Yard) ───────────────────────────────────────────────────── */
.options-area {
  flex: 3; display: flex; align-items: center; justify-content: center;
  background: #1e293b; padding: 1.5rem;
  border-top: 8px solid #334155;
}

.options-container {
  display: flex; flex-wrap: wrap; gap: 3rem; justify-content: center; align-items: center; width: 100%; min-height: 200px;
}

.piece-wrapper {
  position: relative; width: 160px; height: 160px; transition: transform 0.2s;
}
.racer-piece { width: 100%; height: 100%; }

.asset-card {
  width: 100%; height: 100%;
  background: white; border-radius: 24px;
  border: 4px solid #cbd5e1;
  box-shadow: 0 10px 20px rgba(0,0,0,0.15);
  display: flex; justify-content: center; align-items: center;
  padding: 1.5rem;
  transition: all 0.3s;
  position: relative; overflow: hidden;
}

/* Wet Visual State */
.asset-card.is-wet {
  background: #dbeafe;
  border-color: #60a5fa;
  box-shadow: 0 10px 20px rgba(59,130,246,0.3);
}

.water-drops {
  position: absolute; top: 10px; right: 10px;
  width: 30px; height: 30px;
  animation: drip 1.5s infinite alternate;
}

@keyframes drip {
  0% { transform: translateY(0); }
  100% { transform: translateY(5px); }
}

/* Prompts */
@keyframes flash-full {
  0%, 100% { transform: scale(1); box-shadow: 0 0 0 transparent; }
  50% { transform: scale(1.15); box-shadow: 0 0 20px 10px rgba(255, 215, 0, 0.8); border-radius: 24px; }
}
.prompt-full { animation: flash-full 1.5s infinite; z-index: 50; }
</style>
