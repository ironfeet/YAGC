<script setup lang="ts">
import { computed } from 'vue';
import type { BugShape, BugPattern, BugRotation } from '../../types';

const props = defineProps<{
  color: string;
  shape: BugShape;
  pattern: BugPattern;
  rotation: BugRotation;
}>();

const transformString = computed(() => {
  // Rotate around the center (100, 100)
  return `rotate(${props.rotation}, 100, 100)`;
});

const patternFillUrl = computed(() => {
  if (props.pattern === 'spots') return 'url(#bug-spots-pattern)';
  if (props.pattern === 'stripes') return 'url(#bug-stripes-pattern)';
  if (props.pattern === 'zigzag') return 'url(#bug-zigzag-pattern)';
  return 'none';
});
</script>

<template>
  <svg viewBox="0 0 200 200" class="bug-asset" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <!-- Universal Pattern Definitions -->
      <pattern id="bug-spots-pattern" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse" patternTransform="rotate(15)">
        <circle cx="15" cy="15" r="7" fill="rgba(0,0,0,0.25)" />
      </pattern>
      
      <pattern id="bug-stripes-pattern" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <line x1="0" y1="15" x2="30" y2="15" stroke="rgba(0,0,0,0.25)" stroke-width="10" />
      </pattern>

      <pattern id="bug-zigzag-pattern" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
        <path d="M 0,15 L 7.5,5 L 15,15 L 22.5,25 L 30,15" fill="none" stroke="rgba(0,0,0,0.25)" stroke-width="4" stroke-linejoin="round" />
      </pattern>
    </defs>
    
    <g class="bug-group" :transform="transformString">
      
      <!-- BEETLE -->
      <g v-if="shape === 'beetle'">
        <!-- Legs -->
        <path d="M 60,60 L 30,30 M 140,60 L 170,30 M 50,100 L 20,100 M 150,100 L 180,100 M 60,140 L 30,170 M 140,140 L 170,170" stroke="#333" stroke-width="6" stroke-linecap="round" />
        <!-- Antennae -->
        <path d="M 85,35 Q 70,10 50,20 M 115,35 Q 130,10 150,20" fill="none" stroke="#333" stroke-width="4" stroke-linecap="round" />
        
        <!-- Base Body -->
        <ellipse cx="100" cy="100" rx="45" ry="60" :fill="color" stroke="#333" stroke-width="5" />
        <!-- Pattern Overlay -->
        <ellipse cx="100" cy="100" rx="45" ry="60" :fill="patternFillUrl" />
        
        <!-- Head -->
        <circle cx="100" cy="40" r="18" fill="#555" />
        <circle cx="93" cy="35" r="4" fill="white" />
        <circle cx="107" cy="35" r="4" fill="white" />
        <circle cx="93" cy="35" r="2" fill="black" />
        <circle cx="107" cy="35" r="2" fill="black" />
        
        <!-- Shell split line -->
        <line x1="100" y1="58" x2="100" y2="160" stroke="#333" stroke-width="4" />
      </g>
      
      <!-- BUTTERFLY -->
      <g v-else-if="shape === 'butterfly'">
        <!-- Antennae -->
        <path d="M 90,30 Q 70,5 50,10 M 110,30 Q 130,5 150,10" fill="none" stroke="#333" stroke-width="4" stroke-linecap="round" />
        
        <!-- Top Wings -->
        <path d="M 95,60 C 20,20 0,90 95,110 Z" :fill="color" stroke="#333" stroke-width="5" stroke-linejoin="round" />
        <path d="M 105,60 C 180,20 200,90 105,110 Z" :fill="color" stroke="#333" stroke-width="5" stroke-linejoin="round" />
        <!-- Bottom Wings -->
        <path d="M 95,100 C 30,120 40,190 95,150 Z" :fill="color" stroke="#333" stroke-width="5" stroke-linejoin="round" />
        <path d="M 105,100 C 170,120 160,190 105,150 Z" :fill="color" stroke="#333" stroke-width="5" stroke-linejoin="round" />
        
        <!-- Pattern Overlay (Top Wings) -->
        <path d="M 95,60 C 20,20 0,90 95,110 Z" :fill="patternFillUrl" />
        <path d="M 105,60 C 180,20 200,90 105,110 Z" :fill="patternFillUrl" />
        <!-- Pattern Overlay (Bottom Wings) -->
        <path d="M 95,100 C 30,120 40,190 95,150 Z" :fill="patternFillUrl" />
        <path d="M 105,100 C 170,120 160,190 105,150 Z" :fill="patternFillUrl" />
        
        <!-- Body -->
        <ellipse cx="100" cy="100" rx="12" ry="45" fill="#444" />
        <!-- Head -->
        <circle cx="100" cy="45" r="14" fill="#444" />
        <circle cx="94" cy="42" r="3" fill="white" />
        <circle cx="106" cy="42" r="3" fill="white" />
      </g>
      
      <!-- CATERPILLAR -->
      <g v-else-if="shape === 'caterpillar'">
        <!-- Antennae -->
        <path d="M 90,40 Q 70,20 60,25 M 110,40 Q 130,20 140,25" fill="none" stroke="#333" stroke-width="4" stroke-linecap="round" />
        <!-- Legs -->
        <path d="M 75,80 L 60,85 M 125,80 L 140,85 M 75,110 L 60,115 M 125,110 L 140,115 M 75,140 L 60,145 M 125,140 L 140,145 M 85,165 L 75,175 M 115,165 L 125,175" stroke="#333" stroke-width="5" stroke-linecap="round" />
        
        <!-- Body Segments (Base Color) -->
        <circle cx="100" cy="160" r="22" :fill="color" stroke="#333" stroke-width="4" />
        <circle cx="100" cy="130" r="24" :fill="color" stroke="#333" stroke-width="4" />
        <circle cx="100" cy="100" r="26" :fill="color" stroke="#333" stroke-width="4" />
        <circle cx="100" cy="70" r="28" :fill="color" stroke="#333" stroke-width="4" />
        
        <!-- Pattern Overlay -->
        <circle cx="100" cy="160" r="22" :fill="patternFillUrl" />
        <circle cx="100" cy="130" r="24" :fill="patternFillUrl" />
        <circle cx="100" cy="100" r="26" :fill="patternFillUrl" />
        <circle cx="100" cy="70" r="28" :fill="patternFillUrl" />
        
        <!-- Head -->
        <circle cx="100" cy="40" r="25" :fill="color" stroke="#333" stroke-width="4" />
        <!-- Head Pattern (Optional, but usually head is solid for clarity, we'll keep it solid) -->
        <circle cx="90" cy="35" r="5" fill="white" />
        <circle cx="110" cy="35" r="5" fill="white" />
        <circle cx="90" cy="35" r="2" fill="black" />
        <circle cx="110" cy="35" r="2" fill="black" />
        <path d="M 92,48 Q 100,55 108,48" fill="none" stroke="#333" stroke-width="3" stroke-linecap="round" />
      </g>
      
      <!-- LADYBUG -->
      <g v-else-if="shape === 'ladybug'">
        <!-- Legs -->
        <path d="M 65,65 L 40,40 M 135,65 L 160,40 M 55,100 L 25,100 M 145,100 L 175,100 M 65,135 L 40,160 M 135,135 L 160,160" stroke="#333" stroke-width="6" stroke-linecap="round" />
        <!-- Antennae -->
        <path d="M 85,35 Q 70,10 50,20 M 115,35 Q 130,10 150,20" fill="none" stroke="#333" stroke-width="4" stroke-linecap="round" />
        <!-- Body -->
        <circle cx="100" cy="100" r="50" :fill="color" stroke="#333" stroke-width="5" />
        <!-- Pattern Overlay -->
        <circle cx="100" cy="100" r="50" :fill="patternFillUrl" />
        <!-- Split line -->
        <line x1="100" y1="50" x2="100" y2="150" stroke="#333" stroke-width="4" />
        <!-- Head Base -->
        <circle cx="100" cy="50" r="22" fill="#333" />
        <path d="M 78,50 A 22,22 0 0,1 122,50 Z" fill="white" /> <!-- White spots on cheeks -->
        <!-- Eyes -->
        <circle cx="90" cy="40" r="4" fill="white" />
        <circle cx="110" cy="40" r="4" fill="white" />
        <circle cx="90" cy="40" r="2" fill="black" />
        <circle cx="110" cy="40" r="2" fill="black" />
      </g>

      <!-- BEE -->
      <g v-else-if="shape === 'bee'">
        <!-- Antennae -->
        <path d="M 90,30 Q 75,10 65,15 M 110,30 Q 125,10 135,15" fill="none" stroke="#333" stroke-width="4" stroke-linecap="round" />
        <!-- Wings -->
        <ellipse cx="60" cy="80" rx="35" ry="20" fill="white" opacity="0.7" stroke="#333" stroke-width="3" transform="rotate(-30 60 80)" />
        <ellipse cx="140" cy="80" rx="35" ry="20" fill="white" opacity="0.7" stroke="#333" stroke-width="3" transform="rotate(30 140 80)" />
        <ellipse cx="70" cy="110" rx="25" ry="15" fill="white" opacity="0.7" stroke="#333" stroke-width="3" transform="rotate(-15 70 110)" />
        <ellipse cx="130" cy="110" rx="25" ry="15" fill="white" opacity="0.7" stroke="#333" stroke-width="3" transform="rotate(15 130 110)" />
        <!-- Body -->
        <ellipse cx="100" cy="100" rx="30" ry="55" :fill="color" stroke="#333" stroke-width="5" />
        <!-- Pattern Overlay -->
        <ellipse cx="100" cy="100" rx="30" ry="55" :fill="patternFillUrl" />
        <!-- Stinger -->
        <polygon points="95,153 105,153 100,165" fill="#333" />
        <!-- Head -->
        <circle cx="100" cy="45" r="20" :fill="color" stroke="#333" stroke-width="4" />
        <!-- Eyes -->
        <circle cx="92" cy="40" r="5" fill="white" />
        <circle cx="108" cy="40" r="5" fill="white" />
        <circle cx="92" cy="40" r="2" fill="black" />
        <circle cx="108" cy="40" r="2" fill="black" />
      </g>
      
    </g>
  </svg>
</template>

<style scoped>
.bug-asset {
  width: 100%;
  height: 100%;
  display: block;
}

.bug-group {
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
</style>
