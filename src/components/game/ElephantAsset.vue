<script setup lang="ts">
import { computed } from 'vue';
import type { ElephantBodyShape, ElephantEarColor, ElephantBodyColor, ElephantEarOrnament } from '../../types';

const props = defineProps<{
  renderMode: 'bodyOnly' | 'earOnly' | 'full';
  bodyShape: ElephantBodyShape;
  bodyColor: ElephantBodyColor;
  isFacingLeft: boolean; // Computed from Orientation
  earColor: ElephantEarColor;
  earOrnament: ElephantEarOrnament;
}>();

const transformString = computed(() => {
  // Center is 100, 100
  if (props.isFacingLeft) {
    return 'translate(200, 0) scale(-1, 1)';
  }
  return '';
});

// Ear ornamentation pattern url generator
const earOrnamentFillUrl = computed(() => {
  if (props.earOrnament === 'stars') return 'url(#ear-stars-pattern)';
  if (props.earOrnament === 'stripes') return 'url(#ear-stripes-pattern)';
  if (props.earOrnament === 'polka-dots') return 'url(#ear-dots-pattern)';
  return 'none';
});
</script>

<template>
  <svg viewBox="0 0 200 200" class="elephant-asset" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <!-- Universal Ear Patterns -->
      <pattern id="ear-stars-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 10,0 L 13,7 L 20,7 L 14,12 L 16,19 L 10,15 L 4,19 L 6,12 L 0,7 L 7,7 Z" fill="rgba(255,255,255,0.7)" transform="scale(0.8) translate(2.5, 2.5)" />
      </pattern>
      
      <pattern id="ear-stripes-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <line x1="0" y1="10" x2="20" y2="10" stroke="rgba(255,255,255,0.7)" stroke-width="6" />
      </pattern>

      <pattern id="ear-dots-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="rotate(15)">
        <circle cx="10" cy="10" r="5" fill="rgba(255,255,255,0.7)" />
      </pattern>
    </defs>
    
    <g class="elephant-group" :transform="transformString">
      
      <!-- LAYER 1: THE BODY -->
      <g v-if="renderMode !== 'earOnly'" class="elephant-body">
        
        <template v-if="bodyShape === 'rounded'">
          <!-- Rounded Body -->
          <path d="M 70,100 C 70,30 170,30 170,100 L 170,160 C 150,160 140,160 130,160 L 130,120 L 110,120 L 110,160 C 90,160 80,160 70,160 Z" :fill="bodyColor" stroke="#333" stroke-width="4" stroke-linejoin="round" />
          <!-- Head -->
          <circle cx="70" cy="90" r="35" :fill="bodyColor" stroke="#333" stroke-width="4" />
        </template>

        <template v-else-if="bodyShape === 'angular'">
          <!-- Angular Body -->
          <path d="M 70,50 L 170,50 L 170,160 L 130,160 L 130,120 L 110,120 L 110,160 L 70,160 Z" :fill="bodyColor" stroke="#333" stroke-width="4" stroke-linejoin="round" />
          <!-- Angular Head -->
          <rect x="35" y="55" width="70" height="70" rx="10" :fill="bodyColor" stroke="#333" stroke-width="4" />
        </template>

        <template v-else-if="bodyShape === 'oval'">
          <!-- Oval Body -->
          <ellipse cx="120" cy="105" rx="55" ry="45" :fill="bodyColor" stroke="#333" stroke-width="4" />
          <rect x="70" y="140" width="30" height="20" :fill="bodyColor" stroke="#333" stroke-width="4" />
          <rect x="130" y="140" width="30" height="20" :fill="bodyColor" stroke="#333" stroke-width="4" />
          <rect x="75" y="140" width="20" height="25" :fill="bodyColor" />
          <rect x="135" y="140" width="20" height="25" :fill="bodyColor" />
          <!-- Oval Head -->
          <ellipse cx="65" cy="85" rx="30" ry="40" :fill="bodyColor" stroke="#333" stroke-width="4" />
        </template>

        <template v-else-if="bodyShape === 'blocky'">
          <!-- Blocky Body -->
          <rect x="70" y="60" width="100" height="80" :fill="bodyColor" stroke="#333" stroke-width="4" />
          <rect x="70" y="140" width="25" height="20" :fill="bodyColor" stroke="#333" stroke-width="4" />
          <rect x="145" y="140" width="25" height="20" :fill="bodyColor" stroke="#333" stroke-width="4" />
          <rect x="75" y="130" width="15" height="25" :fill="bodyColor" />
          <rect x="150" y="130" width="15" height="25" :fill="bodyColor" />
          <!-- Blocky Head -->
          <polygon points="35,50 100,50 100,120 35,120" :fill="bodyColor" stroke="#333" stroke-width="4" stroke-linejoin="round" />
        </template>
        
        <!-- Trunk (Shared) -->
        <path d="M 45,100 Q 15,130 15,160 Q 40,160 45,130 Q 55,105 55,105" :fill="bodyColor" stroke="#333" stroke-width="4" />
        
        <!-- Eye (Shared) -->
        <circle cx="50" cy="85" r="5" fill="#333" />
        <circle cx="52" cy="83" r="1.5" fill="white" />
        
        <!-- Tail (Shared) -->
        <path d="M 170,90 Q 190,110 185,140" fill="none" stroke="#333" stroke-width="4" stroke-linecap="round" />
      </g>

      <!-- LAYER 2: THE EAR -->
      <!-- The ear renders at exactly the same coordinates even when bodyOnly is active, creating the perfect puzzle piece illusion -->
      <g v-if="renderMode !== 'bodyOnly'" class="elephant-ear">
        <!-- Ear Base Shape -->
        <path d="M 75,70 C 110,50 120,90 110,120 C 100,150 70,140 65,110 C 60,80 70,75 75,70 Z" :fill="earColor" stroke="#333" stroke-width="4" stroke-linejoin="round" />
        
        <!-- Ear Pattern Overlay -->
        <path d="M 75,70 C 110,50 120,90 110,120 C 100,150 70,140 65,110 C 60,80 70,75 75,70 Z" :fill="earOrnamentFillUrl" />
        
        <!-- Inner Ear Shadow -->
        <path d="M 78,80 C 100,65 105,95 98,115 C 92,130 75,125 72,105 Z" fill="rgba(0,0,0,0.1)" />
      </g>
      
    </g>
  </svg>
</template>

<style scoped>
.elephant-asset {
  width: 100%;
  height: 100%;
  display: block;
}

.elephant-group {
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
</style>
