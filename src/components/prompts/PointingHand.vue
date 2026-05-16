<script setup lang="ts">
// Simple SVG Pointing Hand for ABA Full Prompt
</script>

<template>
  <div class="pointing-hand">
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
      <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
      <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
      <path d="M15 21H8a2.5 2.5 0 0 1-2.4-1.7L4.2 13a1 1 0 0 1 .4-1.2 1 1 0 0 1 1.4.3L8 15V8a2 2 0 0 1 2-2v0a2 2 0 0 1 2 2v8" />
    </svg>
  </div>
</template>

<style scoped>
.pointing-hand {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-10%, -10%); /* Offset slightly so it looks like it's pointing AT the center */
  color: var(--color-blue);
  z-index: 5000;
  pointer-events: none; /* Ignore clicks so user can click through it */
  animation: bounce-point 1s infinite alternate cubic-bezier(0.4, 0, 0.2, 1);
  filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));
}

@keyframes bounce-point {
  0% {
    transform: translate(-10%, -10%) scale(1);
  }
  100% {
    transform: translate(-20%, -20%) scale(0.9);
  }
}
</style>
