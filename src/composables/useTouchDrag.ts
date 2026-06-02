import { ref, computed, onUnmounted, type Ref } from 'vue';

export interface DragOptions {
  dropZoneSelector: string;     // e.g., '.target-outline'
  dropRadiusThreshold?: number; // Distance in px, defaults to 75
  onSuccessDrop?: (targetElement: HTMLElement) => void;
  onErrorDrop?: (targetElement?: HTMLElement) => void;
  validateDrop?: (targetElement: HTMLElement) => boolean; // Optional validation callback
  disabled?: boolean;
  id?: string;
}

interface GlobalOriginalStyle {
  overflow: string;
  zIndex: string;
  refCount: number;
}
const globalModifiedParents = new Map<HTMLElement, GlobalOriginalStyle>();

export function useTouchDrag(elementRef: Ref<HTMLElement | null>, options: DragOptions) {
// ... omitted code ... (I will use multi_replace for safety)
  const isDragging = ref(false);
  const isSpringing = ref(false);
  const isSuccess = ref(false);
  
  // Translation offsets
  const translateX = ref(0);
  const translateY = ref(0);
  
  // Original center offset needed to snap piece to finger
  let snapOffsetX = 0;
  let snapOffsetY = 0;
  
  // Starting point of the touch/mouse
  let startX = 0;
  let startY = 0;
  
  // Scroll-safe original center of the element (page coordinates captured at drag-start)
  let originalCenterX = 0;
  let originalCenterY = 0;
  
  let wrapperZIndexTimeout: ReturnType<typeof setTimeout> | null = null;
  
  let modifiedParents: HTMLElement[] = [];
  
  const restoreParents = () => {
    modifiedParents.forEach(el => {
      const globalState = globalModifiedParents.get(el);
      if (globalState) {
        globalState.refCount--;
        if (globalState.refCount <= 0) {
          el.style.overflow = globalState.overflow;
          el.style.zIndex = globalState.zIndex;
          if (el.style.length === 0) {
            el.removeAttribute('style');
          }
          globalModifiedParents.delete(el);
        }
      }
    });
    modifiedParents = [];
  };

  const style = computed(() => {
    if (isSuccess.value) {
      // Allow custom CSS to handle success state completely, or hold the final transform
      return {
        transform: `translate(${translateX.value}px, ${translateY.value}px) scale(1)`,
        zIndex: 10,
        transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' // satisfying snap
      };
    }
    
    if (isSpringing.value) {
      return {
        transform: `translate(${translateX.value}px, ${translateY.value}px) scale(1)`,
        zIndex: 10,
        transition: 'transform 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28)' // bouncy spring-back
      };
    }
    
    if (isDragging.value) {
      return {
        transform: `translate(${translateX.value}px, ${translateY.value}px) scale(1.08)`,
        zIndex: 1000, // Elevation
        boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
        transition: 'none' // Instant follow
      };
    }
    
    return {
      transform: `translate(0px, 0px) scale(1)`,
      zIndex: 1,
      transition: 'transform 0.3s ease'
    };
  });

  const onStart = (clientX: number, clientY: number) => {
    if (options.disabled || !elementRef.value || isSuccess.value || isSpringing.value) return;
    
    isDragging.value = true;
    
    // Elevate the closest wrapper and all stacking context ancestors to prevent clipping
    if (wrapperZIndexTimeout) {
      clearTimeout(wrapperZIndexTimeout);
      wrapperZIndexTimeout = null;
    }
    restoreParents(); // safety check
    
    if (elementRef.value) {
      let current = elementRef.value.closest('.piece-wrapper') as HTMLElement || elementRef.value;
      
      while (current && current.tagName !== 'BODY') {
        const computed = window.getComputedStyle(current);
        let needsUpdate = false;
        
        // Break out of overflow:hidden boundaries (e.g. split screens, bottom garages)
        if (computed.overflow === 'hidden' || computed.overflowX === 'hidden' || computed.overflowY === 'hidden') {
          needsUpdate = true;
        }
        
        // Elevate any structural layout elements that might establish restrictive stacking contexts
        if (computed.position !== 'static' || current.classList.contains('piece-wrapper') || computed.zIndex !== 'auto') {
          needsUpdate = true;
        }
        
        if (needsUpdate) {
          if (!globalModifiedParents.has(current)) {
            globalModifiedParents.set(current, {
              overflow: current.style.overflow,
              zIndex: current.style.zIndex,
              refCount: 1
            });
          } else {
            globalModifiedParents.get(current)!.refCount++;
          }
          current.style.setProperty('overflow', 'visible', 'important');
          current.style.setProperty('z-index', '9999', 'important');
          modifiedParents.push(current);
        }
        
        current = current.parentElement as HTMLElement;
      }
    }
    startX = clientX;
    startY = clientY;
    
    // Calculate exact center of the element to snap to the finger
    const rect = elementRef.value.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Store the original element center in page coordinates (used in onEnd for accurate snap).
    // We add window.scrollX/Y so that subsequent scrolling during the drag doesn't invalidate this.
    originalCenterX = centerX + window.scrollX;
    originalCenterY = centerY + window.scrollY;
    
    snapOffsetX = clientX - centerX;
    snapOffsetY = clientY - centerY;
    
    translateX.value = snapOffsetX;
    translateY.value = snapOffsetY;
  };

  const onMove = (clientX: number, clientY: number, e: Event) => {
    if (!isDragging.value) return;
    // Prevent default browser panning on webOS/mobile
    if (e.cancelable) e.preventDefault(); 
    
    // Calculate total movement + initial snap offset
    translateX.value = (clientX - startX) + snapOffsetX;
    translateY.value = (clientY - startY) + snapOffsetY;
  };

  const onEnd = (clientX: number, clientY: number, isCancelled: boolean = false) => {
    if (!isDragging.value) return;
    isDragging.value = false;
    
    let hitTarget: HTMLElement | null = null;

    if (!isCancelled) {
      const targets = document.querySelectorAll(options.dropZoneSelector);
      // Check intersections using an expanded bounding box (20% larger) for much easier placement
      for (const target of Array.from(targets)) {
      const rect = target.getBoundingClientRect();
      
      // Expand the hitbox by 20% in all directions for accessibility
      const expandX = rect.width * 0.20;
      const expandY = rect.height * 0.20;
      
      if (
        clientX >= (rect.left - expandX) &&
        clientX <= (rect.right + expandX) &&
        clientY >= (rect.top - expandY) &&
        clientY <= (rect.bottom + expandY)
      ) {
        hitTarget = target as HTMLElement;
        break; // Stop checking once we find a hit
      }
      }
    }

    if (hitTarget) {
      // Validate the drop if a validator is provided
      const isValid = options.validateDrop ? options.validateDrop(hitTarget) : true;
      
      if (isValid) {
        // Success! Snap piece exactly to the target's center
        const targetRect = hitTarget!.getBoundingClientRect();
        const targetCenterX = targetRect.left + targetRect.width / 2;
        const targetCenterY = targetRect.top + targetRect.height / 2;
        
        // Calculate where it needs to translate to, relative to its original static position.
        // Use page-coordinate originalCenter to account for any scroll that occurred during drag.
        const scrollAdjustedCenterX = originalCenterX - window.scrollX;
        const scrollAdjustedCenterY = originalCenterY - window.scrollY;
        
        translateX.value = targetCenterX - scrollAdjustedCenterX;
        translateY.value = targetCenterY - scrollAdjustedCenterY;
        
        isSuccess.value = true;
        if (options.onSuccessDrop) options.onSuccessDrop(hitTarget);
        
        wrapperZIndexTimeout = setTimeout(() => { restoreParents(); }, 300);
      } else {
        // Dropped in zone, but invalid! Treat as error.
        isSpringing.value = true;
        translateX.value = 0;
        translateY.value = 0;
        
        setTimeout(() => {
          isSpringing.value = false;
        }, 400);
        
        wrapperZIndexTimeout = setTimeout(() => { restoreParents(); }, 400);
        
        if (options.onErrorDrop) options.onErrorDrop(hitTarget);
      }
    } else {
      // Error! Spring back to origin
      isSpringing.value = true;
      translateX.value = 0;
      translateY.value = 0;
      
      setTimeout(() => {
        isSpringing.value = false;
      }, 400); // Wait for transition to complete
      
      wrapperZIndexTimeout = setTimeout(() => { restoreParents(); }, 400);
      
      if (!isCancelled && options.onErrorDrop) options.onErrorDrop();
    }
  };

  const handlers = {
    pointerdown: (e: PointerEvent) => {
      if (e.isPrimary === false && e.pointerType === 'mouse') return; // Ignore right click if needed, though pointer events handle it
      const target = e.currentTarget as HTMLElement;
      target.setPointerCapture(e.pointerId);
      onStart(e.clientX, e.clientY);
    },
    pointermove: (e: PointerEvent) => {
      const target = e.currentTarget as HTMLElement;
      if (target.hasPointerCapture(e.pointerId)) {
        onMove(e.clientX, e.clientY, e);
      }
    },
    pointerup: (e: PointerEvent) => {
      const target = e.currentTarget as HTMLElement;
      if (target.hasPointerCapture(e.pointerId)) {
        target.releasePointerCapture(e.pointerId);
        onEnd(e.clientX, e.clientY);
      }
    },
    pointercancel: (e: PointerEvent) => {
      const target = e.currentTarget as HTMLElement;
      if (target.hasPointerCapture(e.pointerId)) {
        target.releasePointerCapture(e.pointerId);
        onEnd(e.clientX, e.clientY, true);
      }
    }
  };

  onUnmounted(() => {
    if (wrapperZIndexTimeout) {
      clearTimeout(wrapperZIndexTimeout);
    }
    restoreParents();
  });

  return {
    isDragging,
    isSpringing,
    isSuccess,
    style,
    handlers
  };
}
