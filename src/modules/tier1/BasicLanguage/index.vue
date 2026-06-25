<script setup lang="ts">
import { onMounted, ref, onUnmounted } from 'vue';
import MenuIcon from '../../../components/game/MenuIcon.vue';
import AssetLibrary from '../../../components/game/AssetLibrary.vue';
import { useProgressStore } from '../../../stores/useProgressStore';
import { useGameStore } from '../../../stores/useGameStore';
import { useSpeech } from '../../../composables/useSpeech';
import { usePromptFading } from '../../../composables/usePromptFading';
import { useLogger } from '../../../composables/useLogger';
import { useSafeTimeout } from '../../../composables/useSafeTimeout';

import PuzzlePiece from '../../../components/game/PuzzlePiece.vue';
import PointingHand from '../../../components/prompts/PointingHand.vue';
import type { LanguageLevelConfig, LanguageFeature, VocabularyNoun } from '../../../types';

const moduleId = 'tier1-basiclanguage';
const progressStore = useProgressStore();
const gameStore = useGameStore();
const { playInstruction, stopSpeech, isPlaying, isSupported } = useSpeech();
const { currentLevel, registerError, resetAll } = usePromptFading(progressStore.moduleStats[moduleId].currentPromptLevel);
const log = useLogger(moduleId);
const { safeSetTimeout } = useSafeTimeout();

const config = ref<LanguageLevelConfig | null>(null);
const options = ref<LanguageFeature[]>([]);
const hasStarted = ref(false);
const levelCounter = ref(0);

// ─── Clinical vocabulary: all available AssetLibrary nouns ───────────────────
// Organized by semantic category — all 44 flat SVGs + top animals from AnimalAsset
const NOUNS: VocabularyNoun[] = [
  // Animals (custom flat SVGs)
  'dog', 'cat', 'bird', 'rabbit', 'fish',
  // Animals (via AnimalAsset engine)
  'cow', 'pig', 'horse', 'duck', 'sheep',
  'elephant', 'lion', 'monkey', 'penguin', 'bear',
  'giraffe', 'zebra', 'kangaroo', 'deer', 'owl',
  // Food & Nature
  'apple', 'banana',
  'tree', 'flower', 'sun', 'moon', 'star', 'cloud',
  // Household Objects
  'cup', 'ball', 'book', 'key', 'clock', 'lamp',
  // Furniture
  'table', 'chair', 'couch', 'bed', 'slide',
  // Technology & Home
  'television', 'computer', 'phone',
  // Clothing
  'shoes', 'hat', 'shirt', 'pants', 'socks',
  // Vehicles
  'car', 'bicycle', 'airplane', 'boat', 'train',
  // Instruments
  'guitar', 'trumpet',
  // Tools
  'scissors',
  // Buildings
  'house',
];

// ─── Color palette: hex + spoken word always in sync ─────────────────────────
const COLORS = [
  { hex: '#ef4444', name: 'red'    },
  { hex: '#3b82f6', name: 'blue'   },
  { hex: '#22c55e', name: 'green'  },
  { hex: '#f97316', name: 'orange' },
];

const SIZES: ('small' | 'large')[] = ['small', 'large'];
const COUNTS = [2, 3];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const pickExcept = <T>(arr: T[], exclude: T[]): T => {
  const pool = arr.filter(x => !exclude.includes(x));
  return pool[Math.floor(Math.random() * pool.length)];
};
import { shuffle } from "../../../utils/shuffle";

const buildInstruction = (f: LanguageFeature): string => {
  const parts: string[] = [];
  if (f.count && f.count > 1) parts.push(f.count === 2 ? 'two' : 'three');
  if (f.size) parts.push(f.size);
  if (f.colorName) parts.push(f.colorName);
  
  let finalNoun = f.noun;
  if (f.count && f.count > 1) {
    if (finalNoun.endsWith('s') || finalNoun.endsWith('x') || finalNoun.endsWith('z') || finalNoun.endsWith('ch') || finalNoun.endsWith('sh')) {
      finalNoun += 'es';
    } else {
      finalNoun += 's';
    }
  }
  parts.push(finalNoun);
  
  const noun = parts.join(' ');
  // Use "Find X" for count phrases, "Find the X" otherwise
  return f.count && f.count > 1 ? `Find ${noun}` : `Find the ${noun}`;
};

// ─── Level generation ─────────────────────────────────────────────────────────
const generateLevel = () => {
  levelCounter.value++;
  const stat = progressStore.moduleStats[moduleId];
  resetAll(stat.currentPromptLevel);

  const phase = Math.min(stat.currentPhase || 1, 6);
  const distractorCount = Math.max(1, (stat.currentOptionCount || 2) - 1);

  let target: LanguageFeature;
  let distractors: LanguageFeature[] = [];

  if (phase === 1) {
    // ── Phase 1: Noun only ──────────────────────────────────────────────────
    const noun = pick(NOUNS);
    target = { id: 'target', noun, isTarget: true };

    const usedNouns = [noun];
    for (let i = 0; i < distractorCount; i++) {
      const dn = pickExcept(NOUNS, usedNouns);
      distractors.push({ id: `d${i}`, noun: dn });
      usedNouns.push(dn);
    }

  } else if (phase === 2) {
    // ── Phase 2: Size + Noun (multi-cue) ────────────────────────────────────
    const noun = pick(NOUNS);
    const size = pick(SIZES);
    target = { id: 'target', noun, size, isTarget: true };

    // Forced multi-cue distractors
    distractors.push({ id: 'd0', noun, size: size === 'small' ? 'large' : 'small' });          // same noun, wrong size
    if (distractorCount > 1) {
      distractors.push({ id: 'd1', noun: pickExcept(NOUNS, [noun]), size });                    // wrong noun, same size
    }
    for (let i = 2; i < distractorCount; i++) {
      distractors.push({ id: `d${i}`, noun: pickExcept(NOUNS, [noun, distractors[1]?.noun!]), size: pick(SIZES) });
    }

  } else if (phase === 3) {
    // ── Phase 3: Color + Noun (multi-cue) ───────────────────────────────────
    const noun = pick(NOUNS);
    const col = pick(COLORS);
    target = { id: 'target', noun, color: col.hex, colorName: col.name, isTarget: true };

    const otherColors = COLORS.filter(c => c !== col);
    distractors.push({ id: 'd0', noun, color: pick(otherColors).hex, colorName: pick(otherColors).name });  // same noun, wrong color
    if (distractorCount > 1) {
      const altNoun = pickExcept(NOUNS, [noun]);
      distractors.push({ id: 'd1', noun: altNoun, color: col.hex, colorName: col.name });                   // wrong noun, same color
    }
    for (let i = 2; i < distractorCount; i++) {
      const rc = pick(otherColors);
      distractors.push({ id: `d${i}`, noun: pickExcept(NOUNS, [noun]), color: rc.hex, colorName: rc.name });
    }

  } else if (phase === 4) {
    // ── Phase 4: Number + Noun (multi-cue) ──────────────────────────────────
    const noun = pick(NOUNS);
    const count = pick(COUNTS);
    target = { id: 'target', noun, count, isTarget: true };

    const otherCount = count === 2 ? 3 : 2;
    distractors.push({ id: 'd0', noun, count: otherCount });                       // same noun, wrong count
    if (distractorCount > 1) {
      distractors.push({ id: 'd1', noun: pickExcept(NOUNS, [noun]), count });      // wrong noun, same count
    }
    for (let i = 2; i < distractorCount; i++) {
      distractors.push({ id: `d${i}`, noun: pickExcept(NOUNS, [noun]), count: pick(COUNTS) });
    }

  } else if (phase === 5) {
    // ── Phase 5: Size + Color + Noun (triple multi-cue) ─────────────────────
    const noun = pick(NOUNS);
    const size = pick(SIZES);
    const col = pick(COLORS);
    target = { id: 'target', noun, size, color: col.hex, colorName: col.name, isTarget: true };

    const altSize = size === 'small' ? 'large' : 'small';
    const altCol = pick(COLORS.filter(c => c !== col));
    const altNoun = pickExcept(NOUNS, [noun]);

    // Each distractor matches exactly 2/3 features
    distractors.push({ id: 'd0', noun, size: altSize, color: col.hex, colorName: col.name });  // wrong size
    distractors.push({ id: 'd1', noun, size, color: altCol.hex, colorName: altCol.name });      // wrong color
    if (distractorCount > 2) {
      distractors.push({ id: 'd2', noun: altNoun, size, color: col.hex, colorName: col.name }); // wrong noun
    }
    for (let i = 3; i < distractorCount; i++) {
      let d: any;
      let isUnique = false;
      let attempts = 0;
      while(!isUnique && attempts < 50) {
        const wrongFeature = pick(['size', 'color', 'noun']);
        d = { id: `d${i}`, noun, size, color: col.hex, colorName: col.name };
        if (wrongFeature === 'size') {
          d.size = size === 'small' ? 'large' : 'small';
        } else if (wrongFeature === 'color') {
          const rc = pick(COLORS.filter(c => c !== col));
          d.color = rc.hex;
          d.colorName = rc.name;
        } else {
          d.noun = pickExcept(NOUNS, [noun]);
        }
        isUnique = !distractors.some(ex => ex.noun === d.noun && ex.size === d.size && ex.color === d.color);
        attempts++;
      }
      distractors.push(d);
    }

  } else {
    // ── Phase 6: Number + Size + Color + Noun (four-cue — hardest) ──────────
    const noun = pick(NOUNS);
    const size = pick(SIZES);
    const col = pick(COLORS);
    const count = pick(COUNTS);
    target = { id: 'target', noun, size, color: col.hex, colorName: col.name, count, isTarget: true };

    const altSize = size === 'small' ? 'large' : 'small';
    const altCol = pick(COLORS.filter(c => c !== col));
    const altCount = count === 2 ? 3 : 2;
    const altNoun = pickExcept(NOUNS, [noun]);

    // Each distractor matches exactly 3/4 features
    distractors.push({ id: 'd0', noun, size, color: altCol.hex, colorName: altCol.name, count }); // wrong color
    distractors.push({ id: 'd1', noun, size: altSize, color: col.hex, colorName: col.name, count }); // wrong size
    distractors.push({ id: 'd2', noun, size, color: col.hex, colorName: col.name, count: altCount }); // wrong count
    if (distractorCount > 3) {
      distractors.push({ id: 'd3', noun: altNoun, size, color: col.hex, colorName: col.name, count }); // wrong noun
    }
    for (let i = 4; i < distractorCount; i++) {
      let d: any;
      let isUnique = false;
      let attempts = 0;
      while(!isUnique && attempts < 50) {
        const wrongFeature = pick(['size', 'color', 'noun', 'count']);
        d = { id: `d${i}`, noun, size, color: col.hex, colorName: col.name, count };
        if (wrongFeature === 'size') {
          d.size = size === 'small' ? 'large' : 'small';
        } else if (wrongFeature === 'color') {
          const rc = pick(COLORS.filter(c => c !== col));
          d.color = rc.hex;
          d.colorName = rc.name;
        } else if (wrongFeature === 'count') {
          d.count = pick(COUNTS.filter(c => c !== count));
        } else {
          d.noun = pickExcept(NOUNS, [noun]);
        }
        isUnique = !distractors.some(ex => ex.noun === d.noun && ex.size === d.size && ex.color === d.color && ex.count === d.count);
        attempts++;
      }
      distractors.push(d);
    }
  }

  const instruction = buildInstruction(target);

  config.value = {
    moduleId,
    tier: 1,
    currentPhase: phase,
    optionCount: distractors.length + 1,
    instructionText: instruction,
    phase,
    targetObject: target,
    distractorObjects: distractors,
    targetFeatures: { noun: target.noun },
    distractors: distractors.map(d => ({ noun: d.noun }))
  };

  options.value = shuffle([target, ...distractors]);

  if (config.value) {
    gameStore.initializeGame(config.value);
  }
};

// ─── Lifecycle ────────────────────────────────────────────────────────────────
const handleStart = () => {
  log.lifecycle('started');
  hasStarted.value = true;
  generateLevel();
  if (config.value) {
    log.audio(config.value.instructionText);
    playInstruction(config.value.instructionText);
  }
};

const replayAudio = () => {
  if (config.value) {
    log.audio(`[replay] ${config.value.instructionText}`);
    playInstruction(config.value.instructionText);
  }
};

const handleSuccess = () => {
  log.success('target', { instruction: config.value?.instructionText, phase: config.value?.phase });
  gameStore.handleSuccess();
  progressStore.updateStats(moduleId, true);

  const encouragements = ['Great job!', 'Awesome!', 'You got it!', 'Perfect!', 'Way to go!'];
  playInstruction(pick(encouragements));

  safeSetTimeout(() => {
    if (gameStore.isRandomMode) { if (!gameStore.advanceRandomRound()) generateLevel(); } else { generateLevel(); }
    replayAudio();
  }, 2000);
};

const handleError = () => {
  log.error('wrong-drop', { instruction: config.value?.instructionText, promptLevel: currentLevel.value });
  gameStore.handleError();
  progressStore.updateStats(moduleId, false);
  registerError();

  playInstruction('Oops, try again!');
  safeSetTimeout(() => { replayAudio(); }, 1500);
};

onUnmounted(() => {
  log.lifecycle('unmounted');
  stopSpeech();
});

// ─── Computed helpers for template ───────────────────────────────────────────
// Build an array of 1..count for v-for repeat rendering
const countArray = (n: number | undefined) => Array.from({ length: n ?? 1 });

onMounted(() => {
  // In Random Mode, bypass the start screen and begin immediately
  if (gameStore.isRandomMode) handleStart();
});
</script>

<template>
  <div class="language-game">

    <!-- ── Start Screen ──────────────────────────────────────────────────── -->
    <div v-if="!hasStarted" class="start-screen">
      <div class="start-icon"><MenuIcon :gameId="moduleId" style="width: 140px; height: 140px;" /></div>
      <h1>Language Comprehension<br><span>Vocabulary</span></h1>
      <p class="start-sub">Listen to the instruction and drag the correct object to the hand.</p>
      <button @click="handleStart" class="start-btn">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        Play Instruction &amp; Start
      </button>
      <p v-if="!isSupported" class="error-msg">Speech Synthesis is not supported in this browser.</p>
    </div>

    <!-- ── Game Board ─────────────────────────────────────────────────────── -->
    <div v-else class="game-board">

      <!-- Listening pill -->
      <div v-if="isPlaying" class="listening-mini">
        <svg class="speaker-mini" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
        <span>Listening...</span>
      </div>

      <div class="action-layout">

        <!-- Top bar -->
        <header class="top-bar">
          <div class="phase-badge">Phase {{ config?.phase }}</div>
          <button class="replay-btn" @click="replayAudio">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
            Replay
          </button>
        </header>

        <!-- Target area: instruction banner + drop zone -->
        <div class="target-section">

          <!-- Instruction banner -->
          <div class="instruction-banner" v-if="config">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
            <span class="instruction-text">{{ config.instructionText }}</span>
          </div>

          <!-- Drop zone (the "hand") -->
          <div
            class="target-zone"
            data-target="true"
            :class="{ 'prompt-partial-zone': currentLevel === 'partial' }"
          >
            <!-- Open hand SVG -->
            <svg class="hand-svg" viewBox="0 0 120 140" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M60 130 C30 130 15 110 15 90 L15 50 C15 44 20 40 26 40 C32 40 37 44 37 50 L37 60 C37 54 42 50 48 50 C54 50 59 54 59 60 L59 58 C59 52 64 48 70 48 C76 48 81 52 81 58 L81 62 C81 56 86 52 92 52 C98 52 103 56 103 62 L103 90 C103 110 90 130 60 130 Z" stroke="rgba(255,255,255,0.4)" stroke-width="3" fill="rgba(255,255,255,0.08)"/>
              <text x="60" y="108" text-anchor="middle" font-size="11" fill="rgba(255,255,255,0.4)" font-family="sans-serif">Drop Here</text>
            </svg>
          </div>

        </div>

        <!-- Options row -->
        <div class="options-container">
          <div
            class="piece-wrapper"
            v-for="opt in options"
            :key="`${levelCounter}-${opt.id}`"
          >
            <PuzzlePiece
              :id="opt.id"
              :isTarget="!!opt.isTarget"
              :transparent="true"
              dropZoneSelector=".target-zone"
              :validateDrop="() => !!opt.isTarget"
              @success="handleSuccess"
              @error="handleError"
              :class="{ 'prompt-full': currentLevel === 'full' && opt.isTarget }"
              style="width: 100%; height: 100%;"
            >
              <!-- Card contents: count × asset instances -->
              <div class="option-card" :class="{ 'card-multi': (opt.count ?? 1) > 1 }">
                <div
                  v-for="(_, i) in countArray(opt.count)"
                  :key="i"
                  class="asset-instance"
                >
                  <AssetLibrary
                    :name="opt.noun"
                    :color="opt.color || '#94a3b8'"
                    :size="opt.size ?? 'medium'"
                  />
                </div>
                <!-- Count badge for number phases -->
                <div v-if="opt.count && opt.count > 1" class="count-badge">
                  × {{ opt.count }}
                </div>
              </div>
            </PuzzlePiece>
            <PointingHand v-if="currentLevel === 'full' && opt.isTarget" />
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.language-game {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  overflow: hidden;
}

/* ── Start screen ─────────────────────────────────────────────────────────── */
.start-screen { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1.5rem; padding: 3rem; }
.start-icon { font-size: 6rem; }
.start-screen h1 { font-size: 3.5rem; font-weight: 900; color: var(--text-primary); text-align: center; line-height: 1.15; }
.start-screen h1 span { color: var(--color-blue); }
.start-sub { font-size: 1.4rem; color: var(--text-secondary); text-align: center; max-width: 600px; }
.start-btn { display: flex; align-items: center; gap: 0.75rem; font-size: 1.75rem; font-weight: 700; padding: 1.25rem 3rem; background: var(--color-blue); color: white; border: none; border-radius: 50px; cursor: pointer; box-shadow: 0 8px 24px rgba(59,130,246,0.4); transition: transform 0.15s, box-shadow 0.15s; }
.start-btn:active { transform: scale(0.96); box-shadow: none; }
.error-msg { color: var(--color-red); font-weight: bold; font-size: 1.25rem; }

/* ── Game board ───────────────────────────────────────────────────────────── */
.game-board { flex: 1; display: flex; flex-direction: column; position: relative; overflow: hidden; }

/* Listening pill */
.listening-mini { position: absolute; top: 1rem; left: 50%; transform: translateX(-50%); z-index: 100; display: flex; align-items: center; gap: 0.75rem; background: var(--color-blue); color: white; padding: 0.5rem 1.25rem; border-radius: 50px; box-shadow: 0 4px 15px rgba(0,0,0,0.3); pointer-events: none; animation: slide-down 0.3s ease-out; }
.speaker-mini { width: 20px; height: 20px; }
.listening-mini span { font-weight: 700; font-size: 1.1rem; }
@keyframes slide-down { from { transform: translate(-50%, -20px); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }

/* ── Layout ───────────────────────────────────────────────────────────────── */
.action-layout { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
.top-bar { display: flex; align-items: center; justify-content: space-between; padding: 1rem 2rem; background: var(--bg-secondary); border-bottom: 2px solid rgba(255,255,255,0.07); gap: 1rem; flex-shrink: 0; }
.phase-badge { font-size: 1.1rem; font-weight: 700; color: var(--text-secondary); }
.replay-btn { display: flex; align-items: center; gap: 0.5rem; font-size: 1.1rem; font-weight: 700; padding: 0.75rem 1.75rem; background: var(--color-orange); color: white; border: none; border-radius: 50px; cursor: pointer; box-shadow: 0 4px 12px rgba(249,115,22,0.35); transition: transform 0.15s; }
.replay-btn:active { transform: scale(0.95); }

/* ── Target section ───────────────────────────────────────────────────────── */
.target-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  background: linear-gradient(160deg, var(--bg-secondary) 0%, var(--bg-primary) 100%);
  border-bottom: 2px solid rgba(255,255,255,0.07);
  padding: 2rem;
}

/* Instruction banner */
.instruction-banner {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(59, 130, 246, 0.15);
  border: 2px solid rgba(59, 130, 246, 0.35);
  border-radius: 50px;
  padding: 0.75rem 2rem;
  color: var(--text-primary);
}
.instruction-text {
  font-size: 1.8rem;
  font-weight: 800;
  letter-spacing: 0.01em;
}

/* Drop zone */
.target-zone {
  width: 260px;
  height: 200px;
  border: 4px dashed rgba(255,255,255,0.2);
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255,255,255,0.04);
  transition: all 0.3s;
}
.hand-svg { width: 140px; height: 140px; }

@keyframes pulse-zone {
  0%, 100% { box-shadow: 0 0 0 0 transparent; border-color: rgba(255,255,255,0.2); }
  50% { box-shadow: 0 0 25px 6px rgba(59, 130, 246, 0.4); border-color: var(--color-blue); }
}
.prompt-partial-zone { animation: pulse-zone 2s infinite; }

/* ── Options ──────────────────────────────────────────────────────────────── */
.options-container {
  flex: 1;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  padding: 1.5rem 2rem;
  background: var(--bg-primary);
  gap: 1.5rem;
  flex-wrap: wrap;
}

.piece-wrapper { position: relative; }

/* Card: the draggable visual unit */
.option-card {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
  padding: 1rem;
  background-color: rgba(255, 255, 255, 0.9);
  border: 3px solid rgba(255,255,255,0.1);
  border-radius: 20px;
  min-width: 140px;
  min-height: 140px;
  position: relative;
  box-shadow: 0 6px 20px rgba(0,0,0,0.25);
  transition: transform 0.15s, box-shadow 0.15s;
}

.option-card.card-multi {
  min-width: 200px;
  gap: 12px;
  padding: 1rem 1.25rem;
}

.asset-instance {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Count badge for number phases */
.count-badge {
  position: absolute;
  bottom: -10px;
  right: -10px;
  background: var(--color-blue);
  color: white;
  font-size: 1rem;
  font-weight: 800;
  padding: 0.2rem 0.6rem;
  border-radius: 50px;
  border: 3px solid var(--bg-primary);
  z-index: 2;
}

/* ABA prompt: flash full */
@keyframes flash-full {
  0%, 100% { transform: scale(1); filter: brightness(1); }
  50% { transform: scale(1.06); filter: brightness(1.2) drop-shadow(0 0 14px #f1c40f); }
}
.prompt-full { animation: flash-full 1.5s infinite; z-index: 50; }
</style>
