<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import GameSelectionMenu from './GameSelectionMenu.vue';
import MenuIcon from '../components/game/MenuIcon.vue';
import { useProgressStore } from '../stores/useProgressStore';
import { useSessionStore } from '../stores/useSessionStore';

const router = useRouter();
const route = useRoute();
const progressStore = useProgressStore();
const sessionStore = useSessionStore();

// Initialize active tab from URL query if present, otherwise fallback to session memory, otherwise user preference
const activeTab = ref<'mita' | 'fun'>(
  (route.query.tab as 'mita' | 'fun') || sessionStore.lastActiveTab || progressStore.defaultHomeMenu
);

// Always synchronize the session store with the resolved active tab
sessionStore.lastActiveTab = activeTab.value;

const switchTab = (tab: 'mita' | 'fun') => {
  activeTab.value = tab;
  sessionStore.lastActiveTab = tab;
  router.replace({ query: { ...route.query, tab } });
};

// Random Play Modal State
import { useGameStore } from '../stores/useGameStore';
const gameStore = useGameStore();

const showRandomModal = ref(false);
const randomGames = ref<number | 'endless'>(5);
const randomRoundsPerGame = ref<number>(3);
const randomPool = ref<'all' | 'mita' | 'fun'>('all');

const startRandomSession = () => {
  showRandomModal.value = false;
  gameStore.startRandomMode(randomPool.value, randomGames.value, randomRoundsPerGame.value);
};

const funGames = [
  {
    id: 'fun-animal-jigsaw',
    name: 'Animal Jigsaw',
    emoji: '🦁',
    color: '#34d399',
    description: 'Spatial reasoning with animal pieces',
    comingSoon: false
  },
  {
    id: 'fun-vehicle-jigsaw',
    name: 'Vehicle Jigsaw',
    emoji: '🚜',
    color: '#60a5fa',
    description: 'Assemble cars, trucks and planes',
    comingSoon: false
  },
  {
    id: 'fun-nature-jigsaw',
    name: 'Nature Jigsaw',
    emoji: '🌳',
    color: '#a78bfa',
    description: 'Piece together bugs and plants',
    comingSoon: false
  },
  {
    id: 'fun-color-board',
    name: 'Color Board',
    emoji: '🎨',
    color: '#fbbf24',
    description: 'Match items by their color',
    comingSoon: false
  },
  {
    id: 'fun-shape-sorter',
    name: 'Shape Sorter',
    emoji: '🔺',
    color: '#f472b6',
    description: 'Match simple shapes',
    comingSoon: false
  },
  {
    id: 'fun-size-sorter',
    name: 'Size Sorter',
    emoji: '📏',
    color: '#38bdf8',
    description: 'Sort objects by size',
    comingSoon: false
  },
  {
    id: 'fun-shadow-match',
    name: 'Shadow Match',
    emoji: '👥',
    color: '#a3e635',
    description: 'Match objects to their shadows',
    comingSoon: false
  },
  {
    id: 'fun-number-puzzle',
    name: 'Number Puzzle',
    emoji: '🔢',
    color: '#fb923c',
    description: 'Count and match numbers',
    comingSoon: false
  },
  {
    id: 'fun-pattern-train',
    name: 'Pattern Train',
    emoji: '🚂',
    color: '#818cf8',
    description: 'Complete the visual patterns',
    comingSoon: false
  },
  {
    id: 'fun-category-bins',
    name: 'Category Bins',
    emoji: '🧺',
    color: '#fcd34d',
    description: 'Sort items into categories',
    comingSoon: false
  },
  {
    id: 'fun-memory-match',
    name: 'Memory Match',
    emoji: '🧠',
    color: '#f87171',
    description: 'Find the matching pairs',
    comingSoon: false
  },
  {
    id: 'fun-connect-dots',
    name: 'Connect the Dots',
    emoji: '✏️',
    color: '#2dd4bf',
    description: 'Draw lines to connect objects',
    comingSoon: false
  }
];
</script>

<template>
  <div class="global-menu">

    <!-- ── Random Play Modal ────────────────────────────────────── -->
    <transition name="pop">
      <div v-if="showRandomModal" class="random-modal-overlay" @click.self="showRandomModal = false">
        <div class="random-modal-card">
          <button class="close-modal-btn" @click="showRandomModal = false">✕</button>
          <div class="modal-emoji">🎲</div>
          <h2 class="modal-title">Random Play</h2>
          <p class="modal-sub">Pick a random sequence of games to play!</p>
          
          <div class="modal-section">
            <label>Total Games</label>
            <div class="segmented-control">
              <button :class="{ active: randomGames === 5 }" @click="randomGames = 5">5</button>
              <button :class="{ active: randomGames === 10 }" @click="randomGames = 10">10</button>
              <button :class="{ active: randomGames === 15 }" @click="randomGames = 15">15</button>
              <button :class="{ active: randomGames === 'endless' }" @click="randomGames = 'endless'">∞</button>
            </div>
          </div>
          
          <div class="modal-section">
            <label>Rounds per Game</label>
            <div class="segmented-control">
              <button :class="{ active: randomRoundsPerGame === 1 }" @click="randomRoundsPerGame = 1">1</button>
              <button :class="{ active: randomRoundsPerGame === 3 }" @click="randomRoundsPerGame = 3">3</button>
              <button :class="{ active: randomRoundsPerGame === 5 }" @click="randomRoundsPerGame = 5">5</button>
            </div>
          </div>
          
          <div class="modal-section">
            <label>Which games?</label>
            <div class="segmented-control">
              <button :class="{ active: randomPool === 'all' }" @click="randomPool = 'all'">All Games</button>
              <button :class="{ active: randomPool === 'mita' }" @click="randomPool = 'mita'">MITA</button>
              <button :class="{ active: randomPool === 'fun' }" @click="randomPool = 'fun'">Fun Only</button>
            </div>
          </div>
          
          <button class="start-random-btn" @click="startRandomSession">
            Start Session
          </button>
        </div>
      </div>
    </transition>

    <!-- ── Top bar ─────────────────────────────────────────── -->
    <header class="global-header">
      <div class="header-left">
        <span class="brand-icon">🧠</span>
        <div class="brand-text">
          <span class="brand-name">Learning Hub</span>
          <span class="brand-sub">Interactive Therapy Games</span>
        </div>
      </div>

      <!-- Tab switcher -->
      <nav class="tab-nav" role="tablist">
        <button
          id="tab-mita"
          role="tab"
          class="tab-btn"
          :class="{ active: activeTab === 'mita' }"
          @click="switchTab('mita')"
        >
          <span class="tab-icon">🎯</span>
          <span class="tab-label">MITA</span>
          <span class="tab-sub">Clinical Curriculum</span>
        </button>
        <button
          id="tab-fun"
          role="tab"
          class="tab-btn"
          :class="{ active: activeTab === 'fun' }"
          @click="switchTab('fun')"
        >
          <span class="tab-icon">🧩</span>
          <span class="tab-label">Fun Games</span>
          <span class="tab-sub">Jigsaw & Puzzles</span>
        </button>
      </nav>

      <div class="header-right">
        <button class="random-play-btn" @click="showRandomModal = true">
          🎲 Play Random
        </button>
        <button
          class="stats-btn"
          @click="router.push(`/statistics?tab=${activeTab}`)"
        >📊 Statistics</button>
        <button class="settings-btn" @click="router.push('/settings')" title="Settings">⚙️</button>
      </div>
    </header>

    <!-- ── Tab content ────────────────────────────────────── -->
    <main class="tab-content">

      <!-- MITA Tab -->
      <transition name="tab-fade" mode="out-in">
        <div v-if="activeTab === 'mita'" key="mita" class="tab-panel">
          <GameSelectionMenu :embedded="true" />
        </div>

        <!-- Fun Games Tab -->
        <div v-else key="fun" class="tab-panel fun-panel">
          <div class="fun-header">
            <h2 class="fun-title">🧩 Fun Games</h2>
            <p class="fun-desc">Jigsaw puzzles and board games</p>
          </div>

          <div class="fun-grid">
            <div
              v-for="game in funGames"
              :key="game.id"
              class="fun-card"
              :class="{ 'fun-card--playable': !game.comingSoon }"
              :style="{ '--card-color': game.color }"
              @click="!game.comingSoon && router.push(`/game/${game.id}`)"
            >
              <div class="fun-card-icon">
                <MenuIcon :gameId="game.id" v-if="!game.comingSoon" />
                <div v-else class="fun-card-emoji">{{ game.emoji }}</div>
              </div>
              <div class="fun-card-body">
                <h3 class="fun-card-name">{{ game.name }}</h3>
                <p class="fun-card-desc">{{ game.description }}</p>
              </div>
              <div v-if="game.comingSoon" class="coming-soon-badge">Coming Soon</div>
            </div>
          </div>
        </div>
      </transition>
    </main>
  </div>
</template>

<style scoped>
/* ── Layout ──────────────────────────────────────────────── */
.global-menu {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  overflow: hidden;
}

/* ── Header ──────────────────────────────────────────────── */
.global-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2.5rem;
  height: 88px;
  flex-shrink: 0;
  background: var(--bg-secondary);
  border-bottom: 2px solid rgba(255, 255, 255, 0.07);
  gap: 1.5rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-shrink: 0;
}

.brand-icon {
  font-size: 2.8rem;
  line-height: 1;
  filter: drop-shadow(0 2px 6px rgba(0,0,0,0.4));
}

.brand-text {
  display: flex;
  flex-direction: column;
}

.brand-name {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text-primary);
  line-height: 1.1;
  letter-spacing: -0.02em;
}

.brand-sub {
  font-size: 0.85rem;
  color: var(--text-secondary);
  font-weight: 500;
}

/* ── Tab nav ─────────────────────────────────────────────── */
.tab-nav {
  display: flex;
  gap: 0.5rem;
  background: rgba(0,0,0,0.25);
  padding: 0.4rem;
  border-radius: 16px;
}

.tab-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.1rem;
  padding: 0.6rem 2rem;
  border: none;
  border-radius: 12px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 160px;
}

.tab-btn:hover {
  background: rgba(255,255,255,0.07);
  color: var(--text-primary);
}

.tab-btn.active {
  background: var(--color-blue);
  color: white;
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.4);
}

.tab-icon {
  font-size: 1.5rem;
  line-height: 1;
}

.tab-label {
  font-size: 1.05rem;
  font-weight: 700;
  line-height: 1.1;
}

.tab-sub {
  font-size: 0.72rem;
  font-weight: 500;
  opacity: 0.75;
}

/* ── Header right ────────────────────────────────────────── */
.header-right {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.random-play-btn {
  padding: 0.65rem 1.4rem;
  font-size: 1.05rem;
  font-weight: 800;
  background: linear-gradient(135deg, #a855f7, #6366f1);
  color: white;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
  transition: transform 0.15s, box-shadow 0.15s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.random-play-btn:active {
  transform: scale(0.95);
  box-shadow: none;
}

.stats-btn {
  padding: 0.65rem 1.4rem;
  font-size: 1rem;
  font-weight: 700;
  background: var(--color-blue);
  color: white;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.35);
  transition: transform 0.15s, box-shadow 0.15s;
}

.stats-btn:active {
  transform: scale(0.95);
  box-shadow: none;
}

.settings-btn {
  font-size: 1.8rem;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.4rem;
  border-radius: 50%;
  transition: transform 0.2s, background 0.2s;
  line-height: 1;
}

.settings-btn:hover {
  transform: rotate(30deg);
  background: rgba(255,255,255,0.08);
}

/* ── Random Modal ────────────────────────────────────────── */
.random-modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.random-modal-card {
  position: relative;
  background: var(--bg-secondary);
  padding: 3rem 4rem;
  border-radius: 32px;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
  border: 2px solid rgba(255, 255, 255, 0.1);
  min-width: 450px;
}

.close-modal-btn {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 1.2rem;
  cursor: pointer;
  transition: background 0.2s;
}

.close-modal-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.modal-emoji {
  font-size: 4rem;
  margin-bottom: 0.5rem;
  filter: drop-shadow(0 4px 10px rgba(0,0,0,0.3));
}

.modal-title {
  font-size: 2.2rem;
  font-weight: 900;
  color: white;
  margin-bottom: 0.2rem;
}

.modal-sub {
  font-size: 1.1rem;
  color: var(--text-secondary);
  margin-bottom: 2.5rem;
}

.modal-section {
  margin-bottom: 2rem;
  text-align: left;
}

.modal-section label {
  display: block;
  font-size: 1rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.8rem;
}

.segmented-control {
  display: flex;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  padding: 0.3rem;
  gap: 0.3rem;
}

.segmented-control button {
  flex: 1;
  padding: 0.8rem 0;
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-secondary);
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.segmented-control button:hover {
  color: white;
  background: rgba(255, 255, 255, 0.05);
}

.segmented-control button.active {
  color: white;
  background: var(--color-blue);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.start-random-btn {
  width: 100%;
  padding: 1.2rem;
  font-size: 1.4rem;
  font-weight: 800;
  background: linear-gradient(135deg, #a855f7, #6366f1);
  color: white;
  border: none;
  border-radius: 16px;
  cursor: pointer;
  box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4);
  transition: transform 0.15s, box-shadow 0.15s;
  margin-top: 1rem;
}

.start-random-btn:active {
  transform: scale(0.96);
  box-shadow: none;
}

.pop-enter-active, .pop-leave-active { transition: opacity 0.3s, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.pop-enter-from, .pop-leave-to { opacity: 0; transform: scale(0.9); }

/* ── Tab content ─────────────────────────────────────────── */
.tab-content {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.tab-panel {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

/* ── Transition ──────────────────────────────────────────── */
.tab-fade-enter-active,
.tab-fade-leave-active {
  transition: opacity 0.22s ease, transform 0.22s ease;
}

.tab-fade-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

.tab-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* ── Fun Games panel ─────────────────────────────────────── */
.fun-panel {
  padding: 2.5rem 3rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.fun-header {
  text-align: center;
}

.fun-title {
  font-size: 2.5rem;
  font-weight: 900;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.fun-desc {
  font-size: 1.2rem;
  color: var(--text-secondary);
}

.fun-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

/* ── Fun card ────────────────────────────────────────────── */
.fun-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem 1.5rem;
  background: var(--bg-secondary);
  border: 2px solid rgba(255, 255, 255, 0.07);
  border-radius: 20px;
  box-shadow: 0 6px 24px rgba(0,0,0,0.25);
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: default;
  opacity: 0.75;
}

.fun-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 4px;
  background: var(--card-color);
  border-radius: 20px 20px 0 0;
}

.fun-card-icon {
  width: 100%;
  height: 90px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fun-card-icon :deep(svg) {
  width: 80px;
  height: 80px;
  max-width: 100%;
}

.fun-card-body {
  text-align: center;
}

.fun-card-name {
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 0.4rem;
}

.fun-card-desc {
  font-size: 0.95rem;
  color: var(--text-secondary);
  line-height: 1.4;
}

.coming-soon-badge {
  font-size: 0.78rem;
  font-weight: 700;
  padding: 0.3rem 0.9rem;
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 50px;
  color: var(--text-secondary);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.fun-card--playable {
  cursor: pointer;
  opacity: 1;
}

.fun-card--playable:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0,0,0,0.35);
  border-color: var(--card-color);
}

.fun-card--playable:active {
  transform: scale(0.97);
}

.play-badge {
  font-size: 0.85rem;
  font-weight: 800;
  padding: 0.35rem 1rem;
  background: var(--card-color);
  border-radius: 50px;
  color: white;
  letter-spacing: 0.04em;
  box-shadow: 0 4px 12px rgba(0,0,0,0.25);
}
</style>
