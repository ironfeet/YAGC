<script setup lang="ts">
import { ref, computed, nextTick, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useProgressStore } from '../../../stores/useProgressStore';
import MenuIcon from '../../../components/game/MenuIcon.vue';
import { useSpeech } from '../../../composables/useSpeech';
import { usePromptFading } from '../../../composables/usePromptFading';
import { useLogger } from '../../../composables/useLogger';
import { useSafeTimeout } from '../../../composables/useSafeTimeout';
import ColorfulAnimal from '../AnimalJigsaw/ColorfulAnimal.vue';
import ShapeBlock from '../ShapeSorter/ShapeBlock.vue';

const router = useRouter();
const progressStore = useProgressStore();
const GAME_ID = 'fun-memory-match';

const hasStarted = ref(false);
const isComplete = ref(false);
const { playInstruction, stopSpeech, isPlaying } = useSpeech();
const log = useLogger(GAME_ID);
const { safeSetTimeout } = useSafeTimeout();

const ANIMALS = ['cat', 'dog', 'rabbit', 'frog', 'pig', 'lion', 'elephant', 'penguin', 'monkey', 'bear', 'fox', 'duck'];

interface Card {
  id: string;
  assetId: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const currentPhase = computed(() => progressStore.moduleStats[GAME_ID]?.currentPhase || 1);

const cardCount = computed(() => {
  // Phase 1: 4 cards, Phase 2: 6 cards, Phase 3: 8 cards, Phase 4: 12 cards, Phase 5: 16 cards
  const p = currentPhase.value;
  if (p === 1) return 4;
  if (p === 2) return 6;
  if (p === 3) return 8;
  if (p === 4) return 12;
  return 16;
});

const gridColumns = computed(() => {
  const count = cardCount.value;
  if (count <= 4) return 2;
  if (count <= 8) return 4;
  if (count <= 12) return 4;
  return 4;
});

const gridRows = computed(() => Math.ceil(cardCount.value / gridColumns.value));

const cards = ref<Card[]>([]);
const flippedCards = ref<Card[]>([]);
let lockBoard = false;

const { currentLevel: promptLevel, resetAll: resetPrompt } = usePromptFading('none');

// Find the first unmatched pair for the prompt
const promptPairId = computed(() => {
  if (promptLevel.value === 'none') return null;
  const unmatched = cards.value.filter(c => !c.isMatched);
  if (unmatched.length > 0) {
    return unmatched[0].assetId; // highlight this asset id
  }
  return null;
});

const initLevel = async () => {
  isComplete.value = false;
  cards.value = [];
  flippedCards.value = [];
  lockBoard = false;
  resetPrompt('none');
  
  const pairsNeeded = cardCount.value / 2;
  const selectedAnimals = [...ANIMALS].sort(() => Math.random() - 0.5).slice(0, pairsNeeded);

  const cardSet: Card[] = [];
  selectedAnimals.forEach((animal, i) => {
    cardSet.push({ id: `a-${i}`, assetId: animal, isFlipped: false, isMatched: false });
    cardSet.push({ id: `b-${i}`, assetId: animal, isFlipped: false, isMatched: false });
  });

  cards.value = cardSet.sort(() => Math.random() - 0.5);

  await nextTick();
  playInstruction('Find the matching pairs!');
};

const handleStart = () => {
  hasStarted.value = true;
  initLevel();
};

const flipCard = (card: Card) => {
  if (lockBoard) return;
  if (card.isFlipped || card.isMatched) return;

  card.isFlipped = true;
  flippedCards.value.push(card);

  // Reset prompt because user interacted
  resetPrompt();

  if (flippedCards.value.length === 2) {
    lockBoard = true;
    checkForMatch();
  }
};

const checkForMatch = () => {
  const [card1, card2] = flippedCards.value;
  if (card1.assetId === card2.assetId) {
    // Match — use safeSetTimeout so this is auto-cleared on unmount
    safeSetTimeout(() => {
      card1.isMatched = true;
      card2.isMatched = true;
      flippedCards.value = [];
      lockBoard = false;
      
      if (cards.value.every(c => c.isMatched)) {
        onLevelComplete();
      }
    }, 500);
  } else {
    // No match — use safeSetTimeout so this is auto-cleared on unmount
    safeSetTimeout(() => {
      card1.isFlipped = false;
      card2.isFlipped = false;
      flippedCards.value = [];
      lockBoard = false;
    }, 1000);
  }
};

function onLevelComplete() {
  isComplete.value = true;
  log.generate({ level: 1, phase: currentPhase.value, pieces: cardCount.value });
  playInstruction('Great job! You found all the pairs!');
  progressStore.updateStats(GAME_ID, true);
  resetPrompt();
}

onUnmounted(() => {
  stopSpeech();
});

const handleNextLevel = () => {
  isComplete.value = false;
  initLevel();
};
</script>

<template>
  <div class="jigsaw-root" :class="{ 'prompt-active': promptLevel === 'partial' || promptLevel === 'full' }">
    <div v-if="!hasStarted" class="start-screen">
      <div class="start-icon"><MenuIcon :gameId="GAME_ID" style="width: 140px; height: 140px;" /></div>
      <h1>Memory Match<br><span>Flip & Learn</span></h1>
      <p class="start-sub">Flip the cards and find the matching pairs!</p>
      <button @click="handleStart" class="start-btn">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        Start
      </button>
    </div>

    <div v-else class="game-board">
      <div v-if="isPlaying" class="listening-mini">
        <svg class="speaker-mini" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
        <span>Listening...</span>
      </div>

      <div class="action-layout">
        <header class="top-bar">
          <div class="phase-badge">
            <span style="font-size: 1.5rem; margin-right: 0.5rem">⭐</span>
            Phase {{ currentPhase }}
          </div>
          <button class="replay-btn" @click="playInstruction('Find the matching pairs!')" :disabled="isPlaying">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
            Replay
          </button>
        </header>

        <div class="jig-main">
          <div class="board" :style="{
            gridTemplateColumns: `repeat(${gridColumns}, 140px)`,
            gridTemplateRows: `repeat(${gridRows}, 140px)`
          }">
            <div 
              v-for="card in cards" 
              :key="card.id"
              class="card-wrapper"
              :class="{ 'is-flipped': card.isFlipped || card.isMatched, 'is-target': promptLevel === 'full' && (card.assetId === promptPairId && !card.isMatched && !card.isFlipped) }"
              @pointerdown="flipCard(card)"
            >
              <div class="card-inner">
                <div class="card-front">
                  <div class="card-pattern">?</div>
                </div>
                <div class="card-back">
                  <ColorfulAnimal v-if="card.assetId && ANIMALS.includes(card.assetId)" :name="card.assetId" style="width: 100px; height: 100px;" />
                  <ShapeBlock v-else :shape="card.assetId" color="#4f46e5" />
                </div>
              </div>
            </div>
          </div>

          <transition name="pop">
            <div v-if="isComplete" class="complete-overlay">
              <div class="complete-card">
                <div class="complete-emoji">🎉</div>
                <h2 class="complete-title">Great Job!</h2>
                <p class="complete-sub">You found all the matches!</p>
                <div class="complete-actions">
                  <button class="btn-next" @click="handleNextLevel">Next Level →</button>
                  <button class="btn-menu" @click="router.push('/')">🏠 Menu</button>
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
@import '../../../assets/fun-games-shared.css';

.board {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: grid;
  gap: 20px;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 32px;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0,0,0,0.05);
}

.card-wrapper {
  width: 140px;
  height: 140px;
  perspective: 1000px;
  cursor: pointer;
}

.card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  text-align: center;
  transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  transform-style: preserve-3d;
}

.card-wrapper.is-flipped .card-inner {
  transform: rotateY(180deg);
}

.card-front, .card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 15px rgba(0,0,0,0.1);
}

.card-front {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  border: 4px solid white;
}

.card-pattern {
  font-size: 4rem;
  font-weight: 900;
  color: rgba(255,255,255,0.5);
}

.card-back {
  background: var(--bg-secondary);
  transform: rotateY(180deg);
  border: 4px solid #e5e7eb;
}

.prompt-active .card-wrapper.is-target:not(.is-flipped) .card-front {
  animation: promptPulse 2s infinite;
}
@keyframes promptPulse {
  0% { transform: scale(1); box-shadow: 0 8px 15px rgba(0,0,0,0.1); }
  50% { transform: scale(1.05); box-shadow: 0 8px 25px rgba(255,215,0,0.8); border-color: gold; }
  100% { transform: scale(1); box-shadow: 0 8px 15px rgba(0,0,0,0.1); }
}
</style>
