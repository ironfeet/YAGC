<script setup lang="ts">
import AnimalAsset from './AnimalAsset.vue';
import type { AnimalShape, AnimalSize } from '../../types';

defineProps<{
  carrierAnimal: AnimalShape;
  carrierColor: string;
  carrierSize: AnimalSize;
  riderAnimal: AnimalShape;
  riderColor: string;
  riderSize: AnimalSize;
}>();
</script>

<template>
  <div class="transport-composite">
    <!-- Carrier acts as base -->
    <AnimalAsset 
      :shape="carrierAnimal" 
      :color="carrierColor" 
      :size="carrierSize" 
      direction="right" 
      class="carrier-asset" 
    />
    
    <!-- Rider is positioned on the back/head of the carrier -->
    <AnimalAsset 
      :shape="riderAnimal" 
      :color="riderColor" 
      :size="riderSize" 
      direction="right" 
      class="rider-asset" 
    />
  </div>
</template>

<style scoped>
.transport-composite {
  position: relative;
  width: 300px;
  height: 300px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.carrier-asset {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.rider-asset {
  position: absolute;
  bottom: 50%;
  left: 20%;
  width: 55%;
  height: 55%;
  z-index: 2;
  filter: drop-shadow(0 5px 10px rgba(0,0,0,0.3));
}
</style>