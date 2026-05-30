<template>
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="colorful-nature">
    <!-- Tree -->
    <g v-if="name === 'tree'">
      <!-- Trunk -->
      <path d="M 45,85 L 45,50 L 55,50 L 55,85 Z" fill="#795548" />
      <path d="M 47,85 L 47,60 L 51,60 L 51,85 Z" fill="#5D4037" />
      <!-- Leaves -->
      <circle cx="50" cy="40" r="25" fill="#4CAF50" />
      <circle cx="35" cy="50" r="15" fill="#388E3C" />
      <circle cx="65" cy="50" r="15" fill="#388E3C" />
      <circle cx="50" cy="25" r="18" fill="#81C784" />
      <!-- Apples -->
      <circle cx="45" cy="35" r="4" fill="#E53935" />
      <circle cx="60" cy="45" r="4" fill="#E53935" />
      <circle cx="38" cy="55" r="4" fill="#E53935" />
    </g>

    <!-- Flower -->
    <g v-else-if="name === 'flower'">
      <!-- Stem -->
      <path d="M 50,50 Q 55,70 50,90" fill="none" stroke="#4CAF50" stroke-width="6" stroke-linecap="round" />
      <!-- Leaves -->
      <path d="M 50,75 Q 35,70 30,60 Q 45,65 50,75 Z" fill="#388E3C" />
      <path d="M 50,80 Q 65,75 70,65 Q 55,70 50,80 Z" fill="#388E3C" />
      <!-- Petals -->
      <circle cx="50" cy="25" r="12" fill="#E91E63" />
      <circle cx="70" cy="40" r="12" fill="#9C27B0" />
      <circle cx="60" cy="60" r="12" fill="#2196F3" />
      <circle cx="40" cy="60" r="12" fill="#00BCD4" />
      <circle cx="30" cy="40" r="12" fill="#FFEB3B" />
      <!-- Center -->
      <circle cx="50" cy="45" r="10" fill="#FFC107" />
      <circle cx="50" cy="45" r="5" fill="#FF9800" />
    </g>

    <!-- Sun -->
    <g v-else-if="name === 'sun'">
      <!-- Rays -->
      <line x1="50" y1="10" x2="50" y2="25" stroke="#FF9800" stroke-width="6" stroke-linecap="round" />
      <line x1="50" y1="75" x2="50" y2="90" stroke="#FF9800" stroke-width="6" stroke-linecap="round" />
      <line x1="10" y1="50" x2="25" y2="50" stroke="#FF9800" stroke-width="6" stroke-linecap="round" />
      <line x1="75" y1="50" x2="90" y2="50" stroke="#FF9800" stroke-width="6" stroke-linecap="round" />
      <line x1="22" y1="22" x2="33" y2="33" stroke="#FFC107" stroke-width="6" stroke-linecap="round" />
      <line x1="78" y1="78" x2="67" y2="67" stroke="#FFC107" stroke-width="6" stroke-linecap="round" />
      <line x1="22" y1="78" x2="33" y2="67" stroke="#FFC107" stroke-width="6" stroke-linecap="round" />
      <line x1="78" y1="22" x2="67" y2="33" stroke="#FFC107" stroke-width="6" stroke-linecap="round" />
      <!-- Center -->
      <circle cx="50" cy="50" r="22" fill="#FFEB3B" />
      <!-- Face -->
      <circle cx="42" cy="45" r="3" fill="#212121" />
      <circle cx="58" cy="45" r="3" fill="#212121" />
      <path d="M 40,55 Q 50,65 60,55" fill="none" stroke="#212121" stroke-width="3" stroke-linecap="round" />
      <circle cx="36" cy="52" r="4" fill="#FF9800" opacity="0.5" />
      <circle cx="64" cy="52" r="4" fill="#FF9800" opacity="0.5" />
    </g>

    <!-- Cloud -->
    <g v-else-if="name === 'cloud'">
      <!-- Drops -->
      <path d="M 30,75 L 35,85 L 25,85 Z" fill="#03A9F4" />
      <path d="M 50,75 L 55,85 L 45,85 Z" fill="#03A9F4" />
      <path d="M 70,75 L 75,85 L 65,85 Z" fill="#03A9F4" />
      <path d="M 40,85 L 45,95 L 35,95 Z" fill="#03A9F4" />
      <path d="M 60,85 L 65,95 L 55,95 Z" fill="#03A9F4" />
      <!-- Fluff -->
      <circle cx="50" cy="45" r="25" fill="#FAFAFA" />
      <circle cx="30" cy="55" r="18" fill="#FAFAFA" />
      <circle cx="70" cy="55" r="18" fill="#FAFAFA" />
      <rect x="30" y="55" width="40" height="18" fill="#FAFAFA" />
      <!-- Highlight -->
      <circle cx="50" cy="40" r="20" fill="#FFFFFF" />
      <!-- Face -->
      <circle cx="42" cy="55" r="3" fill="#212121" />
      <circle cx="58" cy="55" r="3" fill="#212121" />
      <path d="M 45,62 Q 50,65 55,62" fill="none" stroke="#212121" stroke-width="2" stroke-linecap="round" />
    </g>

    <!-- Mountain -->
    <g v-else-if="name === 'mountain'">
      <polygon points="50,20 15,85 85,85" fill="#78909C" />
      <polygon points="50,20 38,42 45,45 55,38 62,48 70,40" fill="#ECEFF1" />
      <polygon points="70,40 85,85 15,85 25,65" fill="#546E7A" />
      <polygon points="50,20 38,42 45,45 55,38 62,48 70,40" fill="#FFFFFF" />
      <polygon points="30,45 10,85 50,85" fill="#90A4AE" />
      <polygon points="30,45 25,55 35,52 40,58" fill="#FFFFFF" />
    </g>

    <!-- Rainbow -->
    <g v-else-if="name === 'rainbow'">
      <path d="M 10,80 A 40 40 0 0 1 90,80" fill="none" stroke="#F44336" stroke-width="8" />
      <path d="M 18,80 A 32 32 0 0 1 82,80" fill="none" stroke="#FF9800" stroke-width="8" />
      <path d="M 26,80 A 24 24 0 0 1 74,80" fill="none" stroke="#FFEB3B" stroke-width="8" />
      <path d="M 34,80 A 16 16 0 0 1 66,80" fill="none" stroke="#4CAF50" stroke-width="8" />
      <path d="M 42,80 A 8 8 0 0 1 58,80" fill="none" stroke="#2196F3" stroke-width="8" />
      <!-- Clouds at base -->
      <circle cx="20" cy="80" r="10" fill="#FFFFFF" />
      <circle cx="10" cy="85" r="8" fill="#FFFFFF" />
      <circle cx="30" cy="85" r="8" fill="#FFFFFF" />
      <circle cx="80" cy="80" r="10" fill="#FFFFFF" />
      <circle cx="70" cy="85" r="8" fill="#FFFFFF" />
      <circle cx="90" cy="85" r="8" fill="#FFFFFF" />
    </g>

    <!-- Leaf -->
    <g v-else-if="name === 'leaf'">
      <path d="M 50,15 C 80,15 80,50 50,85 C 20,50 20,15 50,15 Z" fill="#8BC34A" />
      <path d="M 50,15 C 50,15 65,30 50,85 Z" fill="#4CAF50" />
      <path d="M 50,85 Q 50,95 45,95" fill="none" stroke="#388E3C" stroke-width="4" stroke-linecap="round" />
      <!-- Veins -->
      <path d="M 50,25 L 50,80 M 50,40 L 65,30 M 50,55 L 65,45 M 50,70 L 60,60" fill="none" stroke="#AED581" stroke-width="3" stroke-linecap="round" />
      <path d="M 50,45 L 35,35 M 50,60 L 35,50" fill="none" stroke="#AED581" stroke-width="3" stroke-linecap="round" />
    </g>

    <!-- Mushroom -->
    <g v-else-if="name === 'mushroom'">
      <path d="M 40,55 L 60,55 L 65,90 Q 50,95 35,90 Z" fill="#FFECB3" />
      <path d="M 15,55 C 15,20 85,20 85,55 Z" fill="#F44336" />
      <ellipse cx="50" cy="55" rx="35" ry="10" fill="#FFCDD2" />
      <!-- Spots -->
      <circle cx="35" cy="35" r="8" fill="#FFFFFF" />
      <circle cx="65" cy="40" r="6" fill="#FFFFFF" />
      <circle cx="50" cy="25" r="7" fill="#FFFFFF" />
      <circle cx="25" cy="48" r="4" fill="#FFFFFF" />
      <circle cx="75" cy="48" r="4" fill="#FFFFFF" />
      <!-- Face -->
      <circle cx="45" cy="70" r="3" fill="#212121" />
      <circle cx="55" cy="70" r="3" fill="#212121" />
      <path d="M 48,78 Q 50,80 52,78" fill="none" stroke="#212121" stroke-width="2" stroke-linecap="round" />
    </g>
  </svg>
</template>

<script setup lang="ts">
defineProps<{
  name: string;
}>();
</script>

<style scoped>
.colorful-nature {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
}
</style>
