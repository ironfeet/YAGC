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

    <div class="setting-item">
      <label>MITA Game Theme</label>
      <select class="theme-select" v-model="progressStore.mitaTheme" @change="progressStore.setMitaTheme(($event.target as HTMLSelectElement).value)">
        <option value="dark">Dark</option>
        <option value="light">Light</option>
        <option value="colorful">Colorful</option>
      </select>
    </div>

    <div class="setting-item">
      <label>Fun Game Theme</label>
      <select class="theme-select" v-model="progressStore.funTheme" @change="progressStore.setFunTheme(($event.target as HTMLSelectElement).value)">
        <option value="dark">Dark</option>
        <option value="light">Light</option>
        <option value="colorful">Colorful</option>
      </select>
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
  color: var(--text-primary);
  border: 1px solid var(--text-secondary);
}

.theme-select {
  padding: 0.75rem 1.5rem;
  font-size: 1.5rem;
  border-radius: var(--border-radius-sm);
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--text-secondary);
  cursor: pointer;
  outline: none;
}
</style>
