<script setup lang="ts">
import { computed } from 'vue';
import type { AnalogyShape, AnalogyOrientation, AnalogyInhabitant } from '../../../types';

const props = defineProps<{
  color: string;
  shape: AnalogyShape;
  orientation: AnalogyOrientation;
  count: number;
  inhabitant: AnalogyInhabitant;
}>();

// Window coordinates per shape so we know where to place the inhabitant
const inhabitantTransform = computed(() => {
  switch (props.shape) {
    case 'tall':   return 'translate(50, 55)'; // Window is x=40..60, y=45..60
    case 'wide':   return 'translate(67.5, 74)'; // Window is x=55..80, y=60..80
    case 'angled': return 'translate(50, 53)'; // Window is circle cx=50, cy=50
    default:       return 'translate(50, 50)';
  }
});
</script>

<template>
  <div class="analogy-asset-wrapper">
    <!-- Viewbox 0 0 200 100 handles count up to 2 -->
    <svg viewBox="0 0 200 100" class="analogy-svg">
      <defs>
        <g id="house-definition">
          <!-- Flip anchor is at x=50, center of 0..100 -->
          <g :transform="orientation === 'right' ? 'translate(100, 0) scale(-1, 1)' : ''">
            
            <!-- TALL HOUSE -->
            <g v-if="shape === 'tall'">
              <path d="M30,90 L70,90 L70,40 L30,40 Z" :fill="color" stroke="#333" stroke-width="3" stroke-linejoin="round" />
              <polygon points="20,40 50,15 80,40" fill="#475569" stroke="#333" stroke-width="3" stroke-linejoin="round" />
              <!-- Door -->
              <path d="M42,90 L58,90 L58,65 L42,65 Z" fill="#b45309" stroke="#333" stroke-width="2" />
              <!-- Window -->
              <rect x="40" y="45" width="20" height="15" fill="#bae6fd" stroke="#333" stroke-width="2" />
            </g>

            <!-- WIDE HOUSE -->
            <g v-else-if="shape === 'wide'">
              <path d="M15,90 L85,90 L85,55 L15,55 Z" :fill="color" stroke="#333" stroke-width="3" stroke-linejoin="round" />
              <polygon points="5,55 50,30 95,55" fill="#475569" stroke="#333" stroke-width="3" stroke-linejoin="round" />
              <!-- Door -->
              <path d="M25,90 L45,90 L45,65 L25,65 Z" fill="#b45309" stroke="#333" stroke-width="2" />
              <!-- Window -->
              <rect x="55" y="60" width="25" height="20" fill="#bae6fd" stroke="#333" stroke-width="2" />
            </g>

            <!-- ANGLED HOUSE -->
            <g v-else-if="shape === 'angled'">
              <!-- A-frame body -->
              <polygon points="15,90 85,90 50,20" :fill="color" stroke="#333" stroke-width="3" stroke-linejoin="round" />
              <!-- Thick roof lines over it -->
              <polygon points="5,90 50,10 95,90" fill="none" stroke="#475569" stroke-width="8" stroke-linejoin="round" />
              <!-- Door -->
              <path d="M40,90 L60,90 L60,70 L40,70 Z" fill="#b45309" stroke="#333" stroke-width="2" />
              <!-- Window -->
              <circle cx="50" cy="50" r="10" fill="#bae6fd" stroke="#333" stroke-width="2" />
            </g>

            <!-- INHABITANT LAYER -->
            <g v-if="inhabitant !== 'none'" :transform="inhabitantTransform">
              <!-- Cat -->
              <g v-if="inhabitant === 'cat'" fill="#a855f7" stroke="#222" stroke-width="1.5">
                <path d="M -6,5 L -6,-1 L 0,-2 L 6,-1 L 6,5 Z" />
                <polygon points="-6,-1 -8,-6 -2,-3" />
                <polygon points="6,-1 8,-6 2,-3" />
                <!-- Eyes -->
                <circle cx="-2.5" cy="1" r="1.5" fill="#fff" stroke="none" />
                <circle cx="2.5" cy="1" r="1.5" fill="#fff" stroke="none" />
                <circle cx="-2.5" cy="1" r="0.5" fill="#000" stroke="none" />
                <circle cx="2.5" cy="1" r="0.5" fill="#000" stroke="none" />
              </g>

              <!-- Dog -->
              <g v-else-if="inhabitant === 'dog'" fill="#f97316" stroke="#222" stroke-width="1.5">
                <path d="M -7,5 L -5,-1 Q 0,-4 5,-1 L 7,5 Z" />
                <path d="M -6,0 Q -9,4 -7,5 Z" fill="#ea580c"/>
                <path d="M 6,0 Q 9,4 7,5 Z" fill="#ea580c"/>
                <circle cx="-3" cy="2" r="1" fill="#000" stroke="none" />
                <circle cx="3" cy="2" r="1" fill="#000" stroke="none" />
                <circle cx="0" cy="4" r="1.5" fill="#000" stroke="none" />
              </g>
            </g>
            
          </g>
        </g>
      </defs>

      <use href="#house-definition" :x="count === 1 ? 50 : 10" y="0" />
      <use v-if="count === 2" href="#house-definition" x="90" y="0" />
    </svg>
  </div>
</template>

<style scoped>
.analogy-asset-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.analogy-svg {
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
  display: block;
}
</style>
