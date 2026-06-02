import { ref } from 'vue';
import 'webostvjs';

// Global state to prevent memory leaks and manage active speech across components
const globalIsPlaying = ref(false);
const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

let preferredVoice: SpeechSynthesisVoice | null = null;
let fallbackAudio: HTMLAudioElement | null = null;
let activeUtterance: SpeechSynthesisUtterance | null = null;
let voicesInitialized = false;

const initVoices = () => {
  if (!isSupported) return;
  const voices = window.speechSynthesis.getVoices();
  // Prefer Google US English, Siri, or any friendly en-US voice
  preferredVoice = voices.find(v => v.name.includes('Google') && v.lang === 'en-US') ||
                   voices.find(v => v.name.includes('Samantha') || v.name.includes('Victoria')) ||
                   voices.find(v => v.lang === 'en-US' || v.lang.startsWith('en')) ||
                   voices[0] || null;
  voicesInitialized = true;
};

// Initialize voices globally once
if (isSupported && !voicesInitialized) {
  if (window.speechSynthesis.getVoices().length > 0) {
    initVoices();
  } else {
    window.speechSynthesis.addEventListener('voiceschanged', initVoices, { once: true });
  }
}

// NOTE: This uses an unofficial Google TTS endpoint. It works on most networks but
// may be blocked or rate-limited. It is used only as a last-resort fallback when
// both Luna (webOS) and the Web Speech API are unavailable.
function _playGoogleTTS(text: string) {
  console.log('Using Google TTS audio fallback for:', text);
  if (fallbackAudio) {
    // Clear old event listeners so they don't fire when we reset the src!
    fallbackAudio.onended = null;
    fallbackAudio.onerror = null;
    fallbackAudio.pause();
    fallbackAudio.src = '';
  }
  
  // Set playing state SYNCHRONOUSLY to prevent UI flashing
  globalIsPlaying.value = true;

  const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=en-US&client=tw-ob&q=${encodeURIComponent(text)}`;
  fallbackAudio = new Audio(url);
  
  // Ensure we cover all ending scenarios
  fallbackAudio.onended = () => { globalIsPlaying.value = false; };
  fallbackAudio.onerror = () => {
    console.warn('Google TTS audio fallback also failed. No TTS available.');
    globalIsPlaying.value = false;
  };
  
  fallbackAudio.play().catch(() => {
    console.warn('Google TTS audio playback blocked by browser policy.');
    globalIsPlaying.value = false;
  });
}

export function useSpeech() {
  const playInstruction = (text: string) => {
    const webOS = typeof window !== 'undefined' ? (window as any).webOS : null;
    
    // 1. If we are on WebOS, use the Luna TTS service first (most reliable on-device)
    if (webOS && webOS.service) {
      try {
        globalIsPlaying.value = true;
        webOS.service.request("luna://com.webos.service.tts", {
          method: "speak",
          parameters: { text: text, clear: true },
          onSuccess: () => { 
            // WebOS returns success immediately when queued!
            // We must estimate the duration to clear the playing state.
            const estimatedDuration = Math.max(1500, text.length * 85);
            setTimeout(() => { globalIsPlaying.value = false; }, estimatedDuration);
          },
          onFailure: () => {
            // Luna failed — fall through to Google TTS audio directly
            // Do NOT set globalIsPlaying = false here, to prevent flickering
            _playGoogleTTS(text);
          }
        });
      } catch(err) {
        // Do NOT set globalIsPlaying = false here, to prevent flickering
        _playGoogleTTS(text);
      }
      return;
    }

    // 2. If standard speechSynthesis has no voices, use Google TTS audio fallback
    const hasStandardVoices = isSupported && window.speechSynthesis.getVoices().length > 0;
    if (!hasStandardVoices) {
      _playGoogleTTS(text);
      return;
    }

    // 2. Standard Web Speech API (Chrome/Safari/Desktop)
    if (!isSupported) return;
    
    // Only cancel if there is active speech to prevent Safari event detachment bug
    if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
      window.speechSynthesis.cancel();
    }
    
    // Resume in case the synthesis engine was stuck in a paused state
    if (window.speechSynthesis.resume) {
      window.speechSynthesis.resume();
    }
    
    const currentUtterance = new SpeechSynthesisUtterance(text);
    activeUtterance = currentUtterance;
    
    // Prevent Safari Garbage Collection bug
    (window as any).__utteranceCache = (window as any).__utteranceCache || [];
    (window as any).__utteranceCache.push(currentUtterance);
    // Keep cache size manageable
    if ((window as any).__utteranceCache.length > 5) {
      (window as any).__utteranceCache.shift();
    }
    
    // Fetch voices just in time if they weren't loaded yet
    if (!preferredVoice) {
      initVoices();
    }
    
    if (preferredVoice) {
      currentUtterance.voice = preferredVoice;
    } else {
      console.log('No preferred voice found, using system default');
    }
    
    // Tweak rate and pitch for a friendly, slightly slower voice
    currentUtterance.rate = 0.85; 
    currentUtterance.pitch = 1.1;

    // Set playing state SYNCHRONOUSLY to prevent UI flashing before onstart fires
    globalIsPlaying.value = true;

    currentUtterance.onstart = () => { 
      if (activeUtterance === currentUtterance) {
        console.log('Speech started:', text); 
      }
    };
    currentUtterance.onend = () => { 
      if (activeUtterance === currentUtterance) {
        console.log('Speech ended'); 
        globalIsPlaying.value = false; 
        activeUtterance = null;
      }
    };
    currentUtterance.onerror = (e) => { 
      if (activeUtterance === currentUtterance) {
        console.error('Speech error:', e); 
        globalIsPlaying.value = false; 
        activeUtterance = null;
      }
    };

    console.log('Triggering speech for:', text);
    window.speechSynthesis.speak(currentUtterance);
  };

  const stopSpeech = () => {
    if (fallbackAudio) {
      fallbackAudio.onended = null;
      fallbackAudio.onerror = null;
      fallbackAudio.pause();
      fallbackAudio.currentTime = 0;
    }

    const webOS = typeof window !== 'undefined' ? (window as any).webOS : null;
    if (webOS && webOS.service) {
      try {
        webOS.service.request("luna://com.webos.service.tts", {
          method: "speak",
          parameters: { text: " ", clear: true }
        });
      } catch (e) {}
    }

    if (isSupported) {
      window.speechSynthesis.cancel();
      globalIsPlaying.value = false;
      activeUtterance = null;
    }
  };

  // We explicitly DO NOT call stopSpeech() onUnmounted anymore.
  // This prevents the race condition during Vue Router transitions where the old 
  // component unmounts *after* the new component has already started playing speech.

  return {
    playInstruction,
    stopSpeech,
    isPlaying: globalIsPlaying,
    isSupported
  };
}
