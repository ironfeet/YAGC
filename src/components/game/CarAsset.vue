<script setup lang="ts">
import type { CarShape, CarPassenger, CarRoofItem } from '../../types';

defineProps<{
  color: string;
  shape: CarShape;
  passenger: CarPassenger;
  roofItem: CarRoofItem;
}>();
</script>

<template>
  <svg viewBox="0 -35 200 155" class="car-asset" xmlns="http://www.w3.org/2000/svg">
    <!-- Body -->
    <g v-if="shape === 'sedan'">
      <!-- Sedan Body -->
      <path d="M 20,80 L 20,50 L 50,50 L 80,20 L 150,20 L 180,50 L 190,50 L 190,80 Z" :fill="color" stroke="#333" stroke-width="4" stroke-linejoin="round" />
      <!-- Windows -->
      <path d="M 85,25 L 145,25 L 170,50 L 55,50 Z" fill="#b3e5fc" stroke="#333" stroke-width="3" />
      <line x1="115" y1="25" x2="115" y2="50" stroke="#333" stroke-width="4" />
    </g>

    <g v-else-if="shape === 'truck'">
      <!-- Truck Body -->
      <path d="M 10,80 L 10,45 L 80,45 L 80,80 Z" :fill="color" stroke="#333" stroke-width="4" stroke-linejoin="round" />
      <path d="M 80,80 L 80,20 L 140,20 L 170,50 L 180,50 L 180,80 Z" :fill="color" stroke="#333" stroke-width="4" stroke-linejoin="round" />
      <!-- Windows -->
      <path d="M 85,25 L 135,25 L 160,50 L 85,50 Z" fill="#b3e5fc" stroke="#333" stroke-width="3" />
    </g>

    <g v-else-if="shape === 'beetle'">
      <!-- Beetle Body -->
      <path d="M 10,80 L 10,60 C 10,10 180,10 180,60 L 180,80 Z" :fill="color" stroke="#333" stroke-width="4" stroke-linejoin="round" />
      <!-- Windows -->
      <path d="M 60,25 C 90,10 140,25 150,50 L 40,50 C 40,35 50,30 60,25 Z" fill="#b3e5fc" stroke="#333" stroke-width="3" />
      <line x1="100" y1="20" x2="100" y2="50" stroke="#333" stroke-width="4" />
    </g>

    <g v-else-if="shape === 'van'">
      <!-- Van Body -->
      <path d="M 10,80 L 10,30 L 30,20 L 180,20 L 190,30 L 190,80 Z" :fill="color" stroke="#333" stroke-width="4" stroke-linejoin="round" />
      <!-- Windows -->
      <rect x="35" y="25" width="50" height="25" fill="#b3e5fc" stroke="#333" stroke-width="3" />
      <rect x="95" y="25" width="80" height="25" fill="#b3e5fc" stroke="#333" stroke-width="3" />
    </g>

    <g v-else-if="shape === 'sports'">
      <!-- Sports Car Body -->
      <path d="M 10,80 L 10,65 L 40,65 L 70,40 L 150,40 L 185,65 L 195,65 L 195,80 Z" :fill="color" stroke="#333" stroke-width="4" stroke-linejoin="round" />
      <!-- Windows -->
      <path d="M 75,45 L 140,45 L 165,65 L 60,65 Z" fill="#b3e5fc" stroke="#333" stroke-width="3" />
    </g>

    <g v-else-if="shape === 'bus'">
      <!-- Bus Body -->
      <path d="M 5,80 L 5,20 L 195,20 L 195,80 Z" :fill="color" stroke="#333" stroke-width="4" stroke-linejoin="round" />
      <!-- Windows -->
      <rect x="15" y="25" width="35" height="25" fill="#b3e5fc" stroke="#333" stroke-width="3" />
      <rect x="60" y="25" width="35" height="25" fill="#b3e5fc" stroke="#333" stroke-width="3" />
      <rect x="105" y="25" width="35" height="25" fill="#b3e5fc" stroke="#333" stroke-width="3" />
      <rect x="150" y="25" width="35" height="25" fill="#b3e5fc" stroke="#333" stroke-width="3" />
    </g>

    <!-- Passengers -->
    <g class="passenger-layer" :transform="`translate(${['beetle', 'sports'].includes(shape) ? 65 : 95}, 30)`">
      <g v-if="passenger === 'boy'">
        <!-- Boy Head -->
        <circle cx="20" cy="10" r="12" fill="#fada5e" stroke="#333" stroke-width="2" />
        <circle cx="15" cy="8" r="2" fill="#333" />
        <circle cx="25" cy="8" r="2" fill="#333" />
        <path d="M 15,15 Q 20,18 25,15" fill="none" stroke="#333" stroke-width="2" />
      </g>
      <g v-else-if="passenger === 'girl'">
        <!-- Girl Head -->
        <circle cx="20" cy="10" r="12" fill="#fada5e" stroke="#333" stroke-width="2" />
        <path d="M 5,5 Q 5,-5 15,0 M 35,5 Q 35,-5 25,0" fill="none" stroke="#333" stroke-width="4" /> <!-- Pigtails -->
        <circle cx="15" cy="8" r="2" fill="#333" />
        <circle cx="25" cy="8" r="2" fill="#333" />
        <path d="M 15,15 Q 20,18 25,15" fill="none" stroke="#333" stroke-width="2" />
      </g>
      <g v-else-if="passenger === 'dog'">
        <!-- Dog Head -->
        <circle cx="20" cy="12" r="10" fill="#a0522d" stroke="#333" stroke-width="2" />
        <!-- Floppy Ears -->
        <ellipse cx="8" cy="8" rx="4" ry="12" fill="#a0522d" stroke="#333" stroke-width="2" transform="rotate(-30 8 8)" />
        <ellipse cx="32" cy="8" rx="4" ry="12" fill="#a0522d" stroke="#333" stroke-width="2" transform="rotate(30 32 8)" />
        <circle cx="15" cy="10" r="1.5" fill="#333" />
        <circle cx="25" cy="10" r="1.5" fill="#333" />
        <!-- Dog Nose -->
        <circle cx="20" cy="15" r="3" fill="#333" />
      </g>
      <g v-else-if="passenger === 'cat'">
        <!-- Cat Head -->
        <circle cx="20" cy="12" r="10" fill="#cfcfcf" stroke="#333" stroke-width="2" />
        <!-- Pointy Ears -->
        <path d="M 10,8 L 10,-2 L 18,5 M 30,8 L 30,-2 L 22,5" fill="#cfcfcf" stroke="#333" stroke-width="2" />
        <circle cx="16" cy="10" r="1.5" fill="#333" />
        <circle cx="24" cy="10" r="1.5" fill="#333" />
        <!-- Whiskers -->
        <line x1="5" y1="12" x2="12" y2="13" stroke="#333" stroke-width="1" />
        <line x1="35" y1="12" x2="28" y2="13" stroke="#333" stroke-width="1" />
      </g>
    </g>

    <!-- Roof Item -->
    <g class="roof-layer" :transform="`translate(${['beetle', 'van', 'bus'].includes(shape) ? 95 : 115}, ${shape === 'van' || shape === 'bus' ? 5 : 15})`">
      <g v-if="roofItem === 'luggage'">
        <rect x="-20" y="-15" width="40" height="15" rx="3" fill="#8B4513" stroke="#333" stroke-width="3" />
        <line x1="-10" y1="-15" x2="-10" y2="0" stroke="#333" stroke-width="2" />
        <line x1="10" y1="-15" x2="10" y2="0" stroke="#333" stroke-width="2" />
      </g>
      <g v-else-if="roofItem === 'surfboard'">
        <ellipse cx="0" cy="-5" rx="30" ry="6" fill="#FF4500" stroke="#333" stroke-width="3" />
        <line x1="-20" y1="-5" x2="20" y2="-5" stroke="#333" stroke-width="2" />
      </g>
      <g v-else-if="roofItem === 'bicycle'">
        <!-- Bicycle silhouette -->
        <circle cx="-15" cy="-8" r="8" fill="none" stroke="#333" stroke-width="2" />
        <circle cx="15" cy="-8" r="8" fill="none" stroke="#333" stroke-width="2" />
        <path d="M -15,-8 L 0,-20 L 15,-8 M 0,-20 L 0,-25 L -5,-25" fill="none" stroke="#333" stroke-width="2" />
      </g>
      <g v-else-if="roofItem === 'skis'">
        <rect x="-30" y="-5" width="60" height="3" fill="#3498db" stroke="#333" stroke-width="1" />
        <rect x="-30" y="-10" width="60" height="3" fill="#e74c3c" stroke="#333" stroke-width="1" />
        <path d="M -20,-10 L -20,0 M 20,-10 L 20,0" stroke="#333" stroke-width="2" />
      </g>
    </g>

    <!-- Tires (Always present) -->
    <circle cx="50" cy="80" r="18" fill="#333" />
    <circle cx="50" cy="80" r="8" fill="#ccc" />
    
    <circle cx="140" cy="80" r="18" fill="#333" />
    <circle cx="140" cy="80" r="8" fill="#ccc" />
  </svg>
</template>

<style scoped>
.car-asset {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
