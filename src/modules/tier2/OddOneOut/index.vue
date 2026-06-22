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
import BugAsset from '../../../components/game/BugAsset.vue';
import JarAsset from '../../../components/game/JarAsset.vue';
import PointingHand from '../../../components/prompts/PointingHand.vue';
import type { OddOneOutLevelConfig, BugFeature, BugShape, BugPattern, BugRotation } from '../../../types';

const moduleId = 'tier2-odd-one-out';
const progressStore = useProgressStore();
const gameStore = useGameStore();
const { playInstruction, isPlaying } = useSpeech();
const { currentLevel, registerError, resetAll } = usePromptFading(progressStore.moduleStats[moduleId]?.currentPromptLevel || 'none');
const log = useLogger(moduleId);
const { safeSetTimeout } = useSafeTimeout();

const config = ref<OddOneOutLevelConfig | null>(null);
const swarm = ref<{ bug: BugFeature, isTarget: boolean }[]>([]);
const levelCounter = ref(0);
const isSuccess = ref(false);
const hasStarted = ref(false);

const COLORS = ['#e91e63', '#9c27b0', '#3f51b5', '#4caf50', '#ff9800', '#f44336', '#00bcd4', '#ffeb3b']; // Added Red, Cyan, Yellow
const SHAPES: BugShape[] = ['beetle', 'butterfly', 'caterpillar', 'ladybug', 'bee'];
const PATTERNS: BugPattern[] = ['none', 'spots', 'stripes', 'zigzag'];
const ROTATIONS: BugRotation[] = [0, 90, 180, 270];

const getRandomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
import { shuffle } from '../../../utils/shuffle';

const generateLevel = () => {
  levelCounter.value++;
  isSuccess.value = false;
  resetAll();
  
  const stat = progressStore.moduleStats[moduleId];
  const span = stat?.currentPhase || 1; 
  const optionCount = Math.max(4, stat?.currentOptionCount || 4);
  
  // Phase mapped directly to span (1 to 4 cues)
  const phase = Math.min(4, span) as 1 | 2 | 3 | 4;

  const baseFeature: BugFeature = {
    id: 'base',
    color: getRandomItem(COLORS),
    shape: getRandomItem(SHAPES),
    pattern: getRandomItem(PATTERNS),
    rotation: getRandomItem(ROTATIONS)
  };

  const targetBug: BugFeature = { ...baseFeature, id: 'target' };
  const distractorBugs: BugFeature[] = [];
  let anomalyRule = '';
  
  const allFeatures: ('color' | 'shape' | 'pattern' | 'rotation')[] = ['color', 'shape', 'pattern', 'rotation'];
  
  if (phase === 4) {
    // Phase 4: 1 Cue. Target differs in 1 feature (Hardest: most subtle).
    const cueFeature = getRandomItem(allFeatures);
    anomalyRule = `Target has different ${cueFeature}`;
    
    if (cueFeature === 'color') targetBug.color = getRandomItem(COLORS.filter(c => c !== baseFeature.color));
    else if (cueFeature === 'shape') targetBug.shape = getRandomItem(SHAPES.filter(s => s !== baseFeature.shape));
    else if (cueFeature === 'pattern') targetBug.pattern = getRandomItem(PATTERNS.filter(p => p !== baseFeature.pattern));
    else if (cueFeature === 'rotation') targetBug.rotation = getRandomItem(ROTATIONS.filter(r => r !== baseFeature.rotation));
  } else if (phase === 3) {
    // Phase 3: 2 Cues (e.g., Color and Shape). Target differs in 2 features.
    const shuffledFeatures = shuffle(allFeatures);
    const cue1 = shuffledFeatures[0];
    const cue2 = shuffledFeatures[1];
    anomalyRule = `Target differs in both ${cue1} and ${cue2}`;
    
    const diff1 = cue1 === 'color' ? getRandomItem(COLORS.filter(c => c !== baseFeature.color)) :
                  cue1 === 'shape' ? getRandomItem(SHAPES.filter(s => s !== baseFeature.shape)) :
                  cue1 === 'pattern' ? getRandomItem(PATTERNS.filter(p => p !== baseFeature.pattern)) :
                  getRandomItem(ROTATIONS.filter(r => r !== baseFeature.rotation));
                  
    const diff2 = cue2 === 'color' ? getRandomItem(COLORS.filter(c => c !== baseFeature.color)) :
                  cue2 === 'shape' ? getRandomItem(SHAPES.filter(s => s !== baseFeature.shape)) :
                  cue2 === 'pattern' ? getRandomItem(PATTERNS.filter(p => p !== baseFeature.pattern)) :
                  getRandomItem(ROTATIONS.filter(r => r !== baseFeature.rotation));

    (targetBug as any)[cue1] = diff1;
    (targetBug as any)[cue2] = diff2;
  } else if (phase === 2) {
    // Phase 2: 3 Cues. Target differs in 3 cues.
    const shuffledFeatures = shuffle(allFeatures);
    const cues = shuffledFeatures.slice(0, 3);
    anomalyRule = `Target differs in ${cues.join(', ')}`;
    
    for (const cue of cues) {
      if (cue === 'color') targetBug.color = getRandomItem(COLORS.filter(c => c !== baseFeature.color));
      else if (cue === 'shape') targetBug.shape = getRandomItem(SHAPES.filter(s => s !== baseFeature.shape));
      else if (cue === 'pattern') targetBug.pattern = getRandomItem(PATTERNS.filter(p => p !== baseFeature.pattern));
      else if (cue === 'rotation') targetBug.rotation = getRandomItem(ROTATIONS.filter(r => r !== baseFeature.rotation));
    }
  } else {
    // Phase 1: 4 Cues. Target differs in ALL 4 cues (Easiest: most obvious).
    anomalyRule = `Target differs in all features`;
    
    targetBug.color = getRandomItem(COLORS.filter(c => c !== baseFeature.color));
    targetBug.shape = getRandomItem(SHAPES.filter(s => s !== baseFeature.shape));
    targetBug.pattern = getRandomItem(PATTERNS.filter(p => p !== baseFeature.pattern));
    targetBug.rotation = getRandomItem(ROTATIONS.filter(r => r !== baseFeature.rotation));
  }

  // All distractors MUST be identical to the baseFeature to form a clear "Odd One Out" baseline
  for (let i = 0; i < optionCount - 1; i++) {
    distractorBugs.push({ ...baseFeature, id: `distractor-${i}` });
  }

  const allSwarm = [
    { bug: targetBug, isTarget: true },
    ...distractorBugs.map(b => ({ bug: b, isTarget: false }))
  ];

  swarm.value = shuffle(allSwarm);

  config.value = {
    moduleId,
    tier: 2,
    currentPhase: span,
    optionCount: allSwarm.length,
    instructionText: 'Catch the bug that does not belong!',
    phase,
    targetBug,
    swarm: allSwarm.map(s => s.bug),
    targetFeatures: {},
    distractors: distractorBugs.map(d => ({ id: d.id })),
    anomalyRule
  };

  log.generate({ phase, span, anomalyRule, targetShape: targetBug.shape, targetColor: targetBug.color, swarmSize: allSwarm.length });
  gameStore.initializeGame(config.value!);
  safeSetTimeout(() => {
    log.audio(config.value!.instructionText);
    playInstruction(config.value!.instructionText);
  }, 500);
};

onMounted(() => {
  log.lifecycle('mounted');
  generateLevel();
});

const handleSuccess = (bugId: string) => {
  if (isSuccess.value) return;
  isSuccess.value = true;
  log.success(bugId, { phase: config.value?.phase, anomalyRule: config.value?.anomalyRule });
  
  // Animate the successful bug into the jar. Remove it from swarm.
  swarm.value = swarm.value.filter(s => s.bug.id !== bugId);
  
  gameStore.handleSuccess();
  progressStore.updateStats(moduleId, true);
  
  
  playInstruction(getRandomPraise());
  
  safeSetTimeout(() => {
    if (gameStore.isRandomMode) { if (!gameStore.advanceRandomRound()) generateLevel(); } else { generateLevel(); }
  }, 2500);
};

const handleError = () => {
  if (isSuccess.value) return;
  log.error('wrong-drop', { phase: config.value?.phase, anomalyRule: config.value?.anomalyRule, promptLevel: currentLevel.value });
  gameStore.handleError();
  progressStore.updateStats(moduleId, false);
  registerError();
  playInstruction('Look closely, which one is different?');
};

const validateDrop = (target: HTMLElement, isTarget: boolean) => {
  return isTarget && target.closest('.jar-target-zone') !== null;
};

const playHint = () => {
  if (config.value) {
    playInstruction(config.value.instructionText);
  }
};
</script>

<template>
  <div class="odd-one-out-module">
    <div v-if="!hasStarted" class="start-screen">
      <div class="start-icon"><MenuIcon :gameId="moduleId" style="width: 140px; height: 140px;" /></div>
      <h1>Odd One Out<br><span>Tier 2</span></h1>
      <p class="start-sub">{{ config?.instructionText || 'Get ready to play!' }}</p>
      <button @click="hasStarted = true" class="start-btn">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        Start Challenge
      </button>
    </div>

    <div v-else-if="config" class="game-board">
      <div v-if="isPlaying" class="listening-mini">
        <div class="speaker-mini">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
        </div>
        <span>Listening...</span>
      </div>

      <header class="top-bar">
        <div class="phase-badge">Phase {{ config.phase }}</div>
        <button class="replay-btn" @click="playHint">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
          Replay
        </button>
      </header>

      <div class="action-layout">
        <!-- Layout: Left (Jar), Right (Swarm) -->
    <div class="split-layout">
      
      <!-- Left Column: Jar Target Area -->
      <div class="left-target">
        <div 
          class="jar-target-zone" 
          data-target-id="jar-target-zone"
          :class="{ 'prompt-pulse': currentLevel === 'partial' && !isSuccess, 'success-pulse': isSuccess }"
        >
          <JarAsset class="target-jar-asset">
            <!-- If success, we render the target bug INSIDE the jar slot -->
            <g v-if="isSuccess" transform="translate(50, 100) scale(0.5)">
              <BugAsset 
                :color="config.targetBug.color"
                :shape="config.targetBug.shape"
                :pattern="config.targetBug.pattern"
                :rotation="config.targetBug.rotation"
              />
            </g>
          </JarAsset>
        </div>
        <div class="table-floor"></div>
      </div>

      <!-- Right Column: The Swarm -->
      <div class="right-swarm">
        <!-- We'll use a responsive flex or staggered grid layout for the swarm to make it look organic -->
        <div class="swarm-container">
          <div class="bug-wrapper" v-for="opt in swarm" :key="`${levelCounter}-${opt.bug.id}`">
            <PuzzlePiece 
              :id="opt.bug.id"
              :transparent="true"
              dropZoneSelector=".jar-target-zone"
              :validateDrop="(t) => validateDrop(t, opt.isTarget)"
              @success="() => handleSuccess(opt.bug.id)"
              @error="handleError"
              :class="{ 'prompt-full': currentLevel === 'full' && opt.isTarget && !isSuccess }"
              style="width: 100%; height: 100%;"
            >
              <BugAsset 
                :color="opt.bug.color"
                :shape="opt.bug.shape"
                :pattern="opt.bug.pattern"
                :rotation="opt.bug.rotation"
                class="swarm-bug-asset"
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
.odd-one-out-module {
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

.split-layout {
  flex: 1;
  display: flex;
  flex-direction: row;
}

/* LEFT COLUMN */
.left-target {
  flex: 4;
  background: linear-gradient(180deg, #b2dfdb 0%, #80cbc4 70%);
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  border-right: 6px solid #4db6ac;
}

.table-floor {
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 15%;
  background-color: #8d6e63;
  border-top: 6px solid #795548;
}

.jar-target-zone {
  width: 300px;
  height: 350px;
  display: flex;
  justify-content: center;
  align-items: flex-end; /* Jar sits on bottom */
  z-index: 5;
  margin-bottom: 5%;
  transition: all 0.3s ease;
  position: relative;
}

.target-jar-asset {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 10px 15px rgba(0,0,0,0.2));
}

@keyframes pulse-zone {
  0%, 100% { filter: drop-shadow(0 0 0 rgba(255, 215, 0, 0)); }
  50% { filter: drop-shadow(0 0 30px rgba(255, 215, 0, 0.8)); }
}

.prompt-pulse {
  animation: pulse-zone 2s infinite;
}

@keyframes success-glow {
  0%, 100% { transform: scale(1); filter: drop-shadow(0 0 10px #4caf50); }
  50% { transform: scale(1.05); filter: drop-shadow(0 0 40px #4caf50); }
}

.success-pulse {
  animation: success-glow 1s ease-in-out infinite;
}

/* RIGHT COLUMN */
.right-swarm {
  flex: 6;
  position: relative;
  z-index: 2; /* Ensure dragged bugs appear above the left target area */
  background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="2" fill="rgba(0,0,0,0.05)"/></svg>') repeat;
  background-color: #f1f8e9;
  padding: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 10px 0 20px rgba(0,0,0,0.05);
}

.swarm-container {
  display: flex;
  flex-wrap: wrap;
  gap: 3rem;
  width: 100%;
  max-width: 800px;
  justify-content: center;
  align-items: center;
}

.bug-wrapper {
  position: relative;
  width: 130px;
  height: 130px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: transform 0.2s;
}

/* Give them a slightly organic hover effect */
.bug-wrapper:hover {
  transform: scale(1.05);
}

.swarm-bug-asset {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 4px 6px rgba(0,0,0,0.25));
}

@keyframes flash-full {
  0%, 100% { transform: scale(1); box-shadow: 0 0 0 transparent; }
  50% { transform: scale(1.15); box-shadow: 0 0 20px 10px rgba(255, 215, 0, 0.8); }
}

.prompt-full {
  animation: flash-full 1.5s infinite;
  z-index: 50;
  background-color: rgba(255, 215, 0, 0.2);
  border-radius: 50%;
}
</style>
