<script setup lang="ts">
import { ref, onUnmounted } from 'vue';
import MenuIcon from '../../../components/game/MenuIcon.vue';
import { useProgressStore } from '../../../stores/useProgressStore';
import { useGameStore } from '../../../stores/useGameStore';
import { useSpeech } from '../../../composables/useSpeech';
import { useLogger } from '../../../composables/useLogger';
import { useSafeTimeout } from '../../../composables/useSafeTimeout';

import PuzzlePiece from '../../../components/game/PuzzlePiece.vue';
import type { AuditoryMemoryLevelConfig, AuditoryMemoryItem, AuditoryTargetAction, VocabularyNoun, AuditoryContainer } from '../../../types';

const moduleId = 'tier3-auditory-memory';
const progressStore = useProgressStore();
const gameStore = useGameStore();
const { playInstruction, stopSpeech, isPlaying } = useSpeech();
const log = useLogger(moduleId);
const { safeSetTimeout } = useSafeTimeout();

const config = ref<AuditoryMemoryLevelConfig | null>(null);
const options = ref<{ item: AuditoryMemoryItem, isTarget: boolean }[]>([]);
const initialOptions = ref<{ item: AuditoryMemoryItem, isTarget: boolean }[]>([]);
const hasStarted = ref(false);
const levelCounter = ref(0);

const isComplete = ref(false);
const completedTargets = ref<Set<string>>(new Set());

const NOUNS: VocabularyNoun[] = ['dog', 'cup', 'ball', 'car', 'book', 'table', 'chair'];
const COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#f97316', '#a855f7']; // Red, Blue, Green, Orange, Purple
const CONTAINERS: AuditoryContainer[] = ['bed', 'table', 'box', 'couch', 'house'];

const COLOR_NAMES: Record<string, string> = {
  '#ef4444': 'red',
  '#3b82f6': 'blue',
  '#22c55e': 'green',
  '#f97316': 'orange',
  '#a855f7': 'purple'
};

const getRandomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
import { shuffle } from '../../../utils/shuffle';

const generateLevel = () => {
  levelCounter.value++;
  isComplete.value = false;
  completedTargets.value.clear();

  const stat = progressStore.moduleStats[moduleId];
  const span = stat?.currentPhase || 1;
  
  const phase = Math.min(5, span) as 1 | 2 | 3 | 4 | 5;

  let targetCount = 1;
  if (phase === 3) targetCount = 2;
  else if (phase === 4) targetCount = 3;
  else if (phase === 5) targetCount = 4;
  
  const optionCount = Math.max(targetCount + 1, stat?.currentOptionCount || 4);
  const distractorCount = optionCount - targetCount;

  const selectedNouns = shuffle([...NOUNS]);
  const selectedColors = shuffle([...COLORS]);
  const selectedContainers = shuffle([...CONTAINERS]);

  const targets: AuditoryTargetAction[] = [];
  const distractorItems: AuditoryMemoryItem[] = [];
  const availableContainers: AuditoryContainer[] = [];

  let audioPrompt = '';

  for (let i = 0; i < targetCount; i++) {
    const item: AuditoryMemoryItem = {
      id: `target-${i}`,
      noun: selectedNouns[i],
      color: selectedColors[i],
      isTarget: true
    };
    
    if (phase === 1) {
      targets.push({ item, preposition: 'on', container: 'box' }); // Container ignored in phase 1 UI
      audioPrompt = `Find the ${COLOR_NAMES[item.color]} ${item.noun}.`;
      availableContainers.push('box');
    } else {
      const container = selectedContainers[i];
      const prep = getRandomItem(['on', 'under', 'inside']);
      targets.push({ item, preposition: prep as any, container });
      availableContainers.push(container);
      
      const clause = `put the ${COLOR_NAMES[item.color]} ${item.noun} ${prep} the ${container}`;
      if (i === 0) {
        audioPrompt = clause;
      } else if (i === targetCount - 1) {
        audioPrompt += `, and ${clause}`;
      } else {
        audioPrompt += `, ${clause}`;
      }
    }
  }

  if (phase > 1) {
    audioPrompt = audioPrompt.charAt(0).toUpperCase() + audioPrompt.slice(1) + '.';
  }

  for (let i = 0; i < distractorCount; i++) {
    distractorItems.push({
      id: `distractor-${i}`,
      noun: selectedNouns[(targetCount + i) % selectedNouns.length], // Use modulo just in case optionCount is very high
      color: selectedColors[(targetCount + i) % selectedColors.length],
      isTarget: false
    });
  }

  const allItems = shuffle([
    ...targets.map(t => ({ item: t.item, isTarget: true })),
    ...distractorItems.map(d => ({ item: d, isTarget: false }))
  ]);

  initialOptions.value = [...allItems];
  options.value = [...allItems];

  log.generate({ phase, currentPhase: phase, targetCount: targetCount, audioPrompt });

  config.value = {
    moduleId,
    tier: 3,
    currentPhase: phase,
    optionCount: allItems.length,
    instructionText: audioPrompt,
    phase,
    audioPrompt,
    targets,
    distractorItems,
    availableContainers,
    targetFeatures: {},
    distractors: []
  };

  gameStore.initializeGame(config.value);
  
  safeSetTimeout(() => {
    log.audio(audioPrompt);
    playInstruction(audioPrompt);
  }, 500);
};

const handleStart = () => {
  hasStarted.value = true;
  generateLevel();
};

const replayAudio = () => {
  if (config.value) {
    completedTargets.value.clear();
    options.value = [...initialOptions.value];
    playInstruction(config.value.audioPrompt);
  }
};

const validateDrop = (target: HTMLElement, isTarget: boolean, itemId: string) => {
  if (!isTarget || !config.value) return false;
  
  if (config.value.phase === 1) {
    // Any target zone works for Phase 1
    return target.getAttribute('data-is-drop-zone') === 'true';
  } else {
    // Phase 2/3: Must match the specific container
    const containerType = target.getAttribute('data-container-type');
    const targetAction = config.value.targets.find(t => t.item.id === itemId);
    return targetAction?.container === containerType;
  }
};

const handleSuccess = (itemId: string) => {
  if (isComplete.value || !config.value) return;
  
  completedTargets.value.add(itemId);
  options.value = options.value.filter(o => o.item.id !== itemId);
  log.success(itemId, { phase: config.value.phase, completedCount: completedTargets.value.size, totalTargets: config.value.targets.length, audioPrompt: config.value.audioPrompt });
  
  gameStore.handleSuccess();
  
  if (completedTargets.value.size === config.value.targets.length) {
    isComplete.value = true;
    log.info('All targets placed — level complete', { phase: config.value.phase });
    progressStore.updateStats(moduleId, true);
    playInstruction('Great memory!');
    safeSetTimeout(() => { generateLevel(); }, 3000);
  } else {
    playInstruction('Good!');
  }
};

const handleError = () => {
  if (isComplete.value) return;
  log.error('wrong-drop', { phase: config.value?.phase, audioPrompt: config.value?.audioPrompt });
  gameStore.handleError();
  progressStore.updateStats(moduleId, false);
  
  completedTargets.value.clear();
  options.value = [...initialOptions.value];
  
  playInstruction('Try again! Listen closely and remember.');
};

onUnmounted(() => {
  log.lifecycle('unmounted');
  stopSpeech();
});
</script>

<template>
  <div class="auditory-memory-module">
    
    <div v-if="!hasStarted" class="start-screen">
      <div class="start-icon"><MenuIcon :gameId="moduleId" style="width: 140px; height: 140px;" /></div>
      <h1>Auditory Memory</h1>
      <p class="instruction-text">Listen to the instructions carefully and place the items as requested.</p>
      
      <button @click="handleStart" class="start-game-btn">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
        Start Challenge
      </button>
    </div>

    <!-- ── LISTENING FOCUS MODE ──────────────────────────────────────────── -->
    <div v-else-if="isPlaying" class="focus-listening-mode">
      <div class="listening-content">
        <div class="audio-pulse-wrapper">
          <svg class="giant-speaker" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
          </svg>
          <div class="pulse-ring"></div>
          <div class="pulse-ring delay"></div>
        </div>
        <h2>Listen and Remember</h2>
        <button class="replay-btn massive-replay" @click="replayAudio">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
          </svg>
          Replay Audio
        </button>
      </div>
    </div>

    <!-- ACTION STATE -->
    <div v-else-if="config" class="game-board">
      <div class="action-layout">
        
        <div class="top-section">
          <button class="replay-btn" @click="replayAudio">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            </svg>
            Replay Audio
          </button>
          
          <div class="drop-zones">
            <template v-if="config.phase === 1">
              <div class="target-zone" data-is-drop-zone="true">
                <div class="zone-outline"></div>
                <p>Drop Target Here</p>
              </div>
            </template>
            <template v-else>
              <div 
                v-for="(container, idx) in config.availableContainers" 
                :key="idx"
                class="target-zone spatial-zone"
                data-is-drop-zone="true"
                :data-container-type="container"
              >
                <!-- Simple visual representation of a container -->
                <div class="container-visual" :class="`container-${container}`">
                   {{ container.toUpperCase() }}
                </div>
              </div>
            </template>
          </div>
        </div>

        <div class="bottom-section">
          <div class="options-container">
            <div class="piece-wrapper" v-for="opt in options" :key="`${levelCounter}-${opt.item.id}`">
              <PuzzlePiece 
                :id="opt.item.id"
                :noun="opt.item.noun"
                :color="opt.item.color"
                :isTarget="opt.isTarget"
                promptLevel="none"
                dropZoneSelector=".target-zone"
                :validateDrop="(t) => validateDrop(t, opt.isTarget, opt.item.id)"
                @success="() => handleSuccess(opt.item.id)"
                @error="handleError"
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.auditory-memory-module {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  position: relative;
}

.start-screen {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;
}

.start-screen h1 {
  font-size: 4rem;
  color: var(--text-primary);
}

.instruction-text {
  font-size: 1.5rem;
  color: var(--text-secondary);
}

.start-game-btn {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 2rem;
  padding: 1.5rem 3rem;
  background-color: var(--color-blue);
  color: white;
  border: none;
  border-radius: var(--border-radius-lg);
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
}

.game-board {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
}

/* LISTENING INDICATOR/* ── Listening Focus Mode ──────────────────────────────────────────────────── */
.focus-listening-mode {
  flex: 1; display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%);
  animation: fadeIn 0.3s ease;
}

.listening-content {
  display: flex; flex-direction: column; align-items: center; gap: 3rem;
}

.listening-content h2 {
  font-size: 3rem; font-weight: 800; color: white; margin: 0;
  text-shadow: 0 4px 12px rgba(0,0,0,0.3);
}

.audio-pulse-wrapper {
  position: relative; width: 160px; height: 160px;
  display: flex; align-items: center; justify-content: center;
}

.giant-speaker {
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

/* ACTION LAYOUT */
.action-layout {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.top-section {
  flex: 1.2;
  background-color: var(--bg-secondary);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  padding: 2rem;
  position: relative;
}

.replay-btn {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  font-weight: bold;
  padding: 1rem 2rem;
  background-color: var(--color-orange);
  color: white;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0,0,0,0.15);
}

.drop-zones {
  display: flex;
  gap: 3rem;
  justify-content: center;
  width: 100%;
}

.target-zone {
  width: 350px;
  height: 250px;
  border: 6px dashed var(--color-neutral);
  border-radius: var(--border-radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.5);
  font-size: 2rem;
  color: var(--text-secondary);
  font-weight: bold;
  transition: all 0.3s;
}

.spatial-zone {
  flex-direction: column;
  gap: 1rem;
}

.container-visual {
  width: 80%;
  height: 100px;
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 2rem;
  color: white;
}

.container-bed { background-color: #8b5cf6; }
.container-table { background-color: #10b981; }
.container-box { background-color: #f59e0b; }

.bottom-section {
  flex: 1;
  background: var(--bg-primary);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

.options-container {
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.piece-wrapper {
  position: relative;
}
</style>
