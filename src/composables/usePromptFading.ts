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

  let interactionDebounce: ReturnType<typeof setTimeout> | null = null;

  const debouncedRegisterInteraction = () => {
    // Debounce: only reset the ABA timer at most once per 300ms to prevent
    // rapid drag events from permanently suppressing the prompt escalation.
    if (interactionDebounce) return;
    interactionDebounce = setTimeout(() => {
      interactionDebounce = null;
    }, 300);
    resetTimer();
  };

  onMounted(() => {
    resetTimer();
    // Use pointerdown instead of touchstart + mousedown to avoid double-firing
    // on hybrid devices where both events fire for the same tap.
    window.addEventListener('pointerdown', debouncedRegisterInteraction);
  });

  onUnmounted(() => {
    if (idleTimer) clearTimeout(idleTimer);
    if (interactionDebounce) clearTimeout(interactionDebounce);
    window.removeEventListener('pointerdown', debouncedRegisterInteraction);
  });

  return {
    currentLevel,
    registerError,
    resetAll
  };
}
