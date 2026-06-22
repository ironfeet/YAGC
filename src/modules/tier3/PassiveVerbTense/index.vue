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
  CatchUpLevelConfig, 
  CatchUpRaceRule, 
  CatchUpSyntaxType,
  VocabularyNoun
} from '../../../types';

const moduleId = 'tier3-passiveverbtense';
const progressStore = useProgressStore();
const gameStore = useGameStore();
const { playInstruction, stopSpeech, isPlaying } = useSpeech();
const log = useLogger(moduleId);
const { safeSetTimeout } = useSafeTimeout();
const { currentLevel, registerError, resetAll } = usePromptFading(progressStore.moduleStats[moduleId]?.currentPromptLevel || 'none');

// ── State ─────────────────────────────────────────────────────────────────────
const config = ref<CatchUpLevelConfig | null>(null);
const hasStarted = ref(false);
const levelCounter = ref(0);
const isComplete = ref(false);
const showSuccess = ref(false);

const placedWinner = ref<VocabularyNoun | null>(null);

// Confetti particles
const confetti = ref<Array<{ x: number; y: number; color: string; angle: number; id: number }>>([]);

// Pool of recognizable nouns for this task (using fastest/land animals makes sense for racing)
const NOUNS: VocabularyNoun[] = ['lion', 'monkey', 'bear', 'cat', 'dog', 'elephant', 'giraffe', 'duck', 'horse'] as any[];

import { shuffle } from '../../../utils/shuffle';
const getRandomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// ── Procedural Engine ─────────────────────────────────────────────────────────

const generateLevel = () => {
  levelCounter.value++;
  isComplete.value = false;
  showSuccess.value = false;
  placedWinner.value = null;
  confetti.value = [];
  resetAll();

  const stat = progressStore.moduleStats[moduleId];
  const span = stat?.currentPhase ?? 1;
  const phase: 1 | 2 | 3 | 4 | 5 = Math.min(5, span) as any;

  // 1. Pick unique racers
  const requiredTargetCount = phase >= 4 ? 3 : 2;
  const totalOptionsCount = requiredTargetCount; // Only syntactic distractors (the other racers)
  const selectedNouns = shuffle([...NOUNS]).slice(0, totalOptionsCount);
  
  const racers = selectedNouns.slice(0, requiredTargetCount);

  let syntax: CatchUpSyntaxType;
  let sentence = "";
  let winnerId: VocabularyNoun;

  // 2. Generate Grammatical Sentence & Determine Winner
  if (phase === 1) {
    // Active Voice: A overtook B. Winner is A.
    syntax = 'active';
    winnerId = racers[0];
    sentence = `The ${racers[0]} overtook the ${racers[1]}. Who won?`;
  } 
  else if (phase === 2) {
    // Positional
    syntax = 'positional';
    // A finished behind B. Winner is B.
    winnerId = racers[1];
    sentence = `The ${racers[0]} finished behind the ${racers[1]}. Who won?`;
  } 
  else if (phase === 3) {
    // Passive Voice
    syntax = 'passive';
    // A was overtaken by B. Winner is B.
    winnerId = racers[1];
    sentence = `The ${racers[0]} was overtaken by the ${racers[1]}. Who won?`;
  }
  else if (phase === 4) {
    // Compound: Active + Positional/Passive
    syntax = 'compound';
    // A overtook B, but finished behind C. Winner is C.
    winnerId = racers[2];
    sentence = `The ${racers[0]} overtook the ${racers[1]}, but finished behind the ${racers[2]}. Who won?`;
  }
  else {
    // Compound: Active + Passive
    syntax = 'compound';
    // A overtook B, but was overtaken by C. Winner is C.
    winnerId = racers[2];
    sentence = `The ${racers[0]} overtook the ${racers[1]}, but was overtaken by the ${racers[2]}. Who won?`;
  }

  const rule: CatchUpRaceRule = {
    syntax,
    racers,
    winnerId,
    sentence
  };

  // 3. Setup Options
  const options = shuffle([
    ...racers.map(n => ({ id: n, animal: n, isTarget: n === winnerId }))
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
    distractors: racers.filter(n => n !== winnerId).map(n => ({ id: n }))
  };

  gameStore.initializeGame(config.value as any);
  log.generate({ phase, syntax, winnerId });

  safeSetTimeout(() => {
    log.audio(config.value!.instructionText);
    playInstruction(config.value!.instructionText);
  }, 400);
};

// ── Drop Handlers ─────────────────────────────────────────────────────────────

const strictValidateDrop = (target: HTMLElement, itemId: string) => {
  const hitsZone = target.closest('.podium-drop-zone') !== null;
  const isWinner = itemId === config.value?.rule.winnerId;
  return hitsZone && isWinner;
};

const handleStrictSuccess = (itemId: string) => {
  if (isComplete.value || !config.value) return;

  const itemConfig = config.value.options.find(o => o.id === itemId);
  if (itemConfig) {
    placedWinner.value = itemConfig.animal;
    config.value.options = config.value.options.filter(o => o.id !== itemId);
  }
  
  isComplete.value = true;
  showSuccess.value = true;
  spawnConfetti();
  log.success('catch-up-complete', { phase: config.value.phase });
  gameStore.handleSuccess();
  progressStore.updateStats(moduleId, true);
  
  playInstruction(getRandomItem(['That is correct!', 'Yes, they won the race!', 'Perfect grammar!']));
  safeSetTimeout(() => { if (gameStore.isRandomMode) { if (!gameStore.advanceRandomRound()) generateLevel(); } else { generateLevel(); } }, 3500);
};

const handleStrictError = (itemId: string) => {
  if (isComplete.value || !config.value) return;
  log.error(itemId, { phase: config.value.phase, expected: config.value.rule.winnerId });
  gameStore.handleError();
  progressStore.updateStats(moduleId, false);
  registerError();
  
  // Replay instruction gently
  playInstruction(`Listen closely to the grammar: ${config.value.instructionText}`);
};

const spawnConfetti = () => {
  const colors = ['#fde047', '#3b82f6', '#22c55e', '#ef4444', '#a855f7'];
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
  log.audio(`[replay] ${config.value.instructionText}`);
  playInstruction(config.value.instructionText);
};

onUnmounted(() => {
  log.lifecycle('unmounted');
  stopSpeech();
});
</script>

<template>
  <div class="catchup-module">

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
      <h1>Passive Verb Tense<br><span>Catch Up Game</span></h1>
      <p class="start-sub">Listen to the racing story and drag the winner to the podium!</p>
      <button @click="handleStart" class="start-btn">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        Start Race
      </button>
    </div>

    <!-- ── GAME BOARD ────────────────────────────────────────────────────── -->
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
        <div class="instruction-text">Who won the race?</div>
        <button class="replay-btn" @click="replayAudio">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
          </svg>
          Replay
        </button>
      </header>

      <div class="action-layout">
        
        <!-- MAIN TARGET AREA (Podium) -->
        <div class="target-area" :class="{ 'is-complete': isComplete }">
          <div class="podium-drop-zone" data-target-id="podium">
            
            <!-- Confetti cannons visual effect backdrops -->
            <div class="spotlight-left"></div>
            <div class="spotlight-right"></div>
            
            <!-- Podium Graphic -->
            <div class="podium-graphic">
              <div class="podium-step first-place">
                <span>1st</span>
              </div>
            </div>

            <!-- The Placed Winner -->
            <div v-if="placedWinner" class="placed-winner-container">
              <AssetLibrary :name="placedWinner" size="large" />
              <div class="winner-glow"></div>
            </div>

            <div class="zone-label" v-if="!placedWinner">Drag the Winner Here!</div>
          </div>
        </div>

        <!-- OPTIONS GRID (Bottom Area) -->
        <div class="options-area">
          <div class="options-container">
            <div class="piece-wrapper" v-for="opt in config.options" :key="`${levelCounter}-${opt.id}`">
              <PuzzlePiece 
                :id="opt.id"
                :transparent="true"
                dropZoneSelector=".podium-drop-zone"
                :validateDrop="(t) => strictValidateDrop(t, opt.id)"
                @success="() => handleStrictSuccess(opt.id)"
                @error="() => handleStrictError(opt.id)"
                :class="{ 'prompt-full': currentLevel === 'full' && opt.id === config.rule.winnerId }"
                class="racer-piece"
              >
                <div class="asset-card">
                  <AssetLibrary :name="opt.animal" size="large" />
                </div>
              </PuzzlePiece>
              <PointingHand v-if="currentLevel === 'full' && opt.id === config.rule.winnerId && !isPlaying" />
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.catchup-module {
  width: 100%; height: 100%;
  display: flex; flex-direction: column;
  background: linear-gradient(to bottom, #1e293b, #0f172a);
  font-family: 'Inter', sans-serif;
  overflow: hidden; position: relative;
  user-select: none;
}

/* ── Confetti ──────────────────────────────────────────────────────────────── */
.confetti-layer { position: fixed; inset: 0; pointer-events: none; z-index: 200; }
.confetti-piece {
  position: absolute;
  width: 14px; height: 14px;
  border-radius: 3px;
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
.start-screen h1 { font-size: 3.5rem; font-weight: 900; color: white; text-align: center; line-height: 1.15; }
.start-screen h1 span { color: #fbbf24; }
.start-sub { font-size: 1.4rem; color: #94a3b8; text-align: center; max-width: 600px; }
.start-btn {
  display: flex; align-items: center; gap: 0.75rem;
  font-size: 1.75rem; font-weight: 700; padding: 1.25rem 3rem;
  background: #fbbf24; color: #1e293b; border: none;
  border-radius: 50px; cursor: pointer;
  box-shadow: 0 8px 24px rgba(251,191,36,0.4);
  transition: transform 0.15s;
}
.start-btn:active { transform: scale(0.96); }

/* LISTENING INDICATOR (Top) */
.listening-mini {
  position: absolute;
  top: 1rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: #3b82f6;
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
  background: rgba(255,255,255,0.05);
  border-bottom: 2px solid rgba(255,255,255,0.08);
  gap: 1rem; flex-shrink: 0;
}
.phase-badge {
  font-size: 1.1rem; font-weight: 700; color: #94a3b8;
}
.instruction-text {
  flex: 1; font-size: 1.4rem; font-weight: 700; color: white;
  text-align: center;
}
.replay-btn {
  display: flex; align-items: center; gap: 0.5rem;
  font-size: 1.1rem; font-weight: 700;
  padding: 0.75rem 1.75rem;
  background: #3b82f6; color: white; border: none;
  border-radius: 50px; cursor: pointer;
  box-shadow: 0 4px 12px rgba(59,130,246,0.35);
  transition: transform 0.15s;
}
.replay-btn:active { transform: scale(0.95); }

/* ── Action layout ─────────────────────────────────────────────────────────── */
.action-layout { flex: 1; display: flex; flex-direction: column; overflow: hidden; }

/* ── Target Area (Podium) ──────────────────────────────────────────────────── */
.target-area {
  flex: 5; display: flex; align-items: center; justify-content: center;
  background: radial-gradient(circle at center, #1e293b 0%, #0f172a 100%);
  padding: 2rem;
  border-bottom: 4px solid #334155;
  position: relative;
}

.podium-drop-zone {
  width: 460px; height: 320px;
  position: relative;
  display: flex; flex-direction: column; align-items: center; justify-content: flex-end;
  border-radius: 40px;
  border: 4px dashed #475569;
  background: rgba(255,255,255,0.02);
  transition: all 0.3s;
}

.is-complete .podium-drop-zone {
  border-color: #facc15;
  background: rgba(250, 204, 21, 0.05);
  box-shadow: 0 0 60px rgba(250, 204, 21, 0.15);
}

.spotlight-left, .spotlight-right {
  position: absolute; top: -100px; width: 100px; height: 400px;
  background: linear-gradient(to bottom, rgba(255,255,255,0.1) 0%, transparent 100%);
  transform-origin: top center; z-index: 1; pointer-events: none; opacity: 0;
  transition: opacity 0.5s;
}
.spotlight-left { left: 0; transform: rotate(20deg); }
.spotlight-right { right: 0; transform: rotate(-20deg); }

.is-complete .spotlight-left, .is-complete .spotlight-right {
  opacity: 1;
}

.podium-graphic {
  position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%);
  display: flex; align-items: flex-end; justify-content: center;
  z-index: 5;
}

.podium-step {
  width: 140px; height: 100px;
  background: linear-gradient(to bottom, #fbbf24, #d97706);
  border-radius: 8px 8px 0 0;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 10px 20px rgba(0,0,0,0.4), inset 0 4px 0 rgba(255,255,255,0.3);
}

.podium-step span {
  font-size: 3rem; font-weight: 900; color: white;
  text-shadow: 0 2px 4px rgba(0,0,0,0.4);
}

.placed-winner-container {
  position: absolute; bottom: 110px; left: 50%; transform: translateX(-50%);
  z-index: 10;
  animation: dropWinner 0.5s cubic-bezier(0.175,0.885,0.32,1.275);
}

.winner-glow {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
  width: 140px; height: 140px; border-radius: 50%;
  background: radial-gradient(circle, rgba(250,204,21,0.6) 0%, transparent 70%);
  z-index: -1;
  animation: pulse-glow 2s infinite alternate;
}

@keyframes pulse-glow {
  0% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
  100% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
}

@keyframes dropWinner {
  0% { transform: translate(-50%, -100px) scale(1.3); opacity: 0; }
  100% { transform: translate(-50%, 0) scale(1); opacity: 1; }
}

.zone-label {
  position: absolute; top: 40px; font-size: 1.6rem; font-weight: 800; color: #64748b;
  text-transform: uppercase; letter-spacing: 2px;
}

/* ── Options Area ──────────────────────────────────────────────────────────── */
.options-area {
  flex: 3; display: flex; align-items: center; justify-content: center;
  background: #1e293b; padding: 1.5rem;
}

.options-container {
  display: flex; flex-wrap: wrap; gap: 3rem; justify-content: center; align-items: center; width: 100%;
}

.piece-wrapper {
  position: relative; width: 180px; height: 180px; transition: transform 0.2s;
}
.racer-piece { width: 100%; height: 100%; }

.asset-card {
  width: 100%; height: 100%;
  background: white; border-radius: 24px;
  border: 4px solid #cbd5e1;
  box-shadow: 0 10px 20px rgba(0,0,0,0.15);
  display: flex; justify-content: center; align-items: center;
  padding: 1.5rem;
  transition: transform 0.2s, box-shadow 0.2s;
}
.asset-card:hover {
  transform: translateY(-5px); box-shadow: 0 15px 30px rgba(0,0,0,0.25); border-color: #94a3b8;
}

/* Prompts */
@keyframes flash-full {
  0%, 100% { transform: scale(1); box-shadow: 0 0 0 transparent; }
  50% { transform: scale(1.15); box-shadow: 0 0 20px 10px rgba(255, 215, 0, 0.8); border-radius: 24px; }
}
.prompt-full { animation: flash-full 1.5s infinite; z-index: 50; }
</style>
