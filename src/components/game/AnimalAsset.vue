<script setup lang="ts">
import { computed } from 'vue';
import type { AnimalShape, AnimalSize, AnimalDirection } from '../../types';

const props = defineProps<{
  color: string;
  shape: AnimalShape;
  size: AnimalSize;
  direction: AnimalDirection;
}>();

const transformString = computed(() => {
  let transforms = [];
  // Center is 100, 100
  if (props.direction === 'right') {
    transforms.push('translate(200, 0) scale(-1, 1)');
  }
  if (props.size === 'small') {
    transforms.push('translate(40, 40) scale(0.6)');
  }
  return transforms.join(' ');
});
</script>

<template>
  <svg viewBox="0 0 200 200" class="animal-asset" xmlns="http://www.w3.org/2000/svg">
    <g class="animal-group" :transform="transformString">

      <!-- ELEPHANT -->
      <g v-if="shape === 'elephant'">
        <!-- Back leg -->
        <path d="M 120,130 L 120,170 C 120,175 130,175 130,170 L 130,130" :fill="color" opacity="0.8" />
        <!-- Front leg -->
        <path d="M 80,140 L 80,175 C 80,180 95,180 95,175 L 95,140" :fill="color" opacity="0.8" />
        <!-- Body -->
        <path d="M 50,100 C 50,50 160,60 160,120 C 160,150 145,170 140,170 C 135,170 135,150 135,140 C 120,140 110,140 100,140 C 100,150 100,175 95,175 C 90,175 80,175 80,140 L 70,140 C 60,130 50,110 50,100 Z" :fill="color" stroke="#333" stroke-width="3" stroke-linejoin="round" />
        <!-- Head -->
        <circle cx="55" cy="105" r="30" :fill="color" stroke="#333" stroke-width="3" />
        <!-- Trunk -->
        <path d="M 30,120 Q -5,160 10,180 C 15,185 25,180 20,170 Q 10,150 35,130" :fill="color" stroke="#333" stroke-width="3" stroke-linecap="round" />
        <!-- Tusk -->
        <path d="M 35,125 Q 15,135 10,155 Q 25,145 40,125" fill="#FFF" stroke="#333" stroke-width="2" />
        <!-- Ear -->
        <path d="M 75,90 C 110,70 110,140 75,130 C 65,125 65,95 75,90 Z" :fill="color" stroke="#333" stroke-width="3" stroke-linejoin="round" />
        <path d="M 77,95 C 100,80 100,130 77,125 C 70,120 70,100 77,95 Z" fill="rgba(0,0,0,0.15)" />
        <!-- Eye -->
        <ellipse cx="40" cy="95" rx="3" ry="5" fill="#333" />
        <!-- Tail -->
        <path d="M 160,105 Q 175,120 170,150" fill="none" stroke="#333" stroke-width="3" stroke-linecap="round" />
        <path d="M 167,145 L 170,155 L 173,145 Z" fill="#333" />
      </g>

      <!-- GIRAFFE -->
      <g v-else-if="shape === 'giraffe'">
        <!-- Back Legs -->
        <rect x="100" y="130" width="8" height="60" :fill="color" opacity="0.8" />
        <rect x="135" y="130" width="8" height="60" :fill="color" opacity="0.8" />
        <!-- Body -->
        <path d="M 90,100 L 150,110 C 155,115 155,135 145,140 L 95,140 C 85,135 85,105 90,100 Z" :fill="color" stroke="#333" stroke-width="3" stroke-linejoin="round" />
        <!-- Neck -->
        <path d="M 95,110 Q 80,40 50,30 L 65,15 Q 105,40 115,100 Z" :fill="color" stroke="#333" stroke-width="3" stroke-linejoin="round" />
        <!-- Head -->
        <ellipse cx="50" cy="20" rx="20" ry="12" :fill="color" stroke="#333" stroke-width="3" transform="rotate(-20 50 20)" />
        <path d="M 35,25 Q 30,30 40,30" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" />
        <!-- Eye -->
        <circle cx="45" cy="15" r="3" fill="#333" />
        <!-- Horns -->
        <line x1="60" y1="10" x2="65" y2="0" stroke="#333" stroke-width="3" stroke-linecap="round" />
        <circle cx="65" cy="-2" r="4" :fill="color" stroke="#333" stroke-width="2" />
        <line x1="53" y1="5" x2="55" y2="-5" stroke="#333" stroke-width="3" stroke-linecap="round" />
        <circle cx="55" cy="-7" r="4" :fill="color" stroke="#333" stroke-width="2" />
        <!-- Front Legs -->
        <rect x="95" y="140" width="10" height="50" :fill="color" stroke="#333" stroke-width="3" />
        <rect x="130" y="140" width="10" height="50" :fill="color" stroke="#333" stroke-width="3" />
        <!-- Tail -->
        <path d="M 150,115 Q 165,130 160,165" fill="none" stroke="#333" stroke-width="3" stroke-linecap="round" />
        <circle cx="160" cy="165" r="3" fill="#333" />
        <!-- Spots -->
        <path d="M 105,115 A 5,7 0 1,0 115,115 A 5,7 0 1,0 105,115 Z M 125,120 A 6,8 0 1,0 137,120 A 6,8 0 1,0 125,120 Z M 115,130 A 4,5 0 1,0 123,130 A 4,5 0 1,0 115,130 Z M 95,80 A 6,4 0 1,0 107,80 A 6,4 0 1,0 95,80 Z M 85,50 A 4,6 0 1,0 93,50 A 4,6 0 1,0 85,50 Z M 75,70 A 5,5 0 1,0 85,70 A 5,5 0 1,0 75,70 Z M 70,30 A 3,4 0 1,0 76,30 A 3,4 0 1,0 70,30 Z" fill="#654321" opacity="0.7" />
      </g>

      <!-- ZEBRA -->
      <g v-else-if="shape === 'zebra'">
        <!-- Back legs -->
        <rect x="118" y="135" width="14" height="45" rx="6" :fill="color" stroke="#333" stroke-width="2" />
        <rect x="88" y="135" width="14" height="45" rx="6" :fill="color" stroke="#333" stroke-width="2" />
        <!-- Hooves back -->
        <rect x="117" y="173" width="16" height="8" rx="3" fill="#222" />
        <rect x="87" y="173" width="16" height="8" rx="3" fill="#222" />
        <!-- Body -->
        <ellipse cx="110" cy="120" rx="48" ry="28" :fill="color" stroke="#333" stroke-width="3" />
        <!-- Front legs -->
        <rect x="68" y="130" width="14" height="48" rx="6" :fill="color" stroke="#333" stroke-width="2" />
        <rect x="48" y="128" width="14" height="46" rx="6" :fill="color" stroke="#333" stroke-width="2" />
        <!-- Hooves front -->
        <rect x="47" y="167" width="16" height="8" rx="3" fill="#222" />
        <rect x="67" y="171" width="16" height="8" rx="3" fill="#222" />
        <!-- Neck -->
        <path d="M72,105 Q55,75 42,55" :fill="color" stroke="#333" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M82,100 Q68,70 58,52" :fill="color" stroke="#333" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M72,105 Q55,75 42,55 Q50,50 58,52 Q68,70 82,100 Z" :fill="color" stroke="#333" stroke-width="3" stroke-linejoin="round" />
        <!-- Head -->
        <ellipse cx="38" cy="50" rx="22" ry="14" :fill="color" stroke="#333" stroke-width="3" transform="rotate(-20 38 50)" />
        <!-- Snout -->
        <ellipse cx="22" cy="56" rx="10" ry="7" fill="rgba(255,255,255,0.2)" stroke="#333" stroke-width="2" transform="rotate(-20 22 56)" />
        <!-- Nostril -->
        <ellipse cx="16" cy="58" rx="2.5" ry="2" fill="#555" transform="rotate(-20 16 58)" />
        <!-- Eye -->
        <circle cx="44" cy="44" r="4" fill="#111" />
        <circle cx="45.5" cy="42.5" r="1.5" fill="white" />
        <!-- Ear -->
        <path d="M48,35 Q53,25 58,34" :fill="color" stroke="#333" stroke-width="2.5" stroke-linejoin="round" />
        <!-- Mane -->
        <path d="M58,50 Q65,80 72,105" fill="none" stroke="#222" stroke-width="6" stroke-linecap="round" />
        <!-- Bold stripes on body -->
        <path d="M80,100 Q84,128 80,148" fill="none" stroke="#111" stroke-width="6" stroke-linecap="round" opacity="0.7" />
        <path d="M96,96 Q100,124 98,148" fill="none" stroke="#111" stroke-width="6" stroke-linecap="round" opacity="0.7" />
        <path d="M112,94 Q116,122 116,148" fill="none" stroke="#111" stroke-width="6" stroke-linecap="round" opacity="0.7" />
        <path d="M128,97 Q132,118 130,140" fill="none" stroke="#111" stroke-width="6" stroke-linecap="round" opacity="0.7" />
        <!-- Stripes on neck -->
        <path d="M58,68 Q62,75 64,84" fill="none" stroke="#111" stroke-width="4" stroke-linecap="round" opacity="0.8" />
        <path d="M50,58 Q54,65 56,74" fill="none" stroke="#111" stroke-width="4" stroke-linecap="round" opacity="0.8" />
        <!-- Tail -->
        <path d="M158,112 Q175,118 168,148" fill="none" stroke="#333" stroke-width="3" stroke-linecap="round" />
        <path d="M166,143 Q168,155 170,148 Q168,158 165,150 Z" fill="#222" />
      </g>

      <!-- LION -->
      <g v-else-if="shape === 'lion'">
        <!-- Back legs -->
        <path d="M 130,130 L 130,175 C 130,180 140,180 140,175 L 140,130" :fill="color" opacity="0.8" />
        <path d="M 90,130 L 90,175 C 90,180 100,180 100,175 L 100,130" :fill="color" opacity="0.8" />
        <!-- Body -->
        <path d="M 70,90 Q 130,80 150,90 C 170,110 160,130 150,130 L 145,175 C 145,180 135,180 135,175 L 130,130 L 100,130 L 95,175 C 95,180 85,180 85,175 L 85,120 Q 60,120 50,105 Z" :fill="color" stroke="#333" stroke-width="3" stroke-linejoin="round" />
        <!-- Mane Base -->
        <circle cx="50" cy="75" r="45" fill="#B85D19" stroke="#333" stroke-width="3" />
        <!-- Mane Details -->
        <path d="M 50,30 Q 70,25 80,45 Q 95,60 85,85 Q 90,110 70,115 Q 50,125 30,115 Q 10,110 15,85 Q 5,60 20,45 Q 30,25 50,30 Z" fill="#D97A29" stroke="#B85D19" stroke-width="2" stroke-linejoin="round" />
        <!-- Face -->
        <circle cx="50" cy="80" r="25" :fill="color" stroke="#333" stroke-width="3" />
        <!-- Ears -->
        <circle cx="30" cy="55" r="8" :fill="color" stroke="#333" stroke-width="3" />
        <circle cx="70" cy="55" r="8" :fill="color" stroke="#333" stroke-width="3" />
        <!-- Eyes -->
        <circle cx="40" cy="72" r="3" fill="#333" />
        <circle cx="60" cy="72" r="3" fill="#333" />
        <!-- Nose/Mouth -->
        <polygon points="45,82 55,82 50,88" fill="#333" />
        <path d="M 50,88 L 50,93 M 50,93 Q 45,98 40,93 M 50,93 Q 55,98 60,93" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" />
        <!-- Tail -->
        <path d="M 155,100 Q 185,110 175,150" fill="none" stroke="#333" stroke-width="3" stroke-linecap="round" />
        <path d="M 170,150 Q 175,160 180,150 Z" fill="#B85D19" stroke="#333" stroke-width="2" />
      </g>

      <!-- TIGER -->
      <g v-else-if="shape === 'tiger'">
        <!-- Back legs -->
        <path d="M 130,130 L 130,175 C 130,180 140,180 140,175 L 140,130" :fill="color" opacity="0.8" />
        <path d="M 90,130 L 90,175 C 90,180 100,180 100,175 L 100,130" :fill="color" opacity="0.8" />
        <!-- Body -->
        <path d="M 70,90 Q 130,80 150,90 C 170,110 160,130 150,130 L 145,175 C 145,180 135,180 135,175 L 130,130 L 100,130 L 95,175 C 95,180 85,180 85,175 L 85,120 Q 60,120 50,105 Z" :fill="color" stroke="#333" stroke-width="3" stroke-linejoin="round" />
        <!-- Head -->
        <circle cx="50" cy="80" r="28" :fill="color" stroke="#333" stroke-width="3" />
        <!-- Ears -->
        <circle cx="30" cy="60" r="8" :fill="color" stroke="#333" stroke-width="3" />
        <circle cx="70" cy="60" r="8" :fill="color" stroke="#333" stroke-width="3" />
        <!-- Eyes -->
        <circle cx="40" cy="75" r="3" fill="#333" />
        <circle cx="60" cy="75" r="3" fill="#333" />
        <!-- Nose/Mouth -->
        <polygon points="46,85 54,85 50,90" fill="#333" />
        <path d="M 50,90 L 50,95 M 50,95 Q 45,100 40,95 M 50,95 Q 55,100 60,95" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" />
        <!-- Body Stripes -->
        <path d="M 80,95 L 80,120 M 100,90 L 100,125 M 120,88 L 120,125 M 140,92 L 140,120 M 130,90 L 130,110 M 110,88 L 110,110 M 90,92 L 90,110" fill="none" stroke="#333" stroke-width="4" stroke-linecap="round" />
        <!-- Face Stripes -->
        <path d="M 25,75 L 35,78 M 75,75 L 65,78 M 28,85 L 35,85 M 72,85 L 65,85 M 50,55 L 50,65 M 45,58 L 47,65 M 55,58 L 53,65" fill="none" stroke="#333" stroke-width="2.5" stroke-linecap="round" />
        <!-- Tail -->
        <path d="M 155,100 Q 185,110 175,160" fill="none" stroke="#333" stroke-width="5" stroke-linecap="round" stroke-dasharray="6, 4" />
      </g>

      <!-- BEAR -->
      <g v-else-if="shape === 'bear'">
        <!-- Back legs -->
        <path d="M 135,140 L 135,175 C 135,180 150,180 150,175 L 150,140" :fill="color" opacity="0.8" />
        <path d="M 95,140 L 95,175 C 95,180 110,180 110,175 L 110,140" :fill="color" opacity="0.8" />
        <!-- Body -->
        <path d="M 80,80 Q 150,60 165,90 C 185,120 170,140 160,140 L 155,175 C 155,185 135,185 135,175 L 130,140 L 115,140 L 110,175 C 110,185 90,185 90,175 L 85,130 Q 60,130 50,110 Z" :fill="color" stroke="#333" stroke-width="3" stroke-linejoin="round" />
        <!-- Ears -->
        <circle cx="35" cy="50" r="14" :fill="color" stroke="#333" stroke-width="3" />
        <circle cx="35" cy="50" r="7" fill="#E8C396" />
        <circle cx="85" cy="55" r="14" :fill="color" stroke="#333" stroke-width="3" />
        <circle cx="85" cy="55" r="7" fill="#E8C396" />
        <!-- Head -->
        <circle cx="60" cy="85" r="35" :fill="color" stroke="#333" stroke-width="3" />
        <!-- Eyes -->
        <circle cx="45" cy="75" r="4" fill="#333" />
        <circle cx="75" cy="75" r="4" fill="#333" />
        <!-- Snout -->
        <ellipse cx="60" cy="95" rx="16" ry="12" fill="#E8C396" stroke="#333" stroke-width="2" />
        <polygon points="56,90 64,90 60,95" fill="#333" />
        <path d="M 60,95 L 60,102 M 60,102 Q 55,105 50,100 M 60,102 Q 65,105 70,100" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" />
        <!-- Tail -->
        <circle cx="165" cy="120" r="10" :fill="color" stroke="#333" stroke-width="3" />
      </g>

      <!-- MONKEY -->
      <g v-else-if="shape === 'monkey'">
        <!-- Body -->
        <ellipse cx="100" cy="130" rx="35" ry="45" :fill="color" stroke="#333" stroke-width="3" />
        <!-- Belly -->
        <ellipse cx="100" cy="135" rx="22" ry="32" fill="#F0D0A0" stroke="#333" stroke-width="2" />
        <!-- Tail -->
        <path d="M 130,140 Q 180,120 170,60 C 165,30 140,20 130,40" fill="none" stroke="currentColor" stroke-width="8" stroke-linecap="round" :color="color" />
        <path d="M 130,140 Q 180,120 170,60 C 165,30 140,20 130,40" fill="none" stroke="#333" stroke-width="12" stroke-linecap="round" style="mix-blend-mode: multiply; opacity: 0.5" />
        <path d="M 130,140 Q 180,120 170,60 C 165,30 140,20 130,40" fill="none" stroke="currentColor" stroke-width="8" stroke-linecap="round" :color="color" />
        <!-- Legs -->
        <path d="M 85,165 L 70,190 M 115,165 L 130,190" fill="none" stroke="currentColor" stroke-width="10" stroke-linecap="round" :color="color" />
        <path d="M 85,165 L 70,190 M 115,165 L 130,190" fill="none" stroke="#333" stroke-width="14" stroke-linecap="round" style="mix-blend-mode: multiply; opacity: 0.5" />
        <path d="M 85,165 L 70,190 M 115,165 L 130,190" fill="none" stroke="currentColor" stroke-width="10" stroke-linecap="round" :color="color" />
        <circle cx="70" cy="190" r="6" fill="#F0D0A0" stroke="#333" stroke-width="2" />
        <circle cx="130" cy="190" r="6" fill="#F0D0A0" stroke="#333" stroke-width="2" />
        <!-- Arms -->
        <path d="M 70,110 Q 40,120 40,150 M 130,110 Q 160,120 160,150" fill="none" stroke="currentColor" stroke-width="10" stroke-linecap="round" :color="color" />
        <path d="M 70,110 Q 40,120 40,150 M 130,110 Q 160,120 160,150" fill="none" stroke="#333" stroke-width="14" stroke-linecap="round" style="mix-blend-mode: multiply; opacity: 0.5" />
        <path d="M 70,110 Q 40,120 40,150 M 130,110 Q 160,120 160,150" fill="none" stroke="currentColor" stroke-width="10" stroke-linecap="round" :color="color" />
        <circle cx="40" cy="150" r="6" fill="#F0D0A0" stroke="#333" stroke-width="2" />
        <circle cx="160" cy="150" r="6" fill="#F0D0A0" stroke="#333" stroke-width="2" />
        <!-- Ears -->
        <circle cx="70" cy="70" r="12" :fill="color" stroke="#333" stroke-width="3" />
        <circle cx="70" cy="70" r="6" fill="#F0D0A0" />
        <circle cx="130" cy="70" r="12" :fill="color" stroke="#333" stroke-width="3" />
        <circle cx="130" cy="70" r="6" fill="#F0D0A0" />
        <!-- Head -->
        <circle cx="100" cy="70" r="28" :fill="color" stroke="#333" stroke-width="3" />
        <!-- Face area -->
        <path d="M 80,70 C 80,50 120,50 120,70 C 125,85 115,95 100,95 C 85,95 75,85 80,70 Z" fill="#F0D0A0" stroke="#333" stroke-width="2" stroke-linejoin="round" />
        <!-- Eyes -->
        <circle cx="90" cy="65" r="4" fill="#333" />
        <circle cx="110" cy="65" r="4" fill="#333" />
        <!-- Nose/Mouth -->
        <path d="M 95,78 Q 100,82 105,78" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" />
        <circle cx="98" cy="74" r="1" fill="#333" />
        <circle cx="102" cy="74" r="1" fill="#333" />
      </g>

      <!-- RHINO -->
      <g v-else-if="shape === 'rhino'">
        <!-- Back legs -->
        <path d="M 140,140 L 140,175 C 140,180 150,180 150,175 L 150,140" :fill="color" opacity="0.8" />
        <path d="M 100,140 L 100,175 C 100,180 110,180 110,175 L 110,140" :fill="color" opacity="0.8" />
        <!-- Body -->
        <path d="M 60,90 Q 120,70 160,90 C 175,100 175,130 160,140 L 155,175 C 155,185 135,185 135,175 L 130,140 L 115,140 L 110,175 C 110,185 90,185 90,175 L 85,140 Q 60,140 50,110 Z" :fill="color" stroke="#333" stroke-width="3" stroke-linejoin="round" />
        <!-- Head -->
        <path d="M 70,90 Q 40,80 20,110 L 20,135 Q 50,140 60,110 Z" :fill="color" stroke="#333" stroke-width="3" stroke-linejoin="round" />
        <!-- Horns -->
        <path d="M 30,110 L 20,70 Q 35,90 45,105 Z" fill="#E0E0E0" stroke="#333" stroke-width="2" stroke-linejoin="round" />
        <path d="M 45,105 L 45,85 Q 50,95 55,100 Z" fill="#E0E0E0" stroke="#333" stroke-width="2" stroke-linejoin="round" />
        <!-- Eye -->
        <circle cx="55" cy="95" r="3" fill="#333" />
        <!-- Ear -->
        <path d="M 70,80 Q 75,60 85,75 Z" :fill="color" stroke="#333" stroke-width="2" stroke-linejoin="round" />
        <!-- Tail -->
        <path d="M 165,100 Q 185,110 180,140" fill="none" stroke="#333" stroke-width="3" stroke-linecap="round" />
        <path d="M 178,135 L 180,145 L 182,135 Z" fill="#333" />
        <!-- Armor folds -->
        <path d="M 70,90 L 70,130 M 130,80 L 130,140" fill="none" stroke="#333" stroke-width="2" opacity="0.5" />
      </g>

      <!-- HIPPO -->
      <g v-else-if="shape === 'hippo'">
        <!-- Back legs -->
        <rect x="75" y="140" width="16" height="35" rx="5" :fill="color" opacity="0.8" />
        <rect x="135" y="140" width="16" height="35" rx="5" :fill="color" opacity="0.8" />
        <!-- Body -->
        <ellipse cx="110" cy="115" rx="65" ry="45" :fill="color" stroke="#333" stroke-width="3" />
        <!-- Front legs -->
        <rect x="65" y="145" width="18" height="35" rx="5" :fill="color" stroke="#333" stroke-width="3" />
        <rect x="125" y="145" width="18" height="35" rx="5" :fill="color" stroke="#333" stroke-width="3" />
        <!-- Head Base -->
        <circle cx="45" cy="100" r="35" :fill="color" stroke="#333" stroke-width="3" />
        <!-- Snout -->
        <ellipse cx="35" cy="115" rx="28" ry="22" fill="#E0B0B0" stroke="#333" stroke-width="3" />
        <!-- Nostrils -->
        <ellipse cx="22" cy="110" rx="4" ry="6" fill="#333" transform="rotate(-20 22 110)" />
        <ellipse cx="48" cy="110" rx="4" ry="6" fill="#333" transform="rotate(20 48 110)" />
        <!-- Eyes -->
        <circle cx="40" cy="85" r="4" fill="#333" />
        <circle cx="65" cy="85" r="4" fill="#333" />
        <path d="M 35,80 Q 40,75 45,80 M 60,80 Q 65,75 70,80" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" />
        <!-- Ears -->
        <circle cx="45" cy="65" r="8" :fill="color" stroke="#333" stroke-width="3" />
        <circle cx="70" cy="65" r="8" :fill="color" stroke="#333" stroke-width="3" />
        <!-- Tail -->
        <path d="M 175,115 Q 185,125 180,140" fill="none" stroke="#333" stroke-width="3" stroke-linecap="round" />
      </g>

      <!-- CROCODILE -->
      <g v-else-if="shape === 'crocodile'">
        <!-- Back legs -->
        <path d="M 140,140 L 140,165 C 140,170 150,170 150,165 L 150,140" :fill="color" opacity="0.8" />
        <path d="M 90,140 L 90,165 C 90,170 100,170 100,165 L 100,140" :fill="color" opacity="0.8" />
        <!-- Tail & Body & Head -->
        <path d="M 190,145 Q 150,105 100,120 L 50,120 Q 20,120 15,140 L 30,145 L 20,150 L 50,150 Q 100,160 190,145 Z" :fill="color" stroke="#333" stroke-width="3" stroke-linejoin="round" />
        <!-- Snout bump -->
        <path d="M 30,120 Q 35,110 40,120" :fill="color" stroke="#333" stroke-width="2" />
        <!-- Eye bump -->
        <path d="M 60,120 Q 65,105 75,120" :fill="color" stroke="#333" stroke-width="2" />
        <!-- Eye -->
        <circle cx="68" cy="115" r="3" fill="#333" />
        <!-- Nostril -->
        <circle cx="25" cy="135" r="2" fill="#333" />
        <!-- Teeth -->
        <path d="M 20,145 L 25,150 L 30,145 L 35,150 L 40,145 L 45,150 L 50,145" fill="none" stroke="#FFF" stroke-width="2" stroke-linejoin="round" />
        <!-- Spikes/Scutes -->
        <path d="M 80,122 L 85,112 L 90,122 M 100,120 L 105,110 L 110,120 M 120,122 L 125,112 L 130,122 M 140,125 L 145,115 L 150,128 M 160,132 L 165,122 L 170,135" fill="#4CAF50" stroke="#333" stroke-width="2" stroke-linejoin="round" />
        <!-- Front legs -->
        <path d="M 130,145 L 125,170 C 120,175 135,175 135,170 L 140,145" :fill="color" stroke="#333" stroke-width="2" />
        <path d="M 80,145 L 75,170 C 70,175 85,175 85,170 L 90,145" :fill="color" stroke="#333" stroke-width="2" />
      </g>

      <!-- TURTLE -->
      <g v-else-if="shape === 'turtle'">
        <!-- Legs (Back) -->
        <ellipse cx="60" cy="150" rx="12" ry="18" :fill="color" stroke="#333" stroke-width="3" transform="rotate(20 60 150)" />
        <ellipse cx="140" cy="150" rx="12" ry="18" :fill="color" stroke="#333" stroke-width="3" transform="rotate(-20 140 150)" />
        <!-- Tail -->
        <path d="M 160,125 Q 185,130 170,140 Z" :fill="color" stroke="#333" stroke-width="3" stroke-linejoin="round" />
        <!-- Shell -->
        <ellipse cx="100" cy="115" rx="65" ry="40" fill="#4CAF50" stroke="#333" stroke-width="4" />
        <!-- Shell Rim -->
        <path d="M 35,115 C 35,140 165,140 165,115 Z" fill="#81C784" stroke="#333" stroke-width="3" />
        <!-- Shell Pattern -->
        <path d="M 70,90 L 100,80 L 130,90 L 140,115 L 100,130 L 60,115 Z" fill="none" stroke="#2E7D32" stroke-width="4" stroke-linejoin="round" />
        <path d="M 100,80 L 100,75 M 70,90 L 50,95 M 130,90 L 150,95 M 60,115 L 45,125 M 140,115 L 155,125 M 100,130 L 100,140" fill="none" stroke="#2E7D32" stroke-width="4" stroke-linecap="round" />
        <!-- Head -->
        <path d="M 35,125 Q -10,130 10,105 C 20,95 40,100 45,110 Z" :fill="color" stroke="#333" stroke-width="3" stroke-linejoin="round" />
        <!-- Eye -->
        <circle cx="20" cy="112" r="3" fill="#333" />
        <!-- Front Legs (Foreground) -->
        <ellipse cx="75" cy="155" rx="14" ry="20" :fill="color" stroke="#333" stroke-width="3" transform="rotate(15 75 155)" />
        <ellipse cx="125" cy="155" rx="14" ry="20" :fill="color" stroke="#333" stroke-width="3" transform="rotate(-15 125 155)" />
      </g>

      <!-- SNAKE -->
      <g v-else-if="shape === 'snake'">
        <!-- Coiled Body -->
        <path d="M 60,160 C 100,160 120,120 160,130 C 190,140 170,170 140,170 C 100,170 80,180 40,170" fill="none" stroke="currentColor" stroke-width="24" stroke-linecap="round" :color="color" />
        <path d="M 60,160 C 100,160 120,120 160,130 C 190,140 170,170 140,170 C 100,170 80,180 40,170" fill="none" stroke="#333" stroke-width="30" stroke-linecap="round" style="mix-blend-mode: multiply; opacity: 0.5" />
        <path d="M 60,160 C 100,160 120,120 160,130 C 190,140 170,170 140,170 C 100,170 80,180 40,170" fill="none" stroke="currentColor" stroke-width="24" stroke-linecap="round" :color="color" />
        
        <!-- Pattern (Diamonds) -->
        <path d="M 80,155 L 85,150 L 90,155 L 85,160 Z M 130,135 L 135,130 L 140,135 L 135,140 Z M 165,155 L 170,150 L 175,155 L 170,160 Z M 100,170 L 105,165 L 110,170 L 105,175 Z" fill="#333" opacity="0.4" />

        <!-- Neck & Head -->
        <path d="M 60,160 C 30,160 30,100 45,80" fill="none" stroke="currentColor" stroke-width="20" stroke-linecap="round" :color="color" />
        <path d="M 60,160 C 30,160 30,100 45,80" fill="none" stroke="#333" stroke-width="26" stroke-linecap="round" style="mix-blend-mode: multiply; opacity: 0.5" />
        <path d="M 60,160 C 30,160 30,100 45,80" fill="none" stroke="currentColor" stroke-width="20" stroke-linecap="round" :color="color" />
        
        <ellipse cx="45" cy="70" rx="18" ry="14" :fill="color" stroke="#333" stroke-width="3" transform="rotate(-30 45 70)" />
        
        <!-- Eye -->
        <ellipse cx="38" cy="65" rx="3" ry="5" fill="#333" transform="rotate(15 38 65)" />
        <!-- Tongue -->
        <path d="M 28,65 L 15,70 L 10,65 M 15,70 L 10,75" fill="none" stroke="#F44336" stroke-width="2" stroke-linejoin="round" />
      </g>

      <!-- FROG -->
      <g v-else-if="shape === 'frog'">
        <!-- Back Legs -->
        <path d="M 50,120 Q 20,90 20,140 Q 20,180 50,170 Z" :fill="color" stroke="#333" stroke-width="3" stroke-linejoin="round" />
        <path d="M 150,120 Q 180,90 180,140 Q 180,180 150,170 Z" :fill="color" stroke="#333" stroke-width="3" stroke-linejoin="round" />
        <!-- Feet -->
        <path d="M 25,160 L 10,165 L 15,175 L 35,170 Z" :fill="color" stroke="#333" stroke-width="2" stroke-linejoin="round" />
        <path d="M 175,160 L 190,165 L 185,175 L 165,170 Z" :fill="color" stroke="#333" stroke-width="2" stroke-linejoin="round" />
        <!-- Body -->
        <ellipse cx="100" cy="140" rx="45" ry="35" :fill="color" stroke="#333" stroke-width="3" />
        <ellipse cx="100" cy="145" rx="35" ry="25" fill="#FFF" opacity="0.6" />
        <!-- Front Legs -->
        <path d="M 70,150 L 60,170 L 80,175 Z" :fill="color" stroke="#333" stroke-width="2" stroke-linejoin="round" />
        <path d="M 130,150 L 140,170 L 120,175 Z" :fill="color" stroke="#333" stroke-width="2" stroke-linejoin="round" />
        <!-- Eyes Base -->
        <circle cx="75" cy="105" r="18" :fill="color" stroke="#333" stroke-width="3" />
        <circle cx="125" cy="105" r="18" :fill="color" stroke="#333" stroke-width="3" />
        <!-- Eyeballs -->
        <circle cx="75" cy="105" r="10" fill="#FFF" stroke="#333" stroke-width="2" />
        <circle cx="125" cy="105" r="10" fill="#FFF" stroke="#333" stroke-width="2" />
        <!-- Pupils -->
        <circle cx="75" cy="105" r="4" fill="#333" />
        <circle cx="125" cy="105" r="4" fill="#333" />
        <!-- Mouth -->
        <path d="M 75,135 Q 100,150 125,135" fill="none" stroke="#333" stroke-width="3" stroke-linecap="round" />
        <circle cx="70" cy="130" r="3" fill="#FF80AB" opacity="0.8" />
        <circle cx="130" cy="130" r="3" fill="#FF80AB" opacity="0.8" />
      </g>

      <!-- DOG -->
      <g v-else-if="shape === 'dog'">
        <!-- Back legs -->
        <path d="M 130,130 L 130,175 C 130,180 140,180 140,175 L 140,130" :fill="color" opacity="0.8" />
        <path d="M 90,130 L 90,175 C 90,180 100,180 100,175 L 100,130" :fill="color" opacity="0.8" />
        <!-- Body -->
        <rect x="70" y="100" width="70" height="40" rx="20" :fill="color" stroke="#333" stroke-width="3" />
        <!-- Front legs -->
        <path d="M 120,135 L 120,180 C 120,185 130,185 130,180 L 130,135" :fill="color" stroke="#333" stroke-width="3" />
        <path d="M 80,135 L 80,180 C 80,185 90,185 90,180 L 90,135" :fill="color" stroke="#333" stroke-width="3" />
        <!-- Tail -->
        <path d="M 135,110 Q 165,90 155,60" fill="none" stroke="currentColor" stroke-width="10" stroke-linecap="round" :color="color" />
        <path d="M 135,110 Q 165,90 155,60" fill="none" stroke="#333" stroke-width="14" stroke-linecap="round" style="mix-blend-mode: multiply; opacity: 0.5" />
        <path d="M 135,110 Q 165,90 155,60" fill="none" stroke="currentColor" stroke-width="10" stroke-linecap="round" :color="color" />
        <!-- Head -->
        <circle cx="55" cy="85" r="28" :fill="color" stroke="#333" stroke-width="3" />
        <!-- Ears -->
        <ellipse cx="65" cy="70" rx="12" ry="25" :fill="color" stroke="#333" stroke-width="3" transform="rotate(30 65 70)" />
        <ellipse cx="35" cy="75" rx="10" ry="22" :fill="color" stroke="#333" stroke-width="3" transform="rotate(-20 35 75)" />
        <!-- Snout -->
        <ellipse cx="35" cy="95" rx="16" ry="12" fill="#FFF" stroke="#333" stroke-width="2" />
        <!-- Nose -->
        <circle cx="25" cy="92" r="5" fill="#333" />
        <!-- Eye -->
        <circle cx="45" cy="78" r="4" fill="#333" />
        <!-- Tongue -->
        <path d="M 35,105 Q 40,115 45,105 Z" fill="#F44336" stroke="#333" stroke-width="2" />
      </g>

      <!-- CAT -->
      <g v-else-if="shape === 'cat'">
        <!-- Back legs -->
        <path d="M 125,130 L 125,175 C 125,180 133,180 133,175 L 133,130" :fill="color" opacity="0.8" />
        <path d="M 85,130 L 85,175 C 85,180 93,180 93,175 L 93,130" :fill="color" opacity="0.8" />
        <!-- Body -->
        <ellipse cx="100" cy="120" rx="40" ry="28" :fill="color" stroke="#333" stroke-width="3" />
        <!-- Front legs -->
        <path d="M 115,135 L 115,180 C 115,185 123,185 123,180 L 123,135" :fill="color" stroke="#333" stroke-width="3" />
        <path d="M 75,135 L 75,180 C 75,185 83,185 83,180 L 83,135" :fill="color" stroke="#333" stroke-width="3" />
        <!-- Tail -->
        <path d="M 135,110 Q 170,90 160,50" fill="none" stroke="currentColor" stroke-width="8" stroke-linecap="round" :color="color" />
        <path d="M 135,110 Q 170,90 160,50" fill="none" stroke="#333" stroke-width="12" stroke-linecap="round" style="mix-blend-mode: multiply; opacity: 0.5" />
        <path d="M 135,110 Q 170,90 160,50" fill="none" stroke="currentColor" stroke-width="8" stroke-linecap="round" :color="color" />
        <!-- Head -->
        <circle cx="60" cy="95" r="26" :fill="color" stroke="#333" stroke-width="3" />
        <!-- Ears -->
        <polygon points="45,75 35,45 60,70" :fill="color" stroke="#333" stroke-width="3" stroke-linejoin="round" />
        <polygon points="45,72 40,55 55,70" fill="#FFCDD2" />
        <polygon points="75,75 85,45 60,70" :fill="color" stroke="#333" stroke-width="3" stroke-linejoin="round" />
        <polygon points="75,72 80,55 65,70" fill="#FFCDD2" />
        <!-- Eyes -->
        <circle cx="50" cy="90" r="4" fill="#333" />
        <circle cx="70" cy="90" r="4" fill="#333" />
        <!-- Nose/Mouth -->
        <polygon points="57,98 63,98 60,102" fill="#FF80AB" />
        <path d="M 60,102 Q 55,108 50,105 M 60,102 Q 65,108 70,105" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" />
        <!-- Whiskers -->
        <path d="M 45,100 L 30,95 M 45,105 L 30,105 M 45,110 L 30,115" fill="none" stroke="#333" stroke-width="1.5" stroke-linecap="round" />
        <path d="M 75,100 L 90,95 M 75,105 L 90,105 M 75,110 L 90,115" fill="none" stroke="#333" stroke-width="1.5" stroke-linecap="round" />
      </g>

      <!-- RABBIT -->
      <g v-else-if="shape === 'rabbit'">
        <!-- Back leg -->
        <ellipse cx="120" cy="150" rx="18" ry="12" :fill="color" stroke="#333" stroke-width="3" />
        <ellipse cx="130" cy="158" rx="12" ry="6" fill="#FFF" stroke="#333" stroke-width="2" />
        <!-- Body -->
        <ellipse cx="100" cy="130" rx="35" ry="30" :fill="color" stroke="#333" stroke-width="3" />
        <!-- Tail -->
        <circle cx="135" cy="120" r="12" fill="#FFF" stroke="#333" stroke-width="2" stroke-dasharray="2,2" />
        <!-- Front leg -->
        <ellipse cx="80" cy="155" rx="8" ry="14" :fill="color" stroke="#333" stroke-width="3" />
        <!-- Head -->
        <circle cx="70" cy="105" r="22" :fill="color" stroke="#333" stroke-width="3" />
        <!-- Ears -->
        <ellipse cx="60" cy="60" rx="10" ry="35" :fill="color" stroke="#333" stroke-width="3" transform="rotate(-15 60 60)" />
        <ellipse cx="60" cy="65" rx="5" ry="25" fill="#FFCDD2" transform="rotate(-15 60 65)" />
        <ellipse cx="85" cy="55" rx="10" ry="35" :fill="color" stroke="#333" stroke-width="3" transform="rotate(15 85 55)" />
        <ellipse cx="85" cy="60" rx="5" ry="25" fill="#FFCDD2" transform="rotate(15 85 60)" />
        <!-- Eye -->
        <circle cx="65" cy="100" r="4" fill="#333" />
        <!-- Nose -->
        <circle cx="50" cy="108" r="3" fill="#FF80AB" />
        <!-- Whiskers -->
        <path d="M 45,105 L 30,100 M 45,110 L 30,110 M 45,115 L 30,120" fill="none" stroke="#333" stroke-width="1.5" stroke-linecap="round" />
      </g>

      <!-- MOUSE -->
      <g v-else-if="shape === 'mouse'">
        <!-- Tail -->
        <path d="M 130,140 Q 180,110 180,150 Q 180,190 150,170" fill="none" stroke="#FFCDD2" stroke-width="4" stroke-linecap="round" />
        <!-- Back leg -->
        <ellipse cx="115" cy="148" rx="8" ry="5" :fill="color" stroke="#333" stroke-width="2" />
        <!-- Body & Head -->
        <path d="M 45,140 Q 90,90 135,140 Z" :fill="color" stroke="#333" stroke-width="3" stroke-linejoin="round" />
        <!-- Ear (Back) -->
        <circle cx="95" cy="115" r="14" :fill="color" stroke="#333" stroke-width="3" opacity="0.8" />
        <circle cx="95" cy="115" r="8" fill="#FFCDD2" opacity="0.8" />
        <!-- Ear (Front) -->
        <circle cx="80" cy="115" r="16" :fill="color" stroke="#333" stroke-width="3" />
        <circle cx="80" cy="115" r="9" fill="#FFCDD2" />
        <!-- Eye -->
        <circle cx="65" cy="128" r="3" fill="#333" />
        <!-- Nose -->
        <circle cx="45" cy="138" r="2.5" fill="#333" />
        <!-- Whiskers -->
        <path d="M 40,135 L 25,130 M 40,140 L 25,140 M 40,145 L 25,150" fill="none" stroke="#333" stroke-width="1" stroke-linecap="round" />
        <!-- Front leg -->
        <ellipse cx="80" cy="148" rx="8" ry="5" :fill="color" stroke="#333" stroke-width="2" />
      </g>

      <!-- FOX -->
      <g v-else-if="shape === 'fox'">
        <!-- Back legs -->
        <path d="M 120,130 L 120,170 C 120,175 128,175 128,170 L 128,130" :fill="color" opacity="0.8" />
        <path d="M 85,130 L 85,170 C 85,175 93,175 93,170 L 93,130" :fill="color" opacity="0.8" />
        <!-- Body -->
        <path d="M 65,110 Q 110,95 130,110 C 150,130 140,150 140,150 L 135,170 C 135,175 125,175 125,170 L 125,135 L 95,135 L 95,170 C 95,175 85,175 85,170 L 85,135 Q 65,135 55,120 Z" :fill="color" stroke="#333" stroke-width="3" stroke-linejoin="round" />
        <!-- Tail -->
        <path d="M 135,120 Q 190,90 175,150 C 170,170 145,160 145,140 Z" :fill="color" stroke="#333" stroke-width="3" stroke-linejoin="round" />
        <path d="M 175,150 C 170,170 145,160 145,140 Q 155,140 165,145 Z" fill="#FFF" />
        <!-- Head -->
        <circle cx="60" cy="105" r="22" :fill="color" stroke="#333" stroke-width="3" />
        <path d="M 40,105 Q 60,125 80,105 Z" fill="#FFF" />
        <path d="M 45,112 L 30,125 L 55,122 Z" fill="#FFF" stroke="#333" stroke-width="2" stroke-linejoin="round" />
        <circle cx="30" cy="125" r="3" fill="#333" />
        <!-- Ears -->
        <polygon points="45,90 35,65 60,85" :fill="color" stroke="#333" stroke-width="3" stroke-linejoin="round" />
        <polygon points="48,85 42,70 55,85" fill="#333" />
        <polygon points="75,90 85,65 60,85" :fill="color" stroke="#333" stroke-width="3" stroke-linejoin="round" />
        <polygon points="72,85 78,70 65,85" fill="#333" />
        <!-- Eye -->
        <ellipse cx="50" cy="100" rx="3" ry="4" fill="#333" transform="rotate(-15 50 100)" />
      </g>

      <!-- DEER -->
      <g v-else-if="shape === 'deer'">
        <!-- Back Legs -->
        <rect x="100" y="125" width="6" height="50" :fill="color" opacity="0.8" />
        <rect x="130" y="125" width="6" height="50" :fill="color" opacity="0.8" />
        <!-- Body -->
        <path d="M 80,100 L 140,100 C 145,100 145,125 135,130 L 90,130 C 80,130 75,110 80,100 Z" :fill="color" stroke="#333" stroke-width="3" stroke-linejoin="round" />
        <!-- Spots -->
        <circle cx="100" cy="110" r="3" fill="#FFF" opacity="0.8" />
        <circle cx="115" cy="105" r="4" fill="#FFF" opacity="0.8" />
        <circle cx="130" cy="112" r="3" fill="#FFF" opacity="0.8" />
        <!-- Tail -->
        <path d="M 140,105 Q 150,95 155,110 Z" fill="#FFF" stroke="#333" stroke-width="2" stroke-linejoin="round" />
        <!-- Neck -->
        <path d="M 85,110 Q 80,60 55,45 L 65,35 Q 95,55 110,100 Z" :fill="color" stroke="#333" stroke-width="3" stroke-linejoin="round" />
        <!-- Head -->
        <ellipse cx="55" cy="40" rx="18" ry="12" :fill="color" stroke="#333" stroke-width="3" transform="rotate(-15 55 40)" />
        <!-- Eye -->
        <circle cx="50" cy="35" r="3" fill="#333" />
        <!-- Nose -->
        <circle cx="38" cy="43" r="2.5" fill="#333" />
        <!-- Antlers -->
        <path d="M 65,30 Q 75,0 95,-5 M 75,15 L 85,5 M 82,8 L 95,0" fill="none" stroke="#654321" stroke-width="4" stroke-linecap="round" />
        <path d="M 60,35 Q 65,10 80,5" fill="none" stroke="#654321" stroke-width="3" stroke-linecap="round" opacity="0.7" />
        <!-- Front Legs -->
        <rect x="90" y="130" width="8" height="45" :fill="color" stroke="#333" stroke-width="3" />
        <rect x="120" y="130" width="8" height="45" :fill="color" stroke="#333" stroke-width="3" />
      </g>

      <!-- COW -->
      <g v-else-if="shape === 'cow'">
        <!-- Back Legs -->
        <rect x="85" y="140" width="12" height="35" rx="2" :fill="color" opacity="0.8" />
        <rect x="135" y="140" width="12" height="35" rx="2" :fill="color" opacity="0.8" />
        <!-- Body -->
        <rect x="70" y="85" width="85" height="55" rx="15" :fill="color" stroke="#333" stroke-width="3" />
        <!-- Udder -->
        <path d="M 105,140 Q 115,160 135,140 Z" fill="#FFCDD2" stroke="#333" stroke-width="2" />
        <line x1="115" y1="140" x2="115" y2="148" stroke="#333" stroke-width="2" />
        <line x1="125" y1="140" x2="125" y2="148" stroke="#333" stroke-width="2" />
        <!-- Patches -->
        <path d="M 80,85 Q 90,100 85,115 Q 70,110 70,95 Z M 120,85 Q 135,90 140,110 Q 125,120 115,100 Z M 95,120 Q 110,130 100,140 Q 80,135 85,125 Z" fill="#333" opacity="0.8" />
        <!-- Tail -->
        <path d="M 155,95 Q 170,110 165,140" fill="none" stroke="#333" stroke-width="3" />
        <path d="M 162,135 L 165,145 L 168,135 Z" fill="#333" />
        <!-- Head -->
        <rect x="40" y="65" width="45" height="40" rx="12" :fill="color" stroke="#333" stroke-width="3" />
        <path d="M 40,65 Q 50,80 45,90 Q 65,95 70,75 Z" fill="#333" opacity="0.8" />
        <!-- Snout -->
        <ellipse cx="45" cy="90" rx="18" ry="22" fill="#FFCDD2" stroke="#333" stroke-width="3" />
        <!-- Nostrils -->
        <circle cx="35" cy="85" r="2.5" fill="#333" />
        <circle cx="55" cy="85" r="2.5" fill="#333" />
        <!-- Eyes -->
        <circle cx="50" cy="72" r="3" fill="#FFF" stroke="#333" stroke-width="1.5" />
        <circle cx="50" cy="72" r="1.5" fill="#333" />
        <circle cx="70" cy="72" r="3" fill="#FFF" stroke="#333" stroke-width="1.5" />
        <circle cx="70" cy="72" r="1.5" fill="#333" />
        <!-- Horns -->
        <path d="M 45,65 Q 35,45 25,50" fill="none" stroke="#E0E0E0" stroke-width="4" stroke-linecap="round" />
        <path d="M 75,65 Q 85,45 95,50" fill="none" stroke="#E0E0E0" stroke-width="4" stroke-linecap="round" />
        <!-- Front Legs -->
        <rect x="75" y="140" width="12" height="35" rx="2" :fill="color" stroke="#333" stroke-width="3" />
        <rect x="125" y="140" width="12" height="35" rx="2" :fill="color" stroke="#333" stroke-width="3" />
      </g>

      <!-- PIG -->
      <g v-else-if="shape === 'pig'">
        <!-- Back Legs -->
        <rect x="85" y="145" width="12" height="25" rx="3" :fill="color" opacity="0.8" />
        <rect x="135" y="145" width="12" height="25" rx="3" :fill="color" opacity="0.8" />
        <!-- Body -->
        <ellipse cx="110" cy="115" rx="50" ry="38" :fill="color" stroke="#333" stroke-width="3" />
        <!-- Tail -->
        <path d="M 160,110 Q 180,95 165,85 Q 155,75 175,70" fill="none" stroke="#333" stroke-width="3" stroke-linecap="round" />
        <!-- Head -->
        <circle cx="65" cy="100" r="28" :fill="color" stroke="#333" stroke-width="3" />
        <!-- Snout -->
        <ellipse cx="48" cy="105" rx="12" ry="18" fill="#F8BBD0" stroke="#333" stroke-width="2" />
        <!-- Nostrils -->
        <circle cx="45" cy="98" r="2" fill="#333" />
        <circle cx="45" cy="112" r="2" fill="#333" />
        <!-- Eyes -->
        <circle cx="60" cy="88" r="3" fill="#333" />
        <circle cx="75" cy="88" r="3" fill="#333" />
        <!-- Ears -->
        <polygon points="65,72 75,50 85,78" :fill="color" stroke="#333" stroke-width="2" stroke-linejoin="round" />
        <polygon points="45,78 35,50 55,72" :fill="color" stroke="#333" stroke-width="2" stroke-linejoin="round" />
        <!-- Front Legs -->
        <rect x="75" y="150" width="14" height="25" rx="3" :fill="color" stroke="#333" stroke-width="3" />
        <rect x="125" y="150" width="14" height="25" rx="3" :fill="color" stroke="#333" stroke-width="3" />
      </g>

      <!-- SHEEP -->
      <g v-else-if="shape === 'sheep'">
        <!-- Legs -->
        <rect x="85" y="130" width="8" height="35" fill="#333" />
        <rect x="125" y="130" width="8" height="35" fill="#333" />
        <rect x="75" y="135" width="8" height="35" fill="#333" />
        <rect x="115" y="135" width="8" height="35" fill="#333" />
        <!-- Fluffy Body (Cloud shape) -->
        <path d="M 80,130 C 60,130 45,105 60,85 C 50,60 80,45 100,55 C 120,35 155,50 155,75 C 175,75 180,105 160,120 C 170,140 140,155 125,135 C 105,155 80,150 80,130 Z" :fill="color" stroke="#333" stroke-width="3" stroke-linejoin="round" />
        <!-- Head -->
        <ellipse cx="55" cy="100" rx="16" ry="22" fill="#333" />
        <!-- Fluff on head -->
        <path d="M 40,90 C 40,75 70,75 70,90 Z" :fill="color" stroke="#333" stroke-width="2" />
        <!-- Eye -->
        <circle cx="50" cy="95" r="3" fill="#FFF" />
        <circle cx="49" cy="95" r="1.5" fill="#333" />
        <!-- Ear -->
        <ellipse cx="38" cy="100" rx="10" ry="5" fill="#333" transform="rotate(-20 38 100)" />
      </g>

      <!-- HORSE -->
      <g v-else-if="shape === 'horse'">
        <!-- Back legs -->
        <rect x="118" y="135" width="14" height="48" rx="6" :fill="color" stroke="#333" stroke-width="2" />
        <rect x="88" y="135" width="14" height="48" rx="6" :fill="color" stroke="#333" stroke-width="2" />
        <!-- Hooves back -->
        <rect x="117" y="176" width="16" height="8" rx="3" fill="#333" />
        <rect x="87" y="176" width="16" height="8" rx="3" fill="#333" />
        <!-- Body -->
        <ellipse cx="108" cy="118" rx="50" ry="28" :fill="color" stroke="#333" stroke-width="3" />
        <!-- Front legs -->
        <rect x="66" y="130" width="14" height="50" rx="6" :fill="color" stroke="#333" stroke-width="2" />
        <rect x="46" y="128" width="14" height="50" rx="6" :fill="color" stroke="#333" stroke-width="2" />
        <!-- Hooves front -->
        <rect x="45" y="171" width="16" height="8" rx="3" fill="#333" />
        <rect x="65" y="173" width="16" height="8" rx="3" fill="#333" />
        <!-- Neck -->
        <path d="M68,100 Q58,70 50,52 Q60,46 68,50 Q76,72 82,98 Z" :fill="color" stroke="#333" stroke-width="3" stroke-linejoin="round" />
        <!-- Head -->
        <ellipse cx="44" cy="46" rx="22" ry="14" :fill="color" stroke="#333" stroke-width="3" transform="rotate(-25 44 46)" />
        <!-- Long snout / muzzle -->
        <ellipse cx="26" cy="55" rx="11" ry="7" fill="rgba(255,255,255,0.2)" stroke="#333" stroke-width="2" transform="rotate(-25 26 55)" />
        <!-- Nostril -->
        <ellipse cx="19" cy="59" rx="2.5" ry="2" fill="#555" transform="rotate(-25 19 59)" />
        <!-- Eye -->
        <circle cx="51" cy="40" r="4.5" fill="#111" />
        <circle cx="52.5" cy="38.5" r="1.8" fill="white" />
        <!-- Ear -->
        <path d="M52,32 Q57,22 63,30" :fill="color" stroke="#333" stroke-width="2.5" stroke-linejoin="round" />
        <!-- Flowing mane -->
        <path d="M62,48 Q62,72 68,100" fill="none" stroke="#5D4037" stroke-width="9" stroke-linecap="round" />
        <path d="M62,48 Q58,72 64,100" fill="none" stroke="#795548" stroke-width="5" stroke-linecap="round" />
        <!-- Flowing tail -->
        <path d="M158,105 Q180,108 182,140 Q178,160 170,168" fill="none" stroke="#5D4037" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M158,105 Q176,112 178,144 Q174,162 167,170" fill="none" stroke="#795548" stroke-width="5" stroke-linecap="round" />
      </g>

      <!-- CAMEL -->
      <g v-else-if="shape === 'camel'">
        <!-- Back legs -->
        <path d="M 130,140 L 130,175 C 130,180 138,180 138,175 L 138,140" :fill="color" opacity="0.8" />
        <path d="M 90,140 L 90,175 C 90,180 98,180 98,175 L 98,140" :fill="color" opacity="0.8" />
        <!-- Body with Humps -->
        <path d="M 65,120 Q 80,60 100,100 Q 120,60 135,100 C 150,120 145,140 140,140 L 135,175 C 135,180 125,180 125,175 L 125,140 L 105,140 L 105,175 C 105,180 95,180 95,175 L 95,140 L 85,140 L 80,175 C 80,180 70,180 70,175 L 70,135 Q 55,130 55,110 Z" :fill="color" stroke="#333" stroke-width="3" stroke-linejoin="round" />
        <!-- Neck & Head -->
        <path d="M 75,125 C 75,80 40,80 35,60 C 30,40 50,55 60,65 C 70,75 80,100 85,120 Z" :fill="color" stroke="#333" stroke-width="3" stroke-linejoin="round" />
        <ellipse cx="38" cy="55" rx="16" ry="10" :fill="color" stroke="#333" stroke-width="3" transform="rotate(-15 38 55)" />
        <!-- Eye -->
        <circle cx="42" cy="50" r="2.5" fill="#333" />
        <!-- Snout line -->
        <path d="M 23,55 Q 30,60 35,58" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" />
        <!-- Ear -->
        <path d="M 50,45 Q 55,40 58,48" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" />
        <!-- Tail -->
        <path d="M 142,110 Q 155,125 150,150" fill="none" stroke="#333" stroke-width="3" stroke-linecap="round" />
        <circle cx="150" cy="150" r="3" fill="#333" />
      </g>

      <!-- KANGAROO -->
      <g v-else-if="shape === 'kangaroo'">
        <!-- Big thick tail (drawn first, behind body) -->
        <path d="M 105,150 Q 145,160 160,175 Q 140,182 118,168 Q 106,158 100,148 Z" :fill="color" stroke="#333" stroke-width="3" stroke-linejoin="round" />
        <!-- Big back leg (far) -->
        <path d="M 110,138 Q 128,150 138,165 L 118,168 Q 108,152 100,138 Z" :fill="color" opacity="0.75" stroke="#333" stroke-width="2" stroke-linejoin="round" />
        <!-- Body — upright, pear-shaped -->
        <path d="M75,70 Q65,100 68,130 Q72,158 92,162 Q112,166 120,148 Q128,132 118,105 Q108,78 90,68 Z" :fill="color" stroke="#333" stroke-width="3" stroke-linejoin="round" />
        <!-- Big back leg (near) -->
        <path d="M82,135 Q100,148 108,165 L 88,168 Q76,150 72,132 Z" :fill="color" stroke="#333" stroke-width="3" stroke-linejoin="round" />
        <!-- Pouch -->
        <path d="M 80,128 Q 88,148 100,140 Q 96,124 80,128 Z" fill="rgba(0,0,0,0.15)" stroke="#333" stroke-width="1.5" stroke-linejoin="round" />
        <!-- Short front arms -->
        <path d="M 84,100 Q 68,108 62,120" fill="none" stroke="#333" stroke-width="7" stroke-linecap="round" :style="{stroke: color}" />
        <path d="M 84,100 Q 68,108 62,120" fill="none" stroke="#333" stroke-width="3" stroke-linecap="round" opacity="0.5" />
        <!-- Neck -->
        <path d="M80,72 Q74,55 70,45 Q80,40 88,44 Q88,58 90,70 Z" :fill="color" stroke="#333" stroke-width="2.5" stroke-linejoin="round" />
        <!-- Head — small, elongated -->
        <ellipse cx="76" cy="38" rx="16" ry="12" :fill="color" stroke="#333" stroke-width="3" transform="rotate(-15 76 38)" />
        <!-- Snout -->
        <ellipse cx="62" cy="44" rx="8" ry="5.5" fill="rgba(255,255,255,0.2)" stroke="#333" stroke-width="2" transform="rotate(-15 62 44)" />
        <!-- Nostril -->
        <ellipse cx="56" cy="46" rx="2" ry="1.5" fill="#555" transform="rotate(-15 56 46)" />
        <!-- Large upright ear (near) -->
        <ellipse cx="84" cy="22" rx="6" ry="14" :fill="color" stroke="#333" stroke-width="2.5" transform="rotate(10 84 22)" />
        <!-- Large upright ear (far) -->
        <ellipse cx="72" cy="23" rx="5" ry="12" :fill="color" stroke="#333" stroke-width="2" transform="rotate(-5 72 23)" />
        <!-- Eye -->
        <circle cx="72" cy="35" r="4" fill="#111" />
        <circle cx="73.5" cy="33.5" r="1.5" fill="white" />
      </g>

      <!-- PENGUIN -->
      <g v-else-if="shape === 'penguin'">
        <!-- Feet -->
        <path d="M 85,160 L 75,170 L 95,170 Z" fill="#FF9800" stroke="#333" stroke-width="3" stroke-linejoin="round" />
        <path d="M 115,160 L 105,170 L 125,170 Z" fill="#FF9800" stroke="#333" stroke-width="3" stroke-linejoin="round" />
        <!-- Body (Black part) -->
        <ellipse cx="100" cy="110" rx="40" ry="55" fill="#222" stroke="#333" stroke-width="3" />
        <!-- Belly (White part) -->
        <path d="M 100,60 C 130,60 135,110 135,140 C 135,160 120,162 100,162 C 80,162 65,160 65,140 C 65,110 70,60 100,60 Z" fill="#FFF" />
        <!-- Head -->
        <circle cx="100" cy="65" r="28" fill="#222" stroke="#333" stroke-width="3" />
        <!-- Face pattern -->
        <path d="M 100,90 C 115,90 125,75 125,60 C 125,45 110,40 100,50 C 90,40 75,45 75,60 C 75,75 85,90 100,90 Z" fill="#FFF" />
        <!-- Eyes -->
        <circle cx="88" cy="65" r="4" fill="#333" />
        <circle cx="112" cy="65" r="4" fill="#333" />
        <!-- Beak -->
        <polygon points="95,72 105,72 100,85" fill="#FF9800" stroke="#333" stroke-width="2" stroke-linejoin="round" />
        <!-- Wings (Flippers) -->
        <path d="M 65,100 Q 30,130 50,155 Q 60,130 65,110 Z" :fill="color" stroke="#333" stroke-width="3" stroke-linejoin="round" />
        <path d="M 135,100 Q 170,130 150,155 Q 140,130 135,110 Z" :fill="color" stroke="#333" stroke-width="3" stroke-linejoin="round" />
      </g>

      <!-- DUCK -->
      <g v-else-if="shape === 'duck'">
        <!-- Legs -->
        <path d="M 90,140 L 90,165 L 80,165" fill="none" stroke="#FF9800" stroke-width="5" stroke-linejoin="round" />
        <path d="M 110,135 L 110,165 L 100,165" fill="none" stroke="#FF9800" stroke-width="5" stroke-linejoin="round" />
        <!-- Body -->
        <path d="M 60,120 Q 100,160 145,120 Q 125,90 85,100 Z" :fill="color" stroke="#333" stroke-width="3" stroke-linejoin="round" />
        <!-- Wing -->
        <path d="M 85,110 Q 115,110 125,130 Q 105,130 85,120 Z" fill="#FFF" opacity="0.6" stroke="#333" stroke-width="2" stroke-linejoin="round" />
        <!-- Tail Feathers -->
        <path d="M 140,118 L 155,110 L 145,125 Z" :fill="color" stroke="#333" stroke-width="2" stroke-linejoin="round" />
        <!-- Head -->
        <circle cx="65" cy="80" r="22" :fill="color" stroke="#333" stroke-width="3" />
        <!-- Eye -->
        <circle cx="60" cy="75" r="4" fill="#333" />
        <!-- Beak -->
        <path d="M 45,85 Q 20,85 30,75 Q 45,75 50,80 Z" fill="#FF9800" stroke="#333" stroke-width="3" stroke-linejoin="round" />
      </g>

      <!-- OWL -->
      <g v-else-if="shape === 'owl'">
        <!-- Feet -->
        <path d="M 85,155 L 85,165 M 80,165 L 90,165" fill="none" stroke="#FF9800" stroke-width="4" stroke-linecap="round" />
        <path d="M 115,155 L 115,165 M 110,165 L 120,165" fill="none" stroke="#FF9800" stroke-width="4" stroke-linecap="round" />
        <!-- Body -->
        <ellipse cx="100" cy="115" rx="40" ry="45" :fill="color" stroke="#333" stroke-width="3" />
        <!-- Belly Pattern -->
        <ellipse cx="100" cy="120" rx="28" ry="32" fill="#F5F5F5" />
        <path d="M 90,105 Q 95,115 100,105 Q 105,115 110,105 M 85,120 Q 95,130 105,120 Q 110,130 115,120 M 90,135 Q 95,145 100,135 Q 105,145 110,135" fill="none" stroke="#CCC" stroke-width="2" stroke-linecap="round" />
        <!-- Wings -->
        <path d="M 60,95 Q 40,125 55,155 C 65,155 70,135 70,115 Z" :fill="color" stroke="#333" stroke-width="3" stroke-linejoin="round" />
        <path d="M 140,95 Q 160,125 145,155 C 135,155 130,135 130,115 Z" :fill="color" stroke="#333" stroke-width="3" stroke-linejoin="round" />
        <!-- Head -->
        <circle cx="100" cy="70" r="32" :fill="color" stroke="#333" stroke-width="3" />
        <!-- Ear Tufts -->
        <polygon points="75,45 85,25 95,40" :fill="color" stroke="#333" stroke-width="3" stroke-linejoin="round" />
        <polygon points="125,45 115,25 105,40" :fill="color" stroke="#333" stroke-width="3" stroke-linejoin="round" />
        <!-- Big Eyes Base -->
        <circle cx="82" cy="70" r="16" fill="#FFF" stroke="#333" stroke-width="3" />
        <circle cx="118" cy="70" r="16" fill="#FFF" stroke="#333" stroke-width="3" />
        <!-- Irises -->
        <circle cx="82" cy="70" r="10" fill="#FFC107" />
        <circle cx="118" cy="70" r="10" fill="#FFC107" />
        <!-- Pupils -->
        <circle cx="82" cy="70" r="5" fill="#333" />
        <circle cx="118" cy="70" r="5" fill="#333" />
        <circle cx="80" cy="68" r="1.5" fill="#FFF" />
        <circle cx="116" cy="68" r="1.5" fill="#FFF" />
        <!-- Beak -->
        <polygon points="95,82 105,82 100,95" fill="#FF9800" stroke="#333" stroke-width="2" stroke-linejoin="round" />
      </g>
      <!-- DINOSAUR -->
      <g v-else-if="shape === 'dinosaur'">
        <!-- Back leg -->
        <path d="M 120,130 L 120,170 C 120,175 130,175 130,170 L 130,130" :fill="color" opacity="0.8" />
        <!-- Front leg -->
        <path d="M 80,140 L 80,175 C 80,180 95,180 95,175 L 95,140" :fill="color" opacity="0.8" />
        <!-- Tail & Body & Neck -->
        <path d="M 170,140 Q 150,110 130,100 C 110,90 90,90 70,100 C 50,110 40,70 40,40 L 50,30 C 70,30 80,50 80,70 C 90,80 110,80 130,90 Q 160,110 180,160 Z" :fill="color" stroke="#333" stroke-width="3" stroke-linejoin="round" />
        <!-- Head -->
        <ellipse cx="40" cy="35" rx="15" ry="10" :fill="color" stroke="#333" stroke-width="3" />
        <!-- Eye -->
        <circle cx="35" cy="32" r="2.5" fill="#333" />
        <!-- Spikes on back -->
        <path d="M 125,95 L 135,75 L 145,98 M 145,108 L 155,90 L 165,115 M 105,95 L 115,75 L 125,95 M 85,98 L 95,78 L 105,95 M 70,95 L 75,75 L 85,95" fill="#facc15" stroke="#333" stroke-width="2" stroke-linejoin="round" />
        <!-- Front leg (foreground) -->
        <path d="M 90,140 L 90,175 C 90,180 105,180 105,175 L 105,140" :fill="color" stroke="#333" stroke-width="3" stroke-linejoin="round" />
        <!-- Back leg (foreground) -->
        <path d="M 130,130 L 130,170 C 130,175 145,175 145,170 L 145,130" :fill="color" stroke="#333" stroke-width="3" stroke-linejoin="round" />
      </g>

      <!-- LEOPARD -->
      <g v-else-if="shape === 'leopard'">
        <!-- Back legs -->
        <path d="M 130,130 L 130,175 C 130,180 140,180 140,175 L 140,130" :fill="color" opacity="0.8" />
        <path d="M 90,130 L 90,175 C 90,180 100,180 100,175 L 100,130" :fill="color" opacity="0.8" />
        <!-- Body & Neck -->
        <path d="M 60,80 Q 110,65 140,80 C 160,90 155,120 150,130 L 145,175 C 145,180 135,180 135,175 L 130,130 L 100,130 L 95,175 C 95,180 85,180 85,175 L 85,120 C 70,120 60,110 50,95 Q 30,70 30,85 C 30,95 45,95 50,105 L 60,120 C 50,130 40,120 30,110 Q 15,90 20,70 C 25,50 50,60 60,80 Z" :fill="color" stroke="#333" stroke-width="3" stroke-linejoin="round" />
        <!-- Rosettes (Spots) -->
        <path d="M 75,90 A 4,4 0 1,0 83,90 A 4,4 0 1,0 75,90 Z M 95,85 A 5,5 0 1,0 105,85 A 5,5 0 1,0 95,85 Z M 115,90 A 6,6 0 1,0 127,90 A 6,6 0 1,0 115,90 Z M 135,95 A 5,5 0 1,0 145,95 A 5,5 0 1,0 135,95 Z M 85,110 A 4,4 0 1,0 93,110 A 4,4 0 1,0 85,110 Z M 105,115 A 5,5 0 1,0 115,115 A 5,5 0 1,0 105,115 Z M 125,110 A 4,4 0 1,0 133,110 A 4,4 0 1,0 125,110 Z" fill="none" stroke="#222" stroke-width="3" stroke-linecap="round" />
        <path d="M 78,90 L 79,90 M 100,85 L 101,85 M 121,90 L 122,90 M 140,95 L 141,95 M 89,110 L 90,110 M 110,115 L 111,115 M 129,110 L 130,110" stroke="#8B4513" stroke-width="4" stroke-linecap="round" />
        <!-- Snout -->
        <ellipse cx="25" cy="80" rx="10" ry="12" :fill="color" stroke="#333" stroke-width="3" transform="rotate(-30 25 80)" />
        <circle cx="18" cy="85" r="3" fill="#222" />
        <!-- Eye -->
        <circle cx="40" cy="70" r="3" fill="#333" />
        <!-- Whiskers -->
        <path d="M 20,80 L 5,75 M 22,85 L 5,85 M 25,90 L 10,95" fill="none" stroke="#333" stroke-width="1.5" />
        <!-- Tail -->
        <path d="M 150,100 Q 170,110 165,150" fill="none" stroke="#333" stroke-width="6" stroke-linecap="round" :color="color" />
        <!-- Tail Spots -->
        <path d="M 155,115 L 160,115 M 160,130 L 163,130 M 163,145 L 165,145" fill="none" stroke="#222" stroke-width="4" stroke-linecap="round" />
        <!-- Ears -->
        <path d="M 40,55 Q 50,45 60,55" :fill="color" stroke="#333" stroke-width="3" stroke-linecap="round" />
      </g>

    </g>
  </svg>
</template>

<style scoped>
.animal-asset {
  width: 100%;
  height: 100%;
  display: block;
}

.animal-group {
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
</style>
