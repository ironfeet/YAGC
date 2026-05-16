<script setup lang="ts">
import { computed } from 'vue';
import type { VocabularyNoun, AnimalShape } from '../../types';
import AnimalAsset from './AnimalAsset.vue';

const ANIMALS: AnimalShape[] = ['zebra', 'giraffe', 'elephant', 'lion', 'tiger', 'bear', 'monkey', 'rhino', 'hippo', 'crocodile', 'turtle', 'snake', 'frog', 'dog', 'cat', 'rabbit', 'mouse', 'fox', 'deer', 'cow', 'pig', 'sheep', 'horse', 'camel', 'kangaroo', 'penguin', 'duck', 'owl', 'dinosaur', 'leopard'];

const props = defineProps<{
  name: VocabularyNoun | '?';
  color?: string; // CSS color value e.g., 'red', '#FF0000', etc.
  size?: 'small' | 'large' | 'medium';
  isSilhouette?: boolean;
}>();

// Ensure there is always a fallback fill color if none provided
const fillColor = computed(() => props.color || '#cccccc');

// Dynamic sizing allows the application to cleanly differentiate "small dog" vs "large dog"
const dimensions = computed(() => {
  if (props.size === 'small') return { width: '80px', height: '80px' };
  if (props.size === 'large') return { width: '160px', height: '160px' };
  return { width: '120px', height: '120px' }; // Default medium
});

const isFallbackAnimal = computed(() => {
  // If we don't have a custom flat SVG defined below for this animal, but it IS an AnimalShape, we use AnimalAsset.
  const customSvgAnimals = ['dog', 'cat', 'bird', 'rabbit', 'fish'];
  if (customSvgAnimals.includes(props.name as string)) return false;
  return ANIMALS.includes(props.name as any);
});
</script>

<template>
  <div class="asset-container" :class="{ 'silhouette': isSilhouette }" :style="dimensions">
    
    <!-- Dog -->
    <svg v-if="name === 'dog'" viewBox="0 0 100 100" class="asset-svg">
      <!-- Floppy left ear -->
      <ellipse cx="24" cy="48" rx="11" ry="18" :fill="fillColor" stroke="#000" stroke-width="2.5" transform="rotate(-15 24 48)" />
      <!-- Floppy right ear -->
      <ellipse cx="76" cy="48" rx="11" ry="18" :fill="fillColor" stroke="#000" stroke-width="2.5" transform="rotate(15 76 48)" />
      <!-- Body -->
      <ellipse cx="50" cy="72" rx="32" ry="22" :fill="fillColor" stroke="#000" stroke-width="3" />
      <!-- Head -->
      <circle cx="50" cy="40" r="26" :fill="fillColor" stroke="#000" stroke-width="3" />
      <!-- Snout -->
      <ellipse cx="50" cy="52" rx="12" ry="8" fill="rgba(0,0,0,0.12)" stroke="#000" stroke-width="1.5" />
      <!-- Nose -->
      <ellipse cx="50" cy="48" rx="5" ry="3.5" fill="#222" />
      <!-- Left eye -->
      <circle cx="38" cy="36" r="5" fill="#222" />
      <circle cx="39.5" cy="34.5" r="1.5" fill="white" />
      <!-- Right eye -->
      <circle cx="62" cy="36" r="5" fill="#222" />
      <circle cx="63.5" cy="34.5" r="1.5" fill="white" />
      <!-- Smile -->
      <path d="M43,56 Q50,62 57,56" fill="none" stroke="#222" stroke-width="2" stroke-linecap="round" />
      <!-- Front legs -->
      <rect x="33" y="88" width="12" height="10" rx="5" :fill="fillColor" stroke="#000" stroke-width="2.5" />
      <rect x="55" y="88" width="12" height="10" rx="5" :fill="fillColor" stroke="#000" stroke-width="2.5" />
      <!-- Tail -->
      <path d="M82,65 Q98,50 90,40" fill="none" :stroke="fillColor" stroke-width="7" stroke-linecap="round" />
      <path d="M82,65 Q98,50 90,40" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round" />
    </svg>
    
    <!-- Cup -->
    <svg v-else-if="name === 'cup'" viewBox="0 0 100 100" class="asset-svg">
      <path d="M30,20 L70,20 L65,80 Q65,90 50,90 Q35,90 35,80 Z" :fill="fillColor" stroke="#000" stroke-width="4" stroke-linejoin="round" />
      <path d="M70,30 Q90,30 90,50 Q90,70 68,70" fill="none" stroke="#000" stroke-width="6" stroke-linecap="round" />
    </svg>
    
    <!-- Ball -->
    <svg v-else-if="name === 'ball'" viewBox="0 0 100 100" class="asset-svg">
      <circle cx="50" cy="50" r="40" :fill="fillColor" stroke="#000" stroke-width="4" />
      <path d="M30,20 Q50,50 30,80" fill="none" stroke="#000" stroke-width="4" />
      <path d="M70,20 Q50,50 70,80" fill="none" stroke="#000" stroke-width="4" />
    </svg>
    
    <!-- Car -->
    <svg v-else-if="name === 'car'" viewBox="0 0 100 100" class="asset-svg">
      <path d="M20,50 L30,30 L70,30 L80,50 L90,50 L90,70 L10,70 L10,50 Z" :fill="fillColor" stroke="#000" stroke-width="3" stroke-linejoin="round" />
      <circle cx="30" cy="70" r="12" fill="#333" />
      <circle cx="70" cy="70" r="12" fill="#333" />
      <circle cx="30" cy="70" r="6" fill="#ccc" />
      <circle cx="70" cy="70" r="6" fill="#ccc" />
      <rect x="35" y="32" width="15" height="15" fill="#fff" stroke="#000" stroke-width="2" />
      <rect x="55" y="32" width="15" height="15" fill="#fff" stroke="#000" stroke-width="2" />
    </svg>

    <!-- Car Sedan (Classic Car) -->
    <svg v-else-if="name === 'car-sedan'" viewBox="0 0 100 100" class="asset-svg">
      <path d="M15,60 L25,35 L60,35 L75,60 L90,60 L90,80 L10,80 L10,60 Z" :fill="fillColor" stroke="#000" stroke-width="3" stroke-linejoin="round" />
      <circle cx="25" cy="80" r="10" fill="#333" />
      <circle cx="75" cy="80" r="10" fill="#333" />
      <path d="M30,35 L45,35 L45,60 L25,60 Z" fill="#fff" stroke="#000" stroke-width="2" />
      <path d="M45,35 L55,35 L70,60 L45,60 Z" fill="#fff" stroke="#000" stroke-width="2" />
    </svg>

    <!-- Car Truck (Pickup) -->
    <svg v-else-if="name === 'car-truck'" viewBox="0 0 100 100" class="asset-svg">
      <path d="M10,40 L40,40 L40,80 L10,80 Z" :fill="fillColor" stroke="#000" stroke-width="3" stroke-linejoin="round" />
      <path d="M40,55 L90,55 L90,80 L40,80 Z" :fill="fillColor" stroke="#000" stroke-width="3" stroke-linejoin="round" />
      <circle cx="25" cy="80" r="12" fill="#333" />
      <circle cx="75" cy="80" r="12" fill="#333" />
      <rect x="15" y="45" width="20" height="15" fill="#fff" stroke="#000" stroke-width="2" />
    </svg>

    <!-- Car Tractor -->
    <svg v-else-if="name === 'car-tractor'" viewBox="0 0 100 100" class="asset-svg">
      <path d="M15,30 L45,30 L45,80 L10,80 L10,50 Z" :fill="fillColor" stroke="#000" stroke-width="3" stroke-linejoin="round" />
      <path d="M45,50 L85,50 L85,80 L45,80 Z" :fill="fillColor" stroke="#000" stroke-width="3" stroke-linejoin="round" />
      <circle cx="30" cy="80" r="15" fill="#333" />
      <circle cx="70" cy="80" r="10" fill="#333" />
      <rect x="20" y="35" width="20" height="15" fill="#fff" stroke="#000" stroke-width="2" />
      <rect x="70" y="35" width="5" height="15" fill="#555" /> <!-- Smokestack -->
    </svg>
    
    <!-- Book -->
    <svg v-else-if="name === 'book'" viewBox="0 0 100 100" class="asset-svg">
      <path d="M20,20 L80,20 L80,80 L20,80 Z" :fill="fillColor" stroke="#000" stroke-width="4" stroke-linejoin="round" />
      <path d="M30,20 L30,80" fill="none" stroke="#000" stroke-width="4" />
      <rect x="40" y="35" width="30" height="5" fill="#fff" />
      <rect x="40" y="50" width="30" height="5" fill="#fff" />
      <rect x="40" y="65" width="20" height="5" fill="#fff" />
    </svg>
    
    <!-- Table -->
    <svg v-else-if="name === 'table'" viewBox="0 0 100 100" class="asset-svg">
      <rect x="10" y="30" width="80" height="10" :fill="fillColor" stroke="#000" stroke-width="3" />
      <rect x="20" y="40" width="10" height="50" :fill="fillColor" stroke="#000" stroke-width="3" />
      <rect x="70" y="40" width="10" height="50" :fill="fillColor" stroke="#000" stroke-width="3" />
    </svg>
    
    <!-- Chair -->
    <svg v-else-if="name === 'chair'" viewBox="0 0 100 100" class="asset-svg">
      <rect x="20" y="10" width="10" height="80" :fill="fillColor" stroke="#000" stroke-width="3" />
      <rect x="70" y="50" width="10" height="40" :fill="fillColor" stroke="#000" stroke-width="3" />
      <rect x="30" y="40" width="40" height="10" :fill="fillColor" stroke="#000" stroke-width="3" />
      <rect x="30" y="20" width="40" height="10" :fill="fillColor" stroke="#000" stroke-width="3" />
    </svg>
    
    <!-- Couch -->
    <svg v-else-if="name === 'couch'" viewBox="0 0 100 100" class="asset-svg">
      <rect x="10" y="40" width="20" height="40" :fill="fillColor" stroke="#000" stroke-width="3" rx="5" />
      <rect x="70" y="40" width="20" height="40" :fill="fillColor" stroke="#000" stroke-width="3" rx="5" />
      <rect x="15" y="25" width="70" height="40" :fill="fillColor" stroke="#000" stroke-width="3" rx="5" />
      <rect x="30" y="55" width="40" height="25" :fill="fillColor" stroke="#000" stroke-width="3" />
      <rect x="20" y="80" width="10" height="10" fill="#333" />
      <rect x="70" y="80" width="10" height="10" fill="#333" />
    </svg>
    
    <!-- Slide -->
    <svg v-else-if="name === 'slide'" viewBox="0 0 100 100" class="asset-svg">
      <path d="M20,80 L20,20 L35,20 L80,80 Z" :fill="fillColor" stroke="#000" stroke-width="3" stroke-linejoin="round" />
      <path d="M20,30 L10,30 M20,45 L10,45 M20,60 L10,60 M20,75 L10,75" fill="none" stroke="#000" stroke-width="3" stroke-linecap="round" />
      <line x1="10" y1="20" x2="10" y2="80" stroke="#000" stroke-width="3" />
    </svg>
    
    <!-- Bed -->
    <svg v-else-if="name === 'bed'" viewBox="0 0 100 100" class="asset-svg">
      <rect x="10" y="40" width="10" height="50" :fill="fillColor" stroke="#000" stroke-width="3" rx="2" />
      <rect x="80" y="60" width="10" height="30" :fill="fillColor" stroke="#000" stroke-width="3" rx="2" />
      <rect x="20" y="60" width="60" height="15" :fill="fillColor" stroke="#000" stroke-width="3" />
      <rect x="20" y="50" width="25" height="15" fill="#fff" stroke="#000" stroke-width="2" rx="4" />
    </svg>

    <!-- Cat -->
    <svg v-else-if="name === 'cat'" viewBox="0 0 100 100" class="asset-svg">
      <!-- Pointy left ear -->
      <polygon points="22,42 12,12 38,32" :fill="fillColor" stroke="#000" stroke-width="2.5" stroke-linejoin="round" />
      <!-- Pointy right ear -->
      <polygon points="78,42 88,12 62,32" :fill="fillColor" stroke="#000" stroke-width="2.5" stroke-linejoin="round" />
      <!-- Inner ear color -->
      <polygon points="24,40 17,20 36,33" fill="#fca5a5" />
      <polygon points="76,40 83,20 64,33" fill="#fca5a5" />
      <!-- Body -->
      <ellipse cx="50" cy="74" rx="28" ry="20" :fill="fillColor" stroke="#000" stroke-width="3" />
      <!-- Head -->
      <circle cx="50" cy="44" r="26" :fill="fillColor" stroke="#000" stroke-width="3" />
      <!-- Left eye -->
      <ellipse cx="39" cy="39" rx="5" ry="6" fill="#222" />
      <ellipse cx="40" cy="37" rx="1.8" ry="2.5" fill="white" />
      <!-- Right eye -->
      <ellipse cx="61" cy="39" rx="5" ry="6" fill="#222" />
      <ellipse cx="62" cy="37" rx="1.8" ry="2.5" fill="white" />
      <!-- Nose -->
      <polygon points="50,51 46,56 54,56" fill="#fca5a5" stroke="#222" stroke-width="1" />
      <!-- Mouth -->
      <path d="M46,56 Q50,60 54,56" fill="none" stroke="#222" stroke-width="1.8" stroke-linecap="round" />
      <!-- Whiskers -->
      <line x1="36" y1="53" x2="14" y2="48" stroke="#444" stroke-width="1.5" />
      <line x1="36" y1="57" x2="14" y2="57" stroke="#444" stroke-width="1.5" />
      <line x1="36" y1="61" x2="14" y2="66" stroke="#444" stroke-width="1.5" />
      <line x1="64" y1="53" x2="86" y2="48" stroke="#444" stroke-width="1.5" />
      <line x1="64" y1="57" x2="86" y2="57" stroke="#444" stroke-width="1.5" />
      <line x1="64" y1="61" x2="86" y2="66" stroke="#444" stroke-width="1.5" />
      <!-- Tail curling up -->
      <path d="M78,80 Q96,65 88,45 Q83,33 92,28" fill="none" :stroke="fillColor" stroke-width="7" stroke-linecap="round" />
      <path d="M78,80 Q96,65 88,45 Q83,33 92,28" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round" />
      <!-- Paws -->
      <rect x="34" y="90" width="12" height="8" rx="4" :fill="fillColor" stroke="#000" stroke-width="2.5" />
      <rect x="54" y="90" width="12" height="8" rx="4" :fill="fillColor" stroke="#000" stroke-width="2.5" />
    </svg>

    <!-- Bird -->
    <svg v-else-if="name === 'bird'" viewBox="0 0 100 100" class="asset-svg">
      <!-- Body -->
      <ellipse cx="50" cy="62" rx="28" ry="22" :fill="fillColor" stroke="#000" stroke-width="3" />
      <!-- Head -->
      <circle cx="68" cy="34" r="18" :fill="fillColor" stroke="#000" stroke-width="3" />
      <!-- Wing -->
      <path d="M22,58 Q8,35 22,22 Q30,45 50,50 Z" :fill="fillColor" stroke="#000" stroke-width="2.5" stroke-linejoin="round" />
      <!-- Wing feather detail -->
      <path d="M22,22 Q26,38 38,46" fill="none" stroke="rgba(0,0,0,0.3)" stroke-width="1.5" />
      <path d="M14,35 Q20,45 30,50" fill="none" stroke="rgba(0,0,0,0.3)" stroke-width="1.5" />
      <!-- Beak -->
      <path d="M84,30 L96,34 L84,40 Z" fill="#f59e0b" stroke="#000" stroke-width="1.5" stroke-linejoin="round" />
      <!-- Eye -->
      <circle cx="74" cy="30" r="5.5" fill="#111" />
      <circle cx="75.5" cy="28.5" r="2" fill="white" />
      <!-- Tail feathers -->
      <path d="M24,72 Q10,80 5,90 Q18,80 22,78" :fill="fillColor" stroke="#000" stroke-width="2" />
      <path d="M28,76 Q18,90 16,98 Q28,84 32,80" :fill="fillColor" stroke="#000" stroke-width="2" />
      <!-- Feet -->
      <line x1="44" y1="84" x2="38" y2="97" stroke="#f59e0b" stroke-width="3.5" stroke-linecap="round" />
      <line x1="38" y1="97" x2="30" y2="99" stroke="#f59e0b" stroke-width="3" stroke-linecap="round" />
      <line x1="38" y1="97" x2="38" y2="100" stroke="#f59e0b" stroke-width="3" stroke-linecap="round" />
      <line x1="58" y1="84" x2="64" y2="97" stroke="#f59e0b" stroke-width="3.5" stroke-linecap="round" />
      <line x1="64" y1="97" x2="72" y2="99" stroke="#f59e0b" stroke-width="3" stroke-linecap="round" />
      <line x1="64" y1="97" x2="64" y2="100" stroke="#f59e0b" stroke-width="3" stroke-linecap="round" />
    </svg>

    <!-- Rabbit -->
    <svg v-else-if="name === 'rabbit'" viewBox="0 0 100 100" class="asset-svg">
      <!-- Long left ear -->
      <ellipse cx="34" cy="20" rx="8" ry="21" :fill="fillColor" stroke="#000" stroke-width="2.5" transform="rotate(-8 34 20)" />
      <ellipse cx="34" cy="20" rx="4" ry="16" fill="#fca5a5" transform="rotate(-8 34 20)" />
      <!-- Long right ear -->
      <ellipse cx="66" cy="20" rx="8" ry="21" :fill="fillColor" stroke="#000" stroke-width="2.5" transform="rotate(8 66 20)" />
      <ellipse cx="66" cy="20" rx="4" ry="16" fill="#fca5a5" transform="rotate(8 66 20)" />
      <!-- Body -->
      <ellipse cx="50" cy="72" rx="30" ry="24" :fill="fillColor" stroke="#000" stroke-width="3" />
      <!-- Belly -->
      <ellipse cx="50" cy="76" rx="18" ry="14" fill="rgba(255,255,255,0.35)" />
      <!-- Head -->
      <circle cx="50" cy="46" r="22" :fill="fillColor" stroke="#000" stroke-width="3" />
      <!-- Left eye -->
      <circle cx="40" cy="41" r="5.5" fill="#222" />
      <circle cx="41.5" cy="39.5" r="2" fill="white" />
      <!-- Right eye -->
      <circle cx="60" cy="41" r="5.5" fill="#222" />
      <circle cx="61.5" cy="39.5" r="2" fill="white" />
      <!-- Nose -->
      <ellipse cx="50" cy="51" rx="3.5" ry="2.5" fill="#fca5a5" stroke="#222" stroke-width="1" />
      <!-- Mouth -->
      <path d="M47,53 Q50,57 53,53" fill="none" stroke="#222" stroke-width="1.8" stroke-linecap="round" />
      <!-- Whiskers -->
      <line x1="38" y1="51" x2="18" y2="47" stroke="#555" stroke-width="1.2" />
      <line x1="38" y1="54" x2="18" y2="54" stroke="#555" stroke-width="1.2" />
      <line x1="62" y1="51" x2="82" y2="47" stroke="#555" stroke-width="1.2" />
      <line x1="62" y1="54" x2="82" y2="54" stroke="#555" stroke-width="1.2" />
      <!-- Fluffy tail -->
      <circle cx="76" cy="82" r="9" :fill="fillColor" stroke="#000" stroke-width="2" />
      <circle cx="76" cy="82" r="6" fill="white" opacity="0.6" />
      <!-- Feet -->
      <ellipse cx="35" cy="93" rx="14" ry="7" :fill="fillColor" stroke="#000" stroke-width="2.5" />
      <ellipse cx="65" cy="93" rx="14" ry="7" :fill="fillColor" stroke="#000" stroke-width="2.5" />
    </svg>

    <!-- Fish -->
    <svg v-else-if="name === 'fish'" viewBox="0 0 100 100" class="asset-svg">
      <!-- Tail fin -->
      <path d="M72,50 L92,28 L88,50 L92,72 Z" :fill="fillColor" stroke="#000" stroke-width="2.5" stroke-linejoin="round" />
      <!-- Body -->
      <ellipse cx="46" cy="50" rx="38" ry="25" :fill="fillColor" stroke="#000" stroke-width="3" />
      <!-- Belly highlight -->
      <ellipse cx="42" cy="55" rx="24" ry="13" fill="rgba(255,255,255,0.25)" />
      <!-- Top dorsal fin -->
      <path d="M35,26 Q50,12 65,26" :fill="fillColor" stroke="#000" stroke-width="2.5" stroke-linejoin="round" />
      <!-- Bottom fin -->
      <path d="M42,75 Q50,88 58,75" :fill="fillColor" stroke="#000" stroke-width="2" stroke-linejoin="round" />
      <!-- Eye -->
      <circle cx="20" cy="46" r="7" fill="white" stroke="#000" stroke-width="2" />
      <circle cx="21" cy="46" r="4.5" fill="#111" />
      <circle cx="22" cy="44" r="1.5" fill="white" />
      <!-- Mouth -->
      <path d="M8,50 Q12,55 8,58" fill="none" stroke="#222" stroke-width="2" stroke-linecap="round" />
      <!-- Scale lines -->
      <path d="M38,34 Q44,50 38,66" fill="none" stroke="rgba(0,0,0,0.2)" stroke-width="2" />
      <path d="M52,30 Q60,50 52,70" fill="none" stroke="rgba(0,0,0,0.2)" stroke-width="2" />
      <path d="M64,34 Q70,50 64,66" fill="none" stroke="rgba(0,0,0,0.2)" stroke-width="2" />
    </svg>

    <!-- Apple -->
    <svg v-else-if="name === 'apple'" viewBox="0 0 100 100" class="asset-svg">
      <!-- Leaf -->
      <path d="M50,18 Q62,5 74,12 Q68,25 50,22 Z" fill="#4CAF50" stroke="#2E7D32" stroke-width="1.5" stroke-linejoin="round" />
      <!-- Stem -->
      <path d="M50,22 Q53,12 56,8" fill="none" stroke="#795548" stroke-width="3" stroke-linecap="round" />
      <!-- Body: left lobe -->
      <path d="M50,28 C30,28 10,40 12,62 C14,80 28,94 50,93 C72,94 86,80 88,62 C90,40 70,28 50,28 Z" :fill="fillColor" stroke="#000" stroke-width="3" stroke-linejoin="round" />
      <!-- Indent at top center -->
      <path d="M42,30 Q50,24 58,30" fill="none" stroke="rgba(0,0,0,0.25)" stroke-width="2.5" stroke-linecap="round" />
      <!-- Shine highlight -->
      <ellipse cx="34" cy="48" rx="8" ry="12" fill="rgba(255,255,255,0.35)" transform="rotate(-20 34 48)" />
    </svg>

    <!-- Banana -->
    <svg v-else-if="name === 'banana'" viewBox="0 0 100 100" class="asset-svg">
      <!-- Main banana body — crescent curve -->
      <path d="M18,72 Q22,85 40,88 Q62,92 80,72 Q92,56 88,35 Q84,20 78,18 Q74,28 76,42 Q78,58 66,72 Q52,84 34,80 Q20,76 18,72 Z" :fill="fillColor" stroke="#000" stroke-width="3" stroke-linejoin="round" />
      <!-- Ridge line (characteristic center line of banana) -->
      <path d="M22,70 Q48,84 78,56 Q86,42 82,26" fill="none" stroke="rgba(0,0,0,0.2)" stroke-width="2" stroke-linecap="round" />
      <!-- Tip at bottom (stem end) -->
      <path d="M18,72 Q12,68 14,62 L22,68 Z" fill="#5D4037" stroke="#333" stroke-width="1.5" stroke-linejoin="round" />
      <!-- Tip at top (flower end) -->
      <path d="M78,18 Q84,12 86,18 Q82,24 76,22 Z" fill="#5D4037" stroke="#333" stroke-width="1.5" stroke-linejoin="round" />
      <!-- Subtle sheen -->
      <path d="M30,72 Q54,84 74,62" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="4" stroke-linecap="round" />
    </svg>

    <!-- Tree -->
    <svg v-else-if="name === 'tree'" viewBox="0 0 100 100" class="asset-svg">
      <path d="M 40,95 L 60,95 L 55,50 L 45,50 Z" fill="#795548" stroke="#000" stroke-width="4" stroke-linejoin="round" />
      <path d="M 50,10 Q 80,10 90,40 Q 100,60 80,75 Q 50,90 20,75 Q 0,60 10,40 Q 20,10 50,10 Z" :fill="fillColor" stroke="#000" stroke-width="4" stroke-linejoin="round" />
      <path d="M 20,40 A 15,15 0 0,1 50,30 A 15,15 0 0,1 80,40 A 15,15 0 0,1 65,70 A 20,20 0 0,1 35,70 A 15,15 0 0,1 20,40 Z" fill="rgba(255,255,255,0.2)" />
    </svg>

    <!-- House -->
    <svg v-else-if="name === 'house'" viewBox="0 0 100 100" class="asset-svg">
      <rect x="20" y="45" width="60" height="45" :fill="fillColor" stroke="#000" stroke-width="4" />
      <polygon points="10,45 50,15 90,45" fill="#D32F2F" stroke="#000" stroke-width="4" stroke-linejoin="round" />
      <rect x="40" y="65" width="20" height="25" fill="#795548" stroke="#000" stroke-width="3" />
      <circle cx="55" cy="78" r="3" fill="#FFC107" />
      <rect x="25" y="55" width="10" height="10" fill="#E0F7FA" stroke="#000" stroke-width="2" />
      <rect x="65" y="55" width="10" height="10" fill="#E0F7FA" stroke="#000" stroke-width="2" />
    </svg>

    <!-- Star -->
    <svg v-else-if="name === 'star'" viewBox="0 0 100 100" class="asset-svg">
      <polygon points="50,10 61,40 93,40 67,59 77,90 50,71 23,90 33,59 7,40 39,40" :fill="fillColor" stroke="#000" stroke-width="4" stroke-linejoin="round" />
    </svg>

    <!-- Moon -->
    <svg v-else-if="name === 'moon'" viewBox="0 0 100 100" class="asset-svg">
      <path d="M 75,15 A 40,40 0 1,0 75,85 A 45,45 0 0,1 75,15 Z" :fill="fillColor" stroke="#000" stroke-width="4" stroke-linejoin="round" />
    </svg>

    <!-- Sun -->
    <svg v-else-if="name === 'sun'" viewBox="0 0 100 100" class="asset-svg">
      <circle cx="50" cy="50" r="25" :fill="fillColor" stroke="#000" stroke-width="4" />
      <path d="M 50,5 L 50,15 M 50,85 L 50,95 M 5,50 L 15,50 M 85,50 L 95,50 M 18,18 L 25,25 M 75,75 L 82,82 M 18,82 L 25,75 M 75,18 L 82,25" fill="none" stroke="#000" stroke-width="4" stroke-linecap="round" />
    </svg>

    <!-- Cloud -->
    <svg v-else-if="name === 'cloud'" viewBox="0 0 100 100" class="asset-svg">
      <path d="M 25,65 A 15,15 0 0,1 25,35 A 20,20 0 0,1 60,25 A 25,25 0 0,1 90,50 A 15,15 0 0,1 75,75 Z" :fill="fillColor" stroke="#000" stroke-width="4" stroke-linejoin="round" />
    </svg>

    <!-- Flower -->
    <svg v-else-if="name === 'flower'" viewBox="0 0 100 100" class="asset-svg">
      <path d="M 50,55 L 50,95" fill="none" stroke="#4CAF50" stroke-width="6" stroke-linecap="round" />
      <path d="M 50,80 Q 30,70 35,60 Q 45,60 50,75 Z" fill="#4CAF50" stroke="#000" stroke-width="2" />
      <path d="M 50,85 Q 70,75 65,65 Q 55,65 50,80 Z" fill="#4CAF50" stroke="#000" stroke-width="2" />
      <circle cx="50" cy="20" r="15" :fill="fillColor" stroke="#000" stroke-width="3" />
      <circle cx="30" cy="35" r="15" :fill="fillColor" stroke="#000" stroke-width="3" />
      <circle cx="70" cy="35" r="15" :fill="fillColor" stroke="#000" stroke-width="3" />
      <circle cx="38" cy="55" r="15" :fill="fillColor" stroke="#000" stroke-width="3" />
      <circle cx="62" cy="55" r="15" :fill="fillColor" stroke="#000" stroke-width="3" />
      <circle cx="50" cy="40" r="12" fill="#FFEB3B" stroke="#000" stroke-width="3" />
    </svg>

    <!-- Key -->
    <svg v-else-if="name === 'key'" viewBox="0 0 100 100" class="asset-svg">
      <circle cx="30" cy="50" r="20" :fill="fillColor" stroke="#000" stroke-width="4" />
      <circle cx="30" cy="50" r="8" fill="#FFF" stroke="#000" stroke-width="3" />
      <path d="M 50,50 L 90,50" fill="none" stroke="#000" stroke-width="8" stroke-linecap="round" />
      <path d="M 70,50 L 70,65 M 85,50 L 85,65" fill="none" stroke="#000" stroke-width="8" stroke-linecap="round" />
    </svg>

    <!-- Scissors -->
    <svg v-else-if="name === 'scissors'" viewBox="0 0 100 100" class="asset-svg">
      <circle cx="30" cy="30" r="15" :fill="fillColor" stroke="#000" stroke-width="4" />
      <circle cx="30" cy="30" r="6" fill="#FFF" stroke="#000" stroke-width="3" />
      <circle cx="30" cy="70" r="15" :fill="fillColor" stroke="#000" stroke-width="4" />
      <circle cx="30" cy="70" r="6" fill="#FFF" stroke="#000" stroke-width="3" />
      <path d="M 42,38 L 90,75 L 85,80 Z" fill="#E0E0E0" stroke="#000" stroke-width="3" stroke-linejoin="round" />
      <path d="M 42,62 L 90,25 L 85,20 Z" fill="#E0E0E0" stroke="#000" stroke-width="3" stroke-linejoin="round" />
      <circle cx="55" cy="50" r="4" fill="#333" />
    </svg>

    <!-- Guitar -->
    <svg v-else-if="name === 'guitar'" viewBox="0 0 100 100" class="asset-svg">
      <path d="M 40,25 C 20,20 10,40 25,50 C 10,70 30,90 50,85 C 70,90 90,70 75,50 C 90,40 80,20 60,25 C 50,20 50,20 40,25 Z" :fill="fillColor" stroke="#000" stroke-width="4" stroke-linejoin="round" transform="rotate(45 50 50)" />
      <circle cx="50" cy="65" r="12" fill="#333" transform="rotate(45 50 50)" />
      <rect x="46" y="10" width="8" height="50" fill="#795548" stroke="#000" stroke-width="2" transform="rotate(45 50 50)" />
      <rect x="42" y="5" width="16" height="10" fill="#5D4037" stroke="#000" stroke-width="2" transform="rotate(45 50 50)" />
      <path d="M 48,15 L 48,70 M 50,15 L 50,70 M 52,15 L 52,70" fill="none" stroke="#FFF" stroke-width="1" transform="rotate(45 50 50)" />
    </svg>

    <!-- Trumpet -->
    <svg v-else-if="name === 'trumpet'" viewBox="0 0 100 100" class="asset-svg">
      <path d="M 20,45 L 60,45 L 85,30 L 90,30 L 90,70 L 85,70 L 60,55 L 20,55 Z" :fill="fillColor" stroke="#000" stroke-width="3" stroke-linejoin="round" />
      <path d="M 10,48 L 20,48 L 20,52 L 10,52 Z" fill="#9E9E9E" stroke="#000" stroke-width="2" />
      <rect x="35" y="30" width="4" height="20" fill="#9E9E9E" stroke="#000" stroke-width="2" />
      <rect x="45" y="30" width="4" height="20" fill="#9E9E9E" stroke="#000" stroke-width="2" />
      <rect x="55" y="30" width="4" height="20" fill="#9E9E9E" stroke="#000" stroke-width="2" />
    </svg>

    <!-- Bicycle -->
    <svg v-else-if="name === 'bicycle'" viewBox="0 0 100 100" class="asset-svg">
      <circle cx="25" cy="70" r="15" fill="none" stroke="#000" stroke-width="4" />
      <circle cx="75" cy="70" r="15" fill="none" stroke="#000" stroke-width="4" />
      <path d="M 25,70 L 45,45 L 70,45 L 75,70" fill="none" :stroke="fillColor" stroke-width="4" stroke-linejoin="round" />
      <path d="M 45,45 L 50,70 L 75,70" fill="none" :stroke="fillColor" stroke-width="4" stroke-linejoin="round" />
      <path d="M 70,45 L 65,25 L 75,25" fill="none" stroke="#000" stroke-width="4" stroke-linejoin="round" />
      <path d="M 45,45 L 40,30 L 30,30" fill="none" stroke="#000" stroke-width="4" stroke-linejoin="round" />
      <path d="M 35,30 L 45,30" stroke="#000" stroke-width="6" stroke-linecap="round" />
    </svg>

    <!-- Airplane -->
    <svg v-else-if="name === 'airplane'" viewBox="0 0 100 100" class="asset-svg">
      <path d="M 10,60 L 30,60 L 50,30 L 60,30 L 50,60 L 80,60 Q 95,60 95,50 Q 95,70 80,70 L 50,70 L 40,90 L 30,90 L 40,70 L 20,70 L 10,80 Z" :fill="fillColor" stroke="#000" stroke-width="3" stroke-linejoin="round" />
      <path d="M 65,60 Q 80,60 85,55 Q 80,50 65,50 Z" fill="#E0F7FA" stroke="#000" stroke-width="2" />
    </svg>

    <!-- Boat -->
    <svg v-else-if="name === 'boat'" viewBox="0 0 100 100" class="asset-svg">
      <path d="M 10,60 L 90,60 L 70,85 L 30,85 Z" :fill="fillColor" stroke="#000" stroke-width="4" stroke-linejoin="round" />
      <rect x="45" y="45" width="10" height="15" fill="#795548" stroke="#000" stroke-width="3" />
      <polygon points="55,45 80,45 55,15" fill="#FFF" stroke="#000" stroke-width="3" stroke-linejoin="round" />
      <polygon points="45,45 25,45 45,25" fill="#FFF" stroke="#000" stroke-width="3" stroke-linejoin="round" />
      <path d="M 5,75 Q 25,65 50,75 T 95,75" fill="none" stroke="#2196F3" stroke-width="4" stroke-linecap="round" />
    </svg>

    <!-- Train -->
    <svg v-else-if="name === 'train'" viewBox="0 0 100 100" class="asset-svg">
      <rect x="20" y="40" width="40" height="35" :fill="fillColor" stroke="#000" stroke-width="3" />
      <rect x="60" y="55" width="30" height="20" :fill="fillColor" stroke="#000" stroke-width="3" />
      <rect x="70" y="35" width="10" height="20" fill="#795548" stroke="#000" stroke-width="3" />
      <polygon points="90,75 100,85 60,85" fill="#757575" stroke="#000" stroke-width="3" stroke-linejoin="round" />
      <rect x="30" y="50" width="15" height="15" fill="#E0F7FA" stroke="#000" stroke-width="2" />
      <circle cx="30" cy="80" r="8" fill="#333" stroke="#000" stroke-width="2" />
      <circle cx="50" cy="80" r="8" fill="#333" stroke="#000" stroke-width="2" />
      <circle cx="75" cy="80" r="6" fill="#333" stroke="#000" stroke-width="2" />
      <path d="M 30,80 L 50,80" fill="none" stroke="#FFF" stroke-width="3" />
      <path d="M 75,25 Q 85,15 95,20" fill="none" stroke="#BDBDBD" stroke-width="4" stroke-linecap="round" stroke-dasharray="4,6" />
    </svg>

    <!-- Clock -->
    <svg v-else-if="name === 'clock'" viewBox="0 0 100 100" class="asset-svg">
      <circle cx="50" cy="50" r="40" :fill="fillColor" stroke="#000" stroke-width="6" />
      <circle cx="50" cy="50" r="30" fill="#FFF" stroke="#000" stroke-width="2" />
      <circle cx="50" cy="50" r="3" fill="#333" />
      <line x1="50" y1="50" x2="50" y2="30" stroke="#333" stroke-width="4" stroke-linecap="round" />
      <line x1="50" y1="50" x2="65" y2="50" stroke="#333" stroke-width="3" stroke-linecap="round" />
      <line x1="50" y1="25" x2="50" y2="28" stroke="#333" stroke-width="3" />
      <line x1="50" y1="75" x2="50" y2="72" stroke="#333" stroke-width="3" />
      <line x1="25" y1="50" x2="28" y2="50" stroke="#333" stroke-width="3" />
      <line x1="75" y1="50" x2="72" y2="50" stroke="#333" stroke-width="3" />
      <path d="M 25,20 A 15,15 0 0,1 15,30 M 75,20 A 15,15 0 0,0 85,30" fill="none" stroke="#000" stroke-width="4" stroke-linecap="round" />
    </svg>

    <!-- Lamp -->
    <svg v-else-if="name === 'lamp'" viewBox="0 0 100 100" class="asset-svg">
      <path d="M 35,20 L 65,20 L 80,60 L 20,60 Z" :fill="fillColor" stroke="#000" stroke-width="4" stroke-linejoin="round" />
      <rect x="45" y="60" width="10" height="25" fill="#795548" stroke="#000" stroke-width="3" />
      <ellipse cx="50" cy="85" rx="20" ry="5" fill="#795548" stroke="#000" stroke-width="3" />
      <circle cx="50" cy="15" r="5" fill="#FFC107" stroke="#000" stroke-width="2" />
    </svg>

    <!-- Television -->
    <svg v-else-if="name === 'television'" viewBox="0 0 100 100" class="asset-svg">
      <rect x="15" y="30" width="70" height="50" :fill="fillColor" stroke="#000" stroke-width="4" rx="5" />
      <rect x="25" y="40" width="40" height="30" fill="#E0F7FA" stroke="#000" stroke-width="3" />
      <circle cx="75" cy="45" r="3" fill="#333" />
      <circle cx="75" cy="55" r="3" fill="#333" />
      <rect x="70" y="65" width="10" height="5" fill="#333" />
      <path d="M 35,10 L 50,30 L 65,10" fill="none" stroke="#000" stroke-width="3" stroke-linecap="round" />
      <circle cx="35" cy="10" r="2" fill="#000" />
      <circle cx="65" cy="10" r="2" fill="#000" />
      <path d="M 40,80 L 30,95 M 60,80 L 70,95" fill="none" stroke="#000" stroke-width="4" stroke-linecap="round" />
    </svg>

    <!-- Computer -->
    <svg v-else-if="name === 'computer'" viewBox="0 0 100 100" class="asset-svg">
      <rect x="20" y="20" width="60" height="45" :fill="fillColor" stroke="#000" stroke-width="4" rx="3" />
      <rect x="25" y="25" width="50" height="35" fill="#E0F7FA" stroke="#000" stroke-width="2" />
      <rect x="40" y="65" width="20" height="10" fill="#BDBDBD" stroke="#000" stroke-width="3" />
      <ellipse cx="50" cy="80" rx="25" ry="5" fill="#BDBDBD" stroke="#000" stroke-width="3" />
      <rect x="15" y="85" width="70" height="8" fill="#9E9E9E" stroke="#000" stroke-width="3" rx="2" />
    </svg>

    <!-- Phone -->
    <svg v-else-if="name === 'phone'" viewBox="0 0 100 100" class="asset-svg">
      <rect x="30" y="15" width="40" height="70" :fill="fillColor" stroke="#000" stroke-width="4" rx="8" />
      <rect x="35" y="25" width="30" height="45" fill="#E0F7FA" stroke="#000" stroke-width="2" />
      <circle cx="50" cy="78" r="4" fill="#333" />
      <line x1="45" y1="20" x2="55" y2="20" stroke="#333" stroke-width="2" stroke-linecap="round" />
    </svg>

    <!-- Shoes -->
    <svg v-else-if="name === 'shoes'" viewBox="0 0 100 100" class="asset-svg">
      <path d="M 10,60 C 10,35 30,40 40,55 L 45,55 L 45,80 L 10,80 Z" :fill="fillColor" stroke="#000" stroke-width="3" stroke-linejoin="round" />
      <path d="M 50,60 C 50,35 70,40 80,55 L 85,55 L 85,80 L 50,80 Z" :fill="fillColor" stroke="#000" stroke-width="3" stroke-linejoin="round" />
      <path d="M 10,80 L 45,80 L 45,88 L 10,88 Z" fill="#333" />
      <path d="M 50,80 L 85,80 L 85,88 L 50,88 Z" fill="#333" />
      <path d="M 25,55 L 35,45 M 25,60 L 35,50 M 25,65 L 35,55" fill="none" stroke="#FFF" stroke-width="2" />
      <path d="M 65,55 L 75,45 M 65,60 L 75,50 M 65,65 L 75,55" fill="none" stroke="#FFF" stroke-width="2" />
    </svg>

    <!-- Hat -->
    <svg v-else-if="name === 'hat'" viewBox="0 0 100 100" class="asset-svg">
      <path d="M 30,60 C 30,20 70,20 70,60" :fill="fillColor" stroke="#000" stroke-width="4" />
      <ellipse cx="50" cy="60" rx="40" ry="10" :fill="fillColor" stroke="#000" stroke-width="4" />
      <path d="M 30,55 Q 50,65 70,55 L 70,60 Q 50,70 30,60 Z" fill="#333" />
    </svg>

    <!-- Shirt -->
    <svg v-else-if="name === 'shirt'" viewBox="0 0 100 100" class="asset-svg">
      <path d="M 35,20 L 45,30 L 55,30 L 65,20 L 90,35 L 75,55 L 70,50 L 70,90 L 30,90 L 30,50 L 25,55 L 10,35 Z" :fill="fillColor" stroke="#000" stroke-width="4" stroke-linejoin="round" />
      <path d="M 35,20 L 50,40 L 65,20" fill="none" stroke="#000" stroke-width="3" stroke-linejoin="round" />
    </svg>

    <!-- Pants -->
    <svg v-else-if="name === 'pants'" viewBox="0 0 100 100" class="asset-svg">
      <path d="M 30,20 L 70,20 L 75,40 L 80,90 L 55,90 L 50,50 L 45,90 L 20,90 L 25,40 Z" :fill="fillColor" stroke="#000" stroke-width="4" stroke-linejoin="round" />
      <path d="M 50,20 L 50,45" fill="none" stroke="#000" stroke-width="3" />
      <rect x="45" y="20" width="10" height="5" fill="#333" />
    </svg>

    <!-- Socks -->
    <svg v-else-if="name === 'socks'" viewBox="0 0 100 100" class="asset-svg">
      <path d="M 25,30 L 40,30 L 40,65 Q 40,85 20,85 L 15,85 Q 10,85 10,75 L 25,75 Z" :fill="fillColor" stroke="#000" stroke-width="3" stroke-linejoin="round" />
      <path d="M 60,30 L 75,30 L 75,65 Q 75,85 55,85 L 50,85 Q 45,85 45,75 L 60,75 Z" :fill="fillColor" stroke="#000" stroke-width="3" stroke-linejoin="round" />
      <path d="M 25,40 L 40,40 M 25,45 L 40,45" fill="none" stroke="#FFF" stroke-width="2" />
      <path d="M 60,40 L 75,40 M 60,45 L 75,45" fill="none" stroke="#FFF" stroke-width="2" />
    </svg>

    <!-- Fallback for animals defined in AnimalAsset.vue but not here -->
    <div v-else-if="isFallbackAnimal" class="asset-svg">
      <AnimalAsset :shape="name as any" :color="fillColor" size="large" direction="left" />
    </div>

    <!-- Fallback if name is unrecognized -->
    <svg v-else viewBox="0 0 100 100" class="asset-svg">
      <rect x="10" y="10" width="80" height="80" :fill="fillColor" stroke="#000" stroke-width="4" stroke-dasharray="10,5" />
      <text x="50" y="55" font-size="40" text-anchor="middle" fill="#000">?</text>
    </svg>
  </div>
</template>

<style scoped>
.asset-container {
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  filter: drop-shadow(0 4px 6px rgba(0,0,0,0.15));
}

.asset-svg {
  width: 100%;
  height: 100%;
  overflow: visible;
}

/* 
  Deep CSS to forcefully override all interior fills/strokes 
  if the component is meant to be a solid black silhouette 
*/
.asset-container.silhouette :deep(svg path),
.asset-container.silhouette :deep(svg rect),
.asset-container.silhouette :deep(svg circle),
.asset-container.silhouette :deep(svg line),
.asset-container.silhouette :deep(svg ellipse) {
  fill: #111111 !important;
  stroke: #111111 !important;
}
</style>
