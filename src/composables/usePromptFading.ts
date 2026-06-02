import { ref, onMounted, onUnmounted } from 'vue';

export type PromptLevel = 'none' | 'partial' | 'full';

// Centralized pointerdown listener to prevent duplicate window events
const activeInteractionSubscribers = new Set<() => void>();
let isGlobalListenerAttached = false;

const handleGlobalPointerDown = () => {
  activeInteractionSubscribers.forEach(fn => fn());
};

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
    
    // Attach the debounced interaction handler to the centralized subscriber set
    activeInteractionSubscribers.add(debouncedRegisterInteraction);
    
    // Only attach the physical DOM listener once globally
    if (!isGlobalListenerAttached) {
      window.addEventListener('pointerdown', handleGlobalPointerDown);
      isGlobalListenerAttached = true;
    }
  });

  onUnmounted(() => {
    if (idleTimer) clearTimeout(idleTimer);
    if (interactionDebounce) clearTimeout(interactionDebounce);
    
    // Remove this instance's subscriber
    activeInteractionSubscribers.delete(debouncedRegisterInteraction);
    
    // If no more instances are active, clean up the global DOM listener
    if (activeInteractionSubscribers.size === 0 && isGlobalListenerAttached) {
      window.removeEventListener('pointerdown', handleGlobalPointerDown);
      isGlobalListenerAttached = false;
    }
  });

  return {
    currentLevel,
    registerError,
    resetAll
  };
}
