// Build a sine-wave WAV data URI once at module load
const SNAP_SRC = (() => {
  try {
    // Decode the base64 and build a proper sine wave WAV at runtime instead
    // so we don't rely on a pre-baked sample being bit-perfect.
    const sampleRate = 22050;
    const duration = 0.12; // seconds
    const numSamples = Math.floor(sampleRate * duration);
    const numChannels = 1;
    const bitsPerSample = 16;
    const byteRate = sampleRate * numChannels * bitsPerSample / 8;
    const blockAlign = numChannels * bitsPerSample / 8;
    const dataSize = numSamples * blockAlign;
    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    const write = (off: number, str: string) =>
      str.split('').forEach((c, i) => view.setUint8(off + i, c.charCodeAt(0)));
    const u32 = (off: number, v: number) => view.setUint32(off, v, true);
    const u16 = (off: number, v: number) => view.setUint16(off, v, true);

    write(0, 'RIFF');
    u32(4, 36 + dataSize);
    write(8, 'WAVE');
    write(12, 'fmt ');
    u32(16, 16);
    u16(20, 1); // PCM
    u16(22, numChannels);
    u32(24, sampleRate);
    u32(28, byteRate);
    u16(32, blockAlign);
    u16(34, bitsPerSample);
    write(36, 'data');
    u32(40, dataSize);

    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      // Fast attack, punchy exponential decay
      const envelope = Math.exp(-t / (duration * 0.15));
      // Mix two frequencies for a richer "thud" sound
      const wave = 0.6 * Math.sin(2 * Math.PI * 220 * t) +
                   0.4 * Math.sin(2 * Math.PI * 440 * t);
      const sample = wave * envelope;
      view.setInt16(44 + i * 2, Math.max(-32768, Math.min(32767, sample * 32767)), true);
    }

    const bytes = new Uint8Array(buffer);
    let binary = '';
    bytes.forEach(b => binary += String.fromCharCode(b));
    return 'data:audio/wav;base64,' + btoa(binary);
  } catch {
    return null;
  }
})();

let snapAudio: HTMLAudioElement | null = null;

export function initAudio() {
  if (!SNAP_SRC) return;
  if (!snapAudio) {
    snapAudio = new Audio(SNAP_SRC);
    snapAudio.volume = 1.0;
    // Preload into memory
    snapAudio.load();
  }
}

export function playSnapSound() {
  if (!SNAP_SRC) return;
  try {
    initAudio();
    if (!snapAudio) return;
    // Reset and replay: works every time regardless of how many times played
    snapAudio.currentTime = 0;
    snapAudio.play().catch(() => {});
  } catch {
    // ignore
  }
}

