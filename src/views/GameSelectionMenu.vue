<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import MenuIcon from '../components/game/MenuIcon.vue';

const props = defineProps<{ embedded?: boolean }>();
const router = useRouter();
const menuRef = ref<HTMLElement | null>(null);

let isDragging = false;
let startY = 0;
let scrollTop = 0;
let didDrag = false;

const onDragStart = (e: MouseEvent | TouchEvent) => {
  isDragging = true;
  didDrag = false;
  const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
  startY = clientY;
  if (menuRef.value) scrollTop = menuRef.value.scrollTop;
};

const onDragMove = (e: MouseEvent | TouchEvent) => {
  if (!isDragging || !menuRef.value) return;
  const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
  const walk = clientY - startY;
  if (Math.abs(walk) > 10) didDrag = true;
  menuRef.value.scrollTop = scrollTop - walk;
};

const onDragEnd = () => { isDragging = false; };

const goToGame = (id: string, e: Event) => {
  if (didDrag) { e.preventDefault(); e.stopPropagation(); return; }
  router.push(`/game/${id}`);
};

const tiers = [
  {
    key: 'tier1',
    label: 'Tier 1',
    sublabel: 'Foundational',
    color: '#22c55e',
    games: [
      { id: 'tier1-patches',         name: 'Patches',           desc: 'Match colors & patterns to fill scene holes' },
      { id: 'tier1-outlines',        name: 'Outlines',          desc: 'Drag silhouettes to their matching shapes' },
      { id: 'tier1-matchingcars',    name: 'Matching Cars',     desc: 'Find the car that matches every detail' },
      { id: 'tier1-matchinganimals', name: 'Matching Animals',  desc: 'Match animals by color, size & direction' },
      { id: 'tier1-basiclanguage',   name: 'Basic Language',    desc: 'Find the object that matches the spoken cue' },
    ],
  },
  {
    key: 'tier2',
    label: 'Tier 2',
    sublabel: 'Intermediate',
    color: '#3b82f6',
    games: [
      { id: 'tier2-combine-elephants',    name: 'Combine Elephants',    desc: 'Join elephant halves to build the target' },
      { id: 'tier2-combine-butterflies',  name: 'Combine Butterflies',  desc: 'Assemble butterfly wings to match the goal' },
      { id: 'tier2-combine-trains',       name: 'Combine Trains',       desc: 'Link train halves to form the correct pair' },
      { id: 'tier2-odd-one-out',          name: 'Odd One Out',          desc: 'Spot the bug that doesn\'t belong in the swarm' },
      { id: 'tier2-count-everything',     name: 'Count Everything',     desc: 'Count scattered objects and pick the number' },
      { id: 'tier2-arithmetics',          name: 'Arithmetics',          desc: 'Solve counting, addition & subtraction' },
    ],
  },
  {
    key: 'tier3',
    label: 'Tier 3',
    sublabel: 'Advanced',
    color: '#ef4444',
    games: [
      { id: 'tier3-combinetoys',                name: 'Combine Toys',               desc: 'Assemble mixed toy parts into a complete set' },
      { id: 'tier3-spatial-prepositions',       name: 'Spatial Prepositions',       desc: 'Place toys using in / behind / in front' },
      { id: 'tier3-perspectivetaking',          name: 'Perspective Taking',         desc: 'See the grid from another character\'s viewpoint' },
      { id: 'tier3-auditory-memory',            name: 'Auditory Memory',            desc: 'Listen then place items into the right containers' },
      { id: 'tier3-flexible-language-memory',   name: 'Flexible Language',          desc: 'Handle negation, multi-select & sequential rules' },
      { id: 'tier3-nested-logic',               name: 'Nested Logic',               desc: 'Place animals using compound relational rules' },
      { id: 'tier3-analogies',                  name: 'Analogies',                  desc: 'Deduce A→B transformation and apply it to C→?' },
      { id: 'tier3-timeprepositions',           name: 'Time Prepositions',          desc: 'Order events using before & after grammar' },
      { id: 'tier3-timeprepositions-memory',    name: 'Time Prepositions: Memory',  desc: 'Same as above — but options hide during audio' },
      { id: 'tier3-passiveverbtense',           name: 'Passive Verb Tense',         desc: 'Parse active & passive race grammar to find the winner' },
      { id: 'tier3-catchup-memory',             name: 'Catch Up: Memory',           desc: 'Race grammar with options hidden during playback' },
      { id: 'tier3-subjectobject',              name: 'Subject Object',             desc: 'Who gets wet? Parse the garden-hose sentence' },
      { id: 'tier3-subjectobject-memory',       name: 'Subject Object: Memory',     desc: 'Same — but options hide while you listen' },
      { id: 'tier3-carriesorrides',             name: 'Carries or Rides',           desc: 'Assign rider & carrier from the verb meaning' },
      { id: 'tier3-carriesorrides-memory',      name: 'Carries or Rides: Memory',   desc: 'Same — options hidden during audio' },
      { id: 'tier3-selectiveattention',         name: 'Selective Attention',        desc: 'Tap all target items hidden in a crowded field' },
    ],
  },
];
</script>

<template>
  <div
    class="menu-container"
    ref="menuRef"
    @mousedown="onDragStart"
    @mousemove="onDragMove"
    @mouseup="onDragEnd"
    @mouseleave="onDragEnd"
    @touchstart="onDragStart"
    @touchmove="onDragMove"
    @touchend="onDragEnd"
  >
    <!-- Standalone header (hidden when embedded in GlobalMenu) -->
    <div class="menu-header" v-if="!props.embedded">
      <h1 class="menu-title">🎯 MITA Curriculum</h1>
      <button class="stats-btn" @click="router.push('/statistics')">📊 Statistics</button>
    </div>

    <!-- Tier sections -->
    <div v-for="tier in tiers" :key="tier.key" class="tier-section">
      <!-- Tier header -->
      <div class="tier-header">
        <span class="tier-dot" :style="{ background: tier.color }"></span>
        <div>
          <h2 class="tier-label">{{ tier.label }}</h2>
          <p class="tier-sublabel">{{ tier.sublabel }}</p>
        </div>
        <span class="tier-count">{{ tier.games.length }} games</span>
      </div>

      <!-- Game cards -->
      <div class="games-grid">
        <button
          v-for="game in tier.games"
          :key="game.id"
          class="game-card"
          :style="{ '--tier-color': tier.color }"
          @click="(e) => goToGame(game.id, e)"
        >
          <!-- Color accent stripe -->
          <span class="card-stripe"></span>

          <!-- Icon area -->
          <div class="card-icon">
            <MenuIcon :gameId="game.id" />
          </div>

          <!-- Text area -->
          <div class="card-body">
            <span class="card-name">{{ game.name }}</span>
            <span class="card-desc">{{ game.desc }}</span>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ── Container ───────────────────────────────────────────── */
.menu-container {
  padding: 2.5rem 3rem;
  background-color: var(--bg-primary);
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  overflow-y: auto;
  touch-action: pan-y;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 5rem;
  box-sizing: border-box;
}

/* ── Standalone header ───────────────────────────────────── */
.menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.menu-title {
  font-size: 2.4rem;
  font-weight: 900;
  color: var(--text-primary);
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

/* ── Tier section ────────────────────────────────────────── */
.tier-section {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.tier-header {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.tier-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 0 10px currentColor;
}

.tier-label {
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--text-primary);
  line-height: 1.1;
}

.tier-sublabel {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.tier-count {
  margin-left: auto;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-secondary);
  background: rgba(255,255,255,0.07);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 50px;
  padding: 0.25rem 0.8rem;
}

/* ── Games grid ──────────────────────────────────────────── */
.games-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1.2rem;
}

/* ── Game card ───────────────────────────────────────────── */
.game-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  padding: 0;
  background: var(--bg-secondary);
  border: 2px solid rgba(255,255,255,0.07);
  border-radius: 18px;
  box-shadow: 0 4px 18px rgba(0,0,0,0.22);
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.18s cubic-bezier(0.4, 0, 0.2, 1),
              box-shadow 0.18s ease,
              border-color 0.18s ease;
  text-align: center;
  color: var(--text-primary);
}

.game-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.35);
  border-color: var(--tier-color);
}

.game-card:active {
  transform: scale(0.97);
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

/* Color accent stripe at top */
.card-stripe {
  display: block;
  width: 100%;
  height: 4px;
  background: var(--tier-color);
  flex-shrink: 0;
}

/* Icon area */
.card-icon {
  width: 100%;
  padding: 1.4rem 1.2rem 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 90px;
}

.card-icon :deep(svg) {
  width: 80px;
  height: 80px;
  max-width: 100%;
}

/* Text area */
.card-body {
  width: 100%;
  padding: 0.6rem 1rem 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.card-name {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--text-primary);
  line-height: 1.2;
}

.card-desc {
  font-size: 0.8rem;
  color: var(--text-secondary);
  line-height: 1.4;
  font-weight: 400;
}
</style>
