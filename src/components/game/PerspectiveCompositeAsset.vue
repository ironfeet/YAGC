<script setup lang="ts">
import { computed } from 'vue';
import type { SpatialToy, SpatialVehicle, PerspectivePreposition, SpatialOrientation } from '../../types';

const props = defineProps<{
  toy: SpatialToy | null;
  toyColor: string;
  vehicle: SpatialVehicle | null;
  vehicleColor: string;
  vehicleOrientation?: SpatialOrientation;
  preposition: PerspectivePreposition;
  isHeaderOnly?: boolean;
  headerType?: 'toy' | 'vehicle';
}>();

// Generate a unique ID for this instance so SVG defs don't bleed colors globally!
const uid = Array.from(crypto.getRandomValues(new Uint8Array(6)))
  .map((b) => b.toString(16).padStart(2, '0'))
  .join('')
  .substring(0, 7);

const toyTransform = computed(() => {
  if (props.isHeaderOnly && props.headerType === 'toy') return 'translate(10, 10) scale(0.9)';
  
  // Perspective taking logic:
  // If the vehicle is facing right, its "left" is the screen's right!
  // If the vehicle is facing left, its "left" is the screen's left.
  const isFlipped = props.vehicleOrientation === 'right';
  
  let effectivePrep = props.preposition;
  if (isFlipped) {
    if (props.preposition === 'left') effectivePrep = 'right';
    else if (props.preposition === 'right') effectivePrep = 'left';
  }

  if (effectivePrep === 'left') {
    return 'translate(-30, 20) scale(0.6)';
  } else if (effectivePrep === 'right') {
    return 'translate(90, 20) scale(0.6)';
  } else if (effectivePrep === 'inside') {
    if (props.vehicle === 'car') return 'translate(45, 0) scale(0.5)';
    if (props.vehicle === 'cart') return 'translate(40, -10) scale(0.55)';
    if (props.vehicle === 'plane') return 'translate(30, -10) scale(0.55)';
    return 'translate(40, 0) scale(0.55)';
  }
  return 'translate(0, 0) scale(1)';
});

const vehicleTransform = computed(() => {
  if (props.vehicleOrientation === 'right') {
    return 'translate(190, 30) scale(-0.9, 0.9)';
  }
  return 'translate(10, 30) scale(0.9)';
});

</script>

<template>
  <svg viewBox="0 0 200 200" class="spatial-asset" xmlns="http://www.w3.org/2000/svg">
    
    <!-- DEFINE SVG ASSETS INVISIBLE -->
    <defs>
      <!-- TOYS -->
      <g :id="`pt-toy-dinosaur-${uid}`">
        <path d="M 60,150 L 60,110 Q 50,60 90,50 L 90,20 L 130,20 L 130,60 L 160,60 L 160,150 L 130,150 L 130,120 L 90,120 L 90,150 Z" :fill="toyColor" stroke="#333" stroke-width="4" stroke-linejoin="round"/>
        <circle cx="110" cy="40" r="5" fill="#333" />
      </g>
      
      <g :id="`pt-toy-dog-${uid}`">
        <path d="M 60,150 L 60,100 Q 60,70 90,70 L 130,70 Q 150,70 150,100 L 150,150 L 120,150 L 120,120 L 90,120 L 90,150 Z" :fill="toyColor" stroke="#333" stroke-width="4" />
        <circle cx="140" cy="50" r="25" :fill="toyColor" stroke="#333" stroke-width="4" />
        <ellipse cx="150" cy="55" rx="10" ry="20" :fill="toyColor" stroke="#333" stroke-width="4" />
        <circle cx="145" cy="45" r="4" fill="#333" />
      </g>
      
      <g :id="`pt-toy-duck-${uid}`">
        <path d="M 60,120 C 60,160 140,160 160,120 C 160,90 120,90 100,90 Z" :fill="toyColor" stroke="#333" stroke-width="4" />
        <circle cx="130" cy="60" r="25" :fill="toyColor" stroke="#333" stroke-width="4" />
        <path d="M 150,60 L 180,65 L 150,75 Z" fill="#ff9800" stroke="#333" stroke-width="4" />
        <circle cx="135" cy="55" r="4" fill="#333" />
      </g>

      <!-- VEHICLES (Split into Back/Front for layering) -->
      <!-- CAR -->
      <g :id="`pt-car-back-${uid}`">
        <path d="M 50,100 L 50,60 L 80,60 L 130,60 L 160,100 Z" :fill="vehicleColor" filter="brightness(0.7)" />
      </g>
      <g :id="`pt-car-front-${uid}`">
        <path d="M 20,140 L 20,100 L 50,100 L 80,60 L 130,60 L 160,100 L 180,100 L 180,140 Z" :fill="vehicleColor" fill-opacity="0.95" stroke="#333" stroke-width="4" stroke-linejoin="round" />
        <path d="M 50,100 L 80,60 L 130,60 L 160,100 Z" fill="none" stroke="#333" stroke-width="4" />
        <circle cx="60" cy="140" r="20" fill="#333" />
        <circle cx="140" cy="140" r="20" fill="#333" />
      </g>

      <!-- CART -->
      <g :id="`pt-cart-back-${uid}`">
        <rect x="40" y="80" width="120" height="50" :fill="vehicleColor" filter="brightness(0.7)" />
      </g>
      <g :id="`pt-cart-front-${uid}`">
        <path d="M 30,80 L 170,80 L 160,140 L 40,140 Z" :fill="vehicleColor" fill-opacity="0.95" stroke="#333" stroke-width="4" stroke-linejoin="round" />
        <path d="M 30,80 L 10,40" fill="none" stroke="#333" stroke-width="6" stroke-linecap="round" />
        <circle cx="60" cy="150" r="15" fill="#333" />
        <circle cx="140" cy="150" r="15" fill="#333" />
      </g>

      <!-- PLANE -->
      <g :id="`pt-plane-back-${uid}`">
        <path d="M 140,100 L 170,50 L 180,100 Z" :fill="vehicleColor" filter="brightness(0.7)" stroke="#333" stroke-width="4" stroke-linejoin="round" />
        <path d="M 40,120 L 160,120 L 160,90 L 40,90 Z" :fill="vehicleColor" filter="brightness(0.7)" />
      </g>
      <g :id="`pt-plane-front-${uid}`">
        <path d="M 20,120 L 160,120 L 180,100 L 160,90 C 80,90 20,90 20,120 Z" :fill="vehicleColor" stroke="#333" stroke-width="4" stroke-linejoin="round" />
        <path d="M 80,110 L 120,150 L 140,110 Z" :fill="vehicleColor" filter="brightness(1.2)" stroke="#333" stroke-width="4" stroke-linejoin="round" />
        <ellipse cx="20" cy="105" rx="5" ry="30" fill="#9e9e9e" stroke="#333" stroke-width="2" />
      </g>
    </defs>

    <!-- HEADER ONLY LOGIC -->
    <template v-if="isHeaderOnly && headerType === 'toy' && toy">
      <use :href="`#pt-toy-${toy}-${uid}`" :transform="toyTransform" />
    </template>
    
    <template v-else-if="isHeaderOnly && headerType === 'vehicle' && vehicle">
      <use :href="`#pt-${vehicle}-back-${uid}`" :transform="vehicleTransform" />
      <use :href="`#pt-${vehicle}-front-${uid}`" :transform="vehicleTransform" />
    </template>
    
    <!-- COMPOSITE LOGIC -->
    <template v-else-if="toy && vehicle">
      <!-- LEFT -->
      <template v-if="preposition === 'left'">
        <use :href="`#pt-${vehicle}-back-${uid}`" :transform="vehicleTransform" />
        <use :href="`#pt-${vehicle}-front-${uid}`" :transform="vehicleTransform" />
        <use :href="`#pt-toy-${toy}-${uid}`" :transform="toyTransform" />
      </template>

      <!-- RIGHT -->
      <template v-else-if="preposition === 'right'">
        <use :href="`#pt-${vehicle}-back-${uid}`" :transform="vehicleTransform" />
        <use :href="`#pt-${vehicle}-front-${uid}`" :transform="vehicleTransform" />
        <use :href="`#pt-toy-${toy}-${uid}`" :transform="toyTransform" />
      </template>

      <!-- INSIDE -->
      <template v-else-if="preposition === 'inside'">
        <use :href="`#pt-${vehicle}-back-${uid}`" :transform="vehicleTransform" />
        <use :href="`#pt-toy-${toy}-${uid}`" :transform="toyTransform" />
        <use :href="`#pt-${vehicle}-front-${uid}`" :transform="vehicleTransform" />
      </template>
    </template>
    
  </svg>
</template>

<style scoped>
.spatial-asset {
  width: 100%;
  height: 100%;
  display: block;
  filter: drop-shadow(0 4px 6px rgba(0,0,0,0.15));
}
</style>
