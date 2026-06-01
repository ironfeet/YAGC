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

export function useSpeech() {
  const playInstruction = (text: string) => {
    const webOS = typeof window !== 'undefined' ? (window as any).webOS : null;
    
    // 1. If we are on WebOS, OR if standard speechSynthesis has no voices, use robust Audio fallback
    const hasStandardVoices = isSupported && window.speechSynthesis.getVoices().length > 0;
    
    if (webOS || !hasStandardVoices) {
      console.log('Using Audio TTS Fallback for:', text);
      if (fallbackAudio) {
        fallbackAudio.pause();
      }
      
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=en-US&client=tw-ob&q=${encodeURIComponent(text)}`;
      fallbackAudio = new Audio(url);
      
      fallbackAudio.onplay = () => { globalIsPlaying.value = true; };
      fallbackAudio.onended = () => { globalIsPlaying.value = false; };
      fallbackAudio.onerror = (e) => { 
        console.error('Audio TTS Fallback failed:', e);
        globalIsPlaying.value = false;
        
        // Final Hail Mary: Try native WebOS Luna Service if audio fails
        if (webOS && webOS.service) {
          try {
            webOS.service.request("luna://com.webos.service.tts", {
              method: "speak",
              parameters: { text: text, clear: true }
            });
          } catch(err) {}
        }
      };
      
      fallbackAudio.play().catch(e => {
        console.error("Audio playback blocked", e);
      });
      return;
    }

    // 2. Standard Web Speech API (Chrome/Safari/Desktop)
    if (!isSupported) return;
    
    // Cancel any currently playing speech to avoid overlapping
    window.speechSynthesis.cancel();
    
    // Resume in case the synthesis engine was stuck in a paused state
    if (window.speechSynthesis.resume) {
      window.speechSynthesis.resume();
    }
    
    const currentUtterance = new SpeechSynthesisUtterance(text);
    activeUtterance = currentUtterance;
    
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

    currentUtterance.onstart = () => { 
      if (activeUtterance === currentUtterance) {
        console.log('Speech started:', text); 
        globalIsPlaying.value = true; 
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
