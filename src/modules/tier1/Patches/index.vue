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
import SvgSceneGenerator, { type SceneTheme } from '../../../components/game/SvgSceneGenerator.vue';
import type { PatchesLevelConfig, PatchFeature, PatternType } from '../../../types';

const moduleId = 'tier1-patches';
const progressStore = useProgressStore();
const gameStore = useGameStore();
const { playInstruction, isPlaying } = useSpeech();
const { currentLevel, registerError, resetAll } = usePromptFading(progressStore.moduleStats[moduleId].currentPromptLevel);
const log = useLogger(moduleId);
const { safeSetTimeout } = useSafeTimeout();

const config = ref<PatchesLevelConfig | null>(null);
const options = ref<{ patch: PatchFeature, theme: SceneTheme, isTarget: boolean }[]>([]);
const baseTheme = ref<SceneTheme | null>(null);
const completedHoles = ref<Set<string>>(new Set());
const levelCounter = ref(0);
const hasStarted = ref(false);

const handleStart = () => {
  hasStarted.value = true;
  generateLevel();
};

const COLORS = ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6', '#e67e22'];
const PATTERNS: PatternType[] = ['solid', 'stripes', 'polka-dots', 'checkerboard'];

const BALLOON_HOLES = [
  { id: 'h1', cx: 200, cy: 90,  radius: 40, part: 'primary' },
  { id: 'h2', cx: 200, cy: 190, radius: 30, part: 'secondary' },
  { id: 'h3', cx: 200, cy: 320, radius: 18, part: 'tertiary' },
  { id: 'h4', cx: 185, cy: 302, radius: 10, part: 'accent' },
];

const HOUSE_HOLES = [
  { id: 'h1', cx: 200, cy: 120, radius: 40, part: 'secondary' },
  { id: 'h2', cx: 140, cy: 220, radius: 20, part: 'accent' },
  { id: 'h3', cx: 200, cy: 290, radius: 25, part: 'tertiary' },
  { id: 'h4', cx: 250, cy: 220, radius: 30, part: 'primary' },
];

const ROCKET_HOLES = [
  { id: 'h1', cx: 200, cy: 82,  radius: 32, part: 'secondary' },  // nose cone
  { id: 'h2', cx: 200, cy: 185, radius: 25, part: 'accent' },     // window
  { id: 'h3', cx: 200, cy: 250, radius: 28, part: 'primary' },    // body mid
  { id: 'h4', cx: 152, cy: 295, radius: 18, part: 'tertiary' },   // left fin
];

const FISH_HOLES = [
  { id: 'h1', cx: 200, cy: 200, radius: 45, part: 'primary' },    // body
  { id: 'h2', cx: 344, cy: 200, radius: 30, part: 'secondary' },  // tail
  { id: 'h3', cx: 145, cy: 160, radius: 22, part: 'tertiary' },   // stripe area
  { id: 'h4', cx: 110, cy: 185, radius: 22, part: 'accent' },     // eye ring
];

const BUTTERFLY_HOLES = [
  { id: 'h1', cx: 145, cy: 155, radius: 40, part: 'primary' },    // left upper wing
  { id: 'h2', cx: 255, cy: 155, radius: 40, part: 'primary' },    // right upper wing
  { id: 'h3', cx: 155, cy: 145, radius: 25, part: 'accent' },     // left wing spot
  { id: 'h4', cx: 148, cy: 245, radius: 20, part: 'tertiary' },   // left lower wing spot
];

const ROBOT_HOLES = [
  { id: 'h1', cx: 200, cy: 95,  radius: 40, part: 'primary' },    // head
  { id: 'h2', cx: 172, cy: 77,  radius: 17, part: 'accent' },     // left eye
  { id: 'h3', cx: 200, cy: 235, radius: 38, part: 'secondary' },  // chest panel area
  { id: 'h4', cx: 175, cy: 210, radius: 15, part: 'tertiary' },   // chest circle
];

const TRAIN_HOLES = [
  { id: 'h1', cx: 160, cy: 262, radius: 38, part: 'primary' },    // engine body
  { id: 'h2', cx: 255, cy: 222, radius: 32, part: 'secondary' },  // cab
  { id: 'h3', cx: 248, cy: 207, radius: 22, part: 'accent' },     // cab window
  { id: 'h4', cx: 80,  cy: 260, radius: 30, part: 'tertiary' },   // boiler front
];

const FLOWER_HOLES = [
  { id: 'h1', cx: 200, cy: 200, radius: 45, part: 'secondary' },  // flower center
  { id: 'h2', cx: 200, cy: 200, radius: 30, part: 'tertiary' },   // inner center
  { id: 'h3', cx: 200, cy: 130, radius: 30, part: 'primary' },    // top petal
  { id: 'h4', cx: 270, cy: 200, radius: 22, part: 'accent' },     // right petal spot
];

const ALL_SCENES: { type: PatchesLevelConfig['sceneType']; holes: typeof BALLOON_HOLES }[] = [
  { type: 'balloon',   holes: BALLOON_HOLES },
  { type: 'house',     holes: HOUSE_HOLES },
  { type: 'rocket',    holes: ROCKET_HOLES },
  { type: 'fish',      holes: FISH_HOLES },
  { type: 'butterfly', holes: BUTTERFLY_HOLES },
  { type: 'robot',     holes: ROBOT_HOLES },
  { type: 'train',     holes: TRAIN_HOLES },
  { type: 'flower',    holes: FLOWER_HOLES },
];

const getRandomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const shuffle = <T>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

const generateTheme = (phase: number): SceneTheme => {
  const t: any = {};
  const usedColors: string[] = [];
  ['primary', 'secondary', 'tertiary', 'accent'].forEach(part => {
    // Try to give each part a unique color for maximum visual discrimination
    const availableColors = COLORS.filter(c => !usedColors.includes(c));
    const color = getRandomItem(availableColors.length > 0 ? availableColors : COLORS);
    usedColors.push(color);
    t[part] = {
      color,
      pattern: phase === 1 ? 'solid' : getRandomItem(PATTERNS)
    };
  });
  return t as SceneTheme;
};

const generateLevel = () => {
  levelCounter.value++;
  completedHoles.value.clear();

  const stat = progressStore.moduleStats[moduleId];
  resetAll(stat?.currentPromptLevel);

  const span = stat.currentPhase || 1;
  const phase = span <= 2 ? 1 : span <= 4 ? 2 : 3;

  // Phase 1: 1-2 holes, solid colors, 1 distractor each
  // Phase 2: 2-3 holes, patterns introduced, 1-2 distractors each (color OR pattern)
  // Phase 3: ALL holes, patterns required, 2 distractors each (color AND pattern near-misses)
  const sceneEntry = getRandomItem(ALL_SCENES);
  const sceneType = sceneEntry.type;
  const availableHoles = sceneEntry.holes;

  let numHoles: number;
  if (phase === 1) {
    numHoles = Math.min(2, availableHoles.length);
  } else if (phase === 2) {
    numHoles = Math.min(3, availableHoles.length);
  } else {
    numHoles = availableHoles.length; // All 4 holes
  }

  const targetHolesData = shuffle([...availableHoles]).slice(0, numHoles);
  const theme = generateTheme(phase);
  baseTheme.value = theme;

  const targetPatches: PatchFeature[] = targetHolesData.map(h => ({
    id: h.id,
    cx: h.cx,
    cy: h.cy,
    radius: h.radius,
    color: theme[h.part as keyof SceneTheme].color,
    pattern: theme[h.part as keyof SceneTheme].pattern,
  }));

  // Distractor generation — one distractor per target hole, guaranteed unique
  const distractorPatches: PatchFeature[] = [];
  const distractorThemes: SceneTheme[] = [];

  targetPatches.forEach((tPatch, i) => {
    const holeData = targetHolesData[i];
    const part = holeData.part as keyof SceneTheme;
    const dTheme = JSON.parse(JSON.stringify(theme)) as SceneTheme;

    if (phase === 1) {
      // Only color differs
      dTheme[part].color = getRandomItem(COLORS.filter(c => c !== theme[part].color));
    } else if (phase === 2) {
      // Either color OR pattern differs (50/50)
      if (Math.random() > 0.5) {
        dTheme[part].color = getRandomItem(COLORS.filter(c => c !== theme[part].color));
      } else {
        dTheme[part].pattern = getRandomItem(PATTERNS.filter(p => p !== theme[part].pattern));
      }
    } else {
      // Phase 3: Two distractors per target — one wrong color, one wrong pattern
      // First distractor: wrong color, correct pattern
      dTheme[part].color = getRandomItem(COLORS.filter(c => c !== theme[part].color));
      distractorPatches.push({
        ...tPatch,
        id: `distractor-${i}-a`,
        color: dTheme[part].color,
        pattern: theme[part].pattern,
      });
      distractorThemes.push(JSON.parse(JSON.stringify(dTheme)));

      // Second distractor: correct color, wrong pattern
      const dTheme2 = JSON.parse(JSON.stringify(theme)) as SceneTheme;
      dTheme2[part].pattern = getRandomItem(PATTERNS.filter(p => p !== theme[part].pattern));
      distractorPatches.push({
        ...tPatch,
        id: `distractor-${i}-b`,
        color: theme[part].color,
        pattern: dTheme2[part].pattern,
      });
      distractorThemes.push(dTheme2);
      return; // Skip the generic push below for phase 3
    }

    distractorPatches.push({
      ...tPatch,
      id: `distractor-${i}`,
      color: dTheme[part].color,
      pattern: dTheme[part].pattern,
    });
    distractorThemes.push(dTheme);
  });

  const allOptions = [
    ...targetPatches.map(p => ({ patch: p, theme, isTarget: true })),
    ...distractorPatches.map((p, i) => ({ patch: p, theme: distractorThemes[i], isTarget: false }))
  ];

  options.value = shuffle(allOptions);

  config.value = {
    moduleId,
    tier: 1,
    currentPhase: span,
    optionCount: allOptions.length,
    instructionText: numHoles > 1
      ? `Put the ${numHoles} patches in the missing holes.`
      : 'Put the patch in the missing hole.',
    phase,
    sceneType,
    targetPatches,
    distractorPatches,
    targetFeatures: { count: targetPatches.length.toString() },
    distractors: distractorPatches.map(d => ({ color: d.color }))
  };

  log.generate({ phase, span, sceneType, numHoles, targetCount: targetPatches.length, optionCount: allOptions.length });
  gameStore.initializeGame(config.value!);
  safeSetTimeout(() => {
    log.audio(config.value!.instructionText);
    playInstruction(config.value!.instructionText);
  }, 500);
};

onMounted(() => {
  log.lifecycle('mounted');
});

const handleSuccess = (holeId: string) => {
  completedHoles.value.add(holeId);
  options.value = options.value.filter(o => o.patch.id !== holeId);
  log.success(holeId, { phase: config.value?.phase, filled: completedHoles.value.size, total: config.value?.targetPatches.length });
  
  if (completedHoles.value.size >= config.value!.targetPatches.length) {
    gameStore.handleSuccess();
    progressStore.updateStats(moduleId, true);
    log.info('All holes filled — level complete', { phase: config.value?.phase, sceneType: config.value?.sceneType });
    const praises = ['Great job!', 'Awesome!', 'Perfect fit!'];
    playInstruction(getRandomItem(praises));
    safeSetTimeout(() => { generateLevel(); }, 2000);
  } else {
    playInstruction('Good!');
    resetAll();
  }
};

const handleError = (holeId: string) => {
  log.error(holeId, { phase: config.value?.phase, promptLevel: currentLevel.value });
  gameStore.handleError();
  progressStore.updateStats(moduleId, false);
  registerError();
  playInstruction('Oops, check the shape and pattern!');
};



const validateDrop = (target: HTMLElement, piece: any) => {
  // target is the SVG circle hit by the drag
  return target.dataset.targetId === piece.patch.id;
};

const playHint = () => {
  if (config.value) {
    playInstruction(config.value.instructionText);
  }
};
</script>

<template>
  <div class="patches-module">
    <div v-if="!hasStarted" class="start-screen">
      <div class="start-icon"><MenuIcon :gameId="moduleId" style="width: 140px; height: 140px;" /></div>
      <h1>Patches<br><span>Shape Matching</span></h1>
      <p class="start-sub">Put the patches in the missing holes.</p>
      <button @click="handleStart" class="start-btn">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        Start
      </button>
    </div>

    <div v-else-if="config && baseTheme" class="game-board">
      <div v-if="isPlaying" class="listening-mini">
        <svg class="speaker-mini" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
        <span>Listening...</span>
      </div>

      <div class="action-layout">
        <header class="top-bar">
          <div class="phase-badge">Phase {{ config.phase }}</div>

          <!-- Progress counter -->
          <div class="progress-counter">
            <div
              v-for="p in config.targetPatches"
              :key="p.id"
              class="progress-dot"
              :class="{ filled: completedHoles.has(p.id) }"
              :style="{ background: completedHoles.has(p.id) ? p.color : 'rgba(0,0,0,0.15)' }"
            />
            <span class="progress-label">
              {{ completedHoles.size }} / {{ config.targetPatches.length }}
            </span>
          </div>

          <button class="replay-btn" @click="playHint">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
            Replay
          </button>
        </header>

        <!-- Split Screen Layout -->
        <div class="split-screen">
      
      <!-- Left Column: The Main Scene -->
      <div class="left-board scene-board">
        <!-- Render the main SVG scene. Pass ONLY the holes that are NOT yet completed -->
        <SvgSceneGenerator 
          :sceneType="config.sceneType"
          :theme="baseTheme"
          :holes="config.targetPatches.filter(p => !completedHoles.has(p.id))"
          :promptLevel="currentLevel"
          class="main-scene"
        />
      </div>

      <!-- Right Column: Draggable Patches -->
      <div class="right-board options-board">
        <div class="piece-wrapper" v-for="opt in options" :key="`${levelCounter}-${opt.patch.id}`">
          <PuzzlePiece 
            :id="opt.patch.id"
            :transparent="true"
            dropZoneSelector=".hole-hitbox"
            :validateDrop="(t) => validateDrop(t, opt)"
            @success="() => handleSuccess(opt.patch.id)"
            @error="handleError"
            :class="{ 'prompt-full': currentLevel === 'full' && opt.isTarget }"
            :style="{ width: `${opt.patch.radius * 4}px`, height: `${opt.patch.radius * 4}px` }"
          >
            <!-- The puzzle piece is essentially a cropped view of the scene with the specific theme applied -->
            <SvgSceneGenerator 
              :sceneType="config.sceneType"
              :theme="opt.theme"
              :clipTarget="opt.patch"
              style="width: 100%; height: 100%;"
            />
          </PuzzlePiece>
        </div>
      </div>

    </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.patches-module {
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
.top-bar { display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 2rem; background: var(--bg-secondary); border-bottom: 2px solid rgba(0,0,0,0.05); gap: 1rem; flex-shrink: 0; }
.phase-badge { font-size: 1.1rem; font-weight: 700; color: var(--text-secondary); display: flex; align-items: center; gap: 0.5rem; }
.replay-btn { display: flex; align-items: center; gap: 0.5rem; font-size: 1.1rem; font-weight: 700; padding: 0.75rem 1.75rem; background: var(--color-orange); color: white; border: none; border-radius: 50px; cursor: pointer; box-shadow: 0 4px 12px rgba(249,115,22,0.35); transition: transform 0.15s; }
.replay-btn:active { transform: scale(0.95); }

/* Progress counter */
.progress-counter { display: flex; align-items: center; gap: 0.5rem; }
.progress-dot {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid rgba(0,0,0,0.15);
  transition: background 0.3s, transform 0.2s;
}
.progress-dot.filled { transform: scale(1.2); border-color: transparent; box-shadow: 0 2px 8px rgba(0,0,0,0.25); }
.progress-label { font-size: 1rem; font-weight: 700; color: var(--text-secondary); min-width: 3rem; text-align: center; }

.split-screen {
  flex: 1;
  display: flex;
  flex-direction: row;
}

.scene-board {
  flex: 6;
  background-color: var(--bg-primary);
  display: flex;
  justify-content: center;
  align-items: center;
  border-right: 4px solid rgba(255, 255, 255, 0.1);
  padding: 2rem;
  min-width: 0;
  min-height: 0;
}

.main-scene {
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
  aspect-ratio: 1;
  filter: drop-shadow(0 10px 20px rgba(0,0,0,0.2));
}

.options-board {
  flex: 4;
  background: var(--bg-secondary);
  display: flex;
  flex-wrap: wrap;
  justify-content: space-evenly;
  align-items: center;
  align-content: space-around;
  padding: 2rem;
}

.piece-wrapper {
  position: relative;
  margin: 1rem;
  filter: drop-shadow(0 4px 10px rgba(0,0,0,0.3));
}

@keyframes flash-full {
  0%, 100% { transform: scale(1); filter: brightness(1); }
  50% { transform: scale(1.05); filter: brightness(1.2) drop-shadow(0 0 10px var(--color-target)); }
}

.prompt-full {
  animation: flash-full 1.5s infinite;
  z-index: 50;
}
</style>
