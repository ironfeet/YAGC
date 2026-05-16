import { ref, onMounted, onUnmounted } from 'vue';

export type PromptLevel = 'none' | 'partial' | 'full';

export function usePromptFading(initialConfiguredLevel: PromptLevel = 'none', idleTimeoutMs = 7000, errorThreshold = 2) {
  let configuredLevel = initialConfiguredLevel;
  // Always start at 'none' to give the child an independent opportunity (Time Delay Prompting)
  const currentLevel = ref<PromptLevel>('none');
  const errorCount = ref(0);
  let idleTimer: ReturnType<typeof setTimeout> | null = null;

  const resetTimer = () => {
    if (idleTimer) clearTimeout(idleTimer);
    
    idleTimer = setTimeout(() => {
      escalatePrompt();
    }, idleTimeoutMs);
  };

  const escalatePrompt = () => {
    if (currentLevel.value === 'none') {
      if (configuredLevel === 'full') {
        currentLevel.value = 'full';
      } else {
        currentLevel.value = 'partial'; // Glow/Pulse Target
        resetTimer(); // Wait another cycle before showing full
      }
    } else if (currentLevel.value === 'partial') {
      currentLevel.value = 'full'; // Pointing Hand & Piece Highlight
    }
  };

  const registerInteraction = () => {
    resetTimer();
  };

  const registerError = () => {
    errorCount.value++;
    if (errorCount.value >= errorThreshold) {
      escalatePrompt();
      errorCount.value = 0; // Reset after escalating
    } else {
      resetTimer();
    }
  };

  const resetAll = (newConfiguredLevel?: PromptLevel) => {
    if (newConfiguredLevel) {
      configuredLevel = newConfiguredLevel;
    }
    currentLevel.value = 'none'; // Always reset to none for the new trial
    errorCount.value = 0;
    resetTimer();
  };

  onMounted(() => {
    resetTimer();
    window.addEventListener('touchstart', registerInteraction);
    window.addEventListener('mousedown', registerInteraction);
  });

  onUnmounted(() => {
    if (idleTimer) clearTimeout(idleTimer);
    window.removeEventListener('touchstart', registerInteraction);
    window.removeEventListener('mousedown', registerInteraction);
  });

  return {
    currentLevel,
    registerError,
    resetAll
  };
}
