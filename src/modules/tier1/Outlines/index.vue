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
import PointingHand from '../../../components/prompts/PointingHand.vue';
import AssetLibrary from '../../../components/game/AssetLibrary.vue';
import type { OutlinesLevelConfig, OutlinesFeature, VocabularyNoun } from '../../../types';

const moduleId = 'tier1-outlines';
const progressStore = useProgressStore();
const gameStore = useGameStore();
const { playInstruction, isPlaying } = useSpeech();
const { currentLevel, registerError, resetAll } = usePromptFading(progressStore.moduleStats[moduleId].currentPromptLevel);
const log = useLogger(moduleId);
const { safeSetTimeout } = useSafeTimeout();

const config = ref<OutlinesLevelConfig | null>(null);
const options = ref<OutlinesFeature[]>([]);
const targets = ref<OutlinesFeature[]>([]);   // all target silhouettes shown at once
const filledZones = ref<Set<string>>(new Set()); // ids of completed target zones
const levelCounter = ref(0);
const hasStarted = ref(false);

const handleStart = () => {
  hasStarted.value = true;
  generateLevel();
};

// ─── Vocabulary pools by semantic category ────────────────────────────────────
const ANIMALS: VocabularyNoun[]    = ['dog', 'cat', 'bird', 'rabbit', 'fish'];
const FURNITURE: VocabularyNoun[]  = ['table', 'chair', 'couch', 'bed', 'lamp'];
const FOOD: VocabularyNoun[]       = ['apple', 'banana'];
const NATURE: VocabularyNoun[]     = ['tree', 'flower', 'sun', 'cloud', 'moon', 'star'];
const INSTRUMENTS: VocabularyNoun[]= ['guitar', 'trumpet'];
const CLOTHING: VocabularyNoun[]   = ['shirt', 'pants', 'socks', 'hat', 'shoes'];
const VEHICLES: VocabularyNoun[]   = ['car', 'car-sedan', 'car-truck', 'car-tractor', 'bicycle', 'airplane', 'boat', 'train'];
const HOME_TECH: VocabularyNoun[]  = ['television', 'computer', 'phone', 'lamp', 'clock'];


// Phase 1: maximally distinct shapes — one from each category
const PHASE1_POOL: VocabularyNoun[] = [
  'dog', 'cup', 'ball', 'car', 'book', 'table', 'chair', 'couch', 'slide', 'bed',
  'apple', 'tree', 'star', 'moon', 'sun', 'cloud', 'flower', 'key', 'scissors',
  'guitar', 'trumpet', 'clock', 'lamp', 'television', 'computer', 'phone',
  'shoes', 'hat', 'shirt', 'pants', 'socks', 'bicycle', 'airplane', 'boat', 'train',
  'cat', 'bird', 'rabbit', 'fish', 'banana',
];

// Phase 2: semantically similar — grouped, pick from same category for subtle discrimination
const SIMILAR_GROUPS: VocabularyNoun[][] = [
  ANIMALS,
  FURNITURE,
  FOOD,
  NATURE,
  VEHICLES,
  CLOTHING,
  INSTRUMENTS,
  HOME_TECH,
];

const COLORS = ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6', '#e67e22', '#1abc9c', '#e91e63'];

const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
import { shuffle } from '../../../utils/shuffle';
const pickN = <T>(arr: T[], n: number): T[] => shuffle([...arr]).slice(0, n);

// ─── Level generation ─────────────────────────────────────────────────────────
const generateLevel = () => {
  levelCounter.value++;
  resetAll();
  filledZones.value.clear();

  const stat = progressStore.moduleStats[moduleId];
  const span = stat.currentPhase || 1;
  const optionCount = Math.max(2, stat.currentOptionCount);

  // Phase mapping:
  // Phase 1 (span 1-2): Single target, maximally distinct shapes
  // Phase 2 (span 3-4): Single target, semantically similar distractors (same category)
  // Phase 3 (span 5+): Multi-target — ALL slots visible at once, match each to its hole
  const phase = span <= 2 ? 1 : span <= 4 ? 2 : 3;

  let chosenNouns: VocabularyNoun[];
  let targetNouns: VocabularyNoun[];
  let numTargets: number;

  if (phase === 1) {
    // Single target, maximally distinct distractors
    numTargets = 1;
    chosenNouns = pickN(PHASE1_POOL, optionCount);
    targetNouns = [chosenNouns[0]];

  } else if (phase === 2) {
    // Single target, distractors from the same semantic category (subtle)
    numTargets = 1;
    const group = pick(SIMILAR_GROUPS.filter(g => g.length >= Math.min(optionCount, 4)));
    const fromGroup = pickN(group, Math.min(optionCount, group.length));
    // Pad with phase1 pool if group is too small
    const padded = [...fromGroup];
    while (padded.length < optionCount) {
      const extra = pick(PHASE1_POOL.filter(n => !padded.includes(n)));
      padded.push(extra);
    }
    chosenNouns = padded.slice(0, optionCount);
    targetNouns = [chosenNouns[0]];

  } else {
    // Phase 3: Multi-target — number of simultaneous targets scales up to 4
    numTargets = Math.min(Math.max(2, optionCount), 4);
    // Mix items from similar categories so some look alike
    const group = pick(SIMILAR_GROUPS.filter(g => g.length >= numTargets));
    const groupItems = pickN(group, Math.min(numTargets, group.length));
    const remaining = pickN(
      PHASE1_POOL.filter(n => !groupItems.includes(n)),
      numTargets - groupItems.length
    );
    targetNouns = [...groupItems, ...remaining].slice(0, numTargets);
    // All targets ARE the options — no extra distractors (matching all is hard enough)
    chosenNouns = shuffle([...targetNouns]);
  }

  const targetColor = pick(COLORS);

  // Build target objects
  const targetObjs: OutlinesFeature[] = targetNouns.map((noun, i) => ({
    id: `target-${i}`,
    noun,
    color: phase === 3 ? COLORS[i % COLORS.length] : targetColor,
    isTarget: true,
    rotation: 0,
  }));

  // Build distractor objects (only for phases 1 & 2)
  const distractorObjs: OutlinesFeature[] = [];
  if (phase < 3) {
    for (let i = 1; i < chosenNouns.length; i++) {
      distractorObjs.push({
        id: `distractor-${i}`,
        noun: chosenNouns[i],
        color: pick(COLORS),
        isTarget: false,
        rotation: 0,
      });
    }
  }

  targets.value = targetObjs;
  // Options = targets (colored) + distractors, shuffled
  options.value = shuffle([...targetObjs.map(t => ({ ...t, id: `opt-${t.id}` })), ...distractorObjs]);

  config.value = {
    moduleId,
    tier: 1,
    currentPhase: span,
    optionCount: options.value.length,
    instructionText: numTargets > 1
      ? 'Match each shape to its outline.'
      : 'Match the shape to its outline.',
    phase,
    targetObjects: targetObjs,
    distractorObjects: distractorObjs,
    targetFeatures: { noun: targetNouns[0] },
    distractors: distractorObjs.map(d => ({ noun: d.noun }))
  };

  log.generate({ phase, span, targetNouns, optionCount: options.value.length });
  gameStore.initializeGame(config.value);
  safeSetTimeout(() => {
    log.audio(config.value!.instructionText);
    playInstruction(config.value!.instructionText);
  }, 500);
};

onMounted(() => { log.lifecycle('mounted'); });

// ─── Validation ───────────────────────────────────────────────────────────────
// For multi-target: a draggable piece matches if its noun equals the zone's noun
const validateDrop = (draggedId: string, zoneEl: HTMLElement): boolean => {
  const targetZone = zoneEl.closest('[data-noun]') as HTMLElement | null;
  const zoneNoun = targetZone?.dataset.noun;
  // Find the option's noun
  const opt = options.value.find(o => o.id === draggedId);
  if (!opt || !zoneNoun) return false;
  return opt.noun === zoneNoun;
};

// ─── Handlers ─────────────────────────────────────────────────────────────────
const handleSuccess = (draggedId: string, zoneEl?: HTMLElement) => {
  if (!config.value) return;

  if (config.value.phase < 3) {
    // Single-target: any success completes the level
    log.success(draggedId, { phase: config.value.phase });
    gameStore.handleSuccess();
    progressStore.updateStats(moduleId, true);
    const praises = ['Great job!', 'Awesome!', 'You did it!', 'Perfect match!'];
    playInstruction(pick(praises));
    safeSetTimeout(() => { generateLevel(); }, 2000);
  } else {
    // Multi-target: mark this zone filled, check if all done
    const zoneId = zoneEl?.dataset?.zoneId || draggedId;
    filledZones.value.add(zoneId);
    // Hide the placed piece from the options row
    options.value = options.value.filter(o => o.id !== draggedId);

    if (filledZones.value.size >= targets.value.length) {
      log.success('all-targets', { phase: config.value.phase });
      gameStore.handleSuccess();
      progressStore.updateStats(moduleId, true);
      const praises = ['Amazing!', 'All matched!', 'You got them all!'];
      playInstruction(pick(praises));
      safeSetTimeout(() => { generateLevel(); }, 2500);
    } else {
      playInstruction('Good! Keep going!');
    }
  }
};

const handleError = () => {
  log.error('wrong-drop', { phase: config.value?.phase, promptLevel: currentLevel.value });
  gameStore.handleError();
  progressStore.updateStats(moduleId, false);
  registerError();
  playInstruction('Oops, try again!');
  safeSetTimeout(() => { if (config.value) playInstruction(config.value.instructionText); }, 1500);
};

const playHint = () => {
  if (config.value) playInstruction(config.value.instructionText);
};
</script>

<template>
  <div class="outlines-module">

    <!-- ── Start Screen ──────────────────────────────────────────────────── -->
    <div v-if="!hasStarted" class="start-screen">
      <div class="start-icon"><MenuIcon :gameId="moduleId" style="width: 140px; height: 140px;" /></div>
      <h1>Outlines<br><span>Shape Matching</span></h1>
      <p class="start-sub">Drag each shape to its matching silhouette.</p>
      <button @click="handleStart" class="start-btn">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        Start
      </button>
    </div>

    <!-- ── Game Board ─────────────────────────────────────────────────────── -->
    <div v-else-if="config" class="game-board">

      <!-- Listening pill -->
      <div v-if="isPlaying" class="listening-mini">
        <svg class="speaker-mini" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
        <span>Listening...</span>
      </div>

      <div class="action-layout">

        <!-- Top bar -->
        <header class="top-bar">
          <div class="phase-badge">Phase {{ config.phase }}</div>
          <button class="replay-btn" @click="playHint">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
            Replay
          </button>
        </header>

        <!-- Split screen -->
        <div class="split-screen">

          <!-- Left: silhouette zone(s) -->
          <div class="left-board target-board">
            <div
              class="silhouettes-grid"
              :class="`targets-${targets.length}`"
            >
              <div
                v-for="tgt in targets"
                :key="tgt.id"
                class="target-silhouette-zone"
                :data-target-id="tgt.id"
                :data-noun="tgt.noun"
                :data-zone-id="tgt.id"
                :class="{
                  'prompt-partial-zone': currentLevel === 'partial' && !filledZones.has(tgt.id),
                  'zone-filled': filledZones.has(tgt.id),
                }"
              >
                <AssetLibrary
                  v-if="!filledZones.has(tgt.id)"
                  :name="tgt.noun"
                  :isSilhouette="true"
                  :size="targets.length > 2 ? 'small' : 'large'"
                  :style="tgt.rotation ? { transform: `rotate(${tgt.rotation}deg)` } : {}"
                />
                <!-- Checkmark when filled -->
                <div v-else class="zone-check">✓</div>
              </div>
            </div>
          </div>

          <!-- Right: draggable options -->
          <div class="right-board options-board">
            <div
              class="piece-wrapper"
              v-for="opt in options"
              :key="`${levelCounter}-${opt.id}`"
            >
              <PuzzlePiece
                :id="opt.id"
                :transparent="true"
                dropZoneSelector=".target-silhouette-zone"
                :validateDrop="(el) => validateDrop(opt.id, el)"
                @success="(id, el) => handleSuccess(id, el)"
                @error="handleError"
                :class="{ 'prompt-full': currentLevel === 'full' && opt.isTarget }"
              >
                <div class="option-card">
                  <AssetLibrary
                    :name="opt.noun"
                    :color="opt.color"
                    :size="options.length > 4 ? 'small' : 'medium'"
                    :style="opt.rotation ? { transform: `rotate(${opt.rotation}deg)` } : {}"
                  />
                  <!-- Noun label helps identification -->
                  <span class="noun-label">{{ opt.noun }}</span>
                </div>
              </PuzzlePiece>
              <PointingHand v-if="currentLevel === 'full' && opt.isTarget" />
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.outlines-module {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-primary);
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

.split-screen {
  flex: 1;
  display: flex;
  flex-direction: row;
  overflow: hidden;
}

/* ── Left board: silhouettes ──────────────────────────────────────────────── */
.left-board {
  flex: 1;
  background-color: var(--bg-primary);
  background-image: radial-gradient(#d1d8df 1px, transparent 1px);
  background-size: 20px 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-right: 4px solid rgba(255, 255, 255, 0.1);
  padding: 1.5rem;
}

/* Grid layout adapts to number of targets */
.silhouettes-grid {
  display: grid;
  gap: 1.5rem;
  width: 100%;
  height: 100%;
  place-items: center;
}
.silhouettes-grid.targets-1 { grid-template-columns: 1fr; }
.silhouettes-grid.targets-2 { grid-template-columns: 1fr 1fr; }
.silhouettes-grid.targets-3 { grid-template-columns: 1fr 1fr 1fr; }
.silhouettes-grid.targets-4 { grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; }

.target-silhouette-zone {
  width: 200px;
  height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 20px;
  border: 4px dashed rgba(0,0,0,0.12);
  background: rgba(255,255,255,0.5);
  transition: all 0.3s;
  position: relative;
}

/* Scale down for multi-target layouts */
.targets-3 .target-silhouette-zone,
.targets-4 .target-silhouette-zone {
  width: 150px;
  height: 150px;
}

.zone-filled {
  border-color: #22c55e;
  background: rgba(34, 197, 94, 0.12);
}
.zone-check {
  font-size: 4rem;
  color: #22c55e;
  font-weight: 900;
}

@keyframes pulse-zone {
  0%, 100% { box-shadow: 0 0 0 0 transparent; border-color: rgba(0,0,0,0.12); }
  50% { box-shadow: 0 0 30px 10px rgba(59,130,246,0.4); border-color: var(--color-blue); }
}
.prompt-partial-zone { animation: pulse-zone 2s infinite; }

/* ── Right board: options ─────────────────────────────────────────────────── */
.right-board {
  flex: 1;
  background: var(--bg-secondary);
  display: flex;
  flex-wrap: wrap;
  justify-content: space-evenly;
  align-items: center;
  align-content: space-around;
  padding: 1.5rem;
  gap: 0.5rem;
}

.piece-wrapper { position: relative; }

.option-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.75rem;
  background: var(--bg-secondary);
  border: 3px solid #e2e8f0;
  border-radius: 18px;
  box-shadow: 0 6px 18px rgba(0,0,0,0.08);
  transition: transform 0.15s;
}

.noun-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: #334155;
  text-transform: capitalize;
  letter-spacing: 0.02em;
}

/* ABA prompts */
@keyframes flash-full {
  0%, 100% { transform: scale(1); filter: brightness(1); }
  50% { transform: scale(1.06); filter: brightness(1.2) drop-shadow(0 0 14px #f1c40f); }
}
.prompt-full { animation: flash-full 1.5s infinite; z-index: 50; }
</style>