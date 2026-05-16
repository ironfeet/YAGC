<script setup lang="ts">
import { computed } from 'vue';
import type { PatchFeature, PatternType } from '../../types';

export interface SceneTheme {
  primary: { color: string; pattern: PatternType };
  secondary: { color: string; pattern: PatternType };
  tertiary: { color: string; pattern: PatternType };
  accent: { color: string; pattern: PatternType };
}

const props = defineProps<{
  sceneType: 'balloon' | 'house' | 'rocket' | 'fish' | 'butterfly' | 'robot' | 'train' | 'flower';
  theme: SceneTheme;
  holes?: PatchFeature[]; // To mask out of the main scene
  clipTarget?: { cx: number; cy: number; radius: number }; // To crop the piece
  promptLevel?: 'none' | 'partial' | 'full';
}>();

// Helper to generate the SVG fill attribute string
const getFill = (part: keyof SceneTheme) => {
  const { color, pattern } = props.theme[part];
  if (pattern === 'solid') return color;
  return `url(#pat-${instanceId}-${part}-${color.replace('#', '')})`;
};

const activePatterns = computed(() => {
  return Object.entries(props.theme).filter(([_, config]) => config.pattern !== 'solid');
});

// Unique instance ID to prevent SVG defs clashing across multiple puzzle pieces
const instanceId = Math.random().toString(36).substring(2, 9);

// ViewBox logic: If clipping for a piece, zoom exactly into the clipped radius
const viewBox = computed(() => {
  if (props.clipTarget) {
    const { cx, cy, radius } = props.clipTarget;
    return `${cx - radius} ${cy - radius} ${radius * 2} ${radius * 2}`;
  }
  return '0 0 400 400';
});
</script>

<template>
  <svg :viewBox="viewBox" class="scene-svg" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <!-- Base Mask for the Main Board (Holes) -->
      <mask :id="`board-mask-${instanceId}`" v-if="!clipTarget">
        <rect width="100%" height="100%" fill="white" />
        <circle 
          v-for="h in holes" 
          :key="h.id" 
          :cx="h.cx" 
          :cy="h.cy" 
          :r="h.radius" 
          fill="black" 
        />
      </mask>

      <!-- ClipPath for the Draggable Puzzle Piece -->
      <clipPath :id="`piece-clip-${instanceId}`" v-if="clipTarget">
        <circle :cx="clipTarget.cx" :cy="clipTarget.cy" :r="clipTarget.radius" />
      </clipPath>

      <!-- Dynamic Patterns -->
      <template v-for="[part, config] in activePatterns" :key="`${part}-${config.color}-${config.pattern}`">
        
        <pattern v-if="config.pattern === 'stripes'" :id="`pat-${instanceId}-${part}-${config.color.replace('#','')}`" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="20" height="20" :fill="config.color" />
          <line x1="0" y1="0" x2="0" y2="20" stroke="#ffffff" stroke-width="10" />
        </pattern>
        
        <pattern v-else-if="config.pattern === 'polka-dots'" :id="`pat-${instanceId}-${part}-${config.color.replace('#','')}`" width="30" height="30" patternUnits="userSpaceOnUse">
          <rect width="30" height="30" :fill="config.color" />
          <circle cx="15" cy="15" r="7" fill="#ffffff" />
        </pattern>
        
        <pattern v-else-if="config.pattern === 'checkerboard'" :id="`pat-${instanceId}-${part}-${config.color.replace('#','')}`" width="40" height="40" patternUnits="userSpaceOnUse">
          <rect width="40" height="40" :fill="config.color" />
          <rect x="0" y="0" width="20" height="20" fill="#ffffff" />
          <rect x="20" y="20" width="20" height="20" fill="#ffffff" />
        </pattern>

      </template>
    </defs>

    <!-- The Rendered Scene -->
    <g :mask="clipTarget ? '' : `url(#board-mask-${instanceId})`" :clip-path="clipTarget ? `url(#piece-clip-${instanceId})` : ''">
      
      <!-- Hot Air Balloon Scene -->
      <g v-if="sceneType === 'balloon'">
        <!-- Background Sky -->
        <rect width="400" height="400" fill="#87CEEB" />
        
        <!-- Clouds -->
        <path d="M 50,100 Q 70,80 100,100 Q 130,80 150,100 Q 150,130 100,130 Q 50,130 50,100 Z" fill="#ffffff" opacity="0.8" />
        <path d="M 250,50 Q 270,30 300,50 Q 330,30 350,50 Q 350,80 300,80 Q 250,80 250,50 Z" fill="#ffffff" opacity="0.8" />
        <path d="M 300,200 Q 320,180 350,200 Q 380,180 400,200 Q 400,230 350,230 Q 300,230 300,200 Z" fill="#ffffff" opacity="0.8" />

        <!-- Balloon Envelope (Top) -->
        <path d="M 200,40 C 350,40 330,190 260,250 L 140,250 C 70,190 50,40 200,40 Z" :fill="getFill('primary')" />
        
        <!-- Balloon Envelope (Middle Band) -->
        <path d="M 100,150 C 130,180 270,180 300,150 L 280,200 C 250,230 150,230 120,200 Z" :fill="getFill('secondary')" />

        <!-- Ropes -->
        <line x1="160" y1="250" x2="175" y2="300" stroke="#333" stroke-width="4" />
        <line x1="240" y1="250" x2="225" y2="300" stroke="#333" stroke-width="4" />
        <line x1="200" y1="250" x2="200" y2="300" stroke="#333" stroke-width="4" />

        <!-- Basket -->
        <rect x="170" y="300" width="60" height="40" rx="5" :fill="getFill('tertiary')" />
        <rect x="165" y="300" width="70" height="10" rx="2" :fill="getFill('accent')" />
      </g>

      <!-- House Scene -->
      <g v-else-if="sceneType === 'house'">
        <!-- Background Sky -->
        <rect width="400" height="400" fill="#a0e6ff" />
        
        <!-- Grass -->
        <rect x="0" y="300" width="400" height="100" fill="#7cb342" />
        
        <!-- House Body -->
        <rect x="100" y="180" width="200" height="150" :fill="getFill('primary')" />
        
        <!-- Roof -->
        <polygon points="50,180 200,60 350,180" :fill="getFill('secondary')" />
        
        <!-- Door -->
        <rect x="170" y="250" width="60" height="80" :fill="getFill('tertiary')" />
        <circle cx="220" cy="290" r="4" fill="#fff" />
        
        <!-- Window -->
        <rect x="120" y="200" width="40" height="40" :fill="getFill('accent')" />
        <line x1="140" y1="200" x2="140" y2="240" stroke="#fff" stroke-width="4" />
        <line x1="120" y1="220" x2="160" y2="220" stroke="#fff" stroke-width="4" />
      </g>

      <!-- 🚀 Rocket Scene -->
      <g v-else-if="sceneType === 'rocket'">
        <!-- Deep space background -->
        <rect width="400" height="400" fill="#0a0a2e" />
        <!-- Stars -->
        <circle cx="30" cy="40" r="2" fill="#fff" opacity="0.9" />
        <circle cx="80" cy="20" r="1.5" fill="#fff" opacity="0.7" />
        <circle cx="150" cy="60" r="2" fill="#fff" opacity="0.8" />
        <circle cx="320" cy="30" r="1.5" fill="#fff" opacity="0.9" />
        <circle cx="370" cy="80" r="2" fill="#fff" opacity="0.6" />
        <circle cx="50" cy="200" r="1.5" fill="#fff" opacity="0.8" />
        <circle cx="350" cy="150" r="2" fill="#fff" opacity="0.7" />
        <circle cx="380" cy="280" r="1.5" fill="#fff" opacity="0.9" />
        <circle cx="20" cy="340" r="2" fill="#fff" opacity="0.6" />
        <circle cx="100" cy="380" r="1.5" fill="#fff" opacity="0.8" />
        <!-- Planet -->
        <circle cx="330" cy="300" r="55" fill="#9b59b6" opacity="0.6" />
        <ellipse cx="330" cy="300" rx="80" ry="15" fill="none" stroke="#e8a7ff" stroke-width="6" opacity="0.5" />
        <!-- Rocket body -->
        <rect x="170" y="120" width="60" height="180" rx="10" :fill="getFill('primary')" />
        <!-- Rocket nose cone -->
        <path d="M 170,120 Q 200,40 230,120 Z" :fill="getFill('secondary')" />
        <!-- Rocket window -->
        <circle cx="200" cy="185" r="25" :fill="getFill('accent')" />
        <circle cx="200" cy="185" r="18" fill="#87CEEB" opacity="0.7" />
        <!-- Rocket fins -->
        <polygon points="170,260 140,320 170,300" :fill="getFill('tertiary')" />
        <polygon points="230,260 260,320 230,300" :fill="getFill('tertiary')" />
        <!-- Rocket exhaust -->
        <ellipse cx="200" cy="305" rx="25" ry="12" fill="#f39c12" opacity="0.8" />
        <ellipse cx="200" cy="330" rx="18" ry="20" fill="#e74c3c" opacity="0.6" />
        <ellipse cx="200" cy="355" rx="10" ry="15" fill="#f1c40f" opacity="0.5" />
      </g>

      <!-- 🐠 Fish Scene -->
      <g v-else-if="sceneType === 'fish'">
        <!-- Underwater background -->
        <rect width="400" height="400" fill="#006994" />
        <!-- Water shimmer rays -->
        <line x1="50" y1="0" x2="80" y2="400" stroke="#00a8cc" stroke-width="20" opacity="0.15" />
        <line x1="150" y1="0" x2="180" y2="400" stroke="#00a8cc" stroke-width="20" opacity="0.15" />
        <line x1="280" y1="0" x2="310" y2="400" stroke="#00a8cc" stroke-width="20" opacity="0.15" />
        <!-- Seaweed -->
        <path d="M 60,400 Q 50,340 70,300 Q 50,260 70,220" stroke="#2ecc71" stroke-width="12" fill="none" stroke-linecap="round" />
        <path d="M 340,400 Q 350,350 330,310 Q 350,270 330,240" stroke="#27ae60" stroke-width="10" fill="none" stroke-linecap="round" />
        <!-- Coral -->
        <circle cx="100" cy="390" r="20" fill="#e74c3c" opacity="0.8" />
        <circle cx="120" cy="375" r="15" fill="#e74c3c" opacity="0.8" />
        <circle cx="80" cy="378" r="12" fill="#c0392b" opacity="0.8" />
        <!-- Bubbles -->
        <circle cx="80" cy="80" r="12" fill="none" stroke="#87CEEB" stroke-width="3" opacity="0.6" />
        <circle cx="130" cy="40" r="8" fill="none" stroke="#87CEEB" stroke-width="2" opacity="0.5" />
        <circle cx="320" cy="100" r="10" fill="none" stroke="#87CEEB" stroke-width="2" opacity="0.6" />
        <!-- Fish body -->
        <ellipse cx="200" cy="200" rx="110" ry="70" :fill="getFill('primary')" />
        <!-- Fish tail -->
        <polygon points="310,200 370,140 370,260" :fill="getFill('secondary')" />
        <!-- Fish stripe -->
        <rect x="130" y="150" width="30" height="100" rx="8" :fill="getFill('tertiary')" opacity="0.85" />
        <!-- Fish eye -->
        <circle cx="110" cy="185" r="22" :fill="getFill('accent')" />
        <circle cx="108" cy="183" r="12" fill="#1a1a1a" />
        <circle cx="112" cy="179" r="4" fill="white" />
        <!-- Fins -->
        <path d="M 180,130 Q 200,90 220,130" :fill="getFill('secondary')" />
        <path d="M 160,255 Q 200,290 240,255" :fill="getFill('secondary')" opacity="0.7" />
      </g>

      <!-- 🦋 Butterfly Scene -->
      <g v-else-if="sceneType === 'butterfly'">
        <!-- Meadow sky -->
        <rect width="400" height="400" fill="#d4f5e9" />
        <!-- Sun -->
        <circle cx="340" cy="60" r="40" fill="#f1c40f" opacity="0.9" />
        <!-- Clouds -->
        <ellipse cx="100" cy="70" rx="50" ry="25" fill="white" opacity="0.8" />
        <ellipse cx="130" cy="60" rx="35" ry="20" fill="white" opacity="0.8" />
        <!-- Grass -->
        <rect x="0" y="320" width="400" height="80" fill="#4caf50" />
        <path d="M 0,320 Q 50,290 100,320 Q 150,290 200,320 Q 250,290 300,320 Q 350,290 400,320" fill="#66bb6a" />
        <!-- Flowers in field -->
        <circle cx="40" cy="310" r="10" fill="#ff69b4" />
        <circle cx="370" cy="310" r="8" fill="#ff69b4" />
        <circle cx="160" cy="315" r="7" fill="#ffeb3b" />
        <!-- Butterfly - left upper wing -->
        <ellipse cx="145" cy="155" rx="85" ry="70" :fill="getFill('primary')" />
        <!-- Butterfly - right upper wing -->
        <ellipse cx="255" cy="155" rx="85" ry="70" :fill="getFill('primary')" />
        <!-- Butterfly - left lower wing -->
        <ellipse cx="140" cy="245" rx="65" ry="55" :fill="getFill('secondary')" />
        <!-- Butterfly - right lower wing -->
        <ellipse cx="260" cy="245" rx="65" ry="55" :fill="getFill('secondary')" />
        <!-- Wing patterns -->
        <circle cx="155" cy="145" r="25" :fill="getFill('accent')" opacity="0.7" />
        <circle cx="245" cy="145" r="25" :fill="getFill('accent')" opacity="0.7" />
        <circle cx="148" cy="245" r="20" :fill="getFill('tertiary')" opacity="0.7" />
        <circle cx="252" cy="245" r="20" :fill="getFill('tertiary')" opacity="0.7" />
        <!-- Butterfly body -->
        <ellipse cx="200" cy="200" rx="10" ry="75" fill="#3d2b1f" />
        <!-- Antennae -->
        <line x1="196" y1="130" x2="160" y2="80" stroke="#3d2b1f" stroke-width="3" />
        <circle cx="158" cy="76" r="5" fill="#3d2b1f" />
        <line x1="204" y1="130" x2="240" y2="80" stroke="#3d2b1f" stroke-width="3" />
        <circle cx="242" cy="76" r="5" fill="#3d2b1f" />
      </g>

      <!-- 🤖 Robot Scene -->
      <g v-else-if="sceneType === 'robot'">
        <!-- Tech grid background -->
        <rect width="400" height="400" fill="#1a1a2e" />
        <!-- Grid lines -->
        <line x1="0" y1="100" x2="400" y2="100" stroke="#00ff88" stroke-width="0.5" opacity="0.2" />
        <line x1="0" y1="200" x2="400" y2="200" stroke="#00ff88" stroke-width="0.5" opacity="0.2" />
        <line x1="0" y1="300" x2="400" y2="300" stroke="#00ff88" stroke-width="0.5" opacity="0.2" />
        <line x1="100" y1="0" x2="100" y2="400" stroke="#00ff88" stroke-width="0.5" opacity="0.2" />
        <line x1="200" y1="0" x2="200" y2="400" stroke="#00ff88" stroke-width="0.5" opacity="0.2" />
        <line x1="300" y1="0" x2="300" y2="400" stroke="#00ff88" stroke-width="0.5" opacity="0.2" />
        <!-- Robot head -->
        <rect x="135" y="40" width="130" height="110" rx="20" :fill="getFill('primary')" />
        <!-- Robot antenna -->
        <rect x="192" y="15" width="16" height="30" rx="4" fill="#888" />
        <circle cx="200" cy="12" r="10" fill="#e74c3c" />
        <!-- Eyes -->
        <rect x="155" y="65" width="35" height="25" rx="5" :fill="getFill('accent')" />
        <rect x="210" y="65" width="35" height="25" rx="5" :fill="getFill('accent')" />
        <!-- Eye glow -->
        <rect x="160" y="69" width="25" height="17" rx="3" fill="#00ffff" opacity="0.7" />
        <rect x="215" y="69" width="25" height="17" rx="3" fill="#00ffff" opacity="0.7" />
        <!-- Mouth panel -->
        <rect x="160" y="110" width="80" height="25" rx="6" fill="#333" />
        <rect x="165" y="114" width="12" height="17" rx="2" fill="#00ff88" />
        <rect x="182" y="114" width="12" height="17" rx="2" fill="#ff4444" />
        <rect x="199" y="114" width="12" height="17" rx="2" fill="#00ff88" />
        <rect x="216" y="114" width="12" height="17" rx="2" fill="#ffff00" />
        <!-- Robot body -->
        <rect x="120" y="160" width="160" height="140" rx="10" :fill="getFill('secondary')" />
        <!-- Chest panel -->
        <rect x="155" y="185" width="90" height="60" rx="8" :fill="getFill('tertiary')" />
        <!-- Chest detail -->
        <circle cx="175" cy="210" r="15" fill="#0a0a2e" />
        <circle cx="175" cy="210" r="8" fill="#00ffff" opacity="0.8" />
        <rect x="200" y="197" width="30" height="8" rx="3" fill="#00ff88" opacity="0.7" />
        <rect x="200" y="210" width="20" height="8" rx="3" fill="#ff6b35" opacity="0.7" />
        <!-- Arms -->
        <rect x="70" y="165" width="45" height="120" rx="15" :fill="getFill('primary')" />
        <rect x="285" y="165" width="45" height="120" rx="15" :fill="getFill('primary')" />
        <!-- Hands -->
        <circle cx="93" cy="295" r="20" fill="#555" />
        <circle cx="308" cy="295" r="20" fill="#555" />
        <!-- Legs -->
        <rect x="145" y="305" width="45" height="85" rx="10" :fill="getFill('secondary')" />
        <rect x="210" y="305" width="45" height="85" rx="10" :fill="getFill('secondary')" />
        <!-- Feet -->
        <rect x="132" y="375" width="65" height="25" rx="8" fill="#444" />
        <rect x="198" y="375" width="65" height="25" rx="8" fill="#444" />
      </g>

      <!-- 🚂 Train Scene -->
      <g v-else-if="sceneType === 'train'">
        <!-- Countryside sky -->
        <rect width="400" height="400" fill="#87CEEB" />
        <!-- Hills -->
        <ellipse cx="100" cy="420" rx="160" ry="100" fill="#5d8a3c" />
        <ellipse cx="320" cy="430" rx="140" ry="90" fill="#4a7a30" />
        <!-- Ground/Track base -->
        <rect x="0" y="310" width="400" height="90" fill="#8B7355" />
        <!-- Rail tracks -->
        <rect x="0" y="316" width="400" height="8" rx="2" fill="#555" />
        <rect x="0" y="336" width="400" height="8" rx="2" fill="#555" />
        <!-- Rail sleepers -->
        <rect x="15" y="312" width="18" height="36" rx="2" fill="#6b4c2a" />
        <rect x="55" y="312" width="18" height="36" rx="2" fill="#6b4c2a" />
        <rect x="95" y="312" width="18" height="36" rx="2" fill="#6b4c2a" />
        <rect x="135" y="312" width="18" height="36" rx="2" fill="#6b4c2a" />
        <rect x="175" y="312" width="18" height="36" rx="2" fill="#6b4c2a" />
        <rect x="215" y="312" width="18" height="36" rx="2" fill="#6b4c2a" />
        <rect x="255" y="312" width="18" height="36" rx="2" fill="#6b4c2a" />
        <rect x="295" y="312" width="18" height="36" rx="2" fill="#6b4c2a" />
        <rect x="335" y="312" width="18" height="36" rx="2" fill="#6b4c2a" />
        <rect x="375" y="312" width="18" height="36" rx="2" fill="#6b4c2a" />
        <!-- Train engine body -->
        <rect x="60" y="215" width="200" height="100" rx="12" :fill="getFill('primary')" />
        <!-- Cab -->
        <rect x="215" y="175" width="80" height="105" rx="10" :fill="getFill('secondary')" />
        <!-- Cab window -->
        <rect x="225" y="190" width="50" height="35" rx="6" :fill="getFill('accent')" />
        <!-- Boiler front plate -->
        <circle cx="80" cy="260" r="30" :fill="getFill('tertiary')" />
        <!-- Chimney -->
        <rect x="110" y="175" width="25" height="45" rx="5" fill="#444" />
        <ellipse cx="122" cy="175" rx="18" ry="8" fill="#333" />
        <!-- Steam puff -->
        <circle cx="122" cy="155" r="18" fill="white" opacity="0.7" />
        <circle cx="140" cy="140" r="14" fill="white" opacity="0.5" />
        <circle cx="155" cy="128" r="10" fill="white" opacity="0.3" />
        <!-- Wheels -->
        <circle cx="105" cy="316" r="28" fill="#333" />
        <circle cx="105" cy="316" r="18" fill="#888" />
        <circle cx="105" cy="316" r="6" fill="#555" />
        <circle cx="175" cy="316" r="22" fill="#333" />
        <circle cx="175" cy="316" r="13" fill="#888" />
        <circle cx="240" cy="316" r="22" fill="#333" />
        <circle cx="240" cy="316" r="13" fill="#888" />
        <!-- Connector rod -->
        <line x1="105" y1="316" x2="240" y2="316" stroke="#cc0000" stroke-width="8" />
      </g>

      <!-- 🌸 Flower Scene -->
      <g v-else-if="sceneType === 'flower'">
        <!-- Garden background -->
        <rect width="400" height="400" fill="#e8f5e9" />
        <!-- Sky portion -->
        <rect width="400" height="220" fill="#b3e5fc" />
        <!-- Sun -->
        <circle cx="60" cy="60" r="45" fill="#ffeb3b" opacity="0.9" />
        <!-- Sun rays -->
        <line x1="60" y1="5" x2="60" y2="-5" stroke="#ffeb3b" stroke-width="4" />
        <line x1="105" y1="15" x2="115" y2="5" stroke="#ffeb3b" stroke-width="4" />
        <line x1="115" y1="60" x2="125" y2="60" stroke="#ffeb3b" stroke-width="4" />
        <!-- Butterfly in background -->
        <ellipse cx="330" cy="90" rx="25" ry="18" fill="#ff80ab" opacity="0.6" />
        <ellipse cx="370" cy="90" rx="25" ry="18" fill="#ff80ab" opacity="0.6" />
        <ellipse cx="328" cy="110" rx="18" ry="14" fill="#f48fb1" opacity="0.6" />
        <ellipse cx="372" cy="110" rx="18" ry="14" fill="#f48fb1" opacity="0.6" />
        <line x1="350" y1="80" x2="350" y2="120" stroke="#333" stroke-width="3" />
        <!-- Grass -->
        <rect x="0" y="210" width="400" height="190" fill="#66bb6a" />
        <!-- Dirt -->
        <ellipse cx="200" cy="370" rx="80" ry="30" fill="#795548" opacity="0.6" />
        <!-- Flower stem -->
        <line x1="200" y1="380" x2="200" y2="230" stroke="#388e3c" stroke-width="12" stroke-linecap="round" />
        <!-- Leaves -->
        <ellipse cx="170" cy="310" rx="40" ry="18" fill="#4caf50" transform="rotate(-30 170 310)" />
        <ellipse cx="232" cy="290" rx="38" ry="16" fill="#43a047" transform="rotate(30 232 290)" />
        <!-- Flower petals (8 petals) -->
        <ellipse cx="200" cy="150" rx="30" ry="55" :fill="getFill('primary')" />
        <ellipse cx="200" cy="150" rx="30" ry="55" :fill="getFill('primary')" transform="rotate(45 200 200)" />
        <ellipse cx="200" cy="150" rx="30" ry="55" :fill="getFill('primary')" transform="rotate(90 200 200)" />
        <ellipse cx="200" cy="150" rx="30" ry="55" :fill="getFill('primary')" transform="rotate(135 200 200)" />
        <!-- Flower center -->
        <circle cx="200" cy="200" r="45" :fill="getFill('secondary')" />
        <!-- Center detail -->
        <circle cx="200" cy="200" r="30" :fill="getFill('tertiary')" opacity="0.7" />
        <!-- Pollen dots -->
        <circle cx="185" cy="190" r="5" :fill="getFill('accent')" />
        <circle cx="215" cy="190" r="5" :fill="getFill('accent')" />
        <circle cx="200" cy="215" r="5" :fill="getFill('accent')" />
        <circle cx="185" cy="212" r="4" :fill="getFill('accent')" />
        <circle cx="215" cy="212" r="4" :fill="getFill('accent')" />
      </g>

    </g>

    <!-- Invisible Hitboxes for drag-and-drop mechanics -->
    <g v-if="!clipTarget && holes">
      <circle 
        v-for="(h, index) in holes" 
        :key="'hitbox-' + h.id" 
        class="hole-hitbox"
        :class="{ 'prompt-pulse': index === 0 && promptLevel === 'partial' }"
        :data-target-id="h.id"
        :cx="h.cx" 
        :cy="h.cy" 
        :r="h.radius" 
        fill="transparent" 
        stroke="none"
      />
    </g>
  </svg>
</template>

<style scoped>
.scene-svg {
  width: 100%;
  height: 100%;
  display: block;
}

@keyframes svg-pulse {
  0%, 100% { fill: transparent; }
  50% { fill: rgba(255, 215, 0, 0.4); }
}

.prompt-pulse {
  animation: svg-pulse 2s infinite;
}
</style>
