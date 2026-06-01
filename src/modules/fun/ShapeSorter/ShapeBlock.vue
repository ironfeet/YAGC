<script setup lang="ts">
const props = defineProps<{
  shape: string;
  color: string;
  isSlot?: boolean;
}>();
</script>

<template>
  <div 
    class="shape-block"
    :class="{ 'is-slot': isSlot }"
    :style="{ '--shape-color': color }"
  >
    <svg viewBox="0 0 100 100" class="shape-svg" preserveAspectRatio="xMidYMid meet">
      <!-- 3D effect filters -->
      <defs>
        <filter id="drop-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="4" flood-color="rgba(0,0,0,0.3)"/>
        </filter>
        <filter id="inset-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="rgba(0,0,0,0.6)" result="shadow1" />
        </filter>
      </defs>

      <g :filter="isSlot ? 'url(#inset-shadow)' : 'url(#drop-shadow)'">
        <!-- Circle -->
        <circle v-if="shape === 'circle'" cx="50" cy="50" r="45" />
        
        <!-- Square -->
        <rect v-else-if="shape === 'square'" x="10" y="10" width="80" height="80" rx="12" />
        
        <!-- Triangle -->
        <polygon v-else-if="shape === 'triangle'" points="50,10 90,85 10,85" stroke-linejoin="round" />
        
        <!-- Star -->
        <polygon v-else-if="shape === 'star'" points="50,5 64,35 97,35 70,55 80,88 50,70 20,88 30,55 3,35 36,35" stroke-linejoin="round" />
        
        <!-- Pentagon -->
        <polygon v-else-if="shape === 'pentagon'" points="50,10 95,40 80,90 20,90 5,40" stroke-linejoin="round" />
        
        <!-- Hexagon -->
        <polygon v-else-if="shape === 'hexagon'" points="50,5 90,25 90,75 50,95 10,75 10,25" stroke-linejoin="round" />
        
        <!-- Diamond -->
        <polygon v-else-if="shape === 'diamond'" points="50,10 85,50 50,90 15,50" stroke-linejoin="round" />
        
        <!-- Heart -->
        <path v-else-if="shape === 'heart'" d="M50,85 C50,85 10,55 10,30 C10,15 25,5 40,15 C50,25 50,25 50,25 C50,25 50,25 60,15 C75,5 90,15 90,30 C90,55 50,85 50,85 Z" stroke-linejoin="round" />
        
        <!-- Cross -->
        <polygon v-else-if="shape === 'cross'" points="35,10 65,10 65,35 90,35 90,65 65,65 65,90 35,90 35,65 10,65 10,35 35,35" stroke-linejoin="round" />
        
        <!-- Crescent -->
        <path v-else-if="shape === 'crescent'" d="M 60,10 A 40,40 0 1,0 60,90 A 30,30 0 1,1 60,10 Z" />
      </g>
      
      <!-- Inner highlight overlay for non-slots to give it a 3D bevel look -->
      <g v-if="!isSlot" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="4">
        <circle v-if="shape === 'circle'" cx="50" cy="50" r="43" />
        <rect v-else-if="shape === 'square'" x="12" y="12" width="76" height="76" rx="10" />
        <polygon v-else-if="shape === 'triangle'" points="50,14 86,81 14,81" stroke-linejoin="round" />
        <polygon v-else-if="shape === 'star'" points="50,9 62,37 93,37 68,55 77,84 50,68 23,84 32,55 7,37 38,37" stroke-linejoin="round" />
        <polygon v-else-if="shape === 'pentagon'" points="50,14 91,42 77,86 23,86 9,42" stroke-linejoin="round" />
        <polygon v-else-if="shape === 'hexagon'" points="50,9 86,27 86,73 50,91 14,73 14,27" stroke-linejoin="round" />
        <polygon v-else-if="shape === 'diamond'" points="50,14 81,50 50,86 19,50" stroke-linejoin="round" />
        <!-- Skip highlight on heart/cross/crescent for simplicity -->
      </g>
    </svg>
  </div>
</template>

<style scoped>
.shape-block {
  width: 100px;
  height: 100px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  touch-action: none;
}

.shape-svg {
  width: 100%;
  height: 100%;
  overflow: visible;
}

.shape-svg g {
  fill: var(--shape-color);
  stroke: rgba(0,0,0,0.15);
  stroke-width: 2;
  transition: fill 0.2s;
}

.shape-block.is-slot .shape-svg g {
  fill: rgba(0, 0, 0, 0.2);
  stroke: rgba(0, 0, 0, 0.3);
  stroke-width: 3;
}
</style>
