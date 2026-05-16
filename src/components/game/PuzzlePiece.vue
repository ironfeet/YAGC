<script setup lang="ts">
import { computed, ref } from 'vue';
import { useTouchDrag } from '../../composables/useTouchDrag';
import AssetLibrary from './AssetLibrary.vue';
import type { VocabularyNoun } from '../../types';

const props = defineProps<{
  id: string;
  color?: string;
  shape?: string;
  noun?: VocabularyNoun; // Used for SVG Asset Library
  size?: 'small' | 'large' | 'medium';
  isTarget?: boolean;
  promptLevel?: 'none' | 'partial' | 'full';
  dropZoneSelector?: string;
  rotation?: number;
  isSilhouette?: boolean;
  transparent?: boolean;
  validateDrop?: (target: HTMLElement) => boolean;
}>();

const emit = defineEmits<{
  (e: 'success', id: string, target?: HTMLElement): void;
  (e: 'error', id: string, target?: HTMLElement): void;
}>();

const pieceRef = ref<HTMLElement | null>(null);

const { style: dragStyle, handlers, isDragging } = useTouchDrag(pieceRef, {
  id: props.id,
  dropZoneSelector: props.dropZoneSelector || '.target-outline', // default
  validateDrop: (targetElement: HTMLElement) => {
    if (props.validateDrop) {
      return props.validateDrop(targetElement);
    }
    return true;
  },
  onSuccessDrop: (targetElement) => {
    emit('success', props.id, targetElement);
  },
  onErrorDrop: (targetElement?: HTMLElement) => {
    emit('error', props.id, targetElement);
  }
});

const pieceBaseStyle = computed(() => {
  if (props.noun || props.transparent) {
    // If it's an SVG noun or explicit transparent, no CSS shapes/bg
    return { backgroundColor: 'transparent' };
  }

  let clipPath = 'none';
  let borderRadius = 'var(--border-radius-sm)';
  
  if (props.shape === 'circle') {
    clipPath = 'circle(50% at 50% 50%)';
    borderRadius = '0';
  } else if (props.shape === 'triangle') {
    clipPath = 'polygon(50% 0%, 0% 100%, 100% 100%)';
    borderRadius = '0';
  } else if (props.shape === 'diamond') {
    clipPath = 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)';
    borderRadius = '0';
  }
  
  return {
    backgroundColor: props.color || 'var(--color-neutral)',
    borderRadius,
    clipPath,
    WebkitClipPath: clipPath,
  };
});
</script>

<template>
  <div class="puzzle-piece-container" :class="{ 'has-noun': !!noun, 'is-dragging': isDragging }">
    <div 
      ref="pieceRef"
      class="puzzle-piece" 
      :class="{
        'prompt-full': promptLevel === 'full' && isTarget,
        'prompt-partial': promptLevel === 'partial' && isTarget
      }"
      :style="[pieceBaseStyle, dragStyle]"
      v-on="handlers"
    >
      <div :style="{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', transform: rotation ? `rotate(${rotation}deg)` : 'none', transition: rotation ? 'transform 0.3s' : 'none' }">
        <AssetLibrary v-if="noun" :name="noun" :color="color" :size="size" :isSilhouette="isSilhouette" />
        <slot v-else></slot>
      </div>
    </div>
  </div>
</template>

<style scoped>
.puzzle-piece-container {
  width: 120px;
  height: 120px;
  position: relative;
  z-index: 1;
}

.puzzle-piece-container.is-dragging {
  z-index: 9999;
}

.puzzle-piece-container.has-noun {
  width: auto;
  height: auto;
}

.puzzle-piece {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: grab;
  /* Touch action none prevents browser scrolling entirely on this element */
  touch-action: none; 
  will-change: transform;
}

.puzzle-piece:active {
  cursor: grabbing;
}

/* Prompt Animations */
@keyframes flash-full {
  0%, 100% { box-shadow: 0 0 0 0 transparent; }
  50% { box-shadow: 0 0 20px 10px var(--color-target, #FFD700); }
}

@keyframes pulse-partial {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.prompt-full {
  animation: flash-full 1.5s infinite;
  z-index: 50;
}

.prompt-partial {
  animation: pulse-partial 2s infinite;
}
</style>
