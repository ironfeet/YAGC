<template>
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="colorful-animal">
    <!-- Cat -->
    <g v-if="name === 'cat'">
      <circle cx="50" cy="55" r="40" fill="#FF9800" />
      <polygon points="15,25 40,25 25,50" fill="#FF9800" />
      <polygon points="85,25 60,25 75,50" fill="#FF9800" />
      <polygon points="20,28 35,30 26,45" fill="#F48FB1" />
      <polygon points="80,28 65,30 74,45" fill="#F48FB1" />
      <circle cx="35" cy="50" r="8" fill="#FFF" />
      <circle cx="65" cy="50" r="8" fill="#FFF" />
      <circle cx="35" cy="50" r="4" fill="#4CAF50" />
      <circle cx="65" cy="50" r="4" fill="#4CAF50" />
      <circle cx="36" cy="48" r="1.5" fill="#FFF" />
      <circle cx="66" cy="48" r="1.5" fill="#FFF" />
      <ellipse cx="50" cy="65" rx="15" ry="10" fill="#FFF" />
      <polygon points="45,62 55,62 50,68" fill="#F48FB1" />
      <line x1="30" y1="65" x2="10" y2="60" stroke="#FFF" stroke-width="1.5" stroke-linecap="round" />
      <line x1="30" y1="68" x2="10" y2="68" stroke="#FFF" stroke-width="1.5" stroke-linecap="round" />
      <line x1="70" y1="65" x2="90" y2="60" stroke="#FFF" stroke-width="1.5" stroke-linecap="round" />
      <line x1="70" y1="68" x2="90" y2="68" stroke="#FFF" stroke-width="1.5" stroke-linecap="round" />
    </g>

    <!-- Dog -->
    <g v-else-if="name === 'dog'">
      <circle cx="50" cy="55" r="35" fill="#8D6E63" />
      <ellipse cx="20" cy="45" rx="12" ry="25" fill="#5D4037" />
      <ellipse cx="80" cy="45" rx="12" ry="25" fill="#5D4037" />
      <circle cx="50" cy="70" r="15" fill="#FFF" />
      <ellipse cx="50" cy="65" rx="6" ry="4" fill="#212121" />
      <circle cx="38" cy="48" r="6" fill="#FFF" />
      <circle cx="38" cy="48" r="3" fill="#1E88E5" />
      <circle cx="62" cy="48" r="6" fill="#FFF" />
      <circle cx="62" cy="48" r="3" fill="#1E88E5" />
      <path d="M45,70 Q50,75 55,70" fill="none" stroke="#212121" stroke-width="1.5" stroke-linecap="round" />
    </g>

    <!-- Rabbit -->
    <g v-else-if="name === 'rabbit'">
      <circle cx="50" cy="65" r="35" fill="#FAFAFA" />
      <ellipse cx="35" cy="25" rx="10" ry="30" fill="#FAFAFA" />
      <ellipse cx="35" cy="25" rx="5" ry="20" fill="#F48FB1" />
      <ellipse cx="65" cy="25" rx="10" ry="30" fill="#FAFAFA" />
      <ellipse cx="65" cy="25" rx="5" ry="20" fill="#F48FB1" />
      <circle cx="40" cy="60" r="5" fill="#212121" />
      <circle cx="60" cy="60" r="5" fill="#212121" />
      <circle cx="50" cy="70" r="4" fill="#F48FB1" />
      <rect x="46" y="74" width="8" height="6" fill="#FFF" stroke="#E0E0E0" stroke-width="1" />
    </g>

    <!-- Frog -->
    <g v-else-if="name === 'frog'">
      <ellipse cx="50" cy="65" rx="40" ry="30" fill="#4CAF50" />
      <ellipse cx="50" cy="75" rx="30" ry="15" fill="#CDDC39" />
      <circle cx="30" cy="35" r="18" fill="#4CAF50" />
      <circle cx="70" cy="35" r="18" fill="#4CAF50" />
      <circle cx="30" cy="35" r="12" fill="#FFF" />
      <circle cx="70" cy="35" r="12" fill="#FFF" />
      <circle cx="30" cy="35" r="5" fill="#212121" />
      <circle cx="70" cy="35" r="5" fill="#212121" />
      <path d="M35,70 Q50,80 65,70" fill="none" stroke="#1B5E20" stroke-width="3" stroke-linecap="round" />
    </g>

    <!-- Pig -->
    <g v-else-if="name === 'pig'">
      <circle cx="50" cy="55" r="38" fill="#F48FB1" />
      <polygon points="20,25 35,35 15,45" fill="#E91E63" />
      <polygon points="80,25 65,35 85,45" fill="#E91E63" />
      <ellipse cx="50" cy="65" rx="18" ry="12" fill="#F06292" />
      <circle cx="44" cy="65" r="3" fill="#880E4F" />
      <circle cx="56" cy="65" r="3" fill="#880E4F" />
      <circle cx="35" cy="45" r="5" fill="#212121" />
      <circle cx="34" cy="44" r="1.5" fill="#FFF" />
      <circle cx="65" cy="45" r="5" fill="#212121" />
      <circle cx="64" cy="44" r="1.5" fill="#FFF" />
    </g>

    <!-- Lion -->
    <g v-else-if="name === 'lion'">
      <path d="M50,5 L60,15 L75,10 L80,25 L95,30 L85,45 L95,60 L80,65 L75,80 L60,75 L50,90 L40,75 L25,80 L30,65 L15,60 L25,45 L15,30 L30,25 L25,10 L40,15 Z" fill="#FF5722" />
      <path d="M50,15 L58,22 L70,18 L73,30 L85,35 L78,45 L85,55 L73,60 L70,72 L58,68 L50,78 L42,68 L30,72 L33,60 L20,55 L28,45 L20,35 L33,30 L30,18 L42,22 Z" fill="#FFC107" />
      <circle cx="50" cy="50" r="22" fill="#FFCA28" />
      <circle cx="42" cy="45" r="3" fill="#212121" />
      <circle cx="58" cy="45" r="3" fill="#212121" />
      <ellipse cx="50" cy="58" rx="10" ry="6" fill="#FFF" />
      <polygon points="46,55 54,55 50,60" fill="#795548" />
    </g>

    <!-- Elephant -->
    <g v-else-if="name === 'elephant'">
      <circle cx="15" cy="45" r="25" fill="#78909C" />
      <circle cx="15" cy="45" r="15" fill="#F8BBD0" />
      <circle cx="85" cy="45" r="25" fill="#78909C" />
      <circle cx="85" cy="45" r="15" fill="#F8BBD0" />
      <circle cx="50" cy="55" r="35" fill="#78909C" />
      <path d="M40,65 Q50,100 65,85" fill="none" stroke="#78909C" stroke-width="16" stroke-linecap="round" />
      <circle cx="35" cy="45" r="4" fill="#212121" />
      <circle cx="65" cy="45" r="4" fill="#212121" />
      <path d="M30,60 Q15,75 20,85" fill="none" stroke="#FFF" stroke-width="5" stroke-linecap="round" />
      <path d="M70,60 Q85,75 80,85" fill="none" stroke="#FFF" stroke-width="5" stroke-linecap="round" />
    </g>

    <!-- Penguin -->
    <g v-else-if="name === 'penguin'">
      <ellipse cx="50" cy="55" rx="35" ry="42" fill="#1A237E" />
      <ellipse cx="50" cy="65" rx="25" ry="30" fill="#FFF" />
      <circle cx="35" cy="40" r="10" fill="#FFF" />
      <circle cx="65" cy="40" r="10" fill="#FFF" />
      <circle cx="35" cy="40" r="4" fill="#212121" />
      <circle cx="65" cy="40" r="4" fill="#212121" />
      <polygon points="43,48 57,48 50,58" fill="#FF8F00" />
      <path d="M25,85 Q10,95 25,95 Z" fill="#FF8F00" />
      <path d="M75,85 Q90,95 75,95 Z" fill="#FF8F00" />
    </g>

    <!-- Fox -->
    <g v-else-if="name === 'fox'">
      <polygon points="50,90 10,35 90,35" fill="#E65100" />
      <polygon points="50,90 30,60 70,60" fill="#FFF" />
      <polygon points="10,35 25,10 40,35" fill="#E65100" />
      <polygon points="25,10 32,25 25,30" fill="#212121" />
      <polygon points="90,35 75,10 60,35" fill="#E65100" />
      <polygon points="75,10 68,25 75,30" fill="#212121" />
      <circle cx="35" cy="50" r="4" fill="#212121" />
      <circle cx="65" cy="50" r="4" fill="#212121" />
      <circle cx="50" cy="90" r="6" fill="#212121" />
    </g>

    <!-- Bear -->
    <g v-else-if="name === 'bear'">
      <circle cx="25" cy="25" r="16" fill="#5D4037" />
      <circle cx="25" cy="25" r="8" fill="#D7CCC8" />
      <circle cx="75" cy="25" r="16" fill="#5D4037" />
      <circle cx="75" cy="25" r="8" fill="#D7CCC8" />
      <circle cx="50" cy="55" r="42" fill="#5D4037" />
      <ellipse cx="50" cy="70" rx="22" ry="16" fill="#D7CCC8" />
      <ellipse cx="50" cy="65" rx="8" ry="5" fill="#212121" />
      <circle cx="35" cy="45" r="5" fill="#212121" />
      <circle cx="65" cy="45" r="5" fill="#212121" />
    </g>

    <!-- Monkey -->
    <g v-else-if="name === 'monkey'">
      <circle cx="15" cy="50" r="15" fill="#FFCC80" />
      <circle cx="85" cy="50" r="15" fill="#FFCC80" />
      <circle cx="50" cy="50" r="40" fill="#795548" />
      <path d="M25,40 Q50,15 75,40 Q85,65 70,80 Q50,90 30,80 Q15,65 25,40 Z" fill="#FFCC80" />
      <circle cx="38" cy="45" r="5" fill="#212121" />
      <circle cx="62" cy="45" r="5" fill="#212121" />
      <path d="M40,65 Q50,75 60,65" fill="none" stroke="#795548" stroke-width="3" stroke-linecap="round" />
    </g>

    <!-- Owl -->
    <g v-else-if="name === 'owl'">
      <ellipse cx="50" cy="55" rx="38" ry="40" fill="#8E24AA" />
      <ellipse cx="50" cy="65" rx="28" ry="30" fill="#E1BEE7" />
      <polygon points="20,15 40,25 15,40" fill="#8E24AA" />
      <polygon points="80,15 60,25 85,40" fill="#8E24AA" />
      <circle cx="33" cy="45" r="18" fill="#FFF" />
      <circle cx="67" cy="45" r="18" fill="#FFF" />
      <circle cx="33" cy="45" r="14" fill="#FDD835" />
      <circle cx="67" cy="45" r="14" fill="#FDD835" />
      <circle cx="33" cy="45" r="6" fill="#212121" />
      <circle cx="67" cy="45" r="6" fill="#212121" />
      <polygon points="45,55 55,55 50,65" fill="#FF9800" />
    </g>

    <!-- Duck -->
    <g v-else-if="name === 'duck'">
      <circle cx="50" cy="40" r="32" fill="#FFEB3B" />
      <ellipse cx="50" cy="75" rx="42" ry="22" fill="#FFEB3B" />
      <path d="M85,65 Q100,65 95,80 Z" fill="#FFEB3B" />
      <ellipse cx="20" cy="45" rx="18" ry="10" fill="#FF9800" />
      <circle cx="40" cy="30" r="5" fill="#212121" />
      <ellipse cx="50" cy="75" rx="18" ry="10" fill="#FFF" opacity="0.6" />
    </g>

    <!-- Turtle -->
    <g v-else-if="name === 'turtle'">
      <circle cx="20" cy="50" r="16" fill="#66BB6A" />
      <circle cx="15" cy="45" r="4" fill="#212121" />
      <ellipse cx="40" cy="85" rx="10" ry="14" fill="#66BB6A" />
      <ellipse cx="60" cy="85" rx="10" ry="14" fill="#66BB6A" />
      <ellipse cx="50" cy="55" rx="45" ry="32" fill="#2E7D32" />
      <polygon points="50,35 65,45 65,65 50,75 35,65 35,45" fill="#43A047" />
      <polygon points="50,35 65,45 65,65 50,75 35,65 35,45" fill="none" stroke="#81C784" stroke-width="3" />
    </g>

    <!-- Fish -->
    <g v-else-if="name === 'fish'">
      <ellipse cx="45" cy="50" rx="42" ry="28" fill="#FF5722" />
      <polygon points="5,50 -5,25 0,75" fill="#FF5722" />
      <path d="M25,24 L35,24 L35,76 L25,76 Z" fill="#FFF" />
      <path d="M55,27 L65,27 L65,73 L55,73 Z" fill="#FFF" />
      <circle cx="75" cy="45" r="6" fill="#FFF" />
      <circle cx="77" cy="45" r="3" fill="#212121" />
      <path d="M40,22 Q45,10 50,22 Z" fill="#FF5722" />
    </g>

    <!-- Ladybug -->
    <g v-else-if="name === 'ladybug'">
      <circle cx="50" cy="50" r="38" fill="#D32F2F" />
      <path d="M50,12 L50,88" stroke="#212121" stroke-width="5" />
      <circle cx="50" cy="18" r="14" fill="#212121" />
      <circle cx="32" cy="40" r="7" fill="#212121" />
      <circle cx="68" cy="65" r="7" fill="#212121" />
      <circle cx="32" cy="65" r="6" fill="#212121" />
      <circle cx="68" cy="40" r="6" fill="#212121" />
      <path d="M42,8 Q30,-5 35,2" fill="none" stroke="#212121" stroke-width="3" />
      <path d="M58,8 Q70,-5 65,2" fill="none" stroke="#212121" stroke-width="3" />
    </g>

    <!-- Cow -->
    <g v-else-if="name === 'cow'">
      <rect x="25" y="45" width="50" height="40" rx="15" fill="#FAFAFA" />
      <circle cx="35" cy="55" r="8" fill="#212121" />
      <ellipse cx="65" cy="70" rx="10" ry="12" fill="#212121" />
      <ellipse cx="50" cy="35" rx="20" ry="15" fill="#FAFAFA" />
      <polygon points="35,25 40,15 45,25" fill="#FFF" stroke="#E0E0E0" />
      <polygon points="65,25 60,15 55,25" fill="#FFF" stroke="#E0E0E0" />
      <ellipse cx="50" cy="42" rx="12" ry="8" fill="#F48FB1" />
      <circle cx="45" cy="40" r="2" fill="#D81B60" />
      <circle cx="55" cy="40" r="2" fill="#D81B60" />
      <circle cx="42" cy="30" r="3" fill="#212121" />
      <circle cx="58" cy="30" r="3" fill="#212121" />
    </g>

    <!-- Sheep -->
    <g v-else-if="name === 'sheep'">
      <path d="M25,55 Q15,45 30,35 Q40,15 60,25 Q80,20 85,45 Q95,65 75,75 Q65,95 45,85 Q20,95 25,55 Z" fill="#F5F5F5" />
      <ellipse cx="50" cy="50" rx="15" ry="12" fill="#424242" />
      <circle cx="45" cy="48" r="2.5" fill="#FFF" />
      <circle cx="55" cy="48" r="2.5" fill="#FFF" />
      <ellipse cx="32" cy="45" rx="6" ry="3" fill="#424242" transform="rotate(30 32 45)" />
      <ellipse cx="68" cy="45" rx="6" ry="3" fill="#424242" transform="rotate(-30 68 45)" />
    </g>

    <!-- Horse -->
    <g v-else-if="name === 'horse'">
      <ellipse cx="50" cy="55" rx="35" ry="25" fill="#8D6E63" />
      <path d="M30,55 L20,25 L40,35 Z" fill="#8D6E63" />
      <ellipse cx="25" cy="20" rx="8" ry="14" fill="#5D4037" transform="rotate(-30 25 20)" />
      <polygon points="35,15 40,5 45,15" fill="#8D6E63" />
      <polygon points="50,20 55,10 60,20" fill="#8D6E63" />
      <path d="M25,35 Q45,25 60,40" fill="none" stroke="#3E2723" stroke-width="8" stroke-linecap="round" />
      <circle cx="32" cy="22" r="3" fill="#212121" />
      <ellipse cx="20" cy="15" rx="4" ry="2" fill="#FFF" opacity="0.8" />
    </g>

    <!-- Hippo -->
    <g v-else-if="name === 'hippo'">
      <ellipse cx="50" cy="65" rx="38" ry="28" fill="#9FA8DA" />
      <circle cx="30" cy="35" r="10" fill="#9FA8DA" />
      <circle cx="70" cy="35" r="10" fill="#9FA8DA" />
      <ellipse cx="50" cy="40" rx="25" ry="20" fill="#9FA8DA" />
      <ellipse cx="50" cy="55" rx="35" ry="22" fill="#7986CB" />
      <circle cx="35" cy="50" r="4" fill="#3949AB" />
      <circle cx="65" cy="50" r="4" fill="#3949AB" />
      <rect x="40" y="65" width="6" height="8" rx="2" fill="#FFF" />
      <rect x="54" y="65" width="6" height="8" rx="2" fill="#FFF" />
      <circle cx="40" cy="35" r="3" fill="#212121" />
      <circle cx="60" cy="35" r="3" fill="#212121" />
    </g>

    <!-- Rhino -->
    <g v-else-if="name === 'rhino'">
      <ellipse cx="50" cy="65" rx="42" ry="25" fill="#B0BEC5" />
      <ellipse cx="30" cy="45" rx="20" ry="18" fill="#B0BEC5" />
      <path d="M15,45 Q15,15 25,30 Z" fill="#ECEFF1" />
      <ellipse cx="45" cy="32" rx="5" ry="8" fill="#90A4AE" transform="rotate(20 45 32)" />
      <ellipse cx="25" cy="32" rx="5" ry="8" fill="#90A4AE" transform="rotate(-20 25 32)" />
      <circle cx="35" cy="40" r="3" fill="#212121" />
      <circle cx="20" cy="55" r="2" fill="#546E7A" />
      <path d="M85,60 Q95,55 90,70" fill="none" stroke="#90A4AE" stroke-width="4" stroke-linecap="round" />
    </g>

    <!-- Crocodile -->
    <g v-else-if="name === 'crocodile'">
      <path d="M10,65 Q30,50 50,65 Q70,80 90,65 Q70,90 50,85 Q30,80 10,65 Z" fill="#43A047" />
      <ellipse cx="30" cy="55" rx="25" ry="12" fill="#43A047" />
      <circle cx="45" cy="48" r="8" fill="#43A047" />
      <circle cx="45" cy="48" r="4" fill="#FFF" />
      <circle cx="46" cy="48" r="2" fill="#212121" />
      <circle cx="20" cy="52" r="2" fill="#1B5E20" />
      <polygon points="60,65 65,55 70,65" fill="#2E7D32" />
      <polygon points="75,67 80,58 85,65" fill="#2E7D32" />
    </g>

    <!-- Tiger -->
    <g v-else-if="name === 'tiger'">
      <circle cx="50" cy="55" r="35" fill="#FF9800" />
      <polygon points="20,25 35,35 15,45" fill="#FF9800" />
      <polygon points="80,25 65,35 85,45" fill="#FF9800" />
      <ellipse cx="50" cy="65" rx="15" ry="10" fill="#FFF" />
      <polygon points="45,62 55,62 50,68" fill="#212121" />
      <circle cx="35" cy="45" r="4" fill="#212121" />
      <circle cx="65" cy="45" r="4" fill="#212121" />
      <!-- Stripes -->
      <path d="M50,20 L45,30 L55,30 Z" fill="#212121" />
      <path d="M20,50 L30,48 L30,52 Z" fill="#212121" />
      <path d="M80,50 L70,48 L70,52 Z" fill="#212121" />
      <path d="M25,70 L35,65 L35,70 Z" fill="#212121" />
      <path d="M75,70 L65,65 L65,70 Z" fill="#212121" />
    </g>

    <!-- Zebra -->
    <g v-else-if="name === 'zebra'">
      <ellipse cx="50" cy="55" rx="35" ry="25" fill="#FFF" />
      <ellipse cx="25" cy="40" rx="15" ry="20" fill="#FFF" />
      <polygon points="25,20 30,10 35,25" fill="#FFF" />
      <polygon points="15,25 10,15 20,30" fill="#FFF" />
      <ellipse cx="20" cy="50" rx="8" ry="6" fill="#424242" />
      <circle cx="30" cy="35" r="3" fill="#212121" />
      <!-- Stripes -->
      <path d="M50,30 L45,45 L55,45 Z" fill="#212121" />
      <path d="M65,35 L60,55 L70,55 Z" fill="#212121" />
      <path d="M80,45 L75,60 L85,60 Z" fill="#212121" />
      <path d="M40,75 L45,60 L50,80 Z" fill="#212121" />
      <path d="M60,80 L65,65 L70,80 Z" fill="#212121" />
    </g>
  </svg>
</template>

<script setup lang="ts">
defineProps<{
  name: string;
}>();
</script>

<style scoped>
.colorful-animal {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
}
</style>
