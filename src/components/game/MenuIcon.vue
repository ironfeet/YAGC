<script setup lang="ts">
defineProps<{
  gameId: string;
}>();
</script>

<template>
  <svg viewBox="0 0 100 100" class="menu-icon" xmlns="http://www.w3.org/2000/svg">
    <!-- Common definition for dropshadows to make icons pop -->
    <defs>
      <filter id="icon-shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#000000" flood-opacity="0.25"/>
      </filter>
    </defs>

    <g filter="url(#icon-shadow)">
      
      <!-- Tier 1: Patches (Puzzle Piece with hole) -->
      <g v-if="gameId === 'tier1-patches'">
        <path d="M 20,30 L 40,30 A 10,10 0 1,0 60,30 L 80,30 L 80,45 A 10,10 0 1,1 80,65 L 80,80 L 60,80 A 10,10 0 1,0 40,80 L 20,80 Z" fill="white" stroke="rgba(255,255,255,0.8)" stroke-width="4" stroke-linejoin="round" />
        <circle cx="50" cy="55" r="10" fill="rgba(0,0,0,0.15)" stroke="white" stroke-width="2" stroke-dasharray="4,2" />
      </g>

      <!-- Tier 1: Outlines (Dashed Silhouette) -->
      <g v-else-if="gameId === 'tier1-outlines'">
        <polygon points="50,15 61,40 90,40 66,58 75,85 50,68 25,85 34,58 10,40 39,40" fill="rgba(255,255,255,0.2)" stroke="white" stroke-width="4" stroke-dasharray="6,4" stroke-linejoin="round" />
        <polygon points="50,15 61,40 90,40 66,58 75,85 50,68 25,85 34,58 10,40 39,40" fill="white" transform="scale(0.5) translate(80, 20)" stroke-linejoin="round" />
        <path d="M 65,30 L 55,40" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" />
      </g>

      <!-- Tier 1: Matching Cars -->
      <g v-else-if="gameId === 'tier1-matching-cars' || gameId === 'tier1-matchingcars'">
        <!-- Car 1 (Back) -->
        <path d="M 30,30 L 45,15 L 75,15 L 85,30 L 95,30 L 95,50 L 25,50 Z" fill="rgba(255,255,255,0.4)" stroke-linejoin="round" />
        <circle cx="40" cy="50" r="10" fill="rgba(255,255,255,0.4)" />
        <circle cx="80" cy="50" r="10" fill="rgba(255,255,255,0.4)" />
        <!-- Car 2 (Front) -->
        <path d="M 15,55 L 30,40 L 60,40 L 70,55 L 80,55 L 80,75 L 10,75 Z" fill="white" stroke-linejoin="round" />
        <circle cx="25" cy="75" r="10" fill="#333" />
        <circle cx="65" cy="75" r="10" fill="#333" />
        <rect x="35" y="42" width="20" height="10" fill="rgba(0,0,0,0.2)" rx="2" />
      </g>

      <!-- Tier 1: Matching Animals (Rabbit faces) -->
      <g v-else-if="gameId === 'tier1-matching-animals' || gameId === 'tier1-matchinganimals'">
        <!-- Animal 1 (Back) -->
        <ellipse cx="65" cy="45" rx="20" ry="18" fill="rgba(255,255,255,0.4)" />
        <ellipse cx="55" cy="20" rx="6" ry="15" fill="rgba(255,255,255,0.4)" transform="rotate(-15 55 20)" />
        <ellipse cx="75" cy="20" rx="6" ry="15" fill="rgba(255,255,255,0.4)" transform="rotate(15 75 20)" />
        <!-- Animal 2 (Front) -->
        <ellipse cx="40" cy="65" rx="25" ry="22" fill="white" />
        <ellipse cx="28" cy="35" rx="8" ry="20" fill="white" transform="rotate(-15 28 35)" />
        <ellipse cx="52" cy="35" rx="8" ry="20" fill="white" transform="rotate(15 52 35)" />
        <ellipse cx="28" cy="35" rx="4" ry="12" fill="rgba(0,0,0,0.1)" transform="rotate(-15 28 35)" />
        <ellipse cx="52" cy="35" rx="4" ry="12" fill="rgba(0,0,0,0.1)" transform="rotate(15 52 35)" />
        <circle cx="33" cy="60" r="3" fill="#333" />
        <circle cx="47" cy="60" r="3" fill="#333" />
        <ellipse cx="40" cy="68" rx="4" ry="3" fill="rgba(0,0,0,0.2)" />
      </g>

      <!-- Tier 1: Basic Language (Speech bubble + Object) -->
      <g v-else-if="gameId === 'tier1-basiclanguage'">
        <path d="M 15,45 C 15,20 85,20 85,45 C 85,70 60,75 40,85 C 40,75 30,70 15,65 Z" fill="white" stroke-linejoin="round" />
        <!-- Apple inside -->
        <path d="M 50,40 C 35,30 30,55 50,70 C 70,55 65,30 50,40 Z" fill="rgba(0,0,0,0.2)" />
        <path d="M 50,40 Q 55,30 60,25" fill="none" stroke="rgba(0,0,0,0.2)" stroke-width="3" stroke-linecap="round" />
      </g>

      <!-- Tier 2: Combine Elephants -->
      <g v-else-if="gameId === 'tier2-combine-elephants'">
        <!-- Left Half -->
        <path d="M 45,80 L 45,20 C 20,20 10,40 10,50 L 25,50 C 20,60 30,70 45,80 Z" fill="rgba(255,255,255,0.7)" />
        <circle cx="35" cy="40" r="4" fill="#333" />
        <!-- Right Half (Dragging in) -->
        <path d="M 60,70 L 60,10 C 85,10 95,30 95,40 L 80,40 C 85,50 75,60 60,70 Z" fill="white" />
        <circle cx="70" cy="30" r="4" fill="#333" />
        <!-- Combine Arrow -->
        <path d="M 55,45 L 48,45 M 52,41 L 48,45 L 52,49" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
      </g>

      <!-- Tier 2: Combine Butterflies -->
      <g v-else-if="gameId === 'tier2-combine-butterflies'">
        <!-- Left Wing -->
        <path d="M 48,50 C 10,10 10,50 48,50 C 20,60 20,90 48,50 Z" fill="rgba(255,255,255,0.6)" stroke="white" stroke-width="2" />
        <!-- Right Wing -->
        <path d="M 52,50 C 90,10 90,50 52,50 C 80,60 80,90 52,50 Z" fill="white" />
        <ellipse cx="50" cy="50" rx="3" ry="15" fill="#333" />
        <path d="M 50,35 Q 40,20 35,25 M 50,35 Q 60,20 65,25" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" />
      </g>

      <!-- Tier 2: Combine Trains -->
      <g v-else-if="gameId === 'tier2-combine-trains'">
        <!-- Engine -->
        <rect x="15" y="45" width="25" height="25" fill="rgba(255,255,255,0.6)" rx="2" />
        <rect x="25" y="30" width="15" height="15" fill="rgba(255,255,255,0.6)" rx="2" />
        <circle cx="22" cy="70" r="6" fill="#333" />
        <circle cx="33" cy="70" r="6" fill="#333" />
        <!-- Link -->
        <line x1="40" y1="65" x2="60" y2="65" stroke="white" stroke-width="4" stroke-linecap="round" />
        <!-- Cargo Car -->
        <rect x="60" y="45" width="30" height="25" fill="white" rx="2" />
        <circle cx="70" cy="70" r="6" fill="#333" />
        <circle cx="80" cy="70" r="6" fill="#333" />
      </g>

      <!-- Tier 2: Odd One Out -->
      <g v-else-if="gameId === 'tier2-odd-one-out'">
        <circle cx="30" cy="30" r="15" fill="rgba(255,255,255,0.6)" />
        <circle cx="70" cy="30" r="15" fill="rgba(255,255,255,0.6)" />
        <circle cx="30" cy="70" r="15" fill="rgba(255,255,255,0.6)" />
        <!-- The Odd One (Square with highlight) -->
        <rect x="55" y="55" width="30" height="30" fill="white" rx="4" />
        <circle cx="70" cy="70" r="22" fill="none" stroke="rgba(0,0,0,0.2)" stroke-width="4" stroke-dasharray="4,4" />
      </g>

      <!-- Tier 3: Combine Toys -->
      <g v-else-if="gameId === 'tier3-combinetoys'">
        <!-- A simple grid or toys overlay representing combinations -->
        <!-- Box -->
        <rect x="20" y="20" width="60" height="60" fill="rgba(255,255,255,0.3)" rx="8" />
        <line x1="50" y1="20" x2="50" y2="80" stroke="white" stroke-width="4" />
        <line x1="20" y1="50" x2="80" y2="50" stroke="white" stroke-width="4" />
        <!-- Toy representation -->
        <circle cx="35" cy="35" r="10" fill="white" />
        <rect x="55" y="25" width="20" height="20" fill="white" rx="3" />
        <!-- Completed combination -->
        <circle cx="65" cy="65" r="10" fill="white" />
        <rect x="55" y="55" width="20" height="20" fill="rgba(255,255,255,0.5)" rx="3" />
      </g>

      <!-- Tier 2: Count Everything -->
      <g v-else-if="gameId === 'tier2-count-everything'">
        <!-- Numbers -->
        <text x="25" y="40" font-size="30" font-weight="900" fill="rgba(255,255,255,0.7)" text-anchor="middle" font-family="sans-serif">1</text>
        <text x="75" y="50" font-size="35" font-weight="900" fill="rgba(255,255,255,0.9)" text-anchor="middle" font-family="sans-serif">2</text>
        <text x="45" y="85" font-size="40" font-weight="900" fill="white" text-anchor="middle" font-family="sans-serif">3</text>
        <!-- Counting dots -->
        <circle cx="15" cy="20" r="4" fill="white" />
        <circle cx="85" cy="20" r="4" fill="white" />
        <circle cx="75" cy="15" r="4" fill="white" />
      </g>

      <!-- Tier 2: Arithmetics -->
      <g v-else-if="gameId === 'tier2-arithmetics'">
        <!-- Plus -->
        <rect x="20" y="45" width="30" height="10" fill="white" rx="3" />
        <rect x="30" y="35" width="10" height="30" fill="white" rx="3" />
        <!-- Equals -->
        <rect x="60" y="40" width="25" height="8" fill="white" rx="3" />
        <rect x="60" y="55" width="25" height="8" fill="white" rx="3" />
        <!-- Sparkles -->
        <circle cx="75" cy="25" r="3" fill="rgba(255,255,255,0.8)" />
        <circle cx="20" cy="75" r="4" fill="rgba(255,255,255,0.8)" />
      </g>

      <!-- Tier 3: Spatial Prepositions (Ball in/on Box) -->
      <g v-else-if="gameId === 'tier3-spatial-prepositions'">
        <!-- Box -->
        <polygon points="20,50 50,35 80,50 80,80 50,95 20,80" fill="rgba(255,255,255,0.4)" stroke="white" stroke-width="3" stroke-linejoin="round" />
        <polygon points="20,50 50,65 80,50 50,35" fill="rgba(255,255,255,0.6)" stroke="white" stroke-width="3" stroke-linejoin="round" />
        <!-- Line in box -->
        <line x1="50" y1="65" x2="50" y2="95" stroke="white" stroke-width="3" stroke-linecap="round" />
        <!-- Ball hovering over -->
        <circle cx="50" cy="20" r="12" fill="white" />
        <!-- Motion lines -->
        <line x1="50" y1="35" x2="50" y2="45" stroke="white" stroke-width="3" stroke-dasharray="4,4" stroke-linecap="round" />
      </g>

      <!-- Tier 3: Perspective Taking (Eye & Isometric Shape) -->
      <g v-else-if="gameId === 'tier3-perspectivetaking'">
        <!-- Isometric shape -->
        <polygon points="50,40 70,50 70,75 50,85 30,75 30,50" fill="rgba(255,255,255,0.4)" stroke="white" stroke-width="3" stroke-linejoin="round" />
        <polygon points="50,40 70,50 50,60 30,50" fill="white" stroke="white" stroke-width="3" stroke-linejoin="round" />
        <line x1="50" y1="60" x2="50" y2="85" stroke="white" stroke-width="3" />
        <!-- Eye symbol looking from side -->
        <path d="M 75,25 C 85,15 95,25 95,25 C 95,25 85,35 75,25 Z" fill="white" transform="rotate(-30 85 25)" />
        <circle cx="83" cy="27" r="3" fill="#333" />
        <!-- View rays -->
        <line x1="75" y1="35" x2="60" y2="45" stroke="white" stroke-width="2" stroke-dasharray="3,3" />
      </g>

      <!-- Tier 3: Auditory Memory (Headphones/Sound) -->
      <g v-else-if="gameId === 'tier3-auditory-memory'">
        <!-- Headphones -->
        <path d="M 25,60 L 25,45 C 25,25 75,25 75,45 L 75,60" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="8" stroke-linecap="round" />
        <rect x="15" y="50" width="15" height="30" fill="white" rx="5" />
        <rect x="70" y="50" width="15" height="30" fill="white" rx="5" />
        <!-- Sound Waves -->
        <path d="M 40,55 A 15,15 0 0,1 60,55" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" />
        <path d="M 45,65 A 5,5 0 0,1 55,65" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" />
      </g>

      <!-- Tier 3: Flexible Language & Memory (Brain & Speech) -->
      <g v-else-if="gameId === 'tier3-flexible-language-memory'">
        <!-- Brain -->
        <path d="M 30,50 C 20,40 30,20 50,30 C 70,20 80,40 70,50 C 85,60 75,80 50,75 C 25,80 15,60 30,50 Z" fill="rgba(255,255,255,0.4)" stroke="white" stroke-width="3" stroke-linejoin="round" />
        <path d="M 40,30 C 45,45 55,45 60,30 M 35,50 C 45,55 55,55 65,50 M 40,70 C 45,60 55,60 60,70" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" />
        <!-- Speech Bubble Spark -->
        <path d="M 65,15 C 65,5 90,5 90,15 C 90,25 80,25 70,30 C 70,25 65,25 65,15 Z" fill="white" />
      </g>

      <!-- Tier 3: Nested Logic (House within house) -->
      <g v-else-if="gameId === 'tier3-nested-logic'">
        <!-- Outer House -->
        <polygon points="15,50 50,15 85,50" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="6" stroke-linejoin="round" />
        <rect x="25" y="50" width="50" height="40" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="6" stroke-linejoin="round" />
        <!-- Inner House -->
        <polygon points="35,60 50,45 65,60" fill="white" stroke-linejoin="round" />
        <rect x="40" y="60" width="20" height="20" fill="white" stroke-linejoin="round" />
        <rect x="47" y="68" width="6" height="12" fill="rgba(0,0,0,0.3)" />
      </g>

      <!-- Tier 3: Analogies (A:B :: C:D mapping) -->
      <g v-else-if="gameId === 'tier3-analogies'">
        <!-- A -> B -->
        <rect x="15" y="20" width="25" height="25" fill="white" rx="4" />
        <path d="M 45,32 L 55,32 L 50,28 M 55,32 L 50,36" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
        <rect x="60" y="20" width="25" height="25" fill="rgba(255,255,255,0.3)" stroke="white" stroke-width="3" rx="4" />
        
        <!-- C -> D -->
        <circle cx="27" cy="70" r="13" fill="white" />
        <path d="M 45,70 L 55,70 L 50,66 M 55,70 L 50,74" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
        <circle cx="72" cy="70" r="13" fill="rgba(255,255,255,0.3)" stroke="white" stroke-width="3" stroke-dasharray="4,3" />
      </g>

      <!-- Tier 3: Time Prepositions -->
      <g v-else-if="gameId === 'tier3-timeprepositions'">
        <circle cx="50" cy="50" r="35" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="6" />
        <line x1="50" y1="50" x2="50" y2="25" stroke="white" stroke-width="5" stroke-linecap="round" />
        <line x1="50" y1="50" x2="65" y2="50" stroke="white" stroke-width="4" stroke-linecap="round" />
        <circle cx="50" cy="50" r="4" fill="white" />
        <!-- Arrows indicating flow of time -->
        <path d="M 20,50 A 30,30 0 0,1 50,20" fill="none" stroke="white" stroke-width="4" stroke-linecap="round" />
        <polygon points="50,15 50,25 55,20" fill="white" />
      </g>

      <!-- Tier 3: Time Prepositions: Memory -->
      <g v-else-if="gameId === 'tier3-timeprepositions-memory'">
        <!-- Hourglass Base -->
        <path d="M 30,15 L 70,15 L 65,30 L 50,50 L 35,30 Z" fill="rgba(255,255,255,0.4)" />
        <path d="M 30,85 L 70,85 L 65,70 L 50,50 L 35,70 Z" fill="rgba(255,255,255,0.4)" />
        <path d="M 25,10 L 75,10 M 25,90 L 75,90" fill="none" stroke="white" stroke-width="6" stroke-linecap="round" />
        <!-- Sand -->
        <polygon points="40,25 60,25 50,40" fill="white" />
        <line x1="50" y1="40" x2="50" y2="80" stroke="white" stroke-width="2" />
        <polygon points="40,85 60,85 50,65" fill="white" />
        <!-- Memory Node (Star) -->
        <polygon points="75,30 78,40 88,40 80,48 83,58 75,52 67,58 70,48 62,40 72,40" fill="#FFC107" />
      </g>

      <!-- Tier 3: Passive Verb Tense (A -> B Arrow Reversal) -->
      <g v-else-if="gameId === 'tier3-passiveverbtense'">
        <!-- Agent A -->
        <rect x="15" y="35" width="20" height="30" fill="white" rx="4" />
        <!-- Patient B -->
        <circle cx="80" cy="50" r="15" fill="rgba(255,255,255,0.4)" stroke="white" stroke-width="3" />
        <!-- Top Arrow -->
        <path d="M 35,40 C 50,25 65,25 70,35" fill="none" stroke="white" stroke-width="4" stroke-linecap="round" />
        <polygon points="70,35 60,30 65,40" fill="white" />
        <!-- Bottom Arrow (Reverse/Passive) -->
        <path d="M 70,65 C 55,80 40,80 30,65" fill="none" stroke="white" stroke-width="4" stroke-linecap="round" stroke-dasharray="6,4" />
        <polygon points="30,65 35,60 40,70" fill="white" />
      </g>

      <!-- Tier 3: Catch Up Game: Memory (Footprints/Running) -->
      <g v-else-if="gameId === 'tier3-catchup-memory'">
        <!-- Figure 1 -->
        <circle cx="30" cy="30" r="8" fill="rgba(255,255,255,0.5)" />
        <path d="M 30,40 L 30,60 L 20,75 M 30,60 L 40,75 M 20,45 L 40,45" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
        <!-- Figure 2 (Chasing) -->
        <circle cx="65" cy="40" r="10" fill="white" />
        <path d="M 65,55 L 60,75 L 50,90 M 60,75 L 75,90 M 50,60 L 80,50" fill="none" stroke="white" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />
        <!-- Motion lines -->
        <line x1="85" y1="40" x2="95" y2="40" stroke="white" stroke-width="3" stroke-linecap="round" />
        <line x1="80" y1="55" x2="90" y2="55" stroke="white" stroke-width="3" stroke-linecap="round" />
      </g>

      <!-- Tier 3: Subject Object -->
      <g v-else-if="gameId === 'tier3-subjectobject'">
        <!-- Dog outline -->
        <path d="M 15,60 Q 15,30 40,30 Q 60,30 60,50 L 60,80 L 45,80 L 45,65 L 30,65 L 30,80 L 15,80 Z" fill="rgba(255,255,255,0.3)" stroke="white" stroke-width="3" />
        <circle cx="25" cy="45" r="4" fill="white" />
        <path d="M 55,40 L 70,30 L 65,50 Z" fill="white" />
        <!-- Cat outline (Target) -->
        <path d="M 70,80 Q 70,50 85,50 Q 95,50 95,70 L 95,80 L 85,80 L 85,75 L 75,75 L 75,80 Z" fill="white" />
        <!-- Interaction Arrow -->
        <path d="M 45,35 C 55,25 65,25 75,40" fill="none" stroke="white" stroke-width="4" stroke-linecap="round" />
        <polygon points="75,40 65,35 70,45" fill="white" />
      </g>

      <!-- Tier 3: Subject Object: Memory -->
      <g v-else-if="gameId === 'tier3-subjectobject-memory'">
        <!-- Interaction block -->
        <rect x="20" y="40" width="25" height="25" fill="rgba(255,255,255,0.4)" rx="4" />
        <rect x="55" y="40" width="25" height="25" fill="white" rx="4" />
        <path d="M 45,52 L 50,52 L 48,48 M 50,52 L 48,56" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
        <!-- Memory Cloud overlay -->
        <path d="M 30,30 C 20,20 40,10 50,20 C 60,10 80,20 70,30 C 85,40 75,60 50,50 C 25,60 15,40 30,30 Z" fill="none" stroke="#FFC107" stroke-width="4" stroke-dasharray="4,4" />
      </g>

      <!-- Tier 3: Carries Or Rides -->
      <g v-else-if="gameId === 'tier3-carriesorrides'">
        <!-- Carrier (Base Animal) -->
        <path d="M 20,80 C 20,40 80,40 80,80" fill="rgba(255,255,255,0.4)" stroke="white" stroke-width="4" />
        <rect x="25" y="80" width="10" height="15" fill="rgba(255,255,255,0.4)" />
        <rect x="65" y="80" width="10" height="15" fill="rgba(255,255,255,0.4)" />
        <!-- Rider (Top Animal) -->
        <path d="M 40,40 C 40,15 60,15 60,40" fill="white" />
        <!-- Arrow showing mounting -->
        <path d="M 50,15 L 50,30 M 45,25 L 50,30 L 55,25" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
      </g>

      <!-- Tier 3: Carries Or Rides: Memory -->
      <g v-else-if="gameId === 'tier3-carriesorrides-memory'">
        <!-- Carrier & Rider Base -->
        <path d="M 25,75 C 25,45 75,45 75,75" fill="rgba(255,255,255,0.4)" />
        <circle cx="50" cy="35" r="15" fill="white" />
        <!-- Memory Star / Magic effect -->
        <polygon points="80,20 83,30 93,30 85,38 88,48 80,42 72,48 75,38 67,30 77,30" fill="#FFC107" />
        <circle cx="25" cy="25" r="3" fill="white" />
        <circle cx="15" cy="45" r="2" fill="white" />
      </g>

      <!-- Tier 3: Selective Attention (Grid with Target) -->
      <g v-else-if="gameId === 'tier3-selectiveattention'">
        <!-- Distractors -->
        <circle cx="25" cy="25" r="8" fill="rgba(255,255,255,0.3)" />
        <rect x="70" y="15" width="15" height="15" fill="rgba(255,255,255,0.3)" />
        <polygon points="25,65 15,85 35,85" fill="rgba(255,255,255,0.3)" />
        <circle cx="80" cy="80" r="8" fill="rgba(255,255,255,0.3)" />
        <!-- Target in middle -->
        <polygon points="50,40 60,55 40,55" fill="white" />
        <!-- Magnifying Glass -->
        <circle cx="50" cy="50" r="18" fill="none" stroke="#FFC107" stroke-width="4" />
        <line x1="63" y1="63" x2="80" y2="80" stroke="#FFC107" stroke-width="6" stroke-linecap="round" />
      </g>

      <!-- Fun: Animal Jigsaw -->
      <g v-else-if="gameId === 'fun-jigsaw' || gameId === 'fun-animal-jigsaw'">
        <!-- Animal Jigsaw: A bear silhouette with puzzle cut lines -->
        <path d="M 30,30 C 20,20 10,30 20,40 C 10,50 10,80 50,80 C 90,80 90,50 80,40 C 90,30 80,20 70,30 C 60,20 40,20 30,30 Z" fill="white" />
        
        <!-- Jigsaw cut lines dividing the bear into 4 pieces -->
        <path d="M 50,22 L 50,35 A 5,5 0 1,1 50,45 L 50,80" fill="none" stroke="rgba(0,0,0,0.15)" stroke-width="2.5" stroke-linecap="round" />
        <path d="M 13,60 L 35,60 A 5,5 0 1,0 45,60 L 50,60 M 50,60 L 65,60 A 5,5 0 1,1 75,60 L 87,60" fill="none" stroke="rgba(0,0,0,0.15)" stroke-width="2.5" stroke-linecap="round" />
        
        <!-- Eyes & Nose -->
        <circle cx="35" cy="45" r="3.5" fill="rgba(0,0,0,0.25)" />
        <circle cx="65" cy="45" r="3.5" fill="rgba(0,0,0,0.25)" />
        <path d="M 53,50 L 47,50 L 50,54 Z" fill="rgba(0,0,0,0.25)" />
      </g>

      <!-- Fun: Vehicle Jigsaw -->
      <g v-else-if="gameId === 'fun-vehicle-jigsaw'">
        <!-- Car Silhouette -->
        <path d="M 20,60 L 30,40 L 65,40 L 80,60 L 85,60 L 85,80 L 15,80 L 15,60 Z" fill="white" />
        <circle cx="30" cy="80" r="10" fill="white" />
        <circle cx="70" cy="80" r="10" fill="white" />
        <circle cx="30" cy="80" r="4" fill="rgba(0,0,0,0.25)" />
        <circle cx="70" cy="80" r="4" fill="rgba(0,0,0,0.25)" />
        <!-- Window cutout -->
        <polygon points="35,45 60,45 70,60 30,60" fill="rgba(0,0,0,0.2)" />
        <!-- Puzzle cut lines -->
        <path d="M 50,40 L 50,50 A 5,5 0 1,0 50,60 L 50,85" fill="none" stroke="rgba(0,0,0,0.15)" stroke-width="2.5" stroke-linecap="round" />
        <path d="M 17,65 L 35,65 A 5,5 0 1,1 45,65 L 83,65" fill="none" stroke="rgba(0,0,0,0.15)" stroke-width="2.5" stroke-linecap="round" />
      </g>

      <!-- Fun: Number Puzzle -->
      <g v-else-if="gameId === 'fun-number-puzzle'">
        <!-- Big '1' -->
        <path d="M 40,30 L 55,20 L 55,75 M 40,75 L 70,75" fill="none" stroke="white" stroke-width="14" stroke-linecap="round" stroke-linejoin="round" />
        <!-- Puzzle cut line through the 1 -->
        <path d="M 30,50 L 45,50 A 5,5 0 1,0 55,50 L 75,50" fill="none" stroke="rgba(0,0,0,0.15)" stroke-width="2.5" stroke-linecap="round" />
        <!-- Floating puzzle piece -->
        <rect x="65" y="20" width="15" height="15" fill="rgba(255,255,255,0.4)" rx="2" />
        <circle cx="72.5" cy="20" r="4" fill="rgba(255,255,255,0.4)" />
        <circle cx="80" cy="27.5" r="4" fill="rgba(255,255,255,0.4)" />
      </g>

      <!-- Fun: Color Board -->
      <g v-else-if="gameId === 'fun-color-board'">
        <!-- Paint Palette -->
        <path d="M 80,45 C 80,75 55,85 45,85 C 15,85 15,55 25,35 C 35,15 70,15 80,45 Z" fill="white" />
        <!-- Thumb hole -->
        <circle cx="35" cy="65" r="6" fill="rgba(0,0,0,0.2)" />
        <!-- Color blobs -->
        <circle cx="35" cy="35" r="5" fill="rgba(0,0,0,0.1)" />
        <circle cx="55" cy="25" r="5" fill="rgba(0,0,0,0.2)" />
        <circle cx="70" cy="45" r="5" fill="rgba(0,0,0,0.3)" />
        <circle cx="65" cy="65" r="5" fill="rgba(0,0,0,0.15)" />
        <!-- Puzzle cut lines -->
        <path d="M 50,18 L 50,30 A 5,5 0 1,0 50,40 L 50,85" fill="none" stroke="rgba(0,0,0,0.15)" stroke-width="2.5" stroke-linecap="round" />
        <path d="M 18,50 L 30,50 A 5,5 0 1,1 40,50 L 82,50" fill="none" stroke="rgba(0,0,0,0.15)" stroke-width="2.5" stroke-linecap="round" />
      </g>

      <!-- Fun: Nature Jigsaw -->
      <g v-else-if="gameId === 'fun-nature-jigsaw'">
        <!-- Tree -->
        <path d="M 45,80 L 45,55 L 55,55 L 55,80 Z" fill="rgba(255,255,255,0.6)" />
        <path d="M 50,15 C 20,15 20,50 50,60 C 80,50 80,15 50,15 Z" fill="white" />
        <!-- Leaf details -->
        <circle cx="40" cy="30" r="12" fill="white" />
        <circle cx="60" cy="35" r="15" fill="white" />
        <circle cx="50" cy="20" r="14" fill="white" />
        <!-- Puzzle cut lines -->
        <path d="M 50,10 L 50,25 A 4,4 0 1,1 50,33 L 50,60" fill="none" stroke="rgba(0,0,0,0.15)" stroke-width="2.5" stroke-linecap="round" />
        <path d="M 23,40 L 35,40 A 4,4 0 1,0 43,40 L 50,40 M 50,40 L 60,40 A 4,4 0 1,1 68,40 L 78,40" fill="none" stroke="rgba(0,0,0,0.15)" stroke-width="2.5" stroke-linecap="round" />
      </g>

      <!-- Fun: Shape Sorter -->
      <g v-else-if="gameId === 'fun-shape-sorter'">
        <!-- Triangle -->
        <polygon points="30,20 45,45 15,45" fill="white" />
        <!-- Circle -->
        <circle cx="70" cy="30" r="12" fill="white" />
        <!-- Square -->
        <rect x="40" y="60" width="20" height="20" fill="white" rx="2" />
        
        <!-- Shape Cutouts -->
        <polygon points="30,28 38,40 22,40" fill="rgba(0,0,0,0.2)" />
        <circle cx="70" cy="30" r="5" fill="rgba(0,0,0,0.2)" />
        <rect x="45" y="65" width="10" height="10" fill="rgba(0,0,0,0.2)" rx="1" />
      </g>

      <!-- Fallback -->
      <g v-else>
        <circle cx="50" cy="50" r="35" fill="rgba(255,255,255,0.2)" stroke="white" stroke-width="4" stroke-dasharray="10,5" />
        <text x="50" y="65" font-size="40" text-anchor="middle" fill="white" font-family="sans-serif" font-weight="bold">?</text>
      </g>

    </g>
  </svg>
</template>

<style scoped>
.menu-icon {
  width: 100%;
  height: 100%;
  display: block;
}
</style>