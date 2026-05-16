<script setup lang="ts">
// Simple static Jar SVG for drop zone
</script>

<template>
  <svg viewBox="0 0 200 250" class="jar-asset" xmlns="http://www.w3.org/2000/svg">
    <!-- Back of the Jar (Inside) -->
    <path d="M 40,60 L 40,210 C 40,240 160,240 160,210 L 160,60" fill="rgba(173, 216, 230, 0.1)" />
    
    <!-- Lid/Opening Top Rim -->
    <ellipse cx="100" cy="60" rx="60" ry="15" fill="none" stroke="#90a4ae" stroke-width="6" />
    <ellipse cx="100" cy="60" rx="60" ry="15" fill="rgba(255,255,255,0.2)" />
    
    <!-- Glass Highlights (Back) -->
    <path d="M 50,80 L 50,190" stroke="rgba(255,255,255,0.3)" stroke-width="6" stroke-linecap="round" />
    
    <slot></slot> <!-- Allows placing captured bugs inside the jar -->
    
    <!-- Front Glass Overlay -->
    <path d="M 40,60 L 40,210 C 40,240 160,240 160,210 L 160,60 Z" fill="rgba(255,255,255,0.2)" stroke="#90a4ae" stroke-width="6" />
    
    <!-- Glass Highlights (Front) -->
    <path d="M 150,80 L 150,190" stroke="rgba(255,255,255,0.6)" stroke-width="8" stroke-linecap="round" />
    <path d="M 140,85 L 140,185" stroke="rgba(255,255,255,0.4)" stroke-width="4" stroke-linecap="round" />
    <path d="M 60,225 Q 100,235 140,225" fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="6" stroke-linecap="round" />
  </svg>
</template>

<style scoped>
.jar-asset {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
