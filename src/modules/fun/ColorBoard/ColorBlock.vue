<script setup lang="ts">
const props = defineProps<{
  color: string;
  isSlot?: boolean;
}>();
</script>

<template>
  <div 
    class="color-block"
    :class="{ 'is-slot': isSlot }"
    :style="{
      '--block-color': color
    }"
  >
    <div class="block-inner"></div>
  </div>
</template>

<style scoped>
.color-block {
  width: 100%;
  height: 100%;
  position: relative;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  touch-action: none;
  /* Shiny peg/button style */
  background-color: var(--block-color);
  box-shadow: 
    inset 0 8px 16px rgba(255, 255, 255, 0.4),
    inset 0 -12px 24px rgba(0, 0, 0, 0.2),
    0 6px 12px rgba(0, 0, 0, 0.3);
  border: 2px solid rgba(0, 0, 0, 0.1);
  transition: transform 0.1s;
}

/* When acting as the drop target slot on the board */
.color-block.is-slot {
  background-color: var(--block-color);
  box-shadow: 
    inset 0 12px 24px rgba(0, 0, 0, 0.8),
    0 2px 0 rgba(255, 255, 255, 0.1);
  border: 3px solid rgba(0, 0, 0, 0.4);
  filter: brightness(0.7);
}
</style>
