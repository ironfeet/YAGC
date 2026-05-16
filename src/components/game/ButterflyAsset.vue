<script setup lang="ts">
import { computed } from 'vue';
import type { ButterflyOrientation, ButterflyWingShape, ButterflyPatternColor, ButterflyBodyColor } from '../../types';

const props = defineProps<{
  renderMode: 'bodyOnly' | 'wingsOnly' | 'full';
  wingShape: ButterflyWingShape;
  patternColor: ButterflyPatternColor;
  bodyColor: ButterflyBodyColor;
  orientation: ButterflyOrientation;
}>();

const transformString = computed(() => {
  return `rotate(${props.orientation}, 100, 100)`;
});
</script>

<template>
  <svg viewBox="0 0 200 200" class="butterfly-asset" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <!-- Base Wing Pattern using the passed color -->
      <pattern id="wing-pattern-spots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
        <circle cx="20" cy="20" r="12" :fill="patternColor" opacity="0.8" />
        <circle cx="40" cy="0" r="6" :fill="patternColor" opacity="0.8" />
        <circle cx="0" cy="40" r="6" :fill="patternColor" opacity="0.8" />
      </pattern>
    </defs>
    
    <g class="butterfly-group" :transform="transformString">
      
      <!-- WINGS LAYER -->
      <g v-if="renderMode !== 'bodyOnly'" class="butterfly-wings">
        <!-- Rounded Wings -->
        <g v-if="wingShape === 'rounded'">
          <!-- White Base -->
          <path d="M 95,95 C 10,20 10,90 95,110 Z" fill="#ffffff" stroke="#333" stroke-width="4" stroke-linejoin="round" />
          <path d="M 105,95 C 190,20 190,90 105,110 Z" fill="#ffffff" stroke="#333" stroke-width="4" stroke-linejoin="round" />
          <path d="M 95,105 C 30,120 40,190 95,150 Z" fill="#ffffff" stroke="#333" stroke-width="4" stroke-linejoin="round" />
          <path d="M 105,105 C 170,120 160,190 105,150 Z" fill="#ffffff" stroke="#333" stroke-width="4" stroke-linejoin="round" />
          
          <!-- Pattern Overlay -->
          <path d="M 95,95 C 10,20 10,90 95,110 Z" fill="url(#wing-pattern-spots)" />
          <path d="M 105,95 C 190,20 190,90 105,110 Z" fill="url(#wing-pattern-spots)" />
          <path d="M 95,105 C 30,120 40,190 95,150 Z" fill="url(#wing-pattern-spots)" />
          <path d="M 105,105 C 170,120 160,190 105,150 Z" fill="url(#wing-pattern-spots)" />
        </g>
        
        <!-- Pointed Wings -->
        <g v-else-if="wingShape === 'pointed'">
          <!-- White Base -->
          <path d="M 95,95 L 10,20 L 10,80 L 95,110 Z" fill="#ffffff" stroke="#333" stroke-width="4" stroke-linejoin="round" />
          <path d="M 105,95 L 190,20 L 190,80 L 105,110 Z" fill="#ffffff" stroke="#333" stroke-width="4" stroke-linejoin="round" />
          <path d="M 95,105 L 30,190 L 70,190 L 95,150 Z" fill="#ffffff" stroke="#333" stroke-width="4" stroke-linejoin="round" />
          <path d="M 105,105 L 170,190 L 130,190 L 105,150 Z" fill="#ffffff" stroke="#333" stroke-width="4" stroke-linejoin="round" />
          
          <!-- Pattern Overlay -->
          <path d="M 95,95 L 10,20 L 10,80 L 95,110 Z" fill="url(#wing-pattern-spots)" />
          <path d="M 105,95 L 190,20 L 190,80 L 105,110 Z" fill="url(#wing-pattern-spots)" />
          <path d="M 95,105 L 30,190 L 70,190 L 95,150 Z" fill="url(#wing-pattern-spots)" />
          <path d="M 105,105 L 170,190 L 130,190 L 105,150 Z" fill="url(#wing-pattern-spots)" />
        </g>

        <!-- Triangle Wings -->
        <g v-else-if="wingShape === 'triangle'">
          <path d="M 95,95 L 10,20 L 10,95 Z" fill="#ffffff" stroke="#333" stroke-width="4" stroke-linejoin="round" />
          <path d="M 105,95 L 190,20 L 190,95 Z" fill="#ffffff" stroke="#333" stroke-width="4" stroke-linejoin="round" />
          <path d="M 95,105 L 10,180 L 10,105 Z" fill="#ffffff" stroke="#333" stroke-width="4" stroke-linejoin="round" />
          <path d="M 105,105 L 190,180 L 190,105 Z" fill="#ffffff" stroke="#333" stroke-width="4" stroke-linejoin="round" />
          
          <path d="M 95,95 L 10,20 L 10,95 Z" fill="url(#wing-pattern-spots)" />
          <path d="M 105,95 L 190,20 L 190,95 Z" fill="url(#wing-pattern-spots)" />
          <path d="M 95,105 L 10,180 L 10,105 Z" fill="url(#wing-pattern-spots)" />
          <path d="M 105,105 L 190,180 L 190,105 Z" fill="url(#wing-pattern-spots)" />
        </g>

        <!-- Wide Wings -->
        <g v-else-if="wingShape === 'wide'">
          <path d="M 95,95 C 10,0 10,120 95,110 Z" fill="#ffffff" stroke="#333" stroke-width="4" stroke-linejoin="round" />
          <path d="M 105,95 C 190,0 190,120 105,110 Z" fill="#ffffff" stroke="#333" stroke-width="4" stroke-linejoin="round" />
          <path d="M 95,105 C 10,200 10,80 95,150 Z" fill="#ffffff" stroke="#333" stroke-width="4" stroke-linejoin="round" />
          <path d="M 105,105 C 190,200 190,80 105,150 Z" fill="#ffffff" stroke="#333" stroke-width="4" stroke-linejoin="round" />

          <path d="M 95,95 C 10,0 10,120 95,110 Z" fill="url(#wing-pattern-spots)" />
          <path d="M 105,95 C 190,0 190,120 105,110 Z" fill="url(#wing-pattern-spots)" />
          <path d="M 95,105 C 10,200 10,80 95,150 Z" fill="url(#wing-pattern-spots)" />
          <path d="M 105,105 C 190,200 190,80 105,150 Z" fill="url(#wing-pattern-spots)" />
        </g>
      </g>

      <!-- BODY LAYER -->
      <g v-if="renderMode !== 'wingsOnly'" class="butterfly-body">
        <!-- Antennae -->
        <path d="M 90,30 Q 70,5 50,10 M 110,30 Q 130,5 150,10" fill="none" stroke="#333" stroke-width="4" stroke-linecap="round" />
        <!-- Body -->
        <ellipse cx="100" cy="100" rx="12" ry="45" :fill="bodyColor" stroke="#222" stroke-width="3" />
        <!-- Head -->
        <circle cx="100" cy="45" r="14" :fill="bodyColor" stroke="#222" stroke-width="3" />
        <!-- Eyes -->
        <circle cx="94" cy="42" r="3" fill="white" />
        <circle cx="106" cy="42" r="3" fill="white" />
        <circle cx="94" cy="42" r="1.5" fill="black" />
        <circle cx="106" cy="42" r="1.5" fill="black" />
      </g>
      
    </g>
  </svg>
</template>

<style scoped>
.butterfly-asset {
  width: 100%;
  height: 100%;
  display: block;
}

.butterfly-group {
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
</style>
