<template>
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="colorful-vehicle">
    <!-- Car -->
    <g v-if="name === 'car'">
      <path d="M 20,60 L 20,45 Q 25,35 40,35 L 60,35 Q 75,35 80,45 L 85,45 L 85,60 Z" fill="#E53935" />
      <path d="M 35,35 L 45,20 L 65,20 L 70,35 Z" fill="#90CAF9" />
      <polygon points="45,20 65,20 70,35 35,35" fill="none" stroke="#E53935" stroke-width="2" />
      <line x1="55" y1="20" x2="55" y2="35" stroke="#E53935" stroke-width="2" />
      <circle cx="35" cy="60" r="10" fill="#212121" />
      <circle cx="35" cy="60" r="4" fill="#E0E0E0" />
      <circle cx="65" cy="60" r="10" fill="#212121" />
      <circle cx="65" cy="60" r="4" fill="#E0E0E0" />
      <rect x="80" y="48" width="5" height="4" fill="#FFEB3B" />
      <rect x="15" y="48" width="5" height="4" fill="#E53935" />
    </g>

    <!-- Truck -->
    <g v-else-if="name === 'truck'">
      <rect x="10" y="30" width="45" height="35" fill="#1E88E5" rx="2" />
      <path d="M 55,65 L 55,40 L 75,40 L 85,50 L 85,65 Z" fill="#FDD835" />
      <path d="M 60,45 L 72,45 L 78,52 L 60,52 Z" fill="#90CAF9" />
      <circle cx="25" cy="65" r="10" fill="#212121" />
      <circle cx="25" cy="65" r="4" fill="#E0E0E0" />
      <circle cx="70" cy="65" r="10" fill="#212121" />
      <circle cx="70" cy="65" r="4" fill="#E0E0E0" />
      <rect x="83" y="55" width="2" height="4" fill="#FF9800" />
    </g>

    <!-- Bus -->
    <g v-else-if="name === 'bus'">
      <rect x="10" y="25" width="80" height="40" fill="#FFCA28" rx="5" />
      <rect x="15" y="30" width="10" height="15" fill="#81D4FA" rx="2" />
      <rect x="30" y="30" width="15" height="15" fill="#81D4FA" rx="2" />
      <rect x="50" y="30" width="15" height="15" fill="#81D4FA" rx="2" />
      <rect x="70" y="30" width="15" height="15" fill="#81D4FA" rx="2" />
      <line x1="10" y1="52" x2="90" y2="52" stroke="#212121" stroke-width="2" />
      <circle cx="25" cy="65" r="9" fill="#212121" />
      <circle cx="25" cy="65" r="4" fill="#9E9E9E" />
      <circle cx="75" cy="65" r="9" fill="#212121" />
      <circle cx="75" cy="65" r="4" fill="#9E9E9E" />
    </g>

    <!-- Train -->
    <g v-else-if="name === 'train'">
      <rect x="20" y="40" width="40" height="30" fill="#43A047" />
      <path d="M 60,70 L 60,40 Q 75,40 85,55 L 85,70 Z" fill="#43A047" />
      <rect x="25" y="25" width="15" height="15" fill="#E53935" />
      <polygon points="20,25 45,25 32,15" fill="#212121" />
      <rect x="65" y="30" width="10" height="10" fill="#E53935" />
      <rect x="62" y="25" width="16" height="5" fill="#212121" />
      <circle cx="35" cy="70" r="10" fill="#212121" />
      <circle cx="35" cy="70" r="3" fill="#F44336" />
      <circle cx="65" cy="70" r="12" fill="#212121" />
      <circle cx="65" cy="70" r="4" fill="#F44336" />
      <line x1="35" y1="70" x2="65" y2="70" stroke="#9E9E9E" stroke-width="3" />
      <rect x="30" y="45" width="20" height="15" fill="#81D4FA" rx="2" />
    </g>

    <!-- Airplane -->
    <g v-else-if="name === 'airplane'">
      <path d="M 10,50 Q 50,30 80,50 Q 95,60 80,65 Q 50,75 10,65 Z" fill="#FAFAFA" stroke="#E0E0E0" stroke-width="2" />
      <path d="M 40,45 L 30,15 L 45,15 L 60,40 Z" fill="#1E88E5" />
      <path d="M 35,62 L 25,85 L 40,85 L 55,60 Z" fill="#1E88E5" />
      <path d="M 15,48 L 5,35 L 15,35 Z" fill="#1E88E5" />
      <path d="M 15,62 L 5,75 L 15,75 Z" fill="#1E88E5" />
      <ellipse cx="70" cy="53" rx="8" ry="4" fill="#81D4FA" />
      <line x1="30" y1="56" x2="50" y2="56" stroke="#212121" stroke-width="2" stroke-dasharray="4 4" />
    </g>

    <!-- Rocket -->
    <g v-else-if="name === 'rocket'">
      <path d="M 50,10 Q 70,40 70,70 L 30,70 Q 30,40 50,10 Z" fill="#E0E0E0" />
      <path d="M 30,70 Q 15,70 10,90 L 35,80 Z" fill="#E53935" />
      <path d="M 70,70 Q 85,70 90,90 L 65,80 Z" fill="#E53935" />
      <path d="M 40,70 L 60,70 L 55,90 L 45,90 Z" fill="#757575" />
      <polygon points="45,90 55,90 50,100" fill="#FF9800" />
      <polygon points="47,90 53,90 50,95" fill="#FFEB3B" />
      <circle cx="50" cy="40" r="10" fill="#81D4FA" stroke="#757575" stroke-width="2" />
      <path d="M 50,10 Q 60,25 50,30 Q 40,25 50,10 Z" fill="#E53935" />
    </g>

    <!-- Boat -->
    <g v-else-if="name === 'boat'">
      <path d="M 15,65 L 85,65 L 70,85 L 30,85 Z" fill="#8D6E63" />
      <rect x="48" y="20" width="4" height="45" fill="#5D4037" />
      <path d="M 52,20 L 52,60 L 85,60 Z" fill="#FAFAFA" />
      <path d="M 48,25 L 48,60 L 25,60 Z" fill="#E53935" />
      <circle cx="35" cy="75" r="4" fill="#FFF" />
      <circle cx="50" cy="75" r="4" fill="#FFF" />
      <circle cx="65" cy="75" r="4" fill="#FFF" />
    </g>

    <!-- Submarine -->
    <g v-else-if="name === 'submarine'">
      <rect x="20" y="45" width="60" height="30" fill="#FFEB3B" rx="15" />
      <rect x="40" y="30" width="20" height="15" fill="#FBC02D" />
      <rect x="45" y="20" width="5" height="10" fill="#9E9E9E" />
      <rect x="50" y="20" width="10" height="3" fill="#9E9E9E" />
      <circle cx="35" cy="60" r="6" fill="#81D4FA" stroke="#F57F17" stroke-width="2" />
      <circle cx="55" cy="60" r="6" fill="#81D4FA" stroke="#F57F17" stroke-width="2" />
      <circle cx="75" cy="60" r="6" fill="#81D4FA" stroke="#F57F17" stroke-width="2" />
      <path d="M 20,55 L 5,50 L 5,70 L 20,65 Z" fill="#FBC02D" />
      <line x1="5" y1="60" x2="-5" y2="60" stroke="#9E9E9E" stroke-width="3" />
    </g>
  </svg>
</template>

<script setup lang="ts">
defineProps<{
  name: string;
}>();
</script>

<style scoped>
.colorful-vehicle {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
}
</style>
