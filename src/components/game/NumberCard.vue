<script setup lang="ts">
defineProps<{ number: number }>();
</script>

<template>
  <div class="number-card">
    <span class="number-text">{{ number }}</span>
  </div>
</template>

<style scoped>
.number-card {
  width: 100%;
  height: 100%;
  background: white;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  border: 4px solid #e0e0e0;
}
.number-text {
  font-size: 6rem;
  font-weight: 900;
  color: #333;
  font-family: 'Inter', sans-serif;
  text-shadow: 2px 2px 0px rgba(0,0,0,0.1);
}
</style>
