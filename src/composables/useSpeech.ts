import { ref } from 'vue';
import 'webostvjs';

// Global state to prevent memory leaks and manage active speech across components
const globalIsPlaying = ref(false);
const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

let preferredVoice: SpeechSynthesisVoice | null = null;
let fallbackAudio: HTMLAudioElement | null = null;

const initVoices = () => {
  if (!isSupported) return;
  const voices = window.speechSynthesis.getVoices();
  // Prefer Google US English, Siri, or any friendly en-US voice
  preferredVoice = voices.find(v => v.name.includes('Google') && v.lang === 'en-US') ||
                   voices.find(v => v.name.includes('Samantha') || v.name.includes('Victoria')) ||
                   voices.find(v => v.lang === 'en-US' || v.lang.startsWith('en')) ||
                   voices[0] || null;
};

// Initialize voices globally once
if (isSupported) {
  if (window.speechSynthesis.getVoices().length > 0) {
    initVoices();
  } else {
    window.speechSynthesis.addEventListener('voiceschanged', initVoices, { once: true });
  }
}

// Helper to chunk text to bypass TTS length limits (Google TTS has a hard ~200 char limit,
// and Web Speech API has a 15-second cutoff bug).
function chunkText(text: string): string[] {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (!normalized) return [];

  // Match sentences (ending with . ! ? followed by space or end of string)
  const sentenceRegex = /[^.!?]+[.!?]+(?:\s+|$)|[^.!?]+$/g;
  const sentences = normalized.match(sentenceRegex) || [normalized];
  
  const chunks: string[] = [];
  
  for (let sentence of sentences) {
    sentence = sentence.trim();
    if (!sentence) continue;
    
    // If a sentence is still too long (> 150 chars), break it down further by commas or spaces
    while (sentence.length > 150) {
      let splitIndex = sentence.lastIndexOf(', ', 150);
      if (splitIndex === -1) {
        splitIndex = sentence.lastIndexOf(' ', 150);
      }
      if (splitIndex === -1) {
        splitIndex = 150; // Hard split if no spaces
      }
      
      chunks.push(sentence.substring(0, splitIndex).trim());
      sentence = sentence.substring(splitIndex).trim();
    }
    
    if (sentence.length > 0) {
      chunks.push(sentence);
    }
  }
  
  return chunks;
}

let currentSpeechId = 0; // used to cancel active chunk chains

// NOTE: This uses an unofficial Google TTS endpoint. It works on most networks but
// may be blocked or rate-limited. It is used only as a last-resort fallback when
// both Luna (webOS) and the Web Speech API are unavailable.
function _playGoogleTTS(chunks: string[], chunkIndex: number, speechId: number) {
  if (speechId !== currentSpeechId) return; // Cancelled
  if (chunkIndex >= chunks.length) {
    globalIsPlaying.value = false;
    return;
  }
  
  const text = chunks[chunkIndex];
  console.log(`Using Google TTS audio fallback for chunk ${chunkIndex + 1}/${chunks.length}:`, text);
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
  fallbackAudio.onended = () => { _playGoogleTTS(chunks, chunkIndex + 1, speechId); };
  fallbackAudio.onerror = () => {
    console.warn('Google TTS audio fallback failed. No TTS available.');
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
    
    const chunks = chunkText(text);
    currentSpeechId++;
    const speechId = currentSpeechId;

    if (chunks.length === 0) return;

    // 1. If we are on WebOS, use the Luna TTS service first (most reliable on-device)
    if (webOS && webOS.service) {
      try {
        globalIsPlaying.value = true;
        let totalEstimatedDuration = 0;
        
        chunks.forEach((chunk, index) => {
          webOS.service.request("luna://com.webos.service.tts", {
            method: "speak",
            parameters: { text: chunk, clear: index === 0 },
            onFailure: () => {
              // Luna failed — fall through to Google TTS audio directly
              if (index === 0) {
                 _playGoogleTTS(chunks, 0, speechId);
              }
            }
          });
          // WebOS returns success immediately when queued!
          // We must estimate the duration to clear the playing state.
          totalEstimatedDuration += Math.max(1000, chunk.length * 85);
        });
        
        setTimeout(() => { 
          if (currentSpeechId === speechId) {
            globalIsPlaying.value = false; 
          }
        }, totalEstimatedDuration);
        
      } catch(err) {
        // Do NOT set globalIsPlaying = false here, to prevent flickering
        _playGoogleTTS(chunks, 0, speechId);
      }
      return;
    }

    // 2. If standard speechSynthesis has no voices, use Google TTS audio fallback
    const hasStandardVoices = isSupported && window.speechSynthesis.getVoices().length > 0;
    if (!hasStandardVoices) {
      _playGoogleTTS(chunks, 0, speechId);
      return;
    }

    // 3. Standard Web Speech API (Chrome/Safari/Desktop)
    if (!isSupported) return;
    
    // Only cancel if there is active speech to prevent Safari event detachment bug
    if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
      window.speechSynthesis.cancel();
    }
    
    // Resume in case the synthesis engine was stuck in a paused state
    if (window.speechSynthesis.resume) {
      window.speechSynthesis.resume();
    }
    
    // Fetch voices just in time if they weren't loaded yet
    if (!preferredVoice) {
      initVoices();
    }
    
    globalIsPlaying.value = true;

    chunks.forEach((chunk, index) => {
      const currentUtterance = new SpeechSynthesisUtterance(chunk);
      
      // Prevent Safari Garbage Collection bug
      (window as any).__utteranceCache = (window as any).__utteranceCache || [];
      (window as any).__utteranceCache.push(currentUtterance);
      // Keep cache size manageable
      if ((window as any).__utteranceCache.length > 5) {
        (window as any).__utteranceCache.shift();
      }
      
      if (preferredVoice) {
        currentUtterance.voice = preferredVoice;
      } else if (index === 0) {
        console.log('No preferred voice found, using system default');
      }
      
      // Tweak rate and pitch for a friendly, slightly slower voice
      currentUtterance.rate = 0.85; 
      currentUtterance.pitch = 1.1;

      currentUtterance.onstart = () => { 
        if (index === 0 && currentSpeechId === speechId) {
          console.log('Speech started:', text); 
        }
      };
      currentUtterance.onend = () => { 
        if (index === chunks.length - 1 && currentSpeechId === speechId) {
          console.log('Speech ended'); 
          globalIsPlaying.value = false; 
        }
      };
      currentUtterance.onerror = (e) => { 
        if (currentSpeechId === speechId) {
          console.error('Speech error:', e); 
          globalIsPlaying.value = false; 
        }
      };

      if (index === 0) {
        console.log('Triggering speech for:', text);
      }
      window.speechSynthesis.speak(currentUtterance);
    });
  };

  const stopSpeech = () => {
    currentSpeechId++; // Invalidates pending chunks

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
