<script setup lang="ts">
import { computed } from 'vue';
import type { TrainShape, TrainWindowColor, TrainWindowPattern, TrainColor } from '../../types';

const props = defineProps<{
  renderMode: 'bodyOnly' | 'windowsOnly' | 'full';
  trainShape: TrainShape;
  trainColor: TrainColor;
  isFacingLeft: boolean;
  windowColor: TrainWindowColor;
  windowPattern: TrainWindowPattern;
}>();

const transformString = computed(() => {
  if (props.isFacingLeft) {
    return 'translate(200, 0) scale(-1, 1)';
  }
  return '';
});

const windowConfig = computed(() => {
  const isSquare = props.windowPattern.startsWith('square');
  const count = props.windowPattern.endsWith('3') ? 3 : 2;
  return { isSquare, count };
});
</script>

<template>
  <svg viewBox="0 0 200 200" class="train-asset" xmlns="http://www.w3.org/2000/svg">
    <g class="train-group" :transform="transformString">
      
      <!-- BODY LAYER -->
      <g v-if="renderMode !== 'windowsOnly'" class="train-body">
        
        <!-- Steam Engine -->
        <g v-if="trainShape === 'steam'">
          <!-- Main Chassis -->
          <path d="M 20,140 L 180,140 L 180,50 L 120,50 L 120,70 L 20,70 Z" :fill="trainColor" stroke="#333" stroke-width="4" stroke-linejoin="round" />
          <!-- Smokestack -->
          <path d="M 40,70 L 40,30 L 60,30 L 60,70 Z" fill="#455a64" stroke="#333" stroke-width="4" />
          <path d="M 35,30 L 65,30 L 70,20 L 30,20 Z" fill="#333" stroke="#333" stroke-width="2" />
          <!-- Wheels -->
          <circle cx="50" cy="150" r="15" fill="#333" />
          <circle cx="95" cy="150" r="15" fill="#333" />
          <circle cx="145" cy="150" r="20" fill="#333" />
          <!-- Cowcatcher -->
          <path d="M 20,140 L 5,140 L 20,120 Z" fill="#455a64" stroke="#333" stroke-width="2" />
        </g>
        
        <!-- Bullet Train -->
        <g v-else-if="trainShape === 'bullet'">
          <path d="M 15,140 L 180,140 L 180,70 C 130,70 60,70 15,140 Z" :fill="trainColor" stroke="#333" stroke-width="4" stroke-linejoin="round" />
          <path d="M 15,140 C 40,110 80,70 180,70 L 180,140 Z" :fill="trainColor" stroke="#333" stroke-width="4" stroke-linejoin="round" />
          <!-- Sleek stripe -->
          <path d="M 40,110 L 180,110" stroke="#00bcd4" stroke-width="6" />
          <!-- Wheels (partially hidden) -->
          <circle cx="70" cy="145" r="10" fill="#333" />
          <circle cx="110" cy="145" r="10" fill="#333" />
          <circle cx="150" cy="145" r="10" fill="#333" />
        </g>
        
        <!-- Boxcar -->
        <g v-else-if="trainShape === 'boxcar'">
          <rect x="20" y="60" width="160" height="80" rx="5" :fill="trainColor" stroke="#333" stroke-width="4" />
          <!-- Door outline -->
          <rect x="80" y="60" width="40" height="80" fill="none" stroke="#5d4037" stroke-width="4" />
          <!-- Wheels -->
          <circle cx="50" cy="150" r="15" fill="#333" />
          <circle cx="150" cy="150" r="15" fill="#333" />
        </g>

        <!-- Diesel -->
        <g v-else-if="trainShape === 'diesel'">
          <path d="M 20,140 L 180,140 L 180,60 L 140,60 L 120,80 L 20,80 Z" :fill="trainColor" stroke="#333" stroke-width="4" stroke-linejoin="round" />
          <rect x="140" y="60" width="40" height="80" :fill="trainColor" stroke="#333" stroke-width="4" />
          <!-- Grill -->
          <rect x="20" y="90" width="10" height="40" fill="#555" stroke="#333" stroke-width="2" />
          <!-- Wheels -->
          <circle cx="45" cy="150" r="12" fill="#333" />
          <circle cx="85" cy="150" r="12" fill="#333" />
          <circle cx="125" cy="150" r="12" fill="#333" />
          <circle cx="165" cy="150" r="12" fill="#333" />
        </g>
      </g>
      
      <!-- WINDOWS LAYER -->
      <g v-if="renderMode !== 'bodyOnly'" class="train-windows">
        <!-- We use a standard layout that fits inside all 3 train shapes. The bullet train swoops down to x=15 y=140, so around y=80 it might be cropped if it's too far left. We'll start windows around x=60. -->
        <template v-if="windowConfig.count === 2">
          <!-- 2 Windows -->
          <rect v-if="windowConfig.isSquare" x="70" y="75" width="25" height="25" rx="4" :fill="windowColor" stroke="#333" stroke-width="3" />
          <rect v-if="windowConfig.isSquare" x="120" y="75" width="25" height="25" rx="4" :fill="windowColor" stroke="#333" stroke-width="3" />
          
          <circle v-if="!windowConfig.isSquare" cx="82.5" cy="87.5" r="12.5" :fill="windowColor" stroke="#333" stroke-width="3" />
          <circle v-if="!windowConfig.isSquare" cx="132.5" cy="87.5" r="12.5" :fill="windowColor" stroke="#333" stroke-width="3" />
        </template>
        
        <template v-else>
          <!-- 3 Windows -->
          <rect v-if="windowConfig.isSquare" x="65" y="75" width="20" height="20" rx="3" :fill="windowColor" stroke="#333" stroke-width="3" />
          <rect v-if="windowConfig.isSquare" x="100" y="75" width="20" height="20" rx="3" :fill="windowColor" stroke="#333" stroke-width="3" />
          <rect v-if="windowConfig.isSquare" x="135" y="75" width="20" height="20" rx="3" :fill="windowColor" stroke="#333" stroke-width="3" />
          
          <circle v-if="!windowConfig.isSquare" cx="75" cy="85" r="10" :fill="windowColor" stroke="#333" stroke-width="3" />
          <circle v-if="!windowConfig.isSquare" cx="110" cy="85" r="10" :fill="windowColor" stroke="#333" stroke-width="3" />
          <circle v-if="!windowConfig.isSquare" cx="145" cy="85" r="10" :fill="windowColor" stroke="#333" stroke-width="3" />
        </template>
      </g>
      
    </g>
  </svg>
</template>

<style scoped>
.train-asset {
  width: 100%;
  height: 100%;
  display: block;
}

.train-group {
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
</style>
