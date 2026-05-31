<script setup lang="ts">
import { computed, defineAsyncComponent, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useGameStore } from '../stores/useGameStore';

const route = useRoute();
const router = useRouter();
const gameStore = useGameStore();

const moduleId = computed(() => route.params.id as string);

// Pre-define module registry for robust Vite bundling
const moduleRegistry: Record<string, any> = {
  'tier1-patches': defineAsyncComponent(() => import('../modules/tier1/Patches/index.vue')),
  'tier1-outlines': defineAsyncComponent(() => import('../modules/tier1/Outlines/index.vue')),
  'tier1-matchingcars': defineAsyncComponent(() => import('../modules/tier1/MatchingCars/index.vue')),
  'tier1-matchinganimals': defineAsyncComponent(() => import('../modules/tier1/MatchingAnimals/index.vue')),
  'tier1-basiclanguage': defineAsyncComponent(() => import('../modules/tier1/BasicLanguage/index.vue')),
  'tier2-combine-elephants': defineAsyncComponent(() => import('../modules/tier2/CombineElephants/index.vue')),
  'tier2-combine-butterflies': defineAsyncComponent(() => import('../modules/tier2/CombineButterflies/index.vue')),
  'tier2-combine-trains': defineAsyncComponent(() => import('../modules/tier2/CombineTrains/index.vue')),
  'tier2-odd-one-out': defineAsyncComponent(() => import('../modules/tier2/OddOneOut/index.vue')),
  'tier2-count-everything': defineAsyncComponent(() => import('../modules/tier2/CountEverything/index.vue')),
  'tier2-arithmetics': defineAsyncComponent(() => import('../modules/tier2/Arithmetics/index.vue')),
  'tier3-combinetoys': defineAsyncComponent(() => import('../modules/tier3/CombineToys/index.vue')),
  'tier3-spatial-prepositions': defineAsyncComponent(() => import('../modules/tier3/SpatialPrepositions/index.vue')),
  'tier3-perspectivetaking': defineAsyncComponent(() => import('../modules/tier3/PerspectiveTaking/index.vue')),
  'tier3-analogies': defineAsyncComponent(() => import('../modules/tier3/Analogies/index.vue')),
  'tier3-timeprepositions': defineAsyncComponent(() => import('../modules/tier3/TimePrepositions/index.vue')),
  'tier3-timeprepositions-memory': defineAsyncComponent(() => import('../modules/tier3/TimePrepositionsMemory/index.vue')),
  'tier3-passiveverbtense': defineAsyncComponent(() => import('../modules/tier3/PassiveVerbTense/index.vue')),
  'tier3-catchup-memory': defineAsyncComponent(() => import('../modules/tier3/CatchUpGameMemory/index.vue')),
  'tier3-subjectobject': defineAsyncComponent(() => import('../modules/tier3/SubjectObject/index.vue')),
  'tier3-subjectobject-memory': defineAsyncComponent(() => import('../modules/tier3/SubjectObjectMemory/index.vue')),
  'tier3-carriesorrides': defineAsyncComponent(() => import('../modules/tier3/CarriesOrRides/index.vue')),
  'tier3-carriesorrides-memory': defineAsyncComponent(() => import('../modules/tier3/CarriesOrRidesMemory/index.vue')),
  'tier3-selectiveattention': defineAsyncComponent(() => import('../modules/tier3/SelectiveAttention/index.vue')),
  'tier3-auditory-memory': defineAsyncComponent(() => import('../modules/tier3/AuditoryMemory/index.vue')),
  'tier3-flexible-language-memory': defineAsyncComponent(() => import('../modules/tier3/FlexibleLanguageMemory/index.vue')),
  'tier3-nested-logic': defineAsyncComponent(() => import('../modules/tier3/NestedLogic/index.vue')),
  'fun-animal-jigsaw': defineAsyncComponent(() => import('../modules/fun/AnimalJigsaw/index.vue')),
  'fun-vehicle-jigsaw': defineAsyncComponent(() => import('../modules/fun/VehicleJigsaw/index.vue')),
  'fun-nature-jigsaw': defineAsyncComponent(() => import('../modules/fun/NatureJigsaw/index.vue')),
  'fun-number-puzzle': defineAsyncComponent(() => import('../modules/fun/NumberPuzzle/index.vue')),
};

const ModuleComponent = computed(() => {
  return moduleRegistry[moduleId.value] || null;
});

const goBackToMenu = () => {
  router.push('/');
};

onUnmounted(() => {
  // Cleanup game session when leaving
  gameStore.endGame();
});
</script>

<template>
  <div class="game-view">
    <!-- Global Navigation UI -->
    <header class="game-header">
      <button class="back-btn" @click="goBackToMenu">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back to Menu
      </button>
      <div class="game-stats" v-if="gameStore.isPlaying">
        <span>Score: {{ gameStore.score }}</span>
      </div>
    </header>

    <!-- Dynamic Game Module -->
    <main class="game-content">
      <component 
        v-if="ModuleComponent" 
        :is="ModuleComponent" 
        :key="moduleId"
      />
      
      <div v-else class="error-state">
        <h2>Module not found</h2>
        <p>The requested game module ({{ moduleId }}) could not be loaded.</p>
        <button @click="goBackToMenu" class="back-btn-large">Return to Menu</button>
      </div>
    </main>
  </div>
</template>

<style scoped>
.game-view {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  background-color: var(--bg-primary);
  overflow: hidden;
}

.game-header {
  height: 80px;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--bg-secondary);
  border-bottom: 1px solid rgba(255,255,255,0.1);
  z-index: 100;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: var(--color-neutral);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  font-size: 1.25rem;
  font-weight: bold;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  transition: transform 0.1s ease;
}

.back-btn:active {
  transform: scale(0.95);
}

.game-stats {
  font-size: 1.25rem;
  font-weight: bold;
  color: var(--text-secondary);
}

.game-content {
  flex: 1;
  position: relative;
}
</style>
