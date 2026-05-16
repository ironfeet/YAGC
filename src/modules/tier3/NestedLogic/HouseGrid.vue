<script setup lang="ts">
import AssetLibrary from '../../../components/game/AssetLibrary.vue';
import type { HouseCell, NestedAnimal } from '../../../types';

defineProps<{
  rows: number;
  cols: number;
  cells: HouseCell[];
  animals: NestedAnimal[];
  // Maps zoneId → animalId for currently placed animals
  placedGrid: Map<string, string>;
  lockedCells: Set<string>;   // Cells that completed correctly (green glow)
  shakingCells: Set<string>;  // Cells that are wrong (shake animation)
  successMode: boolean;
}>();

defineEmits<{
  (e: 'zone-drop', zoneId: string, animalId: string): void;
  (e: 'zone-pickup', zoneId: string): void;
}>();

// Row background tints — top floor is lightest
const rowBg = (row: number): string => {
  const tints = [
    'rgba(219,234,254,0.5)', // blue-100
    'rgba(220,252,231,0.5)', // green-100
    'rgba(254,243,199,0.5)', // yellow-100
    'rgba(252,231,243,0.5)', // pink-100
  ];
  return tints[row % tints.length];
};
</script>

<template>
  <div class="house-wrapper">
    <!-- Roof -->
    <div class="house-roof">
      <svg viewBox="0 0 400 80" preserveAspectRatio="none" class="roof-svg">
        <polygon points="0,80 200,0 400,80" fill="#b91c1c" />
        <polygon points="10,80 200,8 390,80" fill="#dc2626" />
        <!-- Chimney -->
        <rect x="280" y="0" width="30" height="45" fill="#7f1d1d" />
        <rect x="275" y="0" width="40" height="8" fill="#991b1b" />
      </svg>
    </div>

    <!-- House body -->
    <div class="house-body" :style="{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)` }">
      <!-- Dividers between floors -->
      <div v-for="r in rows - 1" :key="'floor-' + r" class="floor-beam" :style="{ gridColumn: `1 / span ${cols}`, gridRow: r + 1 }"></div>

      <!-- Room cells -->
      <div
        v-for="cell in cells"
        :key="cell.zoneId"
        class="room-cell"
        :class="{
          'cell-locked': lockedCells.has(cell.zoneId),
          'cell-shaking': shakingCells.has(cell.zoneId),
          'cell-success': successMode && lockedCells.has(cell.zoneId),
          'cell-occupied': !!placedGrid.get(cell.zoneId),
        }"
        :style="{
          gridColumn: cell.col + 1,
          gridRow: cell.row + 1,
          background: rowBg(cell.row),
        }"
        :data-zone-id="cell.zoneId"
        @dragover.prevent
        @drop.prevent="(e: DragEvent) => {
          const id = e.dataTransfer?.getData('animalId');
          if (id) $emit('zone-drop', cell.zoneId, id);
        }"
        @pointerup="() => { /* touch handled by useTouchDrag in parent */ }"
      >
        <!-- Window decoration -->
        <div class="room-window">
          <div class="window-pane"></div>
          <div class="window-pane"></div>
          <div class="window-sill"></div>
        </div>

        <!-- Placed animal (Behind) -->
        <transition name="pop">
          <div
            v-if="placedGrid.get(cell.zoneId + '-behind')"
            class="placed-animal placed-behind"
            :class="{ 'animal-jump': successMode }"
            @pointerdown.stop
            @dragstart="(e: DragEvent) => {
              if (e.dataTransfer) e.dataTransfer.setData('animalId', placedGrid.get(cell.zoneId + '-behind')!);
              $emit('zone-pickup', cell.zoneId + '-behind');
            }"
            draggable="true"
          >
            <AssetLibrary
              :name="animals.find(a => a.id === placedGrid.get(cell.zoneId + '-behind'))?.noun ?? 'dog'"
              :color="animals.find(a => a.id === placedGrid.get(cell.zoneId + '-behind'))?.color"
              size="large"
            />
          </div>
        </transition>

        <!-- Placed animal (Front) -->
        <transition name="pop">
          <div
            v-if="placedGrid.get(cell.zoneId)"
            class="placed-animal"
            :class="{ 'animal-jump': successMode }"
            @pointerdown.stop
            @dragstart="(e: DragEvent) => {
              if (e.dataTransfer) e.dataTransfer.setData('animalId', placedGrid.get(cell.zoneId)!);
              $emit('zone-pickup', cell.zoneId);
            }"
            draggable="true"
          >
            <AssetLibrary
              :name="animals.find(a => a.id === placedGrid.get(cell.zoneId))?.noun ?? 'dog'"
              :color="animals.find(a => a.id === placedGrid.get(cell.zoneId))?.color"
              size="large"
            />
          </div>
        </transition>

        <!-- Empty drop hint -->
        <div v-if="!placedGrid.get(cell.zoneId)" class="drop-hint">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(100,116,139,0.5)" stroke-width="1.5" stroke-dasharray="4 2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 8v8M8 12h8"/>
          </svg>
        </div>

        <!-- Floor label -->
        <div class="floor-label">{{ rows - cell.row === 1 ? 'Ground' : `Floor ${rows - cell.row - 1}` }}</div>
      </div>
    </div>

    <!-- House foundation -->
    <div class="house-foundation"></div>
  </div>
</template>

<style scoped>
.house-wrapper {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: 100%;
  max-width: 700px;
  filter: drop-shadow(0 12px 32px rgba(0,0,0,0.4));
}

/* ── Roof ──────────────────────────────────────────────────────────────────── */
.house-roof {
  width: 100%;
  height: 80px;
  flex-shrink: 0;
}
.roof-svg { width: 100%; height: 100%; display: block; }

/* ── Body ──────────────────────────────────────────────────────────────────── */
.house-body {
  display: grid;
  border-left: 6px solid #92400e;
  border-right: 6px solid #92400e;
  background: #fef3c7;
  position: relative;
}

/* ── Room ──────────────────────────────────────────────────────────────────── */
.room-cell {
  position: relative;
  min-height: 180px;
  border: 3px dashed rgba(100,116,139,0.3);
  border-radius: 8px;
  margin: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  cursor: default;
  transition: border-color 0.25s, background 0.25s, box-shadow 0.25s;
  overflow: hidden;
}
.room-cell:not(.cell-occupied):hover {
  border-color: rgba(59,130,246,0.6);
  background: rgba(219,234,254,0.7) !important;
}
.room-cell.cell-occupied { border-style: solid; border-color: rgba(100,116,139,0.4); }
.room-cell.cell-locked {
  border-color: #22c55e;
  border-style: solid;
  box-shadow: inset 0 0 20px rgba(34,197,94,0.2), 0 0 12px rgba(34,197,94,0.3);
}
.room-cell.cell-shaking { animation: cell-shake 0.45s ease; }
@keyframes cell-shake {
  0%,100% { transform: translateX(0); }
  20% { transform: translateX(-8px); }
  40% { transform: translateX(8px); }
  60% { transform: translateX(-5px); }
  80% { transform: translateX(5px); }
}

/* ── Window ────────────────────────────────────────────────────────────────── */
.room-window {
  position: absolute;
  top: 10px;
  right: 12px;
  width: 36px;
  height: 36px;
  background: rgba(186,230,253,0.8);
  border: 2px solid #7dd3fc;
  border-radius: 3px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr auto;
  gap: 1px;
  overflow: hidden;
  pointer-events: none;
}
.window-pane { background: rgba(255,255,255,0.6); }
.window-sill { grid-column: 1 / span 2; height: 4px; background: #7dd3fc; }

/* ── Floor label ───────────────────────────────────────────────────────────── */
.floor-label {
  position: absolute;
  bottom: 4px;
  left: 8px;
  font-size: 0.7rem;
  font-weight: 700;
  color: rgba(100,116,139,0.6);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  pointer-events: none;
}

/* ── Placed animal ─────────────────────────────────────────────────────────── */
.placed-animal {
  cursor: grab;
  z-index: 5;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));
  transition: transform 0.2s;
}
.placed-animal:hover { transform: scale(1.05); }
.placed-animal:active { cursor: grabbing; transform: scale(1.08); }

.placed-behind {
  position: absolute;
  transform: scale(0.85) translate(25px, -25px);
  z-index: 4;
  opacity: 0.9;
}
.placed-behind:hover { transform: scale(0.9) translate(25px, -25px); }
.placed-behind:active { cursor: grabbing; transform: scale(0.95) translate(25px, -25px); }

/* Success jump animation */
.animal-jump {
  animation: animal-jump 0.5s cubic-bezier(0.36,0.07,0.19,0.97) both;
}
@keyframes animal-jump {
  0%  { transform: translateY(0) scale(1); }
  40% { transform: translateY(-30px) scale(1.12); }
  70% { transform: translateY(5px) scale(0.97); }
  100%{ transform: translateY(0) scale(1); }
}

/* ── Drop hint ─────────────────────────────────────────────────────────────── */
.drop-hint {
  opacity: 0.5;
  pointer-events: none;
  animation: hint-pulse 2s ease-in-out infinite;
}
@keyframes hint-pulse {
  0%,100% { opacity: 0.3; transform: scale(1); }
  50%     { opacity: 0.6; transform: scale(1.08); }
}

/* ── Foundation ────────────────────────────────────────────────────────────── */
.house-foundation {
  height: 18px;
  background: linear-gradient(180deg, #92400e, #78350f);
  border-radius: 0 0 8px 8px;
}

/* ── Floor beams ───────────────────────────────────────────────────────────── */
.floor-beam {
  position: absolute;
  height: 6px;
  background: #92400e;
  left: 0; right: 0;
  z-index: 10;
  pointer-events: none;
}

/* ── Transitions ───────────────────────────────────────────────────────────── */
.pop-enter-active { transition: all 0.35s cubic-bezier(0.175,0.885,0.32,1.275); }
.pop-enter-from   { transform: scale(0); opacity: 0; }
.pop-leave-active { transition: all 0.2s ease; }
.pop-leave-to     { transform: scale(0); opacity: 0; }
</style>
