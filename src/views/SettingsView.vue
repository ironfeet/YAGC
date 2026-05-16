<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useProgressStore } from '../stores/useProgressStore';

const router = useRouter();
const progressStore = useProgressStore();

const goBack = () => {
  router.push({ name: 'Home' });
};
</script>

<template>
  <div class="settings-container">
    <h2>Parent/Admin Settings</h2>
    
    <div class="setting-item">
      <label>Default Home Menu</label>
      <button class="toggle-btn" @click="progressStore.toggleHomeMenu()">
        Current: {{ progressStore.defaultHomeMenu.toUpperCase() }}
      </button>
    </div>

    <button class="back-btn" @click="goBack">Back to Home</button>
  </div>
</template>

<style scoped>
.settings-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  width: 100%;
  height: 100%;
}

.setting-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  font-size: 1.5rem;
}

button {
  padding: 1rem 2rem;
  font-size: 1.5rem;
  border-radius: var(--border-radius-md);
  border: none;
  cursor: pointer;
}

.toggle-btn {
  background-color: var(--color-target);
  color: white;
}

.back-btn {
  background-color: var(--bg-secondary);
  color: white;
}
</style>
