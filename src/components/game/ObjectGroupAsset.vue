<script setup lang="ts">
import { computed } from 'vue';
import type { MathItemType } from '../../types';

const props = defineProps<{
  count: number;
  itemType: MathItemType;
  renderAsNumber: boolean;
}>();

const items = computed(() => {
  return Array.from({ length: props.count }, (_, i) => i);
});
</script>

<template>
  <div class="object-group-asset" :class="{ 'is-number': renderAsNumber }">
    <template v-if="renderAsNumber">
      <div class="number-text">{{ count }}</div>
    </template>
    <template v-else>
      <div class="items-grid" :class="[`count-${Math.min(count, 10)}`]">
        <svg 
          v-for="i in items" 
          :key="i"
          class="item-svg" 
          viewBox="0 0 100 100" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <!-- BALL -->
          <g v-if="itemType === 'ball'">
            <circle cx="50" cy="50" r="40" fill="#2196f3" stroke="#1565c0" stroke-width="4" />
            <path d="M 30,20 Q 50,50 30,80 M 70,20 Q 50,50 70,80" fill="none" stroke="#64b5f6" stroke-width="3" />
          </g>
          
          <!-- APPLE -->
          <g v-else-if="itemType === 'apple'">
            <path d="M 50,25 C 20,10 10,60 50,90 C 90,60 80,10 50,25 Z" fill="#f44336" stroke="#c62828" stroke-width="4" stroke-linejoin="round" />
            <path d="M 50,25 Q 60,10 70,5" fill="none" stroke="#5d4037" stroke-width="4" stroke-linecap="round" />
            <path d="M 60,15 C 65,5 80,10 80,20 C 80,30 65,25 60,15 Z" fill="#4caf50" stroke="#2e7d32" stroke-width="2" />
          </g>
          
          <!-- STAR -->
          <g v-else-if="itemType === 'star'">
            <path d="M 50,10 L 61,35 L 88,39 L 68,58 L 73,85 L 50,73 L 27,85 L 32,58 L 12,39 L 39,35 Z" fill="#ffeb3b" stroke="#fbc02d" stroke-width="4" stroke-linejoin="round" />
          </g>
        </svg>
      </div>
    </template>
  </div>
</template>

<style scoped>
.object-group-asset {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  box-sizing: border-box;
}

.is-number {
  background-color: transparent;
}

.number-text {
  font-size: 8rem;
  font-weight: 900;
  color: #333;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
  font-family: 'Inter', sans-serif;
}

.items-grid {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 5px;
  width: 100%;
  height: 100%;
}

.item-svg {
  width: 45%;
  height: 45%;
  max-width: 60px;
  max-height: 60px;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.15));
}

/* Specific sizing for grids to keep them tidy */
.count-1 .item-svg { width: 80%; height: 80%; max-width: 100px; max-height: 100px; }
.count-2 .item-svg { width: 45%; height: 45%; }
.count-3 .item-svg { width: 45%; height: 45%; }
.count-4 .item-svg { width: 45%; height: 45%; }
.count-5 .item-svg { width: 30%; height: 30%; }
.count-6 .item-svg { width: 30%; height: 30%; }
.count-7 .item-svg { width: 25%; height: 25%; }
.count-8 .item-svg { width: 25%; height: 25%; }
.count-9 .item-svg { width: 30%; height: 30%; max-width: 40px; }
.count-10 .item-svg { width: 25%; height: 25%; max-width: 35px; }
</style>
