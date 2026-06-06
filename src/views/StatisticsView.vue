<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useProgressStore } from '../stores/useProgressStore';

const route = useRoute();
const router = useRouter();
const progressStore = useProgressStore();

onMounted(() => {
  progressStore.initMissingStats();
});

const activeTab = computed(() => route.query.tab === 'fun' ? 'fun' : 'mita');

const goBack = () => {
  router.push('/');
};

const handleReset = () => {
  if (confirm(`Are you sure you want to reset all ${activeTab.value === 'fun' ? 'Fun Game' : 'MITA'} statistics? This cannot be undone.`)) {
    // Collect keys to delete first to avoid mutating the object while iterating it
    const keysToDelete: string[] = [];
    for (const key in progressStore.moduleStats) {
      const isFunGame = key.startsWith('fun-');
      if ((activeTab.value === 'fun' && isFunGame) || (activeTab.value === 'mita' && !isFunGame)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => { delete progressStore.moduleStats[key]; });
    progressStore.initMissingStats(); // Re-initialize immediately with default zeroed values
    // Patch to force reactivity/persistence
    progressStore.$patch({ moduleStats: { ...progressStore.moduleStats } });
  }
};

// Mapping from GameSelectionMenu
const gameNames: Record<string, string> = {
  // Fun games
  'fun-animal-jigsaw': 'Animal Jigsaw',
  'fun-vehicle-jigsaw': 'Vehicle Jigsaw',
  'fun-nature-jigsaw': 'Nature Jigsaw',
  'fun-number-puzzle': 'Number Puzzle',
  'fun-color-board': 'Color Board',
  'fun-shape-sorter': 'Shape Sorter',
  'fun-shadow-match': 'Shadow Match',
  'fun-size-sorter': 'Size Sorter',
  'fun-pattern-train': 'Pattern Train',
  'fun-category-bins': 'Category Bins',
  'fun-memory-match': 'Memory Match',
  'fun-connect-dots': 'Connect the Dots',
  // MITA games
  'tier1-patches': 'Patches',
  'tier1-outlines': 'Outlines',
  'tier1-matching-cars': 'Matching Cars',
  'tier1-matching-animals': 'Matching Animals',
  'tier1-basiclanguage': 'Basic Language',
  'tier2-combine-elephants': 'Combine Elephants',
  'tier2-combine-butterflies': 'Combine Butterflies',
  'tier2-combine-trains': 'Combine Trains',
  'tier2-odd-one-out': 'Odd One Out',
  'tier2-count-everything': 'Count Everything',
  'tier2-arithmetics': 'Arithmetics',
  'tier3-spatial-prepositions': 'Spatial Prepositions',
  'tier3-perspectivetaking': 'Perspective Taking',
  'tier3-auditory-memory': 'Auditory Memory',
  'tier3-flexible-language-memory': 'Flexible Language & Memory',
  'tier3-nested-logic': 'Nested Logic',
  'tier3-analogies': 'Analogies',
  'tier3-timeprepositions': 'Time Prepositions',
  'tier3-timeprepositions-memory': 'Time Prepositions: Memory',
  'tier3-passiveverbtense': 'Passive Verb Tense',
  'tier3-catchup-memory': 'Catch Up Game: Memory',
  'tier3-subjectobject': 'Subject Object',
  'tier3-subjectobject-memory': 'Subject Object: Memory',
  'tier3-carriesorrides': 'Carries Or Rides',
  'tier3-carriesorrides-memory': 'Carries Or Rides: Memory',
  'tier3-selectiveattention': 'Selective Attention',
  'tier3-combinetoys': 'Combine Toys',
};

const filteredStats = computed(() => {
  const result: Record<string, any> = {};
  for (const key in progressStore.moduleStats) {
    if (!gameNames[key]) continue; // Ignore legacy or unknown keys
    const isFunGame = key.startsWith('fun-');
    if ((activeTab.value === 'fun' && isFunGame) || (activeTab.value === 'mita' && !isFunGame)) {
      result[key] = progressStore.moduleStats[key];
    }
  }
  return result;
});


</script>

<template>
  <div class="stats-container">
    <div class="header">
      <div class="header-left">
        <button class="back-btn" @click="goBack">Back</button>
        <h1 class="stats-title">Game Statistics</h1>
      </div>
      <button class="reset-btn" @click="handleReset">Reset All</button>
    </div>
    
    <div class="stats-table-wrapper">
      <table class="stats-table">
        <thead>
          <tr>
            <th>Game</th>
            <th>Current Phase (Max)</th>
            <th>Current Option Count (Max)</th>
            <th>Prompt Level</th>
            <th>Success Rate (%)</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(stat, id) in filteredStats" :key="id">
            <td>{{ gameNames[id] || id }}</td>
            <td>
              <div class="input-group">
                <input type="number" v-model.number="stat.currentPhase" :max="stat.highestPhase" min="1" class="stat-input" />
                <span class="max-hint">/ {{ stat.highestPhase }}</span>
              </div>
            </td>
            <td>
              <div class="input-group">
                <input type="number" v-model.number="stat.currentOptionCount" :max="stat.highestOptionCount" min="2" class="stat-input" />
                <span class="max-hint">/ {{ stat.highestOptionCount }}</span>
              </div>
            </td>
            <td>
              <select v-model="stat.currentPromptLevel" class="stat-select">
                <option value="none">none</option>
                <option value="partial">partial</option>
                <option value="full">full</option>
              </select>
            </td>
            <td>
              <input type="number" v-model.number="stat.successRate" class="stat-input" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.input-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.max-hint {
  color: rgba(255, 255, 255, 0.5);
  font-size: 1.1rem;
}

.stats-container {
  padding: 3rem;
  background: var(--bg-primary);
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  overflow-y: auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.back-btn, .reset-btn {
  padding: 1rem 2rem;
  font-size: 1.5rem;
  color: var(--text-primary);
  border: none;
  border-radius: var(--border-radius-md);
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0,0,0,0.2);
  transition: transform 0.1s ease;
}

.back-btn {
  background-color: var(--bg-secondary);
}

.reset-btn {
  background-color: var(--color-red);
  font-weight: bold;
}

.back-btn:active, .reset-btn:active {
  transform: scale(0.95);
}

.stats-title {
  font-size: 3rem;
  color: var(--text-primary);
  margin: 0;
}

.stats-table-wrapper {
  background: var(--bg-secondary);
  border-radius: var(--border-radius-lg);
  padding: 2rem;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
  overflow-x: auto;
}

.stats-table {
  width: 100%;
  border-collapse: collapse;
  color: var(--text-primary);
  font-size: 1.2rem;
}

.stats-table th, .stats-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.stats-table th {
  font-weight: bold;
  font-size: 1.4rem;
  color: var(--color-blue);
}

.stats-table tr:last-child td {
  border-bottom: none;
}

.stat-input, .stat-select {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  padding: 0.5rem;
  border-radius: var(--border-radius-sm, 4px);
  font-size: 1.2rem;
  width: 80px;
}

.stat-select {
  width: auto;
  cursor: pointer;
}

.stat-input:focus, .stat-select:focus {
  outline: 2px solid var(--color-blue);
}
</style>
