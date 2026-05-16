import { onUnmounted } from 'vue';

export function useSafeTimeout() {
  const timeoutIds = new Set<ReturnType<typeof setTimeout>>();

  const safeSetTimeout = (callback: () => void, ms?: number) => {
    const id = setTimeout(() => {
      timeoutIds.delete(id);
      callback();
    }, ms);
    timeoutIds.add(id);
    return id;
  };

  const clearAllTimeouts = () => {
    timeoutIds.forEach(clearTimeout);
    timeoutIds.clear();
  };

  onUnmounted(clearAllTimeouts);

  return { safeSetTimeout, clearAllTimeouts };
}
