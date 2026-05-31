<script setup lang="ts">
const props = defineProps<{
  number: number;
  color: string;
  isSlot?: boolean;
}>();
</script>

<template>
  <div 
    class="number-block"
    :class="{ 'is-slot': isSlot }"
    :style="{
      '--block-color': color
    }"
  >
    <div class="block-inner">
      {{ number }}
    </div>
  </div>
</template>

<style scoped>
.number-block {
  width: 100%;
  height: 100%;
  position: relative;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  touch-action: none;
  /* 3D wooden block style */
  background-color: var(--block-color);
  box-shadow: 
    inset 0 4px 0 rgba(255, 255, 255, 0.4),
    inset 0 -8px 0 rgba(0, 0, 0, 0.2),
    0 4px 8px rgba(0, 0, 0, 0.3);
  border: 2px solid rgba(0, 0, 0, 0.1);
  transition: transform 0.1s;
}

.block-inner {
  font-family: 'Inter', sans-serif;
  font-size: 5rem; /* Will be scaled by parent container */
  font-weight: 900;
  color: white;
  text-shadow: 0 4px 0 rgba(0, 0, 0, 0.2);
  /* Push slightly up to center visually above the bottom 3D edge */
  transform: translateY(-2px);
}

/* When acting as the drop target slot on the board */
.number-block.is-slot {
  background-color: rgba(0, 0, 0, 0.2);
  box-shadow: 
    inset 0 6px 12px rgba(0, 0, 0, 0.4),
    0 2px 0 rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(0, 0, 0, 0.3);
}

.number-block.is-slot .block-inner {
  color: rgba(0, 0, 0, 0.3);
  text-shadow: 0 2px 0 rgba(255, 255, 255, 0.1);
}
</style>
