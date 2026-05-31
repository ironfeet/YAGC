<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import GameSelectionMenu from './GameSelectionMenu.vue';
import MenuIcon from '../components/game/MenuIcon.vue';
import { useProgressStore } from '../stores/useProgressStore';

const router = useRouter();
const route = useRoute();
const progressStore = useProgressStore();

// Initialize active tab from URL query if present, otherwise fallback to user preference
const activeTab = ref<'mita' | 'fun'>((route.query.tab as 'mita' | 'fun') || progressStore.defaultHomeMenu);

const funGames = [
  {
    id: 'fun-animal-jigsaw',
    name: 'Animal Jigsaw',
    description: 'Piece together fun animal puzzles',
    emoji: '🦁',
    color: '#f97316',
    comingSoon: false,
  },
  {
    id: 'fun-vehicle-jigsaw',
    name: 'Vehicle Jigsaw',
    description: 'Build cars, trains and planes',
    emoji: '🚂',
    color: '#3b82f6',
    comingSoon: false,
  },
  {
    id: 'fun-number-puzzle',
    name: 'Number Puzzle',
    description: 'Learn and place numbers',
    emoji: '🔢',
    color: '#0284c7',
    comingSoon: false,
  },
  {
    id: 'puzzle-colors',
    name: 'Color Board',
    description: 'Slide colored tiles to solve the board',
    emoji: '🎨',
    color: '#a855f7',
    comingSoon: true,
  },
  {
    id: 'fun-nature-jigsaw',
    name: 'Nature Jigsaw',
    description: 'Piece together beautiful nature scenes',
    emoji: '🌲',
    color: '#059669',
    comingSoon: false,
  },
  {
    id: 'puzzle-shapes',
    name: 'Shape Sorter',
    description: 'Fit shapes into the correct holes',
    emoji: '🔷',
    color: '#ec4899',
    comingSoon: true,
  },
];
</script>

<template>
  <div class="global-menu">

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
          @click="activeTab = 'mita'"
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
          @click="activeTab = 'fun'"
        >
          <span class="tab-icon">🧩</span>
          <span class="tab-label">Fun Games</span>
          <span class="tab-sub">Jigsaw & Puzzles</span>
        </button>
      </nav>

      <div class="header-right">
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
            <p class="fun-desc">Jigsaw puzzles and board games — coming soon!</p>
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
