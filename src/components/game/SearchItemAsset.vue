<script setup lang="ts">
import { ref, onUnmounted } from 'vue';

const props = defineProps<{
  itemType: 'apple' | 'strawberry' | 'star' | 'car' | 'flower' | 'balloon';
  color: string;
  hasDetail: boolean;
  isCollected?: boolean;
}>();

const isShaking = ref(false);
let timeoutId: ReturnType<typeof setTimeout> | null = null;

const triggerShake = () => {
  if (isShaking.value) return;
  isShaking.value = true;
  if (timeoutId) clearTimeout(timeoutId);
  timeoutId = setTimeout(() => {
    isShaking.value = false;
    timeoutId = null;
  }, 400); // matches animation duration
};

onUnmounted(() => {
  if (timeoutId) clearTimeout(timeoutId);
});

defineExpose({ triggerShake });
</script>

<template>
  <div 
    class="search-item-asset" 
    :class="{ 'collected': isCollected, 'shake': isShaking }"
  >
    <svg viewBox="0 0 100 100" class="asset-svg">
      <template v-if="itemType === 'apple'">
        <!-- stem -->
        <rect x="47" y="10" width="6" height="15" fill="#8B4513" />
        <!-- leaf detail -->
        <path v-if="hasDetail" d="M 50 15 Q 70 5 65 25 Q 45 25 50 15" fill="#4CAF50" />
        <!-- body -->
        <circle cx="50" cy="55" r="35" :fill="color" />
      </template>

      <template v-else-if="itemType === 'strawberry'">
        <!-- cap -->
        <path d="M 30 25 L 50 15 L 70 25 L 60 35 L 40 35 Z" fill="#4CAF50" />
        <!-- leaf detail -->
        <path v-if="hasDetail" d="M 50 15 Q 70 5 65 25 Q 45 25 50 15" fill="#2E7D32" />
        <!-- body -->
        <path d="M 25 30 Q 50 100 75 30 Z" :fill="color" />
        <!-- seeds detail -->
        <template v-if="hasDetail">
          <circle cx="40" cy="45" r="2" fill="#FFE082" />
          <circle cx="60" cy="45" r="2" fill="#FFE082" />
          <circle cx="50" cy="60" r="2" fill="#FFE082" />
          <circle cx="35" cy="60" r="2" fill="#FFE082" />
          <circle cx="65" cy="60" r="2" fill="#FFE082" />
          <circle cx="50" cy="75" r="2" fill="#FFE082" />
        </template>
      </template>

      <template v-else-if="itemType === 'star'">
        <!-- body -->
        <polygon points="50,10 61,40 95,40 68,60 78,90 50,70 22,90 32,60 5,40 39,40" :fill="color" stroke="#f39c12" stroke-width="2" />
        <!-- detail (lines inside) -->
        <template v-if="hasDetail">
          <circle cx="40" cy="50" r="4" fill="#333" />
          <circle cx="60" cy="50" r="4" fill="#333" />
          <path d="M 45 65 Q 50 75 55 65" fill="none" stroke="#333" stroke-width="3" stroke-linecap="round" />
        </template>
      </template>

      <template v-else-if="itemType === 'car'">
        <!-- wheels -->
        <circle cx="25" cy="70" r="12" fill="#333" />
        <circle cx="75" cy="70" r="12" fill="#333" />
        <!-- inner wheel hubs -->
        <circle cx="25" cy="70" r="4" fill="#ccc" />
        <circle cx="75" cy="70" r="4" fill="#ccc" />
        <!-- main body -->
        <path d="M 10 65 L 10 45 L 30 30 L 70 30 L 90 45 L 90 65 Z" :fill="color" />
        <!-- windows -->
        <path d="M 32 32 L 48 32 L 48 45 L 20 45 Z" fill="rgba(255,255,255,0.7)" />
        <path d="M 52 32 L 68 32 L 80 45 L 52 45 Z" fill="rgba(255,255,255,0.7)" />
        <!-- stripe detail -->
        <rect v-if="hasDetail" x="10" y="52" width="80" height="6" fill="rgba(255,255,255,0.6)" />
      </template>

      <template v-else-if="itemType === 'flower'">
        <!-- petals -->
        <circle cx="50" cy="25" r="20" :fill="color" />
        <circle cx="25" cy="50" r="20" :fill="color" />
        <circle cx="75" cy="50" r="20" :fill="color" />
        <circle cx="50" cy="75" r="20" :fill="color" />
        <!-- center -->
        <circle cx="50" cy="50" r="15" fill="#f1c40f" />
        <!-- detail -->
        <circle v-if="hasDetail" cx="50" cy="50" r="8" fill="#e67e22" />
      </template>

      <template v-else-if="itemType === 'balloon'">
        <!-- string -->
        <path d="M 50 80 L 50 95" stroke="#333" stroke-width="2" />
        <!-- knot -->
        <polygon points="45,80 55,80 50,75" fill="#333" />
        <!-- body -->
        <ellipse cx="50" cy="45" rx="30" ry="35" :fill="color" />
        <!-- detail reflection -->
        <path v-if="hasDetail" d="M 35 30 Q 40 15 50 15" fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="4" stroke-linecap="round" />
      </template>
    </svg>

    <div v-if="isCollected" class="check-overlay">
      <svg viewBox="0 0 24 24" fill="none" stroke="#4CAF50" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </div>
  </div>
</template>

<style scoped>
.search-item-asset {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.1s ease;
  user-select: none;
  cursor: pointer;
}

.search-item-asset:active {
  transform: scale(0.95);
}

.asset-svg {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 4px 6px rgba(0,0,0,0.15));
}

.check-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60%;
  height: 60%;
  animation: pop-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
  z-index: 10;
}

.collected {
  opacity: 0.25;
  pointer-events: none;
  animation: collect-anim 0.4s ease-out forwards;
}

@keyframes collect-anim {
  0% { transform: scale(1); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); }
}

@keyframes pop-in {
  0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
  100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
}

.shake {
  animation: shake-anim 0.4s cubic-bezier(.36,.07,.19,.97) both;
}

@keyframes shake-anim {
  10%, 90% { transform: translate3d(-3px, 0, 0); }
  20%, 80% { transform: translate3d(6px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-10px, 0, 0); }
  40%, 60% { transform: translate3d(10px, 0, 0); }
}
</style>
